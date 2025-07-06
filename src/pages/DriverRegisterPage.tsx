import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDriverAuth } from '@/contexts/DriverAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Truck, 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User,
  Phone,
  Car,
  Building,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface Business {
  id: number;
  name: string;
  business_type: string;
}

const DriverRegisterPage = () => {
  const navigate = useNavigate();
  const { register, loading, error } = useDriverAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    driver_type: 'independent' as 'independent' | 'service',
    business_id: '',
    vehicle_type: '',
    vehicle_plate: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loadingBusinesses, setLoadingBusinesses] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [emailExists, setEmailExists] = useState(false);

  // Charger les commerces disponibles
  useEffect(() => {
    loadBusinesses();
  }, []);

  const loadBusinesses = async () => {
    setLoadingBusinesses(true);
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('id, name, business_type')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Erreur lors du chargement des commerces:', error);
      } else {
        setBusinesses(data || []);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des commerces:', err);
    } finally {
      setLoadingBusinesses(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Vérifier l'email en temps réel
    if (name === 'email' && value) {
      checkEmailExists(value);
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const checkEmailExists = async (email: string) => {
    try {
      const { exists } = await supabase
        .from('drivers')
        .select('id')
        .eq('email', email)
        .single()
        .then(result => ({ exists: !!result.data }))
        .catch(() => ({ exists: false }));

      setEmailExists(exists);
    } catch (err) {
      setEmailExists(false);
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Le nom est requis');
      return false;
    }

    if (!formData.email.trim()) {
      toast.error('L\'email est requis');
      return false;
    }

    if (emailExists) {
      toast.error('Cet email est déjà utilisé');
      return false;
    }

    if (!formData.phone.trim()) {
      toast.error('Le numéro de téléphone est requis');
      return false;
    }

    if (formData.password.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return false;
    }

    if (formData.driver_type === 'service' && !formData.business_id) {
      toast.error('Veuillez sélectionner un service/commerce');
      return false;
    }

    if (!acceptedTerms) {
      toast.error('Veuillez accepter les conditions d\'utilisation');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const registrationData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        driver_type: formData.driver_type,
        business_id: formData.driver_type === 'service' ? parseInt(formData.business_id) : undefined,
        vehicle_type: formData.vehicle_type || undefined,
        vehicle_plate: formData.vehicle_plate || undefined
      };

      const { success, error: registerError } = await register(registrationData);

      if (success) {
        toast.success('Inscription réussie ! Vérifiez votre email pour confirmer votre compte.');
        navigate('/driver/login');
      } else if (registerError) {
        toast.error(registerError);
      }
    } catch (err) {
      toast.error('Erreur lors de l\'inscription');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-2xl">
          <CardHeader className="space-y-1">
            <Skeleton className="h-8 w-48 mx-auto" />
            <Skeleton className="h-4 w-64 mx-auto" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
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
      <div className="max-w-2xl w-full space-y-8">
        {/* Logo et titre */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center">
            <Truck className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Inscription Livreur
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Rejoignez notre équipe de livreurs
          </p>
        </div>

        {/* Formulaire d'inscription */}
        <Card>
          <CardHeader>
            <CardTitle>Créer un compte livreur</CardTitle>
            <CardDescription>
              Remplissez le formulaire ci-dessous pour créer votre compte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Informations personnelles */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Informations personnelles</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom complet *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Votre nom complet"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="+224 123 456 789"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="votre@email.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`pl-10 ${emailExists ? 'border-red-500' : ''}`}
                      required
                    />
                  </div>
                  {emailExists && (
                    <p className="text-sm text-red-500">Cet email est déjà utilisé</p>
                  )}
                </div>
              </div>

              {/* Type de livreur */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Type de livreur</h3>
                
                <div className="space-y-2">
                  <Label>Type de livreur *</Label>
                  <Select
                    value={formData.driver_type}
                    onValueChange={(value) => handleSelectChange('driver_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez votre type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="independent">
                        <div className="flex items-center">
                          <Truck className="mr-2 h-4 w-4" />
                          Livreur indépendant
                        </div>
                      </SelectItem>
                      <SelectItem value="service">
                        <div className="flex items-center">
                          <Building className="mr-2 h-4 w-4" />
                          Livreur de service
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.driver_type === 'service' && (
                  <div className="space-y-2">
                    <Label>Service/Commerce *</Label>
                    <Select
                      value={formData.business_id}
                      onValueChange={(value) => handleSelectChange('business_id', value)}
                      disabled={loadingBusinesses}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un service" />
                      </SelectTrigger>
                      <SelectContent>
                        {loadingBusinesses ? (
                          <SelectItem value="loading" disabled>
                            <div className="flex items-center">
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Chargement...
                            </div>
                          </SelectItem>
                        ) : (
                          businesses.map((business) => (
                            <SelectItem key={business.id} value={business.id.toString()}>
                              {business.name} ({business.business_type})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Informations véhicule */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Informations véhicule</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vehicle_type">Type de véhicule</Label>
                    <div className="relative">
                      <Car className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="vehicle_type"
                        name="vehicle_type"
                        type="text"
                        placeholder="Moto, Voiture, etc."
                        value={formData.vehicle_type}
                        onChange={handleInputChange}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vehicle_plate">Plaque d'immatriculation</Label>
                    <Input
                      id="vehicle_plate"
                      name="vehicle_plate"
                      type="text"
                      placeholder="ABC-123-DE"
                      value={formData.vehicle_plate}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              {/* Mot de passe */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Sécurité</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Au moins 6 caractères"
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

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirmez votre mot de passe"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="pl-10 pr-10"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Conditions d'utilisation */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={acceptedTerms}
                    onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                  />
                  <Label htmlFor="terms" className="text-sm">
                    J'accepte les{' '}
                    <Link to="/terms" className="text-blue-600 hover:text-blue-500">
                      conditions d'utilisation
                    </Link>{' '}
                    et la{' '}
                    <Link to="/privacy" className="text-blue-600 hover:text-blue-500">
                      politique de confidentialité
                    </Link>
                  </Label>
                </div>
              </div>

              {/* Erreur */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Bouton d'inscription */}
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || loading}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Création du compte...
                  </div>
                ) : (
                  <div className="flex items-center">
                    Créer mon compte
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                )}
              </Button>
            </form>

            {/* Lien vers la connexion */}
            <div className="mt-6 text-center">
              <span className="text-sm text-gray-600">
                Déjà un compte ?{' '}
              </span>
              <Link
                to="/driver/login"
                className="text-sm text-blue-600 hover:text-blue-500 font-medium"
              >
                Se connecter
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DriverRegisterPage; 