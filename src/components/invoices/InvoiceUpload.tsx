import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createInvoice, uploadInvoiceFile, getInvoiceFileUrl } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress';
import { UploadCloud, Loader2 } from 'lucide-react';
import { extractDataFromDocument, saveExtractedData } from '@/lib/ai-extraction';
import { type Invoice } from '@/types';

const InvoiceUpload = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStep, setProcessingStep] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Auto-generate title from filename if empty
      if (!title) {
        setTitle(selectedFile.name.split('.')[0]);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez sélectionner un fichier.",
      });
      return;
    }
    
    if (!user) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Vous devez être connecté pour téléverser une facture.",
      });
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    setProcessingStep('Initialisation du téléversement...');
    
    try {
      console.log('Début du processus de téléversement pour:', file.name);
      
      // Create invoice record in database
      setProcessingStep('Création de l\'enregistrement de facture...');
      console.log('Création de l\'enregistrement de facture dans la base de données...');
      const invoiceStatus = 'pending' as 'pending' | 'processed' | 'error' | 'validated';
      const { data: invoice, error: invoiceError } = await createInvoice({
        user_id: user.id,
        title: title || file.name,
        status: invoiceStatus,
        file_type: file.type,
      });
      
      if (invoiceError) {
        console.error('Erreur lors de la création de la facture:', invoiceError);
        throw new Error(invoiceError.message);
      }
      
      console.log('Facture créée avec succès:', invoice.id);
      
      // Upload file to storage with progress tracking
      const filePath = `${user.id}/${invoice.id}/${file.name}`;
      setProcessingStep('Téléversement du fichier...');
      console.log('Téléversement du fichier vers le stockage:', filePath);
      
      const result = await uploadInvoiceFile(file, filePath, (progress) => {
        setUploadProgress(progress);
      });
      
      // Safely check for errors in the result
      const uploadError = result && 'error' in result ? result.error : null;
      if (uploadError) {
        console.error('Erreur lors du téléversement du fichier:', uploadError);
        throw new Error(uploadError instanceof Error ? uploadError.message : 'Upload error');
      }
      
      console.log('Fichier téléversé avec succès');
      
      // Update invoice with file path
      setProcessingStep('Mise à jour des informations de facture...');
      console.log('Mise à jour de la facture avec le chemin du fichier...');
      const { error: updateError } = await createInvoice({
        id: invoice.id,
        file_path: filePath,
      } as {
        id: string;
        file_path: string;
      });
      
      if (updateError) {
        console.error('Erreur lors de la mise à jour de la facture:', updateError);
        throw new Error(updateError.message);
      }
      
      // Process document extraction
      try {
        setProcessingStep('Extraction des données du document...');
        console.log('Récupération de l\'URL du fichier pour extraction...');
        const fileUrl = await getInvoiceFileUrl(filePath);
        console.log('URL du fichier obtenue:', fileUrl);
        
        if (!fileUrl) {
          throw new Error("Impossible d'obtenir l'URL du fichier");
        }
        
        console.log('Début de l\'extraction des données...');
        const extractionResult = await extractDataFromDocument(fileUrl);
        console.log('Extraction réussie:', extractionResult);
        
        setProcessingStep('Sauvegarde des données extraites...');
        console.log('Sauvegarde des données extraites...');
        const saveResult = await saveExtractedData(invoice as Invoice, extractionResult);
        
        if (!saveResult.success) {
          console.error('Erreur lors de la sauvegarde des données extraites:', saveResult.error);
        } else {
          console.log('Données extraites sauvegardées avec succès');
        }
      } catch (extractionError) {
        console.error('Erreur lors du traitement d\'extraction:', extractionError);
        toast({
          title: "Avertissement",
          description: "Le fichier a été téléversé, mais l'extraction automatique a échoué. Vous pourrez valider manuellement les données.",
        });
      }
      
      setProcessingStep('Finalisation...');
      setUploadProgress(100);
      
      toast({
        title: "Téléversement réussi",
        description: "Votre facture a été téléversée avec succès et est en cours d'analyse.",
      });
      
      // Redirect to invoice details after short delay
      setTimeout(() => {
        navigate(`/invoice/${invoice.id}`);
      }, 1500);
    } catch (err: any) {
      console.error('Erreur complète lors du téléversement:', err);
      toast({
        variant: "destructive",
        title: "Erreur de téléversement",
        description: err.message || "Une erreur s'est produite lors du téléversement.",
      });
      setIsUploading(false);
      setProcessingStep('');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Titre de la facture</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Facture électricité juin 2025"
              disabled={isUploading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="file">Fichier de facture</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center">
              {file ? (
                <div className="space-y-2 w-full">
                  <div className="flex items-center justify-center mb-4">
                    <div className="h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-500">
                      <UploadCloud size={28} />
                    </div>
                  </div>
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setFile(null)} 
                    className="mt-2"
                    disabled={isUploading}
                  >
                    Changer de fichier
                  </Button>
                </div>
              ) : (
                <label className="w-full cursor-pointer">
                  <div className="flex flex-col items-center justify-center py-4">
                    <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-4">
                      <UploadCloud size={28} />
                    </div>
                    <p className="text-sm font-medium">Cliquez pour téléverser</p>
                    <p className="text-xs text-gray-500 mt-1">ou déposez votre fichier ici</p>
                    <p className="text-xs text-gray-500 mt-2">PDF, PNG, JPEG acceptés</p>
                  </div>
                  <Input
                    id="file"
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".pdf,.png,.jpg,.jpeg"
                    disabled={isUploading}
                  />
                </label>
              )}
            </div>
          </div>
          
          {isUploading && (
            <div className="space-y-3">
              <div className="flex justify-between text-xs text-gray-500">
                <span>{processingStep}</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={!file || isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Téléversement en cours...
              </>
            ) : (
              'Téléverser la facture'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default InvoiceUpload;
