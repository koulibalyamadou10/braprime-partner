import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Menu, X, LogOut, Home, ChevronRight, 
  UserCircle, ShoppingBag, MapPin, CreditCard, Bell, Calendar, Truck, Key, Building2, Users, BarChart3, Settings, Shield, Package, DollarSign, TrendingUp
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
  }[];
  title: string;
}

const DashboardLayout = ({ children, navItems, title }: DashboardLayoutProps) => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white px-4 sm:px-6 lg:px-8">
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
            <div className="h-8 w-8 rounded-full overflow-hidden guinea-gradient"></div>
            <span className="font-bold text-xl hidden md:inline-block">BraPrime</span>
          </Link>
          <div className="ml-auto flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2">
              <Avatar className="h-9 w-9">
                <AvatarImage src={currentUser?.profileImage} alt={currentUser?.name} />
                <AvatarFallback>{currentUser?.name?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="text-sm font-medium">{currentUser?.name}</p>
                <p className="text-xs text-gray-500">{currentUser?.email}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
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
              {navItems.map((item) => (
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

// Define navigation items for each user type
export const userNavItems = [
  {
    href: '/dashboard',
    label: 'Tableau de bord',
    icon: <Home className="h-5 w-5" />,
  },
  {
    href: '/dashboard/orders',
    label: 'Commandes',
    icon: <ShoppingBag className="h-5 w-5" />,
  },
  {
    href: '/dashboard/reservations',
    label: 'Réservations',
    icon: <Calendar className="h-5 w-5" />,
  },
  {
    href: '/dashboard/profile',
    label: 'Profil',
    icon: <UserCircle className="h-5 w-5" />,
  },
  {
    href: '/dashboard/addresses',
    label: 'Adresses',
    icon: <MapPin className="h-5 w-5" />,
  },
  {
    href: '/dashboard/payments',
    label: 'Moyens de paiement',
    icon: <CreditCard className="h-5 w-5" />,
  },
  {
    href: '/dashboard/notifications',
    label: 'Notifications',
    icon: <Bell className="h-5 w-5" />,
  },
];

export const partnerNavItems = [
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
    href: '/partner-dashboard/drivers',
    label: 'Livreurs',
    icon: <Truck className="h-5 w-5" />,
  },
  {
    href: '/partner-dashboard/driver-auth',
    label: 'Comptes Livreurs',
    icon: <Key className="h-5 w-5" />,
  },
  {
    href: '/partner-dashboard/revenue',
    label: 'Revenus',
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

export const driverNavItems = [
  {
    href: '/driver-dashboard',
    label: 'Tableau de bord',
    icon: <Home className="h-5 w-5" />,
  },
  {
    href: '/driver-dashboard/orders',
    label: 'Mes Livraisons',
    icon: <Package className="h-5 w-5" />,
  },
  {
    href: '/driver-dashboard/profile',
    label: 'Profil',
    icon: <UserCircle className="h-5 w-5" />,
  },
  {
    href: '/driver-dashboard/earnings',
    label: 'Gains',
    icon: <DollarSign className="h-5 w-5" />,
  },
  {
    href: '/driver-dashboard/statistics',
    label: 'Statistiques',
    icon: <TrendingUp className="h-5 w-5" />,
  },
];

export const adminNavItems = [
  {
    href: '/admin-dashboard',
    label: 'Tableau de bord',
    icon: <Home className="h-5 w-5" />,
  },
  {
    href: '/admin-dashboard/businesses',
    label: 'Commerces',
    icon: <Building2 className="h-5 w-5" />,
  },
  {
    href: '/admin-dashboard/users',
    label: 'Utilisateurs',
    icon: <Users className="h-5 w-5" />,
  },
  {
    href: '/admin-dashboard/orders',
    label: 'Commandes',
    icon: <ShoppingBag className="h-5 w-5" />,
  },
  {
    href: '/admin-dashboard/drivers',
    label: 'Livreurs',
    icon: <Truck className="h-5 w-5" />,
  },
  {
    href: '/admin-dashboard/content',
    label: 'Contenu',
    icon: <Package className="h-5 w-5" />,
  },
  {
    href: '/admin-dashboard/analytics',
    label: 'Analytics',
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    href: '/admin-dashboard/system',
    label: 'Système',
    icon: <Settings className="h-5 w-5" />,
  },
  {
    href: '/admin-dashboard/settings',
    label: 'Paramètres',
    icon: <Shield className="h-5 w-5" />,
  },
];

export default DashboardLayout; 