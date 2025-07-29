import { CreateSubscriptionModal } from '@/components/dashboard/CreateSubscriptionModal';
import DashboardLayout, { partnerNavItems } from '@/components/dashboard/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { usePartnerProfile } from '@/hooks/use-partner-profile';
import { subscriptionUtils, useActivatePendingSubscription, useCreateSubscription, useCurrentUserSubscription, useCurrentUserSubscriptionHistory, useSubscriptionPlans, useUpdateBillingInfo } from '@/hooks/use-subscription';
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  DollarSign,
  Download,
  FileText,
  History,
  Plus,
  Receipt,
  Settings,
  X
} from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SubscriptionManagementService } from '@/lib/services/subscription-management';

const PartnerBilling: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateSubscriptionModal, setShowCreateSubscriptionModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  
  // États pour la désactivation
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [deactivateReason, setDeactivateReason] = useState('');
  const [isDeactivating, setIsDeactivating] = useState(false);
  
  // Hooks d'abonnement
  const { data: subscriptionPlans } = useSubscriptionPlans();
  const { data: currentSubscription, isLoading: subscriptionLoading } = useCurrentUserSubscription();
  const { data: subscriptionHistory, isLoading: historyLoading } = useCurrentUserSubscriptionHistory();
  const updateBillingInfo = useUpdateBillingInfo();
  const createSubscription = useCreateSubscription();
  const activatePendingSubscription = useActivatePendingSubscription();
  
  // Hook partenaire
  const { profile: business, isLoading: businessLoading } = usePartnerProfile();

  console.log('🔍 [PartnerBilling] Diagnostic des hooks:');
  console.log('  - usePartnerProfile (business):', { business, businessLoading });
  console.log('  - currentSubscription:', currentSubscription);
  console.log('  - subscriptionLoading:', subscriptionLoading);

  const handleSelectPlan = async (planId: string) => {
    try {
      const plan = subscriptionPlans?.find(p => p.id === planId);
      if (!plan) {
        toast.error('Plan non trouvé');
        return;
      }

      // Vérifier si l'utilisateur a déjà un abonnement actif
      if (currentSubscription && currentSubscription.status === 'active') {
        // Demander confirmation pour changer de plan
        const confirmed = window.confirm(
          `Vous avez déjà un abonnement actif (${currentSubscription.plan?.name}). Voulez-vous le remplacer par ${plan.name} ?`
        );
        
        if (confirmed) {
          // Logique pour changer de plan
          const success = await createSubscription.mutateAsync({
            partnerId: business?.id || 0,
            planId: plan.id,
            billingInfo: {
              email: business?.email || '',
              phone: business?.phone || '',
              address: business?.address || ''
            }
          });
          
          if (success) {
            toast.success('Plan changé avec succès');
          }
        }
      } else {
        // Ouvrir le modal de création d'abonnement
        setSelectedPlan(plan);
        setShowCreateSubscriptionModal(true);
      }
    } catch (error) {
      console.error('Erreur lors de la sélection du plan:', error);
      toast.error('Erreur lors de la sélection du plan');
    }
  };

  const handleSubscriptionCreated = (subscriptionId: string) => {
    toast.success('Abonnement créé avec succès !');
    setShowCreateSubscriptionModal(false);
    setSelectedPlan(null);
  };

  const handleActivateSubscription = async () => {
    if (!currentSubscription) return;
    
    try {
      await activatePendingSubscription.mutateAsync(currentSubscription.id);
    } catch (error) {
      console.error('Erreur lors de l\'activation:', error);
    }
  };

  const handlePayment = async (subscriptionId: string) => {
    if (!currentSubscription) {
      toast.error('Aucun abonnement trouvé');
      return;
    }

    // Vérifier que l'abonnement est en attente de paiement
    if (currentSubscription.status !== 'pending') {
      toast.error('Cet abonnement n\'est pas éligible au paiement');
      return;
    }

    try {
      // Appel direct à l'API de paiement
      const response = await fetch('https://braprime-backend.vercel.app/api/subscriptions/pay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
      console.error('Erreur lors du paiement:', error);
      toast.error('Erreur lors du paiement. Veuillez réessayer.');
    }
  };

  // Fonction pour désactiver l'abonnement
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
        // Recharger les données
        window.location.reload();
      } else {
        toast.error(result.error || 'Erreur lors de la désactivation');
      }
    } catch (error) {
      console.error('Erreur lors de la désactivation:', error);
      toast.error('Erreur lors de la désactivation de l\'abonnement');
    } finally {
      setIsDeactivating(false);
    }
  };

  if (businessLoading) {
    return (
      <DashboardLayout navItems={partnerNavItems}>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
      <DashboardLayout navItems={partnerNavItems}>
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
    <DashboardLayout navItems={partnerNavItems}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Facturation</h1>
            <p className="text-muted-foreground">
              Gérez votre abonnement BraPrime et vos informations de facturation
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Vue d'ensemble
            </TabsTrigger>
            <TabsTrigger value="subscription" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Abonnement
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Historique
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Factures
            </TabsTrigger>
          </TabsList>

          {/* Vue d'ensemble */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Statut actuel */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Statut actuel
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {subscriptionLoading ? (
                    <Skeleton className="h-20 w-full" />
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
                           'Abonnement inactif'}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {currentSubscription.plan?.name}
                      </p>
                      {currentSubscription.status === 'active' && currentSubscription.savings_amount > 0 && (
                        <Badge className="bg-green-500 text-white mt-2">
                          {currentSubscription.plan?.savings_percentage}% d'économie
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground mb-4">Aucun abonnement actif</p>
                      <Button onClick={() => setActiveTab('subscription')}>
                        <Plus className="h-4 w-4 mr-2" />
                        Choisir un plan
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Prochain paiement */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Prochain paiement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {currentSubscription ? (
                    <div className="space-y-2">
                      <p className="text-2xl font-bold">
                        {subscriptionUtils.formatPrice(currentSubscription.monthly_amount)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {currentSubscription.status === 'active' 
                          ? `Expire le ${subscriptionUtils.formatDate(currentSubscription.end_date)}`
                          : 'En attente d\'activation'
                        }
                      </p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Aucun abonnement</p>
                  )}
                </CardContent>
              </Card>

              {/* Économies réalisées */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Économies
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {currentSubscription && currentSubscription.savings_amount > 0 ? (
                    <div className="space-y-2">
                      <p className="text-2xl font-bold text-green-600">
                        {subscriptionUtils.formatPrice(currentSubscription.savings_amount)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Économies réalisées
                      </p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Aucune économie</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Abonnement */}
          <TabsContent value="subscription" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
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
                    {currentSubscription.status === 'pending' && (
                      <Button 
                        onClick={handleActivateSubscription}
                        disabled={activatePendingSubscription.isPending}
                        className="bg-guinea-red hover:bg-guinea-red/90"
                      >
                        {activatePendingSubscription.isPending ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            Activation...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Activer l'abonnement
                          </>
                        )}
                      </Button>
                    )}
                    {currentSubscription.status === 'pending' && (
                      <Button 
                        onClick={() => handlePayment(currentSubscription.id)}
                        className="bg-guinea-green hover:bg-guinea-green/90 text-white"
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Payer maintenant
                      </Button>
                    )}
                    {currentSubscription.status === 'active' && (
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
                    <Button 
                      onClick={() => setShowCreateSubscriptionModal(true)}
                      className="bg-guinea-red hover:bg-guinea-red/90"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Nouvel abonnement
                    </Button>
                  </div>
                  
                  {subscriptionPlans ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {subscriptionPlans.map((plan) => (
                        <Card key={plan.id} className="relative">
                          {plan.savings_percentage > 0 && (
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
                              <Button 
                                onClick={() => handleSelectPlan(plan.id)}
                                className="w-full bg-guinea-red hover:bg-guinea-red/90"
                              >
                                Choisir ce plan
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Skeleton className="h-32 w-full" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Historique */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Historique des abonnements
                </CardTitle>
                <CardDescription>
                  Consultez l'historique de vos abonnements
                </CardDescription>
              </CardHeader>
              <CardContent>
                {historyLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : subscriptionHistory && subscriptionHistory.length > 0 ? (
                  <div className="space-y-4">
                    {subscriptionHistory.map((subscription) => (
                      <div key={subscription.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className={`w-3 h-3 rounded-full ${
                            subscription.status === 'active' ? 'bg-green-500' :
                            subscription.status === 'pending' ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`} />
                          <div>
                            <p className="font-medium">{subscription.plan?.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {subscriptionUtils.formatDate(subscription.start_date)} - {subscriptionUtils.formatDate(subscription.end_date)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{subscriptionUtils.formatPrice(subscription.total_paid)}</p>
                          <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
                            {subscription.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Aucun historique d'abonnement</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Factures */}
          <TabsContent value="billing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Factures
                </CardTitle>
                <CardDescription>
                  Consultez et téléchargez vos factures
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Factures</h3>
                  <p className="text-muted-foreground mb-4">
                    Vos factures apparaîtront ici une fois que vous aurez un abonnement actif
                  </p>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger les factures
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modal de création d'abonnement */}
        {showCreateSubscriptionModal && selectedPlan && (
          <CreateSubscriptionModal
            isOpen={showCreateSubscriptionModal}
            onClose={() => {
              setShowCreateSubscriptionModal(false);
              setSelectedPlan(null);
            }}
            selectedPlan={selectedPlan}
            onSubscriptionCreated={handleSubscriptionCreated}
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