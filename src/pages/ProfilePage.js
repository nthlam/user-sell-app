import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaStar } from 'react-icons/fa';
import '../assets/styles/ProfilePage.css';

const API_URL = 'https://phone-selling-app-mw21.onrender.com';

const ProfilePage = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // For editing name
  const [isEditingName, setIsEditingName] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [nameChangeSuccess, setNameChangeSuccess] = useState(false);
  const [nameChangeError, setNameChangeError] = useState(null);
  
  // For changing password
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);
  const [passwordChangeError, setPasswordChangeError] = useState(null);
  
  // Active tab
  const [activeTab, setActiveTab] = useState('profile');
  const location = useLocation();
  const navigate = useNavigate();
  
  // Review permissions state
  const [reviewPermissions, setReviewPermissions] = useState([]);
  const [loadingReviewPermissions, setLoadingReviewPermissions] = useState(false);
  const [reviewPermissionsError, setReviewPermissionsError] = useState(null);
  
  // Review modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [reviewContent, setReviewContent] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSubmitError, setReviewSubmitError] = useState(null);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  
  // Orders state
  const [customerOrders, setCustomerOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState(null);
  
  // Parse tab from URL query parameter
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get('tab');
    if (tabParam && ['profile', 'security', 'orders', 'reviews'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [location.search]);
  
  // Update URL when tab changes
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/profile?tab=${tab}`, { replace: true });
  };
  
  useEffect(() => {
    if (isAuthenticated) {
      fetchUserProfile();
      
      // Fetch data based on active tab
      if (activeTab === 'reviews') {
        fetchReviewPermissions();
      } else if (activeTab === 'orders') {
        fetchCustomerOrders();
      }
    }
  }, [isAuthenticated, activeTab]);
  
  // Function to fetch customer orders
  const fetchCustomerOrders = async () => {
    setLoadingOrders(true);
    setOrdersError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setOrdersError('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
        setLoadingOrders(false);
        return;
      }
      
      const response = await axios.get(`${API_URL}/api/v1/order/customer`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data && response.data.data) {
        setCustomerOrders(response.data.data);
      } else {
        setCustomerOrders([]);
      }
    } catch (err) {
      console.error('Error fetching customer orders:', err);
      setOrdersError('Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.');
    } finally {
      setLoadingOrders(false);
    }
  };
  
  // Open review modal for a product
  const openReviewModal = (product) => {
    setSelectedProduct(product);
    setRating(0);
    setHover(0);
    setReviewContent('');
    setReviewSubmitError(null);
    setReviewSuccess(false);
    setShowReviewModal(true);
  };
  
  // Close review modal
  const closeReviewModal = () => {
    setShowReviewModal(false);
    // Reset after a short delay to allow for fade-out animation
    setTimeout(() => {
      setSelectedProduct(null);
      setRating(0);
      setHover(0);
      setReviewContent('');
      setReviewSubmitError(null);
    }, 300);
  };
  
  // Submit a product review
  const submitReview = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setReviewSubmitError('Vui lòng chọn số sao đánh giá');
      return;
    }
    
    if (!reviewContent.trim()) {
      setReviewSubmitError('Vui lòng nhập nội dung đánh giá');
      return;
    }
    
    setSubmittingReview(true);
    setReviewSubmitError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setReviewSubmitError('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
        setSubmittingReview(false);
        return;
      }
      
      // Log information for debugging
      console.log('Sending review with permission ID:', selectedProduct.id);
      console.log('Selected product:', selectedProduct);
      console.log('Token being used:', token);
      
      // Try with the original format
      const response = await axios.post(`${API_URL}/api/v1/product/review`, {
        reviewPermissionId: selectedProduct.id,
        rating: rating,
        content: reviewContent
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Review submitted successfully:', response.data);
      setReviewSuccess(true);
      
      // Remove the reviewed product from the list
      setReviewPermissions(prevPermissions => 
        prevPermissions.filter(item => item.id !== selectedProduct.id)
      );
      
      // Close modal after showing success message
      setTimeout(() => {
        closeReviewModal();
      }, 2000);
      
    } catch (err) {
      console.error('Error submitting review:', err);
      setReviewSubmitError(
        err.response?.data?.meta?.message || 
        'Không thể gửi đánh giá. Vui lòng thử lại sau.'
      );
    } finally {
      setSubmittingReview(false);
    }
  };
  
  // Function to fetch products that need reviews
  const fetchReviewPermissions = async () => {
    setLoadingReviewPermissions(true);
    setReviewPermissionsError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setReviewPermissionsError('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
        setLoadingReviewPermissions(false);
        return;
      }
      
      const response = await axios.get(`${API_URL}/api/v1/review-permission`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data && response.data.data) {
        setReviewPermissions(response.data.data);
      } else {
        setReviewPermissions([]);
      }
    } catch (err) {
      console.error('Error fetching review permissions:', err);
      setReviewPermissionsError('Không thể tải danh sách sản phẩm cần đánh giá. Vui lòng thử lại sau.');
    } finally {
      setLoadingReviewPermissions(false);
    }
  };
  
  const fetchUserProfile = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/v1/user/personal`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data && response.data.data) {
        setUserProfile(response.data.data);
        setNewFullName(response.data.data.fullName || '');
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError('Không thể tải thông tin người dùng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleNameChange = async (e) => {
    e.preventDefault();
    setNameChangeError(null);
    setNameChangeSuccess(false);
    
    if (!newFullName.trim()) {
      setNameChangeError('Vui lòng nhập tên đầy đủ');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/v1/user/personal/rename`,
        { fullName: newFullName },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data && response.data.data) {
        setUserProfile(response.data.data);
        setNameChangeSuccess(true);
        setIsEditingName(false);
      }
    } catch (err) {
      console.error('Error updating name:', err);
      // setNameChangeError(err.response?.data?.message || 'Không thể cập nhật tên. Vui lòng thử lại sau.');
    }
  };
  
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordChangeError(null);
    setPasswordChangeSuccess(false);
    
    // Check for token
    const token = localStorage.getItem('token');
    if (!token) {
      setPasswordChangeError('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
      return;
    }
    
    if (!oldPassword) {
      setPasswordChangeError('Vui lòng nhập mật khẩu hiện tại');
      return;
    }
    
    if (!newPassword) {
      setPasswordChangeError('Vui lòng nhập mật khẩu mới');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordChangeError('Mật khẩu mới không khớp');
      return;
    }
    
    // Log request details for debugging
    console.log('Token exists:', !!token);
    console.log('Request data:', { oldPassword, newPassword });
    
    try {
      // Make API request
      const response = await axios.post(
        `${API_URL}/api/v1/user/personal/change-password`,
        {
          oldPassword,
          newPassword
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Log successful response
      console.log('Password change response:', response.data);
      
      if (response.data && response.data.data) {
        setPasswordChangeSuccess(true);
        setIsChangingPassword(false);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      console.error('Error changing password:', err);
      console.log('Error details:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        message: err.message
      });
      
      setPasswordChangeError(err.response?.data?.message || 'Đã cập nhật mật khẩu. ');
    }
  };
  
  if (!isAuthenticated) {
    return (
      <div className="profile-page">
        <div className="not-authenticated">
          <h2>Vui lòng đăng nhập để xem thông tin tài khoản</h2>
          <a href="/login" className="login-link">Đăng nhập ngay</a>
        </div>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="profile-page">
        <div className="loading">Đang tải thông tin...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="profile-page">
        <div className="error">{error}</div>
      </div>
    );
  }
  
  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-sidebar">
          <div className="user-avatar">
            <div className="avatar-circle">
              {userProfile?.fullName?.charAt(0) || 'U'}
            </div>
            <div className="user-name">{userProfile?.fullName || 'Người dùng'}</div>
            <div className="user-email">{userProfile?.email || ''}</div>
          </div>
          
          <div className="profile-menu">
            <button 
              className={`menu-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => handleTabChange('profile')}
            >
              Thông tin tài khoản
            </button>
            <button 
              className={`menu-item ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => handleTabChange('security')}
            >
              Đổi mật khẩu 
            </button>
            <button 
              className={`menu-item ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => handleTabChange('orders')}
            >
              Đơn hàng của tôi
            </button>
            <button 
              className={`menu-item ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => handleTabChange('reviews')}
            >
              Đánh giá sản phẩm
            </button>
          </div>
        </div>
        
        <div className="profile-content">
          {activeTab === 'profile' && (
            <div className="profile-tab">
              <h2>Thông tin tài khoản</h2>
              <div className="profile-info">
                <div className="info-group">
                  <label>Email:</label>
                  <div className="info-value">{userProfile?.email || 'Chưa có thông tin'}</div>
                </div>
                
                <div className="info-group">
                  <label>Họ và tên:</label>
                  {isEditingName ? (
                    <form onSubmit={handleNameChange} className="edit-form">
                      <input 
                        type="text" 
                        value={newFullName} 
                        onChange={(e) => setNewFullName(e.target.value)}
                        className="edit-input"
                        placeholder="Nhập tên đầy đủ của bạn"
                      />
                      {nameChangeError && <div className="form-error">{nameChangeError}</div>}
                      <div className="form-actions">
                        <button type="submit" className="save-btn">Lưu</button>
                        <button 
                          type="button" 
                          className="cancel-btn"
                          onClick={() => {
                            setIsEditingName(false);
                            setNewFullName(userProfile?.fullName || '');
                            setNameChangeError(null);
                          }}
                        >
                          Hủy
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="info-value-with-action">
                      <div className="info-value">{userProfile?.fullName || 'Chưa cập nhật'}</div>
                      <button className="edit-btn" onClick={() => setIsEditingName(true)}>
                        Chỉnh sửa
                      </button>
                    </div>
                  )}
                  {nameChangeSuccess && (
                    <div className="success-message">Cập nhật tên thành công!</div>
                  )}
                </div>
                
                <div className="info-group">
                  <label>Vai trò:</label>
                  <div className="info-value">{userProfile?.role?.name || 'Người dùng'}</div>
                </div>
                
                <div className="info-group">
                  <label>Trạng thái:</label>
                  <div className={`status-badge ${userProfile?.isActive ? 'active' : 'inactive'}`}>
                    {userProfile?.isActive ? 'Đang hoạt động' : 'Bị khóa'}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'security' && (
            <div className="security-tab">
              <h2> Đổi mật khẩu </h2>
              <div className="security-settings">
                <div className="password-section">
        
                  {passwordChangeSuccess && (
                    <div className="success-message">Đổi mật khẩu thành công!</div>
                  )}
                  <form onSubmit={handlePasswordChange} className="password-form">
                    <div className="form-group">
                      <label>Mật khẩu hiện tại:</label>
                      <input 
                        type="password" 
                        value={oldPassword} 
                        onChange={(e) => setOldPassword(e.target.value)}
                        placeholder="Nhập mật khẩu hiện tại"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Mật khẩu mới:</label>
                      <input 
                        type="password" 
                        value={newPassword} 
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Nhập mật khẩu mới"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Xác nhận mật khẩu mới:</label>
                      <input 
                        type="password" 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Nhập lại mật khẩu mới"
                      />
                    </div>
                    
                    {passwordChangeError && (
                      <div className="form-error">{passwordChangeError}</div>
                    )}
                    
                    <button type="submit" className="change-password-btn">
                      Cập nhật mật khẩu
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'orders' && (
            <div className="orders-tab">
              <h2>Đơn hàng của tôi</h2>
              
              {loadingOrders ? (
                <div className="loading-orders">Đang tải danh sách đơn hàng...</div>
              ) : ordersError ? (
                <div className="error-orders">{ordersError}</div>
              ) : customerOrders.length > 0 ? (
                <div className="orders-list">
                  {customerOrders.map((order) => (
                    <div key={order.id} className="order-card">
                      <div className="order-header">
                        <div className="order-info">
                          <div className="order-id">
                            <span className="label">Mã đơn hàng:</span> 
                            <span className="value">#{order.id}</span>
                          </div>
                          <div className="order-date">
                            <span className="label">Ngày đặt:</span> 
                            <span className="value">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                          </div>
                        </div>
                        <div className="order-status">
                          <span className={`status-badge ${order.status.toLowerCase()}`}>
                            {order.status === 'PENDING' && 'Chờ xác nhận'}
                            {order.status === 'CONFIRMED' && 'Đã xác nhận'}
                            {order.status === 'SHIPPING' && 'Đang giao hàng'}
                            {order.status === 'COMPLETED' && 'Đã giao hàng'}
                            {order.status === 'CANCELLED' && 'Đã hủy'}
                            {!['PENDING', 'CONFIRMED', 'SHIPPING', 'COMPLETED', 'CANCELLED'].includes(order.status) && order.status}
                          </span>
                        </div>
                      </div>
                      
                      <div className="order-items">
                        {order.orderItems.map((item) => (
                          <div key={item.id} className="order-item">
                            <div className="item-image">
                              <img 
                                src={item.image && item.image.base64 
                                  ? `data:image/jpeg;base64,${item.image.base64}` 
                                  : 'https://via.placeholder.com/80x80?text=No+Image'} 
                                alt={item.name} 
                              />
                            </div>
                            <div className="item-details">
                              <div className="item-name">{item.name}</div>
                              <div className="item-variant">{item.color}</div>
                              <div className="item-quantity">Số lượng: {item.quantity}</div>
                            </div>
                            <div className="item-price">
                              {item.price.toLocaleString('vi-VN')}đ
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="order-footer">
                        <div className="order-shipping">
                          <div className="shipping-info">
                            <strong>Thông tin giao hàng:</strong>
                            <p><span className="label">Người nhận:</span> {order.receiveName}</p>
                            <p><span className="label">SĐT:</span> {order.phone}</p>
                            <p><span className="label">Địa chỉ:</span> {order.address}</p>
                          </div>
                          <div className="payment-info">
                            <p><span className="label">Phương thức thanh toán:</span> {order.paymentMethod}</p>
                            <p><span className="label">Phương thức nhận hàng:</span> {order.receiveMethod}</p>
                            {order.note && <p><span className="label">Ghi chú:</span> {order.note}</p>}
                          </div>
                        </div>
                        
                        <div className="order-summary">
                          <div className="total-price">
                            <span className="label">Tổng tiền:</span>
                            <span className="price">{order.totalPrice.toLocaleString('vi-VN')}đ</span>
                          </div>
                          
                          {order.status === 'PENDING' && (
                            <button className="cancel-order-btn">
                              Hủy đơn hàng
                            </button>
                          )}
                          
                          {order.status === 'COMPLETED' && (
                            <button 
                              className="buy-again-btn"
                              onClick={() => navigate('/')}
                            >
                              Mua lại
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-orders">
                  <p>Bạn chưa có đơn hàng nào.</p>
                  <button className="shop-now-btn" onClick={() => navigate('/')}>
                    Mua sắm ngay
                  </button>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'reviews' && (
            <div className="reviews-tab">
              <h2>Đánh giá sản phẩm</h2>
              
              {loadingReviewPermissions ? (
                <div className="loading-reviews">Đang tải danh sách sản phẩm cần đánh giá...</div>
              ) : reviewPermissionsError ? (
                <div className="error-reviews">{reviewPermissionsError}</div>
              ) : reviewPermissions.length > 0 ? (
                <div className="review-permissions-list">
                  <p className="review-intro">Các sản phẩm sau đây đang chờ bạn đánh giá:</p>
                  
                  <div className="products-to-review">
                    {reviewPermissions.map((permission) => (
                      <div key={permission.id} className="product-review-card">
                        <div className="product-review-image">
                          <img 
                            src={permission.product.image && permission.product.image.base64 
                              ? `data:image/jpeg;base64,${permission.product.image.base64}` 
                              : 'https://via.placeholder.com/100x100?text=No+Image'} 
                            alt={permission.product.name} 
                          />
                        </div>
                        <div className="product-review-info">
                          <h3 className="product-review-name">{permission.product.name}</h3>
                          <div className="product-review-price">
                            <span className="current-price">
                              {permission.product.price?.toLocaleString('vi-VN')}đ
                            </span>
                            {permission.product.basePrice > permission.product.price && (
                              <span className="original-price">
                                {permission.product.basePrice?.toLocaleString('vi-VN')}đ
                              </span>
                            )}
                          </div>
                        </div>
                        <button 
                          className="write-review-btn"
                          onClick={() => openReviewModal(permission)}
                        >
                          Viết đánh giá
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="no-reviews-needed">
                  <p>Bạn không có sản phẩm nào cần đánh giá.</p>
                  <p>Khi bạn mua sản phẩm và nhận hàng thành công, bạn sẽ có thể đánh giá sản phẩm tại đây.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Review Modal */}
      {showReviewModal && (
        <div className="review-modal-overlay" onClick={closeReviewModal}>
          <div className="review-modal" onClick={(e) => e.stopPropagation()}>
            {reviewSuccess ? (
              <div className="review-success">
                <div className="success-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M8 12l2 2 4-4"></path>
                  </svg>
                </div>
                <h3>Cảm ơn bạn đã đánh giá!</h3>
                <p>Đánh giá của bạn đã được ghi nhận thành công.</p>
              </div>
            ) : (
              <>
                <div className="review-modal-header">
                  <h3>Đánh giá sản phẩm</h3>
                  <button className="close-btn" onClick={closeReviewModal}>&times;</button>
                </div>
                
                {selectedProduct && (
                  <div className="review-product-info">
                    <div className="review-product-image">
                      <img 
                        src={selectedProduct.image && selectedProduct.image.base64 
                          ? `data:image/jpeg;base64,${selectedProduct.image.base64}` 
                          : 'https://via.placeholder.com/80x80?text=No+Image'} 
                        alt={selectedProduct.name} 
                      />
                    </div>
                    <div className="review-product-details">
                      <h4>{selectedProduct.name}</h4>
                      <p>{selectedProduct.variant || ''}</p>
                    </div>
                  </div>
                )}
                
                <form onSubmit={submitReview}>
                  <div className="rating-container">
                    <p>Đánh giá của bạn:</p>
                    <div className="star-rating">
                      {[...Array(5)].map((_, index) => {
                        const ratingValue = index + 1;
                        return (
                          <label key={index}>
                            <input 
                              type="radio" 
                              name="rating" 
                              value={ratingValue} 
                              onClick={() => setRating(ratingValue)}
                            />
                            <FaStar 
                              className="star" 
                              color={ratingValue <= (hover || rating) ? "#ffc107" : "#e4e5e9"}
                              size={30}
                              onMouseEnter={() => setHover(ratingValue)}
                              onMouseLeave={() => setHover(0)}
                            />
                          </label>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="review-content">
                    <label htmlFor="reviewContent">Nội dung đánh giá:</label>
                    <textarea 
                      id="reviewContent"
                      value={reviewContent}
                      onChange={(e) => setReviewContent(e.target.value)}
                      placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                      rows="4"
                    ></textarea>
                  </div>
                  
                  {reviewSubmitError && (
                    <div className="review-error">{reviewSubmitError}</div>
                  )}
                  
                  <div className="review-actions">
                    <button 
                      type="button" 
                      className="cancel-review-btn"
                      onClick={closeReviewModal}
                      disabled={submittingReview}
                    >
                      Hủy
                    </button>
                    <button 
                      type="submit" 
                      className="submit-review-btn"
                      disabled={submittingReview}
                    >
                      {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
