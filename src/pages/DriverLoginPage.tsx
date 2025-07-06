import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDriverAuth } from '@/contexts/DriverAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Truck, 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  ArrowRight,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

const DriverLoginPage = () => {
  const navigate = useNavigate();
  const { login, loading, error } = useDriverAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setIsSubmitting(true);

    try {
      const { success, error: loginError } = await login({
        email: formData.email,
        password: formData.password
      });
      
      if (success) {
        toast.success('Connexion réussie !');
        navigate('/driver/dashboard');
      } else if (loginError) {
        toast.error(loginError);
      }
    } catch (err) {
      toast.error('Erreur lors de la connexion');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <Skeleton className="h-8 w-48 mx-auto" />
            <Skeleton className="h-4 w-64 mx-auto" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo et titre */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center">
            <Truck className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Connexion Livreur
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Accédez à votre espace livreur
          </p>
        </div>

        {/* Formulaire de connexion */}
        <Card>
          <CardHeader>
            <CardTitle>Se connecter</CardTitle>
            <CardDescription>
              Entrez vos identifiants pour accéder à votre compte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="email"
                    name="email"
                      type="email"
                    placeholder="votre@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10"
                      required
                    />
                </div>
                  </div>
                  
              {/* Mot de passe */}
                  <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe</Label>
                    <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                        placeholder="Votre mot de passe"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10 pr-10"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </div>

              {/* Erreur */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Bouton de connexion */}
                  <Button 
                    type="submit" 
                    className="w-full" 
                disabled={isSubmitting || loading}
                  >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Connexion...
                    </div>
                ) : (
                  <div className="flex items-center">
                    Se connecter
                    <ArrowRight className="ml-2 h-4 w-4" />
                    </div>
                )}
              </Button>
            </form>

            {/* Liens utiles */}
            <div className="mt-6 space-y-3">
              <div className="text-center">
                <Link
                  to="/driver/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
              
              <div className="text-center">
                <span className="text-sm text-gray-600">
                  Pas encore de compte ?{' '}
                </span>
                <Link
                  to="/driver/register"
                  className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                >
                  S'inscrire
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informations supplémentaires */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            En vous connectant, vous acceptez nos{' '}
            <Link to="/terms" className="text-blue-600 hover:text-blue-500">
              conditions d'utilisation
            </Link>{' '}
            et notre{' '}
            <Link to="/privacy" className="text-blue-600 hover:text-blue-500">
              politique de confidentialité
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DriverLoginPage; 