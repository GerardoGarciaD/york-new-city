/** Thrown when the server rejects the token, so the app can send the player back to the login. */
export class UnauthorizedError extends Error {}

/** Calls the API in server/app.js. Throws on any error, so callers can show a toast. */
export async function apiRequest(path, { token, method = "GET", body } = {}) {
  const response = await fetch(`/api${path}`, {
    method,
    headers: {
      ...(body !== undefined && { "Content-Type": "application/json" }),
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (response.status === 401) throw new UnauthorizedError();
  if (!response.ok) throw new Error(`La API respondió ${response.status}`);
  return response.status === 204 ? null : response.json();
}
