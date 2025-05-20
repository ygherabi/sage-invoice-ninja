
import { supabase } from '@/integrations/supabase/client';

// File Storage functions
export const uploadInvoiceFile = async (file: File, filePath: string) => {
  console.log('Début du téléversement du fichier:', filePath);
  const { data, error } = await supabase.storage
    .from('invoices')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true
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
  const { data } = await supabase.storage
    .from('invoices')
    .getPublicUrl(filePath);
  
  console.log('URL publique générée:', data.publicUrl);
  return data.publicUrl;
};
