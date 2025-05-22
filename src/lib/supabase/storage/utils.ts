
import { supabase } from '@/integrations/supabase/client';
import { STORAGE_BUCKET } from './constants';

// Utility functions for storage operations
export const getInvoiceFileUrl = async (filePath: string) => {
  console.log('Récupération de l\'URL pour:', filePath);
  
  if (!filePath) {
    console.error('Chemin de fichier non spécifié');
    return null;
  }
  
  try {
    // Cette méthode retourne maintenant { data: { publicUrl: string } } sans propriété error
    const { data } = await supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath);
    
    console.log('URL publique générée:', data.publicUrl);
    return data.publicUrl;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'URL:', error);
    return null;
  }
};

// Check if a file exists
export const checkFileExists = async (filePath: string) => {
  if (!filePath) {
    console.error('Chemin de fichier non spécifié pour la vérification');
    return false;
  }
  
  try {
    console.log('Vérification de l\'existence du fichier:', filePath);
    const folderPath = filePath.split('/').slice(0, -1).join('/');
    const fileName = filePath.split('/').pop();
    
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list(folderPath, {
        search: fileName
      });
    
    if (error) {
      console.error('Erreur lors de la vérification du fichier:', error);
      return false;
    }
    
    const fileExists = data && data.length > 0;
    console.log('Le fichier existe:', fileExists);
    return fileExists;
  } catch (error) {
    console.error('Erreur lors de la vérification du fichier:', error);
    return false;
  }
};
