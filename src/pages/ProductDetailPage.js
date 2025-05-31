import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { fetchProductById } from '../redux/slices/productSlice';
import { fetchPromotionById, setCurrentPromotion, setShowPromotionModal } from '../redux/slices/promotionSlice';
import '../assets/styles/ProductDetailPage.css';
import { toast } from 'react-toastify';

// Import commitment icons
import camket1 from '../assets/images/camket1.jpeg';
import camket2 from '../assets/images/camket2.jpeg';
import camket3 from '../assets/images/camket3.jpeg';
import camket4 from '../assets/images/camket4.jpeg';
import newCusPromo from '../assets/images/new_cus.jpeg';

// API URL
const API_URL = 'https://phone-selling-app-mw21.onrender.com';

const ProductDetailPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentProduct, loading, error } = useSelector((state) => state.products);
  const { currentPromotion, loading: loadingPromotion, error: promotionError, showPromotionModal } = useSelector((state) => state.promotions);
  
  // Product state
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('specs');
  const [variantImages, setVariantImages] = useState([]);
  const [variants, setVariants] = useState([]);
  const [isLoadingVariants, setIsLoadingVariants] = useState(false);
  const [variantError, setVariantError] = useState(null);
  const [promotions, setPromotions] = useState([]);
  const [loadingPromotions, setLoadingPromotions] = useState(false);
  
  // Buy Now state
  const [showBuyNowModal, setShowBuyNowModal] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState(null);
  const [shippingAddresses, setShippingAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [showOrderSuccessModal, setShowOrderSuccessModal] = useState(false);
  const [lastOrderId, setLastOrderId] = useState(null);
  
  // Order details state
  const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loadingOrderDetails, setLoadingOrderDetails] = useState(false);
  const [orderDetailsError, setOrderDetailsError] = useState(null);
  
  // Order form state
  const [orderForm, setOrderForm] = useState({
    shippingInfoId: '',
    paymentMethod: 'CASH',
    receiveMethod: 'DELIVERY',
    note: ''
  });
  
  // Reviews state
  const [reviewsMeta, setReviewsMeta] = useState({
    totalElements: 0,
    totalPages: 0,
    currentPage: 1
  });
  
  // Cart state
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartMessage, setCartMessage] = useState(null);
  const [cartError, setCartError] = useState(null);
  const [showCartModal, setShowCartModal] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  
  // Reviews data
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState(null);
  const [reviewFilter, setReviewFilter] = useState(null); // filter by rating (1-5)
  const [averageRating, setAverageRating] = useState(0);
  
  // Countdown timer
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  
  // Cập nhật đồng hồ đếm ngược
  useEffect(() => {
    // Mặc định là 7 ngày từ hiện tại
    const defaultEndDate = new Date();
    defaultEndDate.setDate(defaultEndDate.getDate() + 7);
    
    // Lấy ngày hết hạn từ khuyến mãi đầu tiên hoặc dùng mặc định
    let endDate;
    if (currentProduct && currentProduct.promotions && currentProduct.promotions.length > 0 && currentProduct.promotions[0].endDate) {
      endDate = new Date(currentProduct.promotions[0].endDate);
    } else {
      endDate = defaultEndDate;
    }
    
    const updateCountdown = () => {
      const now = new Date();
      const timeDiff = endDate - now;
      
      if (timeDiff <= 0) {
        // Voucher đã hết hạn
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      
      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
      
      setCountdown({ days, hours, minutes, seconds });
    };
    
    // Cập nhật ngay lập tức và sau đó mỗi giây
    updateCountdown();
    const intervalId = setInterval(updateCountdown, 1000);
    
    return () => clearInterval(intervalId);
  }, [currentProduct]);
  
  // Sold count
  const [soldCount, setSoldCount] = useState(0);
  
  // Đã chuyển state của modal khuyến mãi sang Redux

  // Fetch product detail
  useEffect(() => {
    dispatch(fetchProductById(productId));
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, [dispatch, productId]);
  
  // Fetch product variants
  useEffect(() => {
    const fetchVariants = async () => {
      if (!productId) return;
      
      setIsLoadingVariants(true);
      try {
        const response = await axios.get(`${API_URL}/api/v1/variant/product/${productId}`);
        if (response.data && response.data.data) {
          // Convert to array if it's a single object
          const variantsData = Array.isArray(response.data.data) ? response.data.data : [response.data.data];
          setVariants(variantsData);
          
          // Set default selected variant
          if (variantsData.length > 0) {
            setSelectedVariant(variantsData[0]);
            
            // Set variant images
            if (variantsData[0].images && variantsData[0].images.length > 0) {
              setVariantImages(variantsData[0].images);
            }
          }
          
          // Get total sold count from first variant
          if (variantsData.length > 0 && variantsData[0].inventory) {
            setSoldCount(variantsData[0].inventory.sold || 0);
          }
        }
      } catch (error) {
        console.error('Error fetching variants:', error);
        setVariantError('Không thể tải biến thể sản phẩm');
      } finally {
        setIsLoadingVariants(false);
      }
    };
    
    fetchVariants();
  }, [productId]);
  
  // Fetch variant details when a variant is selected
  useEffect(() => {
    const fetchVariantDetails = async () => {
      if (!selectedVariant || !selectedVariant.id) return;
      
      try {
        const response = await axios.get(`${API_URL}/api/v1/variant/${selectedVariant.id}`);
        if (response.data && response.data.data) {
          const variantData = response.data.data;
          
          // Update variant images if available
          if (variantData.images && variantData.images.length > 0) {
            setVariantImages(variantData.images);
          }
          
          // Update inventory data
          if (variantData.inventory) {
            // Update the selected variant with inventory data
            setSelectedVariant(prev => ({
              ...prev,
              inventory: variantData.inventory
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching variant details:', error);
      }
    };
    
    fetchVariantDetails();
  }, [selectedVariant?.id]);
  
  // Fetch product reviews
  const fetchReviews = useCallback(async (page = 1, rating = null) => {
    if (!productId) return;
    
    setReviewsLoading(true);
    try {
      let url = `${API_URL}/api/v1/product/${productId}/review?page=${page}&size=10`;
      if (rating) {
        url += `&rating=${rating}`;
      }
      
      const response = await axios.get(url);
      if (response.data && response.data.data) {
        const reviewsData = response.data.data;
        setReviews(reviewsData.content || []);
        setReviewsMeta({
          totalElements: reviewsData.totalElements || 0,
          totalPages: reviewsData.totalPages || 0,
          currentPage: page
        });
        
        // Calculate average rating
        if (reviewsData.content && reviewsData.content.length > 0) {
          const totalRating = reviewsData.content.reduce((sum, review) => sum + (review.rating || 0), 0);
          const avgRating = totalRating / reviewsData.content.length;
          setAverageRating(avgRating);
        }
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviewsError('Không thể tải đánh giá sản phẩm');
    } finally {
      setReviewsLoading(false);
    }
  }, [productId]);
  
  // Load reviews when active tab changes to reviews
  useEffect(() => {
    if (activeTab === 'reviews') {
      fetchReviews(1, reviewFilter);
    }
  }, [activeTab, fetchReviews, reviewFilter]);

  if (loading) {
    return <div className="loading-container"><div className="loading">Đang tải thông tin sản phẩm...</div></div>;
  }

  if (error) {
    return <div className="error-container"><div className="error">Có lỗi xảy ra: {error}</div></div>;
  }

  if (!currentProduct) {
    return <div className="error-container"><div className="error">Không tìm thấy sản phẩm</div></div>;
  }

  // Xử lý hiển thị hình ảnh từ base64
  const renderProductImage = (image) => {
    if (image && image.base64) {
      return `data:image/jpeg;base64,${image.base64}`;
    } else if (image && typeof image === 'string') {
      return image;
    } else {
      return 'https://via.placeholder.com/500x500?text=No+Image';
    }
  };
  
  // Get image array for display
  const getDisplayImages = () => {
    // Tạo mảng chứa ảnh
    let images = [];
    
    // Thêm ảnh biến thể nếu có
    if (variantImages && variantImages.length > 0) {
      const variantImgs = variantImages.map(img => ({
        id: img.id || `variant-${Math.random().toString()}`,
        src: renderProductImage(img),
        isVariant: true
      }));
      images = [...images, ...variantImgs];
    }
    
    // Luôn thêm 3 ảnh sản phẩm (giống nhau)
    const productImageSrc = currentProduct && currentProduct.image ? renderProductImage(currentProduct.image) : 'https://via.placeholder.com/500x500?text=No+Image';
    const productImgs = [
      { id: 'product-1', src: productImageSrc, isProduct: true },
      { id: 'product-2', src: productImageSrc, isProduct: true },
      { id: 'product-3', src: productImageSrc, isProduct: true }
    ];
    images = [...images, ...productImgs];
    
    return images;
  };
  
  // Get current displayed image
  const getCurrentImage = () => {
    const images = getDisplayImages();
    return images.length > 0 ? images[Math.min(activeImageIndex, images.length - 1)].src : 'https://via.placeholder.com/500x500?text=No+Image';
  };
  
  // Handle thumbnail click
  const handleThumbnailClick = (index) => {
    setActiveImageIndex(index);
  };
  
  // Handle variant selection
  const handleVariantSelect = (variant) => {
    setSelectedVariant(variant);
    // Reset active image index when changing variant
    setActiveImageIndex(0);
  };
  
  // Handle review filter change
  const handleReviewFilterChange = (rating) => {
    setReviewFilter(rating === reviewFilter ? null : rating);
    fetchReviews(1, rating === reviewFilter ? null : rating);
  };
  
  // Kiểm tra đăng nhập
  const checkLogin = () => {
    const token = localStorage.getItem('token');
    return !!token;
  };
  
  // Thêm vào giỏ hàng
  const addToCart = async () => {
    if (!selectedVariant) {
      setCartError('Vui lòng chọn biến thể sản phẩm');
      return;
    }
    
    // Kiểm tra đăng nhập
    if (!checkLogin()) {
      // Lưu thông tin sản phẩm vào localStorage để có thể thêm vào giỏ sau khi đăng nhập
      localStorage.setItem('pendingCartItem', JSON.stringify({
        variantId: selectedVariant.id,
        quantity: quantity
      }));
      
      // Chuyển hướng đến trang đăng nhập
      navigate('/login', { state: { returnUrl: `/product/${productId}` } });
      return;
    }
    
    // Nếu đã đăng nhập, tiến hành thêm vào giỏ
    setAddingToCart(true);
    setCartError(null);
    setCartMessage(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/v1/user/cart`,
        {
          variantId: selectedVariant.id,
          quantity: quantity
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data && response.data.data) {
        setCartMessage('Đã thêm sản phẩm vào giỏ hàng!');
        setShowCartModal(true);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      setCartError(error.response?.data?.message || 'Không thể thêm vào giỏ hàng');
    } finally {
      setAddingToCart(false);
    }
  };
  
  // Đóng modal giỏ hàng
  const closeCartModal = () => {
    setShowCartModal(false);
  };
  
  // Đi đến giỏ hàng
  const goToCart = () => {
    navigate('/cart');
  };
  
  // Các hàm xử lý modal chi tiết khuyến mãi
  
  // Lấy chi tiết khuyến mãi (sử dụng Redux)
  const fetchPromotionDetailsRedux = (promotionId) => {
    if (!promotionId) return;
    // Sử dụng Redux Thunk để lấy thông tin khuyến mãi
    dispatch(fetchPromotionById(promotionId));
  };
  
  // Đóng modal chi tiết khuyến mãi (sử dụng Redux)
  const closePromotionModal = () => {
    dispatch(setShowPromotionModal(false));
  };
  
  // Xử lý click vào khuyến mãi (sử dụng Redux)
  const handlePromotionClick = (promotion) => {
    console.log("Promotion clicked:", promotion); // Debugging
    
    // Luôn hiển thị modal trước để người dùng biết đang xử lý
    dispatch(setCurrentPromotion(promotion || {
      name: promotion?.name || 'Khuyến mãi đặc biệt',
      value: promotion?.value || 0,
      startDate: promotion?.startDate || new Date().toISOString(),
      endDate: promotion?.endDate || new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
    }));
    dispatch(setShowPromotionModal(true));
    
    // Nếu có ID, thì gọi API để lấy thông tin chi tiết hơn
    if (promotion && promotion.id) {
      fetchPromotionDetailsRedux(promotion.id);
    }
  };

  // Fetch user shipping addresses
  const fetchShippingAddresses = async () => {
    if (!checkLogin()) return;
    
    setLoadingAddresses(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/api/v1/user/shipping-info`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data && response.data.data) {
        setShippingAddresses(response.data.data);
        // Set default shipping address if available
        if (response.data.data.length > 0) {
          setOrderForm(prev => ({
            ...prev,
            shippingInfoId: response.data.data[0].id
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching shipping addresses:', error);
      setOrderError('Không thể tải địa chỉ giao hàng');
    } finally {
      setLoadingAddresses(false);
    }
  };
  
  // Handle buy now button click
  const handleBuyNowClick = () => {
    if (!selectedVariant) {
      setCartError('Vui lòng chọn biến thể sản phẩm');
      return;
    }
    
    // Check if user is logged in
    if (!checkLogin()) {
      // Save product info to localStorage to handle after login
      localStorage.setItem('pendingBuyNow', JSON.stringify({
        variantId: selectedVariant.id,
        quantity: quantity
      }));
      
      // Redirect to login page
      navigate('/login', { state: { returnUrl: `/product/${productId}` } });
      return;
    }
    
    // Fetch shipping addresses if needed
    if (shippingAddresses.length === 0) {
      fetchShippingAddresses();
    }
    
    // Open buy now modal
    setShowBuyNowModal(true);
    setOrderError(null);
  };
  
  // Handle order form input change
  const handleOrderFormChange = (e) => {
    const { name, value } = e.target;
    setOrderForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Place order directly from product
  const placeOrder = async () => {
    if (!selectedVariant) {
      setOrderError('Vui lòng chọn biến thể sản phẩm');
      return;
    }
    
    if (orderForm.receiveMethod === 'DELIVERY' && !orderForm.shippingInfoId) {
      setOrderError('Vui lòng chọn địa chỉ giao hàng');
      return;
    }
    
    setOrderLoading(true);
    setOrderError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setOrderError('Bạn cần đăng nhập để đặt hàng');
        return;
      }
      
      // Đảm bảo dữ liệu được gửi đi đúng định dạng
      const orderData = {
        variantId: parseInt(selectedVariant.id),
        quantity: parseInt(quantity),
        shippingInfoId: parseInt(orderForm.shippingInfoId),
        paymentMethod: orderForm.paymentMethod,
        receiveMethod: orderForm.receiveMethod,
        note: orderForm.note || ''
      };
      
      // Hiển thị chi tiết request body trong console log
      console.group('Thông tin đặt hàng');
      console.log('URL:', `${API_URL}/api/v1/order/customer/create-from-product`);
      console.log('Request Headers:', {
        'Authorization': `Bearer ${token.substring(0, 15)}...`,
        'Content-Type': 'application/json'
      });
      console.log('Biến thể sản phẩm ID:', orderData.variantId, typeof orderData.variantId);
      console.log('Số lượng:', orderData.quantity, typeof orderData.quantity);
      console.log('ID địa chỉ giao hàng:', orderData.shippingInfoId, typeof orderData.shippingInfoId);
      console.log('Phương thức thanh toán:', orderData.paymentMethod);
      console.log('Phương thức nhận hàng:', orderData.receiveMethod);
      console.log('Ghi chú:', orderData.note);
      console.log('Request body đầy đủ:', JSON.stringify(orderData, null, 2));
      console.groupEnd();
      
      const response = await axios.post(
        `${API_URL}/api/v1/order/customer/create-from-product`,
        orderData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Log response
      console.group('Phản hồi từ server');
      console.log('Status:', response.status);
      console.log('Response data:', response.data);
      console.groupEnd();
      
      if (response.data && response.data.data) {
        // Lưu order ID và đóng modal đặt hàng
        setLastOrderId(response.data.data.id);
        setShowBuyNowModal(false);
        
        // Show success toast
        toast.success('Đặt hàng thành công!');
        
        // Hiển thị modal thành công với lựa chọn
        setShowOrderSuccessModal(true);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      console.log('Response error:', error.response?.data);
      setOrderError(error.response?.data?.message || 'Không thể đặt hàng');
    } finally {
      setOrderLoading(false);
    }
  };
  
  // Close buy now modal
  const closeBuyNowModal = () => {
    setShowBuyNowModal(false);
  };
  
  // Close success modal
  const closeSuccessModal = () => {
    setShowOrderSuccessModal(false);
  };
  
  // Go to cart after order
  const goToCartAfterOrder = () => {
    setShowOrderSuccessModal(false);
    navigate('/cart');
  };
  
  // Continue shopping after order
  const continueShopping = () => {
    setShowOrderSuccessModal(false);
    // Ở lại trang hiện tại hoặc chuyển đến trang danh mục
    navigate('/');
  };
  
  // View order details
  const viewOrderDetails = async () => {
    setShowOrderSuccessModal(false);
    setShowOrderDetailsModal(true);
    await fetchOrderDetails(lastOrderId);
  };
  
  // Fetch order details from API
  const fetchOrderDetails = async (orderId) => {
    setLoadingOrderDetails(true);
    setOrderDetailsError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setOrderDetailsError('Bạn cần đăng nhập để xem chi tiết đơn hàng');
        return;
      }
      
      console.log(`Fetching order details for ID: ${orderId}`);
      
      const response = await axios.get(
        `${API_URL}/api/v1/order/customer/${orderId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Order details response:', response.data);
      
      if (response.data && response.data.data) {
        setOrderDetails(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      setOrderDetailsError(error.response?.data?.message || 'Không thể tải chi tiết đơn hàng');
    } finally {
      setLoadingOrderDetails(false);
    }
  };
  
  // Close order details modal
  const closeOrderDetailsModal = () => {
    setShowOrderDetailsModal(false);
  };

  // Tính giảm giá
  const calculateDiscount = () => {
    if (!currentProduct.basePrice || !currentProduct.price || currentProduct.basePrice <= currentProduct.price) return null;
    const discount = Math.round(((currentProduct.basePrice - currentProduct.price) / currentProduct.basePrice) * 100);
    return discount > 0 ? `${discount}%` : null;
  };

  // Format giá tiền
  const formatCurrency = (price) => {
    return price?.toLocaleString('vi-VN') + 'đ';
  };

  // Format ngày tháng
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  // Xử lý thêm vào giỏ hàng
  const handleAddToCart = () => {
    // Sẽ thêm chức năng thêm vào giỏ hàng sau
    alert(`Đã thêm ${quantity} sản phẩm ${currentProduct.name} vào giỏ hàng!`);
  };

  return (
    <div className="product-detail-container">
      <div className="product-detail-breadcrumb">
        <Link to="/">Trang chủ</Link> &gt; 
        <Link to={`/category/${currentProduct.productLine?.category?.id}`}>{currentProduct.productLine?.category?.name}</Link> &gt; 
        <span>{currentProduct.name}</span>
      </div>

      <div className="product-detail-header">
        <h1 className="product-name">{currentProduct.name}</h1>
        <div className="product-rating-summary">
          <span className="rating">★ {averageRating > 0 ? averageRating.toFixed(1) : (currentProduct.rating?.toFixed(1) || '4.9')}</span>
          <span className="dot-separator">•</span>
          <span className="reviews-count">{reviewsMeta.totalElements || currentProduct.reviewsCount || 0} đánh giá</span>
          <span className="dot-separator">•</span>
          <span className="sold-count">Đã bán {soldCount}</span>
        </div>
      </div>

      <div className="product-detail-main">
        {/* Cột bên trái */}
        <div className="product-detail-left">
          {/* Phần hiển thị ảnh sản phẩm */}
          <div className="product-images-container">
            <div className="product-main-image">
              <img 
                src={getCurrentImage()} 
                alt={currentProduct.name} 
                className="product-image-main"
              />
            </div>
            <div className="product-thumbnails">
              {getDisplayImages().map((image, index) => (
                <div 
                  key={image.id}
                  className={`thumbnail ${index === activeImageIndex ? 'active' : ''} ${image.isProduct ? 'product-thumbnail' : 'variant-thumbnail'}`}
                  onClick={() => handleThumbnailClick(index)}
                >
                  <img src={image.src} alt={`Thumbnail ${index + 1}`} />
                  {image.isProduct && <span className="thumbnail-label">Sản phẩm</span>}
                  {image.isVariant && <span className="thumbnail-label">Biến thể</span>}
                </div>
              ))}
            
            </div>
          </div>

          {/* Phần cam kết của shop */}
          <div className="shop-commitment">
            <h3>ShopShop cam kết</h3>
            <div className="commitment-items">
              <div className="commitment-item">
                <img src={camket1} alt="Sản phẩm mới" />
                <p>Sản phẩm mới (Cần thanh toán trước khi mở hộp).</p>
              </div>
              <div className="commitment-item">
                <img src={camket2} alt="Bộ sản phẩm" />
                <p>Bộ sản phẩm gồm: Hộp, Sách hướng dẫn, Cáp, Cây lấy sim</p>
              </div>
              <div className="commitment-item">
                <img src={camket3} alt="Hư gì đổi nấy" />
                <p>Hư gì đổi nấy 12 tháng tại  8386 siêu thị toàn quốc (miễn phí tháng đầu)</p>
              </div>
              <div className="commitment-item">
                <img src={camket4} alt="Bảo hành" />
                <p>Bảo hành chính hãng điện thoại 1 năm tại các trung tâm bảo hành hãng</p>
              </div>
            </div>
          </div>

          {/* Tab thông số kỹ thuật hoặc đánh giá */}
          <div className="product-tabs">
            <div className="tab-headers">
              <div 
                className={`tab-header ${activeTab === 'specs' ? 'active' : ''}`}
                onClick={() => setActiveTab('specs')}
              >
                Thông số kỹ thuật
              </div>
              <div 
                className={`tab-header ${activeTab === 'reviews' ? 'active' : ''}`}
                onClick={() => setActiveTab('reviews')}
              >
                Đánh giá
              </div>
            </div>

            <div className="tab-content">
              {activeTab === 'specs' && (
                <div className="specs-content">
                  <table className="specs-table">
                    <tbody>
                      {currentProduct.attributes && currentProduct.attributes.map((attr) => (
                        <tr key={attr.id}>
                          <td className="spec-name">{attr.attribute.name || '...'}</td>
                          <td className="spec-value">{attr.value || '...'}</td>
                        </tr>
                      ))}
                      {(!currentProduct.attributes || currentProduct.attributes.length === 0) && (
                        <>
                          <tr>
                            <td className="spec-name">Mã sản phẩm</td>
                            <td className="spec-value">{currentProduct.code || '...'}</td>
                          </tr>
                          <tr>
                            <td className="spec-name">Tên sản phẩm</td>
                            <td className="spec-value">{currentProduct.name || '...'}</td>
                          </tr>
                          <tr>
                            <td className="spec-name">Thương hiệu</td>
                            <td className="spec-value">{currentProduct.productLine?.brand?.name || '...'}</td>
                          </tr>
                          <tr>
                            <td className="spec-name">Danh mục</td>
                            <td className="spec-value">{currentProduct.productLine?.category?.name || '...'}</td>
                          </tr>
                          <tr>
                            <td className="spec-name">Đánh giá</td>
                            <td className="spec-value">{currentProduct.rating ? `${currentProduct.rating.toFixed(1)}/5 (${currentProduct.reviewsCount || 0} đánh giá)` : '...'}</td>
                          </tr>
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="reviews-content">
                  {reviewsLoading ? (
                    <div className="reviews-loading">Đang tải đánh giá...</div>
                  ) : reviewsError ? (
                    <div className="reviews-error">{reviewsError}</div>
                  ) : (
                    <>
                      <div className="review-summary">
                        <div className="average-rating">
                          <div className="rating-number">{averageRating.toFixed(1)}</div>
                          <div className="rating-stars">
                            {[1, 2, 3, 4, 5].map(star => (
                              <span key={star} className={star <= Math.round(averageRating) ? 'star filled' : 'star'}>★</span>
                            ))}
                          </div>
                          <div className="total-reviews">{reviewsMeta.totalElements} đánh giá</div>
                        </div>
                        


                        <div className="rating-filters">
                          <div className="filter-title">Lọc theo:</div>
                          <div className="rating-filter-buttons">
                            {[5, 4, 3, 2, 1].map(rating => (
                              <button 
                                key={rating}
                                className={`rating-filter-btn ${reviewFilter === rating ? 'active' : ''}`}
                                onClick={() => handleReviewFilterChange(rating)}
                              >
                                {rating} ★
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="reviews-list">
                        {reviews.length > 0 ? (
                          <>
                            {reviews.map(review => (
                              <div key={review.id} className="review-item">
                                <div className="review-header">
                                  <div className="reviewer-info">
                                    <div className="reviewer-name">{review.user?.fullName || 'Người dùng ẩn danh'}</div>
                                    <div className="review-date">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</div>
                                  </div>
                                  <div className="review-rating">
                                    {[1, 2, 3, 4, 5].map(star => (
                                      <span key={star} className={star <= review.rating ? 'star filled' : 'star'}>★</span>
                                    ))}
                                  </div>
                                </div>
                                <div className="review-content">{review.content}</div>
                              </div>
                            ))}
                            
                            {reviewsMeta.totalPages > 1 && (
                              <div className="reviews-pagination">
                                {reviewsMeta.currentPage > 1 && (
                                  <button 
                                    className="pagination-btn prev"
                                    onClick={() => fetchReviews(reviewsMeta.currentPage - 1, reviewFilter)}
                                  >
                                    &lt; Trước
                                  </button>
                                )}
                                
                                <span className="pagination-info">{reviewsMeta.currentPage}/{reviewsMeta.totalPages}</span>
                                
                                {reviewsMeta.currentPage < reviewsMeta.totalPages && (
                                  <button 
                                    className="pagination-btn next"
                                    onClick={() => fetchReviews(reviewsMeta.currentPage + 1, reviewFilter)}
                                  >
                                    Tiếp &gt;
                                  </button>
                                )}
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="no-reviews">
                            {reviewFilter ? `Không có đánh giá nào cho ${reviewFilter} sao` : 'Chưa có đánh giá nào'}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cột bên phải */}
        <div className="product-detail-right">
          {/* Banner khuyến mãi khách hàng mới */}
          <div className="new-customer-promo">
            <img src={newCusPromo} alt="Khuyến mãi khách hàng mới" className="new-customer-promo-img" />
          </div>

          {/* Các biến thể sản phẩm */}
          <div className="product-variants">
            <h3 className="variants-title">Lựa chọn phiên bản</h3>
            
            {/* Biến thể sản phẩm */}
            <div className="variant-group">
              <div className="variant-label">
                <span className="variant-label-icon">✔</span>
                <span>Chọn màu sắc</span>
                {selectedVariant && (
                  <span className="selected-variant">(Đã chọn: {selectedVariant.color})</span>
                )}
              </div>
              
              {isLoadingVariants ? (
                <div className="loading-variants">
                  <div className="loading-spinner"></div>
                  <span>Đang tải biến thể...</span>
                </div>
              ) : variantError ? (
                <div className="error-variants">{variantError}</div>
              ) : variants.length > 0 ? (
                <div className="variant-options">
                  {variants.map(variant => {
                    const isActive = selectedVariant && selectedVariant.id === variant.id;
                    return (
                      <button 
                        key={variant.id}
                        className={`variant-option ${isActive ? 'active' : ''}`}
                        onClick={() => handleVariantSelect(variant)}
                      >
                        <span className="variant-name">{variant.color || 'Biến thể'}</span>
                        {variant.inventory && (
                          <span className="variant-inventory">
                            Còn {variant.inventory.available || 0} sản phẩm
                          </span>
                        )}
                        {isActive && <span className="variant-check">✔</span>}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="no-variants">Không có biến thể nào</div>
              )}
              
              {selectedVariant && selectedVariant.inventory && (
                <div className="inventory-info">
                  <span className="available-count">
                    <i className="inventory-icon">✓</i> Còn lại: {selectedVariant.inventory.available}
                  </span>
                  <span className="sold-count">
                    <i className="inventory-icon">➕</i> Đã bán: {selectedVariant.inventory.sold}
                  </span>
                </div>
              )}
            </div>

            {/* Giá và thông tin giảm giá */}
            <div className="price-section">
              <div className="price-location">Giá tại Hồ Chí Minh</div>
              <div className="price-online-container">
                <div className="price-online-tag">Online Giá Rẻ Quá</div>
                <div className="price-online">{formatCurrency(currentProduct.price || 30590000)}</div>
              </div>
              <div className="price-original-container">
                <div className="price-original">{formatCurrency(currentProduct.basePrice || 34990000)}</div>
                <div className="price-discount">-{calculateDiscount() || '12%'}</div>
              </div>
              
              

              {/* Countdown timer */}


              <div className="countdown-container">
                <div className="countdown-label">Khuyến mãi kết thúc sau</div>
                <div className="countdown-timer">
                  <div className="time-unit">
                    <div className="time-value">{countdown.days}</div>
                    <div className="time-label">Ngày</div>
                  </div>
                  <div className="time-separator">:</div>
                  <div className="time-unit">
                    <div className="time-value">{String(countdown.hours).padStart(2, '0')}</div>
                    <div className="time-label">Giờ</div>
                  </div>
                  <div className="time-separator">:</div>
                  <div className="time-unit">
                    <div className="time-value">{String(countdown.minutes).padStart(2, '0')}</div>
                    <div className="time-label">Phút</div>
                  </div>
                  <div className="time-separator">:</div>
                  <div className="time-unit">
                    <div className="time-value">{String(countdown.seconds).padStart(2, '0')}</div>
                    <div className="time-label">Giây</div>
                  </div>
                </div>
                {currentProduct && currentProduct.promotions && currentProduct.promotions.length > 0 && currentProduct.promotions[0].endDate && (
                  <div className="countdown-expiry">Hết hạn vào: {new Date(currentProduct.promotions[0].endDate).toLocaleDateString('vi-VN')}</div>
                )}
              </div>
            </div>
          </div>

          {/* Danh sách khuyến mãi */}
          <div className="promotion-list">
            <div className="promotion-title">Khuyến mãi</div>
                {currentProduct.promotions && currentProduct.promotions.length > 0 ? (
                  <ul className="promotion-items">
                    {currentProduct.promotions.map((promo) => (
                      <li className="promotion-item" key={promo.id}>
                        <div className="promotion-dot"></div>
                        <div 
                          className="promotion-text"
                          onClick={() => handlePromotionClick(promo)}
                          title="Nhấp để xem chi tiết"
                        >
                          {promo.name || '...'} - Giảm {formatCurrency(promo.value) || '0đ'}
                          {promo.startDate && promo.endDate && (
                            <div className="promotion-period">
                              Từ {formatDate(promo.startDate)} đến {formatDate(promo.endDate)}
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <ul className="promotion-items">
                    <li className="promotion-item">
                      <div className="promotion-dot"></div>
                      <div 
                        className="promotion-text"
                        onClick={() => handlePromotionClick({id: 1, name: 'VNPAY', value: 3000000})}
                        title="Nhấp để xem chi tiết"
                      >
                        Giảm ngay 3.000.000đ khi thanh toán qua VNPAY-QR
                      </div>
                    </li>
                    <li className="promotion-item">
                      <div className="promotion-dot"></div>
                      <div 
                        className="promotion-text"
                        onClick={() => handlePromotionClick({id: 2, name: 'TRẢ GÓP', value: 0})}
                        title="Nhấp để xem chi tiết"
                      >
                        Trả góp 0% với thẻ tín dụng
                      </div>
                    </li>
                    <li className="promotion-item">
                      <div className="promotion-dot"></div>
                      <div 
                        className="promotion-text"
                        onClick={() => handlePromotionClick({id: 3, name: 'THU CŨ', value: 2000000})}
                        title="Nhấp để xem chi tiết"
                      >
                        Thu cũ đổi mới - Trợ giá đến 2 triệu
                      </div>
                    </li>
                    <li className="promotion-item">
                      <div className="promotion-dot"></div>
                      <div 
                        className="promotion-text"
                        onClick={() => handlePromotionClick({id: 4, name: 'APPLE CARE', value: 500000})}
                        title="Nhấp để xem chi tiết"
                      >
                        Tặng PMH 500.000đ mua Apple Care+
                      </div>
                    </li>
                  </ul>
            )}
          </div>

          {/* Nút thêm vào giỏ hàng và mua ngay */}
          <div className="product-actions">
            <div className="quantity-control">
              <button 
                className="quantity-btn minus" 
                onClick={() => setQuantity(prev => (prev > 1 ? prev - 1 : 1))}
                disabled={quantity <= 1}
              >
                -
              </button>
              <input 
                type="number" 
                className="quantity-input" 
                value={quantity} 
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                min="1"
              />
              <button 
                className="quantity-btn plus" 
                onClick={() => setQuantity(prev => prev + 1)}
              >
                +
              </button>
            </div>
            
            {cartError && <div className="cart-error">{cartError}</div>}
            
            <button 
              className={`add-to-cart-btn ${addingToCart ? 'loading' : ''}`}
              onClick={addToCart}
              disabled={addingToCart || !selectedVariant}
            >
              {addingToCart ? 'Đang thêm...' : 'Thêm vào giỏ'}
            </button>

            <button 
              className="buy-now-btn" 
              disabled={!selectedVariant}
              onClick={handleBuyNowClick}
            >
              Mua ngay
            </button>
          </div>
        </div>
      </div>

      {/* Modal thông báo thêm vào giỏ thành công */}
      {showCartModal && (
        <div className="cart-modal-overlay">
          <div className="cart-modal">
            <div className="cart-modal-header">
              <h3>Thêm vào giỏ hàng thành công!</h3>
              <button className="close-modal" onClick={closeCartModal}>&times;</button>
            </div>
            <div className="cart-modal-body">
              <p>{cartMessage}</p>
              <div className="product-added-info">
                <img 
                  src={selectedVariant && selectedVariant.images && selectedVariant.images.length > 0 
                    ? renderProductImage(selectedVariant.images[0]) 
                    : (currentProduct && currentProduct.image ? renderProductImage(currentProduct.image) : '')}
                  alt={currentProduct.name}
                  className="cart-product-image"
                />
                <div className="cart-product-details">
                  <div className="cart-product-name">{currentProduct.name}</div>
                  <div className="cart-variant-info">
                    Phiên bản: {selectedVariant ? selectedVariant.color : 'Mặc định'}
                  </div>
                  <div className="cart-quantity">Số lượng: {quantity}</div>
                </div>
              </div>
            </div>
            <div className="cart-modal-footer">
              <button className="continue-shopping" onClick={closeCartModal}>Tiếp tục mua sắm</button>
              <button className="go-to-cart" onClick={goToCart}>Đi đến giỏ hàng</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal chi tiết đơn hàng */}
      {showOrderDetailsModal && (
        <div className="cart-modal-overlay">
          <div className="cart-modal order-details-modal">
            <div className="cart-modal-header">
              <h3>Chi tiết đơn hàng</h3>
              <button className="close-modal" onClick={closeOrderDetailsModal}>&times;</button>
            </div>
            <div className="cart-modal-body">
              {loadingOrderDetails ? (
                <div className="loading-details">
                  <div className="loading-spinner"></div>
                  <p>Đang tải thông tin đơn hàng...</p>
                </div>
              ) : orderDetailsError ? (
                <div className="order-error">{orderDetailsError}</div>
              ) : orderDetails ? (
                <div className="order-details-content">
                  <div className="order-info">
                    <h4>Thông tin đơn hàng #{orderDetails.id}</h4>
                    <div className="info-row">
                      <div className="info-label">Ngày đặt:</div>
                      <div className="info-value">{new Date(orderDetails.createdAt).toLocaleString('vi-VN')}</div>
                    </div>
                    <div className="info-row">
                      <div className="info-label">Trạng thái:</div>
                      <div className="info-value">
                        <span className={`status-badge status-${orderDetails.status.toLowerCase()}`}>{orderDetails.status}</span>
                      </div>
                    </div>
                    <div className="info-row">
                      <div className="info-label">Người nhận:</div>
                      <div className="info-value">{orderDetails.receiveName}</div>
                    </div>
                    <div className="info-row">
                      <div className="info-label">Số điện thoại:</div>
                      <div className="info-value">{orderDetails.phone}</div>
                    </div>
                    <div className="info-row">
                      <div className="info-label">Địa chỉ:</div>
                      <div className="info-value">{orderDetails.address}</div>
                    </div>
                    <div className="info-row">
                      <div className="info-label">Phương thức nhận:</div>
                      <div className="info-value">{orderDetails.receiveMethod === 'DELIVERY' ? 'Giao hàng' : 'Nhận tại cửa hàng'}</div>
                    </div>
                    <div className="info-row">
                      <div className="info-label">Phương thức thanh toán:</div>
                      <div className="info-value">
                        {orderDetails.paymentMethod === 'CASH' ? 'Thanh toán khi nhận hàng' :
                         orderDetails.paymentMethod === 'BANK_TRANSFER' ? 'Chuyển khoản ngân hàng' :
                         orderDetails.paymentMethod === 'ZALOPAY' ? 'Thanh toán qua ZaloPay' : 
                         orderDetails.paymentMethod}
                      </div>
                    </div>
                    {orderDetails.note && (
                      <div className="info-row">
                        <div className="info-label">Ghi chú:</div>
                        <div className="info-value">{orderDetails.note}</div>
                      </div>
                    )}
                  </div>
                  
                  <div className="order-items">
                    <h4>Sản phẩm đã đặt</h4>
                    {orderDetails.orderItems.map((item) => (
                      <div className="order-item" key={item.id}>
                        <div className="item-image">
                          <img 
                            src={item.image ? renderProductImage(item.image) : 'https://via.placeholder.com/500x500?text=No+Image'} 
                            alt={item.name} 
                            className="item-image-content"
                          />
                        </div>
                        <div className="item-details">
                          <div className="item-name">{item.name}</div>
                          <div className="item-variant">Phiên bản: {item.color}</div>
                          <div className="item-price-qty">
                            <span className="item-price">{item.price.toLocaleString('vi-VN')}đ</span>
                            <span className="item-qty">Số lượng: {item.quantity}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="order-total">
                    <div className="total-row summary-row">
                      <div className="total-label">Tạm tính:</div>
                      <div className="total-value-regular">{orderDetails.totalPrice.toLocaleString('vi-VN')}đ</div>
                    </div>
                    <div className="total-row summary-row">
                      <div className="total-label">Phí vận chuyển:</div>
                      <div className="total-value-regular">0đ</div>
                    </div>
                    <div className="total-row summary-row">
                      <div className="total-label">Giảm giá:</div>
                      <div className="total-value-regular discount-value">0đ</div>
                    </div>
                    <div className="total-row main-total">
                      <div className="total-label">Tổng cộng:</div>
                      <div className="total-value">{orderDetails.totalPrice.toLocaleString('vi-VN')}đ</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="no-data">Không có thông tin đơn hàng</div>
              )}
            </div>
            <div className="cart-modal-footer">
              <button className="modal-btn close-btn" onClick={closeOrderDetailsModal}>Đóng</button>
              <a href="/user/orders" className="modal-btn view-all-orders-btn">Xem tất cả đơn hàng</a>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal thông báo đặt hàng thành công */}
      {showOrderSuccessModal && (
        <div className="cart-modal-overlay">
          <div className="cart-modal success-modal">
            <div className="cart-modal-header">
              <h3>Đặt hàng thành công!</h3>
              <button className="close-modal" onClick={closeSuccessModal}>&times;</button>
            </div>
            <div className="cart-modal-body">
              <div className="success-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#4BB543" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <p className="success-message">Đơn hàng của bạn đã được đặt thành công!</p>
              <p className="order-id">Mã đơn hàng: {lastOrderId}</p>
              <p className="order-note">Cảm ơn bạn đã mua sắm tại cửa hàng chúng tôi!</p>
            </div>
            <div className="cart-modal-footer success-footer">
              <button className="continue-shopping" onClick={continueShopping}>Tiếp tục mua sắm</button>
              <button className="go-to-cart" onClick={goToCartAfterOrder}>Đến giỏ hàng</button>
              <button className="view-order" onClick={viewOrderDetails}>Xem chi tiết đơn hàng</button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal đặt hàng nhanh */}
      {showBuyNowModal && (
        <div className="cart-modal-overlay">
          <div className="cart-modal buy-now-modal">
            <div className="cart-modal-header">
              <h3>Đặt hàng nhanh</h3>
              <button className="close-modal" onClick={closeBuyNowModal}>&times;</button>
            </div>
            <div className="cart-modal-body">
              <div className="product-added-info">
                <img 
                  src={selectedVariant && selectedVariant.images && selectedVariant.images.length > 0 
                    ? renderProductImage(selectedVariant.images[0]) 
                    : (currentProduct && currentProduct.image ? renderProductImage(currentProduct.image) : '')}
                  alt={currentProduct.name}
                  className="cart-product-image"
                />
                <div className="cart-product-details">
                  <div className="cart-product-name">{currentProduct.name}</div>
                  <div className="cart-variant-info">
                    Phiên bản: {selectedVariant ? selectedVariant.color : 'Mặc định'}
                  </div>
                  <div className="cart-quantity">Số lượng: {quantity}</div>
                  <div className="cart-price">Giá: {formatCurrency(currentProduct.price * quantity)}</div>
                </div>
              </div>
              
              {orderError && <div className="order-error">{orderError}</div>}
              
              <form className="order-form">
                {/* Phương thức nhận hàng */}
                <div className="form-group">
                  <label>Phương thức nhận hàng:</label>
                  <select 
                    name="receiveMethod"
                    value={orderForm.receiveMethod}
                    onChange={handleOrderFormChange}
                    className="form-control"
                  >
                    <option value="DELIVERY">Giao hàng tận nơi</option>
                    <option value="PICKUP">Nhận tại cửa hàng</option>
                  </select>
                </div>
                
                {/* Địa chỉ giao hàng - chỉ hiển thị khi chọn DELIVERY */}
                {orderForm.receiveMethod === 'DELIVERY' && (
                  <div className="form-group">
                    <label>Địa chỉ giao hàng:</label>
                    {loadingAddresses ? (
                      <div className="loading-addresses">Đang tải địa chỉ...</div>
                    ) : shippingAddresses.length > 0 ? (
                      <select
                        name="shippingInfoId"
                        value={orderForm.shippingInfoId}
                        onChange={handleOrderFormChange}
                        className="form-control"
                      >
                        {shippingAddresses.map(address => (
                          <option key={address.id} value={address.id}>
                            {address.receiveName} - {address.phone} - {address.address}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="no-addresses">
                        <p>Bạn chưa có địa chỉ giao hàng</p>
                        <Link to="/user/addresses" className="add-address-link">Thêm địa chỉ mới</Link>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Phương thức thanh toán */}
                <div className="form-group">
                  <label>Phương thức thanh toán:</label>
                  <select
                    name="paymentMethod"
                    value={orderForm.paymentMethod}
                    onChange={handleOrderFormChange}
                    className="form-control"
                  >
                    <option value="CASH">Thanh toán khi nhận hàng</option>
                    <option value="BANK_TRANSFER">Chuyển khoản ngân hàng (VNPay)</option>
                    <option value="ZALOPAY">Thanh toán qua ZaloPay</option>
                  </select>
                </div>
                
                {/* Ghi chú */}
                <div className="form-group">
                  <label>Ghi chú:</label>
                  <textarea
                    name="note"
                    value={orderForm.note}
                    onChange={handleOrderFormChange}
                    placeholder="Ghi chú về đơn hàng, ví dụ: thời gian hay chỉ dẫn địa điểm giao hàng chi tiết hơn."
                    className="form-control"
                  />
                </div>
              </form>
            </div>
            <div className="cart-modal-footer">
              <button 
                className="continue-shopping" 
                onClick={closeBuyNowModal}
                disabled={orderLoading}
              >
                Huỷ
              </button>
              <button 
                className="go-to-cart place-order-btn" 
                onClick={placeOrder}
                disabled={orderLoading}
              >
                {orderLoading ? 'Đang xử lý...' : 'Đặt hàng'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal hiển thị chi tiết khuyến mãi (sử dụng Redux) */}
      {showPromotionModal && (
        <div className="promotion-modal-overlay">
          <div className="promotion-modal">
            <div className="promotion-modal-header">
              <h3>Chi tiết khuyến mãi</h3>
              <button className="close-modal" onClick={closePromotionModal}>&times;</button>
            </div>
            
            <div className="promotion-modal-body">
              {loadingPromotion ? (
                <div className="promotion-loading">Đang tải thông tin khuyến mãi...</div>
              ) : promotionError ? (
                <div className="promotion-error">{promotionError}</div>
              ) : currentPromotion ? (
                <div className="promotion-details">
                  <div className="promotion-detail-name">{currentPromotion.name || 'Chương trình khuyến mãi'}</div>
                  
                  <div className="promotion-detail-value">
                    <span className="detail-label">Giá trị: </span>
                    <span className="detail-value">{formatCurrency(currentPromotion.value)}</span>
                  </div>
                  
                  {currentPromotion.category && (
                    <div className="promotion-detail-category">
                      <span className="detail-label">Loại: </span>
                      <span className="detail-value">{currentPromotion.category.name || 'Khuyến mãi tiêu chuẩn'}</span>
                    </div>
                  )}
                  
                  {currentPromotion.startDate && currentPromotion.endDate && (
                    <div className="promotion-detail-period">
                      <div className="period-dates">
                        <div><span className="detail-label">Ngày bắt đầu: </span>{new Date(currentPromotion.startDate).toLocaleDateString('vi-VN')}</div>
                        <div><span className="detail-label">Ngày kết thúc: </span>{new Date(currentPromotion.endDate).toLocaleDateString('vi-VN')}</div>
                      </div>
                      
                      <div className="promotion-status">
                        {new Date() < new Date(currentPromotion.endDate) 
                          ? <span className="status-active">Đang hoạt động</span>
                          : <span className="status-expired">Đã hết hạn</span>
                        }
                      </div>
                    </div>
                  )}
                  
                  <div className="promotion-detail-description">
                    <div className="detail-label">Chi tiết: </div>
                    <div className="detail-content">
                      {currentPromotion.description || 
                        `Ưu đãi giảm ${formatCurrency(currentPromotion.value)} khi mua sản phẩm ${currentProduct.name}. Được áp dụng cho tất cả khách hàng khi mua sản phẩm tại TechShop.`
                      }
                    </div>
                  </div>
                </div>
              ) : (
                <div className="no-promotion">Không có thông tin khuyến mãi</div>
              )}
            </div>
            
            <div className="promotion-modal-footer">
              <button className="close-promotion" onClick={closePromotionModal}>Quay lại</button>
              {currentPromotion && (
                <button className="apply-promotion" onClick={closePromotionModal}>Áp dụng ngay</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
