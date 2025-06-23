
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useOrder } from '@/contexts/OrderContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ChevronLeft, ChevronRight, Clock, Calendar, 
  Truck, CheckCircle, XCircle
} from 'lucide-react';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const OrdersHistoryPage = () => {
  const { orders } = useOrder();
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5;
  
  // Filter orders by tab
  const getFilteredOrders = (status: 'active' | 'completed' | 'cancelled') => {
    if (status === 'active') {
      return orders.filter(order => 
        ['pending', 'confirmed', 'preparing', 'ready', 'picked_up'].includes(order.status)
      );
    } else if (status === 'completed') {
      return orders.filter(order => order.status === 'delivered');
    } else {
      return orders.filter(order => order.status === 'cancelled');
    }
  };
  
  const activeOrders = getFilteredOrders('active');
  const completedOrders = getFilteredOrders('completed');
  const cancelledOrders = getFilteredOrders('cancelled');
  
  // Pagination for the current tab
  const getPaginatedOrders = (ordersList: typeof orders) => {
    const startIndex = (currentPage - 1) * ordersPerPage;
    const endIndex = startIndex + ordersPerPage;
    return ordersList.slice(startIndex, endIndex);
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };
  
  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
            En attente
          </span>
        );
      case 'confirmed':
        return (
          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
            Confirmée
          </span>
        );
      case 'preparing':
        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
            En préparation
          </span>
        );
      case 'ready':
        return (
          <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium">
            Prête
          </span>
        );
      case 'picked_up':
        return (
          <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
            En route
          </span>
        );
      case 'delivered':
        return (
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            Livrée
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
            Annulée
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
            {status}
          </span>
        );
    }
  };
  
  // Render orders table
  const renderOrdersTable = (ordersList: typeof orders) => {
    if (ordersList.length === 0) {
      return (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
            <Clock className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium mb-2">Aucune commande trouvée</h3>
          <p className="text-gray-500 mb-6">
            Vous n'avez pas encore de commandes dans cette catégorie.
          </p>
          <Button 
            asChild
            className="bg-guinea-red hover:bg-guinea-red/90"
          >
            <Link to="/restaurants">
              Explorer les restaurants
            </Link>
          </Button>
        </div>
      );
    }
    
    return (
      <>
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Commande</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Restaurant</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getPaginatedOrders(ordersList).map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">#{order.id}</TableCell>
                  <TableCell>{formatDate(order.createdAt)}</TableCell>
                  <TableCell>{order.restaurantName}</TableCell>
                  <TableCell>{order.grandTotal.toLocaleString()} GNF</TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="outline" 
                      size="sm"
                      asChild
                    >
                      <Link to={`/order-tracking/${order.id}`}>
                        Détails
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination */}
        {ordersList.length > ordersPerPage && (
          <div className="flex justify-between items-center mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Précédent
            </Button>
            
            <span className="text-sm text-gray-500">
              Page {currentPage} sur {Math.ceil(ordersList.length / ordersPerPage)}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(ordersList.length / ordersPerPage)))}
              disabled={currentPage === Math.ceil(ordersList.length / ordersPerPage)}
            >
              Suivant
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </>
    );
  };
  
  // Get the tab summary statistics
  const getTabSummary = (tab: 'active' | 'completed' | 'cancelled') => {
    const ordersList = getFilteredOrders(tab);
    return {
      count: ordersList.length,
      icon: tab === 'active' ? Truck : tab === 'completed' ? CheckCircle : XCircle,
      label: tab === 'active' ? 'En cours' : tab === 'completed' ? 'Livrées' : 'Annulées',
      color: tab === 'active' ? 'text-orange-500 bg-orange-100' : 
             tab === 'completed' ? 'text-green-500 bg-green-100' : 
             'text-red-500 bg-red-100'
    };
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mr-2"
            asChild
          >
            <Link to="/">
              <ChevronLeft className="h-5 w-5" />
              <span className="sr-only">Retour</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Historique des commandes</h1>
        </div>
        
        {/* Order Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {(['active', 'completed', 'cancelled'] as const).map((tab) => {
            const summary = getTabSummary(tab);
            const Icon = summary.icon;
            
            return (
              <div key={tab} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className={`h-12 w-12 rounded-full ${summary.color} flex items-center justify-center mr-4`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Commandes {summary.label}</p>
                    <p className="text-2xl font-bold">{summary.count}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Orders Tabs */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <Tabs defaultValue="active" className="w-full">
            <div className="px-6 pt-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="active" className="data-[state=active]:bg-guinea-red data-[state=active]:text-white">
                  En cours
                </TabsTrigger>
                <TabsTrigger value="completed" className="data-[state=active]:bg-guinea-red data-[state=active]:text-white">
                  Livrées
                </TabsTrigger>
                <TabsTrigger value="cancelled" className="data-[state=active]:bg-guinea-red data-[state=active]:text-white">
                  Annulées
                </TabsTrigger>
              </TabsList>
            </div>
            
            <div className="p-6">
              <TabsContent value="active">
                {renderOrdersTable(activeOrders)}
              </TabsContent>
              
              <TabsContent value="completed">
                {renderOrdersTable(completedOrders)}
              </TabsContent>
              
              <TabsContent value="cancelled">
                {renderOrdersTable(cancelledOrders)}
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default OrdersHistoryPage;
