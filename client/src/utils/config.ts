const inferredApiUrl = `${window.location.protocol}//${window.location.hostname}:4000`;

export const API_URL = (import.meta.env.VITE_API_URL || inferredApiUrl).replace(/\/$/, "");
