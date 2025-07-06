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
const CafesPage = lazy(() => import("./pages/CafesPage"));
const CafePage = lazy(() => import("./pages/CafePage"));
const MarketsPage = lazy(() => import("./pages/MarketsPage"));
const MarketPage = lazy(() => import("./pages/MarketPage"));
const SupermarketsPage = lazy(() => import("./pages/SupermarketsPage"));
const SupermarketPage = lazy(() => import("./pages/SupermarketPage"));
const PackagesPage = lazy(() => import("./pages/PackagesPage"));
const PackagePage = lazy(() => import("./pages/PackagePage"));
const GiftsPage = lazy(() => import("./pages/GiftsPage"));
const GiftPage = lazy(() => import("./pages/GiftPage"));
const ReservationPage = lazy(() => import("./pages/ReservationPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const OrderConfirmationPage = lazy(() => import("./pages/OrderConfirmationPage"));
const OrderTrackingPage = lazy(() => import("./pages/OrderTrackingPage"));
const OrdersHistoryPage = lazy(() => import("./pages/OrdersHistoryPage"));
const PharmacyPage = lazy(() => import("./pages/PharmacyPage"));
const PharmaciesPage = lazy(() => import("./pages/PharmaciesPage"));
const ElectronicsPage = lazy(() => import("./pages/ElectronicsPage"));
const ElectronicsStoresPage = lazy(() => import("./pages/ElectronicsStoresPage"));
const SuppliesPage = lazy(() => import("./pages/SuppliesPage"));
const GroceryPage = lazy(() => import("./pages/GroceryPage"));
const DocumentsPage = lazy(() => import("./pages/DocumentsPage"));
const DocumentServicePage = lazy(() => import("./pages/DocumentServicePage"));
const BeautyPage = lazy(() => import("./pages/BeautyPage"));
const HairdressingPage = lazy(() => import("./pages/HairdressingPage"));
const BooksPage = lazy(() => import("./pages/BooksPage"));
const BookstorePage = lazy(() => import("./pages/BookstorePage"));
const Categories = lazy(() => import("./pages/Categories"));
const LoginPage = lazy(() => import("./pages/LoginPage"));

// Driver Pages
const DriverLoginPage = lazy(() => import("./pages/DriverLoginPage"));
const DriverRegistrationPage = lazy(() => import("./pages/DriverRegistrationPage"));

// Dashboard Pages
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

// Admin Dashboard Pages
const AdminDashboard = lazy(() => import("./pages/dashboard/AdminDashboard"));
const AdminOrders = lazy(() => import("./pages/dashboard/AdminOrders"));
import AdminBusinesses from '@/pages/dashboard/AdminBusinesses';
import AdminUsers from '@/pages/dashboard/AdminUsers';
import AdminDrivers from '@/pages/dashboard/AdminDrivers';
import AdminContent from '@/pages/dashboard/AdminContent';
import AdminAnalytics from '@/pages/dashboard/AdminAnalytics';
import AdminSystem from '@/pages/dashboard/AdminSystem';

const queryClient = new QueryClient();

// Add a simple loading component
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
                <Route path="/login" element={<LoginPage />} />
                <Route path="/cafes" element={<CafesPage />} />
                <Route path="/cafe/:id" element={<CafePage />} />
                <Route path="/markets" element={<MarketsPage />} />
                <Route path="/market/:id" element={<MarketPage />} />
                <Route path="/supermarkets" element={<SupermarketsPage />} />
                <Route path="/supermarket/:id" element={<SupermarketPage />} />
                <Route path="/packages" element={<PackagesPage />} />
                <Route path="/package/:id" element={<PackagePage />} />
                <Route path="/gifts" element={<GiftsPage />} />
                <Route path="/gift/:id" element={<GiftPage />} />
                <Route path="/pharmacy" element={<PharmacyPage />} />
                <Route path="/pharmacies" element={<PharmaciesPage />} />
                <Route path="/pharmacy/:id" element={<PharmacyPage />} />
                <Route path="/electronics" element={<ElectronicsPage />} />
                <Route path="/electronic-stores" element={<ElectronicsStoresPage />} />
                <Route path="/electronics/:id" element={<ElectronicsPage />} />
                <Route path="/supplies" element={<SuppliesPage />} />
                <Route path="/grocery" element={<GroceryPage />} />
                <Route path="/documents" element={<DocumentsPage />} />
                <Route path="/documents/:id" element={<DocumentServicePage />} />
                <Route path="/books" element={<BooksPage />} />
                <Route path="/books/:id" element={<BookstorePage />} />
                <Route path="/beauty" element={<BeautyPage />} />
                <Route path="/hairdressing" element={<HairdressingPage />} />
                <Route path="/clothing" element={<NotFound />} />
                <Route path="/flowers" element={<NotFound />} />
                <Route path="/pets" element={<NotFound />} />
                <Route path="/hardware" element={<NotFound />} />
                <Route path="/sports" element={<NotFound />} />
                <Route path="/toys" element={<NotFound />} />
                <Route path="/services" element={<NotFound />} />
                <Route path="/transport" element={<NotFound />} />
                <Route path="/baby" element={<NotFound />} />
                <Route path="/alcohol" element={<NotFound />} />
                <Route path="/auto" element={<NotFound />} />
                <Route path="/repairs" element={<NotFound />} />
                <Route path="/reservations" element={<ReservationPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/devenir-partenaire" element={<PartnerRegistrationPage />} />
                <Route path="/devenir-chauffeur" element={<DriverRegistrationPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-confirmation/:id" element={<OrderConfirmationPage />} />
                <Route path="/order-tracking/:id" element={<OrderTrackingPage />} />
                <Route path="/orders" element={<OrdersHistoryPage />} />
                    
                    {/* Driver Routes - Mobile App Only */}
                    <Route path="/driver/login" element={<DriverLoginPage />} />
                    <Route path="/driver/register" element={<DriverRegistrationPage />} />
                
                {/* User Dashboard Routes */}
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
                
                {/* Partner Dashboard Routes */}
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
                <Route path="/partner-dashboard/driver-auth" element={
                  <ProtectedRoute allowedRoles={["partner"]}>
                    <Navigate to="/partner-dashboard/drivers" replace />
                  </ProtectedRoute>
                } />
                <Route path="/partner-dashboard/revenue" element={
                  <ProtectedRoute allowedRoles={["partner"]}>
                    <PartnerRevenue />
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
                
                {/* Admin Dashboard Routes */}
                    <Route path="/admin" element={
                      <ProtectedRoute allowedRoles={["admin"]}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/orders" element={
                      <ProtectedRoute allowedRoles={["admin"]}>
                        <AdminOrders />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/businesses" element={
                      <ProtectedRoute allowedRoles={["admin"]}>
                        <AdminBusinesses />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/users" element={
                      <ProtectedRoute allowedRoles={["admin"]}>
                        <AdminUsers />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/drivers" element={
                      <ProtectedRoute allowedRoles={["admin"]}>
                        <AdminDrivers />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/content" element={
                      <ProtectedRoute allowedRoles={["admin"]}>
                        <AdminContent />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/analytics" element={
                      <ProtectedRoute allowedRoles={["admin"]}>
                        <AdminAnalytics />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/system" element={
                      <ProtectedRoute allowedRoles={["admin"]}>
                        <AdminSystem />
                      </ProtectedRoute>
                    } />
                    
                    {/* Admin Dashboard Routes (anciennes routes pour compatibilité) */}
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
