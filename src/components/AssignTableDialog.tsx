import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, Phone, Mail, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface AssignTableDialogProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: {
    id: string;
    customer_name: string;
    customer_phone?: string;
    customer_email?: string;
    date: string;
    time: string;
    guests: number;
    table_number?: number;
    special_requests?: string;
    status: string;
  } | null;
  onTableAssigned: (reservationId: string, tableNumber: number) => void;
  availableTables?: number[];
}

export const AssignTableDialog: React.FC<AssignTableDialogProps> = ({
  isOpen,
  onClose,
  reservation,
  onTableAssigned,
  availableTables = []
}) => {
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [customTableNumber, setCustomTableNumber] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [useCustomTable, setUseCustomTable] = useState(false);

  // Générer une liste de tables disponibles (1-20) si aucune n'est fournie
  const tables = availableTables.length > 0 
    ? availableTables 
    : Array.from({ length: 20 }, (_, i) => i + 1);

  const handleAssignTable = async () => {
    if (!reservation) return;

    const tableNumber = useCustomTable 
      ? parseInt(customTableNumber) 
      : parseInt(selectedTable);

    if (!tableNumber || tableNumber <= 0) {
      toast.error('Veuillez sélectionner un numéro de table valide');
      return;
    }

    try {
      setIsLoading(true);
      await onTableAssigned(reservation.id, tableNumber);
      toast.success(`Table ${tableNumber} assignée avec succès`);
      onClose();
      // Réinitialiser les champs
      setSelectedTable('');
      setCustomTableNumber('');
      setUseCustomTable(false);
    } catch (error) {
      toast.error('Erreur lors de l\'assignation de la table');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    // Réinitialiser les champs
    setSelectedTable('');
    setCustomTableNumber('');
    setUseCustomTable(false);
  };

  if (!reservation) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assigner une table</DialogTitle>
          <DialogDescription>
            Sélectionnez une table pour la réservation de {reservation.customer_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informations de la réservation */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h4 className="font-semibold text-sm">Détails de la réservation</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>{format(new Date(reservation.date), 'dd/MM/yyyy')} à {reservation.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-500" />
                <span>{reservation.guests} personnes</span>
              </div>
              {reservation.customer_phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{reservation.customer_phone}</span>
                </div>
              )}
              {reservation.customer_email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{reservation.customer_email}</span>
                </div>
              )}
              {reservation.special_requests && (
                <div className="flex items-start gap-2">
                  <MessageSquare className="h-4 w-4 text-gray-500 mt-0.5" />
                  <span className="text-xs">{reservation.special_requests}</span>
                </div>
              )}
            </div>
          </div>

          {/* Sélection de table */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="table-selection">Méthode de sélection</Label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="table-selection"
                    checked={!useCustomTable}
                    onChange={() => setUseCustomTable(false)}
                    className="text-blue-600"
                  />
                  <span className="text-sm">Table existante</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="table-selection"
                    checked={useCustomTable}
                    onChange={() => setUseCustomTable(true)}
                    className="text-blue-600"
                  />
                  <span className="text-sm">Numéro personnalisé</span>
                </label>
              </div>
            </div>

            {!useCustomTable ? (
              <div>
                <Label htmlFor="table-select">Sélectionner une table</Label>
                <Select value={selectedTable} onValueChange={setSelectedTable}>
                  <SelectTrigger id="table-select">
                    <SelectValue placeholder="Choisir une table" />
                  </SelectTrigger>
                  <SelectContent>
                    {tables.map((tableNum) => (
                      <SelectItem key={tableNum} value={tableNum.toString()}>
                        Table {tableNum}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div>
                <Label htmlFor="custom-table">Numéro de table</Label>
                <Input
                  id="custom-table"
                  type="number"
                  min="1"
                  placeholder="Entrez le numéro de table"
                  value={customTableNumber}
                  onChange={(e) => setCustomTableNumber(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Table actuellement assignée */}
          {reservation.table_number && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-100 text-blue-800">
                  Table actuellement assignée
                </Badge>
                <span className="font-semibold">Table {reservation.table_number}</span>
              </div>
              <p className="text-xs text-blue-600 mt-1">
                Cette action remplacera l'assignation actuelle
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Annuler
          </Button>
          <Button 
            onClick={handleAssignTable} 
            disabled={isLoading || (!useCustomTable && !selectedTable) || (useCustomTable && !customTableNumber)}
          >
            {isLoading ? 'Assignation...' : 'Assigner la table'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 