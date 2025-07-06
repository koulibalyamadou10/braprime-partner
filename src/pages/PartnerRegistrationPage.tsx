import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  ArrowLeft, 
  Star, 
  Users, 
  TrendingUp, 
  Shield, 
  Smartphone,
  DollarSign,
  BarChart3,
  CheckCircle,
  MapPin,
  Clock,
  Zap
} from 'lucide-react';
import { PartnerRegistrationForm } from '@/components/PartnerRegistrationForm';
import { useToast } from '@/hooks/use-toast';

const advantages = [
  {
    icon: Users,
    title: "Clientèle fidèle",
    description: "Accédez à une base de clients qualifiés et fidèles"
  },
  {
    icon: TrendingUp,
    title: "Croissance garantie",
    description: "Augmentez vos ventes de 30% en moyenne"
  },
  {
    icon: Shield,
    title: "Sécurité totale",
    description: "Paiements sécurisés et protection des données"
  },
  {
    icon: Zap,
    title: "Mise en ligne rapide",
    description: "Votre commerce en ligne en moins de 24h"
  }
];

const businessTypes = [
  { name: "Restaurants", icon: "🍽️", count: "150+" },
  { name: "Cafés", icon: "☕", count: "80+" },
  { name: "Boulangeries", icon: "🥖", count: "45+" },
  { name: "Pharmacies", icon: "💊", count: "60+" },
  { name: "Épiceries", icon: "🛒", count: "120+" },
  { name: "Autres", icon: "🏪", count: "200+" }
];

const testimonials = [
  {
    name: "Mariama Diallo",
    business: "Restaurant Le Gourmet",
    rating: 5,
    content: "BraPrime a transformé mon restaurant. Mes ventes ont augmenté de 40% en 3 mois !"
  },
  {
    name: "Ousmane Barry",
    business: "Café Central",
    rating: 5,
    content: "Interface simple, paiements rapides, support client excellent. Je recommande !"
  },
  {
    name: "Fatoumata Camara",
    business: "Boulangerie du Marché",
    rating: 5,
    content: "Grâce à BraPrime, j'ai pu digitaliser mon commerce et toucher plus de clients."
  }
];

const features = [
  {
    icon: Smartphone,
    title: "Dashboard Mobile",
    description: "Gérez vos commandes depuis votre smartphone",
    color: "bg-green-100 text-green-600"
  },
  {
    icon: DollarSign,
    title: "Paiements Instantanés",
    description: "Recevez vos paiements en temps réel",
    color: "bg-blue-100 text-blue-600"
  },
  {
    icon: BarChart3,
    title: "Analytics Avancés",
    description: "Suivez vos performances en détail",
    color: "bg-purple-100 text-purple-600"
  },
  {
    icon: MapPin,
    title: "Livraison Optimisée",
    description: "Chauffeurs professionnels et trajets optimisés",
    color: "bg-orange-100 text-orange-600"
  },
  {
    icon: Clock,
    title: "Support 24/7",
    description: "Assistance technique disponible à tout moment",
    color: "bg-red-100 text-red-600"
  },
  {
    icon: CheckCircle,
    title: "Qualité Garantie",
    description: "Standards de qualité élevés pour vos clients",
    color: "bg-teal-100 text-teal-600"
  }
];

const PartnerRegistrationPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSuccess = (result: any) => {
    toast({
      title: "Inscription réussie !",
      description: "Votre compte partenaire a été créé avec succès. Vous recevrez un email de confirmation.",
    });
    navigate('/partner-dashboard');
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour à l'accueil
            </Button>
            <div className="flex items-center gap-2">
              <Building2 className="h-6 w-6 text-primary" />
              <span className="font-semibold text-lg">BraPrime</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Devenez Partenaire BraPrime
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Rejoignez notre réseau de partenaires et développez votre activité 
            avec une plateforme de livraison moderne et performante
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left side - Registration Form */}
          <div className="order-2 lg:order-1">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  <Building2 className="h-6 w-6 text-primary" />
                  Créer votre compte partenaire
                </CardTitle>
                <CardDescription>
                  Remplissez le formulaire ci-dessous pour commencer votre aventure avec BraPrime
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PartnerRegistrationForm 
                  onSuccess={handleSuccess}
                  onCancel={handleCancel}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right side - Benefits and Info */}
          <div className="order-1 lg:order-2 space-y-8">
            {/* Advantages */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold">
                  Pourquoi rejoindre BraPrime ?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {advantages.map((advantage, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <advantage.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">
                          {advantage.title}
                        </h4>
                        <p className="text-gray-600 text-sm">
                          {advantage.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Business types */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Types de commerces
                </CardTitle>
                <CardDescription>
                  Rejoignez notre réseau diversifié de partenaires
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {businessTypes.map((type, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{type.icon}</span>
                        <span className="font-medium">{type.name}</span>
                      </div>
                      <Badge variant="outline">{type.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Testimonials */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Témoignages
                </CardTitle>
                <CardDescription>
                  Ce que disent nos partenaires
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {testimonials.map((testimonial, index) => (
                    <div key={index} className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <p className="text-sm text-gray-700 mb-2">
                        "{testimonial.content}"
                      </p>
                      <div className="text-xs text-gray-600">
                        <strong>{testimonial.name}</strong> - {testimonial.business}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features section */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Tout ce dont vous avez besoin pour réussir
            </h2>
            <p className="text-gray-600 text-lg">
              Une suite complète d'outils pour gérer votre activité
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mx-auto mb-4`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h4 className="font-semibold mb-2">{feature.title}</h4>
                  <p className="text-sm text-gray-600">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Stats section */}
        <div className="mt-16">
          <Card className="bg-gradient-to-r from-primary to-primary/80 text-white">
            <CardContent className="pt-8 pb-8">
              <div className="grid md:grid-cols-4 gap-8 text-center">
                <div>
                  <div className="text-3xl font-bold mb-2">500+</div>
                  <div className="text-sm opacity-90">Partenaires actifs</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-2">50k+</div>
                  <div className="text-sm opacity-90">Livraisons effectuées</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-2">98%</div>
                  <div className="text-sm opacity-90">Satisfaction client</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-2">24h</div>
                  <div className="text-sm opacity-90">Mise en ligne</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PartnerRegistrationPage; 