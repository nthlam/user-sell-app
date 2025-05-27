import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Dữ liệu mẫu sản phẩm
const mockProducts = [
  {
    id: 1,
    name: 'iPhone 15 Pro Max',
    price: 34990000,
    image: 'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:80/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-15-pro-max-black-titanium-pure-back-iphone-15-pro-max-black-titanium-pure-front-2up-screen-usen.png',
    description: 'Điện thoại iPhone 15 Pro Max mới nhất với công nghệ hàng đầu',
    category: 'Điện thoại',
    stock: 15
  },
  {
    id: 2,
    name: 'Samsung Galaxy S24 Ultra',
    price: 31990000,
    image: 'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:80/plain/https://cellphones.com.vn/media/catalog/product/s/2/s24-ultra_1__1.png',
    description: 'Flagship Android mạnh mẽ với camera chất lượng cao',
    category: 'Điện thoại',
    stock: 20
  },
  {
    id: 3,
    name: 'MacBook Pro 16 inch M3 Pro',
    price: 65990000,
    image: 'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:80/plain/https://cellphones.com.vn/media/catalog/product/m/a/macbook-pro-16-inch-m3-pro-2023-gray.png',
    description: 'Laptop chuyên dụng cho đồ họa và công việc nặng',
    category: 'Laptop',
    stock: 8
  },
  {
    id: 4,
    name: 'iPad Pro M2 12.9 inch',
    price: 28990000,
    image: 'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:80/plain/https://cellphones.com.vn/media/catalog/product/i/p/ipad-pro-13-select-wifi-spacegray-202210-02.jpg',
    description: 'Máy tính bảng chuyên nghiệp cho công việc sáng tạo',
    category: 'Máy tính bảng',
    stock: 12
  },
  {
    id: 5,
    name: 'Tai nghe Apple AirPods Pro 2',
    price: 5990000,
    image: 'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:80/plain/https://cellphones.com.vn/media/catalog/product/g/r/group_170_1_1.png',
    description: 'Tai nghe true wireless chống ồn chủ động thế hệ mới',
    category: 'Phụ kiện',
    stock: 30
  },
  {
    id: 6,
    name: 'Apple Watch Series 9',
    price: 10990000,
    image: 'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:80/plain/https://cellphones.com.vn/media/catalog/product/a/p/apple-watch-series-9-gps-41mm_1.png',
    description: 'Đồng hồ thông minh cao cấp với nhiều tính năng sức khỏe',
    category: 'Đồng hồ thông minh',
    stock: 18
  }
];

// API URL
const API_URL = 'https://phone-selling-app-mw21.onrender.com';

// Category IDs
const CATEGORY_IDS = {
  PHONE: 2,
  LAPTOP: 4,
  WATCH: 7,
  SMARTWATCH: 8,
  TABLET: 9,
  HEADPHONE: 11
};

// Thunk action để lấy danh sách sản phẩm nổi bật (featured products)
export const fetchFeaturedProducts = createAsyncThunk(
  'products/fetchFeaturedProducts',
  async (_, { rejectWithValue }) => {
    try {
      // Gọi API với tham số size=10 cho sản phẩm nổi bật
      const response = await axios.get(`${API_URL}/api/v1/product/search`, {
        params: {
          page: 1,
          size: 10
        }
      });
      return response.data.data.content;
    } catch (error) {
      console.error('API Error fetching featured products:', error);
      // Fallback về mock data nếu API không hoạt động
      return mockProducts.slice(0, 10);
    }
  }
);

// Thunk action để lấy danh sách tất cả sản phẩm với phân trang
export const fetchAllProducts = createAsyncThunk(
  'products/fetchAllProducts',
  async (page = 1, { rejectWithValue }) => {
    try {
      // Gọi API với tham số size=12 cho danh sách tất cả sản phẩm
      const response = await axios.get(`${API_URL}/api/v1/product/search`, {
        params: {
          page: page,
          size: 12
        }
      });
      return {
        content: response.data.data.content,
        totalPages: response.data.data.totalPages || 10,
        currentPage: page
      };
    } catch (error) {
      console.error('API Error fetching all products:', error);
      // Fallback về mock data nếu API không hoạt động
      return {
        content: mockProducts.slice((page - 1) * 12, page * 12),
        totalPages: Math.ceil(mockProducts.length / 12),
        currentPage: page
      };
    }
  }
);

