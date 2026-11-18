import { SituationFields, SituationFieldsProps } from '@tutorial/src/components/SituationFields';

export type SituationStepProps = SituationFieldsProps;

export function SituationStep(props: SituationStepProps) {
  return (
    <>
      <p>
        Le DSFR est déjà installé dans votre équipe Penpot, inutile de recommencer : mettez à jour votre réponse, le parcours reprendra là où elle
        mène.
      </p>
      <SituationFields {...props} />
    </>
  );
}
