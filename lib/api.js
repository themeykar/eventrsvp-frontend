import { getAccessToken } from "./auth";

/**
 * Generic API request wrapper for fetch.
 * Automatically attaches process.env.NEXT_PUBLIC_API_URL base URL
 * and Authorization: Bearer <token> if available.
 *
 * @param {string} path - Endpoint path e.g. "/api/events/"
 * @param {RequestInit} [options={}] - Fetch configuration options
 * @returns {Promise<Response>} - Fetch response promise
 */
export async function apiRequest(path, options = {}) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // Normalize full URL construction
  const url = path.startsWith("http")
    ? path
    : `${baseUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;

  const token = getAccessToken();

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  return fetch(url, config);
}
