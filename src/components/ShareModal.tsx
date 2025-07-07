import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Share2, 
  Copy, 
  MessageCircle, 
  Mail, 
  Facebook, 
  Twitter, 
  Check,
  Star,
  MapPin
} from 'lucide-react';

interface Business {
  id: number;
  name: string;
  description?: string;
  address: string;
  phone?: string;
  delivery_time?: string;
  rating?: number;
  review_count?: number;
  cover_image?: string;
  logo?: string;
  cuisine_type?: string;
}

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  business: Business;
}

const ShareModal = ({ isOpen, onClose, business }: ShareModalProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const currentUrl = window.location.href;



  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      toast({
        title: "Lien copié !",
        description: "Le lien a été copié dans le presse-papiers.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible de copier le lien.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async (platform: string) => {
    const text = `Découvrez ${business.name} sur BraPrime ! ${currentUrl}`;
    
    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`);
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`);
        break;
      case 'email':
        window.open(`mailto:?subject=${encodeURIComponent(`Découvrez ${business.name}`)}&body=${encodeURIComponent(text)}`);
        break;
      default:
        break;
    }
  };



  const renderShareContent = () => (
    <div className="space-y-6">
      {/* Informations du business */}
      <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
          <img 
            src={business.logo || business.cover_image} 
            alt={business.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg text-gray-900 mb-1">{business.name}</h3>
          {business.cuisine_type && (
            <Badge variant="secondary" className="mb-2">{business.cuisine_type}</Badge>
          )}
          <div className="flex items-center text-sm text-gray-600 mb-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
            <span>{business.rating || 0}</span>
            <span className="text-xs ml-1">({business.review_count || 0})</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="truncate">{business.address}</span>
          </div>
        </div>
      </div>

      {/* Options de partage */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Partager via :</h4>
        
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => handleShare('whatsapp')}
            variant="outline"
            className="flex items-center justify-center py-3"
          >
            <MessageCircle className="h-5 w-5 mr-2 text-green-600" />
            WhatsApp
          </Button>
          
          <Button
            onClick={() => handleShare('facebook')}
            variant="outline"
            className="flex items-center justify-center py-3"
          >
            <Facebook className="h-5 w-5 mr-2 text-blue-600" />
            Facebook
          </Button>
          
          <Button
            onClick={() => handleShare('twitter')}
            variant="outline"
            className="flex items-center justify-center py-3"
          >
            <Twitter className="h-5 w-5 mr-2 text-blue-400" />
            Twitter
          </Button>
          
          <Button
            onClick={() => handleShare('email')}
            variant="outline"
            className="flex items-center justify-center py-3"
          >
            <Mail className="h-5 w-5 mr-2 text-gray-600" />
            Email
          </Button>
        </div>

        {/* Copier le lien */}
        <div className="pt-4 border-t">
          <h4 className="font-medium text-gray-900 mb-3">Ou copier le lien :</h4>
          <div className="flex space-x-2">
            <input
              type="text"
              value={currentUrl}
              readOnly
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50"
            />
            <Button
              onClick={handleCopyLink}
              variant="outline"
              size="sm"
              className="flex-shrink-0"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Share2 className="h-5 w-5 mr-2 text-blue-500" />
            Partager
          </DialogTitle>
          <DialogDescription>
            Partagez ce service avec vos amis et votre famille
          </DialogDescription>
        </DialogHeader>
        
        {renderShareContent()}
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal; 