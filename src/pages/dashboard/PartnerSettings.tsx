import React, { useState } from 'react';
import DashboardLayout, { partnerNavItems } from '../../components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Slider } from '../../components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { useToast } from '../../components/ui/use-toast';
import { Bell, Moon, Sun, Shield, Smartphone, Database, Save, RefreshCw } from 'lucide-react';

interface SettingsState {
  notifications: {
    newOrders: boolean;
    orderUpdates: boolean;
    customerMessages: boolean;
    promotionalEmails: boolean;
    marketingUpdates: boolean;
    soundAlerts: boolean;
    emailNotifications: boolean;
    pushNotifications: boolean;
    orderSummaries: boolean;
  };
  display: {
    theme: string;
    fontSize: number;
    compactMode: boolean;
    highContrast: boolean;
    reduceMotion: boolean;
    language: string;
  };
  privacy: {
    shareDataForImprovement: boolean;
    allowLocationAccess: boolean;
    analyticsConsent: boolean;
    marketingConsent: boolean;
    profileVisibility: string;
  };
  system: {
    autoAcceptOrders: boolean;
    preparationTimeBuffer: number;
    automaticOnlineStatus: boolean;
    businessHoursOnly: boolean;
    maxConcurrentOrders: number;
    backupFrequency: string;
    autoUpdateApp: boolean;
  };
}

