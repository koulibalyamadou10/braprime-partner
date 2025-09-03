import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { AuthModals } from '@/components/auth/AuthModals';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Hero from '@/components/ui/Hero';

const LoginPage = () => {
  const location = useLocation();
  const [isLoginOpen, setIsLoginOpen] = useState(true);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Détecter si l'utilisateur veut s'inscrire ou se connecter
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const action = searchParams.get('action');
    
    if (action === 'signup') {
      setIsSignupOpen(true);
      setIsLoginOpen(false);
    } else {
      setIsLoginOpen(true);
      setIsSignupOpen(false);
    }
  }, [location.search]);

  // If user is already authenticated, redirect them to home page
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  return (
    <Layout>
      <div className="container mx-auto px-4">
        <div className="mx-auto text-center">         
          <div className="mt-12 p-6 bg-gray-50 rounded-lg">
            <Hero />
          </div>
        </div>
      </div>
      
      {/* Auth Modals */}
      {isAuthenticated ? <></> : <AuthModals
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
      />}
    </Layout>
  );
};

export default LoginPage; 