import { supabase } from '@/lib/supabase';

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  is_read: boolean;
  data: Record<string, any>;
  expires_at?: string;
  created_at: string;
}

export interface CreateNotificationData {
  user_id: string;
  type: string;
  title: string;
  message: string;
  priority?: 'high' | 'medium' | 'low';
  data?: Record<string, any>;
  expires_at?: string;
}

export const NotificationService = {
  // Créer une nouvelle notification
  create: async (data: CreateNotificationData): Promise<{ data: Notification | null; error: string | null }> => {
    try {
      const { data: notification, error } = await supabase
        .from('notifications')
        .insert({
          user_id: data.user_id,
          type: data.type,
          title: data.title,
          message: data.message,
          priority: data.priority || 'medium',
          data: data.data || {},
          expires_at: data.expires_at
        })
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la création de la notification:', error);
        return { data: null, error: error.message };
      }

      return { data: notification, error: null };
    } catch (error) {
      console.error('Erreur lors de la création de la notification:', error);
      return { data: null, error: 'Erreur de connexion' };
    }
  },

  // Récupérer les notifications d'un utilisateur
  getUserNotifications: async (): Promise<{ data: Notification[]; error: string | null }> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { data: [], error: 'Utilisateur non authentifié' };
      }

      const { data: notifications, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors de la récupération des notifications:', error);
        return { data: [], error: error.message };
      }

      return { data: notifications || [], error: null };
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
      return { data: [], error: 'Erreur de connexion' };
    }
  },

  // Marquer une notification comme lue
  markAsRead: async (id: string): Promise<{ data: Notification | null; error: string | null }> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { data: null, error: 'Utilisateur non authentifié' };
      }

      const { data: notification, error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors du marquage de la notification:', error);
        return { data: null, error: error.message };
      }

      return { data: notification, error: null };
    } catch (error) {
      console.error('Erreur lors du marquage de la notification:', error);
      return { data: null, error: 'Erreur de connexion' };
    }
  },

  // Marquer toutes les notifications comme lues
  markAllAsRead: async (): Promise<{ data: Notification[] | null; error: string | null }> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { data: null, error: 'Utilisateur non authentifié' };
      }

      const { data: notifications, error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false)
        .select();

      if (error) {
        console.error('Erreur lors du marquage de toutes les notifications:', error);
        return { data: null, error: error.message };
      }

      return { data: notifications, error: null };
    } catch (error) {
      console.error('Erreur lors du marquage de toutes les notifications:', error);
      return { data: null, error: 'Erreur de connexion' };
    }
  },

  // Supprimer une notification
  delete: async (id: string): Promise<{ error: string | null }> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { error: 'Utilisateur non authentifié' };
      }

      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Erreur lors de la suppression de la notification:', error);
        return { error: error.message };
      }

      return { error: null };
    } catch (error) {
      console.error('Erreur lors de la suppression de la notification:', error);
      return { error: 'Erreur de connexion' };
    }
  },

  // Supprimer toutes les notifications lues
  deleteRead: async (): Promise<{ error: string | null }> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { error: 'Utilisateur non authentifié' };
      }

      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id)
        .eq('is_read', true);

      if (error) {
        console.error('Erreur lors de la suppression des notifications lues:', error);
        return { error: error.message };
      }

      return { error: null };
    } catch (error) {
      console.error('Erreur lors de la suppression des notifications lues:', error);
      return { error: 'Erreur de connexion' };
    }
  },

  // Compter les notifications non lues
  getUnreadCount: async (): Promise<{ data: number; error: string | null }> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { data: 0, error: 'Utilisateur non authentifié' };
      }

      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) {
        console.error('Erreur lors du comptage des notifications:', error);
        return { data: 0, error: error.message };
      }

      return { data: count || 0, error: null };
    } catch (error) {
      console.error('Erreur lors du comptage des notifications:', error);
      return { data: 0, error: 'Erreur de connexion' };
    }
  }
}; 