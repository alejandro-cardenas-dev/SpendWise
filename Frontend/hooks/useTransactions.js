import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { transactionService } from "@/services/transactionService";

export function useTransactions(params) {
  return useQuery({
    queryKey: ["transactions", params],
    queryFn: () => transactionService.list(params),
    // Keep showing the old page while the next one loads: no flicker on
    // filter changes or pagination.
    placeholderData: keepPreviousData,
  });
}

export function useTransactionMutations() {
  const queryClient = useQueryClient();

  // A transaction changes the dashboard and may create a notification
  // (Phase 3), so the bell updates now instead of at the next 30 s poll.
  const refresh = () =>
    Promise.all(
      ["transactions", "dashboard", "notifications"].map((key) =>
        queryClient.invalidateQueries({ queryKey: [key] })
      )
    );

  const create = useMutation({
    mutationFn: transactionService.create,
    onSuccess: refresh,
  });
  const update = useMutation({
    mutationFn: ({ id, payload }) => transactionService.update(id, payload),
    onSuccess: refresh,
  });
  const remove = useMutation({
    mutationFn: transactionService.remove,
    onSuccess: refresh,
  });

  return { create, update, remove };
}