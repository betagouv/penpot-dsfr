import { Dispatch, SetStateAction, useEffect, useState } from 'react';

// Storage can be unavailable (private browsing, iframe with blocked third-party storage...), the tutorial must still work
function readValue<T>(key: string, initialValue: T): T {
  try {
    const rawValue = window.localStorage.getItem(key);

    return rawValue !== null ? { ...initialValue, ...(JSON.parse(rawValue) as T) } : initialValue;
  } catch {
    return initialValue;
  }
}

export function useLocalStorageState<T extends object>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => readValue(key, initialValue));

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore, the progress will just not be remembered
    }
  }, [key, value]);

  return [value, setValue];
}
