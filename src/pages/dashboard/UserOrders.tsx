import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout, { userNavItems } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Clock, ExternalLink, Filter, Package, Search, ShoppingBag, Tag, Truck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format } from 'date-fns';

// Define the Order type
type OrderStatus = 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  id: string;
  date: Date;
  total: number;
  status: OrderStatus;
  items: OrderItem[];
  trackingNumber?: string;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  estimatedDelivery?: Date;
}

// Mock orders data
const mockOrders: Order[] = [
  {
    id: 'ORD-123456',
    date: new Date(2023, 4, 15), // May 15, 2023
    total: 32.99,
    status: 'delivered',
    items: [
      {
        id: 'ITEM-1',
        name: 'Jollof Rice with Grilled Chicken',
        price: 12.99,
        quantity: 2,
        image: '/images/food/jollof-rice.jpg',
      },
      {
        id: 'ITEM-2',
        name: 'Fresh Mango Juice',
        price: 3.50,
        quantity: 2,
        image: '/images/food/mango-juice.jpg',
      },
    ],
    trackingNumber: 'TRK-987654321',
    deliveryAddress: {
      street: '123 Main St, Apt 4B',
      city: 'Conakry',
      state: 'Conakry',
      postalCode: '11000',
      country: 'Guinea',
    },
    estimatedDelivery: new Date(2023, 4, 16), // May 16, 2023
  },
  {
    id: 'ORD-123457',
    date: new Date(2023, 5, 10), // June 10, 2023
    total: 49.97,
    status: 'shipped',
    items: [
      {
        id: 'ITEM-3',
        name: 'Thieboudienne (Fish and Rice)',
        price: 14.99,
        quantity: 1,
        image: '/images/food/thieboudienne.jpg',
      },
      {
        id: 'ITEM-4',
        name: 'Mafe (Peanut Stew)',
        price: 13.99,
        quantity: 2,
        image: '/images/food/mafe.jpg',
      },
      {
        id: 'ITEM-5',
        name: 'Bissap Juice',
        price: 3.50,
        quantity: 2,
        image: '/images/food/bissap.jpg',
      },
    ],
    trackingNumber: 'TRK-987654322',
    deliveryAddress: {
      street: '123 Main St, Apt 4B',
      city: 'Conakry',
      state: 'Conakry',
      postalCode: '11000',
      country: 'Guinea',
    },
    estimatedDelivery: new Date(2023, 5, 12), // June 12, 2023
  },
  {
    id: 'ORD-123458',
    date: new Date(2023, 5, 22), // June 22, 2023
    total: 27.98,
    status: 'processing',
    items: [
      {
        id: 'ITEM-6',
        name: 'Yassa Chicken',
        price: 13.99,
        quantity: 2,
        image: '/images/food/yassa.jpg',
      },
    ],
    deliveryAddress: {
      street: '123 Main St, Apt 4B',
      city: 'Conakry',
      state: 'Conakry',
      postalCode: '11000',
      country: 'Guinea',
    },
    estimatedDelivery: new Date(2023, 5, 24), // June 24, 2023
  },
  {
    id: 'ORD-123459',
    date: new Date(2023, 3, 5), // April 5, 2023
    total: 35.97,
    status: 'cancelled',
    items: [
      {
        id: 'ITEM-7',
        name: 'Attieke with Grilled Fish',
        price: 15.99,
        quantity: 1,
        image: '/images/food/attieke.jpg',
      },
      {
        id: 'ITEM-8',
        name: 'Ginger Juice',
        price: 3.99,
        quantity: 5,
        image: '/images/food/ginger-juice.jpg',
      },
    ],
    deliveryAddress: {
      street: '123 Main St, Apt 4B',
      city: 'Conakry',
      state: 'Conakry',
      postalCode: '11000',
      country: 'Guinea',
    },
  },
];

// Helper function to get status badge color
const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case 'processing':
      return 'bg-blue-50 text-blue-600';
    case 'shipped':
      return 'bg-amber-50 text-amber-600';
    case 'delivered':
      return 'bg-green-50 text-green-600';
    case 'cancelled':
      return 'bg-red-50 text-red-600';
    default:
      return 'bg-gray-50 text-gray-600';
  }
};

// Helper function to get status icon
const StatusIcon = ({ status }: { status: OrderStatus }) => {
  switch (status) {
    case 'processing':
      return <Clock className="h-4 w-4 mr-1" />;
    case 'shipped':
      return <Truck className="h-4 w-4 mr-1" />;
    case 'delivered':
      return <Package className="h-4 w-4 mr-1" />;
    case 'cancelled':
      return <Tag className="h-4 w-4 mr-1" />;
    default:
      return null;
  }
};

