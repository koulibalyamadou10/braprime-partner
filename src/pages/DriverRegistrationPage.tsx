import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useRequestsSimple } from '@/hooks/use-requests-simple';
import { useToast } from '@/hooks/use-toast';
import {
    ArrowLeft,
    Bike,
    Car,
    CarTaxiFront,
    CheckCircle,
    Clock,
    DollarSign,
    Shield,
    Star,
    Truck,
    Zap
} from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const advantages = [
  {
    icon: DollarSign,
    title: "Revenus flexibles",
    description: "Gagnez selon vos disponibilités et vos performances"
  },
  {
    icon: Clock,
    title: "Horaires libres",
    description: "Travaillez quand vous voulez, selon votre emploi du temps"
  },
  {
    icon: Shield,
    title: "Sécurité garantie",
    description: "Assurance et protection pour tous vos déplacements"
  },
  {
    icon: Zap,
    title: "Application mobile",
    description: "Gérez vos livraisons depuis votre smartphone"
  }
];

const vehicleTypes = [
  { value: 'car', label: 'Voiture', icon: Car },
  { value: 'motorcycle', label: 'Moto', icon: CarTaxiFront },
  { value: 'bike', label: 'Vélo', icon: Bike }
];

const DriverRegistrationPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createRequest, isSubmitting } = useRequestsSimple();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    vehicle_type: '',
    vehicle_plate: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createRequest({
        type: 'driver',
        user_name: formData.name,
        user_email: formData.email,
        user_phone: formData.phone,
        vehicle_type: formData.vehicle_type,
        vehicle_plate: formData.vehicle_plate,
        notes: formData.notes
      });

      toast({
        title: "Demande envoyée !",
        description: "Votre demande de chauffeur a été soumise avec succès. Notre équipe l'examinera et vous contactera par email.",
      });

      // Reset form
      setFormData({
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100">
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
              <Truck className="h-6 w-6 text-primary" />
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
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left side - Registration Form */}
          <div className="order-2 lg:order-1">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  <Truck className="h-6 w-6 text-primary" />
                  Créer votre compte chauffeur
                </CardTitle>
                <CardDescription>
                  Remplissez le formulaire ci-dessous pour rejoindre notre équipe de chauffeurs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Nom complet *</label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Votre nom complet"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Téléphone *</label>
                      <Input
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="+224 123 456 789"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Email *</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="votre@email.com"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Type de véhicule *</label>
                      <Select 
                        value={formData.vehicle_type} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, vehicle_type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          {vehicleTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center gap-2">
                                <type.icon className="h-4 w-4" />
                                {type.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Plaque d'immatriculation</label>
                      <Input
                        value={formData.vehicle_plate}
                        onChange={(e) => setFormData(prev => ({ ...prev, vehicle_plate: e.target.value }))}
                        placeholder="ABC 123"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Notes supplémentaires</label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Informations supplémentaires sur votre expérience, disponibilités..."
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting || !formData.name || !formData.email || !formData.phone || !formData.vehicle_type}
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
              </CardContent>
            </Card>
          </div>

          {/* Right side - Benefits and Info */}
          <div className="order-1 lg:order-2">
            <div className="space-y-8">
              {/* Advantages */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    Avantages de devenir chauffeur
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {advantages.map((advantage, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <advantage.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">
                            {advantage.title}
                          </h4>
                          <p className="text-gray-600 text-sm">
                            {advantage.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Requirements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Prérequis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Être majeur (18 ans minimum)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Avoir un véhicule en bon état</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Permis de conduire valide</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Smartphone avec GPS</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Connaissance de la ville</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Earnings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-500" />
                    Revenus estimés
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Frais de base par commande</span>
                      <Badge variant="secondary">1000 GNF</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Bonus distance (par km)</span>
                      <Badge variant="secondary">200 GNF</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Bonus temps (par minute)</span>
                      <Badge variant="secondary">50 GNF</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Bonus batch (3+ commandes)</span>
                      <Badge variant="secondary">1000 GNF</Badge>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="flex justify-between items-center font-semibold">
                        <span>Revenu moyen/jour</span>
                        <Badge className="bg-green-500">15,000 - 25,000 GNF</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Stats section */}
        <div className="mt-16">
          <Card className="bg-gradient-to-r from-primary to-primary/80 text-white">
            <CardContent className="pt-8 pb-8">
              <div className="grid md:grid-cols-4 gap-8 text-center">
                <div>
                  <div className="text-3xl font-bold mb-2">200+</div>
                  <div className="text-sm opacity-90">Chauffeurs actifs</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-2">50k+</div>
                  <div className="text-sm opacity-90">Livraisons effectuées</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-2">98%</div>
                  <div className="text-sm opacity-90">Satisfaction client</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-2">24h</div>
                  <div className="text-sm opacity-90">Activation</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DriverRegistrationPage; 