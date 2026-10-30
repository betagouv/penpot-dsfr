# penpot-dsfr

This repository makes the [DSFR Figma files](https://www.figma.com/@gouvfr) (the French government design system) available on [Penpot](https://penpot.app/), the open-source design tool. Figma files remain the source of truth, so the design system team does not change its daily work, and their Penpot copies serve product teams that either struggle with Figma subscriptions or need to keep their mockups on infrastructures they control.

By default, administrations use the Penpot instance of the SIG (the team managing the DSFR): https://penpot.systeme-de-design.gouv.fr/.

![](docs/files_preview.png 'DSFR files preview')

> [!IMPORTANT]
> `penpot-dsfr` is an experiment and the user experience may not be perfect (mainly due to technical limitations). Do not hesitate to share your thoughts by contacting us at [penpot-dsfr@beta.gouv.fr](mailto:penpot-dsfr@beta.gouv.fr).

## How it works

```mermaid
flowchart LR
  figma["DSFR Figma files"] -- "figpot v2 (scripts/synchronize.sh)" --> penpot["Penpot files of this project"]
  penpot -- "manual export" --> release[".penpot files in a GitHub release"]
  release -- "interactive tutorial (tutorial/)" --> team["Penpot workspace of a product team"]
  mockups["Figma mockups of the team"] -- "Penpot Exporter plugin" --> team
```

1. **Conversion, done once per DSFR version by us**: [figpot](https://github.com/betagouv/figpot) v2 synchronizes the 5 DSFR Figma files into Penpot files, keeping the links between them. They are exported as `.penpot` files and published in [the releases](https://github.com/betagouv/penpot-dsfr/releases). Product teams never have to convert the DSFR themselves (the files are far too heavy for the Figma plugin).
2. **Installation, done once per Penpot team**: Penpot cannot share a library across teams, so each team imports the files into its own workspace. Since the files reference each other, they must be imported in order, each one shared as a library before importing the next: since Penpot 2.19, an import links the libraries of the file to the shared files of the team having the same name. The [interactive tutorial](tutorial/) guides users through these steps, it is meant to be opened from [the DSFR documentation page](documentation/) proposed to https://www.systeme-de-design.gouv.fr/.
3. **Transfer of existing mockups, optional**: product teams convert their own Figma files with the official [Penpot Exporter](https://www.figma.com/community/plugin/1219369440655168734/penpot-exporter) Figma plugin, giving it the Penpot addresses of their DSFR libraries so the components stay bound. Their mockups should use the same DSFR version as the one installed: the tutorial asks for it and advises migrating in Figma first, otherwise components with a lost link have to be fixed by hand in Penpot (teams starting from scratch use the installed version).

The files depend on each other in this order (each file can use the previous ones):

```
Pictogrammes ← Fondamentaux ← Composants ← Modèles, Bêta
```

On Figma, `Pictogrammes` and `Fondamentaux` use each other. To allow importing them one after the other, `Pictogrammes` is converted without any dependency, and the few components of `Composants` used in the presentation pages of `Fondamentaux` are kept as plain shapes.

## Repository layout

| Path                                                                         | Content                                                                                                 |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| [`scripts/synchronize.sh`](scripts/synchronize.sh)                           | figpot parameters of each DSFR file (Figma and Penpot identifiers, libraries, exclusions)               |
| [`data/`](data/)                                                             | figpot data: mappings between Figma and Penpot elements (`documents/`), cached Figma images (`medias/`) |
| [`tutorial/`](tutorial/)                                                     | Interactive tutorial installing the DSFR into a Penpot team (static website)                            |
| [`documentation/`](documentation/)                                           | Page written for https://www.systeme-de-design.gouv.fr/, with a local preview                           |
| [`.github/workflows/sync.yml`](.github/workflows/sync.yml)                   | Synchronization of the DSFR files (manual trigger)                                                      |
| [`.github/workflows/documentation.yml`](.github/workflows/documentation.yml) | Checks, builds and GitHub Pages deployment of the tutorial and the documentation preview                |

## Using the DSFR on Penpot

Follow the interactive tutorial (in French): it guides you through the preparation of your workspace (Marianne font, project, new render engine), imports the files one by one with their links, then explains how to transfer your Figma mockups. The documentation page [`documentation/penpot/index.md`](documentation/penpot/index.md) gives the same information with the known limitations.

The tutorial only links to the release files and explains each step, so importing them without it works the same, as long as the order is respected, each file is shared as a library before importing the next, and files are not renamed (Penpot matches the libraries by name).

## Synchronizing the DSFR files

This part is for maintainers converting a new DSFR version.

### Prerequisites

- **figpot v2**: `scripts/synchronize.sh` runs `npx @betagouv/figpot@^2` by default. Until v2 is published on npm, point it to a local checkout of [figpot](https://github.com/betagouv/figpot) (no build needed): `FIGPOT="npm --prefix <path to figpot> run --silent cli:unsecure --"`
- **Access tokens** (see the figpot documentation): `FIGMA_ACCESS_TOKEN`, `PENPOT_ACCESS_TOKEN`, and `PENPOT_BASE_URL` for an instance other than design.penpot.app (e.g. `https://penpot.systeme-de-design.gouv.fr`)
- **Penpot credentials** for the hydration (see below): `PENPOT_USER_EMAIL`, `PENPOT_USER_PASSWORD`
- **Around 8 GB of RAM** for `Composants`

### Prepare the Figma files

The DSFR files on https://www.figma.com/@gouvfr belong to [the SIG](https://www.info.gouv.fr/organisation/service-d-information-du-gouvernement-sig). figpot needs a Figma token able to read their styles and components, so we work on our own copies:

1. Duplicate the DSFR files of the version to convert into our Figma workspace
2. In each file, open the libraries panel and remove the libraries that are not used
3. Swap the libraries still pointing to the original files or to older versions with our copies (tick "for all pages"), and repeat until nothing is left
4. Old references can still hide in hidden layers of instances (the Figma interface does not list them, figpot does): fix them in Figma, for example with a script using `figma.skipInvisibleInstanceChildren = false`
5. Update the Figma file keys in `scripts/synchronize.sh`

_`Composants` v1.14 has a `default-text-success` defect to fix by hand._

### Synchronize

Create empty Penpot files for the new version, put their identifiers in `scripts/synchronize.sh`, then synchronize the files in the dependency order:

```sh
./scripts/synchronize.sh pictogrammes
./scripts/synchronize.sh fondamentaux
./scripts/synchronize.sh composants
./scripts/synchronize.sh modeles
./scripts/synchronize.sh beta
```

- Each update makes Penpot load and check the whole file, which slows down as the file grows. For a first push of a big file, add `--no-server-validation`, then run the synchronization again (`--use-cached-figma-data` avoids fetching Figma again): it must report no difference. The figpot documentation explains how to validate a whole file afterwards
- Starting from fresh Penpot files is preferred, changing many identifiers in an existing big file doubles its size during the push
- The presentation frames of `Composants` are excluded (about half of the file), otherwise the file is too big to be updated through the API
- At the end, figpot "hydrates" each file: it opens it in a browser so Penpot computes the text layouts that only a browser can compute. It needs a display (`xvfb-run -a ./scripts/synchronize.sh ...` on a server). `--no-hydrate` skips it, but viewers through a share link would see overlapping texts until someone edits the file

### Publish a release

The files are synchronized on the SIG instance (https://penpot.systeme-de-design.gouv.fr), then exported one by one from its interface, in the dependency order: `Pictogrammes`, `Fondamentaux`, `Composants`, `Modèles`, then `Bêta`.

1. From the dashboard, open the menu of a file and choose `Export Penpot file`
2. Pick the 4th option, `Link matching libraries on import`: the libraries are not embedded nor detached, the exported file only keeps their names, so Penpot links them at import to the shared files of the destination team having the same names. This option is only displayed when the instance enables the `export-link-later` flag (not the case of the SIG instance for now)
3. Attach the 5 files to a new GitHub release (asset names containing `pictogramme`, `fondamentaux`, `composants`, `modeles` and `beta` are recognized), and do not rename the Penpot files since their names are the ones matched at import

Then run the `Tutorial and documentation` workflow manually (optionally with the release tag) so the tutorial proposes the new files.

### Continuous integration

- `.github/workflows/sync.yml` synchronizes all the files. It is triggered manually and needs the repository secrets `FIGMA_ACCESS_TOKEN`, `PENPOT_ACCESS_TOKEN`, `PENPOT_USER_EMAIL` and `PENPOT_USER_PASSWORD` (not environment ones). The mappings are committed back into `data/` (`--sync-mapping-with-git`)
- `.github/workflows/documentation.yml` checks and builds the tutorial, its Storybook and the documentation preview in parallel jobs, then deploys them as a static website on GitHub Pages (see [`tutorial/README.md`](tutorial/README.md#deployment))

## Frequently Asked Questions

### Why are there missing elements compared to Figma?

Penpot handles big files less efficiently than Figma, on both the backend and frontend sides. For example `DSFR - Composants` has around 500,000 elements on Figma, whereas Penpot refuses to update files of a few hundred thousand elements through its API. So the presentation frames showing components in context (light and dark themes) were removed. Think of this port as a technical library to design applications rather than a way to discover the DSFR, for that prefer [its documentation](https://www.systeme-de-design.gouv.fr/) or [its Figma files](https://www.figma.com/@gouvfr) (readable without a Figma subscription).

### Why do DSFR components miss some properties?

Penpot supports variants, but not yet the other kinds of Figma component properties: a boolean to hide an element across all variants, a text to edit from the properties panel, or an instance to swap. Texts are edited from the canvas, and nested icons are changed with "Swap component".

### Why is Penpot laggy?

Enable the new render engine (`Your account`, `Settings`, `WebGL rendering`), prefer Chrome or Chromium, avoid opening `Composants` and `Fondamentaux` directly (use them as libraries from your own files), and avoid having too many tabs open.

## Work in progress memo

_Temporary section listing what remains to be done, to be cleaned up once addressed._

### Missing for the DSFR on Penpot (Penpot side)

- [ ] Text truncation with ellipsis, still open: https://github.com/penpot/penpot/issues/4426
- [ ] A text in a "hug" parent with a "fill" width wraps differently than in Figma (no answer): https://github.com/penpot/penpot/discussions/7163
- [ ] Figma boolean / text / instance-swap component properties have no equivalent (only variants), documented as tips (double-click the text, "Swap component" for icons)
- [ ] No way to relink existing copies to another library (needed when migrating mockups made on another DSFR copy)
- [ ] Export with "Treat assets as basic objects" keeps `swap-slot-*` in `:touched` (`detach-external-references` in `common/src/app/common/types/file.cljc`), the imported file then fails validation. Reproduce without figpot, then open the issue
- [ ] DSFR v2 tokens are scoped per component instance, waiting for a CSS-like override in Penpot (fallback idea: "virtual variants" generated by figpot)
- [x] Stroke width per side, released in Penpot 2.19 (new render engine only), figpot now provides the widths
- [x] Design tokens shared through libraries, released in Penpot 2.19 (no more export/import of tokens from `Fondamentaux`)
- [x] Component properties can be reordered since Penpot 2.11 (figpot could now keep the Figma order, see below)
- [ ] To retest on Penpot 2.19 with the new render engine:
  - [ ] Italic "Marianne" titles with WebGL (maybe fixed by https://github.com/penpot/penpot/issues/10060)
  - [ ] Pictogram broken in the horizontal "Tuile"
  - [ ] `target=_blank` icons shifted by ~300px
  - [ ] Card image lost with export/import
  - [ ] Full `Composants` file (with presentation frames, ~500k nodes) still failing to upload

### figpot

- [ ] Keep the Penpot-computed geometry of auto-sized texts (and their flex ancestors) when their Figma content and style did not change. Currently each synchronization pushes back the Figma sizes, then hydration fixes them again, so library consumers get "updates available" for nothing (probably the cause of the 1-2px drift on the footer "Licence" block)
- [ ] Keep the Figma order of component properties (Penpot supports reordering now, today `Bouton` defaults to "icon only")
- [ ] Mark exported `.penpot` files as shared libraries by default, to ease the sequential imports
- [ ] List all missing fonts upfront by browsing the Figma trees
- [ ] Prompt for the file to transfer when no `-d` is given
- [ ] Prototyping interactions (flows) are not transferred
- [ ] Cache parsed SVG commands (performance)
- [x] Thumbnails management removed, hydration forces the new render engine (`&wasm=true`) with a software WebGL fallback for CI
- [ ] Publish figpot v2 on npm (`scripts/synchronize.sh` and `sync.yml` use `@betagouv/figpot@^2`, a local checkout is needed until then)

### Documentation and tutorial

- [ ] GitHub Pages: set the source to "GitHub Actions" and allow the `new-attempt` branch in the `github-pages` environment, then switch the deployed branch to `main` once merged (`.github/workflows/documentation.yml`)
- [ ] Set the final `.gouv.fr` domain of the tutorial (DSFR terms of use) and update the iframe `src` in `documentation/`
- [ ] Link the exact official SIG guide to update DSFR libraries in Figma (`figmaLibraryUpdateGuideUrl` in `tutorial/src/config/tutorial.ts`)
- [ ] Document `PENPOT_BASE_URL=https://penpot.systeme-de-design.gouv.fr` for those synchronizing on the SIG instance (it must be kept up to date by the SIG)
- [ ] Publish the v1.15 release converted with figpot v2 and remove the v1.14 one (figpot v1, still proposed by the tutorial until then)
- [ ] The SIG instance must run Penpot 2.19+ (libraries linked at import by name), and enable the `export-link-later` flag to export the release files from it
- [ ] Present the Fig-to-Penpot platform next to the Figma plugin once public, saying whether its conversion runs in the browser or on a server (suggest checking the deployed code, or running it locally for very sensitive mockups)
- [ ] Show a Figma vs Penpot screenshot of a "Composants" presentation page to explain what was removed
- [ ] Confirm the platform keeps links between files, and that Figma node IDs are the same across DSFR copies (deterministic component IDs)
- [ ] Synchronize the v1.15 files on the SIG instance https://penpot.systeme-de-design.gouv.fr (default instance proposed to administrations)
- [ ] Ask the DSFR team to replace `Arial` (proprietary, cannot be provided) in `Modèles`, users without it locally get a fallback font
- [ ] Contact the Penpot maintainer on their Mattermost

## Contribution or sponsoring

If you are willing to help, please have a look at the reported issues https://github.com/betagouv/penpot-dsfr/issues. I will do my best to address your work, but keep in mind the maintenance of this project is in my spare time or on the time of other contributors.

There is currently no public organization sponsor for this port. But if your entity is willing to take over `penpot-dsfr`, please contact us at [penpot-dsfr@beta.gouv.fr](mailto:penpot-dsfr@beta.gouv.fr).
