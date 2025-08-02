import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { DriverRegistrationData, DriverRegistrationService } from '@/lib/services/driver-registration';
import {
    ArrowRight,
    Award,
    Bike,
    Car,
    CheckCircle,
    Clock,
    DollarSign,
    FileText,
    Shield,
    Star,
    Truck
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const vehicleTypes = [
  { value: 'Moto', label: 'Moto', icon: Bike },
  { value: 'Voiture', label: 'Voiture', icon: Car },
  { value: 'Camion', label: 'Camion', icon: Truck },
  { value: 'Vélo', label: 'Vélo', icon: Bike }
];

const driverTypes = [
  { 
    value: 'independent', 
    label: 'Chauffeur Indépendant', 
    description: 'Travaillez librement pour tous les commerces' 
  },
  { 
    value: 'service', 
    label: 'Chauffeur de Service', 
    description: 'Travaillez pour un commerce spécifique' 
  }
];

const DriverRegistrationPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<DriverRegistrationData>({
    name: '',
    email: '',
    phone: '',
    vehicle_type: 'Moto',
    vehicle_plate: '',
    driver_type: 'independent',
    experience_years: 0,
    availability_hours: '',
    preferred_zones: [],
    notes: ''
  });

  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation des données
    const validation = DriverRegistrationService.validateRegistrationData(formData);
    if (!validation.valid) {
      toast({
        title: "Erreur de validation",
        description: validation.errors.join(', '),
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await DriverRegistrationService.createDriverRequest(formData);

      if (result.success) {
        toast({
          title: "Demande envoyée !",
          description: "Votre demande de chauffeur a été soumise avec succès. Notre équipe l'examinera et vous contactera par email.",
        });

        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          vehicle_type: 'Moto',
          vehicle_plate: '',
          driver_type: 'independent',
          experience_years: 0,
          availability_hours: '',
          preferred_zones: [],
          notes: ''
        });

        setShowForm(false);
      } else {
        toast({
          title: "Erreur",
          description: result.error || "Une erreur s'est produite lors de l'envoi de votre demande.",
          variant: "destructive"
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Une erreur s'est produite lors de l'envoi de votre demande.";
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-guinea-green to-guinea-green/90 text-white">
          <div className="container mx-auto px-4 py-16">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Devenez Chauffeur BraPrime
              </h1>
              <p className="text-xl mb-8 text-white/90">
                Rejoignez notre équipe de chauffeurs et gagnez un revenu flexible en livrant des commandes dans toute la Guinée
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  onClick={() => setShowForm(true)}
                  className="bg-white text-guinea-green hover:bg-gray-100 px-8 py-3 text-lg font-semibold"
                >
                  Commencer maintenant
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <div className="flex items-center gap-2 text-sm text-white/80">
                  <CheckCircle className="h-4 w-4" />
                  <span>Inscription gratuite</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {showForm ? (
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                  Créer votre compte chauffeur
                </h2>
                <p className="text-gray-600">
                  Remplissez le formulaire ci-dessous pour rejoindre notre équipe de chauffeurs
                </p>
              </div>
              
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold flex items-center gap-2">
                    <Truck className="h-6 w-6 text-guinea-green" />
                    Formulaire d'inscription chauffeur
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
                          onValueChange={(value) => setFormData(prev => ({ ...prev, vehicle_type: value as any }))}
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
                      <label className="text-sm font-medium">Type de chauffeur *</label>
                      <Select 
                        value={formData.driver_type} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, driver_type: value as any }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          {driverTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex flex-col">
                                <span className="font-medium">{type.label}</span>
                                <span className="text-sm text-gray-500">{type.description}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Années d'expérience</label>
                        <Input
                          type="number"
                          value={formData.experience_years}
                          onChange={(e) => setFormData(prev => ({ ...prev, experience_years: parseInt(e.target.value) || 0 }))}
                          placeholder="0"
                          min="0"
                          max="50"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Disponibilités</label>
                        <Input
                          value={formData.availability_hours}
                          onChange={(e) => setFormData(prev => ({ ...prev, availability_hours: e.target.value }))}
                          placeholder="Ex: 8h-18h, Lundi-Vendredi"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Notes supplémentaires</label>
                      <Textarea
                        value={formData.notes}
                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Informations supplémentaires sur votre expérience, disponibilités, zones préférées..."
                      />
                    </div>

                    <div className="flex gap-4 pt-4">
                      <Button 
                        type="submit" 
                        className="flex-1 bg-guinea-green hover:bg-guinea-green/90" 
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Envoi en cours...
                          </>
                        ) : (
                          <>
                            Envoyer ma demande
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handleCancel}
                        disabled={isSubmitting}
                      >
                        Annuler
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-6xl mx-auto">
              {/* Avantages */}
              <div className="mb-16">
                <h2 className="text-3xl font-bold text-center mb-12">Pourquoi devenir chauffeur BraPrime ?</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <Card className="text-center p-6">
                    <div className="w-16 h-16 bg-guinea-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <DollarSign className="h-8 w-8 text-guinea-green" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Revenus Flexibles</h3>
                    <p className="text-gray-600">Gagnez entre 50,000 et 150,000 FG par jour selon vos livraisons</p>
                  </Card>
                  
                  <Card className="text-center p-6">
                    <div className="w-16 h-16 bg-guinea-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Clock className="h-8 w-8 text-guinea-green" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Horaires Flexibles</h3>
                    <p className="text-gray-600">Travaillez quand vous voulez, selon vos disponibilités</p>
                  </Card>
                  
                  <Card className="text-center p-6">
                    <div className="w-16 h-16 bg-guinea-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Shield className="h-8 w-8 text-guinea-green" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Sécurité Garantie</h3>
                    <p className="text-gray-600">Assurance et protection complète pour tous nos chauffeurs</p>
                  </Card>
                </div>
              </div>

              {/* Prérequis */}
              <div className="mb-16">
                <h2 className="text-3xl font-bold text-center mb-12">Prérequis</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-guinea-green" />
                      Documents requis
                    </h3>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Permis de conduire valide
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Carte d'identité nationale
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Assurance véhicule
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Contrôle technique (si applicable)
                      </li>
                    </ul>
                  </Card>
                  
                  <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Award className="h-5 w-5 text-guinea-green" />
                      Conditions
                    </h3>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Âge minimum : 18 ans
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Véhicule en bon état
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Connaissance de la ville
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Disponibilité flexible
                      </li>
                    </ul>
                  </Card>
                </div>
              </div>

              {/* Statistiques */}
              <div className="mb-16">
                <h2 className="text-3xl font-bold text-center mb-12">Nos chiffres</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  <Card className="text-center p-6">
                    <div className="text-3xl font-bold text-guinea-green mb-2">200+</div>
                    <p className="text-gray-600">Chauffeurs actifs</p>
                  </Card>
                  
                  <Card className="text-center p-6">
                    <div className="text-3xl font-bold text-guinea-green mb-2">50,000+</div>
                    <p className="text-gray-600">Livraisons effectuées</p>
                  </Card>
                  
                  <Card className="text-center p-6">
                    <div className="text-3xl font-bold text-guinea-green mb-2">4.8</div>
                    <div className="flex justify-center mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <p className="text-gray-600">Note moyenne</p>
                  </Card>
                  
                  <Card className="text-center p-6">
                    <div className="text-3xl font-bold text-guinea-green mb-2">24h</div>
                    <p className="text-gray-600">Support disponible</p>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default DriverRegistrationPage; 