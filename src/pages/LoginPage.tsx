import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { AuthModals } from '@/components/auth/AuthModals';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const LoginPage = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(true);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // If user is already authenticated, redirect them to home page
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-6">Bienvenue sur BraPrime</h1>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Button 
              onClick={() => {
                setIsLoginOpen(true);
                setIsSignupOpen(false);
              }}
              className="bg-guinea-red hover:bg-guinea-red/90 text-white"
            >
              Se connecter
            </Button>
            <Button 
              onClick={() => {
                setIsSignupOpen(true);
                setIsLoginOpen(false);
              }}
              variant="outline"
              className="border-guinea-green text-guinea-green hover:bg-guinea-green/10"
            >
              Créer un compte
            </Button>
          </div>
          
          <div className="mt-12 p-6 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Pourquoi créer un compte?</h2>
            <ul className="text-left space-y-3">
              <li className="flex items-start">
                <span className="mr-2 text-guinea-green">✓</span>
                <span>Suivez vos commandes en temps réel</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-guinea-green">✓</span>
                <span>Sauvegardez vos adresses de livraison</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-guinea-green">✓</span>
                <span>Accédez à votre historique de commandes</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-guinea-green">✓</span>
                <span>Profitez d'offres spéciales pour les membres</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
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
    </Layout>
  );
};

export default LoginPage; 