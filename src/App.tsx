import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { OrderProvider } from "@/contexts/OrderContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { DriverAuthProvider } from "@/contexts/DriverAuthContext";
import ScrollToTop from "./components/ScrollToTop";
import { lazy, Suspense } from "react";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { UserRoleProvider } from '@/contexts/UserRoleContext';

// Use dynamic imports for page components
const Index = lazy(() => import("./pages/Index"));
const RestaurantPage = lazy(() => import("./pages/RestaurantPage"));
const RestaurantsPage = lazy(() => import("./pages/RestaurantsPage"));
const CategoryDetail = lazy(() => import("./pages/CategoryDetail"));
const Categories = lazy(() => import("./pages/Categories"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const DriverLoginPage = lazy(() => import("./pages/DriverLoginPage"));
const DriverRegistrationPage = lazy(() => import("./pages/DriverRegistrationPage"));
const UserDashboard = lazy(() => import("./pages/dashboard/UserDashboard"));
const UserOrders = lazy(() => import("./pages/dashboard/UserOrders"));
const UserProfile = lazy(() => import("./pages/dashboard/UserProfile"));
const UserAddresses = lazy(() => import("./pages/dashboard/UserAddresses"));
const UserPayments = lazy(() => import("./pages/dashboard/UserPayments"));
const UserNotifications = lazy(() => import("./pages/dashboard/UserNotifications"));
const UserReservations = lazy(() => import("./pages/dashboard/UserReservations"));
const UserFavorites = lazy(() => import("./pages/dashboard/UserFavorites"));
const PartnerDashboard = lazy(() => import("./pages/dashboard/PartnerDashboard"));
const PartnerOrders = lazy(() => import("./pages/dashboard/PartnerOrders"));
const PartnerMenu = lazy(() => import("./pages/dashboard/PartnerMenu"));
const PartnerReservations = lazy(() => import("./pages/dashboard/PartnerReservations"));
const PartnerDrivers = lazy(() => import("./pages/dashboard/PartnerDrivers"));
const PartnerRevenue = lazy(() => import("./pages/dashboard/PartnerRevenue"));
const PartnerProfile = lazy(() => import("./pages/dashboard/PartnerProfile"));
const PartnerSettings = lazy(() => import("./pages/dashboard/PartnerSettings"));
const PartnerRegistrationPage = lazy(() => import("./pages/PartnerRegistrationPage"));
const RequestsPage = lazy(() => import("./pages/RequestsPage"));
const AdminDashboard = lazy(() => import("./pages/dashboard/AdminDashboard"));
const AdminOrders = lazy(() => import("./pages/dashboard/AdminOrders"));
import AdminBusinesses from '@/pages/dashboard/AdminBusinesses';
import AdminUsers from '@/pages/dashboard/AdminUsers';
import AdminDrivers from '@/pages/dashboard/AdminDrivers';
import AdminRequests from '@/pages/dashboard/AdminRequests';
import AdminContent from '@/pages/dashboard/AdminContent';
import AdminAnalytics from '@/pages/dashboard/AdminAnalytics';
import AdminSystem from '@/pages/dashboard/AdminSystem';
const ReservationPage = lazy(() => import("./pages/ReservationPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const OrderConfirmationPage = lazy(() => import("./pages/OrderConfirmationPage"));
const OrderTrackingPage = lazy(() => import("./pages/OrderTrackingPage"));
const OrdersHistoryPage = lazy(() => import("./pages/OrdersHistoryPage"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="flex items-center justify-center w-full h-screen">
    <div className="w-16 h-16 border-4 border-t-4 border-gray-200 rounded-full animate-spin border-t-blue-500"></div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <UserRoleProvider>
          <DriverAuthProvider>
        <OrderProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/restaurants" element={<RestaurantsPage />} />
                <Route path="/services/:id" element={<RestaurantPage />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/categories/:categoryId" element={<CategoryDetail />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/reservations" element={<ReservationPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/devenir-partenaire" element={<PartnerRegistrationPage />} />
                <Route path="/devenir-chauffeur" element={<DriverRegistrationPage />} />
                <Route path="/requests" element={<RequestsPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-confirmation/:id" element={<OrderConfirmationPage />} />
                <Route path="/order-tracking/:id" element={<OrderTrackingPage />} />
                <Route path="/orders" element={<OrdersHistoryPage />} />
                <Route path="/driver/login" element={<DriverLoginPage />} />
                <Route path="/driver/register" element={<DriverRegistrationPage />} />
                <Route path="/dashboard" element={
                  <ProtectedRoute allowedRoles={["customer"]}>
                    <UserDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/orders" element={
                  <ProtectedRoute allowedRoles={["customer"]}>
                    <UserOrders />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/profile" element={
                  <ProtectedRoute allowedRoles={["customer"]}>
                    <UserProfile />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/addresses" element={
                  <ProtectedRoute allowedRoles={["customer"]}>
                    <UserAddresses />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/payments" element={
                  <ProtectedRoute allowedRoles={["customer"]}>
                    <UserPayments />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/reservations" element={
                  <ProtectedRoute allowedRoles={["customer"]}>
                    <UserReservations />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/notifications" element={
                  <ProtectedRoute allowedRoles={["customer"]}>
                    <UserNotifications />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/favorites" element={
                  <ProtectedRoute allowedRoles={["customer"]}>
                    <UserFavorites />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/partner" element={
                  <ProtectedRoute allowedRoles={["partner"]}>
                    <PartnerDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/partner/orders" element={
                  <ProtectedRoute allowedRoles={["partner"]}>
                    <PartnerOrders />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/partner/menu" element={
                  <ProtectedRoute allowedRoles={["partner"]}>
                    <PartnerMenu />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/partner/reservations" element={
                  <ProtectedRoute allowedRoles={["partner"]}>
                    <PartnerReservations />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/partner/drivers" element={
                  <ProtectedRoute allowedRoles={["partner"]}>
                    <PartnerDrivers />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/partner/revenue" element={
                  <ProtectedRoute allowedRoles={["partner"]}>
                    <PartnerRevenue />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/partner/profile" element={
                  <ProtectedRoute allowedRoles={["partner"]}>
                    <PartnerProfile />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/partner/settings" element={
                  <ProtectedRoute allowedRoles={["partner"]}>
                    <PartnerSettings />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/admin" element={<AdminDashboard />} />
                <Route path="/dashboard/admin/orders" element={<AdminOrders />} />
                <Route path="/dashboard/admin/businesses" element={<AdminBusinesses />} />
                <Route path="/dashboard/admin/users" element={<AdminUsers />} />
                <Route path="/dashboard/admin/drivers" element={<AdminDrivers />} />
                <Route path="/dashboard/admin/requests" element={<AdminRequests />} />
                <Route path="/dashboard/admin/content" element={<AdminContent />} />
                <Route path="/dashboard/admin/analytics" element={<AdminAnalytics />} />
                <Route path="/dashboard/admin/system" element={<AdminSystem />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </OrderProvider>
        </DriverAuthProvider>
      </UserRoleProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
