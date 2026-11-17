import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/hooks/store';
import { fetchCurrentUser } from '@/store/slices/authSlice';
import { fetchCart } from '@/store/slices/cartSlice';
import { fetchWishlist } from '@/store/slices/wishlistSlice';

// Layouts
import RootLayout from '@/layouts/RootLayout';
import CustomerLayout from '@/layouts/CustomerLayout';
import SellerLayout from '@/layouts/SellerLayout';
import AdminLayout from '@/layouts/AdminLayout';

// Guard
import ProtectedRoute from '@/components/common/ProtectedRoute';

// Customer Facing Pages
import HomePage from '@/pages/HomePage';
import ShopPage from '@/pages/ShopPage';
import CategoriesPage from '@/pages/CategoriesPage';
import ProductDetailsPage from '@/pages/ProductDetailsPage';
import SearchResultsPage from '@/pages/SearchResultsPage';
import CartPage from '@/pages/CartPage';
import WishlistPage from '@/pages/WishlistPage';
import CheckoutPage from '@/pages/CheckoutPage';
import PaymentSuccessPage from '@/pages/PaymentSuccessPage';
import OrderTrackingPage from '@/pages/OrderTrackingPage';
import MyOrdersPage from '@/pages/MyOrdersPage';
import ProfilePage from '@/pages/ProfilePage';
import AddressManagementPage from '@/pages/AddressManagementPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import SellerRegisterPage from '@/pages/SellerRegisterPage';
import AboutUsPage from '@/pages/AboutUsPage';
import ContactUsPage from '@/pages/ContactUsPage';
import FAQPage from '@/pages/FAQPage';
import NotFoundPage from '@/pages/NotFoundPage';

// Seller Portal Pages
import SellerDashboardPage from '@/pages/seller/SellerDashboardPage';
import SellerProductsPage from '@/pages/seller/SellerProductsPage';
import SellerProductEditorPage from '@/pages/seller/SellerProductEditorPage';
import SellerOrdersPage from '@/pages/seller/SellerOrdersPage';
import SellerInventoryPage from '@/pages/seller/SellerInventoryPage';
import SellerReviewsPage from '@/pages/seller/SellerReviewsPage';
import SellerStorePage from '@/pages/seller/SellerStorePage';

// Admin Portal Pages
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage';
import AdminUsersPage from '@/pages/admin/AdminUsersPage';
import AdminSellersPage from '@/pages/admin/AdminSellersPage';
import AdminProductsPage from '@/pages/admin/AdminProductsPage';
import AdminOrdersPage from '@/pages/admin/AdminOrdersPage';
import AdminCategoriesPage from '@/pages/admin/AdminCategoriesPage';
import AdminCouponsPage from '@/pages/admin/AdminCouponsPage';
import AdminBannersPage from '@/pages/admin/AdminBannersPage';
import AdminReviewsPage from '@/pages/admin/AdminReviewsPage';
import AdminMessagesPage from '@/pages/admin/AdminMessagesPage';

export const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
      dispatch(fetchWishlist());
    }
  }, [dispatch, isAuthenticated]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Main Customer Facing Shell */}
        <Route element={<RootLayout />}>
          <Route index element={<HomePage />} />
          <Route path="shop" element={<ShopPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="product/:slug" element={<ProductDetailsPage />} />
          <Route path="search" element={<SearchResultsPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="wishlist" element={<WishlistPage />} />

          {/* Checkout & Success */}
          <Route
            path="checkout"
            element={
              <ProtectedRoute allowedRoles={['customer', 'seller', 'admin']}>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route path="order/success/:orderId" element={<PaymentSuccessPage />} />
          <Route path="order/track/:id?" element={<OrderTrackingPage />} />

          {/* Customer Account Dashboard */}
          <Route
            element={
              <ProtectedRoute allowedRoles={['customer', 'seller', 'admin']}>
                <CustomerLayout />
              </ProtectedRoute>
            }
          >
            <Route path="profile" element={<ProfilePage />} />
            <Route path="orders" element={<MyOrdersPage />} />
            <Route path="addresses" element={<AddressManagementPage />} />
          </Route>

          {/* Authentication */}
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="seller/register" element={<SellerRegisterPage />} />

          {/* Static / Editorial */}
          <Route path="about" element={<AboutUsPage />} />
          <Route path="contact" element={<ContactUsPage />} />
          <Route path="faq" element={<FAQPage />} />

          {/* 404 Fallback */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Dedicated Seller Portal */}
        <Route
          path="seller"
          element={
            <ProtectedRoute allowedRoles={['seller', 'admin']}>
              <SellerLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<SellerDashboardPage />} />
          <Route path="products" element={<SellerProductsPage />} />
          <Route path="products/new" element={<SellerProductEditorPage />} />
          <Route path="products/edit/:id" element={<SellerProductEditorPage />} />
          <Route path="orders" element={<SellerOrdersPage />} />
          <Route path="inventory" element={<SellerInventoryPage />} />
          <Route path="reviews" element={<SellerReviewsPage />} />
          <Route path="store" element={<SellerStorePage />} />
        </Route>

        {/* Dedicated Admin Portal */}
        <Route
          path="admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="sellers" element={<AdminSellersPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="coupons" element={<AdminCouponsPage />} />
          <Route path="banners" element={<AdminBannersPage />} />
          <Route path="reviews" element={<AdminReviewsPage />} />
          <Route path="messages" element={<AdminMessagesPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
