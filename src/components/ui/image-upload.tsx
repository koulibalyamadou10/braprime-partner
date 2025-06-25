import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImageIcon, Upload, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  value?: string;
  onChange: (value: string) => void;
  onUpload?: (file: File) => Promise<string>;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const ImageUpload = ({ 
  value, 
  onChange, 
  onUpload, 
  placeholder = "Cliquez pour uploader une image",
  className,
  disabled = false 
}: ImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file) return;

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image valide');
      return;
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('L\'image ne doit pas dépasser 5MB');
      return;
    }

    setIsUploading(true);

    try {
      if (onUpload) {
        // Upload personnalisé
        const imageUrl = await onUpload(file);
        onChange(imageUrl);
      } else {
        // Créer une URL temporaire pour prévisualisation
        const imageUrl = URL.createObjectURL(file);
        onChange(imageUrl);
      }
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      alert('Erreur lors de l\'upload de l\'image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleRemove = () => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <Label>Image de l'article</Label>
      
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 transition-colors",
          dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300",
          disabled && "opacity-50 cursor-not-allowed",
          !disabled && !isUploading && "hover:border-gray-400 cursor-pointer"
        )}
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled || isUploading}
        />

        {value ? (
          // Image sélectionnée
          <div className="relative">
            <img
              src={value}
              alt="Prévisualisation"
              className="w-full h-48 object-cover rounded-lg"
            />
            {!disabled && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ) : (
          // Zone d'upload vide
          <div className="flex flex-col items-center justify-center space-y-2 text-center">
            {isUploading ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                <p className="text-sm text-gray-500">Upload en cours...</p>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full">
                  <ImageIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-700">
                    {placeholder}
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG jusqu'à 5MB
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  disabled={disabled}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choisir une image
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {value && (
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Image sélectionnée</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            disabled={disabled}
            className="h-6 px-2 text-xs"
          >
            Supprimer
          </Button>
        </div>
      )}
    </div>
  );
};

export default ImageUpload; 