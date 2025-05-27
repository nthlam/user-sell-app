import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import TawkChat from '../TawkChat';
import '../../assets/styles/MainLayout.css';

const MainLayout = () => {
  return (
    <div className="main-layout">
      <Header />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
      <TawkChat />
    </div>
  );
};

export default MainLayout;
