import Layout from '@/components/Layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Building2,
    CheckCircle,
    Clock,
    Home,
    Mail,
    Phone,
    TrendingUp,
    Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RequestConfirmationPage = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleContactSupport = () => {
    // Ouvrir le support ou rediriger vers la page de contact
    window.open('mailto:support@braprime.com', '_blank');
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Demande Envoyée !
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Votre demande de partenariat a été envoyée avec succès. 
              Notre équipe va l'examiner et vous contactera dans les plus brefs délais.
            </p>
          </div>

          {/* Status Card */}
          <Card className="mb-8 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <Clock className="h-5 w-5" />
                Statut de votre demande
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  En attente d'examen
                </Badge>
                <span className="text-green-700">
                  Délai de traitement : 24-48 heures
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-blue-600" />
                  Prochaines étapes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 text-sm font-semibold">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Examen de votre demande</h4>
                    <p className="text-gray-600 text-sm">
                      Notre équipe examine votre demande et vérifie les informations fournies.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 text-sm font-semibold">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Notification d'approbation</h4>
                    <p className="text-gray-600 text-sm">
                      Vous recevrez un email avec vos identifiants de connexion si votre demande est approuvée.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 text-sm font-semibold">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Accès à votre dashboard</h4>
                    <p className="text-gray-600 text-sm">
                      Une fois connecté, vous pourrez configurer votre commerce et commencer à recevoir des commandes.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-green-600" />
                  Besoin d'aide ?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  Si vous avez des questions ou besoin d'assistance, notre équipe est là pour vous aider.
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Mail className="h-4 w-4 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">Email</p>
                      <p className="text-sm text-gray-600">support@braprime.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Phone className="h-4 w-4 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">Téléphone</p>
                      <p className="text-sm text-gray-600">+224 123 456 789</p>
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={handleContactSupport}
                  variant="outline" 
                  className="w-full"
                >
                  Contacter le support
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Benefits Preview */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Ce qui vous attend
              </CardTitle>
              <CardDescription>
                Découvrez les avantages de devenir partenaire BraPrime
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                  <h4 className="font-semibold mb-2">Nouveaux clients</h4>
                  <p className="text-gray-600 text-sm">
                    Accédez à une base de clients qualifiés et fidèles
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                  <h4 className="font-semibold mb-2">Augmentation des ventes</h4>
                  <p className="text-gray-600 text-sm">
                    Augmentez vos ventes de 30% en moyenne
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="bg-purple-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Building2 className="h-8 w-8 text-purple-600" />
                  </div>
                  <h4 className="font-semibold mb-2">Dashboard complet</h4>
                  <p className="text-gray-600 text-sm">
                    Gérez vos commandes et suivez vos performances
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleGoHome}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              Retour à l'accueil
            </Button>
            
            <Button 
              onClick={handleContactSupport}
              className="flex items-center gap-2"
            >
              <Phone className="h-4 w-4" />
              Contacter le support
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RequestConfirmationPage; 