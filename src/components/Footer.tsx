
import { Link } from 'react-router-dom';
import { ArrowRight, Facebook, Instagram, Twitter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="h-8 w-8 rounded-full overflow-hidden guinea-gradient"></div>
              <span className="font-bold text-xl">BraPrime</span>
            </div>
            <p className="text-gray-400 mb-4">
              Service de livraison à la demande en Guinée. Nourriture, courses, et plus à votre porte.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" className="hover:text-guinea-red transition-colors" aria-label="Facebook">
                <Facebook size={20} />
              </a>
              <a href="https://twitter.com" className="hover:text-guinea-red transition-colors" aria-label="Twitter">
                <Twitter size={20} />
              </a>
              <a href="https://instagram.com" className="hover:text-guinea-red transition-colors" aria-label="Instagram">
                <Instagram size={20} />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">Liens rapides</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors">
                  Accueil
                </Link>
              </li>
              <li>
                <Link to="/restaurants" className="text-gray-400 hover:text-white transition-colors">
                  Restaurants
                </Link>
              </li>
              <li>
                <Link to="/cafes" className="text-gray-400 hover:text-white transition-colors">
                  Cafés
                </Link>
              </li>
              <li>
                <Link to="/markets" className="text-gray-400 hover:text-white transition-colors">
                  Marchés
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white transition-colors">
                  À propos
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Regions */}
          <div>
            <h3 className="font-bold text-lg mb-4">Régions desservies</h3>
            <ul className="space-y-2">
              <li className="text-gray-400">Conakry</li>
              <li className="text-gray-400">Kindia</li>
              <li className="text-gray-400">Labé</li>
              <li className="text-gray-400">Kankan</li>
              <li className="text-gray-400">Boké</li>
            </ul>
          </div>
          
          {/* Newsletter */}
          <div>
            <h3 className="font-bold text-lg mb-4">Restez informé</h3>
            <p className="text-gray-400 mb-4">
              Inscrivez-vous pour recevoir nos offres et nos mises à jour.
            </p>
            <div className="flex">
              <Input 
                type="email" 
                placeholder="Votre email" 
                className="rounded-r-none bg-gray-800 border-gray-700 text-white"
              />
              <Button className="rounded-l-none bg-guinea-red hover:bg-guinea-red/90">
                <ArrowRight size={18} />
              </Button>
            </div>
          </div>
        </div>
        
        <Separator className="my-8 bg-gray-800" />
        
        <div className="flex flex-col md:flex-row justify-between items-center text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} BraPrime. Tous droits réservés.</p>
          <div className="mt-4 md:mt-0">
            <span>Powered by </span>
            <a 
              href="https://www.bratechinnovation.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-guinea-red hover:text-guinea-red/80 transition-colors font-medium"
            >
              Bra Tech
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
