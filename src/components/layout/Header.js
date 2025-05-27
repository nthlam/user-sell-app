import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaShoppingCart, FaUserCircle, FaSearch, FaSignOutAlt, FaUser, FaListAlt, FaClipboardList, FaStar } from 'react-icons/fa';
import { logout } from '../../redux/slices/authSlice';
import axios from 'axios';
import '../../assets/styles/Header.css';

const API_URL = 'https://phone-selling-app-mw21.onrender.com';

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { totalItems } = useSelector((state) => state.cart);
  
  // State to control dropdown visibility
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  // Ref for the dropdown element to handle outside clicks
  const dropdownRef = useRef(null);
  
  // Search functionality states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    setDropdownOpen(false);
  };
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      // Clear any pending search timeouts
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [dropdownRef, searchRef]);
  
  // Navigate to profile page and close dropdown
  const navigateToProfile = (path) => {
    navigate(path);
    setDropdownOpen(false);
  };
  
  // Search products with debounce
  const handleSearchInputChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Clear any existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (query.trim().length === 0) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }
    
    // Set a new timeout for debounce
    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await axios.get(`${API_URL}/api/v1/product/search`, {
          params: {
            keyword: query,
            page: 1,
            size: 5 // Limit to 5 results for the dropdown
          }
        });
        
        if (response.data && response.data.data && response.data.data.content) {
          setSearchResults(response.data.data.content);
          setShowSearchResults(true);
        }
      } catch (error) {
        console.error('Error searching products:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300); // 300ms debounce
  };
  
  // Navigate to product detail and close search results
  const navigateToProduct = (productId) => {
    navigate(`/product/${productId}`);
    setShowSearchResults(false);
    setSearchQuery('');
  };
  
  // Handle search form submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?keyword=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearchResults(false);
    }
  };

  return (
    <header className="main-header">
      <div className="header-container">
        <div className="logo">
          <Link to="/">
            <h1>TechShop</h1>
          </Link>
        </div>

        <div className="search-bar" ref={searchRef}>
          <form onSubmit={handleSearchSubmit}>
            <input 
              type="text" 
              placeholder="Tìm kiếm sản phẩm..." 
              value={searchQuery}
              onChange={handleSearchInputChange}
              onFocus={() => { if (searchResults.length > 0) setShowSearchResults(true) }}
            />
            <button type="submit">
              <FaSearch />
            </button>
          </form>
          
          {showSearchResults && (
            <div className="search-results-dropdown">
              {isSearching ? (
                <div className="search-loading">Đang tìm kiếm...</div>
              ) : searchResults.length > 0 ? (
                <>
                  <div className="search-results-list">
                    {searchResults.map((product) => (
                      <div 
                        key={product.id} 
                        className="search-result-item"
                        onClick={() => navigateToProduct(product.id)}
                      >
                        <div className="search-result-image">
                          <img 
                            src={product.image && product.image.base64 
                              ? `data:image/jpeg;base64,${product.image.base64}` 
                              : 'https://via.placeholder.com/50x50?text=No+Image'} 
                            alt={product.name} 
                          />
                        </div>
                        <div className="search-result-details">
                          <div className="search-result-name">{product.name}</div>
                          <div className="search-result-price">{product.price.toLocaleString('vi-VN')}đ</div>
                          <div className="search-result-rating">
                            <FaStar className="rating-star" />
                            <span>{product.rating} ({product.reviewsCount})</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="search-results-footer">
                    <button 
                      className="view-all-results"
                      onClick={() => {
                        navigate(`/search?keyword=${encodeURIComponent(searchQuery.trim())}`);
                        setShowSearchResults(false);
                      }}
                    >
                      Xem tất cả kết quả
                    </button>
                  </div>
                </>
              ) : (
                <div className="no-results">Không tìm thấy sản phẩm nào</div>
              )}
            </div>
          )}
        </div>

        <nav className="main-nav">
          <ul>
            <li>
              {/* <Link to="/">Trang chủ</Link> */}
            </li>
            <li>
              {/* <Link to="/products">Sản phẩm</Link> */}
            </li>
            <li className="cart-icon">
              <Link to="/cart">
                <FaShoppingCart />
                {totalItems > 0 && <span className="cart-count">{totalItems}</span>}
              </Link>
            </li>
            {isAuthenticated ? (
              <li className="user-dropdown" ref={dropdownRef}>
                <div className="user-menu-trigger" onClick={() => setDropdownOpen(!dropdownOpen)}>
                  <FaUserCircle />
                  <span>{user?.fullName || user?.name || 'Tài khoản'}</span>
                </div>
                {dropdownOpen && (
                  <div className="dropdown-menu">
                    <button onClick={() => navigateToProfile('/profile')} className="dropdown-item">
                      <FaUser className="dropdown-icon" /> Thông tin tài khoản
                    </button>
                    <button onClick={() => navigateToProfile('/profile?tab=orders')} className="dropdown-item">
                      <FaListAlt className="dropdown-icon" /> Đơn hàng của tôi
                    </button>
                    <button onClick={() => navigateToProfile('/profile?tab=reviews')} className="dropdown-item">
                      <FaClipboardList className="dropdown-icon" /> Đánh giá sản phẩm
                    </button>
                    <button onClick={handleLogout} className="dropdown-item logout-button">
                      <FaSignOutAlt className="dropdown-icon" /> Đăng xuất
                    </button>
                  </div>
                )}
              </li>
            ) : (
              <li>
                <Link to="/login" className="auth-link">Đăng nhập</Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
