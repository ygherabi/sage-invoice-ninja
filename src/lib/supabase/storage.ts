
import { supabase } from '@/integrations/supabase/client';

// File Storage functions
export const uploadInvoiceFile = async (file: File, filePath: string, onProgress?: (progress: number) => void) => {
  console.log('Début du téléversement du fichier:', filePath);
  
  // Créer un FormData pour suivre la progression
  const formData = new FormData();
  formData.append('file', file);
  
  // Utiliser la méthode upload avec l'option d'événement de progression
  const { data, error } = await supabase.storage
    .from('invoices')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
      onUploadProgress: (progress) => {
        const percent = Math.round((progress.loaded / progress.total) * 100);
        console.log(`Progression du téléversement: ${percent}%`);
        if (onProgress) onProgress(percent);
      }
    });
  
  if (error) {
    console.error('Erreur de téléversement:', error);
  } else {
    console.log('Téléversement réussi:', data);
  }
  
  return { data, error };
};

export const getInvoiceFileUrl = async (filePath: string) => {
  console.log('Récupération de l\'URL pour:', filePath);
  
  if (!filePath) {
    console.error('Chemin de fichier non spécifié');
    return null;
  }
  
  try {
    const { data } = await supabase.storage
      .from('invoices')
      .getPublicUrl(filePath);
    
    console.log('URL publique générée:', data.publicUrl);
    return data.publicUrl;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'URL:', error);
    return null;
  }
};

// Vérifier si un fichier existe
export const checkFileExists = async (filePath: string) => {
  try {
    const { data, error } = await supabase.storage
      .from('invoices')
      .list(filePath.split('/').slice(0, -1).join('/'), {
        search: filePath.split('/').pop()
      });
    
    if (error) {
      console.error('Erreur lors de la vérification du fichier:', error);
      return false;
    }
    
    return data && data.length > 0;
  } catch (error) {
    console.error('Erreur lors de la vérification du fichier:', error);
    return false;
  }
};

// Supprimer un fichier
export const deleteInvoiceFile = async (filePath: string) => {
  try {
    const { data, error } = await supabase.storage
      .from('invoices')
      .remove([filePath]);
    
    if (error) {
      console.error('Erreur lors de la suppression du fichier:', error);
      return { success: false, error };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Erreur lors de la suppression du fichier:', error);
    return { success: false, error };
  }
};
