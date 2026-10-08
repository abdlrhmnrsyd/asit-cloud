import { apiClient } from "./client";
import { ApiResponse } from "../types/api";
import { AuthResponse, LoginCredentials, RegisterCredentials, User } from "../types/auth";

export const authApi = {
  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const res = await apiClient.post<ApiResponse<AuthResponse>>("/auth/register", credentials);
    return res.data.data;
  },

  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const res = await apiClient.post<ApiResponse<AuthResponse>>("/auth/login", credentials);
    return res.data.data;
  },

  getMe: async (): Promise<{ user: User }> => {
    const res = await apiClient.get<ApiResponse<{ user: User }>>("/auth/me");
    return res.data.data;
  },
};
