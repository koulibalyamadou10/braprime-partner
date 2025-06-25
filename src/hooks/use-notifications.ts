import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { NotificationService, Notification } from '@/lib/services/notifications';
import { useToast } from '@/components/ui/use-toast';

export const useNotifications = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Récupérer les notifications
  const fetchNotifications = async () => {
    if (!currentUser) {
      setError('Utilisateur non authentifié');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await NotificationService.getUserNotifications();
      
      if (fetchError) {
        setError(fetchError);
        toast({
          title: "Erreur",
          description: fetchError,
          variant: "destructive",
        });
      } else {
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.is_read).length);
      }
    } catch (err) {
      const errorMessage = 'Erreur lors de la récupération des notifications';
      setError(errorMessage);
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Marquer une notification comme lue
  const markAsRead = async (id: string) => {
    if (!currentUser) return;

    setIsUpdating(true);
    setError(null);

    try {
      const { data, error: updateError } = await NotificationService.markAsRead(id);
      
      if (updateError) {
        setError(updateError);
        toast({
          title: "Erreur",
          description: updateError,
          variant: "destructive",
        });
      } else if (data) {
        setNotifications(prev => 
          prev.map(n => n.id === id ? { ...n, is_read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      const errorMessage = 'Erreur lors du marquage de la notification';
      setError(errorMessage);
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Marquer toutes les notifications comme lues
  const markAllAsRead = async () => {
    if (!currentUser) return;

    setIsUpdating(true);
    setError(null);

    try {
      const { data, error: updateError } = await NotificationService.markAllAsRead();
      
      if (updateError) {
        setError(updateError);
        toast({
          title: "Erreur",
          description: updateError,
          variant: "destructive",
        });
      } else if (data) {
        setNotifications(prev => 
          prev.map(n => ({ ...n, is_read: true }))
        );
        setUnreadCount(0);
        toast({
          title: "Succès",
          description: "Toutes les notifications ont été marquées comme lues",
        });
      }
    } catch (err) {
      const errorMessage = 'Erreur lors du marquage des notifications';
      setError(errorMessage);
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Supprimer une notification
  const deleteNotification = async (id: string) => {
    if (!currentUser) return;

    setIsUpdating(true);
    setError(null);

    try {
      const { error: deleteError } = await NotificationService.delete(id);
      
      if (deleteError) {
        setError(deleteError);
        toast({
          title: "Erreur",
          description: deleteError,
          variant: "destructive",
        });
      } else {
        setNotifications(prev => prev.filter(n => n.id !== id));
        // Recalculer le nombre de notifications non lues
        const updatedNotifications = notifications.filter(n => n.id !== id);
        setUnreadCount(updatedNotifications.filter(n => !n.is_read).length);
        toast({
          title: "Succès",
          description: "Notification supprimée",
        });
      }
    } catch (err) {
      const errorMessage = 'Erreur lors de la suppression de la notification';
      setError(errorMessage);
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Supprimer toutes les notifications lues
  const deleteReadNotifications = async () => {
    if (!currentUser) return;

    setIsUpdating(true);
    setError(null);

    try {
      const { error: deleteError } = await NotificationService.deleteRead();
      
      if (deleteError) {
        setError(deleteError);
        toast({
          title: "Erreur",
          description: deleteError,
          variant: "destructive",
        });
      } else {
        setNotifications(prev => prev.filter(n => !n.is_read));
        toast({
          title: "Succès",
          description: "Notifications lues supprimées",
        });
      }
    } catch (err) {
      const errorMessage = 'Erreur lors de la suppression des notifications';
      setError(errorMessage);
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Charger les notifications au montage du composant
  useEffect(() => {
    fetchNotifications();
  }, [currentUser]);

  return {
    notifications,
    isLoading,
    isUpdating,
    error,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteReadNotifications,
  };
}; 