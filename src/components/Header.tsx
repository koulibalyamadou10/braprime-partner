import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Menu, X, User, LogOut, Settings, Package, Calendar, Star, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/hooks/use-cart';
import { cn } from '@/lib/utils';
import { RealTimeNotifications } from './RealTimeNotifications';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { currentUser, logout } = useAuth();
  const { cart, loading } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  const isAuthenticated = !!currentUser;

  // Compter les articles dans le panier
  const cartCount = cart?.item_count || 0;

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
            {/* Show cart icon only for authenticated customers */}
            {isAuthenticated && currentUser?.role === 'customer' && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative"
                asChild
              >
                <Link to="/cart">
                  <ShoppingCart className="h-5 w-5" />
                  {!loading && cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-guinea-red text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                  <span className="sr-only">Panier</span>
                </Link>
              </Button>
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
                        <Link to="/dashboard/reviews" className="flex items-center">
                          <Star className="mr-2 h-4 w-4" />
                          Mes avis
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  
                  {currentUser.role === 'partner' && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/dashboard/partner" className="flex items-center">
                          <Package className="mr-2 h-4 w-4" />
                          Tableau de bord
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/dashboard/menu" className="flex items-center">
                          <Settings className="mr-2 h-4 w-4" />
                          Gérer le menu
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Mon profil
                    </Link>
                  </DropdownMenuItem>
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
                <Link
                  to="/cart"
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                  onClick={closeMobileMenu}
                >
                  <ShoppingCart className="mr-3 h-5 w-5" />
                  Panier
                  {!loading && cartCount > 0 && (
                    <span className="ml-auto bg-guinea-red text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>
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
                    </>
                  )}
                  
                  {currentUser.role === 'partner' && (
                    <>
                      <Link
                        to="/dashboard/partner"
                        className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                        onClick={closeMobileMenu}
                      >
                        <Package className="mr-3 h-5 w-5" />
                        Tableau de bord
                      </Link>
                      <Link
                        to="/dashboard/menu"
                        className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                        onClick={closeMobileMenu}
                      >
                        <Settings className="mr-3 h-5 w-5" />
                        Gérer le menu
                      </Link>
                    </>
                  )}
                  
                  <Link
                    to="/dashboard/profile"
                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                    onClick={closeMobileMenu}
                  >
                    <User className="mr-3 h-5 w-5" />
                    Mon profil
                  </Link>
                  
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
