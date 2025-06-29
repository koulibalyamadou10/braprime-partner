import React, { useState } from 'react';
import { useAdminDashboard } from '@/hooks/use-admin-dashboard';
import DashboardLayout, { adminNavItems } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Settings, 
  Database, 
  Shield, 
  Bell, 
  Users, 
  Building2,
  Truck,
  ShoppingBag,
  AlertCircle,
  RefreshCw,
  Save,
  Download,
  Upload,
  Trash2,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  Server,
  HardDrive,
  Cpu,
  Wifi,
  Globe,
  Lock,
  Unlock,
  BellOff,
  BellRing,
  Database as DatabaseIcon,
  FileText,
  Archive,
  RotateCcw,
  Zap
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const AdminSystem = () => {
  const {
    stats,
    loading,
    error,
    refreshData
  } = useAdminDashboard();

  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoBackup, setAutoBackup] = useState(true);
  const [backupFrequency, setBackupFrequency] = useState('daily');

  const systemMetrics = {
    cpu: 45,
    memory: 67,
    disk: 23,
    network: 89,
    uptime: '15 jours, 8 heures, 32 minutes',
    lastBackup: '2024-01-15 02:30:00',
    nextBackup: '2024-01-16 02:30:00',
    activeConnections: 1247,
    databaseSize: '2.4 GB',
    logSize: '156 MB'
  };

  const recentLogs = [
    {
      id: 1,
      level: 'info',
      message: 'Sauvegarde automatique terminée avec succès',
      timestamp: '2024-01-15 02:30:15',
      service: 'Database'
    },
    {
      id: 2,
      level: 'warning',
      message: 'Utilisation mémoire élevée détectée',
      timestamp: '2024-01-15 02:15:42',
      service: 'System'
    },
    {
      id: 3,
      level: 'error',
      message: 'Échec de connexion à l\'API de paiement',
      timestamp: '2024-01-15 02:08:23',
      service: 'Payment'
    },
    {
      id: 4,
      level: 'info',
      message: 'Nouveau commerce enregistré: Restaurant Le Gourmet',
      timestamp: '2024-01-15 01:45:18',
      service: 'Business'
    },
    {
      id: 5,
      level: 'info',
      message: 'Livreur assigné à la commande #12345678',
      timestamp: '2024-01-15 01:32:55',
      service: 'Delivery'
    }
  ];

  const getLogLevelBadge = (level: string) => {
    const config = {
      info: { label: 'Info', variant: 'default' as const, icon: CheckCircle },
      warning: { label: 'Avertissement', variant: 'secondary' as const, icon: AlertCircle },
      error: { label: 'Erreur', variant: 'destructive' as const, icon: XCircle }
    };

    const levelConfig = config[level as keyof typeof config] || config.info;
    const Icon = levelConfig.icon;

    return (
      <Badge variant={levelConfig.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {levelConfig.label}
      </Badge>
    );
  };

  const getPerformanceColor = (value: number) => {
    if (value < 50) return 'text-green-600';
    if (value < 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <DashboardLayout navItems={adminNavItems} title="Système">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-10 w-32" />
          </div>
          
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-16 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            {[...Array(2)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-64 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout navItems={adminNavItems} title="Système">
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Erreur de chargement</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={refreshData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Réessayer
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={adminNavItems} title="Système">
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Gestion Système</h2>
            <p className="text-muted-foreground">
              Surveillez et configurez les paramètres système - {format(new Date(), 'EEEE d MMMM yyyy HH:mm', { locale: fr })}
            </p>
          </div>
          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <Button variant="outline" size="icon" onClick={refreshData} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exporter Logs
            </Button>
          </div>
        </div>

        {/* Métriques système */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Cpu className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{systemMetrics.cpu}%</p>
                  <p className="text-sm text-gray-500">CPU</p>
                </div>
              </div>
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getPerformanceColor(systemMetrics.cpu).replace('text-', 'bg-')}`}
                    style={{ width: `${systemMetrics.cpu}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <Activity className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{systemMetrics.memory}%</p>
                  <p className="text-sm text-gray-500">Mémoire</p>
                </div>
              </div>
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getPerformanceColor(systemMetrics.memory).replace('text-', 'bg-')}`}
                    style={{ width: `${systemMetrics.memory}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <HardDrive className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{systemMetrics.disk}%</p>
                  <p className="text-sm text-gray-500">Disque</p>
                </div>
              </div>
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getPerformanceColor(systemMetrics.disk).replace('text-', 'bg-')}`}
                    style={{ width: `${systemMetrics.disk}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="bg-orange-100 p-2 rounded-lg">
                  <Wifi className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{systemMetrics.network}%</p>
                  <p className="text-sm text-gray-500">Réseau</p>
                </div>
              </div>
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getPerformanceColor(systemMetrics.network).replace('text-', 'bg-')}`}
                    style={{ width: `${systemMetrics.network}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Configuration système */}
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
          {/* Paramètres généraux */}
          <Card>
            <CardHeader>
              <CardTitle>Paramètres Généraux</CardTitle>
              <CardDescription>
                Configurez les paramètres système principaux
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="maintenance">Mode Maintenance</Label>
                  <p className="text-sm text-gray-500">
                    Désactive l'accès public à la plateforme
                  </p>
                </div>
                <Switch
                  id="maintenance"
                  checked={maintenanceMode}
                  onCheckedChange={setMaintenanceMode}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications">Notifications Système</Label>
                  <p className="text-sm text-gray-500">
                    Active les notifications automatiques
                  </p>
                </div>
                <Switch
                  id="notifications"
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="backup">Sauvegarde Automatique</Label>
                  <p className="text-sm text-gray-500">
                    Sauvegarde automatique de la base de données
                  </p>
                </div>
                <Switch
                  id="backup"
                  checked={autoBackup}
                  onCheckedChange={setAutoBackup}
                />
              </div>

              {autoBackup && (
                <div className="space-y-2">
                  <Label htmlFor="backup-frequency">Fréquence de sauvegarde</Label>
                  <Select value={backupFrequency} onValueChange={setBackupFrequency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Toutes les heures</SelectItem>
                      <SelectItem value="daily">Quotidienne</SelectItem>
                      <SelectItem value="weekly">Hebdomadaire</SelectItem>
                      <SelectItem value="monthly">Mensuelle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="pt-4">
                <Button className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Sauvegarder les paramètres
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Informations système */}
          <Card>
            <CardHeader>
              <CardTitle>Informations Système</CardTitle>
              <CardDescription>
                Détails sur l'état du système
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Server className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Uptime:</span>
                  </div>
                  <p className="text-sm text-gray-600">{systemMetrics.uptime}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Connexions:</span>
                  </div>
                  <p className="text-sm text-gray-600">{systemMetrics.activeConnections}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <DatabaseIcon className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Base de données:</span>
                  </div>
                  <p className="text-sm text-gray-600">{systemMetrics.databaseSize}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Logs:</span>
                  </div>
                  <p className="text-sm text-gray-600">{systemMetrics.logSize}</p>
                </div>
              </div>

              <div className="pt-4 space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Dernière sauvegarde</span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {format(new Date(systemMetrics.lastBackup), 'dd/MM/yyyy HH:mm', { locale: fr })}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Prochaine sauvegarde</span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {format(new Date(systemMetrics.nextBackup), 'dd/MM/yyyy HH:mm', { locale: fr })}
                  </span>
                </div>
              </div>

              <div className="pt-4 space-y-2">
                <Button variant="outline" className="w-full">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Redémarrer les services
                </Button>
                <Button variant="outline" className="w-full">
                  <Archive className="h-4 w-4 mr-2" />
                  Nettoyer les logs
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Logs système */}
        <Card>
          <CardHeader>
            <CardTitle>Logs Système</CardTitle>
            <CardDescription>
              Logs récents du système - {recentLogs.length} entrées
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Niveau</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Horodatage</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        {getLogLevelBadge(log.level)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.service}</Badge>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{log.message}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-3 w-3 mr-1" />
                          {format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm:ss', { locale: fr })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Affichage des 5 derniers logs
              </p>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Télécharger tous les logs
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Actions système */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Sécurité
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full">
                <Lock className="h-4 w-4 mr-2" />
                Vérifier les permissions
              </Button>
              <Button variant="outline" className="w-full">
                <Shield className="h-4 w-4 mr-2" />
                Scanner de sécurité
              </Button>
              <Button variant="outline" className="w-full">
                <Users className="h-4 w-4 mr-2" />
                Gérer les sessions
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Base de Données
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Sauvegarde manuelle
              </Button>
              <Button variant="outline" className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                Restaurer
              </Button>
              <Button variant="outline" className="w-full">
                <Activity className="h-4 w-4 mr-2" />
                Optimiser
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Maintenance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full">
                <RotateCcw className="h-4 w-4 mr-2" />
                Redémarrer
              </Button>
              <Button variant="outline" className="w-full">
                <Trash2 className="h-4 w-4 mr-2" />
                Nettoyer le cache
              </Button>
              <Button variant="outline" className="w-full">
                <Archive className="h-4 w-4 mr-2" />
                Archiver les données
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminSystem; 