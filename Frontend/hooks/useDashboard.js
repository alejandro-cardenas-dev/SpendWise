import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { dashboardService } from "@/services/dashboardService";

// One request for the whole page; the month is part of the cache key, so going
// back to a month you already visited is instant.
export function useDashboard(month) {
  return useQuery({
    queryKey: ["dashboard", month],
    queryFn: () => dashboardService.get(month),
    // Keep the previous month on screen (dimmed) while the next one loads
    placeholderData: keepPreviousData,
  });
}