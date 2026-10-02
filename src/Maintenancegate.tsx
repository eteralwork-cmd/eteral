import { useState, type FormEvent, type ReactNode } from 'react';

const STORAGE_KEY = 'eteral_maintenance_unlocked';

export default function MaintenanceGate({ children }: { children: ReactNode }) {
  const maintenanceMode = import.meta.env.VITE_MAINTENANCE_MODE === 'true';
  const correctPassword = import.meta.env.VITE_MAINTENANCE_PASSWORD;

  const [unlocked, setUnlocked] = useState(
    () => sessionStorage.getItem(STORAGE_KEY) === 'true'
  );
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);

  if (!maintenanceMode || unlocked) {
    return <>{children}</>;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (input === correctPassword) {
      sessionStorage.setItem(STORAGE_KEY, 'true');
      setUnlocked(true);
      setError(false);
    } else {
      setError(true);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-6">
      <div className="w-full max-w-sm rounded-2xl border border-mist bg-white p-8 text-center">
        <h1 className="text-lg font-semibold text-ink">Eteral is undergoing maintenance</h1>
        <p className="mt-2 text-sm text-slatey">
          We'll be back shortly. If you have the access password, enter it below.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
          <input
            type="password"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError(false);
            }}
            placeholder="Password"
            autoFocus
            className="w-full rounded-xl border border-mist bg-white px-4 py-2.5 text-sm text-ink placeholder:text-slatey/60 focus:outline-none focus:border-ink/30"
          />
          {error && <p className="text-xs text-red-500">Incorrect password.</p>}
          <button
            type="submit"
            className="rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white hover:bg-ink/90 transition-colors"
          >
            Enter
          </button>
        </form>
      </div>
    </div>
  );
}