import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// API URL
const API_URL = 'https://phone-selling-app-mw21.onrender.com';

// Async thunk để lấy thông tin khuyến mãi theo ID
export const fetchPromotionById = createAsyncThunk(
  'promotions/fetchById',
  async (promotionId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/promotion/${promotionId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể lấy thông tin khuyến mãi');
    }
  }
);

// Async thunk để lấy tất cả khuyến mãi
export const fetchAllPromotions = createAsyncThunk(
  'promotions/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/promotion`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể lấy danh sách khuyến mãi');
    }
  }
);

// Initial state
const initialState = {
  promotions: [],
  currentPromotion: null,
  loading: false,
  error: null,
  showPromotionModal: false
};

// Slice
const promotionSlice = createSlice({
  name: 'promotions',
  initialState,
  reducers: {
    setCurrentPromotion: (state, action) => {
      state.currentPromotion = action.payload;
    },
    setShowPromotionModal: (state, action) => {
      state.showPromotionModal = action.payload;
    },
    clearPromotionError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchPromotionById
      .addCase(fetchPromotionById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPromotionById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPromotion = action.payload;
      })
      .addCase(fetchPromotionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // fetchAllPromotions
      .addCase(fetchAllPromotions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllPromotions.fulfilled, (state, action) => {
        state.loading = false;
        state.promotions = action.payload;
      })
      .addCase(fetchAllPromotions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

// Export actions và reducer
export const { setCurrentPromotion, setShowPromotionModal, clearPromotionError } = promotionSlice.actions;
export default promotionSlice.reducer;
