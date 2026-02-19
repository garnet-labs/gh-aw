/**
 * Lazy-loading wrapper for sonner toast.
 * Defers loading the sonner library until the first toast is actually triggered.
 * This keeps ~25KB of sonner code out of the initial critical bundle.
 */

let toastModule: typeof import('sonner') | null = null;
let loadPromise: Promise<typeof import('sonner')> | null = null;

function ensureLoaded(): Promise<typeof import('sonner')> {
  if (toastModule) return Promise.resolve(toastModule);
  if (!loadPromise) {
    loadPromise = import('sonner').then(m => {
      toastModule = m;
      return m;
    });
  }
  return loadPromise;
}

// Pre-load sonner after idle (so it's ready when user first clicks)
if (typeof window !== 'undefined') {
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(() => ensureLoaded());
  } else {
    setTimeout(() => ensureLoaded(), 100);
  }
}

type ToastFn = (typeof import('sonner'))['toast'];

export const toast: Pick<ToastFn, 'success' | 'info' | 'error' | 'warning'> & ToastFn = Object.assign(
  ((...args: Parameters<ToastFn>) => {
    ensureLoaded().then(m => (m.toast as any)(...args));
  }) as ToastFn,
  {
    success: (...args: Parameters<ToastFn>) => {
      ensureLoaded().then(m => m.toast.success(...args));
    },
    info: (...args: Parameters<ToastFn>) => {
      ensureLoaded().then(m => m.toast.info(...args));
    },
    error: (...args: Parameters<ToastFn>) => {
      ensureLoaded().then(m => m.toast.error(...args));
    },
    warning: (...args: Parameters<ToastFn>) => {
      ensureLoaded().then(m => m.toast.warning(...args));
    },
  } as any,
);
