-- Script pour ajouter des triggers automatiques pour les notifications
-- Ce script crée des fonctions et triggers pour automatiser la création de notifications

-- 1. Fonction pour créer une notification automatiquement
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type VARCHAR(50),
  p_title VARCHAR(255),
  p_message TEXT,
  p_priority VARCHAR(20) DEFAULT 'medium',
  p_data JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO notifications (
    user_id, 
    type, 
    title, 
    message, 
    priority, 
    data
  ) VALUES (
    p_user_id, 
    p_type, 
    p_title, 
    p_message, 
    p_priority, 
    p_data
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- 2. Trigger pour les changements de statut des commandes
CREATE OR REPLACE FUNCTION notify_order_status_change()
RETURNS TRIGGER AS $$
DECLARE
  business_name VARCHAR(255);
  order_number VARCHAR(20);
BEGIN
  -- Récupérer le nom du commerce
  SELECT name INTO business_name 
  FROM businesses 
  WHERE id = NEW.business_id;
  
  -- Générer un numéro de commande court
  order_number := substring(NEW.id::text from 1 for 8);
  
  -- Créer une notification selon le nouveau statut
  CASE NEW.status
    WHEN 'confirmed' THEN
      PERFORM create_notification(
        NEW.user_id,
        'order_status',
        'Commande confirmée',
        format('Votre commande #%s a été confirmée par %s.', order_number, business_name),
        'medium',
        jsonb_build_object(
          'order_id', NEW.id,
          'business_name', business_name,
          'status', NEW.status
        )
      );
      
    WHEN 'preparing' THEN
      PERFORM create_notification(
        NEW.user_id,
        'order_status',
        'Commande en préparation',
        format('Votre commande #%s est en cours de préparation chez %s.', order_number, business_name),
        'medium',
        jsonb_build_object(
          'order_id', NEW.id,
          'business_name', business_name,
          'status', NEW.status
        )
      );
      
    WHEN 'ready' THEN
      PERFORM create_notification(
        NEW.user_id,
        'order_status',
        'Commande prête',
        format('Votre commande #%s est prête pour la livraison.', order_number),
        'high',
        jsonb_build_object(
          'order_id', NEW.id,
          'business_name', business_name,
          'status', NEW.status
        )
      );
      
    WHEN 'picked_up' THEN
      PERFORM create_notification(
        NEW.user_id,
        'delivery_update',
        'Commande en livraison',
        format('Votre commande #%s est en cours de livraison.', order_number),
        'high',
        jsonb_build_object(
          'order_id', NEW.id,
          'business_name', business_name,
          'driver_name', COALESCE(NEW.driver_name, 'Notre livreur'),
          'status', NEW.status
        )
      );
      
    WHEN 'out_for_delivery' THEN
      PERFORM create_notification(
        NEW.user_id,
        'delivery_update',
        'Commande en livraison',
        format('Votre commande #%s est en cours de livraison.', order_number),
        'high',
        jsonb_build_object(
          'order_id', NEW.id,
          'business_name', business_name,
          'driver_name', COALESCE(NEW.driver_name, 'Notre livreur'),
          'status', NEW.status
        )
      );
      
    WHEN 'delivered' THEN
      PERFORM create_notification(
        NEW.user_id,
        'order_status',
        'Commande livrée',
        format('Votre commande #%s a été livrée. Bon appétit !', order_number),
        'medium',
        jsonb_build_object(
          'order_id', NEW.id,
          'business_name', business_name,
          'status', NEW.status
        )
      );
      
    WHEN 'cancelled' THEN
      PERFORM create_notification(
        NEW.user_id,
        'order_status',
        'Commande annulée',
        format('Votre commande #%s a été annulée.', order_number),
        'high',
        jsonb_build_object(
          'order_id', NEW.id,
          'business_name', business_name,
          'status', NEW.status
        )
      );
      
    ELSE
      -- Pour les autres statuts (pending, etc.), ne pas créer de notification
      -- ou créer une notification générique si nécessaire
      NULL;
  END CASE;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger pour les commandes
DROP TRIGGER IF EXISTS trigger_notify_order_status_change ON orders;
CREATE TRIGGER trigger_notify_order_status_change
  AFTER UPDATE OF status ON orders
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION notify_order_status_change();

-- 3. Trigger pour les changements de statut des réservations
CREATE OR REPLACE FUNCTION notify_reservation_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Créer une notification selon le nouveau statut
  CASE NEW.status
    WHEN 'confirmed' THEN
      PERFORM create_notification(
        NEW.user_id,
        'reservation',
        'Réservation confirmée',
        format('Votre réservation chez %s pour le %s à %s a été confirmée.', 
               NEW.business_name, NEW.date, NEW.time),
        'medium',
        jsonb_build_object(
          'reservation_id', NEW.id,
          'business_name', NEW.business_name,
          'status', NEW.status,
          'date', NEW.date,
          'time', NEW.time,
          'guests', NEW.guests
        )
      );
      
    WHEN 'cancelled' THEN
      PERFORM create_notification(
        NEW.user_id,
        'reservation',
        'Réservation annulée',
        format('Votre réservation chez %s pour le %s à %s a été annulée.', 
               NEW.business_name, NEW.date, NEW.time),
        'high',
        jsonb_build_object(
          'reservation_id', NEW.id,
          'business_name', NEW.business_name,
          'status', NEW.status,
          'date', NEW.date,
          'time', NEW.time
        )
      );
      
    WHEN 'completed' THEN
      PERFORM create_notification(
        NEW.user_id,
        'reservation',
        'Réservation terminée',
        format('Votre réservation chez %s pour le %s à %s a été marquée comme terminée.', 
               NEW.business_name, NEW.date, NEW.time),
        'low',
        jsonb_build_object(
          'reservation_id', NEW.id,
          'business_name', NEW.business_name,
          'status', NEW.status,
          'date', NEW.date,
          'time', NEW.time
        )
      );
      
    ELSE
      -- Pour les autres statuts (pending, etc.), ne pas créer de notification
      NULL;
  END CASE;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger pour les réservations
DROP TRIGGER IF EXISTS trigger_notify_reservation_status_change ON reservations;
CREATE TRIGGER trigger_notify_reservation_status_change
  AFTER UPDATE OF status ON reservations
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION notify_reservation_status_change();

-- 4. Trigger pour l'assignation de table
CREATE OR REPLACE FUNCTION notify_table_assignment()
RETURNS TRIGGER AS $$
BEGIN
  -- Créer une notification pour l'assignation de table
  IF NEW.table_number IS NOT NULL AND (OLD.table_number IS NULL OR OLD.table_number != NEW.table_number) THEN
    PERFORM create_notification(
      NEW.user_id,
      'reservation',
      'Table assignée',
      format('Votre table numéro %s a été assignée pour votre réservation chez %s.', 
             NEW.table_number, NEW.business_name),
      'medium',
      jsonb_build_object(
        'reservation_id', NEW.id,
        'business_name', NEW.business_name,
        'table_number', NEW.table_number,
        'date', NEW.date,
        'time', NEW.time
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger pour l'assignation de table
DROP TRIGGER IF EXISTS trigger_notify_table_assignment ON reservations;
CREATE TRIGGER trigger_notify_table_assignment
  AFTER UPDATE OF table_number ON reservations
  FOR EACH ROW
  WHEN (OLD.table_number IS DISTINCT FROM NEW.table_number)
  EXECUTE FUNCTION notify_table_assignment();

-- 5. Trigger pour les nouvelles commandes
CREATE OR REPLACE FUNCTION notify_new_order()
RETURNS TRIGGER AS $$
DECLARE
  business_name VARCHAR(255);
  order_number VARCHAR(20);
BEGIN
  -- Récupérer le nom du commerce
  SELECT name INTO business_name 
  FROM businesses 
  WHERE id = NEW.business_id;
  
  -- Générer un numéro de commande court
  order_number := substring(NEW.id::text from 1 for 8);
  
  -- Créer une notification pour la nouvelle commande
  PERFORM create_notification(
    NEW.user_id,
    'order_status',
    'Commande confirmée',
    format('Votre commande #%s a été confirmée et est en cours de préparation.', order_number),
    'medium',
    jsonb_build_object(
      'order_id', NEW.id,
      'business_name', business_name,
      'total', NEW.grand_total
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger pour les nouvelles commandes
DROP TRIGGER IF EXISTS trigger_notify_new_order ON orders;
CREATE TRIGGER trigger_notify_new_order
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_order();

-- 6. Trigger pour les nouvelles réservations
CREATE OR REPLACE FUNCTION notify_new_reservation()
RETURNS TRIGGER AS $$
BEGIN
  -- Créer une notification pour la nouvelle réservation
  PERFORM create_notification(
    NEW.user_id,
    'reservation',
    'Réservation en attente',
    format('Votre réservation chez %s pour le %s à %s est en attente de confirmation.', 
           NEW.business_name, NEW.date, NEW.time),
    'medium',
    jsonb_build_object(
      'reservation_id', NEW.id,
      'business_name', NEW.business_name,
      'date', NEW.date,
      'time', NEW.time,
      'guests', NEW.guests
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger pour les nouvelles réservations
DROP TRIGGER IF EXISTS trigger_notify_new_reservation ON reservations;
CREATE TRIGGER trigger_notify_new_reservation
  AFTER INSERT ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_reservation();

-- 7. Fonction pour créer des notifications promotionnelles (à utiliser manuellement)
CREATE OR REPLACE FUNCTION create_promotional_notification(
  p_title VARCHAR(255),
  p_message TEXT,
  p_priority VARCHAR(20) DEFAULT 'low',
  p_data JSONB DEFAULT '{}'
)
RETURNS void AS $$
DECLARE
  user_record RECORD;
BEGIN
  -- Créer une notification pour tous les utilisateurs clients
  FOR user_record IN 
    SELECT DISTINCT u.id 
    FROM auth.users u
    JOIN user_profiles up ON u.id = up.user_id
    WHERE up.role = 'customer'
  LOOP
    PERFORM create_notification(
      user_record.id,
      'promotion',
      p_title,
      p_message,
      p_priority,
      p_data
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 8. Fonction pour créer des notifications système (à utiliser manuellement)
CREATE OR REPLACE FUNCTION create_system_notification(
  p_user_id UUID,
  p_title VARCHAR(255),
  p_message TEXT,
  p_priority VARCHAR(20) DEFAULT 'low',
  p_data JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
BEGIN
  RETURN create_notification(
    p_user_id,
    'system',
    p_title,
    p_message,
    p_priority,
    p_data
  );
END;
$$ LANGUAGE plpgsql;

-- Commentaires sur les fonctions
COMMENT ON FUNCTION create_notification IS 'Fonction utilitaire pour créer une notification';
COMMENT ON FUNCTION notify_order_status_change IS 'Trigger pour notifier les changements de statut des commandes';
COMMENT ON FUNCTION notify_reservation_status_change IS 'Trigger pour notifier les changements de statut des réservations';
COMMENT ON FUNCTION notify_table_assignment IS 'Trigger pour notifier l''assignation de table';
COMMENT ON FUNCTION notify_new_order IS 'Trigger pour notifier les nouvelles commandes';
COMMENT ON FUNCTION notify_new_reservation IS 'Trigger pour notifier les nouvelles réservations';
COMMENT ON FUNCTION create_promotional_notification IS 'Fonction pour créer des notifications promotionnelles pour tous les clients';
COMMENT ON FUNCTION create_system_notification IS 'Fonction pour créer des notifications système pour un utilisateur spécifique'; 