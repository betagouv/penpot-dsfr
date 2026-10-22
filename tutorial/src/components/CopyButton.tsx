import { Button } from '@codegouvfr/react-dsfr/Button';
import { useEffect, useState } from 'react';

export interface CopyButtonProps {
  value: string;
  label?: string;
}

export function CopyButton({ value, label = 'Copier' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timeout = setTimeout(() => setCopied(false), 2000);

    return () => clearTimeout(timeout);
  }, [copied]);

  return (
    <Button
      priority="tertiary"
      size="small"
      iconId={copied ? 'fr-icon-check-line' : 'fr-icon-clipboard-line'}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
        } catch {
          // The clipboard can be forbidden (iframe without `clipboard-write` permission), let the user copy manually
          window.prompt('Copiez la valeur ci-dessous :', value);
        }
      }}
    >
      {copied ? 'Copié' : label}
    </Button>
  );
}
