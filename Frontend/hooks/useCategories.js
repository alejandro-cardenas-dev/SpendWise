import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { categoryService } from "@/services/categoryService";

export function useCategories(params) {
  return useQuery({
    queryKey: ["categories", params ?? {}],
    queryFn: () => categoryService.list(params),
  });
}

export function useCategoryMutations() {
  const queryClient = useQueryClient();

  // Category data is embedded in transactions, notifications and the dashboard,
  // so a change here makes all of those stale. Invalidating by prefix refetches
  // every query whose key starts with the name, whatever its params.
  // Returning the promise makes the mutation wait for fresh data before it
  // resolves, so the modal closes onto an already-updated list.
  const refresh = () =>
    Promise.all(
      ["categories", "transactions", "notifications", "dashboard"].map((key) =>
        queryClient.invalidateQueries({ queryKey: [key] })
      )
    );

  const create = useMutation({
    mutationFn: categoryService.create,
    onSuccess: refresh,
  });
  const update = useMutation({
    mutationFn: ({ id, payload }) => categoryService.update(id, payload),
    onSuccess: refresh,
  });
  const remove = useMutation({
    mutationFn: categoryService.remove,
    onSuccess: refresh,
  });

  return { create, update, remove };
}