// frontend/src/features/authentication/types.ts

// Kiểu dữ liệu cho form đăng nhập
export interface LoginCredentials {
  email: string;
  password: string;
}

// Kiểu dữ liệu cho form đăng ký
// Kế thừa từ LoginCredentials và thêm fullName
export interface RegisterData extends LoginCredentials {
  fullName: string;
}

// (Tùy chọn) Kiểu dữ liệu cho người dùng sau khi xác thực
export interface User {
  id: string;
  fullName: string;
  email: string;
  // Thêm các trường khác nếu cần
}
