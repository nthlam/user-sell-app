import axios from 'axios';

// Tạo instance axios với cấu hình cơ bản
const api = axios.create({
  // baseURL sẽ được cập nhật khi bạn cung cấp endpoint API backend
  baseURL: '',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor cho requests
api.interceptors.request.use(
  (config) => {
    // Lấy token từ localStorage
    const token = localStorage.getItem('token');
    // Nếu có token, thêm vào header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor cho responses
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Xử lý lỗi 401 Unauthorized
    if (error.response && error.response.status === 401) {
      // Xóa token nếu hết hạn hoặc không hợp lệ
      localStorage.removeItem('token');
      // Có thể chuyển hướng đến trang đăng nhập (tùy theo cấu trúc routing)
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
