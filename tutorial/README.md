# Interactive tutorial

Static web application guiding a product team to install the DSFR `.penpot` files into its own Penpot workspace, and then to transfer its existing Figma mockups with the [Penpot Exporter plugin](https://github.com/penpot/penpot-exporter-figma-plugin).

It is meant to be displayed into a modal (iframe) of https://www.systeme-de-design.gouv.fr/, so their website has nothing dynamic to host. It also works as a standalone page (header and footer are only displayed when not embedded, `?embedded` forces the embedded mode).

## How it works

Penpot has no way to share a library across teams, so each team imports the DSFR files on its own. Since the files reference each other (`Composants` uses colors, typographies and components of `Fondamentaux` and `Pictogrammes`...), they must be imported in the dependency order, each one shared as a library before importing the next.

Since Penpot 2.19, importing a `.penpot` file links each library it uses to the shared file of the team having the same name (when there is exactly one, otherwise Penpot asks which one to use). So the release files are imported as they are: the tutorial only links to them (directly on the GitHub release, a plain download needs no CORS headers) and explains each step. Users must not rename the imported files.

`npm run release:prepare` describes the latest release into `src/generated/release.json`: it downloads the assets into a cache folder only to read, from their manifest, the name each file will have in Penpot.

## Development

```sh
npm install
npm run release:prepare  # describes the latest release (assets downloaded into node_modules/.cache, ~150 MB), use RELEASE_TAG=... for another one
npm run dev              # tutorial on http://localhost:5173/
npm run dev:storybook    # all screens on http://localhost:6006/
npm run test:unit
```

To test the manifest reading on a real file: `PENPOT_ARCHIVE_SAMPLE=/path/to/file.penpot npm run test:unit`.

The progress is kept into the browser `localStorage` (key `penpot-dsfr-tutorial`), clear it to restart from scratch.

## Deployment

The workflow `.github/workflows/documentation.yml` runs the checks (supply chain, workflows lint, format, types, unit tests) and builds the tutorial, its Storybook (`/storybook/`) and the documentation preview (`/documentation/`) in parallel jobs. It then assembles them into a static website deployed on GitHub Pages (no server needed).

- For now only the `new-attempt` branch is deployed. Pull requests run the checks and builds without deploying.
- In the repository settings, the GitHub Pages source must be "GitHub Actions", and the `github-pages` environment must allow the deployed branch in its deployment branch rules (`Settings > Environments`).
- After publishing a release, run the workflow manually (`Actions > Tutorial and documentation > Run workflow`, optionally with a release tag) so the tutorial proposes its `.penpot` files.

The build uses relative paths, so it works both on `https://<organization>.github.io/<repository>/` and on a custom domain configured in the repository settings (`Settings > Pages > Custom domain`, no `CNAME` file is needed with GitHub Actions deployments).

> [!IMPORTANT]
> The [DSFR terms of use](https://github.com/GouvernementFR/dsfr/blob/main/doc/legal/cgu.md) restrict its use to `.gouv.fr` domains. Since the tutorial uses the DSFR, it should be served from a `.gouv.fr` custom domain (for example a `beta.gouv.fr` subdomain) before being officially promoted.

## Embedding

The iframe needs a few permissions to let the tutorial open the release files (downloads) and Penpot in new tabs:

```html
<iframe
  title="Installer le DSFR sur Penpot"
  src="https://<tutorial-domain>/"
  sandbox="allow-scripts allow-same-origin allow-downloads allow-popups allow-popups-to-escape-sandbox allow-forms"
></iframe>
```

See `../documentation/` for the full modal markup.
