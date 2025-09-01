export const DRIVER_TYPE_INDEPENDENT = 'independent';
export const DRIVER_TYPE_NOT_INDEPENDENT = 'not-independent';

export const ORDER_STATUS_PENDING = 'pending';
export const ORDER_STATUS_CONFIRMED = 'confirmed';
export const ORDER_STATUS_PREPARING = 'preparing';
export const ORDER_STATUS_READY = 'ready';
export const ORDER_STATUS_OUT_FOR_DELIVERY = 'out_for_delivery';
export const ORDER_STATUS_DELIVERED = 'delivered';
export const ORDER_STATUS_CANCELLED = 'cancelled';

export const DRIVER_ORDER_TYPE_PENDING = 'pending';
export const DRIVER_ORDER_TYPE_ACCEPTED = 'accepted';
export const DRIVER_ORDER_TYPE_IN_PROGRESS = 'in_progress';
export const DRIVER_ORDER_TYPE_DELIVERED = 'delivered';

  // Rôles disponibles
export const INTERNAL_ROLES = [
    // { value: 'admin', label: 'Administrateur', description: 'Accès complet à toutes les fonctionnalités' },
    { value: 'commandes', label: 'Commandes', description: 'Gestion des commandes et suivi' },
    { value: 'menu', label: 'Menu', description: 'Gestion du menu et des articles' },
    { value: 'reservations', label: 'Réservations', description: 'Gestion des réservations' },
    { value: 'livreurs', label: 'Livreurs', description: 'Gestion des livreurs et affectations' },
    { value: 'revenu', label: 'Revenus', description: 'Suivi des revenus et analytics' },
    // { value: 'user', label: 'Utilisateurs', description: 'Gestion des utilisateurs clients' },
    { value: 'facturation', label: 'Facturation', description: 'Gestion des abonnements et factures' }
];