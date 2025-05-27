import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import CartPage from '../pages/CartPage';
import RegisterPage from '../pages/RegisterPage';
import OrderConfirmation from '../pages/OrderConfirmation';
import ProductDetailPage from '../pages/ProductDetailPage';
import PaymentResult from '../pages/PaymentResult';
import ProfilePage from '../pages/ProfilePage';

// Định nghĩa router trực tiếp để dễ debug
const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'order-confirmation', element: <OrderConfirmation /> },
      { path: 'payment-result', element: <PaymentResult /> },
      { path: 'product/:productId', element: <ProductDetailPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: '*', element: <Navigate to="/" replace /> }
    ],
  },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
]);

const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;