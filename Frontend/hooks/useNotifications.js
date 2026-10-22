import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { notificationService } from "@/services/notificationService";

const POLL_INTERVAL = 30_000; // 30 seconds, as required

// Powers the badge on the bell
export function useUnreadCount() {
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: notificationService.unreadCount,
    refetchInterval: POLL_INTERVAL, // pauses on its own while the tab is hidden
    refetchOnWindowFocus: true, // comes back to the tab: check right away
  });
}

export function useNotifications(params, { enabled = true } = {}) {
  return useQuery({
    queryKey: ["notifications", "list", params],
    queryFn: () => notificationService.list(params),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useMarkNotificationsRead() {
  const queryClient = useQueryClient();

  // The prefix ["notifications"] refreshes both the list and the unread count
  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ["notifications"] });

  const markRead = useMutation({
    mutationFn: notificationService.markRead,
    onSuccess: refresh,
  });
  const markAllRead = useMutation({
    mutationFn: notificationService.markAllRead,
    onSuccess: refresh,
  });

  return { markRead, markAllRead };
}