import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import * as Sentry from '@sentry/react-native';
import { useAuth } from '@/state/AuthContext';
import { getProfileById, updateProfile } from '@/data/api';

interface PreferencesContextValue {
  currency: string;
  setCurrency: (code: string) => void;
}

const PreferencesContext = createContext<PreferencesContextValue>({
  currency: 'USD',
  setCurrency: () => {},
});

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const { userId } = useAuth();
  const [currency, setCurrencyState] = useState('USD');

  useEffect(() => {
    if (!userId) return;
    getProfileById(userId)
      .then((p) => {
        if (p?.preferredCurrency) setCurrencyState(p.preferredCurrency);
      })
      .catch((e) => Sentry.captureException(e));
  }, [userId]);

  const setCurrency = useCallback(
    (code: string) => {
      setCurrencyState(code);
      if (userId) {
        updateProfile(userId, { preferredCurrency: code }).catch((e) =>
          Sentry.captureException(e),
        );
      }
    },
    [userId],
  );

  return (
    <PreferencesContext.Provider value={{ currency, setCurrency }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  return useContext(PreferencesContext);
}
