import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Menu, X, User, LogOut, Settings, Package, Calendar, Star, Search, Truck, MapPin, ChefHat } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCartContext } from '@/contexts/CartContext';
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
import { useQuickSearch } from '@/hooks/use-search';
import { SearchResult } from '@/lib/services/search';


const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const { currentUser, logout } = useAuth();
  const { cart, loading } = useCartContext();
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

  // Utiliser la recherche rapide pour l'autocomplétion
  const { results: autocompleteResults, isLoading: autocompleteLoading } = useQuickSearch(
    searchTerm,
    5
  );

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

  // Gérer les clics en dehors de l'autocomplétion
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowAutocomplete(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Gérer les touches clavier pour l'autocomplétion
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showAutocomplete || autocompleteResults.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < autocompleteResults.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : autocompleteResults.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < autocompleteResults.length) {
          const selectedResult = autocompleteResults[selectedIndex];
          handleAutocompleteSelect(selectedResult);
        } else {
          handleSearch(e as any);
        }
        break;
      case 'Escape':
        setShowAutocomplete(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Gérer la sélection d'un résultat d'autocomplétion
  const handleAutocompleteSelect = (result: SearchResult) => {
    setSearchTerm(result.name);
    setShowAutocomplete(false);
    setSelectedIndex(-1);
    navigate(`/search?q=${encodeURIComponent(result.name)}`);
  };

  // Gérer le focus sur la barre de recherche
  const handleSearchFocus = () => {
    if (searchTerm.length >= 1 && autocompleteResults.length > 0) {
      setShowAutocomplete(true);
    }
  };

  // Gérer le changement de terme de recherche
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setSelectedIndex(-1);
    
    if (value.length >= 1) {
      setShowAutocomplete(true);
    } else {
      setShowAutocomplete(false);
    }
  };

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
      setShowAutocomplete(false);
      setSelectedIndex(-1);
      closeMobileMenu();
    }
  };

  // Rendu d'un résultat d'autocomplétion
  const renderAutocompleteItem = (result: SearchResult, index: number) => {
    const isSelected = index === selectedIndex;
    
    return (
      <div
        key={`${result.type}-${result.id}`}
        className={cn(
          "flex items-center px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors touch-manipulation",
          isSelected && "bg-gray-50"
        )}
        onClick={() => handleAutocompleteSelect(result)}
        onMouseEnter={() => setSelectedIndex(index)}
        onTouchStart={() => setSelectedIndex(index)}
      >
        <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
          {result.type === 'business' && <Package className="h-4 w-4 text-gray-600" />}
          {result.type === 'menu_item' && <Star className="h-4 w-4 text-gray-600" />}
          {result.type === 'category' && <Settings className="h-4 w-4 text-gray-600" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900 truncate">
            {result.name}
          </div>
          <div className="text-xs text-gray-500 truncate">
            {result.type === 'business' && result.cuisine_type && `${result.cuisine_type} • ${result.address || 'Conakry'}`}
            {result.type === 'menu_item' && result.business_name && `${result.business_name} • ${result.price ? `${result.price} GNF` : ''}`}
            {result.type === 'category' && result.description}
          </div>
        </div>
      </div>
    );
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
          <div className="hidden md:flex flex-1 max-w-md mx-8 relative" ref={searchRef}>
            <form onSubmit={handleSearch} className="w-full">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input
                type="text"
                  placeholder="Rechercher un service, un commerce, un plat, un quartier..."
                className="pl-10 pr-4 py-2 w-full"
                value={searchTerm}
                  onChange={handleSearchChange}
                  onFocus={handleSearchFocus}
                  onKeyDown={handleKeyDown}
              />
            </div>
            </form>
            
            {/* Autocomplétion */}
            {showAutocomplete && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto z-50">
                {autocompleteLoading ? (
                  <div className="px-4 py-3 text-sm text-gray-500">
                    Recherche en cours...
                  </div>
                ) : autocompleteResults.length > 0 ? (
                  <>
                    {autocompleteResults.map(renderAutocompleteItem)}
                    <div className="border-t border-gray-100 px-4 py-2">
                      <div className="text-xs text-gray-500">
                        Appuyez sur Entrée pour rechercher "{searchTerm}"
                      </div>
                    </div>
                  </>
                ) : searchTerm.length >= 1 ? (
                  <div className="px-4 py-3 text-sm text-gray-500">
                    Aucun résultat trouvé
                  </div>
                ) : null}
              </div>
            )}
            
            <Button type="submit" className="ml-2 bg-guinea-red hover:bg-guinea-red/90" onClick={handleSearch}>
              Rechercher
            </Button>
          </div>

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
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                      </div>
                      <p className="text-xs leading-none text-muted-foreground">
                        {currentUser.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {currentUser.role === 'customer' && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/cart" className="flex items-center">
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          Panier
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/dashboard" className="flex items-center">
                          <Package className="mr-2 h-4 w-4" />
                          Dashboard
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
                  <Link to="/login?action=signup">S'inscrire</Link>
                </Button>
              </div>
            )}
          </nav>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Mobile Cart Button - Only for authenticated customers */}
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

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
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
        </div>

        {/* Mobile Search */}
        <div className="pb-4 md:hidden relative" ref={searchRef}>
          <form 
            onSubmit={handleSearch}
            className="flex"
          >
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input
                type="text"
                placeholder="Rechercher un service, un commerce, un plat, un quartier..."
                className="pl-10 pr-4 py-2 w-full"
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={handleSearchFocus}
                onKeyDown={handleKeyDown}
              />
            </div>
            <Button type="submit" className="ml-2 bg-guinea-red hover:bg-guinea-red/90">
              <Search className="h-5 w-5" />
            </Button>
          </form>
          
          {/* Autocomplétion mobile */}
          {showAutocomplete && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto z-50">
              {autocompleteLoading ? (
                <div className="px-4 py-3 text-sm text-gray-500">
                  Recherche en cours...
                </div>
              ) : autocompleteResults.length > 0 ? (
                <>
                  {autocompleteResults.map(renderAutocompleteItem)}
                  <div className="border-t border-gray-100 px-4 py-2">
                    <div className="text-xs text-gray-500">
                      Appuyez sur Entrée pour rechercher "{searchTerm}"
                    </div>
                  </div>
                </>
              ) : searchTerm.length >= 1 ? (
                <div className="px-4 py-3 text-sm text-gray-500">
                  Aucun résultat trouvé
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-2">
              {/* User menu items */}
              {isAuthenticated ? (
                <>
                  {currentUser.role === 'customer' && (
                    <>
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
                      <Link
                        to="/dashboard"
                        className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                        onClick={closeMobileMenu}
                      >
                        <Package className="mr-3 h-5 w-5" />
                        Dashboard
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
                  {/* Afficher Dashboard et Mon profil UNIQUEMENT pour les autres rôles */}
                  {currentUser.role !== 'customer' && shouldShowDashboard && (
                    <Link
                      to={getDashboardLink()}
                      className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                      onClick={closeMobileMenu}
                    >
                      <Package className="mr-3 h-5 w-5" />
                      {isAdmin ? 'Tableau de bord' : 'Mon tableau de bord'}
                    </Link>
                  )}
                  {currentUser.role !== 'customer' && shouldShowProfile && (
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
                    to="/login?action=signup"
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
