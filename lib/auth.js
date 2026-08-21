/**
 * Authentication helper utilities for EventRSVP
 */

// Retrieve the JWT access token from localStorage (SSR safe)
export function getAccessToken() {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem("access_token");
}

// Check if a valid access token exists in localStorage
export function isAuthenticated() {
  const token = getAccessToken();
  return Boolean(token && token.trim() !== "");
}

// Log out user by clearing tokens and redirecting to /login
export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = "/login";
  }
}
