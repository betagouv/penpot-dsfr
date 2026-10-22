// Render the markdown pages (written with the conventions of https://github.com/GouvernementFR/dsfr documentation) as
// static HTML pages styled with the DSFR, to preview them before handing them to the SIG team.
//
// It only approximates the rendering of the official website (made with `@gouvfr/dsfr-roller`), the source of truth
// stays the markdown. Supported directives:
// - `:::dsfr-doc-tab-navigation` (rendered as a list of links)
// - `::dsfr-doc-storybook{storyId=...}` (rendered as a placeholder)
// - `::::dsfr-doc-guidelines` / `:::dsfr-doc-guideline[label]{col=6 valid=true}`
// - `::dsfr-doc-iframe-modal[label]{src=... title=...}` (new, opens an iframe into a DSFR modal, used for the Penpot tutorial)
//
// Usage: `npm run build` (output into `dist/`), `TUTORIAL_URL=http://localhost:5173/ npm run dev` to rebuild on changes
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, watch, writeFileSync } from 'node:fs';
import path from 'node:path';
import { h } from 'hastscript';
import rehypeRaw from 'rehype-raw';
import rehypeStringify from 'rehype-stringify';
import remarkDirective from 'remark-directive';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';
import { parse as parseYaml } from 'yaml';

const rootDirectory = path.resolve(import.meta.dirname, '..');
const outputDirectory = path.resolve(rootDirectory, 'dist');
const dsfrDirectory = path.resolve(rootDirectory, 'node_modules/@gouvfr/dsfr/dist');
const tutorialUrl = process.env.TUTORIAL_URL;

function findPages(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return ['node_modules', 'dist', 'scripts'].includes(entry.name) || entry.name.startsWith('.') ? [] : findPages(entryPath);
    }

    return entry.name === 'index.md' ? [entryPath] : [];
  });
}

// Directive label (`[...]`) is the content of a leaf directive, and the first paragraph flagged with `directiveLabel` for a container one
function extractLabel(node) {
  if (node.type === 'leafDirective') {
    return node.children.length > 0 ? node.children : null;
  }

  const labelIndex = node.children.findIndex((child) => child.data?.directiveLabel);
  if (labelIndex === -1) {
    return null;
  }

  const [label] = node.children.splice(labelIndex, 1);

  return label.children;
}

function setHast(node, tagName, properties = {}) {
  node.data = { ...node.data, hName: tagName, hProperties: properties };
}

