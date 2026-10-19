// Place at: src/lib/usePyodide.ts
import { useCallback, useEffect, useRef, useState } from 'react';

export type PyResult = { stdout: string; stderr: string; timedOut?: boolean };

const RUN_TIMEOUT_MS = 20000; // the learner's code itself (packages are already loaded)
const PREPARE_TIMEOUT_MS = 120000; // first-time download of numpy, pandas, scikit-learn
const INIT_TIMEOUT_MS = 60000;

export function usePyodide() {
  const workerRef = useRef<Worker | null>(null);
  const readyRef = useRef<Promise<void> | null>(null);
  const idRef = useRef(0);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);

  const kill = useCallback(() => {
    workerRef.current?.terminate();
    workerRef.current = null;
    readyRef.current = null;
    setReady(false);
  }, []);

  // Starts the worker and loads Pyodide. Safe to call many times.
  const warmUp = useCallback((): Promise<void> => {
    if (readyRef.current) return readyRef.current;

    setLoading(true);
    const worker = new Worker(new URL('./pyodide.worker.ts', import.meta.url), { type: 'module' });
    workerRef.current = worker;

    readyRef.current = new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => {
        kill();
        reject(new Error('Python took too long to load. Check your connection and try again.'));
      }, INIT_TIMEOUT_MS);

      const onMessage = (e: MessageEvent) => {
        if (e.data.type === 'ready') {
          clearTimeout(timer);
          worker.removeEventListener('message', onMessage);
          setReady(true);
          setLoading(false);
          resolve();
        } else if (e.data.type === 'init-error') {
          clearTimeout(timer);
          worker.removeEventListener('message', onMessage);
          kill();
          setLoading(false);
          reject(new Error(e.data.message));
        }
      };
      worker.addEventListener('message', onMessage);
      worker.postMessage({ type: 'init' });
    });

    return readyRef.current;
  }, [kill]);

  // Downloads the libraries the code imports (numpy, pandas, scikit-learn...).
  // Uses its own, longer timeout so slow downloads are not mistaken for slow code.
  const prepare = useCallback(
    async (code: string): Promise<void> => {
      await warmUp();
      const worker = workerRef.current;
      if (!worker) throw new Error('Python is not available.');

      const id = ++idRef.current;
      return new Promise<void>((resolve, reject) => {
        const timer = setTimeout(() => {
          worker.removeEventListener('message', onMessage);
          kill();
          reject(new Error('Loading Python libraries took too long. Check your connection and try again.'));
        }, PREPARE_TIMEOUT_MS);

        const onMessage = (e: MessageEvent) => {
          if (e.data.type === 'prepared' && e.data.id === id) {
            clearTimeout(timer);
            worker.removeEventListener('message', onMessage);
            if (e.data.error) reject(new Error(e.data.error));
            else resolve();
          }
        };
        worker.addEventListener('message', onMessage);
        worker.postMessage({ type: 'prepare', id, code });
      });
    },
    [warmUp, kill],
  );

  const runPython = useCallback(
    async (code: string, stdin = ''): Promise<PyResult> => {
      await prepare(code);
      const worker = workerRef.current;
      if (!worker) throw new Error('Python is not available.');

      const id = ++idRef.current;
      return new Promise<PyResult>((resolve) => {
        const timer = setTimeout(() => {
          // Infinite loop or too slow: kill the worker; it restarts on the next run
          worker.removeEventListener('message', onMessage);
          kill();
          resolve({ stdout: '', stderr: 'Time limit exceeded. Check for an infinite loop.', timedOut: true });
        }, RUN_TIMEOUT_MS);

        const onMessage = (e: MessageEvent) => {
          if (e.data.type === 'result' && e.data.id === id) {
            clearTimeout(timer);
            worker.removeEventListener('message', onMessage);
            resolve({ stdout: e.data.stdout, stderr: e.data.stderr });
          }
        };
        worker.addEventListener('message', onMessage);
        worker.postMessage({ type: 'run', id, code, stdin });
      });
    },
    [prepare, kill],
  );

  useEffect(() => () => kill(), [kill]);

  return { runPython, warmUp, ready, loading };
}