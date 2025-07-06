-- ============================================================================
-- CRÉER LA VUE CART_DETAILS
-- ============================================================================

-- Fonction pour calculer le total du panier
CREATE OR REPLACE FUNCTION calculate_cart_total(cart_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    total INTEGER := 0;
BEGIN
    SELECT COALESCE(SUM(ci.price * ci.quantity), 0)
    INTO total
    FROM cart_items ci
    WHERE ci.cart_id = cart_uuid;
    RETURN total;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir le nombre d'articles dans le panier
CREATE OR REPLACE FUNCTION get_cart_item_count(cart_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    item_count INTEGER := 0;
BEGIN
    SELECT COALESCE(SUM(ci.quantity), 0)
    INTO item_count
    FROM cart_items ci
    WHERE ci.cart_id = cart_uuid;
    RETURN item_count;
END;
$$ LANGUAGE plpgsql;

-- Créer la vue cart_details
CREATE OR REPLACE VIEW cart_details AS
SELECT 
    c.id as cart_id,
    c.user_id,
    c.business_id,
    c.business_name,
    c.delivery_method,
    c.delivery_address,
    c.delivery_instructions,
    c.created_at,
    c.updated_at,
    calculate_cart_total(c.id) as total,
    get_cart_item_count(c.id) as item_count,
    COALESCE(
        json_agg(
            json_build_object(
                'id', ci.id,
                'menu_item_id', ci.menu_item_id,
                'name', ci.name,
                'price', ci.price,
                'quantity', ci.quantity,
                'image', ci.image,
                'special_instructions', ci.special_instructions,
                'subtotal', ci.price * ci.quantity
            )
        ) FILTER (WHERE ci.id IS NOT NULL),
        '[]'::json
    ) as items
FROM cart c
LEFT JOIN cart_items ci ON c.id = ci.cart_id
GROUP BY c.id, c.user_id, c.business_id, c.business_name, c.delivery_method, c.delivery_address, c.delivery_instructions, c.created_at, c.updated_at;

-- Vérifier que la vue a été créée
SELECT 'Vue cart_details créée avec succès!' as message; 