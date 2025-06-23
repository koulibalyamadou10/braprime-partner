import { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  CheckCircle2, 
  Clock, 
  XCircle,
  Truck, 
  Timer, 
  AlertCircle, 
  MoreHorizontal,
  Phone,
  User,
  MapPin
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Define partner nav items
export const partnerNavItems = [
  {
    href: '/partner-dashboard',
    label: 'Dashboard',
    icon: <Home className="h-5 w-5" />,
  },
  {
    href: '/partner-dashboard/orders',
    label: 'Orders',
    icon: <ShoppingBag className="h-5 w-5" />,
  },
  {
    href: '/partner-dashboard/menu',
    label: 'Menu',
    icon: <Utensils className="h-5 w-5" />,
  },
  {
    href: '/partner-dashboard/reservations',
    label: 'Reservations',
    icon: <Calendar className="h-5 w-5" />,
  },
  {
    href: '/partner-dashboard/revenue',
    label: 'Revenue',
    icon: <DollarSign className="h-5 w-5" />,
  },
  {
    href: '/partner-dashboard/settings',
    label: 'Settings',
    icon: <Settings className="h-5 w-5" />,
  },
];

// Missing imports
import { 
  Home, 
  ShoppingBag, 
  Utensils, 
  Calendar, 
  DollarSign, 
  Settings 
} from 'lucide-react';

// Types for orders
type OrderStatus = 'new' | 'preparing' | 'ready' | 'delivering' | 'completed' | 'cancelled';

type OrderItem = {
  id: string;
  name: string;
  quantity: number;
  price: number;
  specialInstructions?: string;
};

type Order = {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  orderDate: string;
  deliveryTime: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  paymentMethod: string;
  deliveryMethod: 'pickup' | 'delivery';
  driverName?: string;
  driverPhone?: string;
};

// Mock orders data
const mockOrders: Order[] = [
  {
    id: "ORD-9876",
    customerName: "Fatou Ndiaye",
    customerPhone: "+221781234567",
    customerAddress: "23 Kipe, Guinea Conakry",
    orderDate: "2023-06-15T14:30:00",
    deliveryTime: "2023-06-15T15:15:00",
    items: [
      { id: "item1", name: "Chicken Yassa", quantity: 2, price: 6000 },
      { id: "item2", name: "Jollof Rice", quantity: 1, price: 3500 },
      { id: "item3", name: "Bissap Juice", quantity: 2, price: 1500 }
    ],
    total: 18500,
    status: "new",
    paymentMethod: "Cash on Delivery",
    deliveryMethod: "delivery"
  },
  {
    id: "ORD-9875",
    customerName: "Amadou Diallo",
    customerPhone: "+221777654321",
    customerAddress: "55 Rue de la Paix, Conakry",
    orderDate: "2023-06-15T13:45:00",
    deliveryTime: "2023-06-15T14:30:00",
    items: [
      { id: "item1", name: "Thieboudienne", quantity: 3, price: 5500 },
      { id: "item4", name: "Ginger Juice", quantity: 3, price: 1500 }
    ],
    total: 21000,
    status: "preparing",
    paymentMethod: "Mobile Money",
    deliveryMethod: "delivery"
  },
  {
    id: "ORD-9874",
    customerName: "Aisha Sow",
    customerPhone: "+221765551234",
    customerAddress: "112 Point E, Conakry",
    orderDate: "2023-06-15T12:15:00",
    deliveryTime: "2023-06-15T13:00:00",
    items: [
      { id: "item5", name: "Mafé", quantity: 1, price: 5000 },
      { id: "item6", name: "Attieke with Fish", quantity: 1, price: 6500 },
      { id: "item7", name: "Baobab Juice", quantity: 2, price: 1500 }
    ],
    total: 14500,
    status: "ready",
    paymentMethod: "Credit Card",
    deliveryMethod: "pickup"
  },
  {
    id: "ORD-9873",
    customerName: "Ibrahim Diop",
    customerPhone: "+221783334444",
    customerAddress: "23 Liberté 6, Conakry",
    orderDate: "2023-06-15T11:30:00",
    deliveryTime: "2023-06-15T12:15:00",
    items: [
      { id: "item8", name: "Dibi Lamb", quantity: 2, price: 7000 },
      { id: "item9", name: "Attaya (Mint Tea)", quantity: 3, price: 1000 }
    ],
    total: 17000,
    status: "delivering",
    paymentMethod: "Mobile Money",
    deliveryMethod: "delivery",
    driverName: "Ahmed Diallo",
    driverPhone: "+221781234567"
  },
  {
    id: "ORD-9872",
    customerName: "Mariama Seck",
    customerPhone: "+221765559876",
    customerAddress: "45 Ouakam, Conakry",
    orderDate: "2023-06-15T10:45:00",
    deliveryTime: "2023-06-15T11:30:00",
    items: [
      { id: "item10", name: "Ceebu Jen", quantity: 2, price: 5500 },
      { id: "item11", name: "Nem (Spring Rolls)", quantity: 4, price: 2000 },
      { id: "item12", name: "Bouye Juice", quantity: 2, price: 1500 }
    ],
    total: 21000,
    status: "completed",
    paymentMethod: "Cash on Delivery",
    deliveryMethod: "delivery"
  },
  {
    id: "ORD-9871",
    customerName: "Ousmane Niang",
    customerPhone: "+221772223333",
    customerAddress: "67 Mermoz, Conakry",
    orderDate: "2023-06-15T09:30:00",
    deliveryTime: "2023-06-15T10:15:00",
    items: [
      { id: "item13", name: "Chicken Suya", quantity: 3, price: 4500 },
      { id: "item14", name: "Fatayas", quantity: 5, price: 1500 },
      { id: "item15", name: "Coke", quantity: 3, price: 1000 }
    ],
    total: 24000,
    status: "cancelled",
    paymentMethod: "Credit Card",
    deliveryMethod: "delivery"
  },
  {
    id: "ORD-9870",
    customerName: "Aminata Ba",
    customerPhone: "+221764445555",
    customerAddress: "34 Nord Foire, Conakry",
    orderDate: "2023-06-14T19:45:00",
    deliveryTime: "2023-06-14T20:30:00",
    items: [
      { id: "item16", name: "Lakhou Bissap", quantity: 2, price: 5000 },
      { id: "item17", name: "Sombi (Rice Pudding)", quantity: 2, price: 2500 }
    ],
    total: 15000,
    status: "completed",
    paymentMethod: "Mobile Money",
    deliveryMethod: "delivery"
  }
];
  
// Helper function to get color based on order status
const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case 'new':
      return "bg-blue-100 text-blue-800";
    case 'preparing':
      return "bg-yellow-100 text-yellow-800";
    case 'ready':
      return "bg-green-100 text-green-800";
    case 'delivering':
      return "bg-purple-100 text-purple-800";
    case 'completed':
      return "bg-gray-100 text-gray-800";
    case 'cancelled':
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Helper function to get icon based on order status
const getStatusIcon = (status: OrderStatus) => {
  switch (status) {
    case 'new':
      return <AlertCircle className="h-4 w-4" />;
    case 'preparing':
      return <Timer className="h-4 w-4" />;
    case 'ready':
      return <CheckCircle2 className="h-4 w-4" />;
    case 'delivering':
      return <Truck className="h-4 w-4" />;
    case 'completed':
      return <CheckCircle2 className="h-4 w-4" />;
    case 'cancelled':
      return <XCircle className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

// Format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-SN', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0
  }).format(amount);
};

