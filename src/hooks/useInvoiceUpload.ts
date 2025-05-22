
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createInvoice, uploadInvoiceFile, getInvoiceFileUrl } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/use-toast';
import { extractDataFromDocument, saveExtractedData } from '@/lib/ai-extraction';
import { type Invoice } from '@/types';

export const useInvoiceUpload = () => {
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

  const handleClearFile = () => {
    setFile(null);
  };

  const handleUpload = async (e: React.FormEvent) => {
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
      
      if (result.error) {
        console.error('Erreur lors du téléversement du fichier:', result.error);
        throw new Error(result.error instanceof Error ? result.error.message : 'Upload error');
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

  return {
    title,
    setTitle,
    file,
    isUploading,
    uploadProgress,
    processingStep,
    handleFileChange,
    handleClearFile,
    handleUpload
  };
};
