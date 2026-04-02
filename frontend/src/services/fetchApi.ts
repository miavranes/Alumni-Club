// Wrapper around fetch that prepends VITE_API_URL to relative /api/ paths
const BASE = import.meta.env.VITE_API_URL || "";

export function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  if (typeof input === "string" && input.startsWith("/api/")) {
    input = `${BASE}${input}`;
  }
  return fetch(input, init);
}
