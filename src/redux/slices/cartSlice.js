import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Thunk action để lấy giỏ hàng của người dùng từ API
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      // API endpoint sẽ được thay thế khi có thông tin chi tiết
      const response = await axios.get('/api/cart', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể lấy giỏ hàng');
    }
  }
);

// Thunk action để thêm sản phẩm vào giỏ hàng
export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ productId, quantity = 1 }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      // API endpoint sẽ được thay thế khi có thông tin chi tiết
      const response = await axios.post('/api/cart/add', 
        { productId, quantity },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể thêm vào giỏ hàng');
    }
  }
);

// Thunk action để cập nhật số lượng sản phẩm trong giỏ hàng
export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      // API endpoint sẽ được thay thế khi có thông tin chi tiết
      const response = await axios.put('/api/cart/update',
        { productId, quantity },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể cập nhật giỏ hàng');
    }
  }
);

// Thunk action để xóa sản phẩm khỏi giỏ hàng
export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (productId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      // API endpoint sẽ được thay thế khi có thông tin chi tiết
      const response = await axios.delete(`/api/cart/remove/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return { ...response.data, productId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể xóa khỏi giỏ hàng');
    }
  }
);

// Thunk action để tạo đơn hàng từ giỏ hàng
export const createOrder = createAsyncThunk(
  'cart/createOrder',
  async (shippingInfo, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      // API endpoint sẽ được thay thế khi có thông tin chi tiết
      const response = await axios.post('/api/orders', 
        shippingInfo,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể tạo đơn hàng');
    }
  }
);

// Local storage cart functions for guests
const getLocalCart = () => {
  const localCart = localStorage.getItem('cart');
  return localCart ? JSON.parse(localCart) : { items: [], totalAmount: 0, totalItems: 0 };
};

const updateLocalCart = (cart) => {
  localStorage.setItem('cart', JSON.stringify(cart));
  return cart;
};

const initialState = {
  items: [],
  totalAmount: 0,
  totalItems: 0,
  loading: false,
  error: null,
  orderSuccess: false,
  lastOrder: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Thêm sản phẩm vào giỏ hàng local (cho khách)
    addToLocalCart: (state, action) => {
      const { product, quantity = 1 } = action.payload;
      const existingItem = state.items.find(item => item.product.id === product.id);
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({ product, quantity });
      }
      
      state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0);
      state.totalAmount = state.items.reduce(
        (total, item) => total + (item.product.price * item.quantity), 0
      );
      
      // Cập nhật localStorage
      updateLocalCart({
        items: state.items,
        totalAmount: state.totalAmount,
        totalItems: state.totalItems
      });
    },
    
    // Cập nhật số lượng sản phẩm trong giỏ hàng local
    updateLocalCartItem: (state, action) => {
      const { productId, quantity } = action.payload;
      const item = state.items.find(item => item.product.id === productId);
      
      if (item) {
        item.quantity = quantity;
        state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0);
        state.totalAmount = state.items.reduce(
          (total, item) => total + (item.product.price * item.quantity), 0
        );
        
        // Cập nhật localStorage
        updateLocalCart({
          items: state.items,
          totalAmount: state.totalAmount,
          totalItems: state.totalItems
        });
      }
    },
    
    // Xóa sản phẩm khỏi giỏ hàng local
    removeFromLocalCart: (state, action) => {
      const productId = action.payload;
      state.items = state.items.filter(item => item.product.id !== productId);
      
      state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0);
      state.totalAmount = state.items.reduce(
        (total, item) => total + (item.product.price * item.quantity), 0
      );
      
      // Cập nhật localStorage
      updateLocalCart({
        items: state.items,
        totalAmount: state.totalAmount,
        totalItems: state.totalItems
      });
    },
    
    // Xóa toàn bộ giỏ hàng local
    clearLocalCart: (state) => {
      state.items = [];
      state.totalItems = 0;
      state.totalAmount = 0;
      localStorage.removeItem('cart');
    },
    
    // Đồng bộ giỏ hàng local với state khi load trang
    loadLocalCart: (state) => {
      const localCart = getLocalCart();
      state.items = localCart.items;
      state.totalAmount = localCart.totalAmount;
      state.totalItems = localCart.totalItems;
    },
    
    resetOrderSuccess: (state) => {
      state.orderSuccess = false;
      state.lastOrder = null;
    },
    
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch cart cases
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.totalAmount = action.payload.totalAmount;
        state.totalItems = action.payload.totalItems;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Add to cart cases
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.totalAmount = action.payload.totalAmount;
        state.totalItems = action.payload.totalItems;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update cart item cases
      .addCase(updateCartItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.totalAmount = action.payload.totalAmount;
        state.totalItems = action.payload.totalItems;
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Remove from cart cases
      .addCase(removeFromCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.totalAmount = action.payload.totalAmount;
        state.totalItems = action.payload.totalItems;
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create order cases
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.items = [];
        state.totalAmount = 0;
        state.totalItems = 0;
        state.orderSuccess = true;
        state.lastOrder = action.payload;
        localStorage.removeItem('cart');
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  addToLocalCart, 
  updateLocalCartItem, 
  removeFromLocalCart, 
  clearLocalCart, 
  loadLocalCart,
  resetOrderSuccess,
  clearError
} = cartSlice.actions;

export default cartSlice.reducer;
