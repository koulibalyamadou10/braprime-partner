import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { subscriptionUtils } from '@/hooks/use-subscription';
import { SubscriptionPlan, subscriptionService } from '@/lib/services/subscription';
import { SubscriptionPaymentService } from '@/lib/services/subscription-payment';
import { CheckCircle, CreditCard, Lock, Shield } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';

interface CreateSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan: SubscriptionPlan | null;
  partnerId: number;
  onSubscriptionCreated: (subscriptionId: string) => void;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'card',
    name: 'Carte bancaire',
    icon: CreditCard,
    description: 'Visa, Mastercard, American Express'
  },
  {
    id: 'mobile_money',
    name: 'Paiement mobile',
    icon: CreditCard,
    description: 'Orange Money, MTN Mobile Money'
  },
  {
    id: 'bank_transfer',
    name: 'Virement bancaire',
    icon: CreditCard,
    description: 'Transfert direct vers notre compte'
  }
];

export const CreateSubscriptionModal: React.FC<CreateSubscriptionModalProps> = ({
  isOpen,
  onClose,
  selectedPlan,
  partnerId,
  onSubscriptionCreated
}) => {
  const [step, setStep] = useState<'plan' | 'billing' | 'payment' | 'confirmation'>('plan');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('card');
  const [billingInfo, setBillingInfo] = useState({
    email: '',
    phone: '',
    address: '',
    tax_id: ''
  });
  const [cardInfo, setCardInfo] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [autoRenew, setAutoRenew] = useState(true);

  const handleBillingInfoChange = (field: string, value: string) => {
    setBillingInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleCardInfoChange = (field: string, value: string) => {
    setCardInfo(prev => ({ ...prev, [field]: value }));
  };

  const validateBillingInfo = () => {
    if (!billingInfo.email || !billingInfo.phone) {
      toast.error('Veuillez remplir les informations de facturation obligatoires');
      return false;
    }
    return true;
  };

  const validateCardInfo = () => {
    if (selectedPaymentMethod === 'card') {
      if (!cardInfo.number || !cardInfo.expiry || !cardInfo.cvv || !cardInfo.name) {
        toast.error('Veuillez remplir toutes les informations de carte');
        return false;
      }
    }
    return true;
  };

  const handleNextStep = () => {
    if (step === 'plan') {
      setStep('billing');
    } else if (step === 'billing') {
      if (validateBillingInfo()) {
        setStep('payment');
      }
    } else if (step === 'payment') {
      if (validateCardInfo()) {
        setStep('confirmation');
      }
    }
  };

  const handlePreviousStep = () => {
    if (step === 'billing') {
      setStep('plan');
    } else if (step === 'payment') {
      setStep('billing');
    } else if (step === 'confirmation') {
      setStep('payment');
    }
  };

  const simulatePayment = async () => {
    setIsProcessing(true);
    
    // Simulation du processus de paiement
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulation d'un succès de paiement (90% de chance)
    const success = Math.random() > 0.1;
    
    if (success) {
      toast.success('Paiement traité avec succès !');
      onSubscriptionCreated('new-subscription-id');
      onClose();
    } else {
      toast.error('Échec du paiement. Veuillez réessayer.');
    }
    
    setIsProcessing(false);
  };

  const handleConfirmSubscription = async () => {
    setIsProcessing(true);
    
    try {
      // Créer l'abonnement via le service
      const subscriptionId = await subscriptionService.createSubscription(
        partnerId,
        selectedPlan!.id,
        billingInfo,
        {
          method: selectedPaymentMethod as 'card' | 'mobile_money' | 'bank_transfer',
          cardInfo: selectedPaymentMethod === 'card' ? cardInfo : undefined
        }
      );
      
      if (!subscriptionId) {
        throw new Error('Erreur lors de la création de l\'abonnement');
      }

      // Si le paiement est en ligne, créer l'URL de paiement via Lengo Pay
      if (selectedPaymentMethod === 'mobile_money' || selectedPaymentMethod === 'card') {
        try {
          // Préparer les données de paiement pour Lengo Pay
          const paymentData = {
            subscription_id: subscriptionId,
            partner_id: partnerId,
            plan_id: selectedPlan!.id,
            amount: selectedPlan!.price, // ✅ CORRECTION : utiliser price (montant total du plan)
            currency: 'GNF',
            payment_method: selectedPaymentMethod === 'mobile_money' ? 'mobile_money' : 'card',
            phone_number: billingInfo.phone || '',
            subscription_number: `SUB-${subscriptionId.substring(0, 8)}`,
            business_name: 'BraPrime Partenariat',
            partner_name: billingInfo.name || 'Partenaire BraPrime',
            partner_email: billingInfo.email || '',
            plan_name: selectedPlan!.name,
            duration_months: selectedPlan!.duration_months
          };

          // Créer l'URL de paiement via Lengo Pay
          const paymentResponse = await SubscriptionPaymentService.createSubscriptionPayment(paymentData);

          if (paymentResponse.success && paymentResponse.payment_url) {
            toast.success('Redirection vers le paiement sécurisé');
            
            // Rediriger vers Lengo Pay
            window.location.href = paymentResponse.payment_url;
            return;
          } else {
            // En cas d'échec du paiement en ligne, continuer avec le paiement à la livraison
            toast.error('Paiement en ligne indisponible. Le paiement sera effectué à la livraison.');
          }
        } catch (paymentError) {
          console.error('Erreur lors de la création du paiement:', paymentError);
          toast.error('Erreur de paiement. Le paiement sera effectué à la livraison.');
        }
      }

      // Si paiement à la livraison ou échec du paiement en ligne
      toast.success('Abonnement créé avec succès !');
      onSubscriptionCreated(subscriptionId);
      onClose();
      
    } catch (error) {
      console.error('Erreur lors de la création de l\'abonnement:', error);
      toast.error('Erreur lors de la création de l\'abonnement');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetModal = () => {
    setStep('plan');
    setSelectedPaymentMethod('card');
    setBillingInfo({ email: '', phone: '', address: '', tax_id: '' });
    setCardInfo({ number: '', expiry: '', cvv: '', name: '' });
    setAutoRenew(true);
    setIsProcessing(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!selectedPlan) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            {step === 'plan' && 'Choisir un plan'}
            {step === 'billing' && 'Informations de facturation'}
            {step === 'payment' && 'Paiement'}
            {step === 'confirmation' && 'Confirmation'}
          </DialogTitle>
          <DialogDescription>
            {step === 'plan' && 'Sélectionnez le plan qui vous convient le mieux'}
            {step === 'billing' && 'Remplissez vos informations de facturation'}
            {step === 'payment' && 'Choisissez votre méthode de paiement'}
            {step === 'confirmation' && 'Vérifiez vos informations avant confirmation'}
          </DialogDescription>
        </DialogHeader>

        {/* Barre de progression */}
        <div className="flex items-center justify-between mb-6">
          {['plan', 'billing', 'payment', 'confirmation'].map((stepName, index) => (
            <div key={stepName} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === stepName 
                  ? 'bg-guinea-red text-white' 
                  : index < ['plan', 'billing', 'payment', 'confirmation'].indexOf(step)
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-500'
              }`}>
                {index + 1}
              </div>
              {index < 3 && (
                <div className={`w-16 h-1 mx-2 ${
                  index < ['plan', 'billing', 'payment', 'confirmation'].indexOf(step)
                    ? 'bg-green-500'
                    : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Contenu selon l'étape */}
        {step === 'plan' && (
          <div className="space-y-4">
            <Card className="border-2 border-guinea-red">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {selectedPlan.name}
                  <Badge className="bg-guinea-red text-white">Sélectionné</Badge>
                </CardTitle>
                <CardDescription>{selectedPlan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">
                  {subscriptionUtils.formatPrice(selectedPlan.price)}
                </div>
                <div className="text-sm text-muted-foreground mb-3">
                  {subscriptionUtils.formatPrice(selectedPlan.monthly_price)}/mois
                </div>
                {selectedPlan.savings_percentage > 0 && (
                  <Badge className="bg-green-500 text-white mb-3">
                    {selectedPlan.savings_percentage}% d'économie
                  </Badge>
                )}
                <ul className="space-y-2">
                  {selectedPlan.features?.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        )}

        {step === 'billing' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="billing-email">Email de facturation *</Label>
                <Input
                  id="billing-email"
                  type="email"
                  placeholder="facturation@entreprise.gn"
                  value={billingInfo.email}
                  onChange={(e) => handleBillingInfoChange('email', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="billing-phone">Téléphone de facturation *</Label>
                <Input
                  id="billing-phone"
                  placeholder="+224 123 456 789"
                  value={billingInfo.phone}
                  onChange={(e) => handleBillingInfoChange('phone', e.target.value)}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="billing-address">Adresse de facturation</Label>
                <Input
                  id="billing-address"
                  placeholder="Adresse complète pour la facturation..."
                  value={billingInfo.address}
                  onChange={(e) => handleBillingInfoChange('address', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tax-id">Numéro fiscal</Label>
                <Input
                  id="tax-id"
                  placeholder="Numéro fiscal de l'entreprise"
                  value={billingInfo.tax_id}
                  onChange={(e) => handleBillingInfoChange('tax_id', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {step === 'payment' && (
          <div className="space-y-4">
            <div className="space-y-4">
              <Label>Méthode de paiement</Label>
              <div className="grid grid-cols-1 gap-3">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedPaymentMethod === method.id
                        ? 'border-guinea-red bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedPaymentMethod(method.id)}
                  >
                    <div className="flex items-center gap-3">
                      <method.icon className="h-5 w-5" />
                      <div className="flex-1">
                        <div className="font-medium">{method.name}</div>
                        <div className="text-sm text-muted-foreground">{method.description}</div>
                      </div>
                      {selectedPaymentMethod === method.id && (
                        <CheckCircle className="h-5 w-5 text-guinea-red" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedPaymentMethod === 'card' && (
              <div className="space-y-4">
                <Label>Informations de carte</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="card-number">Numéro de carte</Label>
                    <Input
                      id="card-number"
                      placeholder="1234 5678 9012 3456"
                      value={cardInfo.number}
                      onChange={(e) => handleCardInfoChange('number', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="card-expiry">Date d'expiration</Label>
                    <Input
                      id="card-expiry"
                      placeholder="MM/AA"
                      value={cardInfo.expiry}
                      onChange={(e) => handleCardInfoChange('expiry', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="card-cvv">CVV</Label>
                    <Input
                      id="card-cvv"
                      placeholder="123"
                      value={cardInfo.cvv}
                      onChange={(e) => handleCardInfoChange('cvv', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="card-name">Nom sur la carte</Label>
                    <Input
                      id="card-name"
                      placeholder="Nom complet"
                      value={cardInfo.name}
                      onChange={(e) => handleCardInfoChange('name', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="auto-renew"
                checked={autoRenew}
                onCheckedChange={(checked) => setAutoRenew(checked as boolean)}
              />
              <Label htmlFor="auto-renew">Renouvellement automatique</Label>
            </div>
          </div>
        )}

        {step === 'confirmation' && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Récapitulatif de votre commande</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Plan sélectionné :</span>
                  <span className="font-medium">{selectedPlan.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Prix :</span>
                  <span className="font-medium">{subscriptionUtils.formatPrice(selectedPlan.price)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Méthode de paiement :</span>
                  <span className="font-medium">
                    {paymentMethods.find(m => m.id === selectedPaymentMethod)?.name}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total à payer :</span>
                  <span>{subscriptionUtils.formatPrice(selectedPlan.price)}</span>
                </div>
              </CardContent>
            </Card>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <div className="font-medium text-blue-900">Paiement sécurisé</div>
                  <div className="text-sm text-blue-700">
                    Vos informations de paiement sont protégées par un chiffrement SSL de niveau bancaire.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Boutons de navigation */}
        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={handlePreviousStep}
            disabled={step === 'plan' || isProcessing}
          >
            Précédent
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose} disabled={isProcessing}>
              Annuler
            </Button>
            
            {step === 'confirmation' ? (
              <Button
                onClick={handleConfirmSubscription}
                disabled={isProcessing}
                className="bg-guinea-red hover:bg-guinea-red/90"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Traitement...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Confirmer et payer
                  </>
                )}
              </Button>
            ) : (
              <Button onClick={handleNextStep} disabled={isProcessing}>
                Suivant
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 