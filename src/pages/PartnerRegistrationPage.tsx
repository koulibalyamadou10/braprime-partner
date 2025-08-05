import Layout from '@/components/Layout';
import { PartnerRegistrationForm } from '@/components/PartnerRegistrationForm';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
    ArrowRight,
    BarChart3,
    CheckCircle,
    Coffee,
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
import { useState } from 'react';
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
    title: "Sécurité garantie",
    description: "Paiements sécurisés et protection des données"
  },
  {
    icon: Users,
    title: "Support client",
    description: "Une équipe dédiée pour vous accompagner"
  }
];

const PartnerRegistrationPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);

  const handleSuccess = (result: any) => {
    console.log('Registration success:', result);
    navigate('/request-confirmation', { 
      state: { 
        requestId: result.request?.id,
        type: 'partner'
      } 
    });
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-guinea-red to-guinea-red/90 text-white">
          <div className="container mx-auto px-4 py-16">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Devenez Partenaire BraPrime
              </h1>
              <p className="text-xl mb-8 text-white/90">
                Rejoignez notre réseau de partenaires et développez votre business en ligne
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  onClick={() => setShowForm(true)}
                  className="bg-white text-guinea-red hover:bg-gray-100 px-8 py-3 text-lg font-semibold"
                >
                  Commencer maintenant
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <div className="flex items-center gap-2 text-sm text-white/80">
                  <CheckCircle className="h-4 w-4" />
                  <span>Inscription gratuite</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {showForm ? (
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                  Créer votre compte partenaire
                </h2>
                <p className="text-gray-600">
                  Remplissez le formulaire ci-dessous pour commencer votre aventure avec BraPrime
                </p>
              </div>
              
              <PartnerRegistrationForm 
                onSuccess={handleSuccess}
                onCancel={handleCancel}
              />
            </div>
          </div>
        ) : (
          <>
            {/* Avantages */}
            <div className="container mx-auto px-4 py-16">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                  Pourquoi choisir BraPrime ?
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Rejoignez notre plateforme et bénéficiez d'outils puissants pour développer votre business
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {advantages.map((advantage, index) => {
                  const IconComponent = advantage.icon;
                  return (
                    <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                      <div className={`inline-flex p-3 rounded-full ${advantage.color} text-white mb-4`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{advantage.title}</h3>
                      <p className="text-gray-600">{advantage.description}</p>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Types de commerces */}
            <div className="bg-white py-16">
              <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">
                    Tous types de commerces
                  </h2>
                  <p className="text-gray-600">
                    Que vous soyez restaurant, café, pharmacie ou épicerie, BraPrime s'adapte à vos besoins
                  </p>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {businessTypes.map((type, index) => {
                    const IconComponent = type.icon;
                    return (
                      <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-lg ${type.color}`}>
                            <IconComponent className="h-6 w-6 text-gray-700" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{type.name}</h3>
                            <p className="text-gray-600">{type.count} partenaires</p>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Fonctionnalités */}
            <div className="container mx-auto px-4 py-16">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                  Fonctionnalités incluses
                </h2>
                <p className="text-gray-600">
                  Tout ce dont vous avez besoin pour gérer votre business en ligne
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {features.map((feature, index) => {
                  const IconComponent = feature.icon;
                  return (
                    <Card key={index} className="text-center p-6">
                      <div className="inline-flex p-3 rounded-full bg-guinea-red/10 text-guinea-red mb-4">
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                      <p className="text-gray-600 text-sm">{feature.description}</p>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Témoignages */}
            <div className="bg-gray-50 py-16">
              <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">
                    Ce que disent nos partenaires
                  </h2>
                  <p className="text-gray-600">
                    Découvrez les témoignages de nos partenaires satisfaits
                  </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                  {testimonials.map((testimonial, index) => (
                    <Card key={index} className="p-6">
                      <div className="flex items-center mb-4">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                        ))}
                      </div>
                      <p className="text-gray-600 mb-4">"{testimonial.content}"</p>
                      <div>
                        <p className="font-semibold">{testimonial.name}</p>
                        <p className="text-sm text-gray-500">{testimonial.business}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA Final */}
            <div className="container mx-auto px-4 py-16">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                  Prêt à rejoindre BraPrime ?
                </h2>
                <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                  Commencez dès aujourd'hui et transformez votre business en ligne
                </p>
                <Button 
                  onClick={() => setShowForm(true)}
                  className="bg-guinea-red hover:bg-guinea-red/90 px-8 py-3 text-lg font-semibold"
                >
                  Commencer maintenant
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default PartnerRegistrationPage; 