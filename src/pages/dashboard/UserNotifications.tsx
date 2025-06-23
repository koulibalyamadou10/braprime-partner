import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout, { userNavItems } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bell, Calendar, Check, Clock, Info, Megaphone, ShoppingBag, Truck } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

// Define notification types
type NotificationType = 'order' | 'delivery' | 'promotion' | 'account' | 'payment';
type NotificationPriority = 'high' | 'medium' | 'low';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  priority: NotificationPriority;
}

// Mock notification preferences
interface NotificationPreferences {
  email: {
    orders: boolean;
    deliveries: boolean;
    promotions: boolean;
    account: boolean;
    payments: boolean;
  };
  push: {
    orders: boolean;
    deliveries: boolean;
    promotions: boolean;
    account: boolean;
    payments: boolean;
  };
  sms: {
    orders: boolean;
    deliveries: boolean;
    promotions: boolean;
    account: boolean;
    payments: boolean;
  };
}

// Mock notifications data
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'order',
    title: 'Order Confirmed',
    message: 'Your order #ORD-123456 has been confirmed and is being prepared.',
    timestamp: new Date(2023, 5, 15, 14, 30), // June 15, 2023, 2:30 PM
    isRead: true,
    priority: 'medium',
  },
  {
    id: '2',
    type: 'delivery',
    title: 'Delivery on the Way',
    message: 'Your order #ORD-123456 is out for delivery and will arrive in 15-30 minutes.',
    timestamp: new Date(2023, 5, 15, 16, 45), // June 15, 2023, 4:45 PM
    isRead: true,
    priority: 'high',
  },
  {
    id: '3',
    type: 'delivery',
    title: 'Delivery Completed',
    message: 'Your order #ORD-123456 has been delivered. Enjoy your meal!',
    timestamp: new Date(2023, 5, 15, 17, 20), // June 15, 2023, 5:20 PM
    isRead: true,
    priority: 'medium',
  },
  {
    id: '4',
    type: 'promotion',
    title: 'Weekend Special: 20% Off',
    message: 'Use code WEEKEND20 for 20% off your order this weekend!',
    timestamp: new Date(2023, 5, 16, 9, 0), // June 16, 2023, 9:00 AM
    isRead: false,
    priority: 'low',
  },
  {
    id: '5',
    type: 'account',
    title: 'Profile Updated',
    message: 'Your profile information has been successfully updated.',
    timestamp: new Date(2023, 5, 16, 11, 15), // June 16, 2023, 11:15 AM
    isRead: false,
    priority: 'low',
  },
  {
    id: '6',
    type: 'order',
    title: 'New Order Placed',
    message: 'Your order #ORD-123457 has been placed successfully. Total: $49.97',
    timestamp: new Date(2023, 5, 17, 13, 10), // June 17, 2023, 1:10 PM
    isRead: false,
    priority: 'medium',
  },
  {
    id: '7',
    type: 'payment',
    title: 'Payment Successful',
    message: 'Your payment of $49.97 for order #ORD-123457 was successful.',
    timestamp: new Date(2023, 5, 17, 13, 12), // June 17, 2023, 1:12 PM
    isRead: false,
    priority: 'medium',
  },
  {
    id: '8',
    type: 'promotion',
    title: 'New Restaurant Added',
    message: 'Check out the newest addition to our platform: Senegalese Delights!',
    timestamp: new Date(2023, 5, 18, 10, 0), // June 18, 2023, 10:00 AM
    isRead: false,
    priority: 'low',
  },
];

// Mock notification preferences
const mockPreferences: NotificationPreferences = {
  email: {
    orders: true,
    deliveries: true,
    promotions: false,
    account: true,
    payments: true,
  },
  push: {
    orders: true,
    deliveries: true,
    promotions: true,
    account: true,
    payments: true,
  },
  sms: {
    orders: false,
    deliveries: true,
    promotions: false,
    account: false,
    payments: true,
  },
};

// Helper function to get notification icon
const NotificationIcon = ({ type }: { type: NotificationType }) => {
  switch (type) {
    case 'order':
      return <ShoppingBag className="h-5 w-5" />;
    case 'delivery':
      return <Truck className="h-5 w-5" />;
    case 'promotion':
      return <Megaphone className="h-5 w-5" />;
    case 'account':
      return <Info className="h-5 w-5" />;
    case 'payment':
      return <Check className="h-5 w-5" />;
    default:
      return <Bell className="h-5 w-5" />;
  }
};

