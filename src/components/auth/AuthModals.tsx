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
import { useAuth, type User } from '@/contexts/AuthContext';
import { Loader2, UserCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  

  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Signup form state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupRole, setSignupRole] = useState<User['role']>('customer'); // Toujours customer pour les inscriptions normales
  const [signupPhone, setSignupPhone] = useState('');
  const [signupAddress, setSignupAddress] = useState('');



  // Form validation state
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});



  // Le rôle est toujours 'customer' pour les inscriptions normales
  // Les partenaires doivent s'inscrire via la page dédiée
  
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
        toast({
          title: 'Inscription réussie',
          description: 'Votre compte client a été créé avec succès.',
          variant: 'default'
        });
        
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
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Créer votre compte client</DialogTitle>
              <DialogDescription className="text-base">
                Rejoignez BraPrime et profitez de nos services de livraison rapide dans toute la Guinée.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSignup} className="space-y-6 py-4">
              {/* Informations personnelles */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2 text-guinea-red">Informations personnelles</h3>
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
                  
                  {/* Le type de compte est automatiquement défini comme "Client" pour les inscriptions normales */}
                  <input type="hidden" value="customer" />
                  <div className="space-y-2">
                    <Label htmlFor="role">Type de compte</Label>
                    <div className="flex items-center gap-2 p-3 bg-guinea-green/10 rounded-md border border-guinea-green/20">
                      <UserCheck className="h-4 w-4 text-guinea-green" />
                      <span className="text-sm font-medium text-guinea-green">Compte Client</span>
                      <span className="text-xs text-gray-500">(Livraison et commandes)</span>
                    </div>
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
                  className="w-full sm:w-auto bg-guinea-red hover:bg-guinea-red/90 text-white font-medium"
                  disabled={isCreatingAccount}
                >
                  {isCreatingAccount ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Création du compte...
                    </>
                  ) : (
                    'Créer mon compte client'
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