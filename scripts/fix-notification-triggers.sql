-- Script pour corriger les triggers de notification
-- Ce script corrige les fonctions CASE qui manquent de clauses ELSE

-- 1. Corriger la fonction notify_order_status_change
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
      NULL;
  END CASE;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Corriger la fonction notify_reservation_status_change
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

-- 3. Vérifier que les fonctions ont été corrigées
SELECT '=== VÉRIFICATION DES FONCTIONS ===' as info;

SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_name IN ('notify_order_status_change', 'notify_reservation_status_change');

-- 4. Message de confirmation
SELECT '✅ Triggers de notification corrigés avec succès!' as message;
SELECT '✅ Les fonctions CASE ont maintenant des clauses ELSE appropriées' as details; 