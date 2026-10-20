import api from "@/lib/api";

export const categoryService = {
  list: (params) => api.get("/categories/", { params }).then((res) => res.data),
  create: (payload) => api.post("/categories/", payload).then((res) => res.data),
  update: (id, payload) =>
    api.patch(`/categories/${id}/`, payload).then((res) => res.data),
  remove: (id) => api.delete(`/categories/${id}/`),
};