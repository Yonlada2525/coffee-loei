import { createContext, useContext, useMemo, useState } from 'react';

const AppStateContext = createContext(null);

export function AppStateProvider({ children }) {
  const [revision, setRevision] = useState(0);
  const [toast, setToast] = useState(null);

  const notify = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    window.clearTimeout(notify.timer);
    notify.timer = window.setTimeout(() => setToast(null), 2800);
  };

  const refreshAll = () => setRevision((v) => v + 1);

  const value = useMemo(() => ({ revision, refreshAll, notify }), [revision]);

  return (
    <AppStateContext.Provider value={value}>
      {children}
      {toast && (
        <div className={`fixed right-4 top-4 z-[9999] rounded-2xl px-5 py-3 font-bold shadow-soft ${toast.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-coffee text-white'}`}>
          {toast.message}
        </div>
      )}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) throw new Error('useAppState must be used inside AppStateProvider');
  return context;
}
