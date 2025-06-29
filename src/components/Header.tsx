import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Menu, X, User, LogOut, Settings, Package, Calendar, Star, Search, Truck, MapPin } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/hooks/use-cart';
import { cn } from '@/lib/utils';
import { RealTimeNotifications } from './RealTimeNotifications';
import CartHover from './CartHover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUserRole } from '@/contexts/UserRoleContext';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { currentUser, logout } = useAuth();
  const { cart, loading } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  // Utilisation du provider centralisé
  const {
    isAdmin,
    isPartner,
    isDriver,
    isCustomer,
    can,
    role
  } = useUserRole();

  const isAuthenticated = !!currentUser;
  const cartCount = cart?.item_count || 0;

  // Helpers pour les liens dashboard/profile
  const getDashboardLink = () => {
    if (isAdmin) return '/admin-dashboard';
    if (isPartner) return '/partner-dashboard';
    if (isDriver) return '/driver-dashboard';
    return '/dashboard';
  };
  const getProfileLink = () => {
    if (isAdmin) return '/admin-dashboard/profile';
    return '/dashboard/profile';
  };
  const shouldShowDashboard = isAdmin || isPartner || isDriver;
  const shouldShowProfile = !isAdmin;

  const handleSignOut = async () => {
    await logout();
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
      closeMobileMenu();
    }
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2" onClick={closeMobileMenu}>
            <div className="w-8 h-8 bg-guinea-red rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">B</span>
            </div>
            <span className="font-bold text-xl text-gray-900">BraPrime</span>
          </Link>

          {/* Barre de recherche - Desktop */}
          <form 
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-md mx-8"
          >
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input
                type="text"
                placeholder="Rechercher un restaurant, un plat, un quartier..."
                className="pl-10 pr-4 py-2 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button type="submit" className="ml-2 bg-guinea-red hover:bg-guinea-red/90">
              Rechercher
            </Button>
          </form>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            {/* Show cart hover component only for authenticated customers */}
            {isAuthenticated && currentUser?.role === 'customer' && (
              <CartHover />
            )}

            {/* Notifications for authenticated users */}
            {isAuthenticated && (
              <RealTimeNotifications />
            )}

            {/* User Menu */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <User className="h-5 w-5" />
                    <span className="sr-only">Menu utilisateur</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {currentUser.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {currentUser.role === 'customer' && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/dashboard/orders" className="flex items-center">
                          <Package className="mr-2 h-4 w-4" />
                          Mes commandes
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/dashboard/reservations" className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4" />
                          Mes réservations
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/dashboard/favorites" className="flex items-center">
                          <Star className="mr-2 h-4 w-4" />
                          Mes favoris
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  
                  {currentUser.role === 'partner' && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/partner-dashboard/orders" className="flex items-center">
                          <Package className="mr-2 h-4 w-4" />
                          Commandes
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/partner-dashboard/menu" className="flex items-center">
                          <Settings className="mr-2 h-4 w-4" />
                          Gérer le menu
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/partner-dashboard/drivers" className="flex items-center">
                          <Truck className="mr-2 h-4 w-4" />
                          Mes livreurs
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  
                  {currentUser.role === 'admin' && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/admin-dashboard/orders" className="flex items-center">
                          <Package className="mr-2 h-4 w-4" />
                          Gérer les commandes
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin-dashboard/businesses" className="flex items-center">
                          <Settings className="mr-2 h-4 w-4" />
                          Gérer les commerces
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin-dashboard/users" className="flex items-center">
                          <User className="mr-2 h-4 w-4" />
                          Gérer les utilisateurs
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin-dashboard/drivers" className="flex items-center">
                          <Truck className="mr-2 h-4 w-4" />
                          Gérer les livreurs
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin-dashboard/content" className="flex items-center">
                          <Settings className="mr-2 h-4 w-4" />
                          Gérer le contenu
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin-dashboard/analytics" className="flex items-center">
                          <Package className="mr-2 h-4 w-4" />
                          Analytics
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin-dashboard/system" className="flex items-center">
                          <Settings className="mr-2 h-4 w-4" />
                          Système
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  
                  {currentUser.role === 'driver' && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/driver-dashboard/orders" className="flex items-center">
                          <Package className="mr-2 h-4 w-4" />
                          Mes livraisons
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/driver-dashboard/history" className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4" />
                          Historique
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/driver-dashboard/location" className="flex items-center">
                          <MapPin className="mr-2 h-4 w-4" />
                          Ma position
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  
                  <DropdownMenuSeparator />
                  
                  {/* Afficher Dashboard pour admin, Profile pour les autres */}
                  {shouldShowDashboard && (
                    <DropdownMenuItem asChild>
                      <Link to={getDashboardLink()} className="flex items-center">
                        <Package className="mr-2 h-4 w-4" />
                        {isAdmin ? 'Tableau de bord' : 'Mon tableau de bord'}
                      </Link>
                    </DropdownMenuItem>
                  )}
                  
                  {shouldShowProfile && (
                    <DropdownMenuItem asChild>
                      <Link to={getProfileLink()} className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        Mon profil
                      </Link>
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Se déconnecter
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link to="/login">Se connecter</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">S'inscrire</Link>
                </Button>
              </div>
            )}
          </nav>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleMobileMenu}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
            <span className="sr-only">Menu mobile</span>
          </Button>
        </div>

        {/* Mobile Search */}
        <div className="pb-4 md:hidden">
          <form 
            onSubmit={handleSearch}
            className="flex"
          >
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input
                type="text"
                placeholder="Rechercher..."
                className="pl-10 pr-4 py-2 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button type="submit" className="ml-2 bg-guinea-red hover:bg-guinea-red/90">
              <Search className="h-5 w-5" />
            </Button>
          </form>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-2">
              {/* Cart for authenticated customers */}
              {isAuthenticated && currentUser?.role === 'customer' && (
                <div className="px-4 py-2">
                  <CartHover isMobile={true} />
                </div>
              )}

              {/* User menu items */}
              {isAuthenticated ? (
                <>
                  {currentUser.role === 'customer' && (
                    <>
                      <Link
                        to="/dashboard/orders"
                        className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                        onClick={closeMobileMenu}
                      >
                        <Package className="mr-3 h-5 w-5" />
                        Mes commandes
                      </Link>
                      <Link
                        to="/dashboard/reservations"
                        className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                        onClick={closeMobileMenu}
                      >
                        <Calendar className="mr-3 h-5 w-5" />
                        Mes réservations
                      </Link>
                      <Link
                        to="/dashboard/favorites"
                        className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                        onClick={closeMobileMenu}
                      >
                        <Star className="mr-3 h-5 w-5" />
                        Mes favoris
                      </Link>
                    </>
                  )}
                  
                  {currentUser.role === 'partner' && (
                    <>
                      <Link
                        to="/partner-dashboard/orders"
                        className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                        onClick={closeMobileMenu}
                      >
                        <Package className="mr-3 h-5 w-5" />
                        Commandes
                      </Link>
                      <Link
                        to="/partner-dashboard/menu"
                        className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                        onClick={closeMobileMenu}
                      >
                        <Settings className="mr-3 h-5 w-5" />
                        Gérer le menu
                      </Link>
                      <Link
                        to="/partner-dashboard/drivers"
                        className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                        onClick={closeMobileMenu}
                      >
                        <Truck className="mr-3 h-5 w-5" />
                        Mes livreurs
                      </Link>
                    </>
                  )}
                  
                  {currentUser.role === 'admin' && (
                    <>
                      <Link
                        to="/admin-dashboard/orders"
                        className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                        onClick={closeMobileMenu}
                      >
                        <Package className="mr-3 h-5 w-5" />
                        Gérer les commandes
                      </Link>
                      <Link
                        to="/admin-dashboard/businesses"
                        className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                        onClick={closeMobileMenu}
                      >
                        <Settings className="mr-3 h-5 w-5" />
                        Gérer les commerces
                      </Link>
                      <Link
                        to="/admin-dashboard/users"
                        className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                        onClick={closeMobileMenu}
                      >
                        <User className="mr-3 h-5 w-5" />
                        Gérer les utilisateurs
                      </Link>
                      <Link
                        to="/admin-dashboard/drivers"
                        className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                        onClick={closeMobileMenu}
                      >
                        <Truck className="mr-3 h-5 w-5" />
                        Gérer les livreurs
                      </Link>
                      <Link
                        to="/admin-dashboard/content"
                        className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                        onClick={closeMobileMenu}
                      >
                        <Settings className="mr-3 h-5 w-5" />
                        Gérer le contenu
                      </Link>
                      <Link
                        to="/admin-dashboard/analytics"
                        className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                        onClick={closeMobileMenu}
                      >
                        <Package className="mr-3 h-5 w-5" />
                        Analytics
                      </Link>
                      <Link
                        to="/admin-dashboard/system"
                        className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                        onClick={closeMobileMenu}
                      >
                        <Settings className="mr-3 h-5 w-5" />
                        Système
                      </Link>
                    </>
                  )}
                  
                  {currentUser.role === 'driver' && (
                    <>
                      <Link
                        to="/driver-dashboard/orders"
                        className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                        onClick={closeMobileMenu}
                      >
                        <Package className="mr-3 h-5 w-5" />
                        Mes livraisons
                      </Link>
                      <Link
                        to="/driver-dashboard/history"
                        className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                        onClick={closeMobileMenu}
                      >
                        <Calendar className="mr-3 h-5 w-5" />
                        Historique
                      </Link>
                      <Link
                        to="/driver-dashboard/location"
                        className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                        onClick={closeMobileMenu}
                      >
                        <MapPin className="mr-3 h-5 w-5" />
                        Ma position
                      </Link>
                    </>
                  )}
                  
                  <Link
                    to={currentUser.role === 'admin' ? "/admin-dashboard/profile" : "/dashboard/profile"}
                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                    onClick={closeMobileMenu}
                  >
                    <User className="mr-3 h-5 w-5" />
                    Mon profil
                  </Link>
                  
                  {/* Afficher Dashboard pour admin, Profile pour les autres */}
                  {shouldShowDashboard && (
                    <Link
                      to={getDashboardLink()}
                      className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                      onClick={closeMobileMenu}
                    >
                      <Package className="mr-3 h-5 w-5" />
                      {isAdmin ? 'Tableau de bord' : 'Mon tableau de bord'}
                    </Link>
                  )}
                  
                  {shouldShowProfile && (
                    <Link
                      to={getProfileLink()}
                      className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                      onClick={closeMobileMenu}
                    >
                      <User className="mr-3 h-5 w-5" />
                      Mon profil
                    </Link>
                  )}
                  
                  <button
                    onClick={handleSignOut}
                    className="flex items-center px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md w-full text-left"
                  >
                    <LogOut className="mr-3 h-5 w-5" />
                    Se déconnecter
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                    onClick={closeMobileMenu}
                  >
                    Se connecter
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                    onClick={closeMobileMenu}
                  >
                    S'inscrire
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
