import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "../assets/styles/OrderConfirmation.css";
import {
  FaCheckCircle,
  FaShoppingBag,
  FaFileAlt,
  FaHome,
  FaTimes,
  FaExclamationTriangle,
} from "react-icons/fa";

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [orderInfo, setOrderInfo] = useState(location.state?.orderInfo);
  const [orderId, setOrderId] = useState(location.state?.orderId);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const formatPrice = (price) => {
    return price?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
  };

  const isTransferPayment = orderInfo?.paymentMethod === "BANK_TRANSFER";

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });

    setTimeout(() => {
      setToast((prevToast) => ({ ...prevToast, show: false }));
    }, 3000);
  };

  const handleCancelOrder = async () => {
    try {
      setCancelLoading(true);

      const token = localStorage.getItem("token");
      if (!token) {
        showToast("Vui lòng đăng nhập để thực hiện chức năng này", "error");
        navigate("/login");
        return;
      }

      await axios.put(
        `https://phone-selling-app-mw21.onrender.com/api/v1/order/customer/cancel/${orderId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setOrderInfo((prev) => ({
        ...prev,
        status: "CANCELLED",
      }));

      setShowCancelModal(false);
      showToast("Hủy đơn hàng thành công!", "success");
    } catch (error) {
      console.error("Lỗi khi hủy đơn hàng:", error);

      if (error.response && error.response.data) {
        showToast(
          `Lỗi: ${
            error.response.data.meta?.message || "Không thể hủy đơn hàng"
          }`,
          "error"
        );
      } else {
        showToast(
          "Có lỗi xảy ra khi hủy đơn hàng. Vui lòng thử lại sau.",
          "error"
        );
      }
    } finally {
      setCancelLoading(false);
    }
  };

  useEffect(() => {
    if (!orderInfo && !orderId) {
      navigate("/");
    }

    window.scrollTo(0, 0);
  }, [orderInfo, orderId, navigate]);

  return (
    <>
      <div className="order-success-container">
        <div className="order-success-header">
          <div className="order-icon">
            <FaShoppingBag />
          </div>
          <h1>ĐẶT HÀNG THÀNH CÔNG</h1>
        </div>

        <div className="order-success-content">
          <div className="thank-you-section">
            <p className="thank-you-message">
              Cảm ơn Quý khách {orderInfo?.receiveName || "Quý khách"} đã cho
              Thế Giới Di Động cơ hội được phục vụ
            </p>
          </div>

          <div className="order-info-box">
            <div className="order-info-header">
              <span className="order-label">ĐƠN HÀNG: #{orderId}</span>
              <div className="order-actions">
                <span
                  className="action-link"
                  onClick={() => navigate("/orders")}
                >
                  Quản lý đơn hàng
                </span>
                {orderInfo?.status !== "CANCELLED" && (
                  <span
                    className="action-link cancel"
                    onClick={() => setShowCancelModal(true)}
                  >
                    Hủy
                  </span>
                )}
                {orderInfo?.status === "CANCELLED" && (
                  <span className="status-tag cancelled">Đã hủy</span>
                )}
              </div>
            </div>

            <ul className="order-details-list">
              <li className="order-detail-item">
                <span className="detail-bullet">•</span>
                <span className="detail-label">Người nhận hàng:</span>
                <span className="detail-value">
                  {orderInfo?.receiveName || ""}, {orderInfo?.phone || ""}
                </span>
              </li>

              {orderInfo?.receiveMethod === "DELIVERY" && (
                <li className="order-detail-item">
                  <span className="detail-bullet">•</span>
                  <span className="detail-label">Giao đến:</span>
                  <span className="detail-value">
                    {orderInfo?.address || ""} (nhân viên sẽ gọi xác nhận trước
                    khi giao)
                  </span>
                </li>
              )}

              {orderInfo?.receiveMethod === "PICKUP" && (
                <li className="order-detail-item">
                  <span className="detail-bullet">•</span>
                  <span className="detail-label">Nhận tại:</span>
                  <span className="detail-value">
                    Siêu thị Thế Giới Di Động gần nhất (nhân viên sẽ gọi xác
                    nhận)
                  </span>
                </li>
              )}
              <li className="order-detail-item total-amount">
                <span className="detail-bullet">•</span>
                <span className="detail-label">Tổng tiền:</span>
                <span className="detail-value highlight">
                  {formatPrice(orderInfo?.totalPrice || 0)}
                </span>
              </li>
            </ul>
          </div>

          {orderInfo?.status === "CANCELLED" ? (
            <div className="order-cancelled-banner">Đơn hàng đã bị hủy</div>
          ) : (
            isTransferPayment && (
              <div className="payment-status-banner">
                Đơn hàng chưa được thanh toán
              </div>
            )
          )}

          <div className="payment-method-info">
            <span className="payment-method-label">Hình thức thanh toán:</span>
            <span className="payment-method-value">
              {orderInfo?.paymentMethod === "CASH" &&
                "Thanh toán khi nhận hàng"}
              {orderInfo?.paymentMethod === "BANK_TRANSFER" &&
                "Thanh toán tại siêu thị gần nhất"}
              {orderInfo?.paymentMethod === "MOMO" && "Thanh toán qua ví MoMo"}
            </span>
          </div>

          <div className="order-actions-footer">
            <button
              className="action-button home"
              onClick={() => navigate("/")}
            >
              <FaHome className="action-icon" />
              Về trang chủ
            </button>
            <button
              className="action-button orders"
              onClick={() => navigate("/orders")}
            >
              <FaFileAlt className="action-icon" />
              Xem đơn hàng
            </button>
          </div>
        </div>
      </div>

      {/* Modal xác nhận hủy đơn hàng */}
      {showCancelModal && (
        <div className="modal-overlay">
          <div className="cancel-modal">
            <div className="cancel-modal-header">
              <FaExclamationTriangle className="warning-icon" />
              <h3>Xác nhận hủy đơn hàng</h3>
              <button
                className="close-modal-btn"
                onClick={() => setShowCancelModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            <div className="cancel-modal-body">
              <p>Bạn có chắc chắn muốn hủy đơn hàng #{orderId} không?</p>
              <p className="cancel-warning">
                Lưu ý: Hành động này không thể hoàn tác sau khi xác nhận.
              </p>
            </div>
            <div className="cancel-modal-footer">
              <button
                className="cancel-button"
                onClick={handleCancelOrder}
                disabled={cancelLoading}
              >
                {cancelLoading ? "Đang xử lý..." : "Xác nhận hủy"}
              </button>
              <button
                className="back-button"
                onClick={() => setShowCancelModal(false)}
                disabled={cancelLoading}
              >
                Quay lại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast notification */}
      {toast.show && (
        <div className={`toast-notification ${toast.type}`}>
          <div className="toast-content">
            {toast.type === "success" && (
              <FaCheckCircle className="toast-icon" />
            )}
            {toast.type === "error" && (
              <FaExclamationTriangle className="toast-icon" />
            )}
            <span className="toast-message">{toast.message}</span>
          </div>
          <button
            className="toast-close"
            onClick={() => setToast((prev) => ({ ...prev, show: false }))}
          >
            <FaTimes />
          </button>
        </div>
      )}
    </>
  );
};

export default OrderConfirmation;
