const ACCESS_KEY = "spendwise.access";
const REFRESH_KEY = "spendwise.refresh";

// localStorage doesn't exist on the server, where Next.js pre-renders pages
const isBrowser = () => typeof window !== "undefined";

export const tokenStorage = {
  getAccess: () => (isBrowser() ? localStorage.getItem(ACCESS_KEY) : null),
  getRefresh: () => (isBrowser() ? localStorage.getItem(REFRESH_KEY) : null),

  set({ access, refresh }) {
    if (!isBrowser()) return;
    if (access) localStorage.setItem(ACCESS_KEY, access);
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
  },

  clear() {
    if (!isBrowser()) return;
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};