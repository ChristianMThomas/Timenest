// API Configuration
// This file manages the base URL for all API requests

const API_BASE_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.MODE === 'production'
    ? 'https://timenest-production-0243.up.railway.app'
    : 'http://localhost:8080');

export { API_BASE_URL };
