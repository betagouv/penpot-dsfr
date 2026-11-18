import { fr } from '@codegouvfr/react-dsfr';
import { ReactNode } from 'react';

export interface ScreenshotProps {
  src: string;
  alt: string;
  // Displayed width at most, the images being narrower than the content column
  maxWidth: number;
  // Owner of the captured interface, for the copyright label
  copyright: string;
  caption: ReactNode;
  bordered?: boolean;
}

// Image and its caption, both centered in the content column
export function Screenshot({ src, alt, maxWidth, copyright, caption, bordered = false }: ScreenshotProps) {
  return (
    <figure className={fr.cx('fr-content-media', 'fr-mt-2w')} role="group" aria-label={`© ${copyright}`}>
      <img
        src={src}
        alt={alt}
        style={{
          display: 'block',
          width: '100%',
          maxWidth,
          height: 'auto',
          margin: '0 auto',
          ...(bordered ? { border: `1px solid ${fr.colors.decisions.border.default.grey.default}` } : {}),
        }}
      />
      {/* The DSFR lays out the caption as a flex column: a single child keeps the formatted text on the same lines */}
      <figcaption className={fr.cx('fr-content-media__caption')} style={{ textAlign: 'center' }}>
        <span>{caption}</span>
      </figcaption>
    </figure>
  );
}
