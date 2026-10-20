import { useEffect, useState } from "react";

// Returns `value` only after it has stopped changing for `delay` ms.
// Used so typing in the search box doesn't fire one request per keystroke.
export function useDebouncedValue(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}