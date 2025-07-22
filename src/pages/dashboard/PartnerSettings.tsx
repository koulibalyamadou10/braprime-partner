import { CreateSubscriptionModal } from '@/components/dashboard/CreateSubscriptionModal';
import DashboardLayout, { partnerNavItems } from '@/components/dashboard/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { usePartnerProfile } from '@/hooks/use-partner-profile';
import { subscriptionUtils, useActivatePendingSubscription, useCreateSubscription, useCurrentUserSubscription, useCurrentUserSubscriptionHistory, useSubscriptionPlans, useUpdateBillingInfo } from '@/hooks/use-subscription';
import { useUserBusiness } from '@/hooks/use-user-business';
import {
    AlertCircle,
    Bell,
    Building2,
    Calendar,
    CheckCircle,
    Clock,
    CreditCard,
    DollarSign,
    Globe,
    Phone,
    Save,
    Settings,
    Shield
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface BusinessSettings {
  name: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  postal_code: string;
  country: string;
  timezone: string;
  currency: string;
  language: string;
  is_active: boolean;
  auto_accept_orders: boolean;
  require_prepayment: boolean;
  delivery_radius: number;
  min_order_amount: number;
  max_delivery_time: number;
}

interface NotificationSettings {
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  order_updates: boolean;
  new_orders: boolean;
  low_stock: boolean;
  daily_reports: boolean;
  weekly_reports: boolean;
}

interface SecuritySettings {
  two_factor_auth: boolean;
  session_timeout: number;
  password_expiry_days: number;
  login_notifications: boolean;
  ip_whitelist: string[];
}

const PartnerSettings: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showCreateSubscriptionModal, setShowCreateSubscriptionModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  
  // Hooks d'abonnement
  const { data: subscriptionPlans } = useSubscriptionPlans();
  const { data: currentSubscription, isLoading: subscriptionLoading } = useCurrentUserSubscription();
  const { data: subscriptionHistory, isLoading: historyLoading } = useCurrentUserSubscriptionHistory();
  const updateBillingInfo = useUpdateBillingInfo();
  const createSubscription = useCreateSubscription();
  const activatePendingSubscription = useActivatePendingSubscription();
  const { data: business, isLoading: businessLoading } = useUserBusiness();
  
  // Hook partenaire pour diagnostic
  const { profile: partnerProfile, isLoading: partnerLoading } = usePartnerProfile();
  
  console.log('🔍 [PartnerSettings] Diagnostic des hooks:');
  console.log('  - useUserBusiness:', { business, businessLoading });
  console.log('  - usePartnerProfile:', { partnerProfile, partnerLoading });
  console.log('  - user:', user);
  console.log('  - currentSubscription:', currentSubscription);
  console.log('  - subscriptionLoading:', subscriptionLoading);
  console.log('  - partnerProfile?.id:', partnerProfile?.id);
  console.log('  - subscriptionHistory:', subscriptionHistory);
  console.log('  - historyLoading:', historyLoading);

  const [businessSettings, setBusinessSettings] = useState<BusinessSettings>({
    name: '',
    description: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    postal_code: '',
    country: 'Guinée',
    timezone: 'Africa/Conakry',
    currency: 'GNF',
    language: 'fr',
    is_active: true,
    auto_accept_orders: false,
    require_prepayment: false,
    delivery_radius: 10,
    min_order_amount: 5000,
    max_delivery_time: 60
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    email_notifications: true,
    sms_notifications: false,
    push_notifications: true,
    order_updates: true,
    new_orders: true,
    low_stock: false,
    daily_reports: false,
    weekly_reports: true
  });

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    two_factor_auth: false,
    session_timeout: 30,
    password_expiry_days: 90,
    login_notifications: true,
    ip_whitelist: []
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      // Simuler le chargement des paramètres
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Données de test
      setBusinessSettings({
        name: 'Restaurant Le Gourmet',
        description: 'Restaurant gastronomique spécialisé dans la cuisine française',
        phone: '+224 123 456 789',
        email: 'contact@legourmet.gn',
        address: '123 Avenue de la République',
        city: 'Conakry',
        postal_code: '001',
        country: 'Guinée',
        timezone: 'Africa/Conakry',
        currency: 'GNF',
        language: 'fr',
        is_active: true,
        auto_accept_orders: false,
        require_prepayment: false,
        delivery_radius: 10,
        min_order_amount: 5000,
        max_delivery_time: 60
      });
    } catch (error) {
      toast.error('Erreur lors du chargement des paramètres');
    } finally {
      setLoading(false);
    }
  };

  const saveBusinessSettings = async () => {
    try {
      setSaving(true);
      // Simuler la sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Paramètres sauvegardés avec succès');
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const saveNotificationSettings = async () => {
    try {
      setSaving(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Paramètres de notification sauvegardés');
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const saveSecuritySettings = async () => {
    try {
      setSaving(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Paramètres de sécurité sauvegardés');
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleSelectPlan = async (planId: string) => {
    try {
      // Utiliser partnerProfile si disponible, sinon userBusiness
      const currentBusiness = partnerProfile || business;
      const isLoading = partnerLoading || businessLoading;
      
      console.log('🔍 [PartnerSettings] Business sélectionné:', currentBusiness);
      
      // Vérifier que le business existe
      if (!currentBusiness || isLoading) {
        toast.error('Chargement du profil business en cours...');
        return;
      }

      // Trouver le plan sélectionné
      const plan = subscriptionPlans?.find(p => p.id === planId);
      if (!plan) {
        toast.error('Plan non trouvé');
        return;
      }

      console.log('🔍 [PartnerSettings] Business ID pour l\'abonnement:', currentBusiness.id);

      // Si l'utilisateur a déjà un abonnement, on le renouvelle
      if (currentSubscription) {
        const success = await updateBillingInfo.mutateAsync({
          subscriptionId: currentSubscription.id,
          billingInfo: {
            email: currentSubscription.billing_email,
            phone: currentSubscription.billing_phone,
            address: currentSubscription.billing_address,
            tax_id: currentSubscription.tax_id
          }
        });
        
        if (success) {
          toast.success('Plan changé avec succès');
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

  if (loading) {
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

  return (
    <DashboardLayout navItems={partnerNavItems}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Paramètres</h1>
            <p className="text-muted-foreground">
              Gérez les paramètres de votre entreprise
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Général
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Sécurité
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Facturation
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Informations de l'entreprise
                </CardTitle>
                <CardDescription>
                  Modifiez les informations de base de votre entreprise
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="business-name">Nom de l'entreprise</Label>
                    <Input
                      id="business-name"
                      value={businessSettings.name}
                      onChange={(e) => setBusinessSettings(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Nom de votre entreprise"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="business-phone">Téléphone</Label>
                    <Input
                      id="business-phone"
                      value={businessSettings.phone}
                      onChange={(e) => setBusinessSettings(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+224 123 456 789"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="business-email">Email</Label>
                    <Input
                      id="business-email"
                      type="email"
                      value={businessSettings.email}
                      onChange={(e) => setBusinessSettings(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="contact@entreprise.gn"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="business-city">Ville</Label>
                    <Input
                      id="business-city"
                      value={businessSettings.city}
                      onChange={(e) => setBusinessSettings(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="Conakry"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business-description">Description</Label>
                  <Textarea
                    id="business-description"
                    value={businessSettings.description}
                    onChange={(e) => setBusinessSettings(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Description de votre entreprise..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business-address">Adresse complète</Label>
                  <Textarea
                    id="business-address"
                    value={businessSettings.address}
                    onChange={(e) => setBusinessSettings(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Adresse complète de votre entreprise..."
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Paramètres régionaux
                </CardTitle>
                <CardDescription>
                  Configurez les paramètres régionaux et la devise
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Fuseau horaire</Label>
                    <Select
                      value={businessSettings.timezone}
                      onValueChange={(value) => setBusinessSettings(prev => ({ ...prev, timezone: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Africa/Conakry">Afrique/Conakry (UTC+0)</SelectItem>
                        <SelectItem value="Africa/Abidjan">Afrique/Abidjan (UTC+0)</SelectItem>
                        <SelectItem value="Europe/Paris">Europe/Paris (UTC+1)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Devise</Label>
                    <Select
                      value={businessSettings.currency}
                      onValueChange={(value) => setBusinessSettings(prev => ({ ...prev, currency: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GNF">Franc guinéen (GNF)</SelectItem>
                        <SelectItem value="USD">Dollar américain (USD)</SelectItem>
                        <SelectItem value="EUR">Euro (EUR)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">Langue</Label>
                    <Select
                      value={businessSettings.language}
                      onValueChange={(value) => setBusinessSettings(prev => ({ ...prev, language: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Paramètres de livraison
                </CardTitle>
                <CardDescription>
                  Configurez les paramètres de livraison et de commande
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="delivery-radius">Rayon de livraison (km)</Label>
                    <Input
                      id="delivery-radius"
                      type="number"
                      value={businessSettings.delivery_radius}
                      onChange={(e) => setBusinessSettings(prev => ({ ...prev, delivery_radius: parseInt(e.target.value) }))}
                      min="1"
                      max="50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="min-order">Montant minimum (GNF)</Label>
                    <Input
                      id="min-order"
                      type="number"
                      value={businessSettings.min_order_amount}
                      onChange={(e) => setBusinessSettings(prev => ({ ...prev, min_order_amount: parseInt(e.target.value) }))}
                      min="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max-delivery-time">Temps max livraison (min)</Label>
                    <Input
                      id="max-delivery-time"
                      type="number"
                      value={businessSettings.max_delivery_time}
                      onChange={(e) => setBusinessSettings(prev => ({ ...prev, max_delivery_time: parseInt(e.target.value) }))}
                      min="15"
                      max="180"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Acceptation automatique des commandes</Label>
                      <p className="text-sm text-muted-foreground">
                        Accepter automatiquement les nouvelles commandes
                      </p>
                    </div>
                    <Switch
                      checked={businessSettings.auto_accept_orders}
                      onCheckedChange={(checked) => setBusinessSettings(prev => ({ ...prev, auto_accept_orders: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Paiement à la commande</Label>
                      <p className="text-sm text-muted-foreground">
                        Exiger le paiement avant la préparation
                      </p>
                    </div>
                    <Switch
                      checked={businessSettings.require_prepayment}
                      onCheckedChange={(checked) => setBusinessSettings(prev => ({ ...prev, require_prepayment: checked }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={saveBusinessSettings} disabled={saving}>
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Sauvegarder
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Paramètres de notification
                </CardTitle>
                <CardDescription>
                  Configurez comment vous recevez les notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Notifications par email</Label>
                      <p className="text-sm text-muted-foreground">
                        Recevoir les notifications par email
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.email_notifications}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, email_notifications: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Notifications SMS</Label>
                      <p className="text-sm text-muted-foreground">
                        Recevoir les notifications par SMS
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.sms_notifications}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, sms_notifications: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Notifications push</Label>
                      <p className="text-sm text-muted-foreground">
                        Recevoir les notifications push dans l'application
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.push_notifications}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, push_notifications: checked }))}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Types de notifications</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Nouvelles commandes</Label>
                        <p className="text-sm text-muted-foreground">
                          Notifier lors de nouvelles commandes
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.new_orders}
                        onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, new_orders: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Mises à jour de commande</Label>
                        <p className="text-sm text-muted-foreground">
                          Notifier les changements de statut
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.order_updates}
                        onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, order_updates: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Stock faible</Label>
                        <p className="text-sm text-muted-foreground">
                          Alerter quand le stock est faible
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.low_stock}
                        onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, low_stock: checked }))}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Rapports</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Rapports quotidiens</Label>
                        <p className="text-sm text-muted-foreground">
                          Recevoir un rapport quotidien
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.daily_reports}
                        onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, daily_reports: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Rapports hebdomadaires</Label>
                        <p className="text-sm text-muted-foreground">
                          Recevoir un rapport hebdomadaire
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.weekly_reports}
                        onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, weekly_reports: checked }))}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={saveNotificationSettings} disabled={saving}>
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Sauvegarder
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Sécurité du compte
                </CardTitle>
                <CardDescription>
                  Gérez la sécurité de votre compte
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Authentification à deux facteurs</Label>
                      <p className="text-sm text-muted-foreground">
                        Ajouter une couche de sécurité supplémentaire
                      </p>
                    </div>
                    <Switch
                      checked={securitySettings.two_factor_auth}
                      onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, two_factor_auth: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Notifications de connexion</Label>
                      <p className="text-sm text-muted-foreground">
                        Recevoir une notification lors de nouvelles connexions
                      </p>
                    </div>
                    <Switch
                      checked={securitySettings.login_notifications}
                      onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, login_notifications: checked }))}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Paramètres de session</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="session-timeout">Délai d'expiration de session (minutes)</Label>
                      <Select
                        value={securitySettings.session_timeout.toString()}
                        onValueChange={(value) => setSecuritySettings(prev => ({ ...prev, session_timeout: parseInt(value) }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="60">1 heure</SelectItem>
                          <SelectItem value="120">2 heures</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password-expiry">Expiration du mot de passe (jours)</Label>
                      <Select
                        value={securitySettings.password_expiry_days.toString()}
                        onValueChange={(value) => setSecuritySettings(prev => ({ ...prev, password_expiry_days: parseInt(value) }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">30 jours</SelectItem>
                          <SelectItem value="60">60 jours</SelectItem>
                          <SelectItem value="90">90 jours</SelectItem>
                          <SelectItem value="180">180 jours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={saveSecuritySettings} disabled={saving}>
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Sauvegarder
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="billing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Facturation et abonnements
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
                        className="bg-green-600 hover:bg-green-700"
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
                  </div>
                ) : (
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                      <span className="font-medium">Aucun abonnement actif</span>
                    </div>
                    <p className="text-sm text-yellow-700">
                      Vous n'avez pas d'abonnement actif. Choisissez un plan ci-dessous pour commencer.
                    </p>
                  </div>
                )}

                {/* Plans disponibles */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Plans d'abonnement disponibles</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {subscriptionPlans?.map((plan) => (
                      <Card 
                        key={plan.id} 
                        className={`border-2 ${
                          plan.plan_type === '3_months' 
                            ? 'border-guinea-red relative' 
                            : 'border-gray-200'
                        }`}
                      >
                        {plan.plan_type === '3_months' && (
                          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                            <Badge className="bg-guinea-red text-white text-xs">Recommandé</Badge>
                          </div>
                        )}
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">{plan.name}</CardTitle>
                          <CardDescription>{plan.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold mb-2">
                            {subscriptionUtils.formatPrice(plan.price)}
                          </div>
                          <div className="text-sm text-muted-foreground mb-3">
                            {subscriptionUtils.formatPrice(plan.monthly_price)}/mois
                          </div>
                          {plan.savings_percentage > 0 && (
                            <Badge className="bg-green-500 text-white text-xs mb-3">
                              {plan.savings_percentage}% d'économie
                            </Badge>
                          )}
                          <ul className="space-y-1 text-xs">
                            {plan.features?.slice(0, 3).map((feature, index) => (
                              <li key={index} className="flex items-center gap-1">
                                <CheckCircle className="h-3 w-3 text-green-600" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                          <Button 
                            className="w-full mt-4" 
                            variant={plan.plan_type === '3_months' ? 'default' : 'outline'}
                            onClick={() => handleSelectPlan(plan.id)}
                          >
                            {currentSubscription ? 'Changer vers ce plan' : 'Choisir ce plan'}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Historique des abonnements */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Historique des abonnements</h3>
                  {historyLoading ? (
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-muted p-4 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="space-y-2">
                              <div className="h-4 bg-muted-foreground/20 rounded w-32 animate-pulse" />
                              <div className="h-3 bg-muted-foreground/20 rounded w-24 animate-pulse" />
                            </div>
                            <div className="h-6 bg-muted-foreground/20 rounded w-16 animate-pulse" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : subscriptionHistory && subscriptionHistory.length > 0 ? (
                    <div className="space-y-3">
                      {subscriptionHistory.map((subscription) => (
                        <Card key={subscription.id} className="border-l-4 border-l-guinea-red">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{subscription.plan?.name}</span>
                                  <Badge 
                                    className={subscriptionUtils.getStatusColor(subscription.status)}
                                  >
                                    {subscriptionUtils.getStatusLabel(subscription.status)}
                                  </Badge>
                                </div>
                                <div className="text-sm text-muted-foreground space-y-1">
                                  <div>
                                    <span className="font-medium">Période :</span> {subscriptionUtils.formatDate(subscription.start_date)} - {subscriptionUtils.formatDate(subscription.end_date)}
                                  </div>
                                  <div>
                                    <span className="font-medium">Montant :</span> {subscriptionUtils.formatPrice(subscription.total_paid)}
                                  </div>
                                  {subscription.savings_amount > 0 && (
                                    <div className="text-green-600">
                                      <span className="font-medium">Économies :</span> {subscriptionUtils.formatPrice(subscription.savings_amount)}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="text-right text-sm text-muted-foreground">
                                <div>Créé le {subscriptionUtils.formatDate(subscription.created_at)}</div>
                                {subscription.status === 'active' && (
                                  <div className="text-green-600 font-medium">
                                    {subscriptionUtils.getDaysRemaining(subscription.end_date)} jours restants
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-muted p-4 rounded-lg text-center">
                      <p className="text-muted-foreground">Aucun historique d'abonnement disponible</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="bg-guinea-red hover:bg-guinea-red/90">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Changer de plan
                  </Button>
                  <Button size="lg" variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    Voir l'historique
                  </Button>
                </div>

                {/* Informations de facturation */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Informations de facturation</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="billing-email">Email de facturation</Label>
                      <Input
                        id="billing-email"
                        type="email"
                        placeholder="facturation@entreprise.gn"
                        defaultValue={currentSubscription?.billing_email || "facturation@legourmet.gn"}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="billing-phone">Téléphone de facturation</Label>
                      <Input
                        id="billing-phone"
                        placeholder="+224 123 456 789"
                        defaultValue={currentSubscription?.billing_phone || "+224 123 456 789"}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="billing-address">Adresse de facturation</Label>
                      <Textarea
                        id="billing-address"
                        placeholder="Adresse complète pour la facturation..."
                        defaultValue={currentSubscription?.billing_address || "123 Avenue de la République, Conakry, Guinée"}
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tax-id">Numéro fiscal</Label>
                      <Input
                        id="tax-id"
                        placeholder="Numéro fiscal de l'entreprise"
                        defaultValue={currentSubscription?.tax_id || "123456789"}
                      />
                    </div>
                  </div>
                </div>

                {/* Moyens de paiement */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Moyens de paiement</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <CreditCard className="h-4 w-4" />
                      <span className="text-sm">Cartes bancaires</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4" />
                      <span className="text-sm">Virements bancaires</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4" />
                      <span className="text-sm">Paiements mobiles</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={saveBusinessSettings} disabled={saving}>
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Sauvegarde...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Sauvegarder les informations
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal de création d'abonnement */}
      <CreateSubscriptionModal
        isOpen={showCreateSubscriptionModal}
        onClose={() => {
          setShowCreateSubscriptionModal(false);
          setSelectedPlan(null);
        }}
        selectedPlan={selectedPlan}
        partnerId={partnerProfile?.id || business?.id || 0} // Utiliser partnerProfile en priorité
        onSubscriptionCreated={handleSubscriptionCreated}
      />
    </DashboardLayout>
  );
};

export default PartnerSettings; 