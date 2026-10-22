# Interactive tutorial

Static web application guiding a product team to install the DSFR `.penpot` files into its own Penpot workspace, and then to transfer its existing Figma mockups with the [Penpot Exporter plugin](https://github.com/penpot/penpot-exporter-figma-plugin).

It is meant to be displayed into a modal (iframe) of https://www.systeme-de-design.gouv.fr/, so their website has nothing dynamic to host. It also works as a standalone page (header and footer are only displayed when not embedded, `?embedded` forces the embedded mode).

## How it works

Penpot has no way to share a library across teams, so each team imports the DSFR files on its own. Since the files reference each other (`Composants` uses colors, typographies and components of `Fondamentaux` and `Pictogrammes`...), the references would point to the file IDs of our own workspace and be broken.

The tutorial makes the user import files one by one in the dependency order and, after each import, asks for the Penpot URL of the imported file (it contains its `file-id`). The next file is then:

1. downloaded from the tutorial website (release files are mirrored there at build time, GitHub release downloads have no CORS headers)
2. rewritten in a web worker (`src/utils/penpot-archive.ts`): in every JSON entry of the archive, the file IDs of our workspace are replaced by the ones of the user workspace, and the libraries are declared into the `relations` of the manifest so Penpot connects them at import time (`linkLibrariesAtImport` in `src/config/tutorial.ts`)
3. handed to the browser as a download, ready to be imported into Penpot

Only the modified entries are recompressed, others are copied as is, so the ~100 MB `Composants` file is processed in a few seconds. ZIP64 archives (more than 65535 entries) are supported.

The file IDs to replace and the references between files are computed by `npm run release:prepare`, which reads the release assets and writes `src/generated/release.json`.

## Development

```sh
npm install
npm run release:prepare  # downloads the latest release into public/releases/ (~150 MB), use RELEASE_TAG=... for another one
npm run dev              # tutorial on http://localhost:5173/
npm run dev:storybook    # all screens on http://localhost:6006/
npm run test:unit
```

To test the archive rewriting on a real file: `PENPOT_ARCHIVE_SAMPLE=/path/to/file.penpot npm run test:unit`.

The progress is kept into the browser `localStorage` (key `penpot-dsfr-tutorial`), clear it to restart from scratch.

## Deployment

The workflow `.github/workflows/tutorial.yml` builds the tutorial, its Storybook (`/storybook/`) and the documentation preview (`/documentation/`), then deploys them on GitHub Pages. It runs on changes and each time a release is published (to mirror the new files).

The build uses relative paths, so it works both on `https://<organization>.github.io/<repository>/` and on a custom domain configured in the repository settings (`Settings > Pages > Custom domain`, no `CNAME` file is needed with GitHub Actions deployments).

> [!IMPORTANT]
> The [DSFR terms of use](https://github.com/GouvernementFR/dsfr/blob/main/doc/legal/cgu.md) restrict its use to `.gouv.fr` domains. Since the tutorial uses the DSFR, it should be served from a `.gouv.fr` custom domain (for example a `beta.gouv.fr` subdomain) before being officially promoted.

## Embedding

The iframe needs a few permissions to let the tutorial download prepared files and copy addresses:

```html
<iframe
  title="Installer le DSFR sur Penpot"
  src="https://<tutorial-domain>/"
  allow="clipboard-write"
  sandbox="allow-scripts allow-same-origin allow-downloads allow-popups allow-popups-to-escape-sandbox allow-forms"
></iframe>
```

See `../documentation/` for the full modal markup.
