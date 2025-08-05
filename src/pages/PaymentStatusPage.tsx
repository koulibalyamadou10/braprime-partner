import Layout from '@/components/Layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import {
    AlertCircle,
    AlertTriangle,
    CheckCircle2,
    Clock,
    CreditCard,
    Home,
    Loader2,
    Package,
    RefreshCw,
    ShieldCheck,
    XCircle
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

type PaymentStatus = 'checking' | 'success' | 'failed' | 'pending' | 'error' | 'unknown';

interface OrderData {
  id: string;
  status: string;
  payment_status: string;
  total: number;
  grand_total: number;
  created_at: string;
  updated_at: string;
  business_name: string;
  items: any[];
}

const PaymentStatusPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [status, setStatus] = useState<PaymentStatus>('checking');
  const [message, setMessage] = useState('Vérification du paiement...');
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  useEffect(() => {
    console.log('PaymentStatusPage: useEffect triggered');
    const orderId = searchParams.get('order_id');
    const payId = searchParams.get('pay_id');

    console.log('PaymentStatusPage: URL params:', { orderId, payId });

    if (orderId) {
      console.log('PaymentStatusPage: Starting order status check');
      checkOrderStatus(orderId);
    } else {
      console.log('PaymentStatusPage: Missing order_id parameter');
      setStatus('error');
      setMessage('Paramètre order_id manquant. Veuillez vérifier l\'URL.');
    }
  }, [searchParams]);

  const checkOrderStatus = async (orderId: string) => {
    console.log('PaymentStatusPage: checkOrderStatus called with orderId:', orderId);
    try {
      setIsPolling(true);
      
      // Vérifier directement le statut dans la table orders
      console.log('PaymentStatusPage: Checking order status in database');
      const { data: order, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      console.log('PaymentStatusPage: Database response:', { order, error });

      if (error) {
        console.error('PaymentStatusPage: Database error:', error);
        setStatus('error');
        setMessage('Erreur lors de la récupération de la commande');
        return;
      }

      if (order) {
        setOrderData(order);
        console.log('PaymentStatusPage: Order found:', order);
        
        // Déterminer le statut basé sur payment_status et status
        const paymentStatus = order.payment_status?.toLowerCase();
        const orderStatus = order.status?.toLowerCase();
        
        console.log('PaymentStatusPage: Status analysis:', { paymentStatus, orderStatus });
        
        if (paymentStatus === 'paid' || paymentStatus === 'success') {
          setStatus('success');
          setMessage('Paiement confirmé avec succès !');
        } else if (paymentStatus === 'failed' || paymentStatus === 'cancelled') {
          setStatus('failed');
          setMessage('Le paiement a échoué. Veuillez réessayer.');
        } else if (paymentStatus === 'pending' || orderStatus === 'pending') {
          setStatus('pending');
          setMessage('Paiement en cours de traitement...');
          // Continuer le polling pour les paiements en cours
          setTimeout(() => checkOrderStatus(orderId), 5000);
          return;
        } else {
          setStatus('unknown');
          setMessage('Statut de paiement inconnu');
        }
      } else {
        console.log('PaymentStatusPage: Order not found');
        setStatus('error');
        setMessage('Commande non trouvée');
      }
    } catch (error) {
      console.error('PaymentStatusPage: Error checking order status:', error);
      setStatus('error');
      setMessage('Erreur de connexion au serveur');
    } finally {
      setIsPolling(false);
    }
  };

  const handleRetry = () => {
    const orderId = searchParams.get('order_id');
    if (orderId) {
      setStatus('checking');
      setMessage('Vérification du paiement...');
      checkOrderStatus(orderId);
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-20 w-20 text-guinea-green" />;
      case 'failed':
        return <XCircle className="h-20 w-20 text-red-500" />;
      case 'pending':
        return <Clock className="h-20 w-20 text-yellow-500" />;
      case 'checking':
        return <Loader2 className="h-20 w-20 text-blue-500 animate-spin" />;
      case 'error':
        return <AlertCircle className="h-20 w-20 text-red-500" />;
      default:
        return <AlertTriangle className="h-20 w-20 text-yellow-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'bg-guinea-green/10 border-guinea-green/20 text-guinea-green';
      case 'failed':
        return 'bg-red-50 border-red-200 text-red-700';
      case 'pending':
        return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case 'checking':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-700';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case 'success':
        return 'Paiement Réussi !';
      case 'failed':
        return 'Paiement Échoué';
      case 'pending':
        return 'Paiement en Cours';
      case 'checking':
        return 'Vérification en Cours';
      case 'error':
        return 'Erreur de Vérification';
      default:
        return 'Statut Inconnu';
    }
  };

  const getStatusDescription = () => {
    switch (status) {
      case 'success':
        return 'Votre paiement a été traité avec succès. Votre commande est confirmée et sera préparée rapidement.';
      case 'failed':
        return 'Le paiement n\'a pas pu être traité. Veuillez vérifier vos informations et réessayer.';
      case 'pending':
        return 'Votre paiement est en cours de traitement. Cette opération peut prendre quelques minutes.';
      case 'checking':
        return 'Nous vérifions actuellement le statut de votre paiement. Veuillez patienter.';
      case 'error':
        return 'Une erreur est survenue lors de la vérification. Veuillez réessayer ou contacter le support.';
      default:
        return 'Le statut de votre paiement n\'a pas pu être déterminé.';
    }
  };

  const formatCurrency = (amount: number, currency: string = 'GNF') => {
    return (amount / 100).toFixed(2) + ' FG'; // Assuming amount is in cents
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Layout>
      <section className="relative py-12 md:py-20 overflow-hidden">
        {/* Background Pattern - Style BraPrime */}
        <div className="absolute inset-0 -z-10 opacity-10">
          <div className="absolute inset-y-0 left-0 w-1/3 guinea-gradient opacity-20" />
          <div className="absolute top-1/4 right-1/4 w-48 h-48 rounded-full bg-guinea-yellow opacity-20" />
          <div className="absolute bottom-1/4 left-1/4 w-64 h-64 rounded-full bg-guinea-green opacity-20" />
        </div>

        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            {/* Header avec icône et titre - Style BraPrime */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-6">
                {getStatusIcon()}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-4">
                {getStatusTitle()}
              </h1>
              <p className="text-lg text-gray-600 max-w-md mx-auto">
                {getStatusDescription()}
              </p>
            </div>

            {/* Carte principale - Style BraPrime */}
            <Card className={`${getStatusColor()} border-2 shadow-lg hover:shadow-xl transition-all duration-300`}>
              <CardHeader className="text-center pb-6">
                <div className="space-y-4">
                  {/* Message principal avec style BraPrime */}
                  <div className="flex items-center justify-center space-x-3">
                    {status === 'success' && (
                      <>
                        <div className="bg-guinea-green/10 p-3 rounded-full">
                          <CheckCircle2 className="h-6 w-6 text-guinea-green" />
                        </div>
                        <span className="text-lg font-semibold text-guinea-green">
                          {message}
                        </span>
                      </>
                    )}
                    {status === 'failed' && (
                      <>
                        <div className="bg-guinea-red/10 p-3 rounded-full">
                          <XCircle className="h-6 w-6 text-guinea-red" />
                        </div>
                        <span className="text-lg font-semibold text-guinea-red">
                          {message}
                        </span>
                      </>
                    )}
                    {status === 'pending' && (
                      <>
                        <div className="bg-guinea-yellow/10 p-3 rounded-full">
                          <Clock className="h-6 w-6 text-guinea-yellow" />
                        </div>
                        <span className="text-lg font-semibold text-guinea-yellow">
                          {message}
                        </span>
                      </>
                    )}
                    {status === 'checking' && (
                      <>
                        <div className="bg-guinea-red/10 p-3 rounded-full">
                          <Loader2 className="h-6 w-6 text-guinea-red animate-spin" />
                        </div>
                        <span className="text-lg font-semibold text-guinea-red">
                          {message}
                        </span>
                      </>
                    )}
                    {status === 'error' && (
                      <>
                        <div className="bg-orange-500/10 p-3 rounded-full">
                          <AlertTriangle className="h-6 w-6 text-orange-500" />
                        </div>
                        <span className="text-lg font-semibold text-orange-700">
                          {message}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Détails du paiement si disponibles - Style BraPrime */}
                {orderData && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2 mb-4">
                        <div className="bg-guinea-red/10 p-2 rounded-full">
                          <CreditCard className="h-5 w-5 text-guinea-red" />
                        </div>
                        <h3 className="font-semibold text-lg text-gray-900">
                          Détails du Paiement
                        </h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white/70 rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
                          <p className="text-sm font-medium text-gray-600 mb-2">Montant</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {formatCurrency(orderData.grand_total)}
                          </p>
                        </div>
                        
                        <div className="bg-white/70 rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
                          <p className="text-sm font-medium text-gray-600 mb-2">Date</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {formatDate(orderData.created_at)}
                          </p>
                        </div>
                        
                        <div className="bg-white/70 rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
                          <p className="text-sm font-medium text-gray-600 mb-2">Statut</p>
                          <Badge 
                            variant={status === 'success' ? 'default' : 'secondary'}
                            className={`${status === 'success' ? 'bg-guinea-green/20 text-guinea-green' : 'bg-gray-100 text-gray-700'} text-sm font-medium`}
                          >
                            {orderData.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Prochaines étapes pour le succès - Style BraPrime */}
                {status === 'success' && (
                  <div className="bg-gradient-to-br from-guinea-green/5 to-emerald-50 border border-guinea-green/20 rounded-2xl p-6">
                    <div className="flex items-start space-x-4">
                      <div className="bg-guinea-green/10 p-3 rounded-full">
                        <Package className="h-6 w-6 text-guinea-green" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-guinea-green mb-3 text-lg">
                          Prochaines Étapes
                        </h4>
                        <ul className="text-sm text-gray-700 space-y-2">
                          <li className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-guinea-green rounded-full"></div>
                            <span>Votre commande est en cours de préparation</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-guinea-green rounded-full"></div>
                            <span>Vous recevrez une notification quand elle sera prête</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-guinea-green rounded-full"></div>
                            <span>Un chauffeur sera assigné pour la livraison</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions - Style BraPrime */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  {status === 'success' && (
                    <>
                      <Button 
                        onClick={handleGoHome} 
                        className="flex-1 bg-guinea-red hover:bg-guinea-red/90 text-white py-6 px-8 text-lg rounded-xl"
                      >
                        <Home className="h-5 w-5 mr-2" />
                        Retour à l'accueil
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => navigate('/dashboard')} 
                        className="flex-1 border-guinea-green text-guinea-green hover:bg-guinea-green/10 py-6 px-8 text-lg rounded-xl"
                      >
                        <Package className="h-5 w-5 mr-2" />
                        Voir mes commandes
                      </Button>
                    </>
                  )}
                  
                  {status === 'failed' && (
                    <>
                      <Button 
                        onClick={handleRetry} 
                        className="flex-1 bg-guinea-red hover:bg-guinea-red/90 text-white py-6 px-8 text-lg rounded-xl"
                      >
                        <RefreshCw className="h-5 w-5 mr-2" />
                        Réessayer le paiement
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={handleGoBack} 
                        className="flex-1 border-gray-600 text-gray-600 hover:bg-gray-50 py-6 px-8 text-lg rounded-xl"
                      >
                        Retour
                      </Button>
                    </>
                  )}
                  
                  {status === 'pending' && (
                    <Button 
                      onClick={handleRetry} 
                      className="w-full bg-guinea-yellow hover:bg-guinea-yellow/90 text-white py-6 px-8 text-lg rounded-xl"
                    >
                      <RefreshCw className="h-5 w-5 mr-2" />
                      Actualiser le statut
                    </Button>
                  )}
                  
                  {status === 'error' && (
                    <>
                      <Button 
                        onClick={handleRetry} 
                        className="flex-1 bg-guinea-red hover:bg-guinea-red/90 text-white py-6 px-8 text-lg rounded-xl"
                      >
                        <RefreshCw className="h-5 w-5 mr-2" />
                        Réessayer
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={handleGoHome} 
                        className="flex-1 border-gray-600 text-gray-600 hover:bg-gray-50 py-6 px-8 text-lg rounded-xl"
                      >
                        <Home className="h-5 w-5 mr-2" />
                        Accueil
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Support client - Style BraPrime */}
            <div className="mt-8 text-center">
              <div className="bg-white/70 rounded-2xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-center space-x-2 mb-3">
                  <div className="bg-guinea-red/10 p-2 rounded-full">
                    <ShieldCheck className="h-5 w-5 text-guinea-red" />
                  </div>
                  <h4 className="font-semibold text-gray-900">Support Client</h4>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Besoin d'aide ? Notre équipe est disponible 24h/24
                </p>
                <a 
                  href="tel:+224621000000" 
                  className="inline-flex items-center space-x-2 text-guinea-red hover:text-guinea-red/80 font-medium"
                >
                  <span>+224 621 00 00 00</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default PaymentStatusPage; 