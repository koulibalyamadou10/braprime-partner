import React, { useState } from 'react';
import DashboardLayout, { partnerNavItems } from '../../components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Switch } from '../../components/ui/switch';
import { useToast } from '../../components/ui/use-toast';
import { X, Upload, Edit, Check } from 'lucide-react';

const PartnerProfile = () => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState("/placeholder-restaurant.jpg");
  const [coverImage, setCoverImage] = useState("/placeholder-cover.jpg");
  
  const [profileData, setProfileData] = useState({
    name: "Tasty Bites Restaurant",
    email: "contact@tastybites.com",
    phone: "(555) 123-4567",
    description: "A family-owned restaurant serving delicious homemade meals with fresh ingredients since 2010.",
    address: "123 Food Street, Cuisine District, NY 10001",
    cuisine: "International",
    openingHours: "Mon-Fri: 11:00 AM - 10:00 PM, Sat-Sun: 10:00 AM - 11:00 PM",
    delivery: true,
    pickup: true,
    minOrderValue: "15.00",
    deliveryFee: "3.50",
    averagePreparationTime: "25",
    website: "https://tastybites-restaurant.com",
    socials: {
      facebook: "tastybites",
      instagram: "tastybites_official",
      twitter: "tastybites"
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setProfileData((prev) => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSocialsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      socials: {
        ...prev.socials,
        [name]: value
      }
    }));
  };

  const handleSave = () => {
    setIsEditing(false);
    toast({
      title: "Profile updated",
      description: "Your restaurant profile has been successfully updated.",
    });
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCoverImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <DashboardLayout navItems={partnerNavItems}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Restaurant Profile</h2>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Check className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>
          )}
        </div>

        <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
          <img 
            src={coverImage} 
            alt="Restaurant cover" 
            className="w-full h-full object-cover"
          />
          {isEditing && (
            <div className="absolute bottom-4 right-4">
              <label htmlFor="cover-upload" className="cursor-pointer">
                <div className="bg-primary text-white p-2 rounded-full">
                  <Upload className="h-5 w-5" />
                </div>
                <input 
                  id="cover-upload" 
                  type="file" 
                  accept="image/*" 
                  className="hidden"
                  onChange={handleCoverImageChange}
                />
              </label>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardContent className="pt-6 flex flex-col items-center">
              <div className="relative mb-4">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={profileImage} alt="Restaurant logo" />
                  <AvatarFallback>TB</AvatarFallback>
                </Avatar>
                {isEditing && (
                  <label htmlFor="profile-upload" className="absolute bottom-0 right-0 cursor-pointer">
                    <div className="bg-primary text-white p-2 rounded-full">
                      <Upload className="h-4 w-4" />
                    </div>
                    <input 
                      id="profile-upload" 
                      type="file" 
                      accept="image/*" 
                      className="hidden"
                      onChange={handleProfileImageChange}
                    />
                  </label>
                )}
              </div>
              <h3 className="text-xl font-semibold text-center">{profileData.name}</h3>
              <p className="text-muted-foreground text-center">{profileData.cuisine} Cuisine</p>
              
              <div className="w-full mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Delivery</span>
                  <Switch 
                    checked={profileData.delivery} 
                    onCheckedChange={(checked) => handleSwitchChange('delivery', checked)} 
                    disabled={!isEditing}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Pickup</span>
                  <Switch 
                    checked={profileData.pickup} 
                    onCheckedChange={(checked) => handleSwitchChange('pickup', checked)} 
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Restaurant Information</CardTitle>
              <CardDescription>
                Manage your restaurant's profile information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="basic">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="business">Business Details</TabsTrigger>
                  <TabsTrigger value="socials">Social Media</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Restaurant Name</Label>
                      <Input 
                        id="name" 
                        name="name" 
                        value={profileData.name} 
                        onChange={handleInputChange} 
                        disabled={!isEditing} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cuisine">Cuisine Type</Label>
                      <Select 
                        disabled={!isEditing}
                        value={profileData.cuisine}
                        onValueChange={(value) => setProfileData(prev => ({...prev, cuisine: value}))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select cuisine type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="International">International</SelectItem>
                          <SelectItem value="Italian">Italian</SelectItem>
                          <SelectItem value="Mexican">Mexican</SelectItem>
                          <SelectItem value="Asian">Asian</SelectItem>
                          <SelectItem value="American">American</SelectItem>
                          <SelectItem value="Mediterranean">Mediterranean</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        name="email" 
                        type="email"
                        value={profileData.email} 
                        onChange={handleInputChange} 
                        disabled={!isEditing} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input 
                        id="phone" 
                        name="phone" 
                        value={profileData.phone} 
                        onChange={handleInputChange} 
                        disabled={!isEditing} 
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address">Address</Label>
                      <Input 
                        id="address" 
                        name="address" 
                        value={profileData.address} 
                        onChange={handleInputChange} 
                        disabled={!isEditing} 
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea 
                        id="description" 
                        name="description" 
                        rows={3}
                        value={profileData.description} 
                        onChange={handleInputChange} 
                        disabled={!isEditing} 
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="business" className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="openingHours">Opening Hours</Label>
                      <Textarea 
                        id="openingHours" 
                        name="openingHours" 
                        value={profileData.openingHours} 
                        onChange={handleInputChange} 
                        disabled={!isEditing} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input 
                        id="website" 
                        name="website" 
                        value={profileData.website} 
                        onChange={handleInputChange} 
                        disabled={!isEditing} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="averagePreparationTime">Average Prep Time (minutes)</Label>
                      <Input 
                        id="averagePreparationTime" 
                        name="averagePreparationTime" 
                        value={profileData.averagePreparationTime} 
                        onChange={handleInputChange} 
                        disabled={!isEditing} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="minOrderValue">Minimum Order Value ($)</Label>
                      <Input 
                        id="minOrderValue" 
                        name="minOrderValue" 
                        value={profileData.minOrderValue} 
                        onChange={handleInputChange} 
                        disabled={!isEditing} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deliveryFee">Delivery Fee ($)</Label>
                      <Input 
                        id="deliveryFee" 
                        name="deliveryFee" 
                        value={profileData.deliveryFee} 
                        onChange={handleInputChange} 
                        disabled={!isEditing} 
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="socials" className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="facebook">Facebook</Label>
                      <div className="flex">
                        <span className="bg-muted px-3 py-2 rounded-l-md border border-r-0 border-input">facebook.com/</span>
                        <Input 
                          id="facebook" 
                          name="facebook" 
                          className="rounded-l-none"
                          value={profileData.socials.facebook} 
                          onChange={handleSocialsChange} 
                          disabled={!isEditing} 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="instagram">Instagram</Label>
                      <div className="flex">
                        <span className="bg-muted px-3 py-2 rounded-l-md border border-r-0 border-input">instagram.com/</span>
                        <Input 
                          id="instagram" 
                          name="instagram" 
                          className="rounded-l-none"
                          value={profileData.socials.instagram} 
                          onChange={handleSocialsChange} 
                          disabled={!isEditing} 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="twitter">Twitter</Label>
                      <div className="flex">
                        <span className="bg-muted px-3 py-2 rounded-l-md border border-r-0 border-input">twitter.com/</span>
                        <Input 
                          id="twitter" 
                          name="twitter" 
                          className="rounded-l-none"
                          value={profileData.socials.twitter} 
                          onChange={handleSocialsChange} 
                          disabled={!isEditing} 
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PartnerProfile; 