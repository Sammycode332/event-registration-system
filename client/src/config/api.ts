/// <reference types="vite/client" />

// Production calls the deployed Render API directly. Keeping this URL here
// avoids an incorrectly configured Vercel environment variable pointing the
// client back to its own HTML application.
const apiUrl = import.meta.env.PROD
  ? "https://event-registration-system-y8fx.onrender.com"
  : import.meta.env.VITE_API_URL || "http://localhost:3000";

export const API_BASE_URL = apiUrl.replace(/\/$/, "");
