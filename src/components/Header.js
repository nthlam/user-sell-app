import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaShoppingCart,
  FaSignOutAlt,
  FaUserCircle,
  FaListAlt,
  FaCog,
} from "react-icons/fa";
import "../assets/styles/Header.css";

const Header = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Kiểm tra trạng thái đăng nhập mỗi khi component mount
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);

      // Lấy thông tin người dùng từ localStorage (nếu có)
      const userInfo = localStorage.getItem("userInfo");
      if (userInfo) {
        try {
          const parsedInfo = JSON.parse(userInfo);
          setUsername(parsedInfo.name || parsedInfo.email || "Tài khoản");
        } catch (error) {
          setUsername("Tài khoản");
        }
      } else {
        setUsername("Tài khoản");
      }
    } else {
      setIsLoggedIn(false);
      setUsername("");
    }
  }, []);

  // Thêm event listener để đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const goToCart = () => {
    navigate("/cart");
  };

  const goToLogin = () => {
    navigate("/login");
  };

  const handleLogout = () => {
    // Xóa token và thông tin người dùng
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");

    // Cập nhật state
    setIsLoggedIn(false);
    setUsername("");
    setShowDropdown(false);

    // Chuyển hướng về trang chủ
    navigate("/");
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const goToOrders = () => {
    navigate("/orders");
    setShowDropdown(false);
  };

  const goToAccount = () => {
    navigate("/account");
    setShowDropdown(false);
  };

  return (
    <div className="header">
      <div className="logo">
        <a href="/">
          <img src="./img/tgdd.png" alt="Logo" />
        </a>
      </div>

      <div className="search-bar">
        <input type="text" placeholder="Bạn tìm gì..." />
      </div>

      <div className="header-right">
        {isLoggedIn ? (
          <div className="user-account" ref={dropdownRef}>
            <div className="user-info" onClick={toggleDropdown}>
              <FaUserCircle className="user-icon" />
              <span className="username">{username}</span>
            </div>

            {showDropdown && (
              <div className="user-dropdown">
                <div className="dropdown-header"></div>
                <ul className="dropdown-menu">
                  <li className="dropdown-item logout" onClick={handleLogout}>
                    <FaSignOutAlt className="dropdown-icon" />
                    <span>Đăng xuất</span>
                  </li>
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="btn login-bn" onClick={goToLogin}>
            <FaUser className="btn-icon" />
            <p>Đăng nhập</p>
          </div>
        )}

        <div className="btn cart-btn" onClick={goToCart}>
          <FaShoppingCart className="btn-icon" />
          <p>Giỏ hàng</p>
        </div>
      </div>
    </div>
  );
};

export default Header;
