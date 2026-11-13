/// <reference types="vite/client" />

const apiUrl = import.meta.env.VITE_API_URL;

if (!apiUrl) {
  throw new Error(
    "VITE_API_URL is missing. Check your environment configuration."
  );
}

export const API_BASE_URL = apiUrl.replace(/\/$/, "");