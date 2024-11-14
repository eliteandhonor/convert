import { useEffect } from 'react';
import { useLocalStorage, useMedia } from 'react-use';

export function useDarkMode() {
  const [enabledState, setEnabledState] = useLocalStorage<boolean>('dark-mode', false);
  const prefersDarkMode = useMedia('(prefers-color-scheme: dark)');
  
  const enabled = enabledState ?? prefersDarkMode;

  useEffect(() => {
    const className = 'dark';
    const element = window.document.documentElement;
    
    enabled ? element.classList.add(className) : element.classList.remove(className);
  }, [enabled]);

  return [enabled, setEnabledState] as const;
}