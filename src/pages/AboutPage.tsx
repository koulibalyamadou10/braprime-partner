import Layout from '@/components/Layout';
import { Globe, Mail, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AboutPage = () => {
  const navigate = useNavigate();

  const handleBecomePartner = () => {
    navigate('/pricing');
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center">À propos de BraPrime</h1>
          
          <div className="mb-12 relative">
            <div className="h-2 guinea-gradient rounded-full mb-8"></div>
            
            <p className="text-lg text-gray-700 mb-6">
              BraPrime est le premier service de livraison à la demande en Guinée Conakry, connectant les clients avec les meilleurs restaurants, commerces et services de la région.
            </p>
            
            <p className="text-lg text-gray-700 mb-6">
              Notre mission est de faciliter l'accès à une alimentation de qualité et à des produits essentiels pour tous les Guinéens, tout en créant des opportunités économiques pour les restaurants, commerces et livreurs locaux.
            </p>
            
            <p className="text-lg text-gray-700">
              Que vous soyez à Conakry ou dans d'autres régions de la Guinée, BraPrime vous permet de recevoir vos plats préférés et vos courses essentielles directement à votre porte, rapidement et en toute sécurité.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="bg-guinea-red/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Globe className="text-guinea-red h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg mb-2">Couverture nationale</h3>
              <p className="text-gray-600">
                Service disponible dans les 8 régions de la Guinée, y compris Conakry, Boké, Kindia, et plus.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="bg-guinea-yellow/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Mail className="text-guinea-yellow h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg mb-2">Contactez-nous</h3>
              <p className="text-gray-600">
                Notre équipe est disponible pour répondre à toutes vos questions par email à info@BraPrime.gn.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="bg-guinea-green/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Phone className="text-guinea-green h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg mb-2">Assistance téléphonique</h3>
              <p className="text-gray-600">
                Besoin d'aide immédiate? Appelez notre service client au +224 621 00 00 00.
              </p>
            </div>
          </div>
          
          <div className="bg-gray-50 p-8 rounded-xl shadow-sm mb-12">
            <h2 className="text-2xl font-bold mb-6 text-center">Notre Vision</h2>
            <div className="space-y-4">
              <p className="text-gray-700">
                BraPrime aspire à devenir la plateforme de référence pour les services de livraison en Guinée, en connectant de manière transparente les clients, les entreprises locales et les livreurs.
              </p>
              <p className="text-gray-700">
                Nous voulons contribuer au développement économique local en créant des opportunités pour les entrepreneurs et les employés, tout en offrant un service de qualité qui améliore la vie quotidienne des Guinéens.
              </p>
              <p className="text-gray-700">
                Notre engagement envers l'excellence du service, l'innovation technologique et l'impact social positif guide chacune de nos actions.
              </p>
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold mb-6 text-center">Rejoignez-nous</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
                <h3 className="font-bold text-lg mb-4">Devenez Livreur</h3>
                <p className="text-gray-600 mb-4">
                  Rejoignez notre équipe de livreurs et gagnez un revenu flexible tout en travaillant selon votre propre horaire.
                </p>
                <button className="bg-guinea-red hover:bg-guinea-red/90 text-white font-medium py-2 px-4 rounded-lg">
                  S'inscrire comme livreur
                </button>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
                <h3 className="font-bold text-lg mb-4">Enregistrez votre restaurant</h3>
                <p className="text-gray-600 mb-4">
                  Augmentez votre visibilité et vos ventes en proposant vos plats sur notre plateforme.
                </p>
                <Button 
                  onClick={() => navigate('/devenir-partenaire')}
                  className="bg-guinea-red hover:bg-guinea-red/90 text-white px-8 py-3 text-lg font-semibold"
                >
                  Devenir partenaire
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AboutPage;