function remarkDsfrDocDirectives() {
  let modalCounter = 0;

  return (tree, file) => {
    visit(tree, ['containerDirective', 'leafDirective', 'textDirective'], (node) => {
      const attributes = node.attributes ?? {};

      switch (node.name) {
        case 'dsfr-doc-tab-navigation':
          setHast(node, 'nav', { className: ['fr-mb-4w'], ariaLabel: 'Onglets de la page' });
          break;
        case 'dsfr-doc-storybook':
          setHast(node, 'div', { className: ['fr-callout', 'fr-mb-4w'] });
          node.children = [{ type: 'paragraph', children: [{ type: 'text', value: `[Démo Storybook « ${attributes.storyId} »]` }] }];
          break;
        case 'dsfr-doc-guidelines':
          setHast(node, 'div', { className: ['fr-grid-row', 'fr-grid-row--gutters', 'fr-mb-4w'] });
          break;
        case 'dsfr-doc-guideline': {
          const label = extractLabel(node) ?? [];
          const valid = attributes.valid === 'true';

          setHast(node, 'div', { className: ['fr-col-12', `fr-col-md-${attributes.col ?? 12}`] });
          node.children = [
            {
              type: 'paragraph',
              data: {
                hProperties: {
                  className: ['fr-text--bold', 'fr-mb-1w'],
                  style: `color: var(${valid ? '--text-default-success' : '--text-default-error'})`,
                },
              },
              children: label,
            },
            {
              type: 'blockquote',
              data: {
                hName: 'div',
                hProperties: {
                  style: `border-top: 3px solid var(${valid ? '--border-plain-success' : '--border-plain-error'}); padding-top: 1rem`,
                },
              },
              children: node.children,
            },
          ];
          break;
        }
        case 'dsfr-doc-iframe-modal': {
          const label = extractLabel(node) ?? [{ type: 'text', value: 'Ouvrir' }];
          node.children = [];
          const modalId = `iframe-modal-${++modalCounter}`;
          const src = tutorialUrl || attributes.src;
          const title = attributes.title ?? '';

          // Rendered as HAST directly, since the modal markup is not expressible in markdown
          node.data = {
            hName: 'div',
            hChildren: [
              h('p', [
                h(
                  'button',
                  {
                    className: ['fr-btn', 'fr-btn--icon-left', 'fr-icon-play-line'],
                    type: 'button',
                    'aria-controls': modalId,
                    'data-fr-opened': 'false',
                  },
                  label.map((child) => child.value ?? '').join('')
                ),
              ]),
              h('dialog', { id: modalId, className: ['fr-modal'], role: 'dialog', 'aria-labelledby': `${modalId}-title` }, [
                h('div', { className: ['fr-container', 'fr-container--fluid', 'fr-container-md'] }, [
                  h('div', { className: ['fr-grid-row', 'fr-grid-row--center'] }, [
                    h('div', { className: ['fr-col-12', 'fr-col-lg-10'] }, [
                      h('div', { className: ['fr-modal__body'] }, [
                        h('div', { className: ['fr-modal__header'] }, [
                          h(
                            'button',
                            { className: ['fr-btn--close', 'fr-btn'], type: 'button', 'aria-controls': modalId, title: 'Fermer' },
                            'Fermer'
                          ),
                        ]),
                        h('div', { className: ['fr-modal__content'] }, [
                          h('h1', { id: `${modalId}-title`, className: ['fr-modal__title'] }, title),
                          // `allow-downloads` and `clipboard-write` are needed by the tutorial (prepared files, copy buttons)
                          h('iframe', {
                            title: title,
                            src: src,
                            loading: 'lazy',
                            style: 'width: 100%; height: 70vh; border: 0',
                            allow: 'clipboard-write',
                            sandbox: 'allow-scripts allow-same-origin allow-downloads allow-popups allow-popups-to-escape-sandbox allow-forms',
                          }),
                        ]),
                      ]),
                    ]),
                  ]),
                ]),
              ]),
            ],
          };
          break;
        }
        default:
          file.message(`unknown directive "${node.name}", its content is rendered as is`, node);
          setHast(node, node.type === 'textDirective' ? 'span' : 'div');
      }
    });
  };
}

function renderPage(markdown) {
  let frontmatter = {};

  const processor = unified()
    .use(remarkParse)
    .use(remarkFrontmatter, ['yaml'])
    .use(() => (tree) => {
      const yamlNode = tree.children.find((node) => node.type === 'yaml');
      frontmatter = yamlNode ? parseYaml(yamlNode.value) : {};
    })
    .use(remarkGfm)
    .use(remarkDirective)
    .use(remarkDsfrDocDirectives)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeStringify);

  const file = processor.processSync(markdown);

  return { html: String(file), frontmatter, messages: file.messages };
}

