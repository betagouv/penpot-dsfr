# penpot-dsfr

> [!IMPORTANT]
> This port uses `@betagouv/figpot` which has been implemented and tested with a custom Penpot instance. To be widely used the Penpot SaaS must be patched... Be patient and follow the issue https://tree.taiga.io/project/penpot/us/8372 before `penpot-dsfr` is available ⏱️🚀

This repository contains all the logic to automate the synchronization between [DSFR files from Figma](https://www.figma.com/@gouvfr) and those on Penpot. The idea is to leverage the open-source Penpot design tool without requiring our design system team to change anything in their daily work. Figma files remain our sources of truth, and their "cloned" versions on Penpot provide a design tool for product teams that either struggle with Figma subscriptions, or with hosting sensitive designs outside France.

> [!IMPORTANT] > `penpot-dsfr` is an experiment and the user experience may not be perfect (mainly due to technical limitations). Do not hesitate to share your thoughts by contacting us at [contact@beta.gouv.fr](mailto:contact@beta.gouv.fr).

## Use the Penpot DSFR version

### Set up Fonts

All the files we synchronize use the font `Marianne` (the official font for the [DSFR](https://github.com/GouvernementFR/dsfr)), so in your Penpot team settings, you must upload the 12 files for this font (you can retrieve them from [here](https://www.systeme-de-design.gouv.fr/fondamentaux/typographie/)).

In case you want to use the file `DSFR - Modèles - Vx.y.z`, it's a bit unexpected, but it requires the font `Arial`. In this case, browse your fonts folder locally and find `Arial` files at least for variants `Regular`, `Regular Italic`, `Bold`, `Bold Italic`. _(In the future we may force the removal of `Arial` to simplify the process since this is not an open-source font)_

### Usage in your own workspace

The ideal use case would be to provide you the link of each file, and you would be able to use either a "copy to my workspace" feature or something like "use it as library". Unfortunately, for now, Penpot does not support this (but they plan to work on file permissions).

The current workarounds we have:

1. If you are part of the [beta.gouv.fr](https://beta.gouv.fr/) community we can consider adding you to our Penpot team so you easily benefit from the files updates
2. Otherwise, we could export `.penpot` files that you would import into your own Penpot team (for now we do not expose these since we are still experimenting with Penpot usage through the first solution). Do not hesitate to contact us at [contact@beta.gouv.fr](mailto:contact@beta.gouv.fr) to benefit from `.penpot` exports. The drawback with this method is that a new version would result in new files in Penpot, and Penpot does not handle switching librairies as Figma does, so your existing team work would not benefit from updates

## Differences with the Figma DSFR version

Penpot is less performant at handling big files either on both the backend and frontend sides. For example, `DSFR - Composants - Vx.y.z` on Figma has around 500,000 elements and is working well, whereas Penpot will start lagging or crashing at 150,000 elements.

They have plan to improve performance, but it will take some time. To make our experiment usable, we decided to:

1. Remove all elements related to the dark theme (almost all the time our internal designs are made with the light theme)
2. Remove frames that present a component in multiple contexts (they contain way too many elements)

Think of this port as a technical library for designing your application rather than for discovering the DSFR in detail. In you prefer the latter, prefer [their documentation](https://www.systeme-de-design.gouv.fr/) or open [their Figma files](https://www.figma.com/@gouvfr) to see the missing content in a read-only manner without a Figma subscription.

## Technical setup of this repository

The automation is based on the "Figma to Penpot" synchronizer named [figpot](https://github.com/betagouv/figpot). See the file `.github/workflows/ci.yaml` for all commands run as a cron job.

### Figma files

Figma files onto https://www.figma.com/@gouvfr are not directly by used `penpot-dsfr` because they are owned by the account of [the SIG team](https://www.info.gouv.fr/organisation/service-d-information-du-gouvernement-sig). Sincce we do not have access to their Figma access token (needed to access extra-information like Figma styles), we copied their files into our own workspace to be able to retrieve all information.

_We will make sure to update our own files when they do updates on theirs._

### GitHub secrets

The CI/CD pipeline requires to have repository secrets (not environment ones):

- `FIGMA_ACCESS_TOKEN`
- `PENPOT_ACCESS_TOKEN`
- `PENPOT_USER_EMAIL`
- `PENPOT_USER_PASSWORD`

_(see the `figpot` documentation to know how to retrieve their values)_
