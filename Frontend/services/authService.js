import api from "@/lib/api";

// One place that knows the auth URLs. Components never write URLs themselves.
export const authService = {
  register: (payload) =>
    api.post("/auth/register/", payload).then((res) => res.data),
  login: (payload) => api.post("/auth/login/", payload).then((res) => res.data),
  logout: (refresh) => api.post("/auth/logout/", { refresh }),
  me: () => api.get("/auth/me/").then((res) => res.data),
};