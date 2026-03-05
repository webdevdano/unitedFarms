/**
 * Map focus bridge — stores the focus fn on `window` so it is
 * guaranteed to be the same reference regardless of how Next.js
 * bundles or splits the modules.
 */

type FocusFn = (lat: number, lng: number, title?: string) => void;

declare global {
  interface Window {
    __leafletFocusFn?: FocusFn;
  }
}

/** Called by ResultsMap after L.map() is created */
export function registerMapFocus(fn: FocusFn) {
  if (typeof window !== "undefined") {
    window.__leafletFocusFn = fn;
    console.log("[mapBridge] focus fn registered ✓");
  }
}

/** Called by page.tsx card onClick */
export function focusMapOn(lat: number, lng: number, title?: string) {
  console.log("[mapBridge] focusMapOn called", lat, lng, title);
  if (typeof window === "undefined" || !window.__leafletFocusFn) {
    console.warn("[mapBridge] no focus fn registered yet");
    return;
  }
  window.__leafletFocusFn(lat, lng, title);
}
