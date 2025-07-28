import Layout from '@/components/Layout';
import { PartnerRegistrationForm } from '@/components/PartnerRegistrationForm';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
    ArrowRight,
    Award,
    BarChart3,
    Building2,
    Check,
    CheckCircle,
    Coffee,
    DollarSign,
    Pill,
    Shield,
    ShoppingBasket,
    ShoppingCart,
    Smartphone,
    Star,
    Store,
    TrendingUp,
    Users,
    Utensils,
    Zap
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const advantages = [
  {
    icon: Users,
    title: "Clientèle fidèle",
    description: "Accédez à une base de clients qualifiés et fidèles",
    color: "bg-blue-500"
  },
  {
    icon: TrendingUp,
    title: "Croissance garantie",
    description: "Augmentez vos ventes de 30% en moyenne",
    color: "bg-green-500"
  },
  {
    icon: Shield,
    title: "Sécurité totale",
    description: "Paiements sécurisés et protection des données",
    color: "bg-purple-500"
  },
  {
    icon: Zap,
    title: "Mise en ligne rapide",
    description: "Votre commerce en ligne en moins de 24h",
    color: "bg-orange-500"
  }
];

const businessTypes = [
  { name: "Restaurants", icon: Utensils, count: "150+", color: "bg-red-100" },
  { name: "Cafés", icon: Coffee, count: "80+", color: "bg-yellow-100" },
  { name: "Boulangeries", icon: ShoppingBasket, count: "45+", color: "bg-orange-100" },
  { name: "Pharmacies", icon: Pill, count: "60+", color: "bg-green-100" },
  { name: "Épiceries", icon: ShoppingCart, count: "120+", color: "bg-blue-100" },
  { name: "Autres", icon: Store, count: "200+", color: "bg-purple-100" }
];

const testimonials = [
  {
    name: "Mariama Diallo",
    business: "Restaurant Le Gourmet",
    content: "BraPrime a transformé notre business. Nos ventes ont augmenté de 40% en 3 mois !",
    rating: 5
  },
  {
    name: "Ousmane Camara",
    business: "Café Central",
    content: "Service client exceptionnel et plateforme très intuitive. Je recommande !",
    rating: 5
  },
  {
    name: "Fatoumata Bah",
    business: "Épicerie du Marché",
    content: "Grâce à BraPrime, j'ai pu digitaliser mon commerce et toucher plus de clients.",
    rating: 5
  }
];

const features = [
  {
    icon: Smartphone,
    title: "Application mobile",
    description: "Gérez vos commandes depuis votre smartphone"
  },
  {
    icon: BarChart3,
    title: "Statistiques détaillées",
    description: "Suivez vos performances en temps réel"
  },
  {
    icon: Shield,
    title: "Paiements sécurisés",
    description: "Transactions protégées et fiables"
  }
];

const PartnerRegistrationPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  // Récupérer le plan sélectionné depuis les paramètres URL
  const selectedPlanId = searchParams.get('plan');
  const selectedPlanPrice = searchParams.get('price');
  const selectedPlanName = searchParams.get('name');
  
  // État pour le plan sélectionné
  const [selectedPlan, setSelectedPlan] = useState<{
    id: string;
    name: string;
    price: number;
  } | null>(null);

  // Initialiser le plan sélectionné depuis les paramètres URL
  useEffect(() => {
    if (selectedPlanId && selectedPlanPrice && selectedPlanName) {
      setSelectedPlan({
        id: selectedPlanId,
        name: decodeURIComponent(selectedPlanName),
        price: parseInt(selectedPlanPrice)
      });
    }
  }, [selectedPlanId, selectedPlanPrice, selectedPlanName]);

  const handleSuccess = (result: any) => {
    toast({
      title: "Demande envoyée !",
      description: "Votre demande de partenariat a été envoyée avec succès. Vous recevrez une notification après approbation.",
    });
    navigate('/request-confirmation');
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <Layout>
      <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Section améliorée */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Award className="h-4 w-4" />
              Programme Partenaire Officiel
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Devenez Partenaire BraPrime
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
              Rejoignez notre réseau de partenaires et développez votre activité 
              avec la première plateforme de livraison moderne de Guinée
            </p>
            
            {/* Afficher le plan sélectionné si disponible */}
            {selectedPlan && (
              <div className="mb-8 p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-primary/20 shadow-lg">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  <span className="text-lg font-semibold text-gray-700">Plan sélectionné :</span>
                </div>
                <div className="flex items-center justify-center gap-4">
                  <Badge variant="secondary" className="text-lg px-4 py-2">
                    {selectedPlan.name}
                  </Badge>
                  <span className="text-2xl font-bold text-primary">
                    {selectedPlan.price.toLocaleString()} FG
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Ce plan sera automatiquement associé à votre compte après approbation
                </p>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                variant="outline" 
                onClick={() => navigate('/pricing')}
                className="flex items-center gap-2 hover:bg-primary hover:text-white transition-colors"
              >
                <DollarSign className="h-4 w-4" />
                Voir les tarifs
                <ArrowRight className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Inscription gratuite</span>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-16">
            {/* Left side - Registration Form */}
            <div className="order-2 lg:order-1">
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
                  <CardTitle className="text-2xl font-bold flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-white" />
                    </div>
                    Créer votre compte partenaire
                  </CardTitle>
                  <CardDescription className="text-base">
                    Remplissez le formulaire ci-dessous pour commencer votre aventure avec BraPrime
                    {selectedPlan && (
                      <span className="block mt-2 text-primary font-medium">
                        Plan sélectionné : {selectedPlan.name} - {selectedPlan.price.toLocaleString()} FG
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  <PartnerRegistrationForm 
                    onSuccess={handleSuccess}
                    onCancel={handleCancel}
                    selectedPlan={selectedPlan}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Right side - Benefits and Info */}
            <div className="order-1 lg:order-2 space-y-8">
              {/* Advantages avec design simplifié */}
              <Card className="shadow-lg border">
                <CardHeader>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Star className="h-5 w-5 text-gray-600" />
                    Pourquoi rejoindre BraPrime ?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {advantages.map((advantage, index) => (
                      <div key={index} className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <advantage.icon className="h-6 w-6 text-gray-700" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2 text-lg">
                            {advantage.title}
                          </h4>
                          <p className="text-gray-600 leading-relaxed">
                            {advantage.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Business types avec design simplifié */}
              <Card className="shadow-lg border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-gray-600" />
                    Types de commerces
                  </CardTitle>
                  <CardDescription>
                    Rejoignez notre réseau diversifié de partenaires
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {businessTypes.map((type, index) => (
                      <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                            <type.icon className="h-5 w-5 text-gray-700" />
                          </div>
                          <span className="font-medium text-gray-800">{type.name}</span>
                        </div>
                        <Badge variant="secondary">{type.count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Testimonials avec design simplifié */}
              <Card className="shadow-lg border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-gray-600" />
                    Témoignages
                  </CardTitle>
                  <CardDescription>
                    Ce que disent nos partenaires
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {testimonials.map((testimonial, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg border">
                        <div className="flex items-center gap-2 mb-2">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                          ))}
                        </div>
                        <p className="text-gray-700 mb-3 italic">"{testimonial.content}"</p>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-gray-900">{testimonial.name}</div>
                            <div className="text-sm text-gray-500">{testimonial.business}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Features section améliorée */}
          <div className="mt-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Tout ce dont vous avez besoin pour réussir
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Une suite complète d'outils pour gérer votre activité efficacement
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-all duration-300 border">
                  <CardContent className="pt-8 pb-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <feature.icon className="h-8 w-8 text-gray-700" />
                    </div>
                    <h4 className="font-semibold mb-3 text-lg">{feature.title}</h4>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* CTA final simplifié */}
          <div className="mt-16 text-center">
            <Card className="bg-white border shadow-lg">
              <CardContent className="pt-12 pb-12">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mr-4">
                    <Check className="h-8 w-8 text-gray-700" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold mb-2 text-gray-900">
                      Prêt à rejoindre BraPrime ?
                    </h3>
                    <p className="text-xl text-gray-600">
                      Créez votre compte partenaire en moins de 5 minutes
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    size="lg" 
                    onClick={() => document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' })}
                    className="bg-primary text-white hover:bg-primary/90 text-lg px-8 py-4"
                  >
                    <Building2 className="h-5 w-5 mr-2" />
                    Commencer maintenant
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    onClick={() => navigate('/pricing')}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 text-lg px-8 py-4"
                  >
                    <DollarSign className="h-5 w-5 mr-2" />
                    Voir les tarifs
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PartnerRegistrationPage; 