import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth, type User } from '@/contexts/AuthContext';
import { Loader2, Building2, MapPin, Phone, Clock, Truck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAvailableServiceTypes } from '@/hooks/use-dashboard';

interface AuthModalsProps {
  isLoginOpen: boolean;
  isSignupOpen: boolean;
  onLoginClose: () => void;
  onSignupClose: () => void;
  onSwitchToSignup: () => void;
  onSwitchToLogin: () => void;
}

export const AuthModals = ({
  isLoginOpen,
  isSignupOpen,
  onLoginClose,
  onSignupClose,
  onSwitchToSignup,
  onSwitchToLogin
}: AuthModalsProps) => {
  const { login, signup, isLoading, error } = useAuth();
  const { toast } = useToast();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  
  // Récupérer les types de services disponibles
  const { data: serviceTypes } = useAvailableServiceTypes();
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Signup form state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupRole, setSignupRole] = useState<User['role']>('customer');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupAddress, setSignupAddress] = useState('');

  // Service form state (pour les partenaires)
  const [serviceName, setServiceName] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [serviceTypeId, setServiceTypeId] = useState<string>('');
  const [serviceAddress, setServiceAddress] = useState('');
  const [servicePhone, setServicePhone] = useState('');
  const [serviceOpeningHours, setServiceOpeningHours] = useState('');
  const [serviceDeliveryTime, setServiceDeliveryTime] = useState('');
  const [serviceDeliveryFee, setServiceDeliveryFee] = useState('');
  const [serviceCoverImage, setServiceCoverImage] = useState('');

  // Form validation state
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Handle login submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!loginEmail || !loginPassword) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoggingIn(true);
    
    try {
      // Demo accounts
      if (loginEmail === 'demo') {
        await login('customer@example.com', 'password');
        toast({
          title: "Connexion réussie",
          description: "Vous êtes connecté en tant que client de démonstration.",
        });
        resetLoginForm();
        onLoginClose();
        return;
      } else if (loginEmail === 'demop' || loginEmail === 'demo-partner') {
        await login('partner@example.com', 'password');
        toast({
          title: "Connexion réussie",
          description: "Vous êtes connecté en tant que partenaire de démonstration.",
        });
        resetLoginForm();
        onLoginClose();
        return;
      }
      
      // Regular login
      const success = await login(loginEmail, loginPassword);
      
      if (success) {
        toast({
          title: "Connexion réussie",
          description: "Vous êtes maintenant connecté.",
        });
        resetLoginForm();
        onLoginClose();
      } else {
        toast({
          title: "Échec de connexion",
          description: "Email ou mot de passe incorrect.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsLoggingIn(false);
    }
  };
  
  // Handle signup submission
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const errors: Record<string, string> = {};
    if (!signupName) errors.signupName = 'Le nom est requis';
    if (!signupEmail) errors.signupEmail = 'L\'email est requis';
    if (!signupPassword) errors.signupPassword = 'Le mot de passe est requis';
    if (signupPassword !== signupConfirmPassword) {
      errors.signupConfirmPassword = 'Les mots de passe ne correspondent pas';
    }
    
    // Validation spécifique pour les partenaires
    if (signupRole === 'partner') {
      if (!serviceName) errors.serviceName = 'Le nom du service est requis';
      if (!serviceDescription) errors.serviceDescription = 'La description du service est requise';
      if (!serviceTypeId) errors.serviceTypeId = 'Le type de service est requis';
      if (!serviceAddress) errors.serviceAddress = 'L\'adresse du service est requise';
      if (!servicePhone) errors.servicePhone = 'Le téléphone du service est requis';
      if (!serviceOpeningHours) errors.serviceOpeningHours = 'Les heures d\'ouverture sont requises';
      if (!serviceDeliveryTime) errors.serviceDeliveryTime = 'Le temps de livraison est requis';
      if (!serviceDeliveryFee) errors.serviceDeliveryFee = 'Les frais de livraison sont requis';
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setIsCreatingAccount(true);
    
    try {
      const userData: Partial<User> = {
        name: signupName,
        email: signupEmail,
        role: signupRole,
        phoneNumber: signupPhone,
        address: signupAddress
      };
      
      const success = await signup(userData, signupPassword);
      
      if (success) {
        // Si c'est un partenaire, créer le service
        if (signupRole === 'partner') {
          try {
            // Import dynamique pour éviter les erreurs de dépendance circulaire
            const { DashboardService } = await import('@/lib/services/dashboard');
            
            const serviceData = {
              name: serviceName,
              description: serviceDescription,
              service_type_id: parseInt(serviceTypeId),
              cover_image: serviceCoverImage || 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
              delivery_time: serviceDeliveryTime,
              delivery_fee: parseInt(serviceDeliveryFee),
              address: serviceAddress,
              phone: servicePhone,
              opening_hours: serviceOpeningHours,
              is_active: true
            };
            
            await DashboardService.createService(serviceData);
            
            toast({
              title: 'Inscription réussie',
              description: 'Votre compte partenaire et votre service ont été créés avec succès.',
              variant: 'default'
            });
          } catch (serviceError) {
            console.error('Erreur lors de la création du service:', serviceError);
            toast({
              title: 'Compte créé, service en attente',
              description: 'Votre compte a été créé mais la création du service a échoué. Vous pourrez le créer plus tard.',
              variant: 'default'
            });
          }
        } else {
          toast({
            title: 'Inscription réussie',
            description: 'Votre compte a été créé avec succès.',
            variant: 'default'
          });
        }
        
        onSignupClose();
        resetSignupForm();
      } else {
        toast({
          title: 'Échec de l\'inscription',
          description: error || 'Une erreur s\'est produite lors de l\'inscription',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Une erreur s\'est produite. Veuillez réessayer.',
        variant: 'destructive'
      });
    } finally {
      setIsCreatingAccount(false);
    }
  };
  
  // Reset form states
  const resetLoginForm = () => {
    setLoginEmail('');
    setLoginPassword('');
    setFormErrors({});
  };
  
  const resetSignupForm = () => {
    setSignupName('');
    setSignupEmail('');
    setSignupPassword('');
    setSignupConfirmPassword('');
    setSignupRole('customer');
    setSignupPhone('');
    setSignupAddress('');
    setServiceName('');
    setServiceDescription('');
    setServiceTypeId('');
    setServiceAddress('');
    setServicePhone('');
    setServiceOpeningHours('');
    setServiceDeliveryTime('');
    setServiceDeliveryFee('');
    setServiceCoverImage('');
    setFormErrors({});
  };
  
  return (
    <>
      {/* Login Modal */}
      {isLoginOpen && (
        <Dialog open={true} onOpenChange={(open) => {
          if (!open) onLoginClose();
        }}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Connexion</DialogTitle>
              <DialogDescription>
                Entrez vos identifiants pour accéder à votre compte.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleLogin} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="example@email.com"
                  className={formErrors.loginEmail ? 'border-red-500' : ''}
                />
                {formErrors.loginEmail && (
                  <p className="text-sm text-red-500">{formErrors.loginEmail}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className={formErrors.loginPassword ? 'border-red-500' : ''}
                />
                {formErrors.loginPassword && (
                  <p className="text-sm text-red-500">{formErrors.loginPassword}</p>
                )}
              </div>
              
              {/* Demo accounts section */}
              <div className="space-y-2 pt-2 border-t">
                <p className="text-sm font-medium">Comptes de démonstration (Mot de passe: "password" pour tous)</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setLoginEmail('customer@example.com');
                      setLoginPassword('password');
                    }}
                  >
                    Client
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setLoginEmail('partner@example.com');
                      setLoginPassword('password');
                    }}
                  >
                    Partenaire
                  </Button>
                </div>
              </div>
              
              <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    onLoginClose();
                    onSwitchToSignup();
                  }}
                  className="w-full sm:w-auto"
                >
                  Créer un compte
                </Button>
                
                <Button 
                  type="submit" 
                  className="w-full sm:w-auto bg-guinea-red hover:bg-guinea-red/90"
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connexion...
                    </>
                  ) : (
                    'Se connecter'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Signup Modal */}
      {isSignupOpen && (
        <Dialog open={true} onOpenChange={(open) => {
          if (!open) onSignupClose();
        }}>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Créer un compte</DialogTitle>
              <DialogDescription>
                Remplissez vos informations pour créer un nouveau compte.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSignup} className="space-y-6 py-4">
              {/* Informations personnelles */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Informations personnelles</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom complet</Label>
                    <Input
                      id="name"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      placeholder="John Doe"
                      className={formErrors.signupName ? 'border-red-500' : ''}
                    />
                    {formErrors.signupName && (
                      <p className="text-sm text-red-500">{formErrors.signupName}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="example@email.com"
                      className={formErrors.signupEmail ? 'border-red-500' : ''}
                    />
                    {formErrors.signupEmail && (
                      <p className="text-sm text-red-500">{formErrors.signupEmail}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe</Label>
                    <Input
                      id="password"
                      type="password"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="••••••••"
                      className={formErrors.signupPassword ? 'border-red-500' : ''}
                    />
                    {formErrors.signupPassword && (
                      <p className="text-sm text-red-500">{formErrors.signupPassword}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className={formErrors.signupConfirmPassword ? 'border-red-500' : ''}
                    />
                    {formErrors.signupConfirmPassword && (
                      <p className="text-sm text-red-500">{formErrors.signupConfirmPassword}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="role">Type de compte</Label>
                    <Select 
                      value={signupRole} 
                      onValueChange={(value) => setSignupRole(value as User['role'])}
                    >
                      <SelectTrigger id="role">
                        <SelectValue placeholder="Sélectionner le type de compte" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="customer">Client</SelectItem>
                        <SelectItem value="partner">Partenaire</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Numéro de téléphone</Label>
                    <Input
                      id="phone"
                      value={signupPhone}
                      onChange={(e) => setSignupPhone(e.target.value)}
                      placeholder="+224 621 23 45 67"
                    />
                  </div>
                  
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="address">Adresse</Label>
                    <Input
                      id="address"
                      value={signupAddress}
                      onChange={(e) => setSignupAddress(e.target.value)}
                      placeholder="123 Rue principale, Conakry"
                    />
                  </div>
                </div>
              </div>
              
              {/* Informations du service (pour les partenaires) */}
              {signupRole === 'partner' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2 flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Informations du service
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="serviceName">Nom du service</Label>
                      <Input
                        id="serviceName"
                        value={serviceName}
                        onChange={(e) => setServiceName(e.target.value)}
                        placeholder="Mon Restaurant"
                        className={formErrors.serviceName ? 'border-red-500' : ''}
                      />
                      {formErrors.serviceName && (
                        <p className="text-sm text-red-500">{formErrors.serviceName}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="serviceType">Type de service</Label>
                      <Select 
                        value={serviceTypeId} 
                        onValueChange={setServiceTypeId}
                      >
                        <SelectTrigger id="serviceType" className={formErrors.serviceTypeId ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Sélectionner le type de service" />
                        </SelectTrigger>
                        <SelectContent>
                          {serviceTypes?.map((type) => (
                            <SelectItem key={type.id} value={type.id.toString()}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formErrors.serviceTypeId && (
                        <p className="text-sm text-red-500">{formErrors.serviceTypeId}</p>
                      )}
                    </div>
                    
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="serviceDescription">Description du service</Label>
                      <Textarea
                        id="serviceDescription"
                        value={serviceDescription}
                        onChange={(e) => setServiceDescription(e.target.value)}
                        placeholder="Décrivez votre service, vos spécialités, votre ambiance..."
                        rows={3}
                        className={formErrors.serviceDescription ? 'border-red-500' : ''}
                      />
                      {formErrors.serviceDescription && (
                        <p className="text-sm text-red-500">{formErrors.serviceDescription}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="serviceAddress" className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Adresse du service
                      </Label>
                      <Input
                        id="serviceAddress"
                        value={serviceAddress}
                        onChange={(e) => setServiceAddress(e.target.value)}
                        placeholder="123 Rue du Commerce, Conakry"
                        className={formErrors.serviceAddress ? 'border-red-500' : ''}
                      />
                      {formErrors.serviceAddress && (
                        <p className="text-sm text-red-500">{formErrors.serviceAddress}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="servicePhone" className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Téléphone du service
                      </Label>
                      <Input
                        id="servicePhone"
                        value={servicePhone}
                        onChange={(e) => setServicePhone(e.target.value)}
                        placeholder="+224 621 23 45 67"
                        className={formErrors.servicePhone ? 'border-red-500' : ''}
                      />
                      {formErrors.servicePhone && (
                        <p className="text-sm text-red-500">{formErrors.servicePhone}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="serviceOpeningHours" className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Heures d'ouverture
                      </Label>
                      <Input
                        id="serviceOpeningHours"
                        value={serviceOpeningHours}
                        onChange={(e) => setServiceOpeningHours(e.target.value)}
                        placeholder="08:00 - 22:00"
                        className={formErrors.serviceOpeningHours ? 'border-red-500' : ''}
                      />
                      {formErrors.serviceOpeningHours && (
                        <p className="text-sm text-red-500">{formErrors.serviceOpeningHours}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="serviceDeliveryTime" className="flex items-center gap-2">
                        <Truck className="h-4 w-4" />
                        Temps de livraison
                      </Label>
                      <Input
                        id="serviceDeliveryTime"
                        value={serviceDeliveryTime}
                        onChange={(e) => setServiceDeliveryTime(e.target.value)}
                        placeholder="25-35 min"
                        className={formErrors.serviceDeliveryTime ? 'border-red-500' : ''}
                      />
                      {formErrors.serviceDeliveryTime && (
                        <p className="text-sm text-red-500">{formErrors.serviceDeliveryTime}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="serviceDeliveryFee">Frais de livraison (FCFA)</Label>
                      <Input
                        id="serviceDeliveryFee"
                        type="number"
                        value={serviceDeliveryFee}
                        onChange={(e) => setServiceDeliveryFee(e.target.value)}
                        placeholder="15000"
                        className={formErrors.serviceDeliveryFee ? 'border-red-500' : ''}
                      />
                      {formErrors.serviceDeliveryFee && (
                        <p className="text-sm text-red-500">{formErrors.serviceDeliveryFee}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="serviceCoverImage">Image de couverture (URL)</Label>
                      <Input
                        id="serviceCoverImage"
                        type="url"
                        value={serviceCoverImage}
                        onChange={(e) => setServiceCoverImage(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    onSignupClose();
                    onSwitchToLogin();
                  }}
                  className="w-full sm:w-auto"
                >
                  Vous avez déjà un compte ?
                </Button>
                
                <Button 
                  type="submit" 
                  className="w-full sm:w-auto bg-guinea-red hover:bg-guinea-red/90"
                  disabled={isCreatingAccount}
                >
                  {isCreatingAccount ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Création du compte...
                    </>
                  ) : (
                    'Créer le compte'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}; 