const PartnerOrders = () => {
  const { currentUser } = useAuth();
  
  // State for orders
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>(mockOrders);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // Handle status change
  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
    setFilteredOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
    
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
  };
  
  // Handle order selection
  const handleOrderSelect = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };
  
  // Handle filter change
  const handleFilterChange = (status: string) => {
    setFilterStatus(status);
    
    if (status === "all") {
      setFilteredOrders(
        searchQuery 
          ? orders.filter(order => 
              order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
              order.id.toLowerCase().includes(searchQuery.toLowerCase())
            )
          : orders
      );
    } else {
      setFilteredOrders(
        orders.filter(order => 
          order.status === status &&
          (
            searchQuery
              ? order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.id.toLowerCase().includes(searchQuery.toLowerCase())
              : true
          )
        )
      );
    }
  };
  
  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (!query) {
      handleFilterChange(filterStatus);
      return;
    }
    
    const lowercaseQuery = query.toLowerCase();
    setFilteredOrders(
      orders.filter(order => 
        (filterStatus === "all" || order.status === filterStatus) &&
        (
          order.customerName.toLowerCase().includes(lowercaseQuery) ||
          order.id.toLowerCase().includes(lowercaseQuery)
        )
      )
    );
  };

  return (
    <DashboardLayout navItems={partnerNavItems} title="Orders Management">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Orders</h2>
            <p className="text-gray-500">Manage your restaurant's customer orders.</p>
          </div>
        </div>
        
        {/* Filters and Search */}
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input 
                type="search" 
                placeholder="Search by customer or order ID..." 
                className="pl-8"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <Select 
              value={filterStatus} 
              onValueChange={handleFilterChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="preparing">Preparing</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="delivering">Delivering</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <p className="text-sm text-gray-500">New Orders</p>
              <h3 className="text-2xl font-bold mt-1">
                {orders.filter(order => order.status === 'new').length}
              </h3>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <p className="text-sm text-gray-500">Preparing</p>
              <h3 className="text-2xl font-bold mt-1">
                {orders.filter(order => order.status === 'preparing').length}
              </h3>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <p className="text-sm text-gray-500">Ready</p>
              <h3 className="text-2xl font-bold mt-1">
                {orders.filter(order => order.status === 'ready').length}
              </h3>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <p className="text-sm text-gray-500">Delivering</p>
              <h3 className="text-2xl font-bold mt-1">
                {orders.filter(order => order.status === 'delivering').length}
              </h3>
            </CardContent>
          </Card>
        </div>
        
        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>
              Manage your customer orders and update their status.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredOrders.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell>{formatDate(order.orderDate)}</TableCell>
                      <TableCell>{formatCurrency(order.total)}</TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(order.status)} flex w-fit items-center gap-1`}>
                          {getStatusIcon(order.status)}
                          <span className="capitalize">{order.status}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleOrderSelect(order)}
                          >
                            <Search className="h-4 w-4" />
                            <span className="sr-only">View details</span>
                          </Button>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">More options</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {order.status === 'new' && (
                                <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'preparing')}>
                                  Start Preparing
                                </DropdownMenuItem>
                              )}
                              {order.status === 'preparing' && (
                                <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'ready')}>
                                  Mark as Ready
                                </DropdownMenuItem>
                              )}
                              {(order.status === 'new' || order.status === 'preparing') && (
                                <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'cancelled')}>
                                  Cancel Order
                                </DropdownMenuItem>
                              )}
                              {order.status === 'ready' && order.deliveryMethod === 'delivery' && (
                                <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'delivering')}>
                                  Hand to Driver
                                </DropdownMenuItem>
                              )}
                              {order.status === 'ready' && order.deliveryMethod === 'pickup' && (
                                <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'completed')}>
                                  Mark as Picked Up
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center h-64">
                <p className="text-gray-500 mb-2">No orders found</p>
                {searchQuery && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchQuery("");
                      handleFilterChange(filterStatus);
                    }}
                  >
                    Clear Search
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Order Details Dialog */}
      {selectedOrder && (
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>Order {selectedOrder.id}</span>
                <Badge className={`${getStatusColor(selectedOrder.status)} flex items-center gap-1`}>
                  {getStatusIcon(selectedOrder.status)}
                  <span className="capitalize">{selectedOrder.status}</span>
                </Badge>
              </DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">Order Items</h3>
                    <div className="mt-2 border rounded-md">
                      <ScrollArea className="h-64">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Item</TableHead>
                              <TableHead className="text-right">Qty</TableHead>
                              <TableHead className="text-right">Price</TableHead>
                              <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedOrder.items.map((item) => (
                              <TableRow key={item.id}>
                                <TableCell>
                                  <div>
                                    <p className="font-medium">{item.name}</p>
                                    {item.specialInstructions && (
                                      <p className="text-xs text-gray-500 mt-1">{item.specialInstructions}</p>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">{item.quantity}</TableCell>
                                <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                                <TableCell className="text-right">{formatCurrency(item.price * item.quantity)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </ScrollArea>
                      <div className="p-4 border-t">
                        <div className="flex justify-between font-medium">
                          <span>Total</span>
                          <span>{formatCurrency(selectedOrder.total)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <h3 className="text-lg font-medium mb-2">Update Order Status</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedOrder.status === 'new' && (
                        <Button onClick={() => handleStatusChange(selectedOrder.id, 'preparing')}>
                          Start Preparing
                        </Button>
                      )}
                      {selectedOrder.status === 'preparing' && (
                        <Button onClick={() => handleStatusChange(selectedOrder.id, 'ready')}>
                          Mark as Ready
                        </Button>
                      )}
                      {(selectedOrder.status === 'new' || selectedOrder.status === 'preparing') && (
                        <Button variant="destructive" onClick={() => handleStatusChange(selectedOrder.id, 'cancelled')}>
                          Cancel Order
                        </Button>
                      )}
                      {selectedOrder.status === 'ready' && selectedOrder.deliveryMethod === 'delivery' && (
                        <Button onClick={() => handleStatusChange(selectedOrder.id, 'delivering')}>
                          Hand to Driver
                        </Button>
                      )}
                      {selectedOrder.status === 'ready' && selectedOrder.deliveryMethod === 'pickup' && (
                        <Button onClick={() => handleStatusChange(selectedOrder.id, 'completed')}>
                          Mark as Picked Up
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="border rounded-md p-4">
                  <h3 className="text-lg font-medium mb-2">Customer Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <User className="h-4 w-4 mt-0.5 text-gray-500" />
                      <div>
                        <p className="font-medium">{selectedOrder.customerName}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Phone className="h-4 w-4 mt-0.5 text-gray-500" />
                      <div>
                        <p>{selectedOrder.customerPhone}</p>
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs mt-1">
                          Call Customer
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-md p-4">
                  <h3 className="text-lg font-medium mb-2">Order Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Order Date:</span>
                      <span>{formatDate(selectedOrder.orderDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Delivery Time:</span>
                      <span>{formatDate(selectedOrder.deliveryTime)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Payment Method:</span>
                      <span>{selectedOrder.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Delivery Method:</span>
                      <span className="capitalize">{selectedOrder.deliveryMethod}</span>
                    </div>
                  </div>
                </div>
                
                {selectedOrder.deliveryMethod === 'delivery' && (
                  <div className="border rounded-md p-4">
                    <h3 className="text-lg font-medium mb-2">Delivery Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-0.5 text-gray-500" />
                        <div>
                          <p className="font-medium">Delivery Address</p>
                          <p className="text-sm">{selectedOrder.customerAddress}</p>
                        </div>
                      </div>
                      
                      {selectedOrder.status === 'delivering' && selectedOrder.driverName && (
                        <>
                          <div className="flex items-start gap-2">
                            <User className="h-4 w-4 mt-0.5 text-gray-500" />
                            <div>
                              <p className="font-medium">Driver</p>
                              <p className="text-sm">{selectedOrder.driverName}</p>
                            </div>
                          </div>
                          
                          {selectedOrder.driverPhone && (
                            <div className="flex items-start gap-2">
                              <Phone className="h-4 w-4 mt-0.5 text-gray-500" />
                              <div>
                                <p className="text-sm">{selectedOrder.driverPhone}</p>
                                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs mt-1">
                                  Call Driver
                                </Button>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
                Close
              </Button>
              {(selectedOrder.status === 'new' || selectedOrder.status === 'preparing') && (
                <Button variant="destructive" onClick={() => {
                  handleStatusChange(selectedOrder.id, 'cancelled');
                  setIsDetailsOpen(false);
                }}>
                  Cancel Order
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </DashboardLayout>
  );
};

export default PartnerOrders; 