// Helper function to format relative time
const formatRelativeTime = (date: Date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
  }
  
  return format(date, 'MMM d, yyyy');
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
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [preferences, setPreferences] = useState<NotificationPreferences>(mockPreferences);
  const [activeTab, setActiveTab] = useState('all');

  // Filter notifications based on active tab
  const filteredNotifications = notifications.filter((notification) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !notification.isRead;
    return notification.type === activeTab;
  });

  // Group notifications by date
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);
  
  const todayNotifications = filteredNotifications.filter(n => n.timestamp >= today);
  const yesterdayNotifications = filteredNotifications.filter(n => n.timestamp >= yesterday && n.timestamp < today);
  const lastWeekNotifications = filteredNotifications.filter(n => n.timestamp >= lastWeek && n.timestamp < yesterday);
  const olderNotifications = filteredNotifications.filter(n => n.timestamp < lastWeek);

  // Mark notification as read
  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ));
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

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

  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <DashboardLayout navItems={userNavItems} title="Notifications">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Notification Settings</h2>
          <p className="text-gray-500">Manage your notification preferences and history.</p>
        </div>

        <Tabs defaultValue="notifications" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="notifications">Notifications History</TabsTrigger>
            <TabsTrigger value="preferences">Notification Preferences</TabsTrigger>
          </TabsList>
          
          <TabsContent value="notifications" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <div className="flex space-x-1">
                <Button 
                  variant={activeTab === 'all' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setActiveTab('all')}
                >
                  All
                </Button>
                <Button 
                  variant={activeTab === 'unread' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setActiveTab('unread')}
                  className="relative"
                >
                  Unread
                  {unreadCount > 0 && (
                    <Badge className="ml-1 bg-primary-600">{unreadCount}</Badge>
                  )}
                </Button>
                <Button 
                  variant={activeTab === 'order' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setActiveTab('order')}
                >
                  Orders
                </Button>
                <Button 
                  variant={activeTab === 'delivery' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setActiveTab('delivery')}
                >
                  Deliveries
                </Button>
                <Button 
                  variant={activeTab === 'promotion' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setActiveTab('promotion')}
                >
                  Promotions
                </Button>
              </div>
              
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                  Mark all as read
                </Button>
              )}
            </div>

            {filteredNotifications.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No notifications</h3>
                  <p className="text-center text-muted-foreground">
                    You don't have any {activeTab !== 'all' ? activeTab + ' ' : ''}notifications
                    {activeTab === 'unread' ? ' that are unread' : ''}.
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
                      Today
                    </h3>
                    <Card>
                      <CardContent className="p-0">
                        <div className="divide-y">
                          {todayNotifications.map((notification) => (
                            <NotificationItem 
                              key={notification.id} 
                              notification={notification} 
                              onMarkAsRead={markAsRead} 
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
                      Yesterday
                    </h3>
                    <Card>
                      <CardContent className="p-0">
                        <div className="divide-y">
                          {yesterdayNotifications.map((notification) => (
                            <NotificationItem 
                              key={notification.id} 
                              notification={notification} 
                              onMarkAsRead={markAsRead} 
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
                      Last Week
                    </h3>
                    <Card>
                      <CardContent className="p-0">
                        <div className="divide-y">
                          {lastWeekNotifications.map((notification) => (
                            <NotificationItem 
                              key={notification.id} 
                              notification={notification} 
                              onMarkAsRead={markAsRead} 
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
                      Older
                    </h3>
                    <Card>
                      <CardContent className="p-0">
                        <div className="divide-y">
                          {olderNotifications.map((notification) => (
                            <NotificationItem 
                              key={notification.id} 
                              notification={notification} 
                              onMarkAsRead={markAsRead} 
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
                <CardTitle>Email Notifications</CardTitle>
                <CardDescription>
                  Configure which notifications you receive via email.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ShoppingBag className="h-4 w-4 text-gray-500" />
                    <Label htmlFor="email-orders">Order updates</Label>
                  </div>
                  <Switch 
                    id="email-orders"
                    checked={preferences.email.orders}
                    onCheckedChange={(checked) => updatePreference('email', 'orders', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Truck className="h-4 w-4 text-gray-500" />
                    <Label htmlFor="email-deliveries">Delivery notifications</Label>
                  </div>
                  <Switch 
                    id="email-deliveries"
                    checked={preferences.email.deliveries}
                    onCheckedChange={(checked) => updatePreference('email', 'deliveries', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Megaphone className="h-4 w-4 text-gray-500" />
                    <Label htmlFor="email-promotions">Promotions and offers</Label>
                  </div>
                  <Switch 
                    id="email-promotions"
                    checked={preferences.email.promotions}
                    onCheckedChange={(checked) => updatePreference('email', 'promotions', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Info className="h-4 w-4 text-gray-500" />
                    <Label htmlFor="email-account">Account updates</Label>
                  </div>
                  <Switch 
                    id="email-account"
                    checked={preferences.email.account}
                    onCheckedChange={(checked) => updatePreference('email', 'account', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-gray-500" />
                    <Label htmlFor="email-payments">Payment confirmations</Label>
                  </div>
                  <Switch 
                    id="email-payments"
                    checked={preferences.email.payments}
                    onCheckedChange={(checked) => updatePreference('email', 'payments', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Push Notifications</CardTitle>
                <CardDescription>
                  Configure which notifications you receive on your device.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ShoppingBag className="h-4 w-4 text-gray-500" />
                    <Label htmlFor="push-orders">Order updates</Label>
                  </div>
                  <Switch 
                    id="push-orders"
                    checked={preferences.push.orders}
                    onCheckedChange={(checked) => updatePreference('push', 'orders', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Truck className="h-4 w-4 text-gray-500" />
                    <Label htmlFor="push-deliveries">Delivery notifications</Label>
                  </div>
                  <Switch 
                    id="push-deliveries"
                    checked={preferences.push.deliveries}
                    onCheckedChange={(checked) => updatePreference('push', 'deliveries', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Megaphone className="h-4 w-4 text-gray-500" />
                    <Label htmlFor="push-promotions">Promotions and offers</Label>
                  </div>
                  <Switch 
                    id="push-promotions"
                    checked={preferences.push.promotions}
                    onCheckedChange={(checked) => updatePreference('push', 'promotions', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Info className="h-4 w-4 text-gray-500" />
                    <Label htmlFor="push-account">Account updates</Label>
                  </div>
                  <Switch 
                    id="push-account"
                    checked={preferences.push.account}
                    onCheckedChange={(checked) => updatePreference('push', 'account', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-gray-500" />
                    <Label htmlFor="push-payments">Payment confirmations</Label>
                  </div>
                  <Switch 
                    id="push-payments"
                    checked={preferences.push.payments}
                    onCheckedChange={(checked) => updatePreference('push', 'payments', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SMS Notifications</CardTitle>
                <CardDescription>
                  Configure which notifications you receive via SMS.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ShoppingBag className="h-4 w-4 text-gray-500" />
                    <Label htmlFor="sms-orders">Order updates</Label>
                  </div>
                  <Switch 
                    id="sms-orders"
                    checked={preferences.sms.orders}
                    onCheckedChange={(checked) => updatePreference('sms', 'orders', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Truck className="h-4 w-4 text-gray-500" />
                    <Label htmlFor="sms-deliveries">Delivery notifications</Label>
                  </div>
                  <Switch 
                    id="sms-deliveries"
                    checked={preferences.sms.deliveries}
                    onCheckedChange={(checked) => updatePreference('sms', 'deliveries', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Megaphone className="h-4 w-4 text-gray-500" />
                    <Label htmlFor="sms-promotions">Promotions and offers</Label>
                  </div>
                  <Switch 
                    id="sms-promotions"
                    checked={preferences.sms.promotions}
                    onCheckedChange={(checked) => updatePreference('sms', 'promotions', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Info className="h-4 w-4 text-gray-500" />
                    <Label htmlFor="sms-account">Account updates</Label>
                  </div>
                  <Switch 
                    id="sms-account"
                    checked={preferences.sms.account}
                    onCheckedChange={(checked) => updatePreference('sms', 'account', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-gray-500" />
                    <Label htmlFor="sms-payments">Payment confirmations</Label>
                  </div>
                  <Switch 
                    id="sms-payments"
                    checked={preferences.sms.payments}
                    onCheckedChange={(checked) => updatePreference('sms', 'payments', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

// Notification Item Component
const NotificationItem = ({ 
  notification, 
  onMarkAsRead,
}: { 
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}) => {
  return (
    <div 
      className={cn(
        "p-4 hover:bg-gray-50 transition-colors",
        !notification.isRead && "bg-blue-50/50"
      )}
      onClick={() => !notification.isRead && onMarkAsRead(notification.id)}
    >
      <div className="flex items-start space-x-4">
        <div className={cn(
          "flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center",
          !notification.isRead && "bg-primary-100"
        )}>
          <div className={cn(
            "text-gray-600",
            !notification.isRead && "text-primary-600"
          )}>
            <NotificationIcon type={notification.type} />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className={cn(
              "text-sm font-medium",
              !notification.isRead && "font-semibold"
            )}>
              {notification.title}
            </p>
            <div className="flex items-center">
              <span className={cn(
                "text-xs px-2 py-0.5 ml-2 rounded-full border",
                getPriorityClass(notification.priority)
              )}>
                {notification.priority}
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
          <div className="flex items-center mt-1">
            <Clock className="h-3 w-3 text-gray-400 mr-1" />
            <p className="text-xs text-gray-400">
              {formatRelativeTime(notification.timestamp)}
            </p>
          </div>
        </div>
      </div>
      {!notification.isRead && (
        <div className="flex justify-end mt-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              onMarkAsRead(notification.id);
            }}
          >
            Mark as read
          </Button>
        </div>
      )}
    </div>
  );
};

export default UserNotifications; 