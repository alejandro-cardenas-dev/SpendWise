"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useQueryClient } from "@tanstack/react-query";

import { setAuthFailureHandler } from "@/lib/api";
import { tokenStorage } from "@/lib/tokens";
import { authService } from "@/services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  // "loading" | "authenticated" | "unauthenticated"
  // Starts as "loading" on server AND client, so hydration always matches.
  const [status, setStatus] = useState("loading");

  const clearSession = useCallback(() => {
    tokenStorage.clear();
    queryClient.clear(); // never leave one user's cached data around for the next
    setUser(null);
    setStatus("unauthenticated");
  }, [queryClient]);

  // The Axios interceptor calls this when a refresh fails for good
  useEffect(() => {
    setAuthFailureHandler(clearSession);
  }, [clearSession]);

  // On first load, restore the session if tokens exist
  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      if (!tokenStorage.getAccess() && !tokenStorage.getRefresh()) {
        setStatus("unauthenticated");
        return;
      }
      try {
        // If the access token expired, the interceptor refreshes it silently
        const me = await authService.me();
        if (!cancelled) {
          setUser(me);
          setStatus("authenticated");
        }
      } catch {
        // The interceptor already cleared the tokens if the server rejected them
        if (!cancelled) {
          setUser(null);
          setStatus("unauthenticated");
        }
      }
    }

    restoreSession();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (credentials) => {
    const data = await authService.login(credentials);
    tokenStorage.set({ access: data.access, refresh: data.refresh });
    setUser(data.user);
    setStatus("authenticated");
  }, []);

  const register = useCallback(async (payload) => {
    const data = await authService.register(payload);
    tokenStorage.set({ access: data.access, refresh: data.refresh });
    setUser(data.user);
    setStatus("authenticated");
  }, []);

  const logout = useCallback(async () => {
    const refresh = tokenStorage.getRefresh();
    try {
      if (refresh) await authService.logout(refresh); // blacklists it server-side
    } catch {
      // Even if the request fails we still end the session locally
    }
    clearSession();
  }, [clearSession]);

  const value = useMemo(
    () => ({ user, status, login, register, logout }),
    [user, status, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
  return context;
}