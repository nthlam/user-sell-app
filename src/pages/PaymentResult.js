import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import '../assets/styles/PaymentResult.css';

const PaymentResult = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orderCreated, setOrderCreated] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Lấy query params từ URL
        const queryParams = new URLSearchParams(location.search);
        const paymentMethod = queryParams.get('paymentMethod');
        
        if (paymentMethod === 'zalopay') {
          // Xử lý kết quả thanh toán ZaloPay
          await verifyZaloPayment();
        } else {
          // Xử lý kết quả thanh toán VNPay (code hiện tại)
          await verifyVnPayment();
        }
      } catch (error) {
        console.error("Lỗi khi kiểm tra thanh toán:", error);
        setResult({
          message: "Có lỗi xảy ra khi xử lý kết quả thanh toán",
          success: false
        });
        setLoading(false);
      }
    };
    
    const verifyZaloPayment = async () => {
      try {
        const pendingOrder = JSON.parse(localStorage.getItem("pendingOrder"));
        
        if (!pendingOrder || !pendingOrder.zpTransToken) {
          throw new Error("Không tìm thấy thông tin thanh toán");
        }
        
        // Gọi API kiểm tra trạng thái thanh toán ZaloPay
        const response = await axios.get("https://onlinepay.onrender.com/zalo/query", {
          params: { zpTransToken: pendingOrder.zpTransToken }
        });
        
        if (response.data && response.data.return_code === 1) {
          // Thanh toán thành công
          setResult({
            message: "Thanh toán thành công",
            success: true,
            data: response.data
          });
          
          // Tạo đơn hàng với ZaloPay
          await createOrder();
        } else {
          // Thanh toán thất bại
          setResult({
            message: response.data?.return_message || "Thanh toán thất bại",
            success: false,
            data: response.data
          });
        }
      } catch (error) {
        console.error("Lỗi khi xác minh thanh toán ZaloPay:", error);
        setResult({
          message: "Không thể xác minh kết quả thanh toán",
          success: false
        });
      } finally {
        setLoading(false);
      }
    };
    
    const verifyVnPayment = async () => {
      try {
        // Lấy query params từ URL
        const queryParams = new URLSearchParams(location.search);
        
        // Kiểm tra kết quả thanh toán với onlinepay server
        const response = await axios.get('https://onlinepay.onrender.com/vnpay/verify-payment', {
          params: Object.fromEntries(queryParams)
        });
        
        if (response.data && response.data.success) {
          setResult({
            message: "Thanh toán thành công",
            success: true,
            data: response.data
          });
          
          // Nếu thanh toán thành công, tạo đơn hàng
          await createOrder();
        } else {
          setResult({
            message: response.data?.message || "Thanh toán thất bại",
            success: false,
            data: response.data
          });
        }
      } catch (error) {
        console.error("Lỗi khi kiểm tra thanh toán:", error);
        setResult({
          message: "Có lỗi xảy ra khi xử lý kết quả thanh toán",
          success: false
        });
      } finally {
        setLoading(false);
      }
    };
    
    const createOrder = async () => {
      try {
        const token = localStorage.getItem("token");
        const pendingOrderData = JSON.parse(localStorage.getItem("pendingOrder"));
        
        if (!token || !pendingOrderData) {
          throw new Error("Không tìm thấy thông tin đơn hàng hoặc phiên đăng nhập");
        }

        // Tạo đơn hàng với thông tin thanh toán
        const orderData = {
          shippingInfoId: pendingOrderData.shippingInfoId,
          paymentMethod: pendingOrderData.paymentMethod,
          receiveMethod: pendingOrderData.receiveMethod,
          note: pendingOrderData.note,
          selectedProductIds: pendingOrderData.selectedProductIds,
          transaction: {
            provider: "vnpay",
            transactionId: new URLSearchParams(location.search).get("vnp_TransactionNo"),
            amount: pendingOrderData.amount
          }
        };
        
        const response = await axios.post(
          "https://phone-selling-app-mw21.onrender.com/api/v1/order/customer/create-from-cart",
          orderData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        if (response.data && response.data.data) {
          setOrderCreated(true);
          localStorage.removeItem("pendingOrder"); // Xóa thông tin đơn hàng đã xử lý
        }
      } catch (error) {
        console.error("Lỗi khi tạo đơn hàng:", error);
        setResult(prev => ({
          ...prev,
          message: "Thanh toán thành công nhưng không thể tạo đơn hàng. Vui lòng liên hệ hỗ trợ."
        }));
      }
    };
    
    verifyPayment();
  }, [location.search, navigate]);
  
  if (loading) {
    return (
      <div className="payment-result-container">
        <div className="payment-result-card loading">
          <div className="loading-spinner"></div>
          <h2>Đang xử lý kết quả thanh toán...</h2>
          <p>Vui lòng đợi trong giây lát</p>
        </div>
      </div>
    );
  }
  
  const isSuccess = result?.success;
  
  return (
    <div className="payment-result-container">
      <div className={`payment-result-card ${isSuccess ? 'success' : 'failure'}`}>
        {isSuccess ? (
          <FaCheckCircle className="result-icon success" />
        ) : (
          <FaTimesCircle className="result-icon failure" />
        )}
        
        <h2>{isSuccess ? "Thanh toán thành công!" : "Thanh toán thất bại!"}</h2>
        
        {isSuccess && (
          <div className="payment-details">
            {result.data && (
              <>
                <p>Mã giao dịch: {result.data.zp_trans_id || result.data.app_trans_id}</p>
                {orderCreated && <p className="order-created">Đơn hàng của bạn đã được tạo thành công!</p>}
              </>
            )}
          </div>
        )}
        
        {!isSuccess && (
          <p className="failure-message">
            {result?.message || "Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại."}
          </p>
        )}
        
        <div className="action-buttons">
          <button className="primary-button" onClick={() => navigate('/')}>
            Về trang chủ
          </button>
          {isSuccess && (
            <button className="secondary-button" onClick={() => navigate('/orders')}>
              Xem đơn hàng
            </button>
          )}
          {!isSuccess && (
            <button className="secondary-button" onClick={() => navigate('/cart')}>
              Quay lại giỏ hàng
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentResult;