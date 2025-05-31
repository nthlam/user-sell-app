import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFeaturedProducts, fetchAllProducts, fetchPhoneProducts, fetchSmartwatchProducts, fetchProductsByCategory } from '../redux/slices/productSlice';
import { Link } from 'react-router-dom';
import CategoryNav from '../components/CategoryNav';
import PromotionSection from '../components/PromotionSection';
import '../assets/styles/HomePage.css';

// Component hiển thị skeleton loading
const ProductSkeleton = () => (
  <div className="product-card skeleton">
    <div className="product-image-skeleton"></div>
    <div className="product-title-skeleton"></div>
    <div className="product-price-skeleton"></div>
  </div>
);

const HomePage = () => {
  const dispatch = useDispatch();
  const { 
    featuredProducts, loadingFeatured, errorFeatured,
    allProducts, loadingAll, errorAll,
    phoneProducts, loadingPhones, errorPhones,
    smartwatchProducts, loadingSmartwatch, errorSmartwatch,
    totalPages, currentPage, currentCategory
  } = useSelector((state) => state.products);
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentPhoneSlide, setCurrentPhoneSlide] = useState(0);
  const [currentSmartwatchSlide, setCurrentSmartwatchSlide] = useState(0);
  
  const sliderRef = useRef(null);
  const phoneSliderRef = useRef(null);
  const smartwatchSliderRef = useRef(null);
  
  const autoPlayRef = useRef(null);
  const phoneAutoPlayRef = useRef(null);
  const smartwatchAutoPlayRef = useRef(null);
  
  const [productPage, setProductPage] = useState(1);
  
  // Refs for intersection observer
  const featuredSectionRef = useRef(null);
  const phoneSectionRef = useRef(null);
  const smartwatchSectionRef = useRef(null);
  const allProductsSectionRef = useRef(null);
  
  // Track if data is already loaded
  const [featuredLoaded, setFeaturedLoaded] = useState(false);
  const [phonesLoaded, setPhonesLoaded] = useState(false);
  const [smartwatchesLoaded, setSmartWatchesLoaded] = useState(false);
  const [allProductsLoaded, setAllProductsLoaded] = useState(false);

  // Lazy loading with Intersection Observer
  const createObserver = useCallback((ref, setVisible) => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 } // Trigger when 10% of the element is visible
    );
    
    if (ref.current) {
      observer.observe(ref.current);
    }
    
    return observer;
  }, []);
  
  // Setup intersection observers for each section
  useEffect(() => {
    // Always load featured products immediately for better UX
    if (!featuredLoaded) {
      dispatch(fetchFeaturedProducts());
      setFeaturedLoaded(true);
    }
    
    // Setup observers for other sections
    const phoneObserver = createObserver(phoneSectionRef, (isVisible) => {
      if (isVisible && !phonesLoaded) {
        dispatch(fetchPhoneProducts());
        setPhonesLoaded(true);
      }
    });
    
    const smartwatchObserver = createObserver(smartwatchSectionRef, (isVisible) => {
      if (isVisible && !smartwatchesLoaded) {
        dispatch(fetchSmartwatchProducts());
        setSmartWatchesLoaded(true);
      }
    });
    
    const allProductsObserver = createObserver(allProductsSectionRef, (isVisible) => {
      if (isVisible && !allProductsLoaded) {
        if (currentCategory !== undefined) {
          dispatch(fetchProductsByCategory({ categoryId: currentCategory, page: productPage }));
        } else {
          dispatch(fetchAllProducts(productPage));
        }
        setAllProductsLoaded(true);
      }
    });
    
    // Cleanup observers
    return () => {
      if (phoneObserver) phoneObserver.disconnect();
      if (smartwatchObserver) smartwatchObserver.disconnect();
      if (allProductsObserver) allProductsObserver.disconnect();
    };
  }, [dispatch, createObserver, productPage, currentCategory, featuredLoaded, phonesLoaded, smartwatchesLoaded, allProductsLoaded]);
  
  // Reset loaded state when page or category changes
  useEffect(() => {
    setAllProductsLoaded(false);
  }, [productPage, currentCategory]);

  // Xử lý tự động trượt slider
  useEffect(() => {
    if (featuredProducts.length === 0) return;
    
    const startAutoPlay = () => {
      autoPlayRef.current = setInterval(() => {
        setCurrentSlide((prevSlide) => 
          prevSlide >= Math.min(featuredProducts.length - 5, 5) ? 0 : prevSlide + 1
        );
      }, 5000); // Chuyển slide mỗi 5 giây
    };
    
    startAutoPlay();
    
    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [featuredProducts.length]);
  
  // Cuộn slider khi currentSlide thay đổi
  useEffect(() => {
    if (sliderRef.current && featuredProducts.length > 0) {
      const cardWidth = sliderRef.current.querySelector('.product-card')?.offsetWidth || 0;
      const gap = 20; // Khoảng cách giữa các card
      sliderRef.current.scrollTo({
        left: currentSlide * (cardWidth + gap),
        behavior: 'smooth'
      });
    }
  }, [currentSlide]);
  
  // Di chuyển đến slide trước đó
  const handlePrevSlide = () => {
    setCurrentSlide((prevSlide) => prevSlide === 0 ? 0 : prevSlide - 1);
  };
  
  // Di chuyển đến slide tiếp theo
  const handleNextSlide = () => {
    const maxSlides = Math.max(0, featuredProducts.length - 5);
    setCurrentSlide((prevSlide) => prevSlide >= maxSlides ? 0 : prevSlide + 1);
  };
  
  // Xử lý slider cho sản phẩm điện thoại
  useEffect(() => {
    if (phoneSliderRef.current && phoneProducts.length > 0) {
      const cardWidth = phoneSliderRef.current.querySelector('.product-card')?.offsetWidth || 0;
      const gap = 20; // Khoảng cách giữa các card
      const scrollAmount = currentPhoneSlide * (cardWidth + gap);
      phoneSliderRef.current.scrollTo({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  }, [currentPhoneSlide, phoneProducts.length]);
  
  // Tự động trượt slider cho sản phẩm điện thoại
  useEffect(() => {
    if (phoneProducts.length === 0) return;
    
    phoneAutoPlayRef.current = setInterval(() => {
      const maxSlides = Math.max(0, phoneProducts.length - 6);
      setCurrentPhoneSlide((prevSlide) => 
        prevSlide >= maxSlides ? 0 : prevSlide + 1
      );
    }, 6000); // Chuyển slide mỗi 6 giây
    
    return () => {
      if (phoneAutoPlayRef.current) {
        clearInterval(phoneAutoPlayRef.current);
      }
    };
  }, [phoneProducts.length]);
  
  // Xử lý slider cho sản phẩm smartwatch
  useEffect(() => {
    if (smartwatchSliderRef.current && smartwatchProducts.length > 0) {
      const cardWidth = smartwatchSliderRef.current.querySelector('.product-card')?.offsetWidth || 0;
      const gap = 20; // Khoảng cách giữa các card
      const scrollAmount = currentSmartwatchSlide * (cardWidth + gap);
      smartwatchSliderRef.current.scrollTo({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  }, [currentSmartwatchSlide, smartwatchProducts.length]);
  
  // Tự động trượt slider cho sản phẩm smartwatch
  useEffect(() => {
    if (smartwatchProducts.length === 0) return;
    
    smartwatchAutoPlayRef.current = setInterval(() => {
      const maxSlides = Math.max(0, smartwatchProducts.length - 6);
      setCurrentSmartwatchSlide((prevSlide) => 
        prevSlide >= maxSlides ? 0 : prevSlide + 1
      );
    }, 7000); // Chuyển slide mỗi 7 giây
    
    return () => {
      if (smartwatchAutoPlayRef.current) {
        clearInterval(smartwatchAutoPlayRef.current);
      }
    };
  }, [smartwatchProducts.length]);
  
  // Di chuyển đến slide trước đó cho sản phẩm điện thoại
  const handlePrevPhoneSlide = () => {
    setCurrentPhoneSlide((prevSlide) => prevSlide === 0 ? 0 : prevSlide - 1);
  };
  
  // Di chuyển đến slide tiếp theo cho sản phẩm điện thoại
  const handleNextPhoneSlide = () => {
    // Chỉ hiển thị 6 sản phẩm mỗi lần
    const maxSlides = Math.max(0, phoneProducts.length - 6);
    setCurrentPhoneSlide((prevSlide) => prevSlide >= maxSlides ? 0 : prevSlide + 1);
  };
  
  // Di chuyển đến slide trước đó cho sản phẩm smartwatch
  const handlePrevSmartwatchSlide = () => {
    setCurrentSmartwatchSlide((prevSlide) => prevSlide === 0 ? 0 : prevSlide - 1);
  };
  
  // Di chuyển đến slide tiếp theo cho sản phẩm smartwatch
  const handleNextSmartwatchSlide = () => {
    // Chỉ hiển thị 6 sản phẩm mỗi lần
    const maxSlides = Math.max(0, smartwatchProducts.length - 6);
    setCurrentSmartwatchSlide((prevSlide) => prevSlide >= maxSlides ? 0 : prevSlide + 1);
  };

  // Hiển thị loading cho toàn trang chỉ khi cả 4 API đều đang tải
  if (loadingFeatured && loadingPhones && loadingSmartwatch && loadingAll) {
    return <div className="loading">Đang tải sản phẩm...</div>;
  }

  // Hiển thị lỗi nếu cả 4 API đều bị lỗi
  if (errorFeatured && errorPhones && errorSmartwatch && errorAll) {
    return <div className="error">Có lỗi xảy ra: {errorFeatured || errorPhones || errorSmartwatch || errorAll}</div>;
  }

  // Hàm xử lý hiển thị hình ảnh base64
  const renderProductImage = (product) => {
    if (product.image && product.image.base64) {
      // Hiển thị ảnh từ base64 string
      return `data:image/jpeg;base64,${product.image.base64}`;
    } else if (product.image && typeof product.image === 'string') {
      // Trường hợp image là URL
      return product.image;
    } else {
      // Fallback khi không có ảnh
      return 'https://via.placeholder.com/300x300?text=No+Image';
    }
  };

  // Tính giảm giá
  const calculateDiscount = (basePrice, salePrice) => {
    if (!basePrice || !salePrice || basePrice <= salePrice) return null;
    const discount = Math.round(((basePrice - salePrice) / basePrice) * 100);
    return discount > 0 ? `-${discount}%` : null;
  };

  return (
    <div className="home-container">
      <CategoryNav />
      <PromotionSection />
      
      {/* Featured Products Section */}
      <section className="featured-products" ref={featuredSectionRef}>
        <h2>Sản phẩm nổi bật</h2>
        {loadingFeatured ? (
          <div className="products-slider">
            {Array(6).fill().map((_, i) => (
              <ProductSkeleton key={`featured-skeleton-${i}`} />
            ))}
          </div>
        ) : errorFeatured ? (
          <div className="section-error">{errorFeatured}</div>
        ) : (
          <>
            <div className="products-slider" ref={sliderRef}>
              {featuredProducts.map((product) => (
                <Link to={`/product/${product.id}`} className="product-card-link" key={product.id}>
                  <div className="product-card">
                    {product.basePrice > product.price && (
                      <span className="discount-badge">
                        {calculateDiscount(product.basePrice, product.price)}
                      </span>
                    )}
                    {/* Thêm nhãn trả chậm nếu có */}
                    <div className="installment-badge">Trả chậm 0%</div>
                    <div className="image-container">
                      <div className="product-image">
                        <img src={renderProductImage(product)} alt={product.name} />
                      </div>
                    </div>
                    <h3>{product.name}</h3>
                    
                    {/* Thông số kỹ thuật */}
                    {/* <div className="product-specs">
                      <span className="spec-item">Super Retina XDR</span>
                      <span className="spec-item">6.9"</span>
                    </div> */}
                    
                    <div className="product-prices">
                      <p className="current-price">{(product.price || 0).toLocaleString('vi-VN')}đ</p>
                      {product.basePrice > product.price && (
                        <div className="price-discount-container">
                          <p className="original-price">{(product.basePrice || 0).toLocaleString('vi-VN')}đ</p>
                          <span className="discount-percent">-{calculateDiscount(product.basePrice, product.price)?.replace('-', '') || '0%'}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Thông tin quà tặng */}
                    <div className="gift-info">Quà 500.000đ</div>
                    
                    <div className="product-rating">
                      <span className="star filled">★</span>
                      <span className="rating-value">{product.rating?.toFixed(1) || '0.0'}</span>
                      <span className="dot-separator">•</span>
                      <span className="sold-count">Đã bán {product.reviewsCount?.toLocaleString('vi-VN') || 0}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            
            <div className="slider-controls">
              <button className="slider-button prev" onClick={handlePrevSlide}>&lt;</button>
              <button className="slider-button next" onClick={handleNextSlide}>&gt;</button>
            </div>
            
            <div className="slider-dots">
              {featuredProducts.slice(0, Math.min(featuredProducts.length - 4, 6)).map((_, index) => (
                <span 
                  key={index} 
                  className={`slider-dot ${currentSlide === index ? 'active' : ''}`}
                  onClick={() => setCurrentSlide(index)}
                />
              ))}
            </div>
          </>
        )}
      </section>
      
      {/* Phone Products Section */}
      <section className="phone-products-section" ref={phoneSectionRef}>
        <h2>Điện thoại nổi bật</h2>
        {loadingPhones ? (
          <div className="products-slider">
            {Array(6).fill().map((_, i) => (
              <ProductSkeleton key={`phone-skeleton-${i}`} />
            ))}
          </div>
        ) : errorPhones ? (
          <div className="section-error">{errorPhones}</div>
        ) : (
          <div className="phone-products-container">
            <div className="products-slider phone-slider" ref={phoneSliderRef}>
              {phoneProducts.map((product) => (
                <Link to={`/product/${product.id}`} className="product-card-link" key={product.id}>
                  <div className="product-card">
                    {product.basePrice > product.price && (
                      <span className="discount-badge">
                        {calculateDiscount(product.basePrice, product.price)}
                      </span>
                    )}
                    {/* Thêm nhãn trả chậm nếu có */}
                    <div className="installment-badge">Trả chậm 0%</div>
                    <div className="image-container">
                      <div className="product-image">
                        <img src={renderProductImage(product)} alt={product.name} />
                      </div>
                    </div>
                    <h3>{product.name}</h3>
                    
                    <div className="product-prices">
                      <p className="current-price">{(product.price || 0).toLocaleString('vi-VN')}đ</p>
                      {product.basePrice > product.price && (
                        <div className="price-discount-container">
                          <p className="original-price">{(product.basePrice || 0).toLocaleString('vi-VN')}đ</p>
                          <span className="discount-percent">-{calculateDiscount(product.basePrice, product.price)?.replace('-', '') || '0%'}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Thông tin quà tặng */}
                    <div className="gift-info">Quà 500.000đ</div>
                    
                    <div className="product-rating">
                      <span className="star filled">★</span>
                      <span className="rating-value">{product.rating?.toFixed(1) || '0.0'}</span>
                      <span className="dot-separator">•</span>
                      <span className="sold-count">Đã bán {product.reviewsCount?.toLocaleString('vi-VN') || 0}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            
            <div className="slider-dots phone-slider-dots">
              {phoneProducts.slice(0, Math.min(phoneProducts.length - 5, 6)).map((_, index) => (
                <span 
                  key={index} 
                  className={`slider-dot ${currentPhoneSlide === index ? 'active' : ''}`}
                  onClick={() => setCurrentPhoneSlide(index)}
                />
              ))}
            </div>
          </div>
        )}
      </section>
      
      {/* Smart Watch Products Section */}
      <section className="smartwatch-products-section" ref={smartwatchSectionRef}>
        <h2>Đồng hồ thông minh nổi bật</h2>
        {loadingSmartwatch ? (
          <div className="products-slider">
            {Array(6).fill().map((_, i) => (
              <ProductSkeleton key={`smartwatch-skeleton-${i}`} />
            ))}
          </div>
        ) : errorSmartwatch ? (
          <div className="section-error">{errorSmartwatch}</div>
        ) : (
          <div className="smartwatch-products-container">
            <div className="products-slider smartwatch-slider" ref={smartwatchSliderRef}>
              {smartwatchProducts.map((product) => (
                <Link to={`/product/${product.id}`} className="product-card-link" key={product.id}>
                  <div className="product-card">
                    {product.basePrice > product.price && (
                      <span className="discount-badge">
                        {calculateDiscount(product.basePrice, product.price)}
                      </span>
                    )}
                    {/* Thêm nhãn trả chậm nếu có */}
                    <div className="installment-badge">Trả chậm 0%</div>
                    <div className="image-container">
                      <div className="product-image">
                        <img src={renderProductImage(product)} alt={product.name} />
                      </div>
                    </div>
                    <h3>{product.name}</h3>
                    
                    <div className="product-prices">
                      <p className="current-price">{(product.price || 0).toLocaleString('vi-VN')}đ</p>
                      {product.basePrice > product.price && (
                        <div className="price-discount-container">
                          <p className="original-price">{(product.basePrice || 0).toLocaleString('vi-VN')}đ</p>
                          <span className="discount-percent">-{calculateDiscount(product.basePrice, product.price)?.replace('-', '') || '0%'}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Thông tin quà tặng */}
                    <div className="gift-info">Quà 200.000đ</div>
                    
                    <div className="product-rating">
                      <span className="star filled">★</span>
                      <span className="rating-value">4.8</span>
                      <span className="dot-separator">•</span>
                      <span className="sold-count">Đã bán 24,8k</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            
            <div className="slider-dots smartwatch-slider-dots">
              {smartwatchProducts.slice(0, Math.min(smartwatchProducts.length - 5, 6)).map((_, index) => (
                <span 
                  key={index} 
                  className={`slider-dot ${currentSmartwatchSlide === index ? 'active' : ''}`}
                  onClick={() => setCurrentSmartwatchSlide(index)}
                />
              ))}
            </div>
          </div>
        )}
      </section>
      
      {/* All Products or Category Products Section */}
      <section className="categories-section" ref={allProductsSectionRef}>
        <h2>{currentCategory !== undefined ? "Danh mục sản phẩm" : "Tất cả sản phẩm"}</h2>
        {loadingAll ? (
          <div className="products-grid">
            {Array(12).fill().map((_, i) => (
              <ProductSkeleton key={`all-products-skeleton-${i}`} />
            ))}
          </div>
        ) : errorAll ? (
          <div className="section-error">{errorAll}</div>
        ) : (
          <>
            <div className="products-grid">
              {allProducts && allProducts.map((product) => (
                <Link to={`/product/${product.id}`} className="product-card-link" key={product.id}>
                  <div className="product-card">
                  {product.basePrice > product.price && (
                    <span className="discount-badge">
                      {calculateDiscount(product.basePrice, product.price)}
                    </span>
                  )}
                  {/* Thêm nhãn trả chậm nếu có */}
                  <div className="installment-badge">Trả chậm 0%</div>
                  <div className="image-container">
                    <div className="product-image">
                      <img src={renderProductImage(product)} alt={product.name} />
                    </div>
                  </div>
                  <h3>{product.name}</h3>
                  
                  <div className="product-prices">
                    <p className="current-price">{(product.price || 0).toLocaleString('vi-VN')}đ</p>
                    {product.basePrice > product.price && (
                      <div className="price-discount-container">
                        <p className="original-price">{(product.basePrice || 0).toLocaleString('vi-VN')}đ</p>
                        <span className="discount-percent">-{calculateDiscount(product.basePrice, product.price)?.replace('-', '') || '0%'}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Thông tin quà tặng */}
                  <div className="gift-info">Quà 500.000đ</div>
                  
                  <div className="product-rating">
                    <span className="star filled">★</span>
                    <span className="rating-value">{product.rating?.toFixed(1) || '0.0'}</span>
                    <span className="dot-separator">•</span>
                    <span className="sold-count">Đã bán {product.reviewsCount?.toLocaleString('vi-VN') || 0}</span>
                  </div>
                </div>
              </Link>
              ))}
            </div>

            {/* Phân trang */}
            {allProducts?.length > 0 && (
              <div className="pagination">
                <button 
                  className="pagination-button" 
                  onClick={() => setProductPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  &lt; Trang trước
                </button>
                
                <div className="pagination-info">
                  Trang {currentPage} / {totalPages}
                  {currentCategory && <span className="category-filter"> (Lọc theo danh mục)</span>}
                </div>
                
                <button 
                  className="pagination-button" 
                  onClick={() => setProductPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Trang sau &gt;
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default HomePage;
