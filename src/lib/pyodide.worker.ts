/// <reference lib="webworker" />
// Place at: src/lib/pyodide.worker.ts

const PYODIDE_VERSION = '0.26.4';
const PYODIDE_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

type InMessage =
  | { type: 'init' }
  | { type: 'prepare'; id: number; code: string }
  | { type: 'run'; id: number; code: string; stdin: string };

let pyodide: any = null;

async function init() {
  if (pyodide) return;
  const mod = await import(/* @vite-ignore */ `${PYODIDE_URL}pyodide.mjs`);
  pyodide = await mod.loadPyodide({ indexURL: PYODIDE_URL });
}

// Runs the learner's code in a fresh namespace, with stdin fed from the test
// case and stdout/stderr captured. Returns [stdout, stderr].
const RUNNER = `
import sys, io, traceback

def __run(code, stdin_text):
    out, err = io.StringIO(), io.StringIO()
    old = (sys.stdin, sys.stdout, sys.stderr)
    sys.stdin, sys.stdout, sys.stderr = io.StringIO(stdin_text), out, err
    try:
        exec(compile(code, "<solution>", "exec"), {"__name__": "__main__"})
    except BaseException:
        traceback.print_exc()
    finally:
        sys.stdin, sys.stdout, sys.stderr = old
    return [out.getvalue(), err.getvalue()]
`;

self.onmessage = async (e: MessageEvent<InMessage>) => {
  const msg = e.data;

  if (msg.type === 'init') {
    try {
      await init();
      pyodide.runPython(RUNNER);
      (self as any).postMessage({ type: 'ready' });
    } catch (err) {
      (self as any).postMessage({ type: 'init-error', message: String(err) });
    }
    return;
  }

  if (msg.type === 'prepare') {
    try {
      await init();
      // Downloads numpy, pandas, scikit-learn, etc. when the code imports them
      await pyodide.loadPackagesFromImports(msg.code);
      (self as any).postMessage({ type: 'prepared', id: msg.id });
    } catch (err) {
      (self as any).postMessage({ type: 'prepared', id: msg.id, error: String(err) });
    }
    return;
  }

  if (msg.type === 'run') {
    try {
      await init();
      if (!pyodide.globals.get('__run')) pyodide.runPython(RUNNER);
      // Loads numpy, pandas, etc. only when the code imports them
      await pyodide.loadPackagesFromImports(msg.code);
      const run = pyodide.globals.get('__run');
      const result = run(msg.code, msg.stdin);
      const [stdout, stderr] = result.toJs();
      result.destroy?.();
      (self as any).postMessage({ type: 'result', id: msg.id, stdout, stderr });
    } catch (err) {
      (self as any).postMessage({ type: 'result', id: msg.id, stdout: '', stderr: String(err) });
    }
  }
};