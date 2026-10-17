'use client';

if (typeof window !== 'undefined') {
  // 1. Intercept unhandled errors originating from Chrome/Browser Extensions (e.g., chrome-extension://...)
  // Capture phase (useCapture = true) prevents the Next.js dev overlay from catching external extension bugs
  window.addEventListener(
    'error',
    (event) => {
      const filename = event.filename || '';
      const stack = event.error?.stack || '';
      const message = event.message || '';

      if (
        filename.includes('chrome-extension://') ||
        filename.includes('moz-extension://') ||
        filename.includes('safari-extension://') ||
        stack.includes('chrome-extension://') ||
        stack.includes('moz-extension://') ||
        message.includes('M_ID') ||
        message.includes('bis_skin_checked')
      ) {
        event.stopImmediatePropagation();
        event.preventDefault();
        return true;
      }
    },
    true
  );

  window.addEventListener(
    'unhandledrejection',
    (event) => {
      const reason = event.reason;
      const stack = reason?.stack || '';
      const message = reason?.message || String(reason || '');

      if (
        stack.includes('chrome-extension://') ||
        stack.includes('moz-extension://') ||
        message.includes('M_ID') ||
        message.includes('bis_skin_checked')
      ) {
        event.stopImmediatePropagation();
        event.preventDefault();
      }
    },
    true
  );

  // 2. Suppress extension-injected logs and hydration warnings in console
  const originalError = console.error;
  console.error = function (...args: any[]) {
    const msg = args
      .map((a) => (typeof a === 'object' ? a?.stack || a?.message || JSON.stringify(a) : String(a)))
      .join(' ');
    if (
      msg.includes('chrome-extension://') ||
      msg.includes('moz-extension://') ||
      msg.includes('M_ID') ||
      msg.includes('bis_skin_checked') ||
      msg.includes('bis_') ||
      (msg.includes('hydrated') && msg.includes('attributes'))
    ) {
      return;
    }
    originalError.apply(console, args);
  };

  try {
    // Strip any extension-injected attributes (like bis_skin_checked) before React hydration
    if (document.querySelectorAll) {
      document.querySelectorAll('[bis_skin_checked]').forEach((el) => {
        el.removeAttribute('bis_skin_checked');
      });
    }

    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === 'attributes' && m.attributeName && m.attributeName.indexOf('bis_') === 0) {
          (m.target as Element).removeAttribute(m.attributeName);
        }
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      subtree: true,
      attributeFilter: ['bis_skin_checked'],
    });
  } catch (e) {}
}

export default function HydrationFix() {
  return null;
}
