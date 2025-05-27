import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaStar, FaSearch } from 'react-icons/fa';
import '../assets/styles/SearchResultsPage.css';

const API_URL = 'https://phone-selling-app-mw21.onrender.com';

const SearchResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const resultsPerPage = 12; // Number of results per page

  // Extract search query from URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const keyword = searchParams.get('keyword');
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')) : 1;
    
    if (keyword) {
      setSearchQuery(keyword);
      setCurrentPage(page);
      fetchSearchResults(keyword, page);
    } else {
      setError('Vui lòng nhập từ khóa tìm kiếm');
      setLoading(false);
    }
  }, [location.search]);

  // Fetch search results
  const fetchSearchResults = async (keyword, page = 1) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/v1/product/search`, {
        params: {
          keyword,
          page,
          size: resultsPerPage
        }
      });
      
      if (response.data && response.data.data) {
        setSearchResults(response.data.data.content || []);
        setTotalResults(response.data.data.totalElements || 0);
        setTotalPages(response.data.data.totalPages || 1);
      } else {
        setSearchResults([]);
        setTotalResults(0);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Error fetching search results:', err);
      setError('Đã xảy ra lỗi khi tìm kiếm. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?keyword=${encodeURIComponent(searchQuery.trim())}&page=1`);
    }
  };

  // Navigate to a specific page
  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    navigate(`/search?keyword=${encodeURIComponent(searchQuery)}&page=${page}`);
  };

  // Generate pagination items
  const renderPagination = () => {
    const paginationItems = [];
    
    // Previous page button
    paginationItems.push(
      <button 
        key="prev" 
        className={`pagination-btn prev-btn ${currentPage === 1 ? 'disabled' : ''}`}
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Trước
      </button>
    );
    
    // Page numbers
    const pageRange = 2; // Number of pages to show before and after current page
    let startPage = Math.max(1, currentPage - pageRange);
    let endPage = Math.min(totalPages, currentPage + pageRange);
    
    // Adjust if we're at the beginning or end
    if (currentPage <= pageRange) {
      endPage = Math.min(totalPages, startPage + pageRange * 2);
    }
    if (currentPage > totalPages - pageRange) {
      startPage = Math.max(1, endPage - pageRange * 2);
    }
    
    // First page
    if (startPage > 1) {
      paginationItems.push(
        <button key="1" className="pagination-btn" onClick={() => goToPage(1)}>1</button>
      );
      if (startPage > 2) {
        paginationItems.push(<span key="ellipsis1" className="pagination-ellipsis">...</span>);
      }
    }
    
    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      paginationItems.push(
        <button 
          key={i} 
          className={`pagination-btn ${i === currentPage ? 'active' : ''}`}
          onClick={() => goToPage(i)}
        >
          {i}
        </button>
      );
    }
    
    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        paginationItems.push(<span key="ellipsis2" className="pagination-ellipsis">...</span>);
      }
      paginationItems.push(
        <button 
          key={totalPages} 
          className="pagination-btn" 
          onClick={() => goToPage(totalPages)}
        >
          {totalPages}
        </button>
      );
    }
    
    // Next page button
    paginationItems.push(
      <button 
        key="next" 
        className={`pagination-btn next-btn ${currentPage === totalPages ? 'disabled' : ''}`}
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Tiếp
      </button>
    );
    
    return paginationItems;
  };

  return (
    <div className="search-results-page">
      <div className="search-header">
        <h1>Kết quả tìm kiếm</h1>
        <div className="search-form">
          <form onSubmit={handleSearch}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm sản phẩm..."
            />
            <button type="submit">
              <FaSearch />
            </button>
          </form>
        </div>
      </div>
      
      {loading ? (
        <div className="search-loading">
          <div className="loading-spinner"></div>
          <p>Đang tìm kiếm...</p>
        </div>
      ) : error ? (
        <div className="search-error">
          <p>{error}</p>
        </div>
      ) : (
        <div className="search-results-container">
          <div className="search-summary">
            {totalResults > 0 ? (
              <p>Tìm thấy <strong>{totalResults}</strong> kết quả cho <strong>"{searchQuery}"</strong></p>
            ) : (
              <p>Không tìm thấy kết quả nào cho <strong>"{searchQuery}"</strong></p>
            )}
          </div>
          
          {searchResults.length > 0 ? (
            <>
              <div className="search-results-grid">
                {searchResults.map((product) => (
                  <div 
                    key={product.id} 
                    className="product-card"
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    <div className="product-image">
                      <img 
                        src={product.image && product.image.base64 
                          ? `data:image/jpeg;base64,${product.image.base64}` 
                          : 'https://via.placeholder.com/300x300?text=No+Image'} 
                        alt={product.name} 
                      />
                    </div>
                    <div className="product-details">
                      <h3 className="product-name">{product.name}</h3>
                      <div className="product-rating">
                        <FaStar className="star-icon" />
                        <span>{product.rating} ({product.reviewsCount} đánh giá)</span>
                      </div>
                      <div className="product-price">
                        {product.price !== product.basePrice ? (
                          <>
                            <span className="current-price">{product.price.toLocaleString('vi-VN')}đ</span>
                            <span className="original-price">{product.basePrice.toLocaleString('vi-VN')}đ</span>
                          </>
                        ) : (
                          <span className="current-price">{product.price.toLocaleString('vi-VN')}đ</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {totalPages > 1 && (
                <div className="pagination">
                  {renderPagination()}
                </div>
              )}
            </>
          ) : (
            <div className="no-results">
              <p>Không tìm thấy sản phẩm nào phù hợp với từ khóa "{searchQuery}"</p>
              <p>Vui lòng thử lại với từ khóa khác hoặc xem các sản phẩm khác của chúng tôi</p>
              <button className="browse-products-btn" onClick={() => navigate('/')}>
                Xem tất cả sản phẩm
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchResultsPage;
