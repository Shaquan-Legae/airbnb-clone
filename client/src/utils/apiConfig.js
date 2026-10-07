import axios from "axios";

const PROD_BACKEND_URL = "https://airbnb-clone-backend-r26p.onrender.com";
const DEV_BACKEND_URL = "http://localhost:4000";

export function getApiBaseUrl() {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (typeof window !== "undefined") {
    const { hostname } = window.location;
    // When running on Render or any non-localhost domain, default to production backend
    if (
      hostname.includes("onrender.com") ||
      (!["localhost", "127.0.0.1"].includes(hostname) && hostname !== "")
    ) {
      return PROD_BACKEND_URL;
    }
  }
  return DEV_BACKEND_URL;
}

export function getAuthToken() {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem("token");
}

export function setAuthToken(token) {
  if (typeof window === "undefined") {
    return;
  }
  if (token) {
    localStorage.setItem("token", token);
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
  }
}

export function clearAuthToken() {
  setAuthToken(null);
}
