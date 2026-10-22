import { fr } from '@codegouvfr/react-dsfr';

export interface ProgressBarProps {
  label: string;
  // Between 0 and 1, `null` when unknown
  value: number | null;
}

export function ProgressBar({ label, value }: ProgressBarProps) {
  const percentage = value !== null ? Math.round(value * 100) : null;

  return (
    <div className={fr.cx('fr-my-2w')} role="status" aria-live="polite">
      <p className={fr.cx('fr-text--sm', 'fr-mb-1w')}>
        {label}
        {percentage !== null && ` (${percentage} %)`}
      </p>
      <div
        style={{
          height: '0.5rem',
          backgroundColor: fr.colors.decisions.background.contrast.grey.default,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: percentage !== null ? `${percentage}%` : '30%',
            backgroundColor: fr.colors.decisions.background.actionHigh.blueFrance.default,
            transition: 'width 0.2s',
          }}
        />
      </div>
    </div>
  );
}
