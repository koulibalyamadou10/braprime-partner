import React, { useState, useEffect } from 'react';
import DashboardLayout, { partnerNavItems } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Bell, 
  Shield, 
  CreditCard, 
  Globe, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  Building2,
  Save,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Key,
  Users,
  Calendar,
  DollarSign
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

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
                  Facturation et paiements
                </CardTitle>
                <CardDescription>
                  Gérez vos informations de facturation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium">Plan actuel : Gratuit</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Vous utilisez actuellement le plan gratuit. Passez à un plan payant pour accéder à plus de fonctionnalités.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Gratuit</CardTitle>
                      <CardDescription>Plan de base</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold mb-4">0 GNF</div>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          Jusqu'à 50 commandes/mois
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          Support par email
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          Tableau de bord de base
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Pro</CardTitle>
                      <CardDescription>Plan recommandé</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold mb-4">50,000 GNF</div>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          Commandes illimitées
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          Support prioritaire
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          Analytics avancés
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          Gestion des livreurs
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Enterprise</CardTitle>
                      <CardDescription>Pour les grandes entreprises</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold mb-4">150,000 GNF</div>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          Tout du plan Pro
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          Support dédié
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          API personnalisée
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          Formation sur mesure
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex justify-center">
                  <Button size="lg">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Mettre à niveau le plan
                  </Button>
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