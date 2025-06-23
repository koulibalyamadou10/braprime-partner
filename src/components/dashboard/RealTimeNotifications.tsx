import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bell, 
  ShoppingBag, 
  Star, 
  DollarSign, 
  AlertCircle,
  CheckCircle,
  Clock,
  X,
  RefreshCw
} from 'lucide-react';
import { useNotifications } from '@/hooks/use-dashboard';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface RealTimeNotificationsProps {
  type: 'customer' | 'partner';
  maxNotifications?: number;
}

const RealTimeNotifications: React.FC<RealTimeNotificationsProps> = ({ 
  type, 
  maxNotifications = 10 
}) => {
  const { data: notifications, isLoading, error, refetch } = useNotifications(type);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [unreadCount, setUnreadCount] = useState(0);

  // Mise à jour automatique toutes les 15 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
      setLastUpdate(new Date());
    }, 15000);

    return () => clearInterval(interval);
  }, [refetch]);

  // Calculer le nombre de notifications non lues
  useEffect(() => {
    if (notifications) {
      setUnreadCount(notifications.filter(n => !n.read).length);
    }
  }, [notifications]);

  const getNotificationIcon = (notificationType: string) => {
    switch (notificationType) {
      case 'order':
        return <ShoppingBag className="h-5 w-5 text-blue-500" />;
      case 'review':
        return <Star className="h-5 w-5 text-yellow-500" />;
      case 'payment':
        return <DollarSign className="h-5 w-5 text-green-500" />;
      case 'system':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (notificationType: string) => {
    switch (notificationType) {
      case 'order':
        return 'border-l-blue-500 bg-blue-50';
      case 'review':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'payment':
        return 'border-l-green-500 bg-green-50';
      case 'system':
        return 'border-l-red-500 bg-red-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `Il y a ${Math.floor(diffInMinutes / 60)}h`;
    return format(date, 'dd/MM HH:mm', { locale: fr });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6 text-center">
          <div className="text-red-600 mb-4">
            <AlertCircle className="h-12 w-12 mx-auto mb-2" />
            <h3 className="text-lg font-semibold">Erreur de chargement</h3>
            <p className="text-sm">Impossible de charger les notifications</p>
          </div>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Réessayer
          </Button>
        </CardContent>
      </Card>
    );
  }

  const displayNotifications = notifications?.slice(0, maxNotifications) || [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {lastUpdate.toLocaleTimeString('fr-FR')}
            </Badge>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                refetch();
                setLastUpdate(new Date());
              }}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {displayNotifications.length > 0 ? (
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {displayNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border-l-4 transition-all hover:shadow-md ${
                    getNotificationColor(notification.type)
                  } ${!notification.read ? 'ring-2 ring-blue-200' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTimeAgo(notification.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => {
                          // Marquer comme lu (à implémenter)
                          console.log('Marquer comme lu:', notification.id);
                        }}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-8">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucune notification</h3>
            <p className="text-muted-foreground">
              Vous êtes à jour !
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RealTimeNotifications; 