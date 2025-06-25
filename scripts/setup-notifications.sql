-- Création de la table notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  is_read BOOLEAN DEFAULT FALSE,
  data JSONB DEFAULT '{}',
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);

-- RLS (Row Level Security)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux utilisateurs de voir uniquement leurs propres notifications
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Politique pour permettre aux utilisateurs de créer leurs propres notifications
CREATE POLICY "Users can create their own notifications" ON notifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politique pour permettre aux utilisateurs de mettre à jour leurs propres notifications
CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Politique pour permettre aux utilisateurs de supprimer leurs propres notifications
CREATE POLICY "Users can delete their own notifications" ON notifications
  FOR DELETE USING (auth.uid() = user_id);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour automatiquement updated_at
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_notifications_updated_at();

-- Fonction pour nettoyer automatiquement les notifications expirées
CREATE OR REPLACE FUNCTION cleanup_expired_notifications()
RETURNS void AS $$
BEGIN
  DELETE FROM notifications 
  WHERE expires_at IS NOT NULL 
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Création d'un job pour nettoyer les notifications expirées (optionnel)
-- Cette fonction peut être appelée périodiquement par un cron job
-- SELECT cleanup_expired_notifications();

-- Insertion de quelques notifications de test (optionnel)
-- INSERT INTO notifications (user_id, type, title, message, priority, data) VALUES
--   ('00000000-0000-0000-0000-000000000000', 'system', 'Bienvenue sur BraPrime', 'Merci de vous être inscrit sur notre plateforme de livraison !', 'low', '{"welcome": true}'),
--   ('00000000-0000-0000-0000-000000000000', 'promotion', 'Offre spéciale', 'Profitez de 20% de réduction sur votre première commande avec le code WELCOME20', 'medium', '{"promo_code": "WELCOME20", "discount": 20}');

-- Commentaires sur la structure
COMMENT ON TABLE notifications IS 'Table pour stocker les notifications des utilisateurs';
COMMENT ON COLUMN notifications.user_id IS 'ID de l''utilisateur qui reçoit la notification';
COMMENT ON COLUMN notifications.type IS 'Type de notification (order_status, delivery_update, promotion, system, payment, reservation)';
COMMENT ON COLUMN notifications.title IS 'Titre de la notification';
COMMENT ON COLUMN notifications.message IS 'Message détaillé de la notification';
COMMENT ON COLUMN notifications.priority IS 'Priorité de la notification (high, medium, low)';
COMMENT ON COLUMN notifications.is_read IS 'Indique si la notification a été lue';
COMMENT ON COLUMN notifications.data IS 'Données supplémentaires au format JSON';
COMMENT ON COLUMN notifications.expires_at IS 'Date d''expiration de la notification (optionnel)'; 