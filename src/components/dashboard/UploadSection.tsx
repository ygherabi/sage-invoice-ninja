
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, X, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { uploadInvoiceFile, createInvoice, getCurrentUser } from '@/lib/supabase';

const UploadSection = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles = droppedFiles.filter(file => 
      file.type === 'application/pdf' || 
      file.type === 'image/jpeg' || 
      file.type === 'image/png'
    );
    
    if (validFiles.length !== droppedFiles.length) {
      toast({
        title: "Formats non supportés",
        description: "Seuls les fichiers PDF, JPEG et PNG sont acceptés.",
        variant: "destructive"
      });
    }
    
    setFiles(prev => [...prev, ...validFiles]);
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...selectedFiles]);
    }
  };
  
  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  const startUpload = async () => {
    if (files.length === 0) {
      toast({
        title: "Aucun fichier sélectionné",
        description: "Veuillez sélectionner au moins un fichier à traiter.",
        variant: "destructive"
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Récupérer l'utilisateur courant
      const user = await getCurrentUser();
      if (!user) {
        throw new Error("Utilisateur non connecté");
      }
      
      const uploadedInvoiceIds = [];
      
      // Traitement de chaque fichier
      for (const file of files) {
        // Créer d'abord une entrée de facture
        const { data: invoiceData, error: invoiceError } = await createInvoice({
          user_id: user.id,
          title: file.name.replace(/\.[^/.]+$/, ""), // Nom de fichier sans extension
          status: 'pending'
        });
        
        if (invoiceError || !invoiceData) {
          console.error("Erreur lors de la création de la facture:", invoiceError);
          throw new Error("Échec de la création de la facture");
        }
        
        // Générer un chemin de fichier unique
        const fileExt = file.name.split('.').pop();
        const filePath = `${user.id}/${invoiceData.id}/${Date.now()}.${fileExt}`;
        
        // Téléverser le fichier
        const { data: fileData, error: fileError } = await uploadInvoiceFile(file, filePath);
        
        if (fileError || !fileData) {
          console.error("Erreur lors du téléversement du fichier:", fileError);
          throw new Error("Échec du téléversement du fichier");
        }
        
        // Mettre à jour la facture avec le chemin du fichier
        const { error: updateError } = await createInvoice({
          id: invoiceData.id,
          file_path: filePath,
          file_type: file.type
        });
        
        if (updateError) {
          console.error("Erreur lors de la mise à jour de la facture:", updateError);
          throw new Error("Échec de la mise à jour des informations de la facture");
        }
        
        uploadedInvoiceIds.push(invoiceData.id);
      }
      
      toast({
        title: "Téléversement réussi",
        description: `${files.length} fichier(s) ont été téléversés avec succès.`
      });
      
      // Rediriger vers la première facture téléversée pour l'analyse
      if (uploadedInvoiceIds.length > 0) {
        navigate(`/invoices/${uploadedInvoiceIds[0]}`);
      } else {
        navigate('/invoices');
      }
      
      setFiles([]);
    } catch (error) {
      console.error("Erreur lors du traitement des fichiers:", error);
      toast({
        title: "Erreur de téléversement",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors du téléversement",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <Card className="col-span-1 lg:col-span-3">
      <CardHeader>
        <CardTitle>Téléverser des Factures</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Upload Area */}
        <div 
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center transition-all",
            isDragging ? "border-invoice-blue bg-invoice-blue-light" : "border-gray-300",
            isUploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center">
            <Upload className="h-10 w-10 text-invoice-blue mb-3" />
            <h3 className="text-lg font-medium mb-1">
              Glisser-déposer vos fichiers ici
            </h3>
            <p className="text-sm text-gray-500 mb-3">
              Ou cliquez pour parcourir vos fichiers
            </p>
            <Button 
              variant="outline" 
              className="relative" 
              disabled={isUploading}
            >
              Parcourir les fichiers
              <input 
                type="file" 
                className="absolute inset-0 opacity-0 cursor-pointer" 
                onChange={handleFileSelect}
                multiple
                accept=".pdf,.jpeg,.jpg,.png"
                disabled={isUploading}
              />
            </Button>
            <p className="text-xs text-gray-400 mt-2">
              Formats acceptés: PDF, JPEG, PNG
            </p>
          </div>
        </div>
        
        {/* Selected Files */}
        {files.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Fichiers sélectionnés ({files.length})</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {files.map((file, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-invoice-blue" />
                    <div className="text-sm truncate max-w-[200px]">{file.name}</div>
                    <div className="text-xs text-gray-500">{(file.size / 1024).toFixed(0)} KB</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => removeFile(index)}
                    disabled={isUploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            
            <div className="mt-4 flex justify-end">
              <Button onClick={startUpload} disabled={isUploading}>
                {isUploading ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    En cours...
                  </>
                ) : (
                  'Traiter les factures'
                )}
              </Button>
            </div>
          </div>
        )}
        
        {/* Help Notice */}
        <div className="mt-4 flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800">
          <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-medium">Conseils pour de meilleurs résultats:</p>
            <ul className="list-disc ml-5 mt-1 space-y-1">
              <li>Assurez-vous que les factures sont bien lisibles</li>
              <li>Préférez les documents PDF aux images pour une meilleure précision</li>
              <li>Évitez les documents manuscrits</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UploadSection;
