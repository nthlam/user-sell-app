import React from 'react';
import { useDispatch } from 'react-redux';
import { fetchProductsByCategory } from '../redux/slices/productSlice';
import '../assets/styles/CategoryNav.css';

const CategoryNav = () => {
  const dispatch = useDispatch();
  
  // Danh sách các danh mục
  const categories = [
    { id: 2, name: 'Điện thoại' },
    { id: 4, name: 'Laptop' },
    { id: 7, name: 'Đồng hồ' },
    { id: 8, name: 'Smartwatch' },
    { id: 9, name: 'Tablet' },
    { id: 11, name: 'Tai nghe' }
  ];
  
  // Xử lý khi người dùng nhấp vào danh mục
  const handleCategoryClick = (categoryId) => {
    dispatch(fetchProductsByCategory({ categoryId, page: 1 }));
  };
  
  return (
    <nav className="category-nav">
      <div className="category-container">
        <ul className="category-list">
          <li className="category-item">
            <button 
              className="category-button active"
              onClick={() => dispatch(fetchProductsByCategory({ categoryId: null, page: 1 }))}
            >
              Tất cả
            </button>
          </li>
          {categories.map((category) => (
            <li key={category.id} className="category-item">
              <button 
                className="category-button"
                onClick={() => handleCategoryClick(category.id)}
              >
                {category.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default CategoryNav;
