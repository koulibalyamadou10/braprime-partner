import { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { partnerNavItems } from './PartnerOrders';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Calendar as CalendarIcon,
  Check,
  Clock,
  Search,
  User,
  Users,
  Phone,
  XCircle,
  Clock4,
  Filter,
  ClipboardList,
  MoreHorizontal
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from 'date-fns';

// Types for reservations
type ReservationStatus = 'confirmed' | 'pending' | 'cancelled' | 'completed' | 'no-show';

type Reservation = {
  id: string;
  customerName: string;
  customerPhone: string;
  email: string;
  date: Date;
  time: string;
  partySize: number;
  specialRequests?: string;
  status: ReservationStatus;
  tableNumber?: string;
};

// Mock reservations data
const mockReservations: Reservation[] = [
  {
    id: "RES-1234",
    customerName: "Aminata Diop",
    customerPhone: "+221781234567",
    email: "aminata.diop@example.com",
    date: new Date(2023, 5, 25, 19, 30),
    time: "19:30",
    partySize: 4,
    specialRequests: "Window table if possible",
    status: "confirmed",
    tableNumber: "T12"
  },
  {
    id: "RES-1235",
    customerName: "Ibrahim Sow",
    customerPhone: "+221777654321",
    email: "ibrahim.sow@example.com",
    date: new Date(2023, 5, 25, 20, 0),
    time: "20:00",
    partySize: 2,
    status: "confirmed",
    tableNumber: "T5"
  },
  {
    id: "RES-1236",
    customerName: "Fatou Ndiaye",
    customerPhone: "+221765551234",
    email: "fatou.ndiaye@example.com",
    date: new Date(2023, 5, 25, 20, 30),
    time: "20:30",
    partySize: 6,
    specialRequests: "Birthday celebration, cake will be brought in",
    status: "pending"
  },
  {
    id: "RES-1237",
    customerName: "Moussa Diallo",
    customerPhone: "+221783334444",
    email: "moussa.diallo@example.com",
    date: new Date(2023, 5, 26, 19, 0),
    time: "19:00",
    partySize: 3,
    status: "confirmed",
    tableNumber: "T8"
  },
  {
    id: "RES-1238",
    customerName: "Aissatou Ba",
    customerPhone: "+221765559876",
    email: "aissatou.ba@example.com",
    date: new Date(2023, 5, 26, 20, 30),
    time: "20:30",
    partySize: 2,
    status: "confirmed",
    tableNumber: "T3"
  },
  {
    id: "RES-1239",
    customerName: "Ousmane Gueye",
    customerPhone: "+221772223333",
    email: "ousmane.gueye@example.com",
    date: new Date(2023, 5, 24, 19, 30),
    time: "19:30",
    partySize: 5,
    specialRequests: "One vegetarian meal",
    status: "completed",
    tableNumber: "T15"
  },
  {
    id: "RES-1240",
    customerName: "Mariama Seck",
    customerPhone: "+221764445555",
    email: "mariama.seck@example.com",
    date: new Date(2023, 5, 24, 20, 0),
    time: "20:00",
    partySize: 4,
    status: "no-show"
  },
  {
    id: "RES-1241",
    customerName: "Abdou Diop",
    customerPhone: "+221781112222",
    email: "abdou.diop@example.com",
    date: new Date(2023, 5, 24, 18, 30),
    time: "18:30",
    partySize: 2,
    status: "cancelled"
  }
];

// Helper function to get status color
const getStatusColor = (status: ReservationStatus) => {
  switch (status) {
    case 'confirmed':
      return "bg-green-100 text-green-800";
    case 'pending':
      return "bg-yellow-100 text-yellow-800";
    case 'cancelled':
      return "bg-red-100 text-red-800";
    case 'completed':
      return "bg-blue-100 text-blue-800";
    case 'no-show':
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Helper function to get status icon
const getStatusIcon = (status: ReservationStatus) => {
  switch (status) {
    case 'confirmed':
      return <Check className="h-4 w-4" />;
    case 'pending':
      return <Clock className="h-4 w-4" />;
    case 'cancelled':
      return <XCircle className="h-4 w-4" />;
    case 'completed':
      return <Check className="h-4 w-4" />;
    case 'no-show':
      return <XCircle className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

const PartnerReservations = () => {
  const { currentUser } = useAuth();
  
  // State for reservations
  const [reservations, setReservations] = useState<Reservation[]>(mockReservations);
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>(mockReservations);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // State for selected reservation
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  // Filter reservations by date and status
  const filterReservations = () => {
    let filtered = [...reservations];
    
    // Filter by date if selected
    if (selectedDate) {
      filtered = filtered.filter(res => 
        res.date.getDate() === selectedDate.getDate() &&
        res.date.getMonth() === selectedDate.getMonth() &&
        res.date.getFullYear() === selectedDate.getFullYear()
      );
    }
    
    // Filter by status if not "all"
    if (selectedStatus !== "all") {
      filtered = filtered.filter(res => res.status === selectedStatus);
    }
    
    // Filter by search query if present
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(res => 
        res.customerName.toLowerCase().includes(query) ||
        res.id.toLowerCase().includes(query) ||
        res.customerPhone.includes(query)
      );
    }
    
    setFilteredReservations(filtered);
  };
  
  // Handle date change
  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      let filtered = [...reservations];
      
      filtered = filtered.filter(res => 
        res.date.getDate() === date.getDate() &&
        res.date.getMonth() === date.getMonth() &&
        res.date.getFullYear() === date.getFullYear()
      );
      
      if (selectedStatus !== "all") {
        filtered = filtered.filter(res => res.status === selectedStatus);
      }
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(res => 
          res.customerName.toLowerCase().includes(query) ||
          res.id.toLowerCase().includes(query) ||
          res.customerPhone.includes(query)
        );
      }
      
      setFilteredReservations(filtered);
    } else {
      filterReservations();
    }
  };
  
  // Handle status change
  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    
    let filtered = [...reservations];
    
    if (selectedDate) {
      filtered = filtered.filter(res => 
        res.date.getDate() === selectedDate.getDate() &&
        res.date.getMonth() === selectedDate.getMonth() &&
        res.date.getFullYear() === selectedDate.getFullYear()
      );
    }
    
    if (status !== "all") {
      filtered = filtered.filter(res => res.status === status);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(res => 
        res.customerName.toLowerCase().includes(query) ||
        res.id.toLowerCase().includes(query) ||
        res.customerPhone.includes(query)
      );
    }
    
    setFilteredReservations(filtered);
  };
  
  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    let filtered = [...reservations];
    
    if (selectedDate) {
      filtered = filtered.filter(res => 
        res.date.getDate() === selectedDate.getDate() &&
        res.date.getMonth() === selectedDate.getMonth() &&
        res.date.getFullYear() === selectedDate.getFullYear()
      );
    }
    
    if (selectedStatus !== "all") {
      filtered = filtered.filter(res => res.status === selectedStatus);
    }
    
    if (query) {
      const lowercaseQuery = query.toLowerCase();
      filtered = filtered.filter(res => 
        res.customerName.toLowerCase().includes(lowercaseQuery) ||
        res.id.toLowerCase().includes(lowercaseQuery) ||
        res.customerPhone.includes(lowercaseQuery)
      );
    }
    
    setFilteredReservations(filtered);
  };
  
  // Handle view reservation details
  const handleViewReservation = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setIsDetailsOpen(true);
  };
  
  // Handle update reservation status
  const handleUpdateStatus = (reservationId: string, newStatus: ReservationStatus) => {
    const updatedReservations = reservations.map(res => 
      res.id === reservationId ? { ...res, status: newStatus } : res
    );
    
    setReservations(updatedReservations);
    
    // Also update filtered reservations
    const updatedFiltered = filteredReservations.map(res => 
      res.id === reservationId ? { ...res, status: newStatus } : res
    );
    
    setFilteredReservations(updatedFiltered);
    
    // If we're filtering by status, we might need to remove this reservation
    if (selectedStatus !== "all" && selectedStatus !== newStatus) {
      setFilteredReservations(prevFiltered => 
        prevFiltered.filter(res => res.id !== reservationId)
      );
    }
    
    // Update selected reservation if it's the one we're viewing
    if (selectedReservation && selectedReservation.id === reservationId) {
      setSelectedReservation({ ...selectedReservation, status: newStatus });
    }
  };
  
  // Handle assign table
  const handleAssignTable = (reservationId: string, tableNumber: string) => {
    const updatedReservations = reservations.map(res => 
      res.id === reservationId ? { ...res, tableNumber } : res
    );
    
    setReservations(updatedReservations);
    
    // Also update filtered reservations
    const updatedFiltered = filteredReservations.map(res => 
      res.id === reservationId ? { ...res, tableNumber } : res
    );
    
    setFilteredReservations(updatedFiltered);
    
    // Update selected reservation if it's the one we're viewing
    if (selectedReservation && selectedReservation.id === reservationId) {
      setSelectedReservation({ ...selectedReservation, tableNumber });
    }
  };

  return (
    <DashboardLayout navItems={partnerNavItems} title="Reservations">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Reservations</h2>
          <p className="text-gray-500">Manage your restaurant's reservations and table assignments.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Calendar and Filters */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Select Date</CardTitle>
              <CardDescription>
                Filter reservations by date
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateChange}
                className="border rounded-md"
              />
              
              <div className="space-y-2 pt-4 border-t">
                <Label>Filter by Status</Label>
                <Select value={selectedStatus} onValueChange={handleStatusChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="no-show">No-show</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2 pt-4 border-t">
                <Label>Search</Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input 
                    type="search" 
                    placeholder="Search by name or ID..." 
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Reservation Summary</h3>
                  {selectedDate && (
                    <span className="text-sm text-gray-500">
                      {format(selectedDate, 'PP')}
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                    <Users className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Total Guests</p>
                      <p className="text-xl font-bold">
                        {filteredReservations.reduce((sum, res) => sum + res.partySize, 0)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                    <ClipboardList className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Reservations</p>
                      <p className="text-xl font-bold">{filteredReservations.length}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Reservations List */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>
                {selectedDate 
                  ? `Reservations for ${format(selectedDate, 'PP')}` 
                  : 'All Reservations'}
              </CardTitle>
              <CardDescription>
                {filteredReservations.length} reservations found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredReservations.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Party</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Table</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReservations
                      .sort((a, b) => a.time.localeCompare(b.time))
                      .map((reservation) => (
                        <TableRow key={reservation.id}>
                          <TableCell className="font-medium">{reservation.id}</TableCell>
                          <TableCell>{reservation.customerName}</TableCell>
                          <TableCell>{reservation.time}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Users className="h-3.5 w-3.5 text-gray-500" />
                              <span>{reservation.partySize}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${getStatusColor(reservation.status)} flex w-fit items-center gap-1`}>
                              {getStatusIcon(reservation.status)}
                              <span className="capitalize">{reservation.status}</span>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {reservation.tableNumber || (
                              <span className="text-gray-500 text-sm">Not assigned</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleViewReservation(reservation)}
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
                                  {reservation.status === 'pending' && (
                                    <DropdownMenuItem onClick={() => handleUpdateStatus(reservation.id, 'confirmed')}>
                                      Confirm Reservation
                                    </DropdownMenuItem>
                                  )}
                                  {(reservation.status === 'pending' || reservation.status === 'confirmed') && (
                                    <DropdownMenuItem onClick={() => handleUpdateStatus(reservation.id, 'cancelled')}>
                                      Cancel Reservation
                                    </DropdownMenuItem>
                                  )}
                                  {reservation.status === 'confirmed' && (
                                    <DropdownMenuItem onClick={() => handleUpdateStatus(reservation.id, 'completed')}>
                                      Mark as Completed
                                    </DropdownMenuItem>
                                  )}
                                  {reservation.status === 'confirmed' && (
                                    <DropdownMenuItem onClick={() => handleUpdateStatus(reservation.id, 'no-show')}>
                                      Mark as No-Show
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
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <CalendarIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium">No Reservations Found</h3>
                  <p className="text-gray-500 mt-2 max-w-md text-center">
                    {searchQuery 
                      ? `No reservations match your search for "${searchQuery}"`
                      : selectedDate 
                        ? `No reservations for ${format(selectedDate, 'PP')}`
                        : "No reservations found with the current filters."
                    }
                  </p>
                  {(searchQuery || selectedStatus !== "all" || selectedDate) && (
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedStatus("all");
                        setSelectedDate(undefined);
                        setFilteredReservations(reservations);
                      }}
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Reservation Details Dialog */}
      {selectedReservation && (
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>Reservation {selectedReservation.id}</span>
                <Badge className={`${getStatusColor(selectedReservation.status)} flex items-center gap-1`}>
                  {getStatusIcon(selectedReservation.status)}
                  <span className="capitalize">{selectedReservation.status}</span>
                </Badge>
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Customer</h3>
                  <div className="mt-1 flex items-start gap-2">
                    <User className="h-4 w-4 mt-0.5 text-gray-500" />
                    <div>
                      <p className="font-medium">{selectedReservation.customerName}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Contact</h3>
                  <div className="mt-1 flex items-start gap-2">
                    <Phone className="h-4 w-4 mt-0.5 text-gray-500" />
                    <div>
                      <p>{selectedReservation.customerPhone}</p>
                      <p className="text-sm text-gray-500">{selectedReservation.email}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Date & Time</h3>
                  <div className="mt-1 flex items-start gap-2">
                    <CalendarIcon className="h-4 w-4 mt-0.5 text-gray-500" />
                    <div>
                      <p className="font-medium">{format(selectedReservation.date, 'PP')}</p>
                      <p>{selectedReservation.time}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Party Size</h3>
                  <div className="mt-1 flex items-start gap-2">
                    <Users className="h-4 w-4 mt-0.5 text-gray-500" />
                    <div>
                      <p className="font-medium">{selectedReservation.partySize} {selectedReservation.partySize === 1 ? 'person' : 'people'}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {selectedReservation.specialRequests && (
                <div className="pt-2 border-t">
                  <h3 className="text-sm font-medium text-gray-500">Special Requests</h3>
                  <p className="mt-1 text-sm">{selectedReservation.specialRequests}</p>
                </div>
              )}
              
              <div className="pt-2 border-t">
                <h3 className="text-sm font-medium text-gray-500">Table Assignment</h3>
                {selectedReservation.tableNumber ? (
                  <div className="mt-1 flex items-center justify-between">
                    <p className="font-medium">Table {selectedReservation.tableNumber}</p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const newTable = prompt("Enter new table number:", selectedReservation.tableNumber);
                        if (newTable) {
                          handleAssignTable(selectedReservation.id, newTable);
                        }
                      }}
                    >
                      Change
                    </Button>
                  </div>
                ) : (
                  <div className="mt-1 flex justify-between items-center">
                    <p className="text-sm text-gray-500">No table assigned</p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const newTable = prompt("Enter table number:");
                        if (newTable) {
                          handleAssignTable(selectedReservation.id, newTable);
                        }
                      }}
                    >
                      Assign Table
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="pt-4 border-t">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Update Status</h3>
                <div className="grid grid-cols-2 gap-2">
                  {selectedReservation.status === 'pending' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="justify-start"
                      onClick={() => handleUpdateStatus(selectedReservation.id, 'confirmed')}
                    >
                      <Check className="h-4 w-4 mr-2" /> Confirm
                    </Button>
                  )}
                  {(selectedReservation.status === 'pending' || selectedReservation.status === 'confirmed') && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="justify-start text-red-600"
                      onClick={() => handleUpdateStatus(selectedReservation.id, 'cancelled')}
                    >
                      <XCircle className="h-4 w-4 mr-2" /> Cancel
                    </Button>
                  )}
                  {selectedReservation.status === 'confirmed' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="justify-start"
                      onClick={() => handleUpdateStatus(selectedReservation.id, 'completed')}
                    >
                      <Check className="h-4 w-4 mr-2" /> Complete
                    </Button>
                  )}
                  {selectedReservation.status === 'confirmed' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="justify-start"
                      onClick={() => handleUpdateStatus(selectedReservation.id, 'no-show')}
                    >
                      <XCircle className="h-4 w-4 mr-2" /> No-Show
                    </Button>
                  )}
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </DashboardLayout>
  );
};

export default PartnerReservations; 