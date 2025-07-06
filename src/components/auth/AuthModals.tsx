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
import { Loader2, Building2, MapPin, Phone, Clock, Truck, UserCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { BusinessService, type BusinessType } from '@/lib/services/business';

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
  
  // Récupérer les types de business disponibles
  const [businessTypes, setBusinessTypes] = useState<BusinessType[]>([]);
  const [isLoadingBusinessTypes, setIsLoadingBusinessTypes] = useState(false);
  
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

  // Business form state (pour les partenaires)
  const [businessName, setBusinessName] = useState('');
  const [businessDescription, setBusinessDescription] = useState('');
  const [businessTypeId, setBusinessTypeId] = useState<string>('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [businessPhone, setBusinessPhone] = useState('');
  const [businessOpeningHours, setBusinessOpeningHours] = useState('');
  const [businessDeliveryTime, setBusinessDeliveryTime] = useState('');
  const [businessDeliveryFee, setBusinessDeliveryFee] = useState('');
  const [businessCoverImage, setBusinessCoverImage] = useState('');

  // Form validation state
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Charger les types de business quand le modal s'ouvre
  const loadBusinessTypes = async () => {
    if (businessTypes.length > 0) return; // Déjà chargés
    
    setIsLoadingBusinessTypes(true);
    try {
      const { data, error } = await BusinessService.getBusinessTypes();
      if (error) {
        console.error('Erreur lors du chargement des types de business:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les types de business.",
          variant: "destructive",
        });
      } else if (data) {
        setBusinessTypes(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des types de business:', error);
    } finally {
      setIsLoadingBusinessTypes(false);
    }
  };

  // Charger les types de business quand le rôle partenaire est sélectionné
  const handleRoleChange = (role: User['role']) => {
    setSignupRole(role);
    if (role === 'partner') {
      loadBusinessTypes();
    }
  };
  
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
      if (!businessName) errors.businessName = 'Le nom du business est requis';
      if (!businessDescription) errors.businessDescription = 'La description du business est requise';
      if (!businessTypeId) errors.businessTypeId = 'Le type de business est requis';
      if (!businessAddress) errors.businessAddress = 'L\'adresse du business est requise';
      if (!businessPhone) errors.businessPhone = 'Le téléphone du business est requis';
      if (!businessOpeningHours) errors.businessOpeningHours = 'Les heures d\'ouverture sont requises';
      if (!businessDeliveryTime) errors.businessDeliveryTime = 'Le temps de livraison est requis';
      if (!businessDeliveryFee) errors.businessDeliveryFee = 'Les frais de livraison sont requis';
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
        // Si c'est un partenaire, créer le business
        if (signupRole === 'partner') {
          try {
            const businessData = {
              name: businessName,
              description: businessDescription,
              business_type_id: parseInt(businessTypeId),
              cover_image: businessCoverImage || 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
              delivery_time: businessDeliveryTime,
              delivery_fee: parseInt(businessDeliveryFee),
              address: businessAddress,
              phone: businessPhone,
              opening_hours: businessOpeningHours,
              owner_id: '' // Sera rempli par le service
            };
            
            const { data: business, error: businessError } = await BusinessService.createBusiness(businessData);
            
            if (businessError) {
              console.error('Erreur lors de la création du business:', businessError);
              toast({
                title: 'Compte créé, business en attente',
                description: 'Votre compte a été créé mais la création du business a échoué. Vous pourrez le créer plus tard.',
                variant: 'default'
              });
            } else {
            toast({
              title: 'Inscription réussie',
                description: 'Votre compte partenaire et votre business ont été créés avec succès.',
              variant: 'default'
            });
            }
          } catch (businessError) {
            console.error('Erreur lors de la création du business:', businessError);
            toast({
              title: 'Compte créé, business en attente',
              description: 'Votre compte a été créé mais la création du business a échoué. Vous pourrez le créer plus tard.',
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
    setBusinessName('');
    setBusinessDescription('');
    setBusinessTypeId('');
    setBusinessAddress('');
    setBusinessPhone('');
    setBusinessOpeningHours('');
    setBusinessDeliveryTime('');
    setBusinessDeliveryFee('');
    setBusinessCoverImage('');
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
                      onValueChange={handleRoleChange}
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
              
              {/* Informations du business (pour les partenaires) */}
              {signupRole === 'partner' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2 flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Informations du business
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="businessName">Nom du business</Label>
                      <Input
                        id="businessName"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="Mon Restaurant"
                        className={formErrors.businessName ? 'border-red-500' : ''}
                      />
                      {formErrors.businessName && (
                        <p className="text-sm text-red-500">{formErrors.businessName}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="businessType">Type de business</Label>
                      <Select 
                        value={businessTypeId} 
                        onValueChange={setBusinessTypeId}
                      >
                        <SelectTrigger id="businessType" className={formErrors.businessTypeId ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Sélectionner le type de business" />
                        </SelectTrigger>
                        <SelectContent>
                          {businessTypes?.map((type) => (
                            <SelectItem key={type.id} value={type.id.toString()}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formErrors.businessTypeId && (
                        <p className="text-sm text-red-500">{formErrors.businessTypeId}</p>
                      )}
                    </div>
                    
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="businessDescription">Description du business</Label>
                      <Textarea
                        id="businessDescription"
                        value={businessDescription}
                        onChange={(e) => setBusinessDescription(e.target.value)}
                        placeholder="Décrivez votre business, vos spécialités, votre ambiance..."
                        rows={3}
                        className={formErrors.businessDescription ? 'border-red-500' : ''}
                      />
                      {formErrors.businessDescription && (
                        <p className="text-sm text-red-500">{formErrors.businessDescription}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="businessAddress" className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Adresse du business
                      </Label>
                      <Input
                        id="businessAddress"
                        value={businessAddress}
                        onChange={(e) => setBusinessAddress(e.target.value)}
                        placeholder="123 Rue du Commerce, Conakry"
                        className={formErrors.businessAddress ? 'border-red-500' : ''}
                      />
                      {formErrors.businessAddress && (
                        <p className="text-sm text-red-500">{formErrors.businessAddress}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="businessPhone" className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Téléphone du business
                      </Label>
                      <Input
                        id="businessPhone"
                        value={businessPhone}
                        onChange={(e) => setBusinessPhone(e.target.value)}
                        placeholder="+224 621 23 45 67"
                        className={formErrors.businessPhone ? 'border-red-500' : ''}
                      />
                      {formErrors.businessPhone && (
                        <p className="text-sm text-red-500">{formErrors.businessPhone}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="businessOpeningHours" className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Heures d'ouverture
                      </Label>
                      <Input
                        id="businessOpeningHours"
                        value={businessOpeningHours}
                        onChange={(e) => setBusinessOpeningHours(e.target.value)}
                        placeholder="08:00 - 22:00"
                        className={formErrors.businessOpeningHours ? 'border-red-500' : ''}
                      />
                      {formErrors.businessOpeningHours && (
                        <p className="text-sm text-red-500">{formErrors.businessOpeningHours}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="businessDeliveryTime" className="flex items-center gap-2">
                        <Truck className="h-4 w-4" />
                        Temps de livraison
                      </Label>
                      <Input
                        id="businessDeliveryTime"
                        value={businessDeliveryTime}
                        onChange={(e) => setBusinessDeliveryTime(e.target.value)}
                        placeholder="25-35 min"
                        className={formErrors.businessDeliveryTime ? 'border-red-500' : ''}
                      />
                      {formErrors.businessDeliveryTime && (
                        <p className="text-sm text-red-500">{formErrors.businessDeliveryTime}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="businessDeliveryFee">Frais de livraison (FCFA)</Label>
                      <Input
                        id="businessDeliveryFee"
                        type="number"
                        value={businessDeliveryFee}
                        onChange={(e) => setBusinessDeliveryFee(e.target.value)}
                        placeholder="15000"
                        className={formErrors.businessDeliveryFee ? 'border-red-500' : ''}
                      />
                      {formErrors.businessDeliveryFee && (
                        <p className="text-sm text-red-500">{formErrors.businessDeliveryFee}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="businessCoverImage">Image de couverture (URL)</Label>
                      <Input
                        id="businessCoverImage"
                        type="url"
                        value={businessCoverImage}
                        onChange={(e) => setBusinessCoverImage(e.target.value)}
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