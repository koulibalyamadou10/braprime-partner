import { DashboardCacheProvider } from '@/components/dashboard/DashboardCacheProvider';
import PreloadManager from '@/components/PreloadManager';
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { DriverAuthProvider } from "@/contexts/DriverAuthContext";
import { OrderProvider } from "@/contexts/OrderContext";
import { UserRoleProvider } from '@/contexts/UserRoleContext';
import AdminAnalytics from '@/pages/dashboard/AdminAnalytics';
import AdminBusinesses from '@/pages/dashboard/AdminBusinesses';
import AdminContent from '@/pages/dashboard/AdminContent';
import AdminDrivers from '@/pages/dashboard/AdminDrivers';
import AdminEmailTest from '@/pages/dashboard/AdminEmailTest';
import AdminRequests from '@/pages/dashboard/AdminRequests';
import AdminSubscriptions from '@/pages/dashboard/AdminSubscriptions';
import AdminSystem from '@/pages/dashboard/AdminSystem';
import AdminUsers from '@/pages/dashboard/AdminUsers';
import DriverRegistrationPage from '@/pages/DriverRegistrationPage';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import ScrollToTop from "./components/ScrollToTop";

// Use dynamic imports for page components
const Index = lazy(() => import("./pages/Index"));
const RestaurantPage = lazy(() => import("./pages/RestaurantPage"));
const RestaurantsPage = lazy(() => import("./pages/RestaurantsPage"));
const CategoryDetail = lazy(() => import("./pages/CategoryDetail"));
const Categories = lazy(() => import("./pages/Categories"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const DriverLoginPage = lazy(() => import("./pages/DriverLoginPage"));

const UserDashboard = lazy(() => import("./pages/dashboard/UserDashboard"));
const UserOrders = lazy(() => import("./pages/dashboard/UserOrders"));
const OrderDetail = lazy(() => import("./pages/dashboard/OrderDetail"));
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
const PartnerBilling = lazy(() => import("./pages/dashboard/PartnerBilling"));
const PartnerProfile = lazy(() => import("./pages/dashboard/PartnerProfile"));
const PartnerSettings = lazy(() => import("./pages/dashboard/PartnerSettings"));
const PartnerRegistrationPage = lazy(() => import("./pages/PartnerRegistrationPage"));
const RequestConfirmationPage = lazy(() => import("./pages/RequestConfirmationPage"));
const RequestsPage = lazy(() => import("./pages/RequestsPage"));
const AdminDashboard = lazy(() => import("./pages/dashboard/AdminDashboard"));
const AdminOrders = lazy(() => import("./pages/dashboard/AdminOrders"));
const ReservationPage = lazy(() => import("./pages/ReservationPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const Pricing = lazy(() => import("./pages/Pricing"));
const NotFound = lazy(() => import("./pages/NotFound"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const AllItemsPage = lazy(() => import("./pages/AllItemsPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const OrderConfirmationPage = lazy(() => import("./pages/OrderConfirmationPage"));
const OrderTrackingPage = lazy(() => import("./pages/OrderTrackingPage"));
const OrdersHistoryPage = lazy(() => import("./pages/OrdersHistoryPage"));
const PaymentStatusPage = lazy(() => import("./pages/PaymentStatusPage"));
const SubscriptionPaymentStatusPage = lazy(() => import("./pages/SubscriptionPaymentStatusPage"));


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
            <CartProvider>
              <OrderProvider>
                <DashboardCacheProvider>
                  <PreloadManager />
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
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/articles" element={<AllItemsPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/devenir-partenaire" element={<PartnerRegistrationPage />} />
                <Route path="/devenir-conducteur" element={<DriverRegistrationPage />} />
                <Route path="/request-confirmation" element={<RequestConfirmationPage />} />

                <Route path="/requests" element={<RequestsPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-confirmation/:id" element={<OrderConfirmationPage />} />
                <Route path="/order-tracking/:id" element={<OrderTrackingPage />} />
                <Route path="/payment-status" element={<PaymentStatusPage />} />
                <Route path="/subscription-payment-status" element={<SubscriptionPaymentStatusPage />} />

                <Route path="/orders" element={<OrdersHistoryPage />} />
                <Route path="/driver/login" element={<DriverLoginPage />} />

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
                <Route path="/orders/:orderId" element={
                  <ProtectedRoute allowedRoles={["customer"]}>
                    <OrderDetail />
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
                {/* Routes Partner Dashboard */}
                <Route path="/partner-dashboard" element={
                  <ProtectedRoute allowedRoles={["partner"]}>
                    <PartnerDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/partner-dashboard/orders" element={
                  <ProtectedRoute allowedRoles={["partner"]}>
                    <PartnerOrders />
                  </ProtectedRoute>
                } />
                <Route path="/partner-dashboard/menu" element={
                  <ProtectedRoute allowedRoles={["partner"]}>
                    <PartnerMenu />
                  </ProtectedRoute>
                } />
                <Route path="/partner-dashboard/reservations" element={
                  <ProtectedRoute allowedRoles={["partner"]}>
                    <PartnerReservations />
                  </ProtectedRoute>
                } />
                <Route path="/partner-dashboard/drivers" element={
                  <ProtectedRoute allowedRoles={["partner"]}>
                    <PartnerDrivers />
                  </ProtectedRoute>
                } />
                <Route path="/partner-dashboard/drivers/:id" element={
                  <ProtectedRoute allowedRoles={["partner"]}>
                    <PartnerDrivers />
                  </ProtectedRoute>
                } />
                <Route path="/partner-dashboard/revenue" element={
                  <ProtectedRoute allowedRoles={["partner"]}>
                    <PartnerRevenue />
                  </ProtectedRoute>
                } />
                <Route path="/partner-dashboard/billing" element={
                  <ProtectedRoute allowedRoles={["partner"]}>
                    <PartnerBilling />
                  </ProtectedRoute>
                } />
                <Route path="/partner-dashboard/profile" element={
                  <ProtectedRoute allowedRoles={["partner"]}>
                    <PartnerProfile />
                  </ProtectedRoute>
                } />
                <Route path="/partner-dashboard/settings" element={
                  <ProtectedRoute allowedRoles={["partner"]}>
                    <PartnerSettings />
                  </ProtectedRoute>
                } />
                
                {/* Routes Partner Dashboard (anciennes pour compatibilité) */}
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
                {/* Routes Admin Dashboard */}
                <Route path="/admin-dashboard" element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/admin-dashboard/orders" element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminOrders />
                  </ProtectedRoute>
                } />
                <Route path="/admin-dashboard/businesses" element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminBusinesses />
                  </ProtectedRoute>
                } />
                <Route path="/admin-dashboard/users" element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminUsers />
                  </ProtectedRoute>
                } />
                <Route path="/admin-dashboard/drivers" element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminDrivers />
                  </ProtectedRoute>
                } />
                <Route path="/admin-dashboard/requests" element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminRequests />
                  </ProtectedRoute>
                } />
                <Route path="/admin-dashboard/subscriptions" element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminSubscriptions />
                  </ProtectedRoute>
                } />
                <Route path="/admin-dashboard/content" element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminContent />
                  </ProtectedRoute>
                } />
                <Route path="/admin-dashboard/analytics" element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminAnalytics />
                  </ProtectedRoute>
                } />
                <Route path="/admin-dashboard/system" element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminSystem />
                  </ProtectedRoute>
                } />
                <Route path="/admin-dashboard/email-test" element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminEmailTest />
                  </ProtectedRoute>
                } />
                <Route path="/admin-dashboard/settings" element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                
                {/* Routes Admin Dashboard (anciennes pour compatibilité) */}
                <Route path="/dashboard/admin" element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/admin/orders" element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminOrders />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/admin/businesses" element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminBusinesses />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/admin/users" element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminUsers />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/admin/drivers" element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminDrivers />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/admin/requests" element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminRequests />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/admin/subscriptions" element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminSubscriptions />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/admin/content" element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminContent />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/admin/analytics" element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminAnalytics />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/admin/system" element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminSystem />
                  </ProtectedRoute>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
                                </Suspense>
                  </BrowserRouter>
                </DashboardCacheProvider>
              </OrderProvider>
            </CartProvider>
          </DriverAuthProvider>
        </UserRoleProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
