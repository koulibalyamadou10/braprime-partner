
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
import { subscriptionUtils } from '@/hooks/use-subscription';
import { supabase } from '@/lib/supabase';
import {
    AlertCircle,
    Bell,
    Building2,
    Calendar,
    CheckCircle,
    Clock,
    DollarSign,
    Globe,
    Phone,
    QrCode,
    Save,
    Settings,
    Shield,
    Truck
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Unauthorized from '@/components/Unauthorized';
import { useCurrencyRole } from '@/contexts/UseRoleContext';
import QRCodeGenerator from '@/components/QRCodeGenerator';
import { usePartnerMenu } from '@/hooks/use-partner-menu';

interface BusinessSettings {
  // Informations de base
  name: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  
  // Informations de livraison
  delivery_time: string;
  delivery_fee: number;
  delivery_radius: number;
  max_orders_per_slot: number;
  
  // Informations de cuisine
  cuisine_type: string;
  opening_hours: string;
  
  // Statut
  is_active: boolean;
  is_open: boolean;
  
  // Paramètres régionaux
  timezone: string;
  currency: string;
  language: string;
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
  const { currencyRole, roles } = useCurrencyRole();

  if (!roles.includes("admin")) {
    return <Unauthorized />;
  }

  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  // Hook partenaire pour diagnostic
  const { profile: partnerProfile, isLoading: partnerLoading } = usePartnerProfile();
  
  // Utiliser partnerProfile comme business data
  const business = partnerProfile;
  const businessLoading = partnerLoading;

  // Hook pour récupérer les menu items
  const { data: menuItems, isLoading: menuItemsLoading } = usePartnerMenu();
  
  const [businessSettings, setBusinessSettings] = useState<BusinessSettings>({
    // Informations de base
    name: '',
    description: '',
    phone: '',
    email: '',
    address: '',
    
    // Informations de livraison
    delivery_time: '30-45 min',
    delivery_fee: 5000,
    delivery_radius: 10,
    max_orders_per_slot: 10,
    
    // Informations de cuisine
    cuisine_type: '',
    opening_hours: '',
    
    // Statut
    is_active: true,
    is_open: true,
    
    // Paramètres régionaux
    timezone: 'Africa/Conakry',
    currency: 'GNF',
    language: 'fr'
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
  }, [business, businessLoading]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      
      // Charger même si businessLoading est true, pour voir si ça débloque
      if (business) {
        
        setBusinessSettings({
          // Informations de base
          name: business.name || '',
          description: business.description || '',
          phone: business.phone || '',
          email: business.email || '',
          address: business.address || '',
          
          // Informations de livraison
          delivery_time: business.delivery_time || '30-45 min',
          delivery_fee: business.delivery_fee || 5000,
          delivery_radius: business.delivery_radius || 10,
          max_orders_per_slot: business.max_orders_per_slot || 10,
          
          // Informations de cuisine
          cuisine_type: business.cuisine_type || '',
          opening_hours: business.opening_hours || '',
          
          // Statut
          is_active: business.is_active ?? true,
          is_open: business.is_open ?? true,
          
          // Paramètres régionaux
          timezone: 'Africa/Conakry',
          currency: 'GNF',
          language: 'fr'
        });
        
      } else {
        // Charger des données par défaut pour éviter le skeleton infini
        setBusinessSettings({
          name: 'Chargement...',
          description: '',
          phone: '',
          email: '',
          address: '',
          city: 'Conakry',
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
      }
    } catch (error) {
      console.error('❌ [PartnerSettings] Erreur lors du chargement des paramètres:', error);
      toast.error('Erreur lors du chargement des paramètres');
    } finally {
      setLoading(false);
    }
  };

  const saveBusinessSettings = async () => {
    try {
      setSaving(true);
      
      if (!business?.id) {
        toast.error('Aucun business associé à ce compte');
        return;
      }
      
      
      // Mettre à jour la base de données
      const { error } = await supabase
        .from('businesses')
        .update({
          name: businessSettings.name,
          description: businessSettings.description,
          phone: businessSettings.phone,
          email: businessSettings.email,
          address: businessSettings.address,
          delivery_time: businessSettings.delivery_time,
          delivery_fee: businessSettings.delivery_fee,
          delivery_radius: businessSettings.delivery_radius,
          max_orders_per_slot: businessSettings.max_orders_per_slot,
          cuisine_type: businessSettings.cuisine_type,
          opening_hours: businessSettings.opening_hours,
          is_active: businessSettings.is_active,
          is_open: businessSettings.is_open,
          updated_at: new Date().toISOString()
        })
        .eq('id', business.id);
      
      if (error) {
        toast.error('Erreur lors de la sauvegarde: ' + error.message);
        return;
      }
      
      toast.success('Paramètres sauvegardés avec succès');
      
      // Recharger les données pour s'assurer qu'elles sont à jour
      window.location.reload();
      
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

  // Gestion d'erreurs granulaire - affichée en haut de page
  const ErrorCard = () => (
    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
      <div className="flex items-center gap-2">
        <AlertCircle className="h-4 w-4 text-red-500" />
        <p className="text-sm text-red-700">
          Aucun business associé à votre compte. Veuillez contacter l'administrateur.
        </p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => window.location.reload()}
          className="ml-auto"
        >
          <Settings className="h-4 w-4 mr-1" />
          Actualiser
        </Button>
      </div>
    </div>
  );

  return (
    <DashboardLayout navItems={partnerNavItems}>
      <div className="space-y-6">
        {/* Affichage des erreurs seulement s'il y en a et que le chargement est terminé */}
        {!business && !businessLoading && <ErrorCard />}

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
              <Settings className="h-4 w-4 text-blue-600" />
              Général
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-yellow-600" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-red-600" />
              Sécurité
            </TabsTrigger>
            <TabsTrigger value="qrcodes" className="flex items-center gap-2">
              <QrCode className="h-4 w-4 text-green-600" />
              QR Codes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            {/* Informations de base */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  Informations de base
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
                    <Label htmlFor="business-cuisine">Type de cuisine</Label>
                    <Input
                      id="business-cuisine"
                      value={businessSettings.cuisine_type}
                      onChange={(e) => setBusinessSettings(prev => ({ ...prev, cuisine_type: e.target.value }))}
                      placeholder="Ex: Africaine, Européenne, Asiatique..."
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
                <div className="space-y-2">
                  <Label htmlFor="business-hours">Heures d'ouverture</Label>
                  <Input
                    id="business-hours"
                    value={businessSettings.opening_hours}
                    onChange={(e) => setBusinessSettings(prev => ({ ...prev, opening_hours: e.target.value }))}
                    placeholder="Ex: 8h-22h, Lundi-Dimanche"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Paramètres de livraison */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-green-600" />
                  Paramètres de livraison
                </CardTitle>
                <CardDescription>
                  Configurez les paramètres de livraison et de service
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="delivery-time">Temps de livraison</Label>
                    <Input
                      id="delivery-time"
                      value={businessSettings.delivery_time}
                      onChange={(e) => setBusinessSettings(prev => ({ ...prev, delivery_time: e.target.value }))}
                      placeholder="Ex: 30-45 min"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="delivery-fee">Frais de livraison (FG)</Label>
                    <Input
                      id="delivery-fee"
                      type="number"
                      value={businessSettings.delivery_fee}
                      onChange={(e) => setBusinessSettings(prev => ({ ...prev, delivery_fee: parseInt(e.target.value) || 0 }))}
                      placeholder="5000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="delivery-radius">Rayon de livraison (km)</Label>
                    <Input
                      id="delivery-radius"
                      type="number"
                      value={businessSettings.delivery_radius}
                      onChange={(e) => setBusinessSettings(prev => ({ ...prev, delivery_radius: parseInt(e.target.value) || 0 }))}
                      placeholder="10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max-orders">Commandes max par créneau</Label>
                    <Input
                      id="max-orders"
                      type="number"
                      value={businessSettings.max_orders_per_slot}
                      onChange={(e) => setBusinessSettings(prev => ({ ...prev, max_orders_per_slot: parseInt(e.target.value) || 0 }))}
                      placeholder="10"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Statut du business */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-purple-600" />
                  Statut du business
                </CardTitle>
                <CardDescription>
                  Gérez le statut de votre business
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Business actif</Label>
                    <p className="text-sm text-muted-foreground">
                      Activez ou désactivez votre business
                    </p>
                  </div>
                  <Switch
                    checked={businessSettings.is_active}
                    onCheckedChange={(checked) => setBusinessSettings(prev => ({ ...prev, is_active: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Business ouvert</Label>
                    <p className="text-sm text-muted-foreground">
                      Indiquez si votre business est ouvert aux commandes
                    </p>
                  </div>
                  <Switch
                    checked={businessSettings.is_open}
                    onCheckedChange={(checked) => setBusinessSettings(prev => ({ ...prev, is_open: checked }))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-orange-600" />
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
                  <Bell className="h-5 w-5 text-yellow-600" />
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
                  <Shield className="h-5 w-5 text-red-600" />
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

          <TabsContent value="qrcodes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5 text-green-600" />
                  QR Code du Restaurant
                </CardTitle>
                <CardDescription>
                  Générez le QR code de votre restaurant. Les clients peuvent scanner ce code pour accéder directement à votre page avec tous vos services dans l'application mobile.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {businessLoading ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-16 w-16 rounded" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                      </div>
                      <Skeleton className="h-8 w-20" />
                    </div>
                  </div>
                ) : business ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-6 border rounded-lg bg-gradient-to-r from-green-50 to-blue-50">
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded overflow-hidden bg-gray-100 flex items-center justify-center">
                          {business.image ? (
                            <img 
                              src={business.image} 
                              alt={business.name} 
                              className="h-16 w-16 object-cover" 
                            />
                          ) : (
                            <div className="h-16 w-16 bg-gray-200 flex items-center justify-center">
                              <Building2 className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold">{business.name}</h3>
                          <p className="text-sm text-gray-600">
                            {business.description ? business.description.substring(0, 80) + '...' : 'Restaurant'}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-sm font-medium text-green-600">
                              {menuItems?.length || 0} service{(menuItems?.length || 0) > 1 ? 's' : ''}
                            </span>
                            {business.is_active ? (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                Actif
                              </span>
                            ) : (
                              <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                                Inactif
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <QRCodeGenerator
                          businessId={business.id}
                          businessName={business.name}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune information de restaurant</h3>
                    <p className="text-gray-500 mb-4">
                      Configurez votre profil restaurant pour générer un QR code.
                    </p>
                    <Button asChild>
                      <a href="/partner-dashboard/profile">
                        Configurer le profil
                      </a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Instructions d'utilisation */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Comment utiliser les QR codes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Pour les clients :</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-1">1.</span>
                        <span>Scanner le QR code avec l'appareil photo du téléphone</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-1">2.</span>
                        <span>L'application s'ouvre automatiquement</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-1">3.</span>
                        <span>Accéder à votre page restaurant avec tous vos services</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Pour vous :</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>Générez un QR code unique pour votre restaurant</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>Téléchargez et imprimez le QR code</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>Placez-le sur vos tables, menus ou vitrine</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>


    </DashboardLayout>
  );
};

export default PartnerSettings; 