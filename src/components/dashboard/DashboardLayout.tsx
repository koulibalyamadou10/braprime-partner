import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
    Bell,
    ChevronRight,
    CreditCard,
    Heart,
    Home,
    LogOut,
    MapPin,
    Menu,
    Package,
    Settings,
    ShoppingBag,
    TrendingUp,
    UserCircle,
    Users,
    X
} from 'lucide-react';
import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

interface NavItemProps {
  href: string;
  label: string;
  icon: ReactNode;
  isActive: boolean;
}

const NavItem = ({ href, label, icon, isActive }: NavItemProps) => (
  <Link
    to={href}
    className={cn(
      'flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-guinea-red',
      isActive && 'bg-guinea-red/5 text-guinea-red font-medium'
    )}
  >
    {icon}
    <span>{label}</span>
    {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
  </Link>
);

interface DashboardLayoutProps {
  children: ReactNode;
  navItems: {
    href: string;
    label: string;
    icon: ReactNode;
    businessTypeRestriction?: number;
  }[];
  title: string;
  businessTypeId?: number;
}

const DashboardLayout = ({ children, navItems, title, businessTypeId }: DashboardLayoutProps) => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Filtrer les éléments de navigation en fonction du type de business
  const filteredNavItems = navItems.filter(item => {
    // Si l'item a une restriction de type de business, vérifier si l'utilisateur y a accès
    if (item.businessTypeRestriction) {
      return businessTypeId === item.businessTypeRestriction;
    }
    // Sinon, l'item est accessible à tous
    return true;
  });

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-gray-900 px-4 sm:px-6 lg:px-8">
        <Button
          variant="outline"
          size="icon"
          className="lg:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
          <span className="sr-only">Toggle menu</span>
        </Button>

        <div className="flex flex-1 items-center gap-4 md:gap-8">
          <Link to="/" className="flex items-center space-x-2">
            <img src="/logo.png" alt="BraPrime Logo" className="block h-10 sm:h-12 md:h-14 w-auto" />
          </Link>
          <div className="ml-auto flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2">
              <Avatar className="h-9 w-9">
                <AvatarImage src={currentUser?.profileImage} alt={currentUser?.name} />
                <AvatarFallback>{currentUser?.name?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-white">{currentUser?.name}</p>
                <p className="text-xs text-gray-300">{currentUser?.email}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-white hover:bg-gray-800">
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-20 mt-16 w-64 transform border-r bg-white pt-5 transition-transform duration-200 lg:static lg:translate-x-0',
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="px-4 py-2">
            <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
              {title}
            </h2>
            <div className="space-y-1">
              {filteredNavItems.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  isActive={location.pathname === item.href}
                />
              ))}
            </div>
          </div>
        </aside>

        {/* Mobile backdrop */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-10 bg-black/20 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
};

// Define base navigation items for partners
const basePartnerNavItems = [
  {
    href: '/partner-dashboard',
    label: 'Tableau de bord',
    icon: <Home className="h-5 w-5" />,
  },
  {
    href: '/partner-dashboard/orders',
    label: 'Commandes',
    icon: <ShoppingBag className="h-5 w-5" />,
  },
  {
    href: '/partner-dashboard/menu',
    label: 'Menu',
    icon: <CreditCard className="h-5 w-5" />,
  },
  {
    href: '/partner-dashboard/reservations',
    label: 'Réservations',
    icon: <Bell className="h-5 w-5" />,
  },
  {
    href: '/partner-dashboard/revenue',
    label: 'Revenus',
    icon: <TrendingUp className="h-5 w-5" />,
  },
  {
    href: '/partner-dashboard/colis',
    label: 'Colis',
    icon: <Package className="h-5 w-5" />,
    businessTypeRestriction: 64, // ID du type "packages"
  },
  {
    href: '/partner-dashboard/users',
    label: 'Utilisateurs',
    icon: <Users className="h-5 w-5" />,
  },
  {
    href: '/partner-dashboard/billing',
    label: 'Facturation',
    icon: <CreditCard className="h-5 w-5" />,
  },
  {
    href: '/partner-dashboard/profile',
    label: 'Profil',
    icon: <UserCircle className="h-5 w-5" />,
  },
  {
    href: '/partner-dashboard/settings',
    label: 'Paramètres',
    icon: <MapPin className="h-5 w-5" />,
  },
];

// Function to get navigation items based on business type
export const getPartnerNavItems = (businessTypeId?: number) => {
  console.log('🔍 [getPartnerNavItems] businessTypeId reçu:', businessTypeId);
  
  const filteredItems = basePartnerNavItems.filter(item => {
    // Si l'item a une restriction de type de business, vérifier si l'utilisateur y a accès
    if (item.businessTypeRestriction) {
      const hasAccess = businessTypeId === item.businessTypeRestriction;
      console.log(`🔍 [getPartnerNavItems] Item "${item.label}" (restriction: ${item.businessTypeRestriction}) - Accès: ${hasAccess}`);
      return hasAccess;
    }
    // Sinon, l'item est accessible à tous
    return true;
  });
  
  console.log('🔍 [getPartnerNavItems] Items filtrés:', filteredItems.map(item => item.label));
  return filteredItems;
};

// Export the default navigation items (for backward compatibility)
export const partnerNavItems = basePartnerNavItems;

export const userNavItems = [
  {
    href: '/dashboard',
    label: 'Tableau de bord',
    icon: <Home className="h-5 w-5" />,
  },
  {
    href: '/dashboard/orders',
    label: 'Mes commandes',
    icon: <ShoppingBag className="h-5 w-5" />,
  },
  {
    href: '/dashboard/favorites',
    label: 'Favoris',
    icon: <Heart className="h-5 w-5" />,
  },
  {
    href: '/dashboard/profile',
    label: 'Profil',
    icon: <UserCircle className="h-5 w-5" />,
  },
  {
    href: '/dashboard/settings',
    label: 'Paramètres',
    icon: <Settings className="h-5 w-5" />,
  },
];

export default DashboardLayout; 