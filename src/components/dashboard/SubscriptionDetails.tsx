import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { subscriptionUtils, useSubscriptionInvoices, useSubscriptionNotifications, useSubscriptionPayments } from '@/hooks/use-subscription';
import { type PartnerSubscription } from '@/lib/services/subscription';
import {
    Bell,
    Building,
    CheckCircle,
    CreditCard,
    DollarSign,
    FileText,
    Mail,
    MapPin,
    Phone
} from 'lucide-react';
import React from 'react';

interface SubscriptionDetailsProps {
  subscription: PartnerSubscription;
}

export const SubscriptionDetails: React.FC<SubscriptionDetailsProps> = ({ subscription }) => {
  const { data: payments } = useSubscriptionPayments(subscription.id);
  const { data: invoices } = useSubscriptionInvoices(subscription.id);
  const { data: notifications } = useSubscriptionNotifications(subscription.id);

  return (
    <div className="space-y-6">
      {/* Informations générales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Informations générales
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Plan</p>
              <p className="font-medium">{subscription.plan?.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Statut</p>
              <Badge className={subscriptionUtils.getStatusColor(subscription.status)}>
                {subscriptionUtils.getStatusLabel(subscription.status)}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Prix total</p>
              <p className="font-medium">{subscriptionUtils.formatPrice(subscription.total_paid)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Prix mensuel</p>
              <p className="font-medium">{subscriptionUtils.formatPrice(subscription.monthly_amount)}</p>
            </div>
          </div>

          {subscription.savings_amount > 0 && (
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">
                  Économies : {subscriptionUtils.formatPrice(subscription.savings_amount)} 
                  ({subscription.plan?.savings_percentage}% de réduction)
                </span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Date de début</p>
              <p className="text-sm font-medium">
                {subscriptionUtils.formatDate(subscription.start_date)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date de fin</p>
              <p className="text-sm font-medium">
                {subscriptionUtils.formatDate(subscription.end_date)}
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Jours restants</p>
            <p className="text-sm font-medium">
              {subscriptionUtils.getDaysRemaining(subscription.end_date)} jours
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Fonctionnalités incluses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Fonctionnalités incluses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {subscription.plan?.features?.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Informations de facturation */}
      {(subscription.billing_email || subscription.billing_phone || subscription.billing_address) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Informations de facturation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {subscription.billing_email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{subscription.billing_email}</span>
              </div>
            )}
            {subscription.billing_phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{subscription.billing_phone}</span>
              </div>
            )}
            {subscription.billing_address && (
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span className="text-sm">{subscription.billing_address}</span>
              </div>
            )}
            {subscription.tax_id && (
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">NIF: {subscription.tax_id}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Onglets pour les détails */}
      <Tabs defaultValue="payments" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="payments">Paiements</TabsTrigger>
          <TabsTrigger value="invoices">Factures</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Historique des paiements
              </CardTitle>
            </CardHeader>
            <CardContent>
              {payments && payments.length > 0 ? (
                <div className="space-y-3">
                  {payments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium">{subscriptionUtils.formatPrice(payment.amount)}</p>
                        <p className="text-sm text-muted-foreground">
                          {payment.payment_method} • {subscriptionUtils.formatDate(payment.created_at)}
                        </p>
                      </div>
                      <Badge className={subscriptionUtils.getStatusColor(payment.status)}>
                        {subscriptionUtils.getStatusLabel(payment.status)}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Aucun paiement enregistré</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Factures
              </CardTitle>
            </CardHeader>
            <CardContent>
              {invoices && invoices.length > 0 ? (
                <div className="space-y-3">
                  {invoices.map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium">Facture #{invoice.invoice_number}</p>
                        <p className="text-sm text-muted-foreground">
                          {subscriptionUtils.formatPrice(invoice.total_amount)} • 
                          Échéance: {subscriptionUtils.formatDate(invoice.due_date)}
                        </p>
                      </div>
                      <Badge className={subscriptionUtils.getStatusColor(invoice.status)}>
                        {subscriptionUtils.getStatusLabel(invoice.status)}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Aucune facture disponible</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              {notifications && notifications.length > 0 ? (
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <div key={notification.id} className={`p-3 border rounded-lg ${!notification.is_read ? 'bg-blue-50' : ''}`}>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <p className="font-medium">{notification.title}</p>
                          <p className="text-sm text-muted-foreground">{notification.message}</p>
                          <p className="text-xs text-muted-foreground">
                            {subscriptionUtils.formatDate(notification.sent_at)}
                          </p>
                        </div>
                        {!notification.is_read && (
                          <Badge variant="secondary" className="text-xs">
                            Nouveau
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Aucune notification</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}; 