const UserOrders = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter orders based on selected filter and search term
  const filteredOrders = orders.filter((order) => {
    const matchesFilter = filter === 'all' || order.status === filter;
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesFilter && matchesSearch;
  });

  // Group orders by time period
  const currentDate = new Date();
  const last30Days = new Date(currentDate);
  last30Days.setDate(currentDate.getDate() - 30);
  
  const last90Days = new Date(currentDate);
  last90Days.setDate(currentDate.getDate() - 90);

  const recentOrders = filteredOrders.filter(order => order.date >= last30Days);
  const past3MonthsOrders = filteredOrders.filter(order => order.date >= last90Days && order.date < last30Days);
  const olderOrders = filteredOrders.filter(order => order.date < last90Days);

  // Handle view order details
  const handleViewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  return (
    <DashboardLayout navItems={userNavItems} title="Order History">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Your Orders</h2>
          <p className="text-muted-foreground">View and track your order history.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Select value={filter} onValueChange={(value: OrderStatus | 'all') => setFilter(value)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No orders found</h3>
              <p className="text-center text-muted-foreground mb-4">
                {searchTerm || filter !== 'all' 
                  ? 'No orders match your current filters. Try changing your search criteria.'
                  : "You haven't placed any orders yet."}
              </p>
              <Button>
                Start Shopping
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="recent">Recent</TabsTrigger>
              <TabsTrigger value="past3months">Past 3 Months</TabsTrigger>
              <TabsTrigger value="older">Older</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-4">
              <OrdersTable orders={filteredOrders} onViewDetails={handleViewOrderDetails} />
            </TabsContent>
            
            <TabsContent value="recent" className="mt-4">
              {recentOrders.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <p className="text-muted-foreground">No orders in the last 30 days.</p>
                  </CardContent>
                </Card>
              ) : (
                <OrdersTable orders={recentOrders} onViewDetails={handleViewOrderDetails} />
              )}
            </TabsContent>
            
            <TabsContent value="past3months" className="mt-4">
              {past3MonthsOrders.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <p className="text-muted-foreground">No orders from 30-90 days ago.</p>
                  </CardContent>
                </Card>
              ) : (
                <OrdersTable orders={past3MonthsOrders} onViewDetails={handleViewOrderDetails} />
              )}
            </TabsContent>
            
            <TabsContent value="older" className="mt-4">
              {olderOrders.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <p className="text-muted-foreground">No orders older than 90 days.</p>
                  </CardContent>
                </Card>
              ) : (
                <OrdersTable orders={olderOrders} onViewDetails={handleViewOrderDetails} />
              )}
            </TabsContent>
          </Tabs>
        )}

        {/* Order Details Modal */}
        {selectedOrder && (
          <Dialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Order Details</DialogTitle>
                <DialogDescription>
                  Order #{selectedOrder.id} - Placed on {format(selectedOrder.date, 'MMMM d, yyyy')}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Order Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <StatusIcon status={selectedOrder.status} />
                    <span className={`text-sm px-2 py-1 rounded-full ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                    </span>
                  </div>
                  <p className="font-semibold text-lg">Total: ${selectedOrder.total.toFixed(2)}</p>
                </div>
                
                <Separator />
                
                {/* Tracking Info */}
                {(selectedOrder.status === 'shipped' || selectedOrder.status === 'delivered') && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Tracking Information</h4>
                    <div className="flex items-center justify-between bg-muted p-3 rounded-md">
                      <div>
                        <p className="text-sm text-muted-foreground">Tracking Number</p>
                        <p className="font-medium">{selectedOrder.trackingNumber}</p>
                      </div>
                      <Button variant="outline" size="sm" className="h-8">
                        <ExternalLink className="h-3.5 w-3.5 mr-1" />
                        Track Package
                      </Button>
                    </div>
                    {selectedOrder.estimatedDelivery && (
                      <p className="text-sm">
                        {selectedOrder.status === 'delivered' 
                          ? `Delivered on ${format(selectedOrder.estimatedDelivery, 'MMMM d, yyyy')}`
                          : `Estimated delivery: ${format(selectedOrder.estimatedDelivery, 'MMMM d, yyyy')}`
                        }
                      </p>
                    )}
                  </div>
                )}
                
                {/* Order Items */}
                <div className="space-y-2">
                  <h4 className="font-medium">Items in Your Order</h4>
                  <div className="space-y-4">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4">
                        <div className="h-16 w-16 rounded-md bg-muted flex items-center justify-center overflow-hidden">
                          <img src={item.image} alt={item.name} className="object-cover h-full w-full" onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/food-placeholder.jpg';
                          }} />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                {/* Delivery Address */}
                <div className="space-y-2">
                  <h4 className="font-medium">Delivery Address</h4>
                  <div className="bg-muted p-3 rounded-md">
                    <p>{selectedOrder.deliveryAddress.street}</p>
                    <p>
                      {selectedOrder.deliveryAddress.city}, {selectedOrder.deliveryAddress.state} {selectedOrder.deliveryAddress.postalCode}
                    </p>
                    <p>{selectedOrder.deliveryAddress.country}</p>
                  </div>
                </div>
                
                {selectedOrder.status === 'processing' && (
                  <div className="flex items-center justify-end space-x-4">
                    <Button variant="outline" className="text-destructive border-destructive hover:bg-destructive/10">
                      Cancel Order
                    </Button>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  );
};

// OrdersTable component for displaying orders
const OrdersTable = ({ 
  orders, 
  onViewDetails 
}: { 
  orders: Order[],
  onViewDetails: (order: Order) => void
}) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order #</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Items</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">{order.id}</TableCell>
              <TableCell>{format(order.date, 'MMM d, yyyy')}</TableCell>
              <TableCell>
                <div className="flex items-center">
                  <StatusIcon status={order.status} />
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </TableCell>
              <TableCell>{order.items.length} {order.items.length === 1 ? 'item' : 'items'}</TableCell>
              <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
              <TableCell>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onViewDetails(order)}
                  className="h-8 px-2"
                >
                  View
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserOrders; 