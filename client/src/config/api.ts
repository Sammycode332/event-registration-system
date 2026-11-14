/// <reference types="vite/client" />

// In production Vercel proxies /api to the Render service. This prevents
// browser CORS failures and avoids relying on an environment value baked into
// the static bundle. Local development continues to call the local API.
const apiUrl = import.meta.env.PROD
  ? "/api"
  : import.meta.env.VITE_API_URL || "http://localhost:3000";

export const API_BASE_URL = apiUrl.replace(/\/$/, "");
