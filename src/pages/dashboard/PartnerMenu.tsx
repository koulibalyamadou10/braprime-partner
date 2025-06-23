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
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  MoreHorizontal,
  Filter,
  Image as ImageIcon,
  DollarSign,
  Clock,
  Check,
  X
} from 'lucide-react';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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

// Types for menu items
type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  available: boolean;
  popular: boolean;
  preparationTime: number; // in minutes
  options?: MenuItemOption[];
};

type MenuItemOption = {
  id: string;
  name: string;
  choices: {
    id: string;
    name: string;
    price: number;
  }[];
  required: boolean;
  multiple: boolean;
};

type MenuCategory = {
  id: string;
  name: string;
  order: number;
  active: boolean;
};

// Mock data for menu categories
const mockCategories: MenuCategory[] = [
  { id: 'cat1', name: 'Appetizers', order: 1, active: true },
  { id: 'cat2', name: 'Main Dishes', order: 2, active: true },
  { id: 'cat3', name: 'Sides', order: 3, active: true },
  { id: 'cat4', name: 'Beverages', order: 4, active: true },
  { id: 'cat5', name: 'Desserts', order: 5, active: true },
  { id: 'cat6', name: 'Seasonal Specials', order: 6, active: false },
];

// Mock data for menu items
const mockMenuItems: MenuItem[] = [
  {
    id: 'item1',
    name: 'Chicken Yassa',
    description: 'Marinated chicken with onions and mustard sauce, served with rice',
    price: 6000,
    image: '/images/chicken-yassa.jpg',
    category: 'cat2',
    available: true,
    popular: true,
    preparationTime: 20,
    options: [
      {
        id: 'opt1',
        name: 'Spice Level',
        choices: [
          { id: 'ch1', name: 'Mild', price: 0 },
          { id: 'ch2', name: 'Medium', price: 0 },
          { id: 'ch3', name: 'Spicy', price: 0 },
        ],
        required: true,
        multiple: false,
      },
      {
        id: 'opt2',
        name: 'Add Protein',
        choices: [
          { id: 'ch4', name: 'Extra Chicken', price: 1500 },
          { id: 'ch5', name: 'Add Fish', price: 2000 },
        ],
        required: false,
        multiple: false,
      }
    ]
  },
  {
    id: 'item2',
    name: 'Thieboudienne',
    description: 'Traditional Senegalese rice and fish dish with vegetables',
    price: 5500,
    image: '/images/thieboudienne.jpg',
    category: 'cat2',
    available: true,
    popular: true,
    preparationTime: 25,
  },
  {
    id: 'item3',
    name: 'Fataya',
    description: 'Deep-fried pastry filled with spiced meat or fish',
    price: 1500,
    image: '/images/fataya.jpg',
    category: 'cat1',
    available: true,
    popular: false,
    preparationTime: 15,
  },
  {
    id: 'item4',
    name: 'Bissap Juice',
    description: 'Sweet hibiscus flower juice',
    price: 1500,
    image: '/images/bissap.jpg',
    category: 'cat4',
    available: true,
    popular: true,
    preparationTime: 5,
  },
  {
    id: 'item5',
    name: 'Ginger Juice',
    description: 'Refreshing spicy ginger juice',
    price: 1500,
    image: '/images/ginger-juice.jpg',
    category: 'cat4',
    available: true,
    popular: false,
    preparationTime: 5,
  },
  {
    id: 'item6',
    name: 'Mafe',
    description: 'Meat stew with peanut sauce and vegetables',
    price: 5000,
    image: '/images/mafe.jpg',
    category: 'cat2',
    available: false,
    popular: false,
    preparationTime: 30,
  },
  {
    id: 'item7',
    name: 'Attieke with Grilled Fish',
    description: 'Fermented cassava with grilled fish and vegetables',
    price: 6500,
    image: '/images/attieke.jpg',
    category: 'cat2',
    available: true,
    popular: true,
    preparationTime: 20,
  },
  {
    id: 'item8',
    name: 'Sombi',
    description: 'Sweet rice pudding with coconut milk',
    price: 2500,
    image: '/images/sombi.jpg',
    category: 'cat5',
    available: true,
    popular: false,
    preparationTime: 15,
  },
];

// Form schema for menu item form
const menuItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  price: z.coerce.number().positive({
    message: "Price must be a positive number.",
  }),
  category: z.string({
    required_error: "Please select a category.",
  }),
  available: z.boolean().default(true),
  popular: z.boolean().default(false),
  preparationTime: z.coerce.number().positive({
    message: "Preparation time must be a positive number.",
  }),
  // Image would normally be handled separately with file upload
});

