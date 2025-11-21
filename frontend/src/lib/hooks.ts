/**
 * Custom React Query hooks for data fetching.
 * Encapsulates API calls with caching and optimistic updates.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi, categoriesApi, notesApi } from "./api";

// Auth hooks
export function useUser() {
  return useQuery({
    queryKey: ["user"],
    queryFn: authApi.me,
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ username, password }: { username: string; password: string }) =>
      authApi.login(username, password),
    onSuccess: (user) => {
      queryClient.setQueryData(["user"], user);
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      username,
      password,
      email,
    }: {
      username: string;
      password: string;
      email?: string;
    }) => authApi.register(username, password, email),
    onSuccess: (user) => {
      queryClient.setQueryData(["user"], user);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.clear();
    },
  });
}

// Categories hooks
export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: categoriesApi.list,
  });
}

// Notes hooks
export function useNotes(categoryId?: number) {
  return useQuery({
    queryKey: ["notes", categoryId],
    queryFn: () => notesApi.list(categoryId),
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Parameters<typeof notesApi.update>[1] }) =>
      notesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

