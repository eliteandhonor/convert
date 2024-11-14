import { useHotkeys } from 'react-hotkeys-hook';

interface KeyboardShortcutProps {
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
  onSave: () => void;
  disabled?: boolean;
}

export function useKeyboardShortcuts({
  onUndo,
  onRedo,
  onReset,
  onSave,
  disabled
}: KeyboardShortcutProps) {
  useHotkeys('ctrl+z, cmd+z', (e) => {
    e.preventDefault();
    if (!disabled) onUndo();
  });

  useHotkeys('ctrl+shift+z, cmd+shift+z', (e) => {
    e.preventDefault();
    if (!disabled) onRedo();
  });

  useHotkeys('ctrl+r, cmd+r', (e) => {
    e.preventDefault();
    if (!disabled) onReset();
  });

  useHotkeys('ctrl+s, cmd+s', (e) => {
    e.preventDefault();
    if (!disabled) onSave();
  });
}