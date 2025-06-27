import React, { useState, useEffect } from 'react';
import DashboardLayout, { userNavItems } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  CreditCard, 
  Wallet, 
  Plus, 
  Eye, 
  Download, 
  Calendar, 
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface PaymentMethod {
  id: string;
  type: 'card' | 'mobile_money' | 'bank';
  name: string;
  last4?: string;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
}

interface PaymentHistory {
  id: string;
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  method: string;
  description: string;
  order_id?: string;
  created_at: string;
}

const UserPayments: React.FC = () => {
  const { user } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('methods');

  useEffect(() => {
    if (user) {
      loadPaymentData();
    }
  }, [user]);

  const loadPaymentData = async () => {
    try {
      setLoading(true);
      // Simuler le chargement des données
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Données de test
      const mockPaymentMethods: PaymentMethod[] = [
        {
          id: '1',
          type: 'card',
          name: 'Carte Visa',
          last4: '1234',
          is_default: true,
          is_active: true,
          created_at: '2024-01-01T00:00:00Z'
        },
        {
          id: '2',
          type: 'mobile_money',
          name: 'Orange Money',
          is_default: false,
          is_active: true,
          created_at: '2024-01-15T00:00:00Z'
        }
      ];

      const mockPaymentHistory: PaymentHistory[] = [
        {
          id: '1',
          amount: 25000,
          currency: 'GNF',
          status: 'completed',
          method: 'Carte Visa ****1234',
          description: 'Commande #12345 - Restaurant Le Gourmet',
          order_id: '12345',
          created_at: '2024-01-15T10:30:00Z'
        },
        {
          id: '2',
          amount: 18000,
          currency: 'GNF',
          status: 'completed',
          method: 'Orange Money',
          description: 'Commande #12344 - Café Central',
          order_id: '12344',
          created_at: '2024-01-14T15:20:00Z'
        },
        {
          id: '3',
          amount: 12000,
          currency: 'GNF',
          status: 'pending',
          method: 'Carte Visa ****1234',
          description: 'Commande #12343 - Pharmacie Centrale',
          order_id: '12343',
          created_at: '2024-01-13T09:15:00Z'
        }
      ];

      setPaymentMethods(mockPaymentMethods);
      setPaymentHistory(mockPaymentHistory);
    } catch (error) {
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Terminé</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">En attente</Badge>;
      case 'failed':
        return <Badge variant="destructive">Échoué</Badge>;
      case 'refunded':
        return <Badge variant="outline">Remboursé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getMethodIcon = (type: string) => {
    switch (type) {
      case 'card':
        return <CreditCard className="h-4 w-4" />;
      case 'mobile_money':
        return <Wallet className="h-4 w-4" />;
      case 'bank':
        return <CreditCard className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <DashboardLayout navItems={userNavItems}>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={userNavItems}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Paiements</h1>
            <p className="text-muted-foreground">
              Gérez vos méthodes de paiement et consultez l'historique
            </p>
          </div>
          <Button onClick={loadPaymentData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="methods">Méthodes de paiement</TabsTrigger>
            <TabsTrigger value="history">Historique</TabsTrigger>
          </TabsList>

          <TabsContent value="methods" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Méthodes de paiement</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une méthode
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {paymentMethods.map((method) => (
                <Card key={method.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getMethodIcon(method.type)}
                        <div>
                          <CardTitle className="text-lg">{method.name}</CardTitle>
                          {method.last4 && (
                            <CardDescription>**** {method.last4}</CardDescription>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {method.is_default && (
                          <Badge variant="secondary">Par défaut</Badge>
                        )}
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Ajoutée le {new Date(method.created_at).toLocaleDateString('fr-FR')}
                      </div>
                      <div className="flex space-x-2">
                        {!method.is_default && (
                          <Button variant="outline" size="sm">
                            Définir par défaut
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Informations de sécurité</CardTitle>
                <CardDescription>
                  Vos informations de paiement sont sécurisées et chiffrées
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Paiements sécurisés par SSL</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Conformité PCI DSS</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Historique des paiements</h2>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Méthode</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentHistory.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {new Date(payment.created_at).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{payment.description}</div>
                            {payment.order_id && (
                              <div className="text-sm text-muted-foreground">
                                Commande #{payment.order_id}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getMethodIcon(payment.method.includes('Carte') ? 'card' : 'mobile_money')}
                            <span className="text-sm">{payment.method}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              {payment.amount.toLocaleString()} {payment.currency}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(payment.status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            {payment.status === 'completed' && (
                              <Button variant="ghost" size="sm">
                                <Download className="h-4 w-4" />
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total dépensé</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {paymentHistory
                      .filter(p => p.status === 'completed')
                      .reduce((sum, p) => sum + p.amount, 0)
                      .toLocaleString()} GNF
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Ce mois
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Paiements réussis</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {paymentHistory.filter(p => p.status === 'completed').length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Sur {paymentHistory.length} paiements
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">En attente</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {paymentHistory.filter(p => p.status === 'pending').length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Paiements en cours
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default UserPayments; 