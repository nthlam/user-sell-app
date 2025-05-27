import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MdOutlineVisibility, MdOutlineVisibilityOff } from "react-icons/md";
import { FaCheckCircle } from "react-icons/fa";
import "../assets/styles/loginpage.css";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import axios from "axios";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [isAlreadyLoggedIn, setIsAlreadyLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAlreadyLoggedIn(true);
    }
  }, []);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async () => {
    setError("");

    if (!email) {
      setError("Vui lòng nhập email");
      return;
    }

    if (!validateEmail(email)) {
      setError("Email không hợp lệ");
      return;
    }

    if (!password) {
      setError("Vui lòng nhập mật khẩu");
      return;
    }

    try {
      setIsLoading(true);

      const response = await axios.post(
        "https://phone-selling-app-mw21.onrender.com/api/v1/auth/customer-login",
        {
          email,
          password,
        }
      );

      if (
        response.data &&
        response.data.meta &&
        response.data.meta.code === 200
      ) {
        localStorage.setItem("token", response.data.data.token);

        if (response.data.data.user) {
          localStorage.setItem(
            "userInfo",
            JSON.stringify(response.data.data.user)
          );
        }

        setToast({
          show: true,
          message: "Đăng nhập thành công! Đang chuyển hướng...",
          type: "success",
        });

        setTimeout(() => {
          navigate("/");
        }, 1000);
      } else {
        setError(response.data?.meta?.message || "Đăng nhập không thành công");
      }
    } catch (err) {
      console.error("Login error:", err);

      if (err.response) {
        const errorMessage =
          err.response.data?.meta?.message ||
          err.response.data?.message ||
          "Email hoặc mật khẩu không chính xác";

        if (errorMessage.includes("User not found")) {
          setError("Không tìm thấy tài khoản với email này");
        } else if (errorMessage.includes("Invalid credentials")) {
          setError("Mật khẩu không chính xác");
        } else if (errorMessage.includes("Invalid email")) {
          setError("Email không hợp lệ");
        } else if (errorMessage.includes("Account locked")) {
          setError("Tài khoản đã bị khóa. Vui lòng liên hệ hỗ trợ");
        } else {
          setError(errorMessage);
        }
      } else if (err.request) {
        setError("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
      } else {
        setError("Có lỗi xảy ra. Vui lòng thử lại.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleForgotPassword = () => {
    navigate("/forgot-password");
  };

  const goToRegister = () => {
    navigate("/register");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
    setIsAlreadyLoggedIn(false);
  };

  const goToHome = () => {
    navigate("/");
  };

  if (isAlreadyLoggedIn) {
    return (
      <div className="login-page">
        <div className="main-content">
          <div className="login-form">
            <h2>Bạn đã đăng nhập</h2>
            <p>Bạn đã đăng nhập vào hệ thống.</p>
            <div className="button-group">
              <button className="primary-btn" onClick={goToHome}>
                Về trang chủ
              </button>
              <button className="secondary-btn" onClick={handleLogout}>
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="login-page">
      <Header />
      <div className="main-content">
        <div className="illustration">
          <img src="../img/TGDD-540x270.png" alt="Illustration" />
        </div>
        <div className="login-form">
          <h2>Đăng nhập</h2>

          {/* Toast thông báo */}
          {toast.show && (
            <div className={`toast-notification ${toast.type}`}>
              {toast.type === "success" && (
                <FaCheckCircle className="toast-icon" />
              )}
              <span>{toast.message}</span>
            </div>
          )}

          <div className="input-group">
            <label htmlFor="email">Email</label>
            <div className="input-with-icon">
              <input
                type="email"
                id="email"
                placeholder="Nhập email của bạn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div className="input-group password-group">
            <label htmlFor="password">Mật khẩu</label>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              data-lpignore="true"
            />
            <button
              type="button"
              className="toggle-password"
              onClick={toggleShowPassword}
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              {showPassword ? (
                <MdOutlineVisibilityOff />
              ) : (
                <MdOutlineVisibility />
              )}
            </button>
          </div>
          {error && <p className="error-message">{error}</p>}

          <div className="forgot-password">
            <span onClick={handleForgotPassword}>Quên mật khẩu?</span>
          </div>

          <button
            className={`login-btn ${isLoading ? "loading" : ""}`}
            onClick={handleSubmit}
            disabled={isLoading || toast.show}
          >
            {isLoading ? "ĐANG ĐĂNG NHẬP..." : "ĐĂNG NHẬP"}
          </button>

          <div className="register-link">
            <p>
              Bạn chưa có tài khoản? <span onClick={goToRegister}>Đăng ký</span>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LoginPage;
