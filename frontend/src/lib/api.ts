/**
 * API client configuration using axios.
 * Handles authentication with session cookies.
 */
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Include cookies for session auth
  headers: {
    "Content-Type": "application/json",
  },
});

// Types for API responses
export interface User {
  id: number;
  username: string;
  email: string;
}

export interface Category {
  id: number;
  name: string;
  color_hex: string;
  slug: string;
  note_count: number;
  created_at: string;
}

export interface Note {
  id: number;
  title: string;
  content: string;
  category: number;
  category_detail: Category;
  owner: number;
  owner_username: string;
  created_at: string;
  updated_at: string;
}

// Auth API
export const authApi = {
  register: async (username: string, password: string, email?: string) => {
    const { data } = await apiClient.post<User>("/auth/register/", {
      username,
      password,
      email,
    });
    return data;
  },

  login: async (username: string, password: string) => {
    const { data } = await apiClient.post<User>("/auth/login/", {
      username,
      password,
    });
    return data;
  },

  logout: async () => {
    await apiClient.post("/auth/logout/");
  },

  me: async () => {
    const { data } = await apiClient.get<User>("/auth/me/");
    return data;
  },
};

// Categories API
export const categoriesApi = {
  list: async () => {
    const { data } = await apiClient.get<Category[]>("/categories/");
    return data;
  },

  get: async (id: number) => {
    const { data } = await apiClient.get<Category>(`/categories/${id}/`);
    return data;
  },
};

// Notes API
export const notesApi = {
  list: async (categoryId?: number) => {
    const params = categoryId ? { category_id: categoryId } : {};
    const { data } = await apiClient.get<Note[]>("/notes/", { params });
    return data;
  },

  get: async (id: number) => {
    const { data } = await apiClient.get<Note>(`/notes/${id}/`);
    return data;
  },

  create: async (noteData: { title: string; content: string; category: number }) => {
    const { data } = await apiClient.post<Note>("/notes/", noteData);
    return data;
  },

  update: async (id: number, noteData: Partial<{ title: string; content: string; category: number }>) => {
    const { data } = await apiClient.patch<Note>(`/notes/${id}/`, noteData);
    return data;
  },

  delete: async (id: number) => {
    await apiClient.delete(`/notes/${id}/`);
  },
};

