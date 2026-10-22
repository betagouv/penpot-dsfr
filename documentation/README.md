# Documentation for systeme-de-design.gouv.fr

Pages written with the conventions of [the official DSFR documentation](https://github.com/GouvernementFR/dsfr/tree/main/src/dsfr/core/_part/doc) (markdown with a YAML front matter, `_asset/` folder for images, `dsfr-doc-*` directives), to be integrated by the SIG team into https://www.systeme-de-design.gouv.fr/.

- `penpot/index.md`: presentation of Penpot, installation of the DSFR files, transfer of Figma mockups, known limitations

## Preview

The official website is built with `@gouvfr/dsfr-roller`, which is not meant to be used outside of their repository. `scripts/build.js` gives an approximate rendering with the DSFR styles:

```sh
npm install
npm run build                                   # dist/penpot/index.html
TUTORIAL_URL=http://localhost:5173/ npm run dev # rebuild on changes, with the modal targeting a local tutorial
```

## Integration notes for the SIG team

The page uses a new leaf directive to open the interactive tutorial (hosted separately, see `../tutorial/`) in a modal:

```md
::dsfr-doc-iframe-modal[Lancer le parcours d’installation]{src="https://betagouv.github.io/penpot-dsfr/" title="Installer le DSFR sur Penpot"}
```

It is expected to render a button opening a DSFR modal (`fr-modal`) containing:

```html
<iframe
  title="Installer le DSFR sur Penpot"
  src="https://betagouv.github.io/penpot-dsfr/"
  loading="lazy"
  style="width: 100%; height: 70vh; border: 0"
  allow="clipboard-write"
  sandbox="allow-scripts allow-same-origin allow-downloads allow-popups allow-popups-to-escape-sandbox allow-forms"
></iframe>
```

`allow-downloads` and `clipboard-write` are required: the tutorial prepares files in the browser for the user to download, and offers buttons to copy addresses. If the directive is not supported, a simple link to the tutorial is a working fallback (the tutorial also works as a standalone page).

The `src` must be updated once the final domain of the tutorial is chosen.
