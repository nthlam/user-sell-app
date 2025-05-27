import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa';
import '../../assets/styles/Footer.css';

const Footer = () => {
  return (
    <footer className="main-footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>Tech Shop</h3>
          <p>Cửa hàng bán đồ công nghệ chất lượng cao với giá cả hợp lý</p>
          <div className="social-icons">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <FaFacebook />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <FaTwitter />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <FaInstagram />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">
              <FaYoutube />
            </a>
          </div>
        </div>

        <div className="footer-section">
          <h3>Liên kết nhanh</h3>
          <ul>
            <li><Link to="/">Trang chủ</Link></li>
            <li><Link to="/products">Sản phẩm</Link></li>
            <li><Link to="/about">Giới thiệu</Link></li>
            <li><Link to="/contact">Liên hệ</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Danh mục sản phẩm</h3>
          <ul>
            <li><Link to="/products/category/dien-thoai">Điện thoại</Link></li>
            <li><Link to="/products/category/laptop">Laptop</Link></li>
            <li><Link to="/products/category/may-tinh-bang">Máy tính bảng</Link></li>
            <li><Link to="/products/category/phu-kien">Phụ kiện</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Thông tin liên hệ</h3>
          <p>Địa chỉ: 123 Đường Công Nghệ, Quận 9, TP.HCM</p>
          <p>Email: support@techshop.com</p>
          <p>Số điện thoại: 0123.456.789</p>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Tech Shop. Tất cả các quyền được bảo lưu.</p>
      </div>
    </footer>
  );
};

export default Footer;
