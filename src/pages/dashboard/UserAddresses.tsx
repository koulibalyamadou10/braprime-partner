import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout, { userNavItems } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Check, Edit, MapPin, MoreVertical, Plus, Trash } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

// Mock user addresses
const mockAddresses = [
  {
    id: '1',
    type: 'home',
    isDefault: true,
    street: '123 Main St',
    apartment: 'Apt 4B',
    city: 'Conakry',
    state: 'Conakry',
    postalCode: '11000',
    country: 'Guinea',
  },
  {
    id: '2',
    type: 'work',
    isDefault: false,
    street: '456 Business Ave',
    apartment: '3rd Floor',
    city: 'Conakry',
    state: 'Conakry',
    postalCode: '11000',
    country: 'Guinea',
  },
  {
    id: '3',
    type: 'other',
    isDefault: false,
    street: '789 Beach Road',
    apartment: '',
    city: 'Saly',
    state: 'Saly',
    postalCode: '33000',
    country: 'Guinea',
  },
];

const addressFormSchema = z.object({
  type: z.string({
    required_error: "Please select an address type",
  }),
  street: z.string().min(3, {
    message: "Street address must be at least 3 characters",
  }),
  apartment: z.string().optional(),
  city: z.string().min(2, {
    message: "City must be at least 2 characters",
  }),
  state: z.string().min(2, {
    message: "State must be at least 2 characters",
  }),
  postalCode: z.string().min(2, {
    message: "Postal code must be at least 2 characters",
  }),
  country: z.string().min(2, {
    message: "Country must be at least 2 characters",
  }),
  isDefault: z.boolean().optional().default(false),
});

type AddressFormValues = z.infer<typeof addressFormSchema>;

const UserAddresses = () => {
  const { currentUser } = useAuth();
  const [addresses, setAddresses] = useState(mockAddresses);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  
  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      type: 'home',
      street: '',
      apartment: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'Guinea',
      isDefault: false,
    },
  });

  const handleEditAddress = (address: typeof mockAddresses[0]) => {
    form.reset({
      type: address.type,
      street: address.street,
      apartment: address.apartment,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      isDefault: address.isDefault,
    });
    setEditingAddressId(address.id);
    setIsAddingAddress(true);
  };

  const handleDeleteAddress = (id: string) => {
    setAddresses(addresses.filter(address => address.id !== id));
  };

  const handleSetDefaultAddress = (id: string) => {
    setAddresses(addresses.map(address => ({
      ...address,
      isDefault: address.id === id,
    })));
  };

  const onSubmit = (data: AddressFormValues) => {
    if (editingAddressId) {
      // Update existing address
      setAddresses(addresses.map(address => {
        if (address.id === editingAddressId) {
          return {
            ...address,
            ...data,
          };
        }
        
        // If we're setting this address as default, remove default from others
        if (data.isDefault && address.id !== editingAddressId) {
          return { ...address, isDefault: false };
        }
        
        return address;
      }));
      setEditingAddressId(null);
    } else {
      // Add new address
      const newAddress = {
        id: `${addresses.length + 1}`,
        ...data,
      };
      
      // If setting this as default or it's the first address
      if (data.isDefault || addresses.length === 0) {
        setAddresses([
          ...addresses.map(a => ({ ...a, isDefault: false })),
          newAddress,
        ]);
      } else {
        setAddresses([...addresses, newAddress]);
      }
    }
    
    setIsAddingAddress(false);
    form.reset();
  };

  return (
    <DashboardLayout navItems={userNavItems} title="Delivery Addresses">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Your Delivery Addresses</h2>
            <p className="text-gray-500">Manage your delivery addresses for faster checkout.</p>
          </div>
          <Dialog open={isAddingAddress} onOpenChange={setIsAddingAddress}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingAddressId(null);
                form.reset({
                  type: 'home',
                  street: '',
                  apartment: '',
                  city: '',
                  state: '',
                  postalCode: '',
                  country: 'Senegal',
                  isDefault: addresses.length === 0 ? true : false,
                });
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Add New Address
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>{editingAddressId ? 'Edit Address' : 'Add New Address'}</DialogTitle>
                <DialogDescription>
                  {editingAddressId 
                    ? 'Update your address details below.' 
                    : 'Fill in the details for your new delivery address.'}
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address Type</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex space-x-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="home" id="home" />
                              <Label htmlFor="home">Home</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="work" id="work" />
                              <Label htmlFor="work">Work</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="other" id="other" />
                              <Label htmlFor="other">Other</Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Main St" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="apartment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Apartment, Suite, etc. (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Apt 4B" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="Dakar" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State/Province</FormLabel>
                          <FormControl>
                            <Input placeholder="Dakar" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="postalCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Postal Code</FormLabel>
                          <FormControl>
                            <Input placeholder="11000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a country" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Senegal">Senegal</SelectItem>
                              <SelectItem value="Gambia">Gambia</SelectItem>
                              <SelectItem value="Guinea">Guinea</SelectItem>
                              <SelectItem value="Guinea-Bissau">Guinea-Bissau</SelectItem>
                              <SelectItem value="Mali">Mali</SelectItem>
                              <SelectItem value="Mauritania">Mauritania</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="isDefault"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Make this my default address</FormLabel>
                          <p className="text-sm text-gray-500">
                            This address will be used as default for deliveries.
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddingAddress(false)} type="button">
                      Cancel
                    </Button>
                    <Button type="submit">{editingAddressId ? 'Update Address' : 'Add Address'}</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {addresses.map((address) => (
            <Card key={address.id} className={`border ${address.isDefault ? 'border-primary' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-lg capitalize">{address.type}</CardTitle>
                  </div>
                  {address.isDefault && (
                    <div className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full flex items-center">
                      <Check className="h-3 w-3 mr-1" />
                      Default
                    </div>
                  )}
                </div>
                <CardDescription>
                  {address.street}
                  {address.apartment && `, ${address.apartment}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  {address.city}, {address.state} {address.postalCode}
                </p>
                <p className="text-sm">{address.country}</p>
              </CardContent>
              <CardFooter className="flex justify-between">
                {!address.isDefault && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleSetDefaultAddress(address.id)}
                  >
                    Set as Default
                  </Button>
                )}
                {address.isDefault && <div />}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEditAddress(address)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDeleteAddress(address.id)}
                      disabled={address.isDefault}
                      className={address.isDefault ? 'text-muted-foreground cursor-not-allowed' : 'text-destructive'}
                    >
                      <Trash className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardFooter>
            </Card>
          ))}
        </div>

        {addresses.length === 0 && (
          <Card className="border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No addresses found</h3>
              <p className="text-center text-muted-foreground mb-4">
                You haven't added any delivery addresses yet.
                Add your first address to speed up checkout.
              </p>
              <Button onClick={() => setIsAddingAddress(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Address
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default UserAddresses; 