const PartnerSettings = () => {
  const { toast } = useToast();
  
  const [settings, setSettings] = useState<SettingsState>({
    notifications: {
      newOrders: true,
      orderUpdates: true,
      customerMessages: true,
      promotionalEmails: false,
      marketingUpdates: false,
      soundAlerts: true,
      emailNotifications: true,
      pushNotifications: true,
      orderSummaries: true
    },
    display: {
      theme: 'system',
      fontSize: 16,
      compactMode: false,
      highContrast: false,
      reduceMotion: false,
      language: 'english'
    },
    privacy: {
      shareDataForImprovement: true,
      allowLocationAccess: true,
      analyticsConsent: true,
      marketingConsent: false,
      profileVisibility: 'public'
    },
    system: {
      autoAcceptOrders: false,
      preparationTimeBuffer: 5,
      automaticOnlineStatus: true,
      businessHoursOnly: true,
      maxConcurrentOrders: 15,
      backupFrequency: 'daily',
      autoUpdateApp: true
    }
  });

  const handleNotificationChange = (key: keyof typeof settings.notifications, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }));
  };

  const handleDisplayChange = (key: keyof typeof settings.display, value: any) => {
    setSettings(prev => ({
      ...prev,
      display: {
        ...prev.display,
        [key]: value
      }
    }));
  };

  const handlePrivacyChange = (key: keyof typeof settings.privacy, value: any) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: value
      }
    }));
  };

  const handleSystemChange = (key: keyof typeof settings.system, value: any) => {
    setSettings(prev => ({
      ...prev,
      system: {
        ...prev.system,
        [key]: value
      }
    }));
  };

  const saveSettings = () => {
    toast({
      title: "Settings saved",
      description: "Your settings have been successfully updated.",
    });
  };

  const resetSettings = () => {
    // This would reset to default values in a real application
    toast({
      title: "Settings reset",
      description: "Your settings have been reset to default values.",
    });
  };

  const clearAppCache = () => {
    toast({
      title: "Cache cleared",
      description: "Application cache has been successfully cleared.",
    });
  };

  return (
    <DashboardLayout navItems={partnerNavItems} title="Settings">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Restaurant Settings</h2>
          <div className="flex gap-2">
            <Button variant="outline" onClick={resetSettings}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset
            </Button>
            <Button onClick={saveSettings}>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>

        <Tabs defaultValue="notifications" className="w-full">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="notifications">
              <Bell className="mr-2 h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="display">
              <Sun className="mr-2 h-4 w-4" />
              Display
            </TabsTrigger>
            <TabsTrigger value="privacy">
              <Shield className="mr-2 h-4 w-4" />
              Privacy
            </TabsTrigger>
            <TabsTrigger value="system">
              <Smartphone className="mr-2 h-4 w-4" />
              System
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notifications" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Control what notifications you receive from the application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Order Notifications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="newOrders" className="text-sm font-medium">New Orders</Label>
                        <p className="text-sm text-muted-foreground">Get notified when a new order is placed</p>
                      </div>
                      <Switch 
                        id="newOrders" 
                        checked={settings.notifications.newOrders} 
                        onCheckedChange={(checked) => handleNotificationChange('newOrders', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="orderUpdates" className="text-sm font-medium">Order Updates</Label>
                        <p className="text-sm text-muted-foreground">Receive updates about order status changes</p>
                      </div>
                      <Switch 
                        id="orderUpdates" 
                        checked={settings.notifications.orderUpdates} 
                        onCheckedChange={(checked) => handleNotificationChange('orderUpdates', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="customerMessages" className="text-sm font-medium">Customer Messages</Label>
                        <p className="text-sm text-muted-foreground">Get notified about customer inquiries</p>
                      </div>
                      <Switch 
                        id="customerMessages" 
                        checked={settings.notifications.customerMessages} 
                        onCheckedChange={(checked) => handleNotificationChange('customerMessages', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="orderSummaries" className="text-sm font-medium">Order Summaries</Label>
                        <p className="text-sm text-muted-foreground">Receive daily/weekly order summaries</p>
                      </div>
                      <Switch 
                        id="orderSummaries" 
                        checked={settings.notifications.orderSummaries} 
                        onCheckedChange={(checked) => handleNotificationChange('orderSummaries', checked)}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <h3 className="text-lg font-medium">Marketing Communications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="promotionalEmails" className="text-sm font-medium">Promotional Emails</Label>
                        <p className="text-sm text-muted-foreground">Receive emails about promotions and offers</p>
                      </div>
                      <Switch 
                        id="promotionalEmails" 
                        checked={settings.notifications.promotionalEmails} 
                        onCheckedChange={(checked) => handleNotificationChange('promotionalEmails', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="marketingUpdates" className="text-sm font-medium">Marketing Updates</Label>
                        <p className="text-sm text-muted-foreground">Receive updates about platform features</p>
                      </div>
                      <Switch 
                        id="marketingUpdates" 
                        checked={settings.notifications.marketingUpdates} 
                        onCheckedChange={(checked) => handleNotificationChange('marketingUpdates', checked)}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <h3 className="text-lg font-medium">Notification Methods</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="soundAlerts" className="text-sm font-medium">Sound Alerts</Label>
                        <p className="text-sm text-muted-foreground">Play sounds for new notifications</p>
                      </div>
                      <Switch 
                        id="soundAlerts" 
                        checked={settings.notifications.soundAlerts} 
                        onCheckedChange={(checked) => handleNotificationChange('soundAlerts', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="emailNotifications" className="text-sm font-medium">Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                      </div>
                      <Switch 
                        id="emailNotifications" 
                        checked={settings.notifications.emailNotifications} 
                        onCheckedChange={(checked) => handleNotificationChange('emailNotifications', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="pushNotifications" className="text-sm font-medium">Push Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive push notifications on mobile</p>
                      </div>
                      <Switch 
                        id="pushNotifications" 
                        checked={settings.notifications.pushNotifications} 
                        onCheckedChange={(checked) => handleNotificationChange('pushNotifications', checked)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="display" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Display Settings</CardTitle>
                <CardDescription>
                  Customize how the application looks and feels
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="theme" className="text-sm font-medium">Theme</Label>
                    <p className="text-sm text-muted-foreground mb-2">Choose your preferred color theme</p>
                    <Select 
                      value={settings.display.theme}
                      onValueChange={(value) => handleDisplayChange('theme', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select theme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System Default</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="fontSize" className="text-sm font-medium">Text Size</Label>
                    <p className="text-sm text-muted-foreground mb-2">Adjust the size of text (currently {settings.display.fontSize}px)</p>
                    <Slider
                      id="fontSize"
                      min={12}
                      max={24}
                      step={1}
                      value={[settings.display.fontSize]}
                      onValueChange={(value) => handleDisplayChange('fontSize', value[0])}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <Label htmlFor="language" className="text-sm font-medium">Language</Label>
                    <p className="text-sm text-muted-foreground mb-2">Select your preferred language</p>
                    <Select 
                      value={settings.display.language}
                      onValueChange={(value) => handleDisplayChange('language', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="spanish">Spanish</SelectItem>
                        <SelectItem value="french">French</SelectItem>
                        <SelectItem value="german">German</SelectItem>
                        <SelectItem value="chinese">Chinese</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <h3 className="text-lg font-medium">Accessibility</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="compactMode" className="text-sm font-medium">Compact Mode</Label>
                        <p className="text-sm text-muted-foreground">Reduce spacing between elements</p>
                      </div>
                      <Switch 
                        id="compactMode" 
                        checked={settings.display.compactMode} 
                        onCheckedChange={(checked) => handleDisplayChange('compactMode', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="highContrast" className="text-sm font-medium">High Contrast</Label>
                        <p className="text-sm text-muted-foreground">Increase color contrast for better visibility</p>
                      </div>
                      <Switch 
                        id="highContrast" 
                        checked={settings.display.highContrast} 
                        onCheckedChange={(checked) => handleDisplayChange('highContrast', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="reduceMotion" className="text-sm font-medium">Reduce Motion</Label>
                        <p className="text-sm text-muted-foreground">Minimize animations throughout the application</p>
                      </div>
                      <Switch 
                        id="reduceMotion" 
                        checked={settings.display.reduceMotion} 
                        onCheckedChange={(checked) => handleDisplayChange('reduceMotion', checked)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
                <CardDescription>
                  Control your data and privacy preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Data Sharing</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="shareDataForImprovement" className="text-sm font-medium">Improve Service Quality</Label>
                        <p className="text-sm text-muted-foreground">Share anonymous usage data to improve our service</p>
                      </div>
                      <Switch 
                        id="shareDataForImprovement" 
                        checked={settings.privacy.shareDataForImprovement} 
                        onCheckedChange={(checked) => handlePrivacyChange('shareDataForImprovement', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="allowLocationAccess" className="text-sm font-medium">Location Services</Label>
                        <p className="text-sm text-muted-foreground">Allow access to your restaurant's location</p>
                      </div>
                      <Switch 
                        id="allowLocationAccess" 
                        checked={settings.privacy.allowLocationAccess} 
                        onCheckedChange={(checked) => handlePrivacyChange('allowLocationAccess', checked)}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Consent Management</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="analyticsConsent" className="text-sm font-medium">Analytics</Label>
                        <p className="text-sm text-muted-foreground">Allow collection of analytical data</p>
                      </div>
                      <Switch 
                        id="analyticsConsent" 
                        checked={settings.privacy.analyticsConsent} 
                        onCheckedChange={(checked) => handlePrivacyChange('analyticsConsent', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="marketingConsent" className="text-sm font-medium">Marketing</Label>
                        <p className="text-sm text-muted-foreground">Allow usage of your data for marketing purposes</p>
                      </div>
                      <Switch 
                        id="marketingConsent" 
                        checked={settings.privacy.marketingConsent} 
                        onCheckedChange={(checked) => handlePrivacyChange('marketingConsent', checked)}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="profileVisibility" className="text-sm font-medium">Profile Visibility</Label>
                  <p className="text-sm text-muted-foreground mb-2">Control who can see your restaurant profile</p>
                  <Select 
                    value={settings.privacy.profileVisibility}
                    onValueChange={(value) => handlePrivacyChange('profileVisibility', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public - Visible to everyone</SelectItem>
                      <SelectItem value="limited">Limited - Only to customers who ordered before</SelectItem>
                      <SelectItem value="private">Private - By invitation only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>
                  Configure application behavior and technical settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Order Management</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="autoAcceptOrders" className="text-sm font-medium">Auto-Accept Orders</Label>
                        <p className="text-sm text-muted-foreground">Automatically accept incoming orders</p>
                      </div>
                      <Switch 
                        id="autoAcceptOrders" 
                        checked={settings.system.autoAcceptOrders} 
                        onCheckedChange={(checked) => handleSystemChange('autoAcceptOrders', checked)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="preparationTimeBuffer" className="text-sm font-medium">Preparation Time Buffer (minutes)</Label>
                      <p className="text-sm text-muted-foreground mb-2">Extra time added to estimated preparation time: {settings.system.preparationTimeBuffer} min</p>
                      <Slider
                        id="preparationTimeBuffer"
                        min={0}
                        max={30}
                        step={1}
                        value={[settings.system.preparationTimeBuffer]}
                        onValueChange={(value) => handleSystemChange('preparationTimeBuffer', value[0])}
                        className="w-full"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="automaticOnlineStatus" className="text-sm font-medium">Automatic Online Status</Label>
                        <p className="text-sm text-muted-foreground">Automatically set restaurant online/offline based on hours</p>
                      </div>
                      <Switch 
                        id="automaticOnlineStatus" 
                        checked={settings.system.automaticOnlineStatus} 
                        onCheckedChange={(checked) => handleSystemChange('automaticOnlineStatus', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="businessHoursOnly" className="text-sm font-medium">Business Hours Only</Label>
                        <p className="text-sm text-muted-foreground">Only accept orders during business hours</p>
                      </div>
                      <Switch 
                        id="businessHoursOnly" 
                        checked={settings.system.businessHoursOnly} 
                        onCheckedChange={(checked) => handleSystemChange('businessHoursOnly', checked)}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="maxConcurrentOrders" className="text-sm font-medium">Maximum Concurrent Orders</Label>
                    <p className="text-sm text-muted-foreground mb-2">Maximum number of orders to handle at once: {settings.system.maxConcurrentOrders}</p>
                    <Slider
                      id="maxConcurrentOrders"
                      min={1}
                      max={50}
                      step={1}
                      value={[settings.system.maxConcurrentOrders]}
                      onValueChange={(value) => handleSystemChange('maxConcurrentOrders', value[0])}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Application</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="backupFrequency" className="text-sm font-medium">Data Backup Frequency</Label>
                      <p className="text-sm text-muted-foreground mb-2">How often your data should be backed up</p>
                      <Select 
                        value={settings.system.backupFrequency}
                        onValueChange={(value) => handleSystemChange('backupFrequency', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hourly">Hourly</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="never">Never</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="autoUpdateApp" className="text-sm font-medium">Automatic Updates</Label>
                        <p className="text-sm text-muted-foreground">Automatically update the application when new versions are available</p>
                      </div>
                      <Switch 
                        id="autoUpdateApp" 
                        checked={settings.system.autoUpdateApp} 
                        onCheckedChange={(checked) => handleSystemChange('autoUpdateApp', checked)}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button variant="outline" onClick={clearAppCache} className="w-full">
                    <Database className="mr-2 h-4 w-4" />
                    Clear Application Cache
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default PartnerSettings; 