function escapeHtml(value) {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function layout({ html, frontmatter, dsfrPath }) {
  const metadata = Object.entries(frontmatter)
    .map(
      ([key, value]) =>
        `<tr><th scope="row"><code>${escapeHtml(key)}</code></th><td>${escapeHtml(Array.isArray(value) ? value.join(', ') : value)}</td></tr>`
    )
    .join('\n');

  return `<!doctype html>
<html lang="fr" data-fr-scheme="system">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
    <title>${escapeHtml(frontmatter.title ?? 'Documentation')} - Prévisualisation</title>
    <meta name="description" content="${escapeHtml(frontmatter.description ?? '')}" />
    <link rel="stylesheet" href="${dsfrPath}/dsfr.min.css" />
    <link rel="stylesheet" href="${dsfrPath}/utility/icons/icons.min.css" />
    <style>
      main img { max-width: 100%; height: auto; }
    </style>
  </head>
  <body>
    <main class="fr-container fr-py-6w" id="contenu">
      <div class="fr-grid-row fr-grid-row--center">
        <div class="fr-col-12 fr-col-lg-9">
          <div class="fr-notice fr-notice--info fr-mb-4w">
            <div class="fr-container"><div class="fr-notice__body"><p class="fr-notice__title">Prévisualisation locale : le rendu final est assuré par le site systeme-de-design.gouv.fr.</p></div></div>
          </div>
          <details class="fr-mb-4w">
            <summary>Métadonnées de la page</summary>
            <div class="fr-table fr-table--no-caption"><table><caption>Métadonnées</caption><tbody>${metadata}</tbody></table></div>
          </details>
          ${html}
        </div>
      </div>
    </main>
    <script type="module" src="${dsfrPath}/dsfr.module.min.js"></script>
  </body>
</html>
`;
}

function build() {
  rmSync(outputDirectory, { recursive: true, force: true });
  mkdirSync(outputDirectory, { recursive: true });
  cpSync(dsfrDirectory, path.join(outputDirectory, 'dsfr'), {
    recursive: true,
    // Only keep what the pages need (styles, script, fonts and icons)
    filter: (source) => {
      const relativePath = path.relative(dsfrDirectory, source);

      return (
        relativePath === '' ||
        ['dsfr.min.css', 'dsfr.module.min.js'].includes(relativePath) ||
        ['fonts', 'icons', 'utility'].some((directory) => relativePath === directory || relativePath.startsWith(`${directory}${path.sep}`))
      );
    },
  });

  const pages = findPages(rootDirectory);

  for (const pagePath of pages) {
    const pageDirectory = path.dirname(pagePath);
    const relativeDirectory = path.relative(rootDirectory, pageDirectory);
    const pageOutputDirectory = path.join(outputDirectory, relativeDirectory);
    const { html, frontmatter, messages } = renderPage(readFileSync(pagePath, 'utf8'));

    mkdirSync(pageOutputDirectory, { recursive: true });
    if (existsSync(path.join(pageDirectory, '_asset'))) {
      // A filter forces the JavaScript implementation of the copy, the native one fails on some mounted filesystems (VMs...)
      cpSync(path.join(pageDirectory, '_asset'), path.join(pageOutputDirectory, '_asset'), { recursive: true, filter: () => true });
    }

    const dsfrPath = path.posix.join(path.relative(pageOutputDirectory, outputDirectory).split(path.sep).join('/') || '.', 'dsfr');
    writeFileSync(path.join(pageOutputDirectory, 'index.html'), layout({ html, frontmatter, dsfrPath }));

    for (const message of messages) {
      console.warn(`${path.relative(rootDirectory, pagePath)}: ${message.reason}`);
    }
    console.log(`built ${path.relative(rootDirectory, pagePath)} → ${path.relative(rootDirectory, path.join(pageOutputDirectory, 'index.html'))}`);
  }

  // Simple index to reach the pages
  writeFileSync(
    path.join(outputDirectory, 'index.html'),
    layout({
      html: `<h1>Pages de documentation</h1><ul>${pages
        .map((pagePath) => path.relative(rootDirectory, path.dirname(pagePath)))
        .map((directory) => `<li><a href="./${directory}/">${directory}</a></li>`)
        .join('')}</ul>`,
      frontmatter: { title: 'Pages de documentation' },
      dsfrPath: './dsfr',
    })
  );
}

build();

if (process.argv.includes('--watch')) {
  console.log('watching for changes…');
  watch(rootDirectory, { recursive: true }, (_event, fileName) => {
    if (
      fileName &&
      !fileName.startsWith('dist') &&
      !fileName.startsWith('node_modules') &&
      (fileName.endsWith('.md') || fileName.includes('_asset'))
    ) {
      try {
        build();
      } catch (error) {
        console.error(error);
      }
    }
  });
}
