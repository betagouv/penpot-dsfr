# penpot-dsfr

This repository contains all the logic to automate the synchronization between [DSFR files from Figma](https://www.figma.com/@gouvfr) and those on Penpot. The idea is to leverage the open-source Penpot design tool without requiring our design system team to change anything in their daily work. Figma files remain our sources of truth, and their "cloned" versions on Penpot provide a design tool for product teams that either struggle with Figma subscriptions, or with hosting sensitive designs outside France.

![](docs/files_preview.png 'DSFR files preview')

> [!IMPORTANT]
> `penpot-dsfr` is an experiment and the user experience may not be perfect (mainly due to technical limitations). Do not hesitate to share your thoughts by contacting us at [penpot-dsfr@beta.gouv.fr](mailto:penpot-dsfr@beta.gouv.fr).

## Prepare DSFR as libraries on Penpot

### Files must be uploaded by yourself

There is no marketplace where our published files can be cloned easily, and Penpot teams workspaces are isolated so we cannot connect your account directly on the files we want public.

**So it requires from you a few steps to do once on https://design.penpot.app/ (described below).** It means if you then invite new members from your team on your files, they won't have to bother with those steps.

### Set up fonts

To have DSFR files well displayed your team workspace need to know about specific fonts to use (in our case `Marianne` which is the official font for the [DSFR](https://github.com/GouvernementFR/dsfr)).

1. Download the 12 font variants with TTF format from the bottom page of https://www.info.gouv.fr/marque-de-letat/la-typographie
2. Unzip the archive
3. Log on https://design.penpot.app and if the left panel go to the `Fonts` section
4. Click `Add custom font`, select the 12 font variants just downloaded and validate
5. Once you see them listed as "pending" in the interface, click on `Upload all`

![](docs/fonts_panel.png 'Fonts panel')

In case you want to use the file `DSFR - Modèles - Vx.y.z`, it's a bit unexpected, but it requires the font `Arial`. In this case, browse your fonts folder locally and find `Arial` files at least for variants `Regular`, `Regular Italic`, `Bold`, `Bold Italic`. _(In the future we may force the removal of `Arial` to simplify the process since this is not an open-source font)_

### Import DSFR files

Go to https://github.com/betagouv/penpot-dsfr/releases and for each version your will have all DSFR files in the Penpot format `.penpot`:

- `DSFR - Composants - v1.xx (Community)`
- `DSFR - Fondamentaux - v1.xx (Community)`
- `DSFR - Modèles - V1.xx (Community)`
- `DSFR - Bêta - V1.xx (Community)`
- `DSFR - Pictogrammes - V1.xx (Community)`

Download them, then within your Penpot workspace you can create a new project (named for example `DSFR`) and by overlaying the project area you will see a `three dots` button to trigger `Import Penpot files`.

Once done and from your project view, right click on each of those imported file and click `Add as Shared Library` and confirm your choice. Like that their components, colors and typographies can be accessed from other files.

_Note that `Modèles` and `Bêta` files just present some structures and **are not core files**. They are not intended to be used as libraries so you could totally avoid promoting them as libraries, and even importing them._

### Bind the DSFR files to the one I want to work in

Let's say you have created a new file to mock up your future application:

1. Open your application file
2. Switch to the `Assets` tab section
3. Click `Manage library` and wait for it to load fully
4. Click on the `+` button for shared files `Composants`, `Fondamentaux` and `Pictogrammes`
5. Then within the `Assets` panel, type in the search bar for example `bouton` and after opening the nested tree you should see:

   <img src="docs/components_panel.png" alt="" height="350">

6. Drag and drop components to start using them!

_Don't forget when searching that the DSFR components were labeled in french: `Header → En-tête`, `Footer → Pied de page`..._

## Frequently Asked Questions

### Why is it (sometimes) laggy?

Penpot may suffer from some performance issues, but they are working on a new rendering engine that should fix main issues soon.

In the meantime, make sure to at least try this:

- Run Penpot within Chrome / Chromium (better supported)
- Avoid having too many browser tabs open
- Try it on a computer where you know Figma is running smoothly with "big" files
- Avoid opening `Composants` and `Fondamentaux` DSFR files directly, rather prefer to use them directly as libraries (will load much less in your browser)

### Why there are missing "nodes" compared to Figma?

Penpot is less performant at handling big files either on both the backend and frontend sides. For example, `DSFR - Composants` on Figma has around 500,000 elements and is working well, whereas Penpot may start lagging or crashing at 150,000 elements.

They have plan to improve performance with a new rendering engine, but it will take some time. To make our experiment usable, we decided to:

1. Remove all elements related to the dark theme (almost all the time our internal designs are made with the light theme)
2. Remove frames that present a component in multiple contexts (they contain way too many elements)

Think of this port as a technical library for designing your application rather than for discovering the DSFR in detail. In you prefer the latter, prefer [their documentation](https://www.systeme-de-design.gouv.fr/) or open [their Figma files](https://www.figma.com/@gouvfr) to see the missing content in a read-only manner without a Figma subscription.

### DSFR components may have missing properties

Despite Penpot is supporting variants and shows a properties panel at the right, they still don't support specific "display conditions" as:

- A boolean to conditionnaly hide elements across all variants
- An input to customize the underlying text (here in Penpot you have to modify the text from the canvas or within the layers panel)

This kind of feature inside Penpot does not exist yet and we did not find an easy workaround since we are doing an automatic generation of `penpot-dsfr` from Figma.

## Technical setup of this repository

The automation is based on the "Figma to Penpot" synchronizer named [figpot](https://github.com/betagouv/figpot). See the file `.github/workflows/ci.yaml` for all commands run as a cron job.

_Due to no sponsor of this initiative the synchronization is disabled for now, the current synchronization and export has been run manually._

### Figma files

Figma files onto https://www.figma.com/@gouvfr are not directly used by `penpot-dsfr` because they are owned by the account of [the SIG team](https://www.info.gouv.fr/organisation/service-d-information-du-gouvernement-sig). Since we do not have access to their Figma access token (needed to access extra-information like Figma styles), we copied their files into our own workspace to be able to retrieve all information.

_We will make sure to update our own files when they do updates on theirs._

### GitHub secrets

The CI/CD pipeline requires to have repository secrets (not environment ones):

- `FIGMA_ACCESS_TOKEN`
- `PENPOT_ACCESS_TOKEN`
- `PENPOT_USER_EMAIL`
- `PENPOT_USER_PASSWORD`

_(see the `figpot` documentation to know how to retrieve these values)_

## Contribution or sponsoring

If you are willing to help, please have a look at the reported issues https://github.com/betagouv/penpot-dsfr/issues. I will do my best to address your work, but keep in mind the maintenance of this project is in my spare time or on the time of other contributors.

There is currently no public organization sponsor for this port. But if your entity is willing to take over `penpot-dsfr`, please contact us at [penpot-dsfr@beta.gouv.fr](mailto:penpot-dsfr@beta.gouv.fr).
