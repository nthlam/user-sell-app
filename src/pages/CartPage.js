import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../assets/styles/CartPage.css";
import CartItem from "../components/CartItem";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import {
  FaMapMarkerAlt,
  FaAngleRight,
  FaTimes,
  FaPen,
  FaPlus,
  FaTrash,
  FaCheckCircle,
  FaExclamationCircle,
  FaInfoCircle,
} from "react-icons/fa";

const CartPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [deliveryMethod, setDeliveryMethod] = useState("DELIVERY");
  const [modalDeliveryMethod, setModalDeliveryMethod] = useState("DELIVERY");

  const [invoiceData, setInvoiceData] = useState({
    companyName: "",
    companyAddress: "",
    taxCode: "",
    email: "",
  });

  // Thêm state để theo dõi các option đặc biệt
  const [specialRequests, setSpecialRequests] = useState({
    instruction: false,
    invoice: false,
    other: false,
  });

  // Hàm xử lý thay đổi checkbox yêu cầu đặc biệt
  const handleSpecialRequestChange = (e) => {
    const { name, checked } = e.target;
    setSpecialRequests({
      ...specialRequests,
      [name]: checked,
    });
  };

  const handleInvoiceInputChange = (e) => {
    const { name, value } = e.target;
    setInvoiceData({
      ...invoiceData,
      [name]: value,
    });
  };

  // Cập nhật state quản lý địa chỉ
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [addressError, setAddressError] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    receiveName: "",
    phone: "",
    address: "",
  });
  const [editingAddressId, setEditingAddressId] = useState(null);

  // Mở form thêm địa chỉ mới
  const openAddAddressForm = () => {
    setAddressForm({
      receiveName: "",
      phone: "",
      address: "",
    });
    setEditingAddressId(null);
    setShowAddressForm(true);
  };

  // Mở form chỉnh sửa địa chỉ
  const openEditAddressForm = (address) => {
    setAddressForm({
      receiveName: address.receiveName,
      phone: address.phone,
      address: address.address,
    });
    setEditingAddressId(address.id);
    setShowAddressForm(true);
  };

  // Xóa địa chỉ
  const deleteAddress = async (addressId) => {
    if (!window.confirm("Bạn có chắc muốn xóa địa chỉ này không?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showToast("Vui lòng đăng nhập để xóa địa chỉ!");
        return;
      }

      await axios.delete(
        `https://phone-selling-app-mw21.onrender.com/api/v1/user/shipping-info/${addressId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await fetchAddresses();

      showToast("Xóa địa chỉ thành công!");
    } catch (error) {
      console.error("Lỗi khi xóa địa chỉ:", error);
      showToast("Có lỗi xảy ra khi xóa địa chỉ. Vui lòng thử lại sau.");
    }
  };

  const saveAddress = async () => {
    try {
      if (
        !addressForm.receiveName ||
        !addressForm.phone ||
        !addressForm.address
      ) {
        showToast("Vui lòng điền đầy đủ thông tin địa chỉ!");
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        showToast("Vui lòng đăng nhập để lưu địa chỉ!");
        return;
      }

      const addressData = {
        receiveName: addressForm.receiveName,
        phone: addressForm.phone,
        address: addressForm.address,
      };

      if (editingAddressId) {
        addressData.id = editingAddressId;
      }

      const method = editingAddressId ? "put" : "post";
      const url =
        "https://phone-selling-app-mw21.onrender.com/api/v1/user/shipping-info";

      const response = await axios({
        method,
        url,
        data: addressData,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && response.data.data) {
        await fetchAddresses();
        if (!selectedAddressId || editingAddressId) {
          const newAddress = response.data.data;
          setSelectedAddressId(newAddress.id);
          setSelectedAddress(newAddress);
        }
      }

      setShowAddressForm(false);
      showToast(
        editingAddressId
          ? "Cập nhật địa chỉ thành công!"
          : "Thêm địa chỉ mới thành công!"
      );
    } catch (error) {
      console.error("Lỗi khi lưu địa chỉ:", error);
      if (error.response && error.response.data) {
        showToast(
          `Lỗi: ${error.response.data.meta?.message || "Không thể lưu địa chỉ"}`
        );
      } else {
        showToast("Có lỗi xảy ra khi lưu địa chỉ!");
      }
    }
  };
  const fetchAddresses = async () => {
    try {
      setLoadingAddresses(true);
      const token = localStorage.getItem("token");

      if (!token) {
        setLoadingAddresses(false);
        setAddressError("Vui lòng đăng nhập để xem địa chỉ giao hàng");
        return;
      }

      const response = await axios.get(
        "https://phone-selling-app-mw21.onrender.com/api/v1/user/shipping-info",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data?.data?.length > 0) {
        const addressesData = response.data.data;
        setAddresses(addressesData);

        if (
          !selectedAddressId ||
          !addressesData.find((addr) => addr.id === selectedAddressId)
        ) {
          setSelectedAddressId(addressesData[0].id);
          setSelectedAddress(addressesData[0]);
        }
        setAddressError(null);
      } else {
        setAddresses([]);
        setAddressError("Bạn chưa có địa chỉ giao hàng nào");
      }
    } catch (err) {
      console.error("Lỗi khi lấy địa chỉ giao hàng:", err);
      setAddressError("Không thể tải địa chỉ giao hàng. Vui lòng thử lại sau.");
    } finally {
      setLoadingAddresses(false);
    }
  };

  const [selectedAddress, setSelectedAddress] = useState({
    receiveName: "",
    phone: "",
    address: "",
  });

  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  const [products, setProducts] = useState([]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      console.log(
        "Token:",
        token ? `${token.substring(0, 10)}...` : "Không có token"
      );

      if (!token) {
        console.log("Người dùng chưa đăng nhập");
        setLoading(false);
        return;
      }

      console.log("Đang gọi API giỏ hàng với token");
      try {
        const response = await axios.get(
          "https://phone-selling-app-mw21.onrender.com/api/v1/user/cart",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("API Response:", response);
        if (response.data && response.data.data) {
          setProducts(response.data.data);
          setError(null);
        } else {
          console.log("Phản hồi API:", response.data);
          if (response.data.meta && response.data.meta.code === 100029) {
            setError(
              "Không tìm thấy biến thể sản phẩm trong giỏ hàng. Có thể sản phẩm đã bị gỡ khỏi hệ thống."
            );
          } else {
            setError("Không tìm thấy sản phẩm trong giỏ hàng");
          }
          setProducts([]);
        }
      } catch (apiError) {
        console.error("Chi tiết lỗi API:", {
          status: apiError.response?.status,
          statusText: apiError.response?.statusText,
          data: apiError.response?.data,
          message: apiError.message,
        });

        throw apiError;
      }
    } catch (err) {
      console.error("Lỗi khi lấy giỏ hàng:", err);
      if (err.response) {
        console.error("Thông tin lỗi response:", {
          status: err.response.status,
          statusText: err.response.statusText,
          data: err.response.data,
          headers: err.response.headers,
        });
      }

      if (err.response && err.response.status === 401) {
        console.error("Lỗi xác thực (401): Token không hợp lệ hoặc hết hạn");
        localStorage.removeItem("token");
        setError("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
      } else {
        console.error("Lỗi khác khi gọi API giỏ hàng:", err.message);
        setError("Không thể tải giỏ hàng. Vui lòng thử lại sau.");
      }

      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("useEffect CartPage được gọi");
    const token = localStorage.getItem("token");
    console.log(
      "Token trong useEffect:",
      token ? "Có token" : "Không có token"
    );

    if (token) {
      console.log("Gọi API fetchCart và fetchAddresses");
      fetchCart();
      fetchAddresses();
    } else {
      setLoading(false);
      setLoadingAddresses(false);
      console.log("Người dùng chưa đăng nhập, bỏ qua việc gọi API");
    }
  }, []);

  const subTotal = products.reduce(
    (sum, product) => sum + product.catalogItem.price * product.quantity,
    0
  );

  // Thêm state để theo dõi sản phẩm được chọn
  const [selectedProducts, setSelectedProducts] = useState({});
  const [selectAll, setSelectAll] = useState(false);

  // Hàm xử lý chọn/bỏ chọn một sản phẩm
  const handleSelectProduct = (productId, isSelected) => {
    setSelectedProducts((prev) => ({
      ...prev,
      [productId]: isSelected,
    }));
  };

  // Hàm xử lý chọn/bỏ chọn tất cả sản phẩm
  const handleSelectAll = (e) => {
    const isChecked = e.target.checked;
    setSelectAll(isChecked);

    const newSelectedProducts = {};
    products.forEach((product) => {
      newSelectedProducts[product.id] = isChecked;
    });
    setSelectedProducts(newSelectedProducts);
  };

  // Tính tổng tiền chỉ cho sản phẩm đã chọn
  const selectedSubTotal = products.reduce(
    (sum, product) =>
      sum + (selectedProducts[product.id] ? product.catalogItem.price * product.quantity : 0),
    0
  );

  // Đếm số sản phẩm đã chọn
  const selectedCount = Object.values(selectedProducts).filter(
    (selected) => selected
  ).length;

  const updateQuantity = async (id, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      const productToUpdate = products.find((product) => product.id === id);
      if (!productToUpdate) {
        console.error("Không tìm thấy sản phẩm với ID:", id);
        return;
      }
      setProducts(
        products.map((product) =>
          product.id === id ? { ...product, quantity: newQuantity } : product
        )
      );
      const token = localStorage.getItem("token");
      if (!token) return;
      const variantId = productToUpdate.variant?.id;
      if (!variantId) {
        console.error("Không tìm thấy variant ID cho sản phẩm:", id);
        return;
      }

      await axios.put(
        `https://phone-selling-app-mw21.onrender.com/api/v1/user/cart`,
        {
          variantId: variantId,
          quantity: newQuantity,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Cập nhật số lượng thành công");
    } catch (err) {
      console.error("Lỗi khi cập nhật số lượng sản phẩm:", err);
      showToast("Không thể cập nhật số lượng. Vui lòng thử lại.");
      fetchCart();
    }
  };

  const removeProduct = (id) => {
    setProducts(products.filter((product) => product.id !== id));
  };

  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
  };

  const handleAddressFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    console.log("Form change:", name, value, type, checked);
    setAddressForm({
      ...addressForm,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const openAddressModal = () => {
    setModalDeliveryMethod("DELIVERY");
    setShowAddressForm(false);
    setShowAddressModal(true);
    setSelectedAddressId(selectedAddress?.id);
  };

  const handleEditAddress = (address) => {
    const nameParts = address.receiveName.split(" ");
    const gender = nameParts[0];
    const name = nameParts.slice(1).join(" ");

    setAddressForm({
      gender,
      name: name,
      phone: address.phone,
      address: address.address,
      isDefault: address.isDefault,
    });
    setEditMode(true);
    setEditId(address.id);
    setShowAddressForm(true);
  };

  const handleNewAddress = () => {
    const currentGender = selectedAddress?.receiveName?.split(" ")[0] || "Chị";
    const currentName =
      selectedAddress?.receiveName?.split(" ").slice(1).join(" ") || "";
    const currentPhone = selectedAddress?.phone || "";

    setAddressForm({
      gender: currentGender,
      name: currentName,
      phone: currentPhone,
      address: "",
      isDefault: false,
    });

    setEditMode(false);
    setShowAddressForm(true);
  };

  const handleUserInfoChange = (field, value) => {
    if (field === "gender") {
      const currentName =
        selectedAddress?.receiveName?.split(" ").slice(1).join(" ") || "";
      const newReceiveName = `${value} ${currentName}`;
      setSelectedAddress({ ...selectedAddress, receiveName: newReceiveName });
    } else if (field === "name") {
      const currentGender =
        selectedAddress?.receiveName?.split(" ")[0] || "Chị";
      const newReceiveName = `${currentGender} ${value}`;
      setSelectedAddress({ ...selectedAddress, receiveName: newReceiveName });
    } else if (field === "phone") {
      setSelectedAddress({ ...selectedAddress, phone: value });
    }
  };

  const selectAddress = (address) => {
    const addressId = address.id;
    setSelectedAddressId(addressId);
    setSelectedAddress(address);
    setShowAddressModal(false);
    showToast("Đã chọn địa chỉ giao hàng", "success");
  };

  const handleAddressSave = async () => {
    const { gender, name, phone, address, isDefault } = addressForm;

    if (!address) {
      showToast("Vui lòng nhập địa chỉ!");
      return;
    }

    if (!name || !phone) {
      showToast("Vui lòng nhập đầy đủ họ tên và số điện thoại!");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        showToast("Vui lòng đăng nhập để thêm địa chỉ!");
        return;
      }
      const receiveName = `${gender} ${name}`;
      const addressData = {
        receiveName,
        phone,
        address,
        isDefault,
      };
      if (editMode && editId) {
        addressData.id = editId;
      }
      const response = await axios.put(
        "https://phone-selling-app-mw21.onrender.com/api/v1/user/shipping-info",
        addressData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Thêm/cập nhật địa chỉ thành công:", response.data);
      const newAddress = response.data.data;
      await fetchAddresses();
      if (newAddress) {
        setSelectedAddress(newAddress);
        setSelectedAddressId(newAddress.id);
      }
      setShowAddressForm(false);
      setShowAddressModal(false);
    } catch (error) {
      console.error("Lỗi xử lý địa chỉ:", error);
      if (error.response) {
        console.error("Response error:", error.response.data);
        showToast(
          `Lỗi: ${error.response.data.message || "Không thể xử lý địa chỉ"}`
        );
      } else {
        showToast("Có lỗi xảy ra khi xử lý địa chỉ!");
      }
    } finally {
      setLoading(false);
    }
  };
  const confirmAddressSelection = () => {
    const selectedAddr = addresses.find(
      (addr) => addr.id === selectedAddressId
    );

    if (selectedAddr) {
      setSelectedAddress(selectedAddr);
      if (modalDeliveryMethod === "PICKUP" && deliveryMethod === "DELIVERY") {
        setDeliveryMethod("PICKUP");
      } else if (
        modalDeliveryMethod === "DELIVERY" &&
        deliveryMethod === "PICKUP"
      ) {
        setDeliveryMethod("DELIVERY");
      }
    }
    setShowAddressModal(false);
  };

  const [orderNote, setOrderNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [processingPayment, setProcessingPayment] = useState(false); // Thêm state xử lý thanh toán VNPay
  // Hàm xử lý thanh toán VNPay
  const handleVNPayPayment = async () => {
    try {
      setProcessingPayment(true);

      // Gọi API tạo link thanh toán
      const response = await axios.get("http://localhost:4000/create_payment", {
        params: {
          amount: subTotal,
          bankCode: "", // Để trống để hiển thị tất cả ngân hàng
          language: "vn",
        },
      });

      if (response.data && response.data.paymentUrl) {
        // Lưu thông tin đơn hàng vào localStorage để sử dụng sau khi thanh toán
        localStorage.setItem(
          "pendingOrder",
          JSON.stringify({
            shippingInfoId:
              deliveryMethod === "DELIVERY" ? selectedAddressId : null,
            paymentMethod: "BANK_TRANSFER",
            receiveMethod: deliveryMethod,
            note: orderNote,
          })
        );

        // Chuyển hướng đến trang thanh toán VNPay
        window.location.href = response.data.paymentUrl;
      }
    } catch (error) {
      console.error("Lỗi khi tạo link thanh toán:", error);
      showToast("Không thể khởi tạo thanh toán. Vui lòng thử lại sau.", "error");
    } finally {
      setProcessingPayment(false);
    }
  };

  // Thêm hàm xử lý thanh toán ZaloPay
  const handleZaloPayment = async () => {
    try {
      setProcessingPayment(true);
      
      // Gọi API ZaloPay thay vì MoMo
      const response = await axios.post("http://localhost:4000/zalo/create-order", {
        amount: selectedSubTotal,
      });
      
      // Kiểm tra response từ ZaloPay dựa trên format thực tế
      if (response.data && response.data.data && response.data.data.return_code === 1) {
        // Lưu thông tin đơn hàng vào localStorage để sử dụng sau khi thanh toán
        localStorage.setItem(
          "pendingOrder",
          JSON.stringify({
            shippingInfoId: deliveryMethod === "DELIVERY" ? selectedAddressId : null,
            paymentMethod: "MOMO", // Vẫn giữ MOMO trong database
            receiveMethod: deliveryMethod,
            note: orderNote,
            selectedProductIds: Object.keys(selectedProducts).filter(id => selectedProducts[id]),
            zpTransToken: response.data.data.zp_trans_token // Lưu token để kiểm tra sau này
          })
        );
        
        // Sử dụng order_url từ response để redirect
        window.location.href = response.data.data.order_url;
      } else {
        const errorMessage = response.data?.data?.return_message || "Không thể khởi tạo thanh toán";
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Lỗi khi tạo đơn hàng ZaloPay:", error);
      showToast(`Không thể khởi tạo thanh toán: ${error.message}`, "error");
    } finally {
      setProcessingPayment(false);
    }
  };

  // Cập nhật hàm handleCheckout để sử dụng ZaloPay khi chọn MOMO
  const handleCheckout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showToast("Vui lòng đăng nhập để đặt hàng", "error");
        navigate("/login");
        return;
      }
      
      if (selectedCount === 0) {
        showToast("Vui lòng chọn ít nhất một sản phẩm để đặt hàng", "error");
        return;
      }
      
      if (deliveryMethod === "DELIVERY" && !selectedAddressId) {
        showToast("Vui lòng chọn địa chỉ giao hàng", "error");
        openAddressModal();
        return;
      }
      
      // Nếu là thanh toán qua VNPay
      if (paymentMethod === "BANK_TRANSFER") {
        handleVNPayPayment();
        return;
      }
      
      // Nếu là thanh toán qua ZaloPay (nhưng UI hiển thị là MOMO)
      if (paymentMethod === "MOMO") {
        handleZaloPayment();
        return;
      }
      
      // Các phương thức thanh toán khác (Cash)
      const selectedIds = Object.keys(selectedProducts).filter(
        id => selectedProducts[id]
      );
      
      const orderData = {
        shippingInfoId: deliveryMethod === "DELIVERY" ? selectedAddressId : null,
        paymentMethod: paymentMethod,
        receiveMethod: deliveryMethod,
        note: orderNote,
        selectedProductIds: selectedIds,
      };
      
      console.log("Thông tin đơn hàng:", orderData);
      const response = await axios.post(
        "https://phone-selling-app-mw21.onrender.com/api/v1/order/customer/create-from-cart",
        orderData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data && response.data.data) {
        showToast("Đặt hàng thành công!", "success");
        navigate("/order-confirmation", {
          state: {
            orderId: response.data.data.id,
            orderInfo: response.data.data,
          },
        });
      }
    } catch (error) {
      console.error("Lỗi khi đặt hàng:", error);
      
      if (error.response && error.response.data) {
        showToast(
          `Lỗi: ${error.response.data.meta?.message || "Không thể đặt hàng"}`,
          "error"
        );
      } else {
        showToast("Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại sau.", "error");
      }
    }
  };

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const showToast = (message, type = "success") => {
    setToast({
      show: true,
      message,
      type,
    });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3000);
  };

  return (
    <div className="cart-page">
      <div className="container">
        {/* Modal quản lý địa chỉ */}
        {showAddressModal && (
          <div className="address-modal-overlay">
            <div className="address-modal">
              <div className="modal-header">
                <h3>
                  {showAddressForm
                    ? editingAddressId
                      ? "Chỉnh sửa địa chỉ"
                      : "Thêm địa chỉ mới"
                    : "Địa chỉ giao hàng"}
                </h3>
                <button
                  className="modal-close-btn"
                  onClick={() => {
                    setShowAddressModal(false);
                    setShowAddressForm(false);
                  }}
                >
                  <FaTimes />
                </button>
              </div>

              <div className="modal-body">
                {!showAddressForm ? (
                  <>
                    {loadingAddresses ? (
                      <div className="loading-container">
                        <div className="loading-spinner small"></div>
                        <span>Đang tải danh sách địa chỉ...</span>
                      </div>
                    ) : addresses.length === 0 ? (
                      <div className="no-addresses">
                        <p>Bạn chưa có địa chỉ giao hàng nào</p>
                        <button
                          className="add-address-btn"
                          onClick={openAddAddressForm}
                        >
                          <FaPlus /> Thêm địa chỉ mới
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="addresses-list">
                          {addresses.map((address) => (
                            <div
                              key={address.id}
                              className={`address-item ${
                                selectedAddressId === address.id
                                  ? "selected"
                                  : ""
                              }`}
                              onClick={() => selectAddress(address)}
                            >
                              <div className="address-content">
                                <div className="address-name-phone">
                                  <span className="address-name">
                                    {address.receiveName}
                                  </span>
                                  <span className="address-phone">
                                    {address.phone}
                                  </span>
                                </div>
                                <div className="address-full">
                                  {address.address}
                                </div>
                              </div>
                              <div
                                className="address-actions"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  className="edit-address-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openEditAddressForm(address);
                                  }}
                                >
                                  <FaPen />
                                </button>
                                <button
                                  className="delete-address-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteAddress(address.id);
                                  }}
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        <button
                          className="add-address-btn"
                          onClick={openAddAddressForm}
                        >
                          <FaPlus /> Thêm địa chỉ mới
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <div className="address-form">
                    <div className="form-group">
                      <label htmlFor="receiveName">Họ và tên người nhận</label>
                      <input
                        type="text"
                        id="receiveName"
                        name="receiveName"
                        value={addressForm.receiveName}
                        onChange={handleAddressFormChange}
                        placeholder="Nhập họ tên người nhận hàng"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="phone">Số điện thoại</label>
                      <input
                        type="text"
                        id="phone"
                        name="phone"
                        value={addressForm.phone}
                        onChange={handleAddressFormChange}
                        placeholder="Nhập số điện thoại liên hệ"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="address">Địa chỉ nhận hàng</label>
                      <textarea
                        id="address"
                        name="address"
                        value={addressForm.address}
                        onChange={handleAddressFormChange}
                        placeholder="Nhập địa chỉ chi tiết (số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố)"
                        rows="3"
                      ></textarea>
                    </div>

                    <div className="form-actions">
                      <button
                        className="cancel-btn"
                        onClick={() => setShowAddressForm(false)}
                      >
                        Hủy
                      </button>
                      <button className="save-btn" onClick={saveAddress}>
                        {editingAddressId ? "Cập nhật" : "Thêm mới"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Hiển thị địa chỉ đã chọn */}
        {/*deliveryMethod === "DELIVERY" && (
          <div className="recipient-info">
            {loadingAddresses ? (
              <div className="loading-addresses">
                <div className="loading-spinner small"></div>
                <span>Đang tải địa chỉ...</span>
              </div>
            ) : addressError ? (
              <div className="address-error">
                <span className="error-message">{addressError}</span>
                <button className="add-address-btn" onClick={() => {
                  setShowAddressModal(true);
                  openAddAddressForm();
                }}>
                  <FaPlus /> Thêm địa chỉ mới
                </button>
              </div>
            ) : addresses.length > 0 ? (
              <div className="selected-address">
                <div className="recipient-header">
                  <div className="recipient-info">
                    <span className="recipient-name">{selectedAddress?.receiveName}</span>
                    <span className="recipient-phone">{selectedAddress?.phone}</span>
                  </div>
                  <button className="change-address-btn" onClick={() => setShowAddressModal(true)}>
                    Thay đổi
                  </button>
                </div>
                <div className="recipient-address">
                  <FaMapMarkerAlt className="location-icon" />
                  <span>{selectedAddress?.address}</span>
                </div>
              </div>
            ) : (
              <div className="no-address-info">
                <div className="no-address-text">
                  <FaMapMarkerAlt className="location-icon large" />
                  <span>Bạn chưa có địa chỉ giao hàng nào</span>
                </div>
                <button className="add-address-btn" onClick={() => {
                  setShowAddressModal(true);
                  openAddAddressForm();
                }}>
                  <FaPlus /> Thêm địa chỉ mới
                </button>
              </div>
            )}
          </div>
        )*/}

        {!localStorage.getItem("token") ? (
          <div className="login-required-container">
            <div className="login-required-content">
              <img
                src="https://cdn-icons-png.flaticon.com/512/6357/6357599.png"
                alt="Yêu cầu đăng nhập"
                className="login-required-image"
              />
              <h2 className="login-required-title">Vui lòng đăng nhập</h2>
              <p className="login-required-message">
                Bạn cần đăng nhập để xem giỏ hàng và thông tin giao hàng
              </p>
              <div className="login-required-buttons">
                <button
                  className="login-button"
                  onClick={() => navigate("/login")}
                >
                  Đăng nhập
                </button>
                <button className="home-button" onClick={() => navigate("/")}>
                  Về trang chủ
                </button>
              </div>
              <div className="customer-support">
                <p>
                  Khi cần trợ giúp vui lòng gọi{" "}
                  <span className="support-phone">1900 232 460</span> hoặc{" "}
                  <span className="support-phone">028.3622.1060</span>{" "}
                  <span className="support-time">(8h00 - 21h30)</span>
                </p>
              </div>
            </div>
          </div>
        ) : loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Đang tải giỏ hàng...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p className="error-message">{error}</p>
          </div>
        ) : (
          <>
            {/* Delivery Options */}
            <div className="delivery-options">
              <label
                className={`delivery-tab ${
                  deliveryMethod === "DELIVERY" ? "active" : ""
                }`}
              >
                <input
                  type="radio"
                  name="DELIVERY"
                  checked={deliveryMethod === "DELIVERY"}
                  onChange={() => setDeliveryMethod("DELIVERY")}
                />
                <span className="tab-label">Giao tận nơi</span>
              </label>
              <label
                className={`delivery-tab ${
                  deliveryMethod === "PICKUP" ? "active" : ""
                }`}
              >
                <input
                  type="radio"
                  name="DELIVERY"
                  checked={deliveryMethod === "PICKUP"}
                  onChange={() => setDeliveryMethod("PICKUP")}
                />
                <span className="tab-label">Nhận tại siêu thị</span>
              </label>
            </div>
            {/* Recipient Info */}
            {deliveryMethod === "DELIVERY" && (
              <div className="recipient-info">
                {loadingAddresses ? (
                  <div className="loading-addresses">
                    <div className="loading-spinner small"></div>
                    <span>Đang tải địa chỉ...</span>
                  </div>
                ) : addressError ? (
                  <div className="address-error">
                    <span className="error-message">{addressError}</span>
                    <button
                      className="add-address-button"
                      onClick={openAddressModal}
                    >
                      <FaPlus /> Thêm địa chỉ mới
                    </button>
                  </div>
                ) : addresses.length > 0 ? (
                  <>
                    <div className="recipient-header">
                      <span className="recipient-name">
                        Người nhận:{" "}
                        {selectedAddress?.receiveName || "Chưa có tên"} -{" "}
                        {selectedAddress?.phone || "Chưa có số điện thoại"}
                      </span>
                      <button
                        className="recipient-edit"
                        onClick={openAddressModal}
                      >
                        <FaAngleRight />
                      </button>
                    </div>
                    <div className="recipient-address">
                      <FaMapMarkerAlt className="location-icon" />
                      <span>
                        {selectedAddress?.address || "Chưa có địa chỉ"}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="no-address">
                    <div className="address-header">
                      <span className="address-warning">
                        Chưa có địa chỉ giao hàng nào
                      </span>
                      <button
                        className="add-address-button"
                        onClick={openAddressModal}
                      >
                        <FaPlus /> Thêm địa chỉ mới
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            {/* Products List */}
            <div className="products-list">
              {/* Thêm header cho danh sách sản phẩm */}
              <div className="products-header">
                <div className="select-all-container">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    id="select-all"
                  />
                  <label htmlFor="select-all">Chọn tất cả ({products.length})</label>
                </div>
              </div>

              {products.length > 0 ? (
                products.map((product) => (
                  <CartItem
                    key={product.id}
                    product={product}
                    updateQuantity={updateQuantity}
                    removeProduct={removeProduct}
                    formatPrice={formatPrice}
                    onSelectChange={handleSelectProduct}
                    isSelected={!!selectedProducts[product.id]}
                  />
                ))
              ) : (
                <div className="empty-cart-container">
                  <div className="empty-cart-content">
                    <img
                      src="https://cdn.tgdd.vn/mwgcart/v2/vue-pro/img/empty-cart.f6c223c07c1d3d8f81d326a2a.png"
                      alt="Giỏ hàng trống"
                      className="empty-cart-image"
                    />
                    <h2 className="empty-cart-title">Giỏ hàng trống</h2>
                    <p className="empty-cart-message">
                      {!localStorage.getItem("token")
                        ? "Vui lòng đăng nhập để xem giỏ hàng của bạn"
                        : "Không có sản phẩm nào trong giỏ hàng"}
                    </p>
                    <div className="empty-cart-buttons">
                      <button
                        className="home-button"
                        onClick={() => navigate("/")}
                      >
                        Về trang chủ
                      </button>
                      {!localStorage.getItem("token") && (
                        <button
                          className="login-button"
                          onClick={() => navigate("/login")}
                        >
                          Đăng nhập
                        </button>
                      )}
                    </div>
                    <div className="customer-support">
                      <p>
                        Khi cần trợ giúp vui lòng gọi{" "}
                        <span className="support-phone">1900 232 460</span> hoặc{" "}
                        <span className="support-phone">028.3622.1060</span>{" "}
                        <span className="support-time">(8h00 - 21h30)</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {products.length > 0 && (
              <>
                <div className="grand-total">
                  <div className="total-row">
                    <span className="grand-total-label">Tổng tiền</span>
                    <span className="grand-total-value">
                      {formatPrice(subTotal)}
                    </span>
                  </div>
                </div>

                <div className="order-note">
                  <h3 className="note-title">Ghi chú đơn hàng</h3>
                  <textarea
                    className="note-input"
                    placeholder="Nhập ghi chú cho đơn hàng (nếu có)"
                    value={orderNote}
                    onChange={(e) => setOrderNote(e.target.value)}
                    rows="2"
                  ></textarea>
                </div>

                <div className="payment-methods">
                  <h3 className="payment-title">Phương thức thanh toán</h3>

                  <div className="payment-options">
                    <label
                      className={`payment-option ${
                        paymentMethod === "CASH" ? "selected" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === "CASH"}
                        onChange={() => setPaymentMethod("CASH")}
                      />
                      <div className="payment-icon">
                        <img
                          src="https://cdn-icons-png.flaticon.com/512/2331/2331895.png"
                          alt="COD"
                        />
                      </div>
                      <div className="payment-info">
                        <span className="payment-name">
                          Thanh toán khi nhận hàng
                        </span>
                        <span className="payment-desc">
                          Thanh toán bằng tiền mặt khi nhận hàng
                        </span>
                      </div>
                    </label>

                    <label
                      className={`payment-option ${
                        paymentMethod === "BANK_TRANSFER" ? "selected" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === "BANK_TRANSFER"}
                        onChange={() => setPaymentMethod("BANK_TRANSFER")}
                      />
                      <div className="payment-icon">
                        <img
                          src="https://cdn-icons-png.flaticon.com/512/2921/2921222.png"
                          alt="Banking"
                        />
                      </div>
                      <div className="payment-info">
                        <span className="payment-name">
                          Chuyển khoản ngân hàng
                        </span>
                        <span className="payment-desc">
                          Thanh toán qua VNPay, Internet Banking, ATM
                        </span>
                      </div>
                    </label>

                    <label
                      className={`payment-option ${
                        paymentMethod === "e-wallet" ? "selected" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === "MOMO"}
                        onChange={() => setPaymentMethod("MOMO")}
                      />
                      <div className="payment-icon">
                        <img
                          src="https://cdn-icons-png.flaticon.com/512/2091/2091665.png"
                          alt="E-wallet"
                        />
                      </div>
                      <div className="payment-info">
                        <span className="payment-name">Ví điện tử ZaloPay</span>
                        <span className="payment-desc">
                          Thanh toán qua ZaloPay
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Toast Notification */}
                {toast.show && (
                  <div className={`toast-notification ${toast.type}`}>
                    <div className="toast-content">
                      {toast.type === "success" && (
                        <FaCheckCircle className="toast-icon" />
                      )}
                      {toast.type === "error" && (
                        <FaExclamationCircle className="toast-icon" />
                      )}
                      {toast.type === "info" && (
                        <FaInfoCircle className="toast-icon" />
                      )}
                      <span className="toast-message">{toast.message}</span>
                    </div>
                    <button
                      className="toast-close"
                      onClick={() =>
                        setToast((prev) => ({ ...prev, show: false }))
                      }
                    >
                      <FaTimes />
                    </button>
                  </div>
                )}

                <button
                  className="checkout-btn"
                  onClick={handleCheckout}
                  disabled={
                    processingPayment ||
                    selectedCount === 0 ||
                    (deliveryMethod === "DELIVERY" && !selectedAddressId)
                  }
                >
                  {processingPayment ? "ĐANG XỬ LÝ..." : `TIẾN HÀNH ĐẶT HÀNG (${selectedCount})`}
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CartPage;
