import { supabase } from '@/integrations/supabase/client';

// File Storage functions
export const uploadInvoiceFile = async (file: File, filePath: string, onProgress?: (progress: number) => void) => {
  console.log('Début du téléversement du fichier:', filePath);
  
  // Create a FormData to track progress
  const formData = new FormData();
  formData.append('file', file);
  
  // Standard upload without progress callback
  if (!onProgress) {
    // Use the upload method without progress tracking
    const { data, error } = await supabase.storage
      .from('invoices')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });
    
    if (error) {
      console.error('Erreur de téléversement:', error);
    } else {
      console.log('Téléversement réussi:', data);
    }
    
    return { data, error };
  }
  
  // Manual implementation of progress tracking using XMLHttpRequest
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        console.log(`Progression du téléversement: ${percentComplete}%`);
        if (onProgress) onProgress(percentComplete);
      }
    };
    
    xhr.onload = async function() {
      if (xhr.status === 200) {
        console.log('Téléversement réussi via XHR');
        // After XHR upload completes, use Supabase to properly register the file
        const { data, error } = await supabase.storage
          .from('invoices')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true,
          });
          
        resolve({ data, error });
      } else {
        console.error('Erreur de téléversement XHR:', xhr.statusText);
        resolve({ data: null, error: new Error(xhr.statusText) });
      }
    };
    
    xhr.onerror = function() {
      console.error('Erreur réseau lors du téléversement');
      resolve({ data: null, error: new Error('Network error') });
    };
    
    // Get the signed URL for upload
    (async () => {
      try {
        const { data } = await supabase.storage.from('invoices').createSignedUploadUrl(filePath);
        if (data?.signedURL) {
          xhr.open('PUT', data.signedURL);
          xhr.send(file);
          onProgress(1); // Start with 1% to show initialization
        } else {
          console.error('Failed to get signed URL');
          resolve({ data: null, error: new Error('Failed to get signed URL') });
        }
      } catch (error) {
        console.error('Error getting signed URL:', error);
        resolve({ data: null, error });
      }
    })();
  });
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
