import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Menu, X, Search, ShoppingCart, Heart, User, LogIn, 
  PanelRight, Truck, CalendarRange, LogOut, UserCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useOrder } from '@/contexts/OrderContext';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModals } from './auth/AuthModals';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { getCartCount } = useOrder();
  const { currentUser, isAuthenticated, logout } = useAuth();
  
  const cartCount = getCartCount();
  
  // Auth modal states
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const openLoginModal = () => {
    setIsLoginOpen(true);
    setMobileMenuOpen(false);
  };

  const openSignupModal = () => {
    setIsSignupOpen(true);
    setMobileMenuOpen(false);
  };

  const navigateToDashboard = () => {
    if (!currentUser) return;
    
    switch (currentUser.role) {
      case 'customer':
        navigate('/dashboard');
        break;
      case 'partner':
        navigate('/partner-dashboard');
        break;
    }
  };
  
  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full overflow-hidden guinea-gradient"></div>
              <span className="font-bold text-xl">BraPrime</span>
            </Link>
            
            {/* Search - on desktop */}
            <form 
              onSubmit={handleSearch}
              className="hidden md:flex flex-1 max-w-md mx-10"
            >
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
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
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-guinea-red text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                    <span className="sr-only">Panier</span>
                  </Link>
                </Button>
              )}

              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center">
                      <Avatar className="h-8 w-8 mr-1">
                        <AvatarImage src={currentUser?.profileImage} alt={currentUser?.name} />
                        <AvatarFallback>{currentUser?.name?.[0] || 'U'}</AvatarFallback>
                      </Avatar>
                      <span className="hidden sm:inline">{currentUser?.name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={navigateToDashboard}>
                      <UserCircle className="mr-2 h-4 w-4" />
                      Dashboard
                    </DropdownMenuItem>
                    {currentUser?.role === 'customer' && (
                      <DropdownMenuItem asChild>
                        <Link to="/cart">
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          Mon Panier {cartCount > 0 && `(${cartCount})`}
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Button variant="outline" size="sm" onClick={openLoginModal}>
                    <LogIn className="mr-1 h-4 w-4" />
                    Login
                  </Button>
                  <Button className="bg-guinea-red hover:bg-guinea-red/90" size="sm" onClick={openSignupModal}>
                    Sign Up
                  </Button>
                </>
              )}
            </nav>
            
            {/* Mobile Menu Button */}
            <div className="flex items-center md:hidden">
              {/* Mobile cart icon for customers */}
              {isAuthenticated && currentUser?.role === 'customer' && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative mr-1"
                  asChild
                >
                  <Link to="/cart">
                    <ShoppingCart className="h-5 w-5" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-guinea-red text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                    <span className="sr-only">Panier</span>
                  </Link>
                </Button>
              )}
            
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
          
          {/* Mobile Search */}
          <div className="pb-4 md:hidden">
            <form 
              onSubmit={handleSearch}
              className="flex"
            >
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
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
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="container mx-auto px-4 py-3">
              <nav className="space-y-3">
                {isAuthenticated && currentUser?.role === 'customer' && (
                  <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
                    <Link to="/cart" onClick={() => setMobileMenuOpen(false)}>
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Mon Panier {cartCount > 0 && `(${cartCount})`}
                    </Link>
                  </Button>
                )}
                
                {isAuthenticated ? (
                  <>
                    <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => {
                      navigateToDashboard();
                      setMobileMenuOpen(false);
                    }}>
                      <UserCircle className="h-5 w-5 mr-2" />
                      Dashboard
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleLogout}>
                      <LogOut className="h-5 w-5 mr-2" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" className="w-full justify-start" onClick={openLoginModal}>
                      <LogIn className="h-5 w-5 mr-2" />
                      Login
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start" onClick={openSignupModal}>
                      <User className="h-5 w-5 mr-2" />
                      Sign Up
                    </Button>
                  </>
                )}
              </nav>
            </div>
          </div>
        )}
      </header>

      {/* Auth Modals */}
      <AuthModals
        isLoginOpen={isLoginOpen}
        isSignupOpen={isSignupOpen}
        onLoginClose={() => setIsLoginOpen(false)}
        onSignupClose={() => setIsSignupOpen(false)}
        onSwitchToLogin={() => {
          setIsSignupOpen(false);
          setIsLoginOpen(true);
        }}
        onSwitchToSignup={() => {
          setIsLoginOpen(false);
          setIsSignupOpen(true);
        }}
      />
    </>
  );
};

export default Header;
