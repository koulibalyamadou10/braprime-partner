import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { SubscriptionPaymentService } from '@/lib/services/subscription-payment';
import {
    AlertCircle,
    AlertTriangle,
    Building2,
    CheckCircle2,
    Clock,
    CreditCard,
    Home,
    Loader2,
    RefreshCw,
    ShieldCheck,
    XCircle
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface PaymentData {
  subscription_id: string;
  pay_id: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  gateway_response?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

const SubscriptionPaymentStatusPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [status, setStatus] = useState<'checking' | 'success' | 'failed' | 'pending' | 'unknown' | 'error'>('checking');
  const [message, setMessage] = useState('Vérification du paiement d\'abonnement...');
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  useEffect(() => {
    console.log('SubscriptionPaymentStatusPage: useEffect triggered');
    const subscriptionId = searchParams.get('subscription_id');
    const payId = searchParams.get('pay_id');
    console.log('SubscriptionPaymentStatusPage: URL params:', { subscriptionId, payId });

    if (payId) {
      checkPaymentStatus(payId);
    } else {
      setStatus('error');
      setMessage('Paramètres de paiement manquants');
    }
  }, [searchParams]);

  const checkPaymentStatus = async (payId: string) => {
    console.log('SubscriptionPaymentStatusPage: checkPaymentStatus called with payId:', payId);
    try {
      setIsPolling(true);
      
      console.log('SubscriptionPaymentStatusPage: Calling SubscriptionPaymentService.checkSubscriptionPaymentStatus');
      const response = await SubscriptionPaymentService.checkSubscriptionPaymentStatus({ pay_id: payId });
      console.log('SubscriptionPaymentStatusPage: SubscriptionPaymentService response:', response);

      if (response.success && response.data) {
        const paymentStatus = response.data.status;
        setPaymentData(response.data);
        console.log('SubscriptionPaymentStatusPage: Payment status:', paymentStatus);
        
        switch (paymentStatus) {
          case 'success':
          case 'SUCCESS':
            setStatus('success');
            setMessage('Paiement d\'abonnement confirmé avec succès !');
            
            // Mettre à jour le statut dans la base de données locale
            await SubscriptionPaymentService.updateSubscriptionPaymentStatus(payId, 'success', response.data.gateway_response);
            
            // Activer l'abonnement
            await SubscriptionPaymentService.activateSubscriptionAfterPayment({
              subscription_id: response.data.subscription_id,
              pay_id: payId,
              payment_status: 'success',
              gateway_response: response.data.gateway_response
            });
            break;
            
          case 'failed':
          case 'FAILED':
            setStatus('failed');
            setMessage('Le paiement d\'abonnement a échoué. Veuillez réessayer.');
            
            // Mettre à jour le statut dans la base de données locale
            await SubscriptionPaymentService.updateSubscriptionPaymentStatus(payId, 'failed', response.data.gateway_response);
            break;
            
          case 'initiated':
          case 'INITIATED':
            setStatus('pending');
            setMessage('Paiement d\'abonnement en cours de traitement...');
            // Continuer le polling pour les paiements en cours
            setTimeout(() => checkPaymentStatus(payId), 5000);
            return;
            
          default:
            setStatus('unknown');
            setMessage('Statut de paiement d\'abonnement inconnu');
        }
      } else {
        setStatus('error');
        setMessage(response.error || 'Erreur lors de la vérification du paiement');
      }
    } catch (error) {
      console.error('SubscriptionPaymentStatusPage: Error checking payment status:', error);
      setStatus('error');
      setMessage('Erreur de connexion au serveur de paiement');
    } finally {
      setIsPolling(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-20 w-20 text-guinea-green" />;
      case 'failed':
        return <XCircle className="h-20 w-20 text-guinea-red" />;
      case 'pending':
        return <Clock className="h-20 w-20 text-guinea-yellow" />;
      case 'checking':
        return <Loader2 className="h-20 w-20 text-guinea-red animate-spin" />;
      default:
        return <AlertCircle className="h-20 w-20 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-gradient-to-br from-guinea-green/5 to-emerald-50 border-guinea-green/20';
      case 'failed':
        return 'bg-gradient-to-br from-guinea-red/5 to-rose-50 border-guinea-red/20';
      case 'pending':
        return 'bg-gradient-to-br from-guinea-yellow/5 to-amber-50 border-guinea-yellow/20';
      default:
        return 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200';
    }
  };

  const formatCurrency = (amount: number, currency: string = 'GNF') => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
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
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Statut du Paiement d'Abonnement
              </h1>
              <p className="text-lg text-gray-600">
                Vérification de votre paiement BraPrime
              </p>
            </div>

            {/* Status Card */}
            <Card className={`${getStatusColor(status)} border-2 shadow-xl`}>
              <CardHeader className="text-center pb-6">
                <div className="flex justify-center mb-4">
                  {getStatusIcon(status)}
                </div>
                <CardTitle className="text-2xl font-bold">
                  {status === 'success' && 'Paiement Confirmé !'}
                  {status === 'failed' && 'Paiement Échoué'}
                  {status === 'pending' && 'Paiement en Cours'}
                  {status === 'checking' && 'Vérification...'}
                  {status === 'error' && 'Erreur de Vérification'}
                  {status === 'unknown' && 'Statut Inconnu'}
                </CardTitle>
                <CardDescription className="text-lg">
                  {message}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Payment Details */}
                {paymentData && (
                  <div className="bg-white/50 rounded-lg p-6 space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Détails du Paiement
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Montant</p>
                        <p className="font-semibold text-lg">
                          {formatCurrency(paymentData.amount, paymentData.currency)}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-600">Méthode de paiement</p>
                        <p className="font-semibold">{paymentData.payment_method}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-600">Référence</p>
                        <p className="font-mono text-sm">{paymentData.pay_id}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-600">Date</p>
                        <p className="font-semibold">{formatDate(paymentData.created_at)}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Success Actions */}
                {status === 'success' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <div className="flex items-start gap-3">
                      <ShieldCheck className="h-6 w-6 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-green-900 mb-2">
                          Abonnement Activé avec Succès !
                        </h4>
                        <p className="text-green-700 text-sm">
                          Votre compte partenaire est maintenant actif. Vous pouvez accéder à votre dashboard 
                          et commencer à utiliser toutes les fonctionnalités BraPrime.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Failed Actions */}
                {status === 'failed' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-6 w-6 text-red-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-red-900 mb-2">
                          Paiement Échoué
                        </h4>
                        <p className="text-red-700 text-sm">
                          Le paiement n'a pas pu être traité. Veuillez vérifier vos informations 
                          et réessayer ou contacter le support si le problème persiste.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                  {status === 'success' && (
                    <Button 
                      onClick={() => navigate('/partner-dashboard')}
                      className="bg-guinea-red hover:bg-guinea-red/90 text-white"
                    >
                      <Building2 className="h-4 w-4 mr-2" />
                      Accéder au Dashboard
                    </Button>
                  )}
                  
                  {status === 'failed' && (
                    <Button 
                      onClick={() => navigate('/partner-dashboard/settings?tab=billing')}
                      variant="outline"
                      className="border-guinea-red text-guinea-red hover:bg-guinea-red/10"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Réessayer le Paiement
                    </Button>
                  )}
                  
                  <Button 
                    onClick={() => navigate('/')}
                    variant="outline"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Retour à l'Accueil
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Additional Info */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">
                Besoin d'aide ? Contactez notre support au{' '}
                <a href="tel:+224621000000" className="text-guinea-red hover:underline">
                  +224 621 00 00 00
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default SubscriptionPaymentStatusPage; 