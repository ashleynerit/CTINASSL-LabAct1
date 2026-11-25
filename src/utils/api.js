export async function apiRequest(path, options = {}) {
  const headers = { ...options.headers };
  let body = options.body;

  if (body !== undefined && typeof body !== "string") {
    body = JSON.stringify(body);
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(path, {
    ...options,
    body,
    headers,
    credentials: "same-origin"
  });

  if (response.status === 204) {
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}.`);
    }
    return null;
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    const text = await response.text();
    throw new Error(
      response.ok
        ? "The server returned an unexpected response."
        : text || `Request failed with status ${response.status}.`
    );
  }

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || `Request failed with status ${response.status}.`);
  }
  return result;
}
