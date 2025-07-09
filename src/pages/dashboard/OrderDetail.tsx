import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout, { userNavItems } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Clock, 
  Package, 
  Truck, 
  MapPin, 
  Phone, 
  Calendar, 
  CreditCard, 
  Star,
  MessageSquare,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useOrderDetail } from '@/hooks/use-order-detail';
import { PageSkeleton } from '@/components/dashboard/DashboardSkeletons';

// Helper function to get status badge
const getStatusBadge = (status: Order['status']) => {
  switch (status) {
    case 'pending':
      return { 
        color: 'bg-blue-100 text-blue-800 border-blue-200', 
        label: 'En attente', 
        icon: <Clock className="h-4 w-4 mr-2" /> 
      };
    case 'confirmed':
      return { 
        color: 'bg-amber-100 text-amber-800 border-amber-200', 
        label: 'Confirmée', 
        icon: <Package className="h-4 w-4 mr-2" /> 
      };
    case 'preparing':
      return { 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
        label: 'En préparation', 
        icon: <Clock className="h-4 w-4 mr-2" /> 
      };
    case 'ready':
      return { 
        color: 'bg-green-100 text-green-800 border-green-200', 
        label: 'Prête', 
        icon: <Package className="h-4 w-4 mr-2" /> 
      };
    case 'picked_up':
      return { 
        color: 'bg-purple-100 text-purple-800 border-purple-200', 
        label: 'En livraison', 
        icon: <Truck className="h-4 w-4 mr-2" /> 
      };
    case 'delivered':
      return { 
        color: 'bg-green-200 text-green-900 border-green-300', 
        label: 'Livrée', 
        icon: <CheckCircle className="h-4 w-4 mr-2" /> 
      };
    case 'cancelled':
      return { 
        color: 'bg-red-100 text-red-800 border-red-200', 
        label: 'Annulée', 
        icon: <XCircle className="h-4 w-4 mr-2" /> 
      };
    default:
      return { 
        color: 'bg-gray-100 text-gray-800 border-gray-200', 
        label: status, 
        icon: <Clock className="h-4 w-4 mr-2" /> 
      };
  }
};

// Helper function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'GNF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Helper function to get status timeline
const getStatusTimeline = (order: Order) => {
  const timeline = [
    {
      status: 'pending',
      label: 'Commande passée',
      description: 'Votre commande a été reçue',
      completed: true,
      date: order.created_at
    },
    {
      status: 'confirmed',
      label: 'Commande confirmée',
      description: 'Le restaurant a confirmé votre commande',
      completed: ['confirmed', 'preparing', 'ready', 'picked_up', 'delivered'].includes(order.status),
      date: order.updated_at
    },
    {
      status: 'preparing',
      label: 'En préparation',
      description: 'Votre commande est en cours de préparation',
      completed: ['preparing', 'ready', 'picked_up', 'delivered'].includes(order.status),
      date: order.updated_at
    },
    {
      status: 'ready',
      label: 'Prête',
      description: 'Votre commande est prête pour la livraison',
      completed: ['ready', 'picked_up', 'delivered'].includes(order.status),
      date: order.updated_at
    },
    {
      status: 'picked_up',
      label: 'En livraison',
      description: 'Un livreur a récupéré votre commande',
      completed: ['picked_up', 'delivered'].includes(order.status),
      date: order.updated_at
    },
    {
      status: 'delivered',
      label: 'Livrée',
      description: 'Votre commande a été livrée',
      completed: order.status === 'delivered',
      date: order.actual_delivery || order.updated_at
    }
  ];

  return timeline;
};

