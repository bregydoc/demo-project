/**
 * API client configuration using axios.
 * Handles authentication with session cookies.
 */
import axios from "axios";

// Get API URL from environment variable
// NOTE: NEXT_PUBLIC_* variables are embedded at BUILD TIME, not runtime
// If you set this variable after building, you MUST rebuild the app
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:8000/api"
    : "");

// Log the API URL being used (for debugging)
if (typeof window !== "undefined") {
  console.log("🔗 API Base URL:", API_URL || "(empty - using relative URLs)");
  console.log(
    "🔗 NEXT_PUBLIC_API_URL:",
    process.env.NEXT_PUBLIC_API_URL || "(not set)"
  );
}

// Warn if API_URL is not set in production
if (
  typeof window !== "undefined" &&
  !API_URL &&
  window.location.hostname !== "localhost"
) {
  console.error(
    "❌ NEXT_PUBLIC_API_URL is not set! API requests will fail.",
    "\n📝 Please:",
    "\n   1. Set NEXT_PUBLIC_API_URL in Railway to your backend URL",
    "\n   2. Trigger a rebuild/redeploy of the frontend service",
    "\n   3. Example: https://your-backend.railway.app/api"
  );
}

// Add request interceptor to validate API URL before making requests
const validateApiUrl = (config: any) => {
  if (
    !config.baseURL &&
    typeof window !== "undefined" &&
    window.location.hostname !== "localhost"
  ) {
    const errorMsg =
      "❌ API URL not configured! NEXT_PUBLIC_API_URL must be set and app must be rebuilt.\n" +
      "Current request will fail: " +
      config.url;
    console.error(errorMsg);
    throw new Error(
      "API URL not configured. Please set NEXT_PUBLIC_API_URL and rebuild."
    );
  }
  return config;
};

export const apiClient = axios.create({
  baseURL: API_URL || undefined, // Use undefined instead of empty string
  withCredentials: true, // Include cookies for session auth
  headers: {
    "Content-Type": "application/json",
  },
});

// Add validation interceptor
apiClient.interceptors.request.use(validateApiUrl, (error) =>
  Promise.reject(error)
);

// Function to get CSRF token from cookies
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
}

// Fetch CSRF token before making authenticated requests
let csrfTokenPromise: Promise<string | null> | null = null;

async function ensureCsrfToken(): Promise<string | null> {
  // If we already have a pending request, wait for it
  if (csrfTokenPromise) {
    return csrfTokenPromise;
  }

  // Check if we already have the token in cookies
  const existingToken = getCookie("csrftoken");
  if (existingToken) {
    return existingToken;
  }

  // Fetch CSRF token using apiClient to ensure correct baseURL
  csrfTokenPromise = (async () => {
    try {
      // Use apiClient to ensure we use the correct baseURL (with /api prefix)
      const response = await apiClient.get("/auth/csrf/");
      // CSRF cookie is set automatically by Django
      return response.data.csrfToken || null;
    } catch (error) {
      console.warn("Failed to fetch CSRF token:", error);
      // Reset promise so we can try again later
      csrfTokenPromise = null;
      return null;
    }
  })();

  return csrfTokenPromise;
}

// Add CSRF token to all requests
apiClient.interceptors.request.use(async (config) => {
  // For POST/PUT/PATCH/DELETE requests, ensure we have CSRF token
  const method = config.method?.toUpperCase();
  if (method && ["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    await ensureCsrfToken();
  }

  const csrfToken = getCookie("csrftoken");
  if (csrfToken) {
    config.headers["X-CSRFToken"] = csrfToken;
  }
  return config;
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

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
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
    const { data } = await apiClient.get<PaginatedResponse<Category>>(
      "/categories/"
    );
    return data.results;
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
    const { data } = await apiClient.get<PaginatedResponse<Note>>("/notes/", {
      params,
    });
    return data.results;
  },

  get: async (id: number) => {
    const { data } = await apiClient.get<Note>(`/notes/${id}/`);
    return data;
  },

  create: async (noteData: {
    title: string;
    content: string;
    category: number;
  }) => {
    const { data } = await apiClient.post<Note>("/notes/", noteData);
    return data;
  },

  update: async (
    id: number,
    noteData: Partial<{ title: string; content: string; category: number }>
  ) => {
    const { data } = await apiClient.patch<Note>(`/notes/${id}/`, noteData);
    return data;
  },

  delete: async (id: number) => {
    await apiClient.delete(`/notes/${id}/`);
  },
};
