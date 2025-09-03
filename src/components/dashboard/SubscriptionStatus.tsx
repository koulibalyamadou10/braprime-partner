import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { subscriptionUtils, useCurrentUserSubscription } from '@/hooks/use-subscription';
import {
    AlertTriangle,
    Banknote,
    Calendar,
    CheckCircle,
    Clock,
    CreditCard,
    DollarSign,
    TrendingUp,
    XCircle
} from 'lucide-react';
import React from 'react';
import { SubscriptionDetails } from './SubscriptionDetails';

export const SubscriptionStatus: React.FC = () => {
  const { data: subscription, isLoading, error } = useCurrentUserSubscription();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Statut d'abonnement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Statut d'abonnement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              Erreur lors du chargement des informations d'abonnement
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Aucun abonnement actif
          </CardTitle>
          <CardDescription>
            Vous n'avez pas d'abonnement actif. Souscrivez à un plan pour accéder à toutes les fonctionnalités.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Votre accès est limité. Souscrivez à un abonnement pour débloquer toutes les fonctionnalités.
              </AlertDescription>
            </Alert>
            <Button className="w-full">
              <CreditCard className="h-4 w-4 mr-2" />
              Voir les plans d'abonnement
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const daysRemaining = subscriptionUtils.getDaysRemaining(subscription.end_date);
  const isExpiringSoon = subscriptionUtils.isExpiringSoon(subscription.end_date);
  const isExpired = subscriptionUtils.isExpired(subscription.end_date);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Statut d'abonnement
        </CardTitle>
        <CardDescription>
          Informations sur votre abonnement BraPrime
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Statut principal */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="font-medium">{subscription.plan?.name}</span>
          </div>
          <Badge 
            className={subscriptionUtils.getStatusColor(subscription.status)}
          >
            {subscriptionUtils.getStatusLabel(subscription.status)}
          </Badge>
        </div>

        {/* Informations de prix */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Prix total</p>
            <p className="text-lg font-semibold">
              {subscriptionUtils.formatPrice(subscription.total_paid)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Prix mensuel</p>
            <p className="text-lg font-semibold">
              {subscriptionUtils.formatPrice(subscription.monthly_amount)}
            </p>
          </div>
        </div>

        {/* Économies */}
        {subscription.savings_amount > 0 && (
          <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-700">
              Vous économisez {subscriptionUtils.formatPrice(subscription.savings_amount)} 
              ({subscription.plan?.savings_percentage}% de réduction)
            </span>
          </div>
        )}

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Date de début</p>
            <p className="text-sm font-medium">
              {subscriptionUtils.formatDate(subscription.start_date)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Date de fin</p>
            <p className="text-sm font-medium">
              {subscriptionUtils.formatDate(subscription.end_date)}
            </p>
          </div>
        </div>

        {/* Jours restants */}
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            {daysRemaining > 0 
              ? `${daysRemaining} jour${daysRemaining > 1 ? 's' : ''} restant${daysRemaining > 1 ? 's' : ''}`
              : 'Expiré'
            }
          </span>
        </div>

        {/* Alertes */}
        {isExpiringSoon && !isExpired && (
          <Alert variant="warning">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Votre abonnement expire dans {daysRemaining} jour{daysRemaining > 1 ? 's' : ''}. 
              Renouvelez pour continuer à bénéficier de nos services.
            </AlertDescription>
          </Alert>
        )}

        {isExpired && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              Votre abonnement a expiré. Renouvelez pour continuer à bénéficier de nos services.
            </AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1">
                <Calendar className="h-4 w-4 mr-2" />
                Détails
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Détails de l'abonnement</DialogTitle>
                <DialogDescription>
                  Informations détaillées sur votre abonnement BraPrime
                </DialogDescription>
              </DialogHeader>
              <SubscriptionDetails subscription={subscription} />
            </DialogContent>
          </Dialog>

          <Button className="flex-1">
            <Banknote className="h-4 w-4 mr-2" />
            Renouveler
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}; 