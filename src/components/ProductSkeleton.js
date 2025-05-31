import React from 'react';
import '../assets/styles/HomePage.css';

const ProductSkeleton = () => {
  return (
    <div className="product-card skeleton">
      <div className="product-image-skeleton"></div>
      <div className="product-title-skeleton"></div>
      <div className="product-price-skeleton"></div>
      <div className="product-price-skeleton" style={{ width: '40%' }}></div>
    </div>
  );
};

export default ProductSkeleton;
