import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout, { userNavItems } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bell, Calendar, Check, Clock, Info, Megaphone, ShoppingBag, Truck, Trash2, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/hooks/use-notifications';
import { Skeleton } from '@/components/ui/skeleton';

// Define notification types
type NotificationType = 'order_status' | 'delivery_update' | 'promotion' | 'system' | 'payment' | 'reservation';
type NotificationPriority = 'high' | 'medium' | 'low';

// Mock notification preferences (à remplacer par des données réelles plus tard)
interface NotificationPreferences {
  email: {
    orders: boolean;
    deliveries: boolean;
    promotions: boolean;
    account: boolean;
    payments: boolean;
    reservations: boolean;
  };
  push: {
    orders: boolean;
    deliveries: boolean;
    promotions: boolean;
    account: boolean;
    payments: boolean;
    reservations: boolean;
  };
  sms: {
    orders: boolean;
    deliveries: boolean;
    promotions: boolean;
    account: boolean;
    payments: boolean;
    reservations: boolean;
  };
}

// Mock notification preferences
const mockPreferences: NotificationPreferences = {
  email: {
    orders: true,
    deliveries: true,
    promotions: false,
    account: true,
    payments: true,
    reservations: true,
  },
  push: {
    orders: true,
    deliveries: true,
    promotions: true,
    account: true,
    payments: true,
    reservations: true,
  },
  sms: {
    orders: false,
    deliveries: true,
    promotions: false,
    account: false,
    payments: true,
    reservations: false,
  },
};

// Helper function to get notification icon
const NotificationIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'order_status':
      return <ShoppingBag className="h-5 w-5" />;
    case 'delivery_update':
      return <Truck className="h-5 w-5" />;
    case 'promotion':
      return <Megaphone className="h-5 w-5" />;
    case 'system':
      return <Info className="h-5 w-5" />;
    case 'payment':
      return <Check className="h-5 w-5" />;
    case 'reservation':
      return <Calendar className="h-5 w-5" />;
    default:
      return <Bell className="h-5 w-5" />;
  }
};

// Helper function to format relative time
const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'À l\'instant';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `Il y a ${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'}`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `Il y a ${diffInHours} ${diffInHours === 1 ? 'heure' : 'heures'}`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `Il y a ${diffInDays} ${diffInDays === 1 ? 'jour' : 'jours'}`;
  }
  
  return format(date, 'dd/MM/yyyy');
};

// Helper function to get priority class
const getPriorityClass = (priority: NotificationPriority) => {
  switch (priority) {
    case 'high':
      return 'text-red-600 border-red-600 bg-red-50';
    case 'medium':
      return 'text-amber-600 border-amber-600 bg-amber-50';
    case 'low':
      return 'text-blue-600 border-blue-600 bg-blue-50';
    default:
      return 'text-gray-600 border-gray-600 bg-gray-50';
  }
};

