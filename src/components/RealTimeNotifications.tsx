import { useState, useEffect } from 'react';
import { Bell, Check, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useNotifications } from '@/hooks/use-notifications';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

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

// Helper function to get notification icon
const NotificationIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'order_status':
      return <span className="text-blue-600">📦</span>;
    case 'delivery_update':
      return <span className="text-green-600">🚚</span>;
    case 'promotion':
      return <span className="text-yellow-600">🎉</span>;
    case 'system':
      return <span className="text-gray-600">ℹ️</span>;
    case 'payment':
      return <span className="text-green-600">💳</span>;
    case 'reservation':
      return <span className="text-purple-600">📅</span>;
    default:
      return <span className="text-gray-600">🔔</span>;
  }
};

// Helper function to get priority class
const getPriorityClass = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'border-l-red-500 bg-red-50';
    case 'medium':
      return 'border-l-amber-500 bg-amber-50';
    case 'low':
      return 'border-l-blue-500 bg-blue-50';
    default:
      return 'border-l-gray-500 bg-gray-50';
  }
};

export const RealTimeNotifications = () => {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    deleteNotification,
    isUpdating 
  } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  // Fermer le popover après une action
  const handleAction = async (action: () => Promise<void>) => {
    await action();
    // Ne pas fermer automatiquement pour permettre à l'utilisateur de voir le résultat
  };

  // Notifications non lues uniquement
  const unreadNotifications = notifications.filter(n => !n.is_read).slice(0, 10);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              variant="destructive"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </div>
        
        <ScrollArea className="h-80">
          {unreadNotifications.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Aucune notification</p>
            </div>
          ) : (
            <div className="divide-y">
              {unreadNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-4 hover:bg-gray-50 transition-colors border-l-4",
                    getPriorityClass(notification.priority)
                  )}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <NotificationIcon type={notification.type} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900 line-clamp-1">
                            {notification.title}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center mt-2 text-xs text-gray-500">
                            <span>{formatRelativeTime(notification.created_at)}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-1 ml-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => handleAction(() => markAsRead(notification.id))}
                            disabled={isUpdating}
                          >
                            {isUpdating ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Check className="h-3 w-3" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => handleAction(() => deleteNotification(notification.id))}
                            disabled={isUpdating}
                          >
                            {isUpdating ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Trash2 className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        {unreadNotifications.length > 0 && (
          <div className="p-3 border-t bg-gray-50">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-sm"
              onClick={() => {
                setIsOpen(false);
                // Naviguer vers la page des notifications
                window.location.href = '/dashboard/notifications';
              }}
            >
              Voir toutes les notifications
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}; 