type MenuItemFormValues = z.infer<typeof menuItemSchema>;

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-SN', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0
  }).format(amount);
};

const PartnerMenu = () => {
  const { currentUser } = useAuth();
  
  // State for menu items and categories
  const [menuItems, setMenuItems] = useState<MenuItem[]>(mockMenuItems);
  const [categories, setCategories] = useState<MenuCategory[]>(mockCategories);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>(menuItems);
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // State for dialog
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<MenuItem | null>(null);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  
  // Initialize form
  const form = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      category: "",
      available: true,
      popular: false,
      preparationTime: 15,
    }
  });
  
  // Handle category filter change
  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    
    if (categoryId === "all") {
      setFilteredItems(
        searchQuery 
          ? menuItems.filter(item => 
              item.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
          : menuItems
      );
    } else {
      setFilteredItems(
        menuItems.filter(item => 
          item.category === categoryId &&
          (
            searchQuery
              ? item.name.toLowerCase().includes(searchQuery.toLowerCase())
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
      handleCategoryChange(activeCategory);
      return;
    }
    
    const lowercaseQuery = query.toLowerCase();
    setFilteredItems(
      menuItems.filter(item => 
        (activeCategory === "all" || item.category === activeCategory) &&
        item.name.toLowerCase().includes(lowercaseQuery)
      )
    );
  };
  
  // Open add dialog
  const handleAddItem = () => {
    setCurrentItem(null);
    setFormMode('add');
    form.reset({
      name: "",
      description: "",
      price: 0,
      category: categories[0]?.id || "",
      available: true,
      popular: false,
      preparationTime: 15,
    });
    setIsAddEditOpen(true);
  };
  
  // Open edit dialog
  const handleEditItem = (item: MenuItem) => {
    setCurrentItem(item);
    setFormMode('edit');
    form.reset({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      available: item.available,
      popular: item.popular,
      preparationTime: item.preparationTime,
    });
    setIsAddEditOpen(true);
  };
  
  // Open delete dialog
  const handleDeleteDialog = (item: MenuItem) => {
    setCurrentItem(item);
    setIsDeleteOpen(true);
  };
  
  // Delete menu item
  const handleDeleteItem = () => {
    if (!currentItem) return;
    
    setMenuItems(prevItems => prevItems.filter(item => item.id !== currentItem.id));
    setFilteredItems(prevItems => prevItems.filter(item => item.id !== currentItem.id));
    setIsDeleteOpen(false);
  };
  
  // Toggle item availability
  const toggleAvailability = (itemId: string) => {
    setMenuItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId ? { ...item, available: !item.available } : item
      )
    );
    setFilteredItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId ? { ...item, available: !item.available } : item
      )
    );
  };
  
  // Submit form handler
  const onSubmit = (data: MenuItemFormValues) => {
    if (formMode === 'add') {
      // Generate a new ID for the item
      const newItem: MenuItem = {
        id: `item${Date.now()}`,
        name: data.name,
        description: data.description,
        price: data.price,
        image: '/images/default-food.jpg', // Default image
        category: data.category,
        available: data.available,
        popular: data.popular,
        preparationTime: data.preparationTime,
      };
      
      setMenuItems(prevItems => [...prevItems, newItem]);
      if (activeCategory === 'all' || activeCategory === newItem.category) {
        setFilteredItems(prevItems => [...prevItems, newItem]);
      }
    } else if (formMode === 'edit' && currentItem) {
      // Update existing item
      const updatedItem: MenuItem = {
        ...currentItem,
        name: data.name,
        description: data.description,
        price: data.price,
        category: data.category,
        available: data.available,
        popular: data.popular,
        preparationTime: data.preparationTime,
      };
      
      setMenuItems(prevItems => 
        prevItems.map(item => item.id === currentItem.id ? updatedItem : item)
      );
      
      setFilteredItems(prevItems => {
        // If the category changed and we're filtering by category,
        // we might need to remove the item from the filtered list
        if (activeCategory !== 'all' && updatedItem.category !== activeCategory) {
          return prevItems.filter(item => item.id !== currentItem.id);
        }
        return prevItems.map(item => item.id === currentItem.id ? updatedItem : item);
      });
    }
    
    setIsAddEditOpen(false);
  };
  
  // Get category name by id
  const getCategoryName = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId)?.name || "Unknown";
  };

  return (
    <DashboardLayout navItems={partnerNavItems} title="Menu Management">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Menu</h2>
            <p className="text-gray-500">Manage your restaurant's food menu and categories.</p>
          </div>
          <Button onClick={handleAddItem} className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add Menu Item
          </Button>
        </div>
        
        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input 
                type="search" 
                placeholder="Search menu items..." 
                className="pl-8"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        {/* Category Tabs */}
        <Tabs 
          defaultValue="all" 
          className="space-y-4" 
          value={activeCategory}
          onValueChange={handleCategoryChange}
        >
          <TabsList className="flex flex-wrap h-auto">
            <TabsTrigger value="all">All Items</TabsTrigger>
            {categories
              .filter(cat => cat.active)
              .sort((a, b) => a.order - b.order)
              .map(category => (
                <TabsTrigger key={category.id} value={category.id}>
                  {category.name}
                </TabsTrigger>
              ))}
          </TabsList>
          
          <TabsContent value={activeCategory} className="space-y-4">
            {/* Menu Items Table */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {activeCategory === 'all' 
                    ? 'All Menu Items' 
                    : getCategoryName(activeCategory)}
                </CardTitle>
                <CardDescription>
                  {filteredItems.length} items
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredItems.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Prep Time</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {item.image && (
                                <div className="h-10 w-10 rounded overflow-hidden bg-gray-100 flex items-center justify-center">
                                  {item.image.startsWith('/') ? (
                                    <ImageIcon className="h-5 w-5 text-gray-400" />
                                  ) : (
                                    <img 
                                      src={item.image} 
                                      alt={item.name}
                                      className="h-10 w-10 object-cover" 
                                    />
                                  )}
                                </div>
                              )}
                              <div>
                                <p className="font-medium">{item.name}</p>
                                <p className="text-xs text-gray-500 truncate max-w-[200px]">
                                  {item.description}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{getCategoryName(item.category)}</TableCell>
                          <TableCell>{formatCurrency(item.price)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5 text-gray-500" />
                              <span>{item.preparationTime} min</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant={item.available ? "outline" : "secondary"}
                                className="flex items-center gap-1"
                              >
                                {item.available ? 
                                  <Check className="h-3 w-3" /> : 
                                  <X className="h-3 w-3" />
                                }
                                {item.available ? 'Available' : 'Unavailable'}
                              </Badge>
                              {item.popular && (
                                <Badge variant="default" className="bg-orange-500">
                                  Popular
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => toggleAvailability(item.id)}
                                title={item.available ? "Mark as unavailable" : "Mark as available"}
                              >
                                {item.available ? 
                                  <X className="h-4 w-4" /> : 
                                  <Check className="h-4 w-4" />
                                }
                              </Button>
                              
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleEditItem(item)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Item
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteDialog(item)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Item
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="py-24 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <ImageIcon className="h-6 w-6 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium">No menu items found</h3>
                    <p className="text-gray-500 mt-1 mb-4 max-w-md">
                      {searchQuery 
                        ? `No items matching "${searchQuery}"` 
                        : "This category has no items yet. Add a new menu item to get started."}
                    </p>
                    {searchQuery ? (
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setSearchQuery("");
                          handleCategoryChange(activeCategory);
                        }}
                      >
                        Clear Search
                      </Button>
                    ) : (
                      <Button onClick={handleAddItem}>
                        <Plus className="h-4 w-4 mr-2" /> Add Menu Item
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Add/Edit Menu Item Dialog */}
      <Dialog open={isAddEditOpen} onOpenChange={setIsAddEditOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>
              {formMode === 'add' ? 'Add New Menu Item' : 'Edit Menu Item'}
            </DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Chicken Yassa" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Marinated chicken with onions and mustard sauce..." 
                        className="resize-none min-h-[80px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (XOF)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                          <Input 
                            type="number" 
                            className="pl-9" 
                            {...field} 
                            onChange={e => field.onChange(e.target.valueAsNumber || 0)}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="preparationTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prep Time (minutes)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Clock className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                          <Input 
                            type="number" 
                            className="pl-9" 
                            {...field} 
                            onChange={e => field.onChange(e.target.valueAsNumber || 0)}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories
                          .filter(cat => cat.active)
                          .sort((a, b) => a.order - b.order)
                          .map(category => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="available"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Available</FormLabel>
                        <FormDescription>
                          Item can be ordered by customers
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="popular"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Mark as Popular</FormLabel>
                        <FormDescription>
                          Highlight as a popular item
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="pt-4 space-x-2 flex justify-end">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddEditOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {formMode === 'add' ? 'Add Item' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Menu Item</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p>Are you sure you want to delete <strong>{currentItem?.name}</strong>?</p>
            <p className="text-gray-500 text-sm mt-2">
              This action cannot be undone. This will permanently remove the item from your menu.
            </p>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteItem}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default PartnerMenu; 