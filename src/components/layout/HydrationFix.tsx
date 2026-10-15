'use client';

if (typeof window !== 'undefined') {
  // Suppress extension-injected hydration mismatches (like bis_skin_checked) in Next.js dev overlay
  const originalError = console.error;
  console.error = function (...args: any[]) {
    const msg = args.map((a) => (typeof a === 'object' ? a?.message || JSON.stringify(a) : String(a))).join(' ');
    if (
      msg.includes('bis_skin_checked') ||
      msg.includes('bis_') ||
      (msg.includes('hydrated') && msg.includes('attributes'))
    ) {
      return;
    }
    originalError.apply(console, args);
  };

  try {
    // Strip any bis_skin_checked attributes injected before React hydration
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
