# Documentation for systeme-de-design.gouv.fr

Pages written with the conventions of [the official DSFR documentation](https://github.com/GouvernementFR/dsfr/tree/main/src/dsfr/core/_part/doc) (markdown with a YAML front matter, `_asset/` folder for images, `dsfr-doc-*` directives), to be integrated by the SIG team into https://www.systeme-de-design.gouv.fr/.

- `penpot/index.md`: short presentation of Penpot opening the interactive tutorial (installation of the DSFR files, transfer of Figma mockups, usage), known limitations and frequently asked questions

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
<div class="dsfr-doc-iframe-modal__frame">
  <p class="dsfr-doc-iframe-modal__loader" aria-hidden="true">Chargement du parcours…</p>
  <iframe
    title="Installer le DSFR sur Penpot"
    src="https://betagouv.github.io/penpot-dsfr/"
    loading="lazy"
    sandbox="allow-scripts allow-same-origin allow-downloads allow-popups allow-popups-to-escape-sandbox"
  ></iframe>
</div>
```

The tutorial is long and used for a while, so the modal takes the whole screen height, the iframe filling it so the tutorial is the only scrolling area. A class on the `fr-modal` and this CSS are needed (see `scripts/build.js`):

- From the md breakpoint the DSFR keeps 10% of the screen above and under a modal (`::before` and `::after` spacers, not overridable inline)
- On mobile `100vh` is the height with the browser toolbars retracted, but the open modal locks the page scroll so they never retract, and the bottom of the tutorial (its navigation buttons) would stay under them. The DSFR script already measures the visible height into `--modal-max-height`, so the body uses it at every breakpoint and the iframe fills the rest
- The tutorial loads when the modal opens, a loader stays behind the iframe until the tutorial paints its own background
- The iframe is not displayed while the modal is closed: the modal is only `visibility: hidden`, and WebKit (Safari, and every iOS browser) does not register the scrolling area of an iframe laid out while invisible, until a repaint such as switching tabs

```css
.dsfr-doc-iframe-modal::before,
.dsfr-doc-iframe-modal::after {
  height: 1rem;
  flex-basis: 1rem;
}
.dsfr-doc-iframe-modal .fr-modal__body {
  display: flex;
  flex-direction: column;
  height: var(--modal-max-height);
  max-height: var(--modal-max-height);
}
.dsfr-doc-iframe-modal .fr-modal__content {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
  margin-bottom: 1.5rem;
}
.dsfr-doc-iframe-modal__frame {
  position: relative;
  display: flex;
  flex: 1 1 auto;
  min-height: 0;
}
.dsfr-doc-iframe-modal__loader {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin: 0;
  color: var(--text-mention-grey);
}
.dsfr-doc-iframe-modal__loader::before {
  content: '';
  width: 2.5rem;
  height: 2.5rem;
  border: 0.25rem solid var(--border-default-grey);
  border-top-color: var(--border-action-high-blue-france);
  border-radius: 50%;
  animation: dsfr-doc-iframe-modal-spin 0.8s linear infinite;
}
@keyframes dsfr-doc-iframe-modal-spin {
  to {
    transform: rotate(360deg);
  }
}
@media (prefers-reduced-motion: reduce) {
  .dsfr-doc-iframe-modal__loader::before {
    animation-duration: 2.4s;
  }
}
.dsfr-doc-iframe-modal iframe {
  position: relative;
  display: block;
  flex: 1 1 auto;
  width: 100%;
  min-height: 0;
  border: 0;
}
.dsfr-doc-iframe-modal:not(.fr-modal--opened) iframe {
  display: none;
}
```

The sandbox only grants what the tutorial needs: `allow-scripts` since it is a JavaScript application, `allow-same-origin` to keep the progress in its local storage, `allow-popups` and `allow-popups-to-escape-sandbox` to open the release files (downloads) and Penpot in new tabs, and `allow-downloads` for browsers handling the download from the iframe itself. It submits no form, so `allow-forms` is not needed. If the directive is not supported, a simple link to the tutorial is a working fallback (the tutorial also works as a standalone page).

The `src` must be updated once the final domain of the tutorial is chosen.
