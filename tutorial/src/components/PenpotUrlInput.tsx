import { Input } from '@codegouvfr/react-dsfr/Input';
import { ReactNode, useId, useState } from 'react';

import { parsePenpotUrl } from '@tutorial/src/utils/penpot-url';

export interface PenpotUrlInputProps {
  label: ReactNode;
  value: string;
  onChange: (value: string) => void;
  // Additional checks once the URL is valid (same team as other files...), returns a warning message
  getWarning?: (fileId: string, teamId: string | null, origin: string) => string | null;
}

export function PenpotUrlInput({ label, value, onChange, getWarning }: PenpotUrlInputProps) {
  const id = useId();
  const [touched, setTouched] = useState(value !== '');
  const result = parsePenpotUrl(value);
  const warning = result.success && getWarning ? getWarning(result.fileId, result.teamId, result.origin) : null;

  let state: 'default' | 'error' | 'success' | 'info' = 'default';
  let message: ReactNode = undefined;

  if (touched && !result.success) {
    state = 'error';
    message = result.error;
  } else if (result.success && warning) {
    state = 'info';
    message = warning;
  } else if (result.success) {
    state = 'success';
    message = 'Adresse valide.';
  }

  return (
    <Input
      label={label}
      hintText="Exemple : https://design.penpot.app/#/workspace?team-id=…&file-id=…&page-id=…"
      state={state}
      stateRelatedMessage={message}
      nativeInputProps={{
        id: id,
        type: 'url',
        value: value,
        autoComplete: 'off',
        spellCheck: false,
        onChange: (event) => onChange(event.target.value),
        onBlur: () => setTouched(true),
      }}
    />
  );
}
