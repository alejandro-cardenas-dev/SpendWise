import api from "@/lib/api";

export const transactionService = {
  // Returns { count, next, previous, results }
  list: (params) => api.get("/transactions/", { params }).then((res) => res.data),
  create: (payload) => api.post("/transactions/", payload).then((res) => res.data),
  update: (id, payload) =>
    api.patch(`/transactions/${id}/`, payload).then((res) => res.data),
  remove: (id) => api.delete(`/transactions/${id}/`),
};