const OrderDetail = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  
  // Utiliser le hook personnalisé pour les détails de commande
  const {
    order,
    isLoading: loading,
    error,
    isError,
    refreshOrder,
    cancelOrder,
    isCancelling,
    addReview,
    isAddingReview
  } = useOrderDetail(orderId || '');

  // Rafraîchir les données
  const handleRefresh = () => {
    refreshOrder();
  };

  if (loading) {
    return (
      <DashboardLayout navItems={userNavItems} title="Détails de la commande">
        <PageSkeleton />
      </DashboardLayout>
    );
  }

  if (isError || !order) {
    return (
      <DashboardLayout navItems={userNavItems} title="Détails de la commande">
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Erreur</h3>
          <p className="text-muted-foreground mb-4 text-center">
            {error instanceof Error ? error.message : "Impossible de charger les détails de la commande"}
          </p>
          <div className="flex gap-2">
            <Button onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Réessayer
            </Button>
            <Button variant="outline" asChild>
              <Link to="/dashboard/orders">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour aux commandes
              </Link>
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const statusBadge = getStatusBadge(order.status);
  const timeline = getStatusTimeline(order);

  return (
    <DashboardLayout navItems={userNavItems} title={`Commande #${order.order_number || order.id.substring(0, 8)}`}>
      <div className="space-y-6">
        {/* Header avec boutons d'action */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link to="/dashboard/orders">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour aux commandes
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Commande #{order.order_number || order.id.substring(0, 8)}</h1>
              <p className="text-muted-foreground">
                Passée le {format(new Date(order.created_at), 'dd MMMM yyyy à HH:mm', { locale: fr })}
              </p>
            </div>
          </div>
                      <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Actualiser
              </Button>
              {order.status === 'pending' && (
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => cancelOrder(order.id)}
                  disabled={isCancelling}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  {isCancelling ? 'Annulation...' : 'Annuler'}
                </Button>
              )}
              <Badge className={`${statusBadge.color} border`}>
                {statusBadge.icon}
                {statusBadge.label}
              </Badge>
            </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Aperçu</TabsTrigger>
            <TabsTrigger value="timeline">Suivi</TabsTrigger>
            <TabsTrigger value="details">Détails</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Informations du restaurant */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  {order.business_name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Adresse de livraison</p>
                    <p className="flex items-center gap-2 mt-1">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      {order.delivery_address}
                    </p>
                    {order.delivery_instructions && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Instructions: {order.delivery_instructions}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Méthode de livraison</p>
                    <p className="mt-1">{order.delivery_method}</p>
                    {order.estimated_delivery && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Livraison estimée: {format(new Date(order.estimated_delivery), 'dd/MM/yyyy HH:mm', { locale: fr })}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Articles commandés */}
            <Card>
              <CardHeader>
                <CardTitle>Articles commandés</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Package className="h-6 w-6 text-gray-500" />
                        </div>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Quantité: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <p className="font-medium">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Résumé des coûts */}
            <Card>
              <CardHeader>
                <CardTitle>Résumé des coûts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Sous-total</span>
                    <span>{formatCurrency(order.total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Frais de livraison</span>
                    <span>{formatCurrency(order.delivery_fee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxes</span>
                    <span>{formatCurrency(order.tax)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{formatCurrency(order.grand_total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-6">
            {/* Timeline du statut */}
            <Card>
              <CardHeader>
                <CardTitle>Suivi de la commande</CardTitle>
                <CardDescription>
                  Suivez l'évolution de votre commande en temps réel
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {timeline.map((step, index) => (
                    <div key={step.status} className="flex items-start gap-4">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        step.completed 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-200 text-gray-500'
                      }`}>
                        {step.completed ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <span className="text-sm font-medium">{index + 1}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium ${
                          step.completed ? 'text-green-700' : 'text-gray-500'
                        }`}>
                          {step.label}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {step.description}
                        </p>
                        {step.date && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(step.date), 'dd/MM/yyyy HH:mm', { locale: fr })}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Informations du livreur */}
            {order.driver_id && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Informations du livreur
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Nom du livreur</p>
                      <p className="mt-1">{order.driver_name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Téléphone</p>
                      <p className="mt-1 flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {order.driver_phone}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="details" className="space-y-6">
            {/* Détails de paiement */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Détails de paiement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Méthode de paiement</p>
                    <p className="mt-1">{order.payment_method || 'Non spécifiée'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Statut du paiement</p>
                    <p className="mt-1">{order.payment_status || 'En attente'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informations de livraison */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Informations de livraison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Type de livraison</p>
                    <p className="mt-1 capitalize">{order.delivery_type}</p>
                  </div>
                  {order.preferred_delivery_time && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Heure de livraison préférée</p>
                      <p className="mt-1">{order.preferred_delivery_time}</p>
                    </div>
                  )}
                  {order.scheduled_delivery_window_start && order.scheduled_delivery_window_end && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Fenêtre de livraison</p>
                      <p className="mt-1">
                        {format(new Date(order.scheduled_delivery_window_start), 'dd/MM/yyyy HH:mm', { locale: fr })} - 
                        {format(new Date(order.scheduled_delivery_window_end), 'dd/MM/yyyy HH:mm', { locale: fr })}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Évaluation et avis */}
            {order.status === 'delivered' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Évaluation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {order.customer_rating ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-5 w-5 ${
                                star <= order.customer_rating!
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {order.customer_rating}/5
                        </span>
                      </div>
                      {order.customer_review && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Votre avis</p>
                          <p className="mt-1">{order.customer_review}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground mb-4">
                        Donnez votre avis sur cette commande
                      </p>
                      <Button variant="outline">
                        <Star className="h-4 w-4 mr-2" />
                        Évaluer la commande
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default OrderDetail; 