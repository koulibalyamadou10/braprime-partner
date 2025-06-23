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
import { Check, CreditCard, Edit, MoreVertical, Plus, Shield, Star, Trash, Wallet } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';

// Mock payment methods
const mockPaymentMethods = [
  {
    id: '1',
    type: 'credit_card',
    isDefault: true,
    cardNumber: '•••• •••• •••• 4242',
    cardHolder: 'Fatou Ndiaye',
    expiryDate: '05/25',
    brand: 'visa',
  },
  {
    id: '2',
    type: 'credit_card',
    isDefault: false,
    cardNumber: '•••• •••• •••• 5555',
    cardHolder: 'Fatou Ndiaye',
    expiryDate: '08/24',
    brand: 'mastercard',
  },
  {
    id: '3',
    type: 'mobile_money',
    isDefault: false,
    phoneNumber: '+221 78 123 4567',
    provider: 'Orange Money',
  },
];

const paymentFormSchema = z.object({
  type: z.enum(['credit_card', 'mobile_money'], {
    required_error: "Please select a payment method type",
  }),
  
  // Credit card fields
  cardNumber: z.string().optional()
    .refine(val => !val || val.replace(/\s/g, '').length === 16, {
      message: "Card number must be 16 digits",
    }),
  cardHolder: z.string().optional()
    .refine(val => !val || val.length >= 3, {
      message: "Cardholder name must be at least 3 characters",
    }),
  expiryMonth: z.string().optional(),
  expiryYear: z.string().optional(),
  cvv: z.string().optional()
    .refine(val => !val || (val.length >= 3 && val.length <= 4), {
      message: "CVV must be 3 or 4 digits",
    }),
  
  // Mobile money fields
  phoneNumber: z.string().optional()
    .refine(val => !val || val.replace(/\D/g, '').length >= 9, {
      message: "Phone number must be at least 9 digits",
    }),
  provider: z.string().optional(),
  
  isDefault: z.boolean().default(false),
}).refine(data => {
  if (data.type === 'credit_card') {
    return !!data.cardNumber && !!data.cardHolder && !!data.expiryMonth && !!data.expiryYear && !!data.cvv;
  } else if (data.type === 'mobile_money') {
    return !!data.phoneNumber && !!data.provider;
  }
  return false;
}, {
  message: "Please fill in all required fields for the selected payment method",
  path: ["type"],
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

const formatCardNumber = (value: string) => {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  const matches = v.match(/\d{4,16}/g);
  const match = matches && matches[0] || '';
  const parts = [];

  for (let i = 0, len = match.length; i < len; i += 4) {
    parts.push(match.substring(i, i + 4));
  }

  if (parts.length) {
    return parts.join(' ');
  } else {
    return value;
  }
};

const getCardBrandIcon = (brand: string) => {
  switch (brand.toLowerCase()) {
    case 'visa':
      return <div className="text-blue-600 font-bold">VISA</div>;
    case 'mastercard':
      return <div className="text-red-600 font-bold">MC</div>;
    case 'american express':
      return <div className="text-green-600 font-bold">AMEX</div>;
    default:
      return <CreditCard className="h-4 w-4" />;
  }
};

const getMonthOptions = () => {
  const options = [];
  for (let i = 1; i <= 12; i++) {
    const month = i.toString().padStart(2, '0');
    options.push(<SelectItem key={month} value={month}>{month}</SelectItem>);
  }
  return options;
};

const getYearOptions = () => {
  const options = [];
  const currentYear = new Date().getFullYear();
  for (let i = 0; i < 10; i++) {
    const year = (currentYear + i).toString();
    options.push(<SelectItem key={year} value={year}>{year}</SelectItem>);
  }
  return options;
};

const UserPayments = () => {
  const { currentUser } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState(mockPaymentMethods);
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
  const [savedCards, setSavedCards] = useState(true);
  
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      type: 'credit_card',
      cardNumber: '',
      cardHolder: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      phoneNumber: '',
      provider: '',
      isDefault: false,
    },
  });

  const watchPaymentType = form.watch('type');

  const handleEditPayment = (payment: typeof mockPaymentMethods[0]) => {
    if (payment.type === 'credit_card') {
      const [month, year] = payment.expiryDate.split('/');
      form.reset({
        type: payment.type,
        cardNumber: payment.cardNumber,
        cardHolder: payment.cardHolder,
        expiryMonth: month,
        expiryYear: `20${year}`,
        cvv: '',
        isDefault: payment.isDefault,
      });
    } else if (payment.type === 'mobile_money') {
      form.reset({
        type: payment.type,
        phoneNumber: payment.phoneNumber,
        provider: payment.provider,
        isDefault: payment.isDefault,
      });
    }
    
    setEditingPaymentId(payment.id);
    setIsAddingPayment(true);
  };

  const handleDeletePayment = (id: string) => {
    setPaymentMethods(paymentMethods.filter(payment => payment.id !== id));
  };

  const handleSetDefaultPayment = (id: string) => {
    setPaymentMethods(paymentMethods.map(payment => ({
      ...payment,
      isDefault: payment.id === id,
    })));
  };

  const onSubmit = (data: PaymentFormValues) => {
    if (editingPaymentId) {
      // Update existing payment method
      setPaymentMethods(paymentMethods.map(payment => {
        if (payment.id === editingPaymentId) {
          if (data.type === 'credit_card') {
            return {
              ...payment,
              type: data.type,
              cardNumber: data.cardNumber || payment.cardNumber,
              cardHolder: data.cardHolder || '',
              expiryDate: `${data.expiryMonth}/${data.expiryYear?.slice(-2)}`,
              isDefault: data.isDefault,
            };
          } else {
            return {
              ...payment,
              type: data.type,
              phoneNumber: data.phoneNumber || '',
              provider: data.provider || '',
              isDefault: data.isDefault,
            };
          }
        }
        
        // If we're setting this payment as default, remove default from others
        if (data.isDefault && payment.id !== editingPaymentId) {
          return { ...payment, isDefault: false };
        }
        
        return payment;
      }));
      setEditingPaymentId(null);
    } else {
      // Add new payment method
      let newPayment;
      
      if (data.type === 'credit_card') {
        newPayment = {
          id: `${paymentMethods.length + 1}`,
          type: data.type,
          cardNumber: `•••• •••• •••• ${data.cardNumber?.slice(-4)}`,
          cardHolder: data.cardHolder || '',
          expiryDate: `${data.expiryMonth}/${data.expiryYear?.slice(-2)}`,
          brand: detectCardBrand(data.cardNumber || ''),
          isDefault: data.isDefault,
        };
      } else {
        newPayment = {
          id: `${paymentMethods.length + 1}`,
          type: data.type,
          phoneNumber: data.phoneNumber || '',
          provider: data.provider || '',
          isDefault: data.isDefault,
        };
      }
      
      // If setting this as default or it's the first payment method
      if (data.isDefault || paymentMethods.length === 0) {
        setPaymentMethods([
          ...paymentMethods.map(p => ({ ...p, isDefault: false })),
          newPayment,
        ]);
      } else {
        setPaymentMethods([...paymentMethods, newPayment]);
      }
    }
    
    setIsAddingPayment(false);
    form.reset();
  };

  const detectCardBrand = (number: string) => {
    const cleanNumber = number.replace(/\D/g, '');
    
    if (cleanNumber.startsWith('4')) {
      return 'visa';
    } else if (/^5[1-5]/.test(cleanNumber)) {
      return 'mastercard';
    } else if (/^3[47]/.test(cleanNumber)) {
      return 'american express';
    } else {
      return 'unknown';
    }
  };

  return (
    <DashboardLayout navItems={userNavItems} title="Payment Methods">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Your Payment Methods</h2>
            <p className="text-gray-500">Manage your payment methods for faster checkout.</p>
          </div>
          <Dialog open={isAddingPayment} onOpenChange={setIsAddingPayment}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingPaymentId(null);
                form.reset({
                  type: 'credit_card',
                  cardNumber: '',
                  cardHolder: '',
                  expiryMonth: '',
                  expiryYear: '',
                  cvv: '',
                  phoneNumber: '',
                  provider: '',
                  isDefault: paymentMethods.length === 0 ? true : false,
                });
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Payment Method
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>{editingPaymentId ? 'Edit Payment Method' : 'Add Payment Method'}</DialogTitle>
                <DialogDescription>
                  {editingPaymentId 
                    ? 'Update your payment method details below.' 
                    : 'Fill in the details for your new payment method.'}
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Type</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex space-x-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="credit_card" id="credit_card" />
                              <Label htmlFor="credit_card" className="flex items-center">
                                <CreditCard className="h-4 w-4 mr-2" />
                                Credit Card
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="mobile_money" id="mobile_money" />
                              <Label htmlFor="mobile_money" className="flex items-center">
                                <Wallet className="h-4 w-4 mr-2" />
                                Mobile Money
                              </Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Credit Card Fields */}
                  {watchPaymentType === 'credit_card' && (
                    <>
                      <FormField
                        control={form.control}
                        name="cardNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Card Number</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="1234 5678 9012 3456" 
                                {...field}
                                onChange={(e) => {
                                  const formatted = formatCardNumber(e.target.value);
                                  field.onChange(formatted);
                                }}
                                maxLength={19}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="cardHolder"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cardholder Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="expiryMonth"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Expiry Month</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="MM" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {getMonthOptions()}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="expiryYear"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Expiry Year</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="YYYY" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {getYearOptions()}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="cvv"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CVV</FormLabel>
                              <FormControl>
                                <Input placeholder="123" {...field} maxLength={4} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </>
                  )}

                  {/* Mobile Money Fields */}
                  {watchPaymentType === 'mobile_money' && (
                    <>
                      <FormField
                        control={form.control}
                        name="phoneNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="+221 78 123 4567" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="provider"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Provider</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select provider" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Orange Money">Orange Money</SelectItem>
                                <SelectItem value="Wave">Wave</SelectItem>
                                <SelectItem value="MTN Mobile Money">MTN Mobile Money</SelectItem>
                                <SelectItem value="Free Money">Free Money</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

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
                          <FormLabel>Make this my default payment method</FormLabel>
                          <p className="text-sm text-gray-500">
                            This payment method will be used as default for purchases.
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddingPayment(false)} type="button">
                      Cancel
                    </Button>
                    <Button type="submit">{editingPaymentId ? 'Update Payment Method' : 'Add Payment Method'}</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Saved Cards & Payment Methods</CardTitle>
              <div className="flex items-center space-x-2">
                <Switch
                  id="saved-cards"
                  checked={savedCards}
                  onCheckedChange={setSavedCards}
                />
                <Label htmlFor="saved-cards" className="text-sm">
                  {savedCards ? 'Enabled' : 'Disabled'}
                </Label>
              </div>
            </div>
            <CardDescription>
              We securely store your payment information for faster checkout.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!savedCards ? (
              <div className="flex flex-col items-center justify-center py-6">
                <Shield className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Saved cards are disabled</h3>
                <p className="text-center text-muted-foreground mb-4">
                  You've chosen not to save payment methods. Enable this option for faster checkout.
                </p>
              </div>
            ) : paymentMethods.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6">
                <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No payment methods found</h3>
                <p className="text-center text-muted-foreground mb-4">
                  You haven't added any payment methods yet.
                  Add your first payment method to speed up checkout.
                </p>
                <Button onClick={() => setIsAddingPayment(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Payment Method
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {paymentMethods.map((payment) => (
                  <div key={payment.id} className={`flex items-center justify-between p-4 rounded-lg border ${payment.isDefault ? 'border-primary' : ''}`}>
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                        {payment.type === 'credit_card' 
                          ? getCardBrandIcon(payment.brand)
                          : <Wallet className="h-5 w-5 text-green-600" />
                        }
                      </div>
                      <div>
                        <div className="flex items-center">
                          <p className="font-medium">
                            {payment.type === 'credit_card' 
                              ? payment.cardNumber
                              : payment.provider
                            }
                          </p>
                          {payment.isDefault && (
                            <div className="ml-2 bg-primary/10 text-primary text-xs px-2 py-1 rounded-full flex items-center">
                              <Check className="h-3 w-3 mr-1" />
                              Default
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          {payment.type === 'credit_card' 
                            ? `Expires ${payment.expiryDate}`
                            : payment.phoneNumber
                          }
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {!payment.isDefault && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleSetDefaultPayment(payment.id)}
                        >
                          <Star className="h-4 w-4 mr-1" />
                          Set Default
                        </Button>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditPayment(payment)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeletePayment(payment.id)}
                            disabled={payment.isDefault}
                            className={payment.isDefault ? 'text-muted-foreground cursor-not-allowed' : 'text-destructive'}
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="border-t pt-6">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <p>Your payment information is stored securely and used only for your purchases.</p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default UserPayments; 