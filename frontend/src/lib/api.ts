import axios from "axios";

// Lấy token từ localStorage nếu có
const token = localStorage.getItem("token");

const api = axios.create({
  baseURL: "http://localhost:5001/api",
  headers: {
    "Content-Type": "application/json",
    // Nếu có token, tự động gắn vào header cho mọi request
    Authorization: token ? `Bearer ${token}` : "",
  },
});

// Interceptor để cập nhật token trong header mỗi khi nó thay đổi
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
