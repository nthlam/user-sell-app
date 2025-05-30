import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPromotionById, setCurrentPromotion, setShowPromotionModal } from '../redux/slices/promotionSlice';
import '../assets/styles/PromotionSection.css';

const PromotionSection = () => {
  const dispatch = useDispatch();
  const { currentPromotion, loading, error, showPromotionModal } = useSelector(state => state.promotions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const sliderRef = useRef(null);
  const autoSlideRef = useRef(null);

  // Giữ nguyên API_URL để reference trong các hàm khác nếu cần
  const API_URL = 'https://phone-selling-app-mw21.onrender.com';

  // Thông tin khuyến mãi và ID tương ứng
  const promotions = [
    { id: 13, image: '/assets/images/promotions/km1.png' },
    { id: 10, image: '/assets/images/promotions/km2.jpg' },
    // Sử dụng placeholder cho km3 vì chưa có file
    { id: 3, image: '/assets/images/promotions/km3.png' },
    { id: 9, image: '/assets/images/promotions/km4.png' }
  ];
  
  
  // Tự động chuyển slide
  useEffect(() => {
    const startAutoSlide = () => {
      autoSlideRef.current = setInterval(() => {
        setCurrentIndex(prevIndex => {
          const nextIndex = (prevIndex + 2) % promotions.length;
          return nextIndex;
        });
      }, 5000); // Chuyển slide mỗi 5 giây
    };
    
    startAutoSlide();
    
    return () => {
      if (autoSlideRef.current) {
        clearInterval(autoSlideRef.current);
      }
    };
  }, [promotions.length]);

  // Hàm lấy thông tin khuyến mãi khi click vào ảnh
  const handlePromotionClick = (id) => {
    // Dispatch action để lấy thông tin khuyến mãi
    dispatch(fetchPromotionById(id));
    // Hiển thị modal ngay lập tức
    dispatch(setShowPromotionModal(true));
  };

  // Hàm đóng modal
  const closeModal = () => {
    dispatch(setShowPromotionModal(false));
    dispatch(setCurrentPromotion(null));
  };

  // Format date string
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  // Xử lý nút chuyển slide
  const goToNext = () => {
    setCurrentIndex(prevIndex => (prevIndex + 2) % promotions.length);
    if (autoSlideRef.current) {
      clearInterval(autoSlideRef.current);
      autoSlideRef.current = setInterval(() => {
        setCurrentIndex(prevIndex => (prevIndex + 2) % promotions.length);
      }, 5000);
    }
  };

  const goToPrev = () => {
    setCurrentIndex(prevIndex => {
      const newIndex = prevIndex - 2;
      return newIndex < 0 ? promotions.length - (promotions.length % 2 === 0 ? 2 : 1) : newIndex;
    });
    if (autoSlideRef.current) {
      clearInterval(autoSlideRef.current);
      autoSlideRef.current = setInterval(() => {
        setCurrentIndex(prevIndex => (prevIndex + 2) % promotions.length);
      }, 5000);
    }
  };

  // Lấy ra 2 khuyến mãi đang hiển thị
  const visiblePromotions = [
    promotions[currentIndex],
    promotions[(currentIndex + 1) % promotions.length]
  ];

  return (
    <div className="promotion-section">
      <h2 className="promotion-heading">Khuyến Mãi Đặc Biệt</h2>
      <div className="promotion-slider-container">
        <button className="promotion-nav-button prev" onClick={goToPrev}>&lt;</button>
        
        <div className="promotion-container" ref={sliderRef}>
          {visiblePromotions.map((promo, index) => (
            <div 
              key={`${currentIndex}-${index}`} 
              className="promotion-item" 
              onClick={() => handlePromotionClick(promo.id)}
            >
              <img 
                src={promo.image} 
                alt={`Khuyến mãi ${index + 1}`} 
                className="promotion-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://via.placeholder.com/500x250/2e7eed/ffffff?text=Khuyến+Mãi+${(currentIndex + index) % promotions.length + 1}`;
                }}
              />
            </div>
          ))}
        </div>
        
        <button className="promotion-nav-button next" onClick={goToNext}>&gt;</button>
      </div>
      
      <div className="promotion-dots">
        {Array.from({ length: Math.ceil(promotions.length / 2) }).map((_, index) => (
          <span 
            key={index}
            className={`promotion-dot ${Math.floor(currentIndex / 2) === index ? 'active' : ''}`}
            onClick={() => setCurrentIndex(index * 2)}
          />
        ))}
      </div>

      {/* Modal hiển thị thông tin khuyến mãi */}
      {showPromotionModal && (
        <div className="promotion-modal-overlay" onClick={closeModal}>
          <div className="promotion-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={closeModal}>&times;</button>
            
            {loading && <div className="modal-loading">Đang tải thông tin...</div>}
            
            {error && <div className="modal-error">{error}</div>}
            
            {currentPromotion && !loading && !error && (
              <div className="promotion-details">
                <h3 className="promotion-title">{currentPromotion.name}</h3>
                
                <div className="promotion-info">
                  <p className="promotion-value">
                    <span>Giá trị khuyến mãi:</span> 
                    {typeof currentPromotion.value === 'number' 
                      ? currentPromotion.value.toLocaleString('vi-VN') + (currentPromotion.value > 100 ? ' ₫' : '%') 
                      : currentPromotion.value
                    }
                  </p>
                  
                  <div className="promotion-dates">
                    <p>
                      <span>Ngày bắt đầu:</span> {formatDate(currentPromotion.startDate)}
                    </p>
                    <p>
                      <span>Ngày kết thúc:</span> {formatDate(currentPromotion.endDate)}
                    </p>
                  </div>
                  
                  {currentPromotion.category && (
                    <p className="promotion-category">
                      <span>Áp dụng cho:</span> {currentPromotion.category.name}
                    </p>
                  )}
                </div>
                
                <div className="promotion-action">
                  <button className="apply-promotion">Sử dụng ngay</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PromotionSection;
