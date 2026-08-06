import React, { createContext, useCallback, useContext, useRef, useState } from 'react';

export type ErrorKey =
  | 'duplicate-email'
  | 'duplicate-phone'
  | 'invalid-email'
  | 'team-full'
  | 'team-under'
  | 'generic';

// Plain-English descriptions for aria-live (screen readers)
const ARIA_MESSAGES: Record<ErrorKey, string> = {
  'duplicate-email': 'This email address is already used by another team member.',
  'duplicate-phone': 'This phone number is already used by another team member.',
  'invalid-email': 'Please enter a valid email address.',
  'team-full': 'You cannot add more members — the team is already full.',
  'team-under': 'You need more team members before submitting.',
  'generic': 'There is an error with your form. Please review your entries.',
};

// Joke message variants (Max voice — Stranger Things)
const MAX_MESSAGES: Record<ErrorKey, string[]> = {
  'duplicate-email': [
    'Two people, one inbox? Nice try, dingus.',
    "That email's already on this team. Did you clone someone?",
    'Copy-paste error. On you, not the computer.',
  ],
  'duplicate-phone': [
    "One phone, two registrations? That's not how this works.",
    'Already got that number. Are you the same person?',
  ],
  'invalid-email': [
    "That's not an email. That's a typo having a bad day.",
    "Looks like gibberish to me. And I've seen the Upside Down.",
    'Whatever that is, it is definitely not an email address.',
  ],
  'team-full': [
    "Squad's full. Go start your own party.",
    'No more room. The van is packed.',
    "That's too many people. We're not the Hawkins Lab.",
  ],
  'team-under': [
    "You need more people. This isn't a solo mission.",
    "Bring your teammates. You can't do this alone.",
  ],
  generic: [
    "Something's wrong. Fix it before the Demogorgon notices.",
    "Error detected. I'd fix it if I were you.",
    "That's not right. Try again, dingus.",
  ],
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

interface MaxErrorContextValue {
  showMaxError: (key: ErrorKey) => void;
  visible: boolean;
  message: string;
  ariaMessage: string;
  dismiss: () => void;
}

const MaxErrorContext = createContext<MaxErrorContextValue | null>(null);

export function MaxErrorProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [ariaMessage, setAriaMessage] = useState('');
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    setVisible(false);
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
  }, []);

  const showMaxError = useCallback((key: ErrorKey) => {
    const joke = pickRandom(MAX_MESSAGES[key]);
    const plain = ARIA_MESSAGES[key];

    setMessage(joke);
    setAriaMessage(plain);
    setVisible(true);

    // Reset auto-dismiss timer
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    dismissTimerRef.current = setTimeout(() => setVisible(false), 4000);
  }, []);

  return (
    <MaxErrorContext.Provider value={{ showMaxError, visible, message, ariaMessage, dismiss }}>
      {children}
    </MaxErrorContext.Provider>
  );
}

export function useMaxError(): MaxErrorContextValue {
  const ctx = useContext(MaxErrorContext);
  if (!ctx) throw new Error('useMaxError must be used inside MaxErrorProvider');
  return ctx;
}
