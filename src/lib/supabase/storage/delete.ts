
import { supabase } from '@/integrations/supabase/client';
import { STORAGE_BUCKET } from './constants';
import { DeleteResult } from './types';

// Delete functionality
export const deleteInvoiceFile = async (filePath: string): Promise<DeleteResult> => {
  if (!filePath) {
    console.error('Chemin de fichier non spécifié pour la suppression');
    return { success: false, error: new Error('Chemin de fichier non spécifié') };
  }
  
  try {
    console.log('Suppression du fichier:', filePath);
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([filePath]);
    
    if (error) {
      console.error('Erreur lors de la suppression du fichier:', error);
      return { success: false, error };
    }
    
    console.log('Fichier supprimé avec succès');
    return { success: true, data };
  } catch (error) {
    console.error('Erreur lors de la suppression du fichier:', error);
    return { success: false, error };
  }
};
