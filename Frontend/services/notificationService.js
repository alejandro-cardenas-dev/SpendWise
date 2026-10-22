import api from "@/lib/api";

export const notificationService = {
  // Returns { count, next, previous, results }
  list: (params) => api.get("/notifications/", { params }).then((res) => res.data),
  unreadCount: () =>
    api.get("/notifications/unread-count/").then((res) => res.data.count),
  markRead: (id) =>
    api.post(`/notifications/${id}/read/`).then((res) => res.data),
  markAllRead: () => api.post("/notifications/read-all/").then((res) => res.data),
};