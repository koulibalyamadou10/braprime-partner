import { ChangePlanModal } from '@/components/dashboard/ChangePlanModal';
import { CreateSubscriptionModal } from '@/components/dashboard/CreateSubscriptionModal';
import DashboardLayout, { partnerNavItems } from '@/components/dashboard/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { usePartnerProfile } from '@/hooks/use-partner-profile';
import { subscriptionUtils, useCreateSubscription, useCurrentUserSubscription, useCurrentUserSubscriptionHistory, useSubscriptionPlans } from '@/hooks/use-subscription';
import { subscriptionService } from '@/lib/services/subscription';
import { SubscriptionManagementService } from '@/lib/services/subscription-management';
import { supabase } from '@/lib/supabase';
import { useBillingStats, useBusinessInvoices, useBusinessPayments } from '@/hooks/use-billing';
import {
    AlertCircle,
    Calendar,
    CheckCircle,
    Clock,
    CreditCard,
    Download,
    TrendingUp,
    ShoppingCart,
    BarChart3,
    Users,
    X,
    Plus,
    Settings
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import Unauthorized from '@/components/Unauthorized';
import { useCurrencyRole } from '@/contexts/UseRoleContext';

const PartnerBilling: React.FC = () => {
  const { currencyRole, roles } = useCurrencyRole();

  if (!roles.includes("facturation") && !roles.includes("admin")) {
    return <Unauthorized />;
  }

  const { currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const [showCreateSubscriptionModal, setShowCreateSubscriptionModal] = useState(false);
  const [showChangePlanModal, setShowChangePlanModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{
    id: string;
    name: string;
    price: number;
    monthly_price: number;
    description: string;
    features: string[];
    savings_percentage: number;
  } | null>(null);
  const [isChangingPlan, setIsChangingPlan] = useState(false);
  
  // États pour la désactivation
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [deactivateReason, setDeactivateReason] = useState('');
  const [isDeactivating, setIsDeactivating] = useState(false);
  
  // Hooks d'abonnement
  const { data: subscriptionPlans } = useSubscriptionPlans();
  const { data: currentSubscription, isLoading: subscriptionLoading } = useCurrentUserSubscription();
  const { data: subscriptionHistory, isLoading: historyLoading } = useCurrentUserSubscriptionHistory();
  
  // Hook partenaire
  const { profile: business, isLoading: businessLoading } = usePartnerProfile();

  // États pour les données de revenus dynamiques
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  const { data: billingStats, isLoading: billingStatsLoading } = useBillingStats(business?.id || 0, period);
  const { data: invoices, isLoading: invoicesLoading } = useBusinessInvoices(business?.id || 0);
  const { data: payments, isLoading: paymentsLoading } = useBusinessPayments(business?.id || 0);

  // Intercepter les paramètres de retour de paiement
  useEffect(() => {
    const subscriptionId = searchParams.get('subscription_id');
    const payId = searchParams.get('pay_id');
    
    if (subscriptionId && payId) {
      checkPaymentStatus(payId, subscriptionId);
      
      // Nettoyer les paramètres URL
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('subscription_id');
      newUrl.searchParams.delete('pay_id');
      window.history.replaceState({}, '', newUrl.toString());
    }
  }, [searchParams]);

  const checkPaymentStatus = async (payId: string, subscriptionId: string) => {
    try {
      const { data: payment, error } = await supabase
        .from('subscription_payments')
        .select('status, amount, payment_method, created_at')
        .eq('transaction_reference', payId)
        .eq('subscription_id', subscriptionId)
        .single();

      if (error) {
        toast.error('❌ Erreur lors de la vérification du paiement');
        return;
      }

      if (payment) {
        switch (payment.status) {
          case 'success':
            toast.success('🎉 Paiement d\'abonnement confirmé !');
            window.location.reload();
            break;
          case 'failed':
            toast.error('❌ Le paiement d\'abonnement a échoué.');
            break;
          case 'pending':
            toast.info('⏳ Paiement en cours de traitement...');
            setTimeout(() => checkPaymentStatus(payId, subscriptionId), 5000);
            break;
          default:
            toast.warning('⚠️ Statut de paiement inconnu');
        }
      }
    } catch (error) {
      toast.error('❌ Erreur de connexion lors de la vérification du paiement');
    }
  };

  const handleSelectPlan = async (planId: string) => {
    try {
      const plan = subscriptionPlans?.find(p => p.id === planId);
      if (!plan) {
        toast.error('Plan non trouvé');
        return;
      }

      if (currentSubscription && currentSubscription.status === 'active') {
        const priceDifference = plan.price - currentSubscription.total_paid;
        const isUpgrade = priceDifference > 0;
        const isSamePrice = priceDifference === 0;

        if (isSamePrice) {
          toast.error('Vous avez déjà ce plan d\'abonnement');
          return;
        }

        if (!isUpgrade) {
          toast.error('Seuls les upgrades vers des plans supérieurs sont autorisés');
          return;
        }

        setSelectedPlan(plan);
        setShowChangePlanModal(true);
      } else {
        setSelectedPlan(plan);
        setShowCreateSubscriptionModal(true);
      }
    } catch (error) {
      toast.error('Erreur lors de la sélection du plan');
    }
  };

  const handleConfirmPlanChange = async () => {
    if (!selectedPlan || !currentSubscription) {
      toast.error('Données manquantes pour le changement de plan');
      return;
    }

    setIsChangingPlan(true);
    try {
      const success = await subscriptionService.renewSubscription(
        currentSubscription.id,
        selectedPlan.id
      );
      
      if (success) {
        toast.success('Plan changé avec succès');
        setShowChangePlanModal(false);
        setSelectedPlan(null);
        window.location.reload();
      }
    } catch (error) {
      toast.error('Erreur lors du changement de plan');
    } finally {
      setIsChangingPlan(false);
    }
  };

  const handleSubscriptionCreated = (subscriptionId: string) => {
    setShowCreateSubscriptionModal(false);
    setSelectedPlan(null);
    toast.success('Abonnement créé avec succès !');
  };

  const handlePayment = async (subscriptionId: string) => {
    if (!currentSubscription || currentSubscription.status !== 'pending') {
      toast.error('Cet abonnement n\'est pas éligible au paiement');
      return;
    }

    try {
      const response = await fetch('https://braprime-backend.vercel.app/api/subscriptions/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription_id: subscriptionId,
          amount: currentSubscription.total_paid,
          payment_method: 'lengo_pay'
        })
      });

      const result = await response.json();

      if (result.success && result.payment_url) {
        toast.success('Redirection vers Lengo Pay...');
        window.location.href = result.payment_url;
      } else {
        throw new Error(result.message || 'Erreur lors de la création du paiement');
      }
    } catch (error) {
      toast.error('Erreur lors du paiement. Veuillez réessayer.');
    }
  };

  const handleDeactivateSubscription = async () => {
    if (!currentSubscription) {
      toast.error('Aucun abonnement trouvé');
      return;
    }

    setIsDeactivating(true);
    try {
      const result = await SubscriptionManagementService.deactivateSubscription({
        subscription_id: currentSubscription.id,
        reason: deactivateReason
      });

      if (result.success) {
        toast.success(result.message || 'Abonnement désactivé avec succès');
        setShowDeactivateDialog(false);
        setDeactivateReason('');
        window.location.reload();
      } else {
        toast.error(result.error || 'Erreur lors de la désactivation');
      }
    } catch (error) {
      toast.error('Erreur lors de la désactivation de l\'abonnement');
    } finally {
      setIsDeactivating(false);
    }
  };

  // Fonction pour formater les montants
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M GNF`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}k GNF`;
    }
    return `${amount} GNF`;
  };

  if (businessLoading) {
    return (
      <DashboardLayout navItems={partnerNavItems} title="Revenus & Ventes">
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!business) {
    return (
      <DashboardLayout navItems={partnerNavItems} title="Revenus & Ventes">
        <div className="space-y-6">
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Aucun business trouvé</h2>
            <p className="text-muted-foreground mb-4">
              Aucun business n'est associé à votre compte. Veuillez contacter l'administrateur.
            </p>
            <Button onClick={() => window.location.reload()}>
              Actualiser la page
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={partnerNavItems} title="Revenus & Ventes">
      <div className="space-y-6">

        {/* Graphiques et analyses */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Vue d'ensemble des revenus */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Vue d'ensemble des revenus</CardTitle>
              <CardDescription>Revenus de cette période par semaine</CardDescription>
              <div className="flex gap-2 mt-2">
                {(['week', 'month', 'year'] as const).map((p) => (
                  <Button
                    key={p}
                    variant={period === p ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPeriod(p)}
                  >
                    {p === 'week' ? 'Semaine' : p === 'month' ? 'Mois' : 'Année'}
                  </Button>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              {billingStatsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  <span className="ml-2 text-sm text-muted-foreground">Chargement des données...</span>
                </div>
              ) : billingStats && billingStats.weeklyData.length > 0 ? (
                <div className="space-y-4">
                  {billingStats.weeklyData.map((week) => (
                    <div key={week.week} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Semaine {week.week}</span>
                        <div className="text-right">
                          <p className="font-medium">{week.orders} commandes</p>
                          <p className="text-gray-600">{formatCurrency(week.revenue)}</p>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-500 h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${(week.revenue / Math.max(...billingStats.weeklyData.map(w => w.revenue))) * 100}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Aucune donnée disponible pour cette période</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Articles de menu les plus vendus */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Articles de menu les plus vendus</CardTitle>
              <CardDescription>Meilleurs vendeurs par revenus</CardDescription>
            </CardHeader>
            <CardContent>
              {billingStatsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  <span className="ml-2 text-sm text-muted-foreground">Chargement des données...</span>
                </div>
              ) : billingStats && billingStats.topMenuItems.length > 0 ? (
                <div className="space-y-4">
                  {billingStats.topMenuItems.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{item.name}</span>
                        <div className="text-right">
                          <p className="font-medium">{item.orders} commandes</p>
                          <p className="text-gray-600">{formatCurrency(item.revenue)}</p>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 text-right">{item.percentage}%</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Aucun article vendu pour cette période</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Section Abonnement */}
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Gestion de l'abonnement
            </CardTitle>
            <CardDescription>
              Gérez votre abonnement BraPrime et vos informations de facturation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Statut actuel */}
            {subscriptionLoading ? (
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                  <span>Chargement de l'abonnement...</span>
                </div>
              </div>
            ) : currentSubscription ? (
              <div className={`p-4 rounded-lg border ${
                currentSubscription.status === 'active' 
                  ? 'bg-green-50 border-green-200' 
                  : currentSubscription.status === 'pending'
                  ? 'bg-yellow-50 border-yellow-200'
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {currentSubscription.status === 'active' ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : currentSubscription.status === 'pending' ? (
                    <Clock className="h-5 w-5 text-yellow-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className="font-medium">
                    {currentSubscription.status === 'active' ? 'Abonnement actif' :
                     currentSubscription.status === 'pending' ? 'Abonnement en attente' :
                     'Abonnement inactif'}: {currentSubscription.plan?.name}
                  </span>
                  {currentSubscription.status === 'active' && currentSubscription.savings_amount > 0 && (
                    <Badge className="bg-green-500 text-white">
                      {currentSubscription.plan?.savings_percentage}% d'économie
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {currentSubscription.status === 'active' ? (
                    <>
                      Votre abonnement expire le {subscriptionUtils.formatDate(currentSubscription.end_date)}. 
                      {subscriptionUtils.getDaysRemaining(currentSubscription.end_date)} jours restants.
                    </>
                  ) : currentSubscription.status === 'pending' ? (
                    <>
                      Votre abonnement est en attente d'activation. 
                      Date de début : {subscriptionUtils.formatDate(currentSubscription.start_date)}
                    </>
                  ) : (
                    'Votre abonnement n\'est pas actif.'
                  )}
                </p>
                
                {/* Section spéciale pour l'abonnement depuis une demande */}
                {currentSubscription._from_request && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertCircle className="h-5 w-5 text-blue-600" />
                      <h4 className="font-semibold text-blue-800">Plan sélectionné lors de votre demande</h4>
                    </div>
                    <div className="space-y-2 mb-4">
                      <p className="text-sm text-blue-700">
                        <strong>Plan :</strong> {currentSubscription.plan?.name}
                      </p>
                      <p className="text-sm text-blue-700">
                        <strong>Prix :</strong> {subscriptionUtils.formatPrice(currentSubscription.monthly_amount)}
                      </p>
                      <p className="text-sm text-blue-700">
                        <strong>Statut :</strong> En attente de paiement
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handlePayment(currentSubscription.id)}
                        className="bg-guinea-green hover:bg-guinea-green/90 text-white"
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Payer maintenant
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* Boutons normaux pour les abonnements existants */}
                {!currentSubscription._from_request && currentSubscription.status === 'pending' && (
                  <Button 
                    onClick={() => handlePayment(currentSubscription.id)}
                    className="bg-guinea-green hover:bg-guinea-green/90 text-white"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Payer maintenant
                  </Button>
                )}
                {!currentSubscription._from_request && currentSubscription.status === 'active' && (
                  <div className="mt-3 space-y-3">
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-700">
                        ✅ Votre abonnement est actif et payé. 
                        Il expire le {subscriptionUtils.formatDate(currentSubscription.end_date)}.
                      </p>
                    </div>
                    <Button 
                      onClick={() => setShowDeactivateDialog(true)}
                      variant="outline"
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Désactiver l'abonnement
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucun abonnement actif</h3>
                <p className="text-muted-foreground mb-4">
                  Choisissez un plan d'abonnement pour commencer à utiliser BraPrime
                </p>
              </div>
            )}

            {/* Plans disponibles */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Plans disponibles</h3>
              </div>
              
              {subscriptionPlans ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {subscriptionPlans.map((plan) => {
                    const isCurrentPlan = currentSubscription && 
                      currentSubscription.plan && 
                      currentSubscription.plan.id === plan.id;
                    
                    const isPendingPlan = currentSubscription && 
                      currentSubscription.status === 'pending' && 
                      currentSubscription.plan && 
                      currentSubscription.plan.id === plan.id;
                    
                    return (
                      <Card 
                        key={plan.id} 
                        className={`relative ${
                          isCurrentPlan ? 'ring-2 ring-green-500 bg-green-50' : 
                          isPendingPlan ? 'ring-2 ring-yellow-500 bg-yellow-50' : ''
                        }`}
                      >
                        {isCurrentPlan && (
                          <Badge className="absolute -top-2 -left-2 bg-green-500 text-white z-10">
                            Plan actuel
                          </Badge>
                        )}
                        
                        {isPendingPlan && (
                          <Badge className="absolute -top-2 -left-2 bg-yellow-500 text-white z-10">
                            En attente
                          </Badge>
                        )}
                        
                        {plan.savings_percentage > 0 && !isCurrentPlan && !isPendingPlan && (
                          <Badge className="absolute -top-2 -right-2 bg-green-500 text-white">
                            {plan.savings_percentage}% d'économie
                          </Badge>
                        )}
                        
                        <CardHeader>
                          <CardTitle className="text-lg">{plan.name}</CardTitle>
                          <CardDescription>{plan.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <p className="text-2xl font-bold">
                              {subscriptionUtils.formatPrice(plan.price)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {subscriptionUtils.formatPrice(plan.monthly_price)}/mois
                            </p>
                            
                            {isCurrentPlan ? (
                              <Button 
                                disabled
                                className="w-full bg-green-500 hover:bg-green-600 text-white"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Plan actuel
                              </Button>
                            ) : isPendingPlan ? (
                              <Button 
                                onClick={() => handlePayment(currentSubscription.id)}
                                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
                              >
                                <CreditCard className="h-4 w-4 mr-2" />
                                Payer maintenant
                              </Button>
                            ) : (
                              (() => {
                                const priceDifference = plan.price - (currentSubscription?.total_paid || 0);
                                const isUpgrade = priceDifference > 0;
                                const isDowngrade = priceDifference < 0;
                                
                                if (currentSubscription && currentSubscription.status === 'active' && isDowngrade) {
                                  return (
                                    <Button 
                                      disabled
                                      className="w-full bg-gray-300 text-gray-500 cursor-not-allowed"
                                    >
                                      <X className="h-4 w-4 mr-2" />
                                      Downgrade non autorisé
                                    </Button>
                                  );
                                }
                                
                                return (
                                  <Button 
                                    onClick={() => handleSelectPlan(plan.id)}
                                    className={`w-full ${
                                      currentSubscription && currentSubscription.status === 'active' && isUpgrade
                                        ? 'bg-orange-600 hover:bg-orange-700 text-white'
                                        : 'bg-guinea-red hover:bg-guinea-red/90'
                                    }`}
                                  >
                                    {currentSubscription && currentSubscription.status === 'active' ? (
                                      <>
                                        <Settings className="h-4 w-4 mr-2" />
                                        {isUpgrade ? 'Upgrade' : 'Changer de plan'}
                                      </>
                                    ) : (
                                      <>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Choisir ce plan
                                      </>
                                    )}
                                  </Button>
                                );
                              })()
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Skeleton className="h-32 w-full" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Modal de création d'abonnement */}
        {showCreateSubscriptionModal && selectedPlan && (
          <CreateSubscriptionModal
            isOpen={showCreateSubscriptionModal}
            onClose={() => {
              setShowCreateSubscriptionModal(false);
              setSelectedPlan(null);
            }}
            selectedPlan={selectedPlan as any}
            partnerId={business?.id || 0}
            onSubscriptionCreated={handleSubscriptionCreated}
          />
        )}

        {/* Modal de changement de plan */}
        {showChangePlanModal && selectedPlan && currentSubscription && currentSubscription.plan && (
          <ChangePlanModal
            isOpen={showChangePlanModal}
            onClose={() => {
              setShowChangePlanModal(false);
              setSelectedPlan(null);
            }}
            onConfirm={handleConfirmPlanChange}
            currentPlan={{
              name: currentSubscription.plan.name,
              price: currentSubscription.total_paid,
              monthly_price: currentSubscription.monthly_amount,
              duration_months: currentSubscription.plan.duration_months || 1,
              savings_percentage: currentSubscription.plan.savings_percentage || 0
            }}
            newPlan={{
              name: selectedPlan.name,
              price: selectedPlan.price,
              monthly_price: selectedPlan.monthly_price,
              duration_months: selectedPlan.duration_months || 1,
              savings_percentage: selectedPlan.savings_percentage
            }}
            isLoading={isChangingPlan}
          />
        )}

        {/* Dialog de confirmation pour la désactivation */}
        <Dialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <X className="h-5 w-5 text-red-600" />
                Désactiver l'abonnement
              </DialogTitle>
              <DialogDescription>
                Êtes-vous sûr de vouloir désactiver votre abonnement ? 
                Cette action est irréversible et désactivera votre business.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">
                  <strong>Attention :</strong> La désactivation de votre abonnement va :
                </p>
                <ul className="text-sm text-red-700 mt-2 space-y-1">
                  <li>• Désactiver votre business</li>
                  <li>• Arrêter tous les services BraPrime</li>
                  <li>• Supprimer l'accès au dashboard partenaire</li>
                </ul>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deactivate-reason">Raison de la désactivation (optionnel)</Label>
                <Textarea
                  id="deactivate-reason"
                  value={deactivateReason}
                  onChange={(e) => setDeactivateReason(e.target.value)}
                  placeholder="Expliquez pourquoi vous désactivez votre abonnement..."
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDeactivateDialog(false)}
                disabled={isDeactivating}
              >
                Annuler
              </Button>
              <Button
                onClick={handleDeactivateSubscription}
                disabled={isDeactivating}
                variant="destructive"
              >
                {isDeactivating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Désactivation...
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    Désactiver définitivement
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default PartnerBilling;