// Thunk action để lấy danh sách sản phẩm điện thoại
export const fetchPhoneProducts = createAsyncThunk(
  'products/fetchPhoneProducts',
  async (_, { rejectWithValue }) => {
    try {
      // Gọi API với tham số size=12 và categoryId=2 (Phone)
      const response = await axios.get(`${API_URL}/api/v1/product/search`, {
        params: {
          page: 1,
          size: 12,
          categoryId: CATEGORY_IDS.PHONE
        }
      });
      return response.data.data.content;
    } catch (error) {
      console.error('API Error fetching phone products:', error);
      // Fallback về mock data điện thoại nếu API không hoạt động
      return mockProducts.filter(product => product.category === 'Điện thoại');
    }
  }
);

// Thunk action để lấy danh sách smartwatch
export const fetchSmartwatchProducts = createAsyncThunk(
  'products/fetchSmartwatchProducts',
  async (_, { rejectWithValue }) => {
    try {
      // Gọi API với tham số size=12 và categoryId=8 (Smartwatch)
      const response = await axios.get(`${API_URL}/api/v1/product/search`, {
        params: {
          page: 1,
          size: 12,
          categoryId: CATEGORY_IDS.SMARTWATCH
        }
      });
      return response.data.data.content;
    } catch (error) {
      console.error('API Error fetching smartwatch products:', error);
      // Fallback về mock data smartwatch nếu API không hoạt động
      return mockProducts.filter(product => product.category === 'Đồng hồ thông minh');
    }
  }
);

// Giữ lại cho backward compatibility
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      // Thử kết nối với API thực tế
      const response = await axios.get(`${API_URL}/api/v1/product/search`);
      return response.data.data.content;
    } catch (error) {
      console.error('API Error:', error);
      // Fallback về mock data nếu API không hoạt động
      return mockProducts;
    }
  }
);

// Thunk action để lấy sản phẩm theo danh mục với phân trang
export const fetchProductsByCategory = createAsyncThunk(
  'products/fetchProductsByCategory',
  async ({ categoryId, page = 1 }, { rejectWithValue }) => {
    try {
      // Nếu không có categoryId, lấy tất cả sản phẩm
      const params = {
        page: page,
        size: 12
      };

      if (categoryId) {
        params.categoryId = categoryId;
      }
      
      // Lấy sản phẩm theo categoryId
      const response = await axios.get(`${API_URL}/api/v1/product/search`, { params });
      return {
        content: response.data.data.content,
        totalPages: response.data.data.totalPages || 10,
        currentPage: page,
        categoryId: categoryId || null
      };
    } catch (error) {
      console.error('API Error:', error);
      // Fallback về dữ liệu mẫu được lọc theo category
      let filteredProducts = mockProducts;
      
      if (categoryId) {
        // Giả lập lọc sản phẩm theo id của danh mục
        filteredProducts = mockProducts.filter(product => {
          // Map giữa tên danh mục và id
          const categoryMap = {
            'Điện thoại': 2,
            'Laptop': 4,
            'Đồng hồ thông minh': 8,
            'Máy tính bảng': 9,
            'Phụ kiện': 11
          };
          
          return categoryMap[product.category] === categoryId;
        });
        
        if (filteredProducts.length === 0) {
          filteredProducts = mockProducts;
        }
      }
      
      const startIndex = (page - 1) * 12;
      const endIndex = startIndex + 12;
      
      return {
        content: filteredProducts.slice(startIndex, endIndex),
        totalPages: Math.ceil(filteredProducts.length / 12),
        currentPage: page,
        categoryId: categoryId || null
      };
    }
  }
);

