// src/features/authentication/services/authService.ts
import api from "../../../lib/api"; // Import instance đã cấu hình
import type { LoginCredentials, RegisterData } from "../../../types/types"; // (Sẽ tạo file types ở bước sau)

export const signIn = async (credentials: LoginCredentials) => {
  const response = await api.post("/auth/signin", credentials);
  return response.data;
};

export const register = async (data: RegisterData) => {
  const response = await api.post("/auth/register", data);
  return response.data;
};

export const socialSignIn = async (token: string) => {
  // Endpoint này bạn sẽ tạo ở backend sau
  const response = await api.post("/auth/social-signin", { idToken: token });
  return response.data;
};
