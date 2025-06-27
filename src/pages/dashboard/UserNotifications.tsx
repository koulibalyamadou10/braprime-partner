import React, { useState, useEffect } from 'react';
import DashboardLayout, { userNavItems } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Bell, 
  Mail, 
  Smartphone, 
  Settings, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  RefreshCw,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'promo' | 'system' | 'delivery';
  is_read: boolean;
  created_at: string;
  action_url?: string;
}

interface NotificationSettings {
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
  order_updates: boolean;
  promotions: boolean;
  delivery_updates: boolean;
  system_notifications: boolean;
  marketing_emails: boolean;
}

const UserNotifications: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    email_notifications: true,
    push_notifications: true,
    sms_notifications: false,
    order_updates: true,
    promotions: true,
    delivery_updates: true,
    system_notifications: true,
    marketing_emails: false
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      // Simuler le chargement des données
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Données de test
      const mockNotifications: Notification[] = [
        {
          id: '1',
          title: 'Commande confirmée',
          message: 'Votre commande #12345 a été confirmée et est en préparation.',
          type: 'order',
          is_read: false,
          created_at: '2024-01-15T10:30:00Z',
          action_url: '/orders/12345'
        },
        {
          id: '2',
          title: 'Livraison en cours',
          message: 'Votre commande #12344 est en cours de livraison. Livreur: Mamadou Diallo',
          type: 'delivery',
          is_read: false,
          created_at: '2024-01-15T09:15:00Z',
          action_url: '/tracking/12344'
        },
        {
          id: '3',
          title: 'Promotion spéciale',
          message: '20% de réduction sur tous les restaurants ce weekend !',
          type: 'promo',
          is_read: true,
          created_at: '2024-01-14T16:00:00Z'
        },
        {
          id: '4',
          title: 'Maintenance prévue',
          message: 'Le service sera temporairement indisponible le 20 janvier de 2h à 4h.',
          type: 'system',
          is_read: true,
          created_at: '2024-01-13T14:30:00Z'
        }
      ];

      setNotifications(mockNotifications);
    } catch (error) {
      toast.error('Erreur lors du chargement des notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      setNotifications(prev => prev.map(notif => 
        notif.id === notificationId ? { ...notif, is_read: true } : notif
      ));
      toast.success('Notification marquée comme lue');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications(prev => prev.map(notif => ({ ...notif, is_read: true })));
      toast.success('Toutes les notifications marquées comme lues');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      toast.success('Notification supprimée');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const saveSettings = async () => {
    try {
      // Simuler la sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Paramètres sauvegardés');
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'order':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Commande</Badge>;
      case 'delivery':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Livraison</Badge>;
      case 'promo':
        return <Badge variant="outline" className="bg-orange-100 text-orange-800">Promotion</Badge>;
      case 'system':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Système</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !notification.is_read;
    return notification.type === activeTab;
  });

  if (loading) {
    return (
      <DashboardLayout navItems={userNavItems}>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={userNavItems}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Notifications</h1>
            <p className="text-muted-foreground">
              Gérez vos notifications et préférences
            </p>
          </div>
          <div className="flex space-x-2">
            <Button onClick={markAllAsRead} variant="outline">
              <CheckCircle className="h-4 w-4 mr-2" />
              Tout marquer comme lu
            </Button>
            <Button onClick={loadNotifications} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">Toutes</TabsTrigger>
            <TabsTrigger value="unread">Non lues</TabsTrigger>
            <TabsTrigger value="order">Commandes</TabsTrigger>
            <TabsTrigger value="delivery">Livraisons</TabsTrigger>
            <TabsTrigger value="promo">Promotions</TabsTrigger>
            <TabsTrigger value="system">Système</TabsTrigger>
            <TabsTrigger value="settings">Paramètres</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {filteredNotifications.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Aucune notification</p>
                </CardContent>
              </Card>
            ) : (
              filteredNotifications.map((notification) => (
                <Card key={notification.id} className={!notification.is_read ? 'border-blue-200 bg-blue-50' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-medium">{notification.title}</h3>
                          {getTypeBadge(notification.type)}
                          {!notification.is_read && (
                            <Badge variant="secondary" className="bg-blue-600 text-white">Nouveau</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(notification.created_at).toLocaleString('fr-FR')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {!notification.is_read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNotification(notification.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="unread" className="space-y-4">
            {filteredNotifications.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CheckCircle className="h-12 w-12 text-green-600 mb-4" />
                  <p className="text-muted-foreground">Toutes les notifications ont été lues</p>
                </CardContent>
              </Card>
            ) : (
              filteredNotifications.map((notification) => (
                <Card key={notification.id} className="border-blue-200 bg-blue-50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-medium">{notification.title}</h3>
                          {getTypeBadge(notification.type)}
                          <Badge variant="secondary" className="bg-blue-600 text-white">Nouveau</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(notification.created_at).toLocaleString('fr-FR')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNotification(notification.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="order" className="space-y-4">
            {filteredNotifications.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Aucune notification de commande</p>
                </CardContent>
              </Card>
            ) : (
              filteredNotifications.map((notification) => (
                <Card key={notification.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-medium">{notification.title}</h3>
                          {getTypeBadge(notification.type)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(notification.created_at).toLocaleString('fr-FR')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNotification(notification.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="delivery" className="space-y-4">
            {filteredNotifications.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Aucune notification de livraison</p>
                </CardContent>
              </Card>
            ) : (
              filteredNotifications.map((notification) => (
                <Card key={notification.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-medium">{notification.title}</h3>
                          {getTypeBadge(notification.type)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(notification.created_at).toLocaleString('fr-FR')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNotification(notification.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="promo" className="space-y-4">
            {filteredNotifications.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Aucune notification de promotion</p>
                </CardContent>
              </Card>
            ) : (
              filteredNotifications.map((notification) => (
                <Card key={notification.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-medium">{notification.title}</h3>
                          {getTypeBadge(notification.type)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(notification.created_at).toLocaleString('fr-FR')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNotification(notification.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="system" className="space-y-4">
            {filteredNotifications.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Aucune notification système</p>
                </CardContent>
              </Card>
            ) : (
              filteredNotifications.map((notification) => (
                <Card key={notification.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-medium">{notification.title}</h3>
                          {getTypeBadge(notification.type)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(notification.created_at).toLocaleString('fr-FR')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNotification(notification.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Paramètres de notification
                </CardTitle>
                <CardDescription>
                  Configurez comment vous recevez les notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Canaux de notification</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Notifications par email</Label>
                        <p className="text-sm text-muted-foreground">
                          Recevoir les notifications par email
                        </p>
                      </div>
                      <Switch
                        checked={settings.email_notifications}
                        onCheckedChange={(checked) => setSettings(prev => ({ ...prev, email_notifications: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Notifications push</Label>
                        <p className="text-sm text-muted-foreground">
                          Recevoir les notifications dans l'application
                        </p>
                      </div>
                      <Switch
                        checked={settings.push_notifications}
                        onCheckedChange={(checked) => setSettings(prev => ({ ...prev, push_notifications: checked }))}
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
                        checked={settings.sms_notifications}
                        onCheckedChange={(checked) => setSettings(prev => ({ ...prev, sms_notifications: checked }))}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Types de notification</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Mises à jour de commande</Label>
                        <p className="text-sm text-muted-foreground">
                          Notifier les changements de statut de commande
                        </p>
                      </div>
                      <Switch
                        checked={settings.order_updates}
                        onCheckedChange={(checked) => setSettings(prev => ({ ...prev, order_updates: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Mises à jour de livraison</Label>
                        <p className="text-sm text-muted-foreground">
                          Notifier les mises à jour de livraison
                        </p>
                      </div>
                      <Switch
                        checked={settings.delivery_updates}
                        onCheckedChange={(checked) => setSettings(prev => ({ ...prev, delivery_updates: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Promotions et offres</Label>
                        <p className="text-sm text-muted-foreground">
                          Recevoir les promotions et offres spéciales
                        </p>
                      </div>
                      <Switch
                        checked={settings.promotions}
                        onCheckedChange={(checked) => setSettings(prev => ({ ...prev, promotions: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Notifications système</Label>
                        <p className="text-sm text-muted-foreground">
                          Notifications importantes du système
                        </p>
                      </div>
                      <Switch
                        checked={settings.system_notifications}
                        onCheckedChange={(checked) => setSettings(prev => ({ ...prev, system_notifications: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Emails marketing</Label>
                        <p className="text-sm text-muted-foreground">
                          Recevoir les emails marketing
                        </p>
                      </div>
                      <Switch
                        checked={settings.marketing_emails}
                        onCheckedChange={(checked) => setSettings(prev => ({ ...prev, marketing_emails: checked }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={saveSettings}>
                    <Settings className="h-4 w-4 mr-2" />
                    Sauvegarder les paramètres
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

export default UserNotifications; 