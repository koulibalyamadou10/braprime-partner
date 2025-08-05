import { Search, Truck, Utensils } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const steps = [
  {
    id: 1,
    title: "Choisissez un restaurant",
    description: "Parcourez les restaurants et commerces locaux dans votre région.",
    icon: Search,
    color: "bg-guinea-red",
  },
  {
    id: 2,
    title: "Passez votre commande",
    description: "Sélectionnez vos articles préférés et passez votre commande en quelques clics.",
    icon: Utensils,
    color: "bg-guinea-yellow",
  },
  {
    id: 3,
    title: "Livraison rapide",
    description: "Suivez votre commande en temps réel et recevez-la à votre porte.",
    icon: Truck,
    color: "bg-guinea-green",
  },
];

const HowItWorks = () => {
  const navigate = useNavigate();

  const handleBecomeDriver = () => {
    navigate('/devenir-conducteur');
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">Comment ça marche</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {steps.map((step) => (
            <div key={step.id} className="flex flex-col items-center text-center">
              <div className={`${step.color} p-4 rounded-full mb-6`}>
                <step.icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 relative">
          <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-gray-50 to-transparent z-10"></div>
          <div className="relative z-0 rounded-xl overflow-hidden shadow-lg">
            <div className="w-full h-64 bg-gray-200 guinea-gradient opacity-20"></div>
            <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-6">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">Vous voulez gagner de l'argent en livrant?</h3>
              <p className="text-lg text-gray-700 mb-6 max-w-2xl">
                Rejoignez notre équipe de chauffeurs et gagnez un revenu flexible en livrant des commandes dans toute la Guinée!
              </p>
              <button 
                className="bg-white hover:bg-gray-100 text-guinea-red font-medium py-3 px-6 rounded-lg shadow transition-colors"
                onClick={handleBecomeDriver}
              >
                Devenir chauffeur
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
