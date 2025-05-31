import React, { useState, useEffect } from "react";
import "../assets/styles/CartItem.css";
import {
  FaAngleDown,
  FaPercentage
} from "react-icons/fa";

const CartItem = ({ product, updateQuantity, removeProduct, formatPrice }) => {
  const [imageUrl, setImageUrl] = useState(
    "https://via.placeholder.com/100x100?text=Loading"
  );

  // Kiểm tra xem sản phẩm có đang giảm giá không
  const isDiscounted =
    product.catalogItem.basePrice > product.catalogItem.price;

  // Tính phần trăm giảm giá
  const discountPercent = isDiscounted
    ? Math.round(
        ((product.catalogItem.basePrice - product.catalogItem.price) /
          product.catalogItem.basePrice) *
          100
      )
    : 0;

  // Xử lý ảnh base64
  useEffect(() => {
    // Lấy ảnh từ variant hoặc từ catalogItem
    const base64Data = product.variant?.images?.[0]?.base64 || product.catalogItem?.image?.base64;
    
    if (base64Data && typeof base64Data === 'string' && base64Data.length > 0) {
      // Kiểm tra xem chuỗi base64 đã có đầu "data:image/" chưa
      if (base64Data.startsWith('data:image/')) {
        setImageUrl(base64Data);
      } else {
        // Nếu là chuỗi base64 thuần, thêm prefix
        setImageUrl(`data:image/jpeg;base64,${base64Data}`);
      }
    } else {
      // Ảnh mặc định nếu không có base64
      setImageUrl("https://via.placeholder.com/100x100?text=No+Image");
    }
  }, [product]);

  return (
    <div className="cart-item">
      <div className="item-main">
        {/* Hình ảnh */}
        <div className="product-image">
          {isDiscounted && (
            <div className="discount-badge">-{discountPercent}%</div>
          )}
          <img
            src={imageUrl}
            alt={product.catalogItem.name}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://via.placeholder.com/100x100?text=Error";
            }}
          />
        </div>

        {/* Thông tin sản phẩm */}
        <div className="product-info">
          <h3 className="product-name">{product.catalogItem.name}</h3>
          {product.variant?.color && (
            <div className="product-variant">
              <span className="variant-label">{product.variant.color}</span>
              <FaAngleDown className="variant-icon" />
            </div>
          )}
        </div>

        {/* Giá sản phẩm */}
        <div className="product-price">
          <div className="price-container">
            <span className="current-price">{formatPrice(product.catalogItem.price)}</span>
            {isDiscounted && (
              <span className="original-price">{formatPrice(product.catalogItem.basePrice)}</span>
            )}
          </div>
        </div>
      </div>

      {/* Phần điều khiển */}
      <div className="item-actions">
        <div className="action-buttons">
          <button
            className="remove-btn"
            onClick={() => removeProduct(product.id)}
          >
            Xóa
          </button>

          <div className="quantity-controls">
            <button
              className="quantity-btn minus"
              onClick={() => updateQuantity(product.id, product.quantity - 1)}
              disabled={product.quantity <= 1}
            >
              −
            </button>

            <input
              type="text"
              className="quantity-input"
              value={product.quantity}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (!isNaN(value) && value >= 1) {
                  updateQuantity(product.id, value);
                }
              }}
              min="1"
            />

            <button
              className="quantity-btn plus"
              onClick={() => updateQuantity(product.id, product.quantity + 1)}
            >
              +
            </button>
          </div>
        </div>

        <div className="item-total">
          <span className="item-total-price">
            {formatPrice(product.catalogItem.price * product.quantity)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
