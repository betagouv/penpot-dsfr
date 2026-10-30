# Documentation for systeme-de-design.gouv.fr

Pages written with the conventions of [the official DSFR documentation](https://github.com/GouvernementFR/dsfr/tree/main/src/dsfr/core/_part/doc) (markdown with a YAML front matter, `_asset/` folder for images, `dsfr-doc-*` directives), to be integrated by the SIG team into https://www.systeme-de-design.gouv.fr/.

- `penpot/index.md`: presentation of Penpot, installation of the DSFR files, transfer of Figma mockups, known limitations

## Preview

The official website is built with `@gouvfr/dsfr-roller`, which is not meant to be used outside of their repository. `scripts/build.js` gives an approximate rendering with the DSFR styles:

```sh
npm install
npm run build                                   # dist/penpot/index.html
TUTORIAL_URL=http://localhost:5173/ npm run dev # rebuild on changes, with the modal targeting a local tutorial
npx serve dist                                  # then open http://localhost:3000/penpot/
```

## Integration notes for the SIG team

The page uses a new leaf directive to open the interactive tutorial (hosted separately, see `../tutorial/`) in a modal:

```md
::dsfr-doc-iframe-modal[Lancer le parcours d’installation]{src="https://betagouv.github.io/penpot-dsfr/" title="Installer le DSFR sur Penpot"}
```

It is expected to render a button opening a DSFR modal (`fr-modal`) as wide as its container (`fr-col-12`), with its title only for screen readers (`fr-sr-only`, the tutorial displays its own) and containing:

```html
<iframe
  title="Installer le DSFR sur Penpot"
  src="https://betagouv.github.io/penpot-dsfr/"
  loading="lazy"
  sandbox="allow-scripts allow-same-origin allow-downloads allow-popups allow-popups-to-escape-sandbox allow-forms"
></iframe>
```

The tutorial is long and used for a while, so the modal takes the whole screen height. From the md breakpoint the DSFR keeps 10% of the screen above and under a modal (`::before` and `::after` spacers, not overridable inline), so a class on the `fr-modal` and this CSS are needed (see `scripts/build.js`):

```css
.dsfr-doc-iframe-modal::before,
.dsfr-doc-iframe-modal::after {
  height: 1rem;
  flex-basis: 1rem;
}
.dsfr-doc-iframe-modal .fr-modal__body {
  max-height: calc(100vh - 2rem);
}
.dsfr-doc-iframe-modal .fr-modal__content {
  margin-bottom: 1.5rem;
}
.dsfr-doc-iframe-modal iframe {
  display: block;
  width: 100%;
  height: calc(100vh - 8rem); /* fills the modal body without a second scrollbar */
  min-height: 20rem;
  border: 0;
}
```

`allow-popups` and `allow-popups-to-escape-sandbox` are required: the tutorial opens the release files (downloads) and Penpot in new tabs, `allow-downloads` covers browsers handling the download from the iframe itself. If the directive is not supported, a simple link to the tutorial is a working fallback (the tutorial also works as a standalone page).

The `src` must be updated once the final domain of the tutorial is chosen.
