import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useRequestsSimple } from '@/hooks/use-requests-simple';
import { useRequestsPageStats } from '@/hooks/use-requests-stats';
import { useToast } from '@/hooks/use-toast';
import {
    ArrowLeft,
    Building2,
    Clock,
    DollarSign,
    Navigation,
    Shield,
    Smartphone,
    Timer,
    TrendingUp,
    Truck,
    Users,
    Zap
} from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const partnerBenefits = [
  {
    icon: Users,
    title: "Clientèle fidèle",
    description: "Accédez à une base de clients qualifiés"
  },
  {
    icon: TrendingUp,
    title: "Croissance garantie",
    description: "Augmentez vos ventes de 30% en moyenne"
  },
  {
    icon: Shield,
    title: "Sécurité totale",
    description: "Paiements sécurisés et protection des données"
  },
  {
    icon: Zap,
    title: "Mise en ligne rapide",
    description: "Votre commerce en ligne en moins de 24h"
  }
];

const driverBenefits = [
  {
    icon: Smartphone,
    title: "App Mobile",
    description: "Application intuitive pour gérer vos livraisons"
  },
  {
    icon: Navigation,
    title: "GPS Intégré",
    description: "Navigation optimisée pour des trajets efficaces"
  },
  {
    icon: Timer,
    title: "Temps Réel",
    description: "Suivi en temps réel de vos livraisons"
  },
  {
    icon: DollarSign,
    title: "Paiements Instantanés",
    description: "Recevez vos gains immédiatement"
  }
];

const businessTypes = [
  { value: "restaurant", label: "Restaurant" },
  { value: "cafe", label: "Café" },
  { value: "boulangerie", label: "Boulangerie" },
  { value: "pharmacy", label: "Pharmacie" },
  { value: "grocery", label: "Épicerie" },
  { value: "other", label: "Autre" }
];

const vehicleTypes = [
  { value: "motorcycle", label: "Moto" },
  { value: "car", label: "Voiture" },
  { value: "bike", label: "Vélo" }
];

const RequestsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createRequest, isSubmitting } = useRequestsSimple();
  const { data: statsData, isLoading: statsLoading } = useRequestsPageStats();

  const [driverForm, setDriverForm] = useState({
    name: '',
    email: '',
    phone: '',
    vehicle_type: '',
    vehicle_plate: '',
    notes: ''
  });

  const handleDriverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createRequest({
        type: 'driver',
        user_name: driverForm.name,
        user_email: driverForm.email,
        user_phone: driverForm.phone,
        vehicle_type: driverForm.vehicle_type,
        vehicle_plate: driverForm.vehicle_plate,
        notes: driverForm.notes
      });

      toast({
        title: "Demande envoyée !",
        description: "Votre demande de chauffeur a été soumise avec succès. Notre équipe l'examinera et vous contactera par email.",
      });

      // Reset form
      setDriverForm({
        name: '',
        email: '',
        phone: '',
        vehicle_type: '',
        vehicle_plate: '',
        notes: ''
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Une erreur s'est produite lors de l'envoi de votre demande.";
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour à l'accueil
            </Button>
            <div className="flex items-center gap-2">
              <Building2 className="h-6 w-6 text-primary" />
              <span className="font-semibold text-lg">BraPrime</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Devenez Chauffeur BraPrime
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Rejoignez notre équipe de chauffeurs et gagnez un revenu flexible 
            en livrant des commandes dans toute la Guinée
          </p>
          <div className="mt-6 p-4 bg-blue-50 rounded-lg max-w-2xl mx-auto">
            <div className="flex items-center gap-2 text-blue-700">
              <Clock className="h-5 w-5" />
              <span className="font-medium">Processus simple</span>
            </div>
            <p className="text-sm text-blue-600 mt-1">
              1. Soumettez votre demande • 2. Notre équipe l'examine • 3. Vous recevez un email avec vos accès
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left side - Forms */}
          <div className="order-2 lg:order-1">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">
                  Soumettre votre demande de chauffeur
                </CardTitle>
                <CardDescription>
                  Remplissez le formulaire ci-dessous pour rejoindre notre équipe de chauffeurs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value="driver" onValueChange="driver" className="w-full">
                  <TabsList className="grid w-full grid-cols-1">
                    <TabsTrigger value="driver" className="flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      Chauffeur
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="driver" className="mt-6">
                    <form onSubmit={handleDriverSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Nom complet *</label>
                          <Input
                            value={driverForm.name}
                            onChange={(e) => setDriverForm(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Votre nom complet"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Téléphone *</label>
                          <Input
                            value={driverForm.phone}
                            onChange={(e) => setDriverForm(prev => ({ ...prev, phone: e.target.value }))}
                            placeholder="+224 123 456 789"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium">Email *</label>
                        <Input
                          type="email"
                          value={driverForm.email}
                          onChange={(e) => setDriverForm(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="votre@email.com"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Type de véhicule *</label>
                          <Select 
                            value={driverForm.vehicle_type} 
                            onValueChange={(value) => setDriverForm(prev => ({ ...prev, vehicle_type: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner" />
                            </SelectTrigger>
                            <SelectContent>
                              {vehicleTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Plaque d'immatriculation</label>
                          <Input
                            value={driverForm.vehicle_plate}
                            onChange={(e) => setDriverForm(prev => ({ ...prev, vehicle_plate: e.target.value }))}
                            placeholder="ABC 123"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium">Notes supplémentaires</label>
                        <Textarea
                          value={driverForm.notes}
                          onChange={(e) => setDriverForm(prev => ({ ...prev, notes: e.target.value }))}
                          placeholder="Informations supplémentaires..."
                        />
                      </div>

                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2 text-blue-700 mb-2">
                          <Smartphone className="h-4 w-4" />
                          <span className="font-medium">Application mobile</span>
                        </div>
                        <p className="text-sm text-blue-600">
                          Après approbation, vous recevrez l'application mobile BraPrime pour gérer vos livraisons.
                        </p>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={isSubmitting || !driverForm.name || !driverForm.email || !driverForm.phone || !driverForm.vehicle_type}
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Envoi en cours...
                          </>
                        ) : (
                          <>
                            <Truck className="h-4 w-4 mr-2" />
                            Soumettre ma demande chauffeur
                          </>
                        )}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Right side - Benefits */}
          <div className="order-1 lg:order-2">
            <div className="space-y-6">
              {/* Partner Benefits */}
              {/* Driver Benefits */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-6 w-6 text-primary" />
                    Avantages Chauffeur
                  </CardTitle>
                  <CardDescription>
                    Découvrez pourquoi rejoindre BraPrime en tant que chauffeur
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {driverBenefits.map((benefit, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <benefit.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm">{benefit.title}</h4>
                          <p className="text-sm text-gray-600">{benefit.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Stats */}
              <Card className="bg-gradient-to-r from-primary to-primary/80 text-white">
                <CardContent className="pt-6">
                  {statsLoading ? (
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <Skeleton className="h-8 w-16 mx-auto mb-1 bg-white/20" />
                        <Skeleton className="h-3 w-20 mx-auto bg-white/20" />
                      </div>
                      <div>
                        <Skeleton className="h-8 w-16 mx-auto mb-1 bg-white/20" />
                        <Skeleton className="h-3 w-20 mx-auto bg-white/20" />
                      </div>
                      <div>
                        <Skeleton className="h-8 w-16 mx-auto mb-1 bg-white/20" />
                        <Skeleton className="h-3 w-20 mx-auto bg-white/20" />
                      </div>
                      <div>
                        <Skeleton className="h-8 w-16 mx-auto mb-1 bg-white/20" />
                        <Skeleton className="h-3 w-20 mx-auto bg-white/20" />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold mb-1">
                          {statsData?.data?.totalDrivers ? `${statsData.data.totalDrivers}+` : '200+'}
                        </div>
                        <div className="text-xs opacity-90">Chauffeurs actifs</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold mb-1">
                          {statsData?.data?.totalOrders ? `${(statsData.data.totalOrders / 1000).toFixed(0)}k+` : '50k+'}
                        </div>
                        <div className="text-xs opacity-90">Commandes effectuées</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold mb-1">
                          {statsData?.data?.satisfactionRate ? `${statsData.data.satisfactionRate}%` : '98%'}
                        </div>
                        <div className="text-xs opacity-90">Satisfaction client</div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestsPage; 