import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  action: () => void;
  description: string;
}

export const useKeyboardNavigation = (shortcuts: KeyboardShortcut[]) => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrl === undefined || shortcut.ctrl === (e.ctrlKey || e.metaKey);
        const altMatch = shortcut.alt === undefined || shortcut.alt === e.altKey;
        const shiftMatch = shortcut.shift === undefined || shortcut.shift === e.shiftKey;
        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();

        if (ctrlMatch && altMatch && shiftMatch && keyMatch) {
          e.preventDefault();
          shortcut.action();
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, navigate]);
};

// Common app-wide shortcuts
export const useAppKeyboardShortcuts = () => {
  const navigate = useNavigate();

  useKeyboardNavigation([
    {
      key: 'h',
      alt: true,
      action: () => navigate('/'),
      description: 'Go to home/dashboard'
    },
    {
      key: 'f',
      alt: true,
      action: () => navigate('/feed'),
      description: 'Go to feed'
    },
    {
      key: 's',
      alt: true,
      action: () => navigate('/search'),
      description: 'Go to search'
    },
    {
      key: 'n',
      alt: true,
      action: () => navigate('/notifications'),
      description: 'Go to notifications'
    },
    {
      key: 'p',
      alt: true,
      action: () => navigate('/profile'),
      description: 'Go to profile'
    },
    {
      key: 'm',
      alt: true,
      action: () => navigate('/messages'),
      description: 'Go to messages'
    },
  ]);
};
