
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';

const NotFound = () => {
  return (
    <Layout>
      <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md px-4">
          <div className="w-24 h-24 guinea-gradient mx-auto rounded-full flex items-center justify-center mb-6">
            <span className="text-4xl font-bold text-white">404</span>
          </div>
          <h1 className="text-3xl font-bold mb-4">Page non trouvée</h1>
          <p className="text-gray-600 mb-8">
            Désolé, nous ne trouvons pas la page que vous cherchez. Elle a peut-être été déplacée ou supprimée.
          </p>
          <Button asChild className="bg-guinea-red hover:bg-guinea-red/90">
            <Link to="/" className="flex items-center">
              <Home className="mr-2 h-5 w-5" />
              Retour à l'accueil
            </Link>
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
