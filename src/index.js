import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import AppRouter from './routers/AppRouter';
import axios from 'axios';
import './assets/styles/index.css';

// Cấu hình mặc định cho axios
axios.defaults.baseURL = ''; // Sẽ cập nhật khi có endpoint API
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Tạm thời loại bỏ StrictMode để tránh gọi API hoặc render hai lần
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    <AppRouter />
  </Provider>
);