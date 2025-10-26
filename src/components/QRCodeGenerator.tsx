import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Download, QrCode, Copy, Check } from 'lucide-react';
import { useToast } from './ui/use-toast';

interface QRCodeGeneratorProps {
  businessId: number;
  businessName: string;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  businessId,
  businessName
}) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // URL de base pour l'application mobile (deep link)
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'braprime://businesses' 
    : 'braprime://businesses';

  // Générer l'URL du business avec deep link (vers la page existante)
  const businessUrl = `${baseUrl}/${businessId}`;

  // Générer le QR code
  const generateQRCode = async () => {
    setIsGenerating(true);
    try {
      const qrCodeUrl = await QRCode.toDataURL(businessUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });
      setQrCodeDataUrl(qrCodeUrl);
    } catch (error) {
      console.error('Erreur lors de la génération du QR code:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le QR code",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Générer automatiquement le QR code au montage
  useEffect(() => {
    generateQRCode();
  }, [businessId]);

  // Copier l'URL dans le presse-papier
  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(businessUrl);
      setCopied(true);
      toast({
        title: "URL copiée",
        description: "L'URL du restaurant a été copiée dans le presse-papier"
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de copier l'URL",
        variant: "destructive"
      });
    }
  };

  // Télécharger le QR code
  const downloadQRCode = () => {
    if (!qrCodeDataUrl) return;
    
    const link = document.createElement('a');
    link.download = `qr-code-${businessName.replace(/[^a-zA-Z0-9]/g, '-')}.png`;
    link.href = qrCodeDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "QR code téléchargé",
      description: "Le QR code a été téléchargé avec succès"
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <QrCode className="h-4 w-4" />
          QR Code
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            QR Code - {businessName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Affichage du QR code */}
          <div className="flex justify-center">
            {isGenerating ? (
              <div className="w-[300px] h-[300px] flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-500">Génération du QR code...</p>
                </div>
              </div>
            ) : qrCodeDataUrl ? (
              <img 
                src={qrCodeDataUrl} 
                alt={`QR Code pour ${businessName}`}
                className="border rounded-lg"
              />
            ) : (
              <div className="w-[300px] h-[300px] flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-sm text-gray-500">Erreur de génération</p>
              </div>
            )}
          </div>

          {/* Informations du restaurant */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Informations du restaurant</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Restaurant:</span> {businessName}
              </div>
              <div>
                <span className="font-medium">ID:</span> {businessId}
              </div>
              <div>
                <span className="font-medium">Deep Link:</span> 
                <code className="ml-1 text-xs bg-gray-100 px-1 py-0.5 rounded">
                  {businessUrl}
                </code>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-2">
            <Button 
              onClick={copyUrl} 
              variant="outline" 
              size="sm" 
              className="flex-1 gap-2"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copié' : 'Copier URL'}
            </Button>
            <Button 
              onClick={downloadQRCode} 
              variant="outline" 
              size="sm" 
              className="flex-1 gap-2"
              disabled={!qrCodeDataUrl}
            >
              <Download className="h-4 w-4" />
              Télécharger
            </Button>
          </div>

          {/* Instructions */}
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
            <p className="font-medium mb-1">Instructions :</p>
            <ul className="space-y-1">
              <li>• Le client scanne ce QR code avec son téléphone</li>
              <li>• L'application s'ouvre directement sur ce service</li>
              <li>• Le client peut voir les détails et commander</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeGenerator;
