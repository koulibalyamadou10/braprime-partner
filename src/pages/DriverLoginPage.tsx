import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Truck, Smartphone, Mail, Eye, EyeOff } from 'lucide-react';
import { DriverAuthService } from '@/lib/services/driver-auth';

const DriverLoginPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // États pour la connexion par email
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // États pour la connexion par téléphone
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [showOtp, setShowOtp] = useState(false);

  // Connexion par email/mot de passe
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { success, error } = await DriverAuthService.signInDriver(email, password);
      
      if (success) {
        setSuccess('Connexion réussie ! Redirection...');
        setTimeout(() => {
          navigate('/driver-dashboard');
        }, 1500);
      } else {
        setError(error || 'Erreur lors de la connexion');
      }
    } catch (err) {
      setError('Erreur lors de la connexion');
    } finally {
      setIsLoading(false);
    }
  };

  // Envoyer l'OTP
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { success, error } = await DriverAuthService.signInDriverWithPhone(phone);
      
      if (success) {
        setOtpSent(true);
        setShowOtp(true);
        setSuccess('Code OTP envoyé par SMS !');
      } else {
        setError(error || 'Erreur lors de l\'envoi du code OTP');
      }
    } catch (err) {
      setError('Erreur lors de l\'envoi du code OTP');
    } finally {
      setIsLoading(false);
    }
  };

  // Vérifier l'OTP et se connecter
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { success, error } = await DriverAuthService.verifyOTPAndSignIn(phone, otp);
      
      if (success) {
        setSuccess('Connexion réussie ! Redirection...');
        setTimeout(() => {
          navigate('/driver-dashboard');
        }, 1500);
      } else {
        setError(error || 'Code OTP incorrect');
      }
    } catch (err) {
      setError('Erreur lors de la vérification du code OTP');
    } finally {
      setIsLoading(false);
    }
  };

  // Réinitialiser le formulaire OTP
  const handleResetOTP = () => {
    setOtpSent(false);
    setShowOtp(false);
    setOtp('');
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo et titre */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Truck className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Espace Livreur
          </h1>
          <p className="text-gray-600">
            Connectez-vous à votre espace de livraison
          </p>
        </div>

        {/* Carte de connexion */}
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle>Connexion Livreur</CardTitle>
            <CardDescription>
              Accédez à vos commandes et gérez vos livraisons
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="email" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </TabsTrigger>
                <TabsTrigger value="phone" className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  Téléphone
                </TabsTrigger>
              </TabsList>

              {/* Connexion par Email */}
              <TabsContent value="email" className="space-y-4">
                <form onSubmit={handleEmailLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="votre.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Votre mot de passe"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Connexion...
                      </>
                    ) : (
                      'Se connecter'
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* Connexion par Téléphone */}
              <TabsContent value="phone" className="space-y-4">
                {!otpSent ? (
                  <form onSubmit={handleSendOTP} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Numéro de téléphone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+224 123 456 789"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Envoi...
                        </>
                      ) : (
                        'Envoyer le code OTP'
                      )}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOTP} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="otp">Code OTP</Label>
                      <Input
                        id="otp"
                        type="text"
                        placeholder="123456"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        required
                        disabled={isLoading}
                        maxLength={6}
                      />
                      <p className="text-sm text-gray-500">
                        Code envoyé au {phone}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="flex-1"
                        onClick={handleResetOTP}
                        disabled={isLoading}
                      >
                        Retour
                      </Button>
                      <Button 
                        type="submit" 
                        className="flex-1"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Vérification...
                          </>
                        ) : (
                          'Vérifier'
                        )}
                      </Button>
                    </div>
                  </form>
                )}
              </TabsContent>
            </Tabs>

            {/* Messages d'erreur et de succès */}
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mt-4">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            {/* Lien vers la page principale */}
            <div className="mt-6 text-center">
              <Button 
                variant="link" 
                onClick={() => navigate('/')}
                className="text-gray-600"
              >
                Retour à l'accueil
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Informations supplémentaires */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Accès réservé aux livreurs autorisés</p>
          <p className="mt-1">
            Contactez votre responsable pour obtenir vos identifiants
          </p>
        </div>
      </div>
    </div>
  );
};

export default DriverLoginPage; 