// Thunk action để lấy chi tiết sản phẩm từ API
export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/product/${productId}`);
      return response.data.data;
    } catch (error) {
      console.error('API Error:', error);
      // Fallback về mock data nếu API không hoạt động
      const mockProductDetail = mockProducts.find(product => product.id === Number(productId));
      if (mockProductDetail) {
        return {
          ...mockProductDetail,
          code: `PROD-${mockProductDetail.id}`,
          description: `Chi tiết về sản phẩm ${mockProductDetail.name}. Đây là một sản phẩm chất lượng cao với nhiều tính năng ưu việt.`,
          productLine: {
            id: mockProductDetail.id,
            name: mockProductDetail.name,
            code: `LINE-${mockProductDetail.id}`,
            category: {
              id: 2,
              name: mockProductDetail.category
            },
            brand: {
              id: 1,
              name: 'Apple',
              imageId: ''
            }
          },
          promotions: [
            {
              id: 1,
              name: 'Giảm giá mùa hè',
              value: mockProductDetail.price * 0.1,
              startDate: new Date().toISOString(),
              endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
              categoryId: 2
            }
          ],
          attributes: [
            {
              id: 1,
              value: 'A15 Bionic',
              attribute: {
                id: 1,
                name: 'CPU',
                categoryId: 2
              }
            },
            {
              id: 2,
              value: '6GB',
              attribute: {
                id: 2,
                name: 'RAM',
                categoryId: 2
              }
            },
            {
              id: 3,
              value: '256GB',
              attribute: {
                id: 3,
                name: 'Bộ nhớ',
                categoryId: 2
              }
            },
            {
              id: 4,
              value: '6.1 inch, Super Retina XDR',
              attribute: {
                id: 4,
                name: 'Màn hình',
                categoryId: 2
              }
            }
          ]
        };
      }
      return rejectWithValue(error.response?.data?.message || 'Không thể lấy chi tiết sản phẩm');
    }
  }
);

const initialState = {
  products: [],
  featuredProducts: [],
  allProducts: [],
  phoneProducts: [],
  smartwatchProducts: [],
  productDetail: null,
  loading: false,
  loadingFeatured: false,
  loadingAll: false,
  loadingPhones: false,
  loadingSmartwatch: false,
  error: null,
  errorFeatured: null,
  errorAll: null,
  errorPhones: null,
  errorSmartwatch: null,
  relatedProducts: [],
  loadingRelated: false,
  errorRelated: null,
  // Thêm các trường cho phân trang
  currentPage: 1,
  totalPages: 1,
  currentCategory: null
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearProductError: (state) => {
      state.error = null;
    },
    setFeaturedProducts: (state, action) => {
      state.featuredProducts = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Xử lý fetchFeaturedProducts
      .addCase(fetchFeaturedProducts.pending, (state) => {
        state.loadingFeatured = true;
        state.errorFeatured = null;
      })
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.loadingFeatured = false;
        state.featuredProducts = action.payload;
      })
      .addCase(fetchFeaturedProducts.rejected, (state, action) => {
        state.loadingFeatured = false;
        state.errorFeatured = action.payload || 'Không thể tải sản phẩm nổi bật';
      })
      
      // Xử lý fetchAllProducts với phân trang
      .addCase(fetchAllProducts.pending, (state) => {
        state.loadingAll = true;
        state.errorAll = null;
      })
      .addCase(fetchAllProducts.fulfilled, (state, action) => {
        state.loadingAll = false;
        state.allProducts = action.payload.content;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(fetchAllProducts.rejected, (state, action) => {
        state.loadingAll = false;
        state.errorAll = action.payload || 'Không thể tải danh sách sản phẩm';
      })
      
      // Xử lý fetchPhoneProducts
      .addCase(fetchPhoneProducts.pending, (state) => {
        state.loadingPhones = true;
        state.errorPhones = null;
      })
      .addCase(fetchPhoneProducts.fulfilled, (state, action) => {
        state.loadingPhones = false;
        state.phoneProducts = action.payload;
      })
      .addCase(fetchPhoneProducts.rejected, (state, action) => {
        state.loadingPhones = false;
        state.errorPhones = action.payload || 'Không thể tải sản phẩm điện thoại';
      })
      
      // Xử lý fetchSmartwatchProducts
      .addCase(fetchSmartwatchProducts.pending, (state) => {
        state.loadingSmartwatch = true;
        state.errorSmartwatch = null;
      })
      .addCase(fetchSmartwatchProducts.fulfilled, (state, action) => {
        state.loadingSmartwatch = false;
        state.smartwatchProducts = action.payload;
      })
      .addCase(fetchSmartwatchProducts.rejected, (state, action) => {
        state.loadingSmartwatch = false;
        state.errorSmartwatch = action.payload || 'Không thể tải sản phẩm smartwatch';
      })
      
      // Giữ lại cho backward compatibility
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Có lỗi xảy ra khi tải sản phẩm';
      })
      .addCase(fetchProductsByCategory.pending, (state) => {
        state.loadingAll = true;
        state.errorAll = null;
      })
      .addCase(fetchProductsByCategory.fulfilled, (state, action) => {
        state.loadingAll = false;
        state.allProducts = action.payload.content;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
        state.currentCategory = action.payload.categoryId;
      })
      .addCase(fetchProductsByCategory.rejected, (state, action) => {
        state.loadingAll = false;
        state.errorAll = action.payload || 'Không thể lấy sản phẩm theo danh mục';
      })
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearProductError, setFeaturedProducts } = productSlice.actions;
export default productSlice.reducer;