const UserNotifications = () => {
  const { currentUser } = useAuth();
  const { 
    notifications, 
    isLoading, 
    isUpdating, 
    error, 
    unreadCount,
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    deleteReadNotifications 
  } = useNotifications();
  const [preferences, setPreferences] = useState<NotificationPreferences>(mockPreferences);
  const [activeTab, setActiveTab] = useState('all');

  // Filter notifications based on active tab
  const filteredNotifications = notifications.filter((notification) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !notification.is_read;
    return notification.type === activeTab;
  });

  // Group notifications by date
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);
  
  const todayNotifications = filteredNotifications.filter(n => new Date(n.created_at) >= today);
  const yesterdayNotifications = filteredNotifications.filter(n => {
    const date = new Date(n.created_at);
    return date >= yesterday && date < today;
  });
  const lastWeekNotifications = filteredNotifications.filter(n => {
    const date = new Date(n.created_at);
    return date >= lastWeek && date < yesterday;
  });
  const olderNotifications = filteredNotifications.filter(n => new Date(n.created_at) < lastWeek);

  // Update preference
  const updatePreference = (channel: keyof NotificationPreferences, type: keyof NotificationPreferences['email'], value: boolean) => {
    setPreferences({
      ...preferences,
      [channel]: {
        ...preferences[channel],
        [type]: value,
      },
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout navItems={userNavItems} title="Notifications">
        <div className="space-y-6">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout navItems={userNavItems} title="Notifications">
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600">Erreur</h2>
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Réessayer
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={userNavItems} title="Notifications">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Paramètres de notifications</h2>
          <p className="text-gray-500">Gérez vos préférences de notifications et votre historique.</p>
        </div>

        <Tabs defaultValue="notifications" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="notifications">Historique des notifications</TabsTrigger>
            <TabsTrigger value="preferences">Préférences de notifications</TabsTrigger>
          </TabsList>
          
          <TabsContent value="notifications" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <div className="flex space-x-1">
                <Button 
                  variant={activeTab === 'all' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setActiveTab('all')}
                >
                  Toutes
                </Button>
                <Button 
                  variant={activeTab === 'unread' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setActiveTab('unread')}
                  className="relative"
                >
                  Non lues
                  {unreadCount > 0 && (
                    <Badge className="ml-1 bg-primary-600">{unreadCount}</Badge>
                  )}
                </Button>
                <Button 
                  variant={activeTab === 'order_status' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setActiveTab('order_status')}
                >
                  Commandes
                </Button>
                <Button 
                  variant={activeTab === 'delivery_update' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setActiveTab('delivery_update')}
                >
                  Livraisons
                </Button>
                <Button 
                  variant={activeTab === 'reservation' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setActiveTab('reservation')}
                >
                  Réservations
                </Button>
                <Button 
                  variant={activeTab === 'promotion' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setActiveTab('promotion')}
                >
                  Promotions
                </Button>
              </div>
              
              <div className="flex space-x-2">
                {unreadCount > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={markAllAsRead}
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Check className="h-4 w-4 mr-2" />
                    )}
                    Tout marquer comme lu
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={deleteReadNotifications}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Supprimer les lues
                </Button>
              </div>
            </div>

            {filteredNotifications.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Aucune notification</h3>
                  <p className="text-center text-muted-foreground">
                    Vous n'avez aucune {activeTab !== 'all' ? activeTab + ' ' : ''}notification
                    {activeTab === 'unread' ? ' non lue' : ''}.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Today's notifications */}
                {todayNotifications.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Aujourd'hui
                    </h3>
                    <Card>
                      <CardContent className="p-0">
                        <div className="divide-y">
                          {todayNotifications.map((notification) => (
                            <NotificationItem 
                              key={notification.id} 
                              notification={notification} 
                              onMarkAsRead={markAsRead}
                              onDelete={deleteNotification}
                              isUpdating={isUpdating}
                            />
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Yesterday's notifications */}
                {yesterdayNotifications.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Hier
                    </h3>
                    <Card>
                      <CardContent className="p-0">
                        <div className="divide-y">
                          {yesterdayNotifications.map((notification) => (
                            <NotificationItem 
                              key={notification.id} 
                              notification={notification} 
                              onMarkAsRead={markAsRead}
                              onDelete={deleteNotification}
                              isUpdating={isUpdating}
                            />
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Last week's notifications */}
                {lastWeekNotifications.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Cette semaine
                    </h3>
                    <Card>
                      <CardContent className="p-0">
                        <div className="divide-y">
                          {lastWeekNotifications.map((notification) => (
                            <NotificationItem 
                              key={notification.id} 
                              notification={notification} 
                              onMarkAsRead={markAsRead}
                              onDelete={deleteNotification}
                              isUpdating={isUpdating}
                            />
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Older notifications */}
                {olderNotifications.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Plus anciennes
                    </h3>
                    <Card>
                      <CardContent className="p-0">
                        <div className="divide-y">
                          {olderNotifications.map((notification) => (
                            <NotificationItem 
                              key={notification.id} 
                              notification={notification} 
                              onMarkAsRead={markAsRead}
                              onDelete={deleteNotification}
                              isUpdating={isUpdating}
                            />
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="preferences" className="space-y-6 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Préférences de notifications</CardTitle>
                <CardDescription>
                  Choisissez comment vous souhaitez recevoir vos notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Email notifications */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Notifications par email</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email-orders">Commandes</Label>
                      <Switch 
                        id="email-orders"
                        checked={preferences.email.orders} 
                        onCheckedChange={(checked) => updatePreference('email', 'orders', checked)} 
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email-deliveries">Livraisons</Label>
                      <Switch 
                        id="email-deliveries"
                        checked={preferences.email.deliveries} 
                        onCheckedChange={(checked) => updatePreference('email', 'deliveries', checked)} 
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email-reservations">Réservations</Label>
                      <Switch 
                        id="email-reservations"
                        checked={preferences.email.reservations} 
                        onCheckedChange={(checked) => updatePreference('email', 'reservations', checked)} 
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email-promotions">Promotions</Label>
                      <Switch 
                        id="email-promotions"
                        checked={preferences.email.promotions} 
                        onCheckedChange={(checked) => updatePreference('email', 'promotions', checked)} 
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email-account">Compte</Label>
                      <Switch 
                        id="email-account"
                        checked={preferences.email.account} 
                        onCheckedChange={(checked) => updatePreference('email', 'account', checked)} 
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email-payments">Paiements</Label>
                      <Switch 
                        id="email-payments"
                        checked={preferences.email.payments} 
                        onCheckedChange={(checked) => updatePreference('email', 'payments', checked)} 
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Push notifications */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Notifications push</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="push-orders">Commandes</Label>
                      <Switch 
                        id="push-orders"
                        checked={preferences.push.orders} 
                        onCheckedChange={(checked) => updatePreference('push', 'orders', checked)} 
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="push-deliveries">Livraisons</Label>
                      <Switch 
                        id="push-deliveries"
                        checked={preferences.push.deliveries} 
                        onCheckedChange={(checked) => updatePreference('push', 'deliveries', checked)} 
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="push-reservations">Réservations</Label>
                      <Switch 
                        id="push-reservations"
                        checked={preferences.push.reservations} 
                        onCheckedChange={(checked) => updatePreference('push', 'reservations', checked)} 
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="push-promotions">Promotions</Label>
                      <Switch 
                        id="push-promotions"
                        checked={preferences.push.promotions} 
                        onCheckedChange={(checked) => updatePreference('push', 'promotions', checked)} 
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="push-account">Compte</Label>
                      <Switch 
                        id="push-account"
                        checked={preferences.push.account} 
                        onCheckedChange={(checked) => updatePreference('push', 'account', checked)} 
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="push-payments">Paiements</Label>
                      <Switch 
                        id="push-payments"
                        checked={preferences.push.payments} 
                        onCheckedChange={(checked) => updatePreference('push', 'payments', checked)} 
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* SMS notifications */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Notifications SMS</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="sms-orders">Commandes</Label>
                      <Switch 
                        id="sms-orders"
                        checked={preferences.sms.orders} 
                        onCheckedChange={(checked) => updatePreference('sms', 'orders', checked)} 
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="sms-deliveries">Livraisons</Label>
                      <Switch 
                        id="sms-deliveries"
                        checked={preferences.sms.deliveries} 
                        onCheckedChange={(checked) => updatePreference('sms', 'deliveries', checked)} 
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="sms-reservations">Réservations</Label>
                      <Switch 
                        id="sms-reservations"
                        checked={preferences.sms.reservations} 
                        onCheckedChange={(checked) => updatePreference('sms', 'reservations', checked)} 
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="sms-promotions">Promotions</Label>
                      <Switch 
                        id="sms-promotions"
                        checked={preferences.sms.promotions} 
                        onCheckedChange={(checked) => updatePreference('sms', 'promotions', checked)} 
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="sms-account">Compte</Label>
                      <Switch 
                        id="sms-account"
                        checked={preferences.sms.account} 
                        onCheckedChange={(checked) => updatePreference('sms', 'account', checked)} 
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="sms-payments">Paiements</Label>
                      <Switch 
                        id="sms-payments"
                        checked={preferences.sms.payments} 
                        onCheckedChange={(checked) => updatePreference('sms', 'payments', checked)} 
                      />
                    </div>
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

const NotificationItem = ({ 
  notification, 
  onMarkAsRead,
  onDelete,
  isUpdating,
}: { 
  notification: any;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  isUpdating: boolean;
}) => {
  return (
    <div className={cn(
      "flex items-start space-x-4 p-4 hover:bg-gray-50 transition-colors",
      !notification.is_read && "bg-blue-50"
    )}>
      <div className="flex-shrink-0">
        <div className={cn(
          "p-2 rounded-full",
          getPriorityClass(notification.priority)
        )}>
          <NotificationIcon type={notification.type} />
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="text-sm font-medium text-gray-900">
              {notification.title}
            </h4>
            <p className="text-sm text-gray-600 mt-1">
              {notification.message}
            </p>
            <div className="flex items-center mt-2 text-xs text-gray-500">
              <Clock className="h-3 w-3 mr-1" />
              {formatRelativeTime(notification.created_at)}
            </div>
          </div>
          
          <div className="flex items-center space-x-2 ml-4">
            {!notification.is_read && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onMarkAsRead(notification.id)}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(notification.id)}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserNotifications; 