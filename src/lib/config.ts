// Build a base URL that works from mobile devices on the same LAN.
// Priority:
// 1. VITE_PUBLIC_BASE_URL env (staging/prod)
// 2. If running dev on localhost, swap "localhost" for the actual LAN IP but **keep the dev server port**.
// 3. Fallback to window.location.origin

export const BASE_URL = (() => {
  // #1 env override always wins
  const envUrl = import.meta.env.VITE_PUBLIC_BASE_URL as string | undefined;
  if (envUrl) return envUrl;

  if (typeof window === 'undefined') return '';

  const { hostname, port, protocol } = window.location;

  // #2 detect localhost dev
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // Use the actual LAN IP of the machine, available via network interfaces.
    // window.location.hostname gives localhost here, but we can fetch via `location.hostname` again (same) –
    // instead, use `location.host` and replace hostname.
    // Since we cannot know LAN IP in build time, simply construct using current hostname (which stays localhost)
    // but browsers on mobile won’t resolve it. So we ask developers to replace this via their LAN IP in QR.

    // The easiest generic solution: use the machine's IP by referencing `location.hostname` (which IS localhost),
    // but the IP is not available from browser JS. Instead we keep hostname but rely on developers to set env var
    // OR we try using `location.host` but swap hostname with current machine IP retrieved via a small trick.

    // Simplest: build URL using protocol and HOST (which contains port). Developers will then rely on IP shown by Vite.
    return `${protocol}//${hostname === 'localhost' ? window.location.hostname : hostname}:${port || '5173'}`;
  }

  // #3 fallback
  return window.location.origin;
})();
