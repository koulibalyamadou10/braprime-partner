import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useEmailService } from '@/hooks/use-email-service';
import { useToast } from '@/hooks/use-toast';
import {
    AlertCircle,
    Bell,
    Building2,
    CheckCircle,
    Loader2,
    Mail,
    Send,
    Shield,
    ShoppingCart,
    User
} from 'lucide-react';
import { useState } from 'react';

interface EmailTestData {
  emailType: string;
  recipientEmail: string;
  recipientName: string;
  customData: Record<string, any>;
}

const AdminEmailTest = () => {
  const { toast } = useToast();
  const { loading, error, sendRequestConfirmation, sendAdminNotification, sendRequestApproval, sendAccountCredentials, sendPasswordReset, sendOrderConfirmation, sendOrderStatusUpdate, sendRequestRejection, sendPaymentReminder } = useEmailService();
  
  const [testData, setTestData] = useState<EmailTestData>({
    emailType: 'request_confirmation',
    recipientEmail: '',
    recipientName: '',
    customData: {}
  });

  const [testResults, setTestResults] = useState<Array<{
    type: string;
    success: boolean;
    message: string;
    timestamp: string;
  }>>([]);

  const emailTypes = [
    {
      value: 'request_confirmation',
      label: 'Confirmation de demande',
      icon: <CheckCircle className="h-4 w-4" />,
      description: 'Email envoyé lors de la soumission d\'une demande'
    },
    {
      value: 'admin_notification',
      label: 'Notification admin',
      icon: <Bell className="h-4 w-4" />,
      description: 'Email de notification pour les administrateurs'
    },
    {
      value: 'request_approval',
      label: 'Approbation de demande',
      icon: <User className="h-4 w-4" />,
      description: 'Email d\'approbation avec identifiants'
    },
    {
      value: 'account_credentials',
      label: 'Identifiants de compte',
      icon: <Shield className="h-4 w-4" />,
      description: 'Email avec identifiants de connexion'
    },
    {
      value: 'password_reset',
      label: 'Réinitialisation mot de passe',
      icon: <Shield className="h-4 w-4" />,
      description: 'Email de réinitialisation de mot de passe'
    },
    {
      value: 'order_confirmation',
      label: 'Confirmation de commande',
      icon: <ShoppingCart className="h-4 w-4" />,
      description: 'Email de confirmation de commande'
    },
    {
      value: 'order_status_update',
      label: 'Mise à jour statut commande',
      icon: <ShoppingCart className="h-4 w-4" />,
      description: 'Email de notification de changement de statut'
    },
    {
      value: 'request_rejection',
      label: 'Rejet de demande',
      icon: <AlertCircle className="h-4 w-4" />,
      description: 'Email de rejet avec explications'
    },
    {
      value: 'payment_reminder',
      label: 'Rappel de paiement',
      icon: <Building2 className="h-4 w-4" />,
      description: 'Email de rappel pour les abonnements'
    }
  ];

  const getDefaultDataForType = (type: string) => {
    const baseUrl = 'https://braprime-frontend.vercel.app' // URL de production
    const adminUrl = 'https://braprime-frontend.vercel.app/admin/requests'
    const partnerUrl = 'https://braprime-frontend.vercel.app/partner-dashboard'
    const resetUrl = 'https://braprime-frontend.vercel.app/reset-password?token=test_token'
    const paymentUrl = 'https://braprime-frontend.vercel.app/payment'

    // Utiliser les données du formulaire ou des valeurs par défaut
    const userName = testData.recipientName || 'Test User'
    const userEmail = testData.recipientEmail || 'test@example.com'
    const requestId = `test_request_${Date.now()}`

    switch (type) {
      case 'request_confirmation':
        return {
          request_id: requestId,
          request_type: 'partner',
          user_name: userName,
          user_email: userEmail,
          user_phone: '+224 123 456 789',
          business_name: 'Restaurant Test',
          business_type: 'restaurant',
          business_address: '123 Test Street, Conakry',
          selected_plan_name: 'Plan Premium',
          selected_plan_price: 50000,
          notes: 'Demande de test',
          submitted_at: new Date().toISOString()
        }

      case 'admin_notification':
        return {
          request_id: requestId,
          request_type: 'partner',
          user_name: userName,
          user_email: userEmail,
          user_phone: '+224 123 456 789',
          business_name: 'Restaurant Test',
          business_type: 'restaurant',
          business_address: '123 Test Street, Conakry',
          notes: 'Demande de test',
          submitted_at: new Date().toISOString(),
          admin_dashboard_url: adminUrl
        }

      case 'request_approval':
        return {
          request_id: requestId,
          request_type: 'partner',
          user_name: userName,
          user_email: userEmail,
          user_phone: '+224 123 456 789',
          business_name: 'Restaurant Test',
          selected_plan_name: 'Plan Premium',
          selected_plan_price: 50000,
          login_email: userEmail,
          login_password: 'MotDePasse123!',
          dashboard_url: partnerUrl,
          approved_at: new Date().toISOString(),
          approved_by: 'admin@bradelivery.com'
        }

      case 'account_credentials':
        return {
          account_type: 'partner',
          user_name: userName,
          user_email: userEmail,
          login_email: userEmail,
          login_password: 'MotDePasse123!',
          business_name: 'Restaurant Test',
          business_id: 'business_123',
          selected_plan_name: 'Plan Premium',
          selected_plan_price: 50000,
          dashboard_url: partnerUrl,
          account_created_at: new Date().toISOString(),
          created_by: 'admin@bradelivery.com',
          support_email: 'support@bradelivery.com',
          support_phone: '+224 621 00 00 00'
        }

      case 'password_reset':
        return {
          user_email: userEmail,
          user_name: userName,
          user_type: 'customer',
          reset_token: 'test_reset_token_123',
          reset_url: resetUrl,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        }

      case 'order_confirmation':
        return {
          order_id: 'order_123',
          user_name: userName,
          user_email: userEmail,
          business_name: 'Restaurant Test',
          business_address: '123 Test Street, Conakry',
          order_items: [
            { name: 'Pizza Margherita', quantity: 2, price: 15000 },
            { name: 'Coca Cola', quantity: 1, price: 2000 }
          ],
          subtotal: 32000,
          delivery_fee: 3000,
          tax: 1600,
          total: 36600,
          delivery_address: '456 Client Street, Conakry',
          estimated_delivery: '30 minutes',
          order_number: 'CMD-2024-001',
          created_at: new Date().toISOString()
        }

      case 'order_status_update':
        return {
          order_id: 'order_123',
          user_name: userName,
          user_email: userEmail,
          business_name: 'Restaurant Test',
          order_number: 'CMD-2024-001',
          old_status: 'pending',
          new_status: 'preparing',
          status_label: 'En préparation',
          estimated_delivery: '30 minutes',
          driver_name: 'John Driver',
          driver_phone: '+224 987 654 321',
          updated_at: new Date().toISOString()
        }

      case 'request_rejection':
        return {
          request_id: requestId,
          request_type: 'partner',
          user_name: userName,
          user_email: userEmail,
          business_name: 'Restaurant Test',
          rejection_reason: 'Documents incomplets',
          admin_notes: 'Veuillez fournir tous les documents requis',
          rejected_at: new Date().toISOString(),
          rejected_by: 'admin@bradelivery.com',
          contact_email: 'support@bradelivery.com',
          contact_phone: '+224 621 00 00 00'
        }

      case 'payment_reminder':
        return {
          partner_id: 'partner_123',
          partner_name: userName,
          partner_email: userEmail,
          business_name: 'Restaurant Test',
          subscription_id: 'sub_123',
          plan_name: 'Plan Premium',
          plan_price: 50000,
          days_remaining: 3,
          payment_url: paymentUrl,
          reminder_type: 'first' as const
        }

      default:
        return {}
    }
  }

  const handleSendTestEmail = async () => {
    if (!testData.recipientEmail || !testData.recipientName) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir l'email et le nom du destinataire",
        variant: "destructive"
      });
      return;
    }

    const emailData = getDefaultDataForType(testData.emailType);
    let result = null;

    try {
      switch (testData.emailType) {
        case 'request_confirmation':
          result = await sendRequestConfirmation(emailData);
          break;
        case 'admin_notification':
          result = await sendAdminNotification(emailData);
          break;
        case 'request_approval':
          result = await sendRequestApproval(emailData);
          break;
        case 'account_credentials':
          result = await sendAccountCredentials(emailData);
          break;
        case 'password_reset':
          result = await sendPasswordReset(emailData, emailData.reset_token);
          break;
        case 'order_confirmation':
          result = await sendOrderConfirmation(emailData, { name: emailData.user_name, email: emailData.user_email });
          break;
        case 'order_status_update':
          result = await sendOrderStatusUpdate(emailData, { name: emailData.user_name, email: emailData.user_email }, emailData);
          break;
        case 'request_rejection':
          result = await sendRequestRejection(emailData, { 
            reason: emailData.rejection_reason, 
            admin_notes: emailData.admin_notes, 
            rejected_by: emailData.rejected_by 
          });
          break;
        case 'payment_reminder':
          result = await sendPaymentReminder(emailData, emailData);
          break;
      }

      const newResult = {
        type: testData.emailType,
        success: !!result,
        message: result ? 'Email envoyé avec succès' : 'Erreur lors de l\'envoi',
        timestamp: new Date().toLocaleString()
      };

      setTestResults(prev => [newResult, ...prev]);

      toast({
        title: newResult.success ? "Succès" : "Erreur",
        description: newResult.message,
        variant: newResult.success ? "default" : "destructive"
      });

    } catch (error) {
      const errorResult = {
        type: testData.emailType,
        success: false,
        message: `Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
        timestamp: new Date().toLocaleString()
      };

      setTestResults(prev => [errorResult, ...prev]);

      toast({
        title: "Erreur",
        description: errorResult.message,
        variant: "destructive"
      });
    }
  };

  const handleClearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Test d'Emails</h1>
          <p className="text-muted-foreground">
            Testez l'envoi des différents types d'emails de l'application
          </p>
        </div>
        <Button onClick={handleClearResults} variant="outline">
          Effacer les résultats
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Configuration du test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Configuration du test
            </CardTitle>
            <CardDescription>
              Configurez les paramètres pour tester l'envoi d'emails
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="emailType">Type d'email</Label>
              <Select value={testData.emailType} onValueChange={(value) => setTestData(prev => ({ ...prev, emailType: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un type d'email" />
                </SelectTrigger>
                <SelectContent>
                  {emailTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        {type.icon}
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-xs text-muted-foreground">{type.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipientEmail">Email du destinataire</Label>
              <Input
                id="recipientEmail"
                type="email"
                placeholder="test@example.com"
                value={testData.recipientEmail}
                onChange={(e) => setTestData(prev => ({ ...prev, recipientEmail: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipientName">Nom du destinataire</Label>
              <Input
                id="recipientName"
                type="text"
                placeholder="Nom du destinataire"
                value={testData.recipientName}
                onChange={(e) => setTestData(prev => ({ ...prev, recipientName: e.target.value }))}
              />
            </div>

            <Button 
              onClick={handleSendTestEmail} 
              disabled={loading || !testData.recipientEmail || !testData.recipientName}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Envoyer l'email de test
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Données de test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Données de test
            </CardTitle>
            <CardDescription>
              Données qui seront utilisées pour l'email de test
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Données générées automatiquement</Label>
              <Textarea
                value={JSON.stringify(getDefaultDataForType(testData.emailType), null, 2)}
                readOnly
                className="h-32 text-xs"
                placeholder="Les données de test seront affichées ici..."
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Résultats des tests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Résultats des tests
          </CardTitle>
          <CardDescription>
            Historique des tests d'envoi d'emails
          </CardDescription>
        </CardHeader>
        <CardContent>
          {testResults.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucun test effectué pour le moment
            </div>
          ) : (
            <div className="space-y-2">
              {testResults.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {result.success ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                    <div>
                      <div className="font-medium">
                        {emailTypes.find(t => t.value === result.type)?.label || result.type}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {result.message}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={result.success ? "default" : "destructive"}>
                      {result.success ? "Succès" : "Échec"}
                    </Badge>
                    <div className="text-xs text-muted-foreground mt-1">
                      {result.timestamp}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">Erreur :</span>
              {error}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminEmailTest; 