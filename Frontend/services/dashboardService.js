import api from "@/lib/api";

export const dashboardService = {
  get: (month) =>
    api.get("/dashboard/", { params: { month } }).then((res) => res.data),
};