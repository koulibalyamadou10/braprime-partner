import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute = ({ children, allowedRoles = [] }: ProtectedRouteProps) => {
  const { isAuthenticated, currentUser, isLoading } = useAuth();
  const location = useLocation();

  // Show loading state while authentication status is being determined
  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-screen">
        <div className="w-16 h-16 border-4 border-t-4 border-gray-200 rounded-full animate-spin border-t-blue-500"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // If roles are specified and the user doesn't have the required role
  if (allowedRoles.length > 0 && currentUser && !allowedRoles.includes(currentUser.role)) {
    // Redirect to the appropriate dashboard based on user role
    switch (currentUser.role) {
      case 'customer':
        return <Navigate to="/dashboard" replace />;
      case 'partner':
        return <Navigate to="/partner-dashboard" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  // If the user is authenticated and has the required role, render the children
  return <>{children}</>;
};

export default ProtectedRoute; 