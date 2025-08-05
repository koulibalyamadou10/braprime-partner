import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useEmailService } from '@/hooks/use-email-service';
import { useToast } from '@/hooks/use-toast';
import { Bike, Building2, Car, Mail, Motorcycle, Phone, Shield, Truck, User } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface DriverRegistrationData {
  name: string;
  email: string;
  phone: string;
  password: string;
  driver_type: 'independent' | 'service';
  business_id?: string;
  vehicle_type?: 'car' | 'motorcycle' | 'bike';
  vehicle_plate?: string;
  experience_years?: number;
  documents?: string[];
  notes?: string;
}

const DriverRegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { sendDriverRequestEmails } = useEmailService();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [formData, setFormData] = useState<DriverRegistrationData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    driver_type: 'independent',
    vehicle_type: 'motorcycle',
    experience_years: 1,
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Charger les commerces disponibles
  useEffect(() => {
    const loadBusinesses = async () => {
      try {
        // Simuler le chargement des commerces
        setBusinesses([
          { id: 1, name: 'Restaurant Le Gourmet' },
          { id: 2, name: 'Café Central' },
          { id: 3, name: 'Pizzeria Bella' }
        ]);
      } catch (error) {
        console.error('Erreur lors du chargement des commerces:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBusinesses();
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Le nom est requis';
    if (!formData.email.trim()) newErrors.email = 'L\'email est requis';
    if (!formData.phone.trim()) newErrors.phone = 'Le téléphone est requis';
    if (!formData.password.trim()) newErrors.password = 'Le mot de passe est requis';
    if (formData.password.length < 6) newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    
    if (formData.driver_type === 'service' && !formData.business_id) {
      newErrors.business_id = 'Veuillez sélectionner un commerce';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
        business_id: formData.driver_type === 'service' ? parseInt(formData.business_id!) : undefined,
        vehicle_type: formData.vehicle_type || undefined,
        vehicle_plate: formData.vehicle_plate || undefined,
        experience_years: formData.experience_years,
        notes: formData.notes
      };

      const { success, error: registerError } = await register(registrationData);

      if (success) {
        // Envoyer les emails de notification
        try {
          await sendDriverRequestEmails({
            request_id: `driver_${Date.now()}`,
            user_name: formData.name,
            user_email: formData.email,
            user_phone: formData.phone,
            vehicle_type: formData.vehicle_type,
            vehicle_plate: formData.vehicle_plate,
            notes: formData.notes,
            submitted_at: new Date().toISOString()
          });
        } catch (emailError) {
          console.warn('Erreur lors de l\'envoi des emails:', emailError);
          // Ne pas faire échouer l'inscription à cause des emails
        }

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
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="pl-10"
                        required
                      />
                    </div>
                    {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
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
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="pl-10"
                        required
                      />
                    </div>
                    {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
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
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="pl-10"
                      required
                    />
                  </div>
                  {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                </div>
              </div>

              {/* Type de livreur */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Type de livreur</h3>
                
                <div className="space-y-2">
                  <Label>Type de livreur *</Label>
                  <Select
                    value={formData.driver_type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, driver_type: value as 'independent' | 'service' }))}
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
                          <Building2 className="mr-2 h-4 w-4" />
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
                      onValueChange={(value) => setFormData(prev => ({ ...prev, business_id: value }))}
                      disabled={loading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un service" />
                      </SelectTrigger>
                      <SelectContent>
                        {loading ? (
                          <SelectItem value="loading" disabled>
                            <div className="flex items-center">
                              <Skeleton className="h-4 w-4 mr-2" />
                              Chargement...
                            </div>
                          </SelectItem>
                        ) : (
                          businesses.map((business) => (
                            <SelectItem key={business.id} value={business.id.toString()}>
                              {business.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {errors.business_id && <p className="text-sm text-red-500">{errors.business_id}</p>}
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
                      <Select
                        value={formData.vehicle_type}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, vehicle_type: value as 'car' | 'motorcycle' | 'bike' }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez un type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="car">
                            <div className="flex items-center">
                              <Car className="mr-2 h-4 w-4" />
                              Voiture
                            </div>
                          </SelectItem>
                          <SelectItem value="motorcycle">
                            <div className="flex items-center">
                              <Motorcycle className="mr-2 h-4 w-4" />
                              Moto
                            </div>
                          </SelectItem>
                          <SelectItem value="bike">
                            <div className="flex items-center">
                              <Bike className="mr-2 h-4 w-4" />
                              Vélo
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {errors.vehicle_type && <p className="text-sm text-red-500">{errors.vehicle_type}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vehicle_plate">Plaque d'immatriculation</Label>
                    <Input
                      id="vehicle_plate"
                      name="vehicle_plate"
                      type="text"
                      placeholder="ABC-123-DE"
                      value={formData.vehicle_plate}
                      onChange={(e) => setFormData(prev => ({ ...prev, vehicle_plate: e.target.value }))}
                    />
                    {errors.vehicle_plate && <p className="text-sm text-red-500">{errors.vehicle_plate}</p>}
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
                      <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Au moins 6 caractères"
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        className="pl-10 pr-10"
                        required
                      />
                    </div>
                    {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder="Confirmez votre mot de passe"
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        className="pl-10 pr-10"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Conditions d'utilisation */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={true} // Assuming terms are accepted by default for now
                    onChange={(e) => setFormData(prev => ({ ...prev, termsAccepted: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
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
              {/* The original code had an error state, but the new code doesn't.
                  Assuming the error state is no longer relevant or will be handled differently.
                  For now, removing the error display as per the new_code. */}

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