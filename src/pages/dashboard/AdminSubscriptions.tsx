import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { SubscriptionManagementService } from '@/lib/services/subscription-management';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Subscription {
  id: string;
  partner_id: number;
  plan_id: string;
  status: string;
  start_date: string;
  end_date: string;
  total_paid: number;
  monthly_amount: number;
  created_at: string;
  updated_at: string;
  business: {
    name: string;
    email: string;
    phone: string;
  };
  plan: {
    name: string;
    plan_type: string;
    price: number;
  };
}

const AdminSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({});
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [actionDialog, setActionDialog] = useState(false);
  const [actionType, setActionType] = useState<'deactivate' | 'reactivate' | 'suspend'>('deactivate');
  const [reason, setReason] = useState('');
  const [durationDays, setDurationDays] = useState(7);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadSubscriptions();
    loadStats();
  }, []);

  const loadSubscriptions = async () => {
    try {
      const { data, error } = await supabase
        .from('partner_subscriptions')
        .select(`
          *,
          business:businesses!partner_id(name, email, phone),
          plan:subscription_plans(name, plan_type, price)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors du chargement des abonnements:', error);
        toast.error('Erreur lors du chargement des abonnements');
        return;
      }

      setSubscriptions(data || []);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des abonnements');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    const stats = await SubscriptionManagementService.getSubscriptionStats();
    setStats(stats);
  };

  const handleAction = async () => {
    if (!selectedSubscription) return;

    setProcessing(true);
    try {
      let result;
      
      switch (actionType) {
        case 'deactivate':
          result = await SubscriptionManagementService.deactivateSubscription({
            subscription_id: selectedSubscription.id,
            reason
          });
          break;
        case 'reactivate':
          result = await SubscriptionManagementService.reactivateSubscription({
            subscription_id: selectedSubscription.id
          });
          break;
        case 'suspend':
          result = await SubscriptionManagementService.suspendSubscription({
            subscription_id: selectedSubscription.id,
            reason,
            duration_days: durationDays
          });
          break;
      }

      if (result?.success) {
        toast.success(result.message || 'Action effectuée avec succès');
        setActionDialog(false);
        setReason('');
        setSelectedSubscription(null);
        loadSubscriptions();
        loadStats();
      } else {
        toast.error(result?.error || 'Erreur lors de l\'action');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de l\'action');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', label: 'Actif' },
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'En attente' },
      inactive: { color: 'bg-red-100 text-red-800', label: 'Inactif' },
      suspended: { color: 'bg-orange-100 text-orange-800', label: 'Suspendu' },
      expired: { color: 'bg-gray-100 text-gray-800', label: 'Expiré' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;
    
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'GNF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="h-4 bg-gray-200 rounded animate-pulse mb-4"></div>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-sm font-medium text-gray-600">Abonnements Actifs</div>
            <div className="text-2xl font-bold text-green-600">{stats.active || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm font-medium text-gray-600">En Attente</div>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm font-medium text-gray-600">Suspendus</div>
            <div className="text-2xl font-bold text-orange-600">{stats.suspended || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm font-medium text-gray-600">Inactifs</div>
            <div className="text-2xl font-bold text-red-600">{stats.inactive || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des abonnements */}
      <Card>
        <CardHeader>
          <CardTitle>Gestion des Abonnements</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Période</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions.map((subscription) => (
                <TableRow key={subscription.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{subscription.business?.name}</div>
                      <div className="text-sm text-gray-500">{subscription.business?.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{subscription.plan?.name}</div>
                      <div className="text-sm text-gray-500">{subscription.plan?.plan_type}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(subscription.status)}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{formatAmount(subscription.total_paid)}</div>
                    <div className="text-sm text-gray-500">{formatAmount(subscription.monthly_amount)}/mois</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>Début: {formatDate(subscription.start_date)}</div>
                      <div>Fin: {formatDate(subscription.end_date)}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {subscription.status === 'active' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedSubscription(subscription);
                              setActionType('suspend');
                              setActionDialog(true);
                            }}
                          >
                            Suspendre
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setSelectedSubscription(subscription);
                              setActionType('deactivate');
                              setActionDialog(true);
                            }}
                          >
                            Désactiver
                          </Button>
                        </>
                      )}
                      {subscription.status === 'inactive' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedSubscription(subscription);
                            setActionType('reactivate');
                            setActionDialog(true);
                          }}
                        >
                          Réactiver
                        </Button>
                      )}
                      {subscription.status === 'suspended' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedSubscription(subscription);
                            setActionType('reactivate');
                            setActionDialog(true);
                          }}
                        >
                          Réactiver
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog d'action */}
      <Dialog open={actionDialog} onOpenChange={setActionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'deactivate' && 'Désactiver l\'abonnement'}
              {actionType === 'reactivate' && 'Réactiver l\'abonnement'}
              {actionType === 'suspend' && 'Suspendre l\'abonnement'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedSubscription && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="font-medium">{selectedSubscription.business?.name}</div>
                <div className="text-sm text-gray-600">{selectedSubscription.plan?.name}</div>
              </div>
            )}

            {(actionType === 'deactivate' || actionType === 'suspend') && (
              <div className="space-y-2">
                <Label htmlFor="reason">Raison (optionnel)</Label>
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Raison de l'action..."
                />
              </div>
            )}

            {actionType === 'suspend' && (
              <div className="space-y-2">
                <Label htmlFor="duration">Durée de suspension (jours)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={durationDays}
                  onChange={(e) => setDurationDays(parseInt(e.target.value) || 7)}
                  min="1"
                  max="30"
                />
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setActionDialog(false)}
                disabled={processing}
              >
                Annuler
              </Button>
              <Button
                onClick={handleAction}
                disabled={processing}
                variant={actionType === 'deactivate' ? 'destructive' : 'default'}
              >
                {processing ? 'Traitement...' : 'Confirmer'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSubscriptions; 