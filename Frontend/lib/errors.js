// Turns an Axios error into one readable sentence
export function getErrorMessage(
  error,
  fallback = "Something went wrong. Please try again."
) {
  if (!error?.response) return "Cannot reach the server. Check your connection.";
  const data = error.response.data;
  if (typeof data?.detail === "string") return data.detail;
  if (Array.isArray(data?.non_field_errors)) return data.non_field_errors[0];
  return fallback;
}

// DRF returns field errors as {"email": ["..."], "password": ["..."]}.
// This puts each one under the matching input. Returns true if any was applied.
export function applyFieldErrors(error, setError) {
  const data = error?.response?.data;
  if (!data || typeof data !== "object") return false;

  let applied = false;
  for (const [field, messages] of Object.entries(data)) {
    if (field === "detail" || field === "non_field_errors") continue;
    setError(field, {
      type: "server",
      message: Array.isArray(messages) ? messages.join(" ") : String(messages),
    });
    applied = true;
  }
  return applied;
}