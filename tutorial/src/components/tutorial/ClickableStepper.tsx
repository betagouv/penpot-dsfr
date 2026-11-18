import { fr } from '@codegouvfr/react-dsfr';
import { CSSProperties, useState } from 'react';

export interface ClickableStepperProps {
  title: string;
  // 1-based, like the DSFR stepper
  currentStep: number;
  stepTitles: string[];
  nextTitle?: string;
  // Called with a 0-based index, the current step is not clickable
  onStepClick: (index: number) => void;
}

// Same markup and look as the DSFR stepper, except that its bar is made of buttons so people can go back to a step directly
// (when blocked, to show it to a colleague...). The DSFR draws the bar with a background gradient, so it cannot be reused
export function ClickableStepper({ title, currentStep, stepTitles, nextTitle, onStepClick }: ClickableStepperProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className={fr.cx('fr-stepper')}>
      <h2 className={fr.cx('fr-stepper__title')}>
        {title}
        <span className={fr.cx('fr-stepper__state')}>
          Étape {currentStep} sur {stepTitles.length}
        </span>
      </h2>
      <nav aria-label="Étapes du parcours">
        {/* Not a list, the DSFR numbers them and the bar would show the numbers */}
        <div style={{ display: 'flex', gap: '0.5rem', margin: '-0.5rem 0 0.25rem' }}>
          {stepTitles.map((stepTitle, index) => {
            const isCurrent = index === currentStep - 1;
            const isDone = index < currentStep;
            const isHovered = hoveredIndex === index && !isCurrent;
            const barStyle: CSSProperties = {
              display: 'block',
              height: '0.5rem',
              backgroundColor: isDone
                ? `var(${isHovered ? '--background-active-blue-france-hover' : '--background-active-blue-france'})`
                : `var(${isHovered ? '--background-contrast-grey-active' : '--background-contrast-grey'})`,
            };

            return (
              <div key={index} style={{ flex: '1 1 0' }}>
                <button
                  type="button"
                  title={`Étape ${index + 1} : ${stepTitle}`}
                  aria-label={`Étape ${index + 1} : ${stepTitle}${isCurrent ? ' (étape actuelle)' : ''}`}
                  aria-current={isCurrent ? 'step' : undefined}
                  onClick={() => !isCurrent && onStepClick(index)}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  // The bar stays thin but the clickable area is taller, to be usable on touch screens
                  style={{ display: 'block', width: '100%', padding: '0.5rem 0', background: 'none', cursor: isCurrent ? 'default' : 'pointer' }}
                >
                  <span style={barStyle} />
                </button>
              </div>
            );
          })}
        </div>
      </nav>
      {nextTitle !== undefined && (
        <p className={fr.cx('fr-stepper__details')}>
          <span className={fr.cx('fr-text--bold')}>Étape suivante :</span> {nextTitle}
        </p>
      )}
    </div>
  );
}
