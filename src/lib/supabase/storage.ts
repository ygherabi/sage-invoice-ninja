
import { supabase } from '@/integrations/supabase/client';

// Define a type for the upload result
type UploadResult = {
  data: any | null;
  error: Error | null;
};

// Constantes pour la configuration
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB maximum
const ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const STORAGE_BUCKET = 'invoices';

// File Storage functions
export const uploadInvoiceFile = async (file: File, filePath: string, onProgress?: (progress: number) => void): Promise<UploadResult> => {
  console.log('Début du téléversement du fichier:', filePath, 'Taille:', (file.size / 1024 / 1024).toFixed(2) + 'MB');
  
  // Validation de la taille du fichier
  if (file.size > MAX_FILE_SIZE) {
    console.error('Fichier trop volumineux:', (file.size / 1024 / 1024).toFixed(2) + 'MB');
    return { 
      data: null, 
      error: new Error(`Le fichier est trop volumineux. Taille maximum: ${MAX_FILE_SIZE / 1024 / 1024}MB`) 
    };
  }
  
  // Validation du type de fichier
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    console.error('Type de fichier non supporté:', file.type);
    return { 
      data: null, 
      error: new Error('Type de fichier non supporté. Seuls PDF, JPEG et PNG sont acceptés.') 
    };
  }
  
  // Create a FormData to track progress
  const formData = new FormData();
  formData.append('file', file);
  
  // Standard upload without progress callback
  if (!onProgress) {
    console.log('Téléversement standard sans suivi de progression');
    try {
      // Use the upload method without progress tracking
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
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
    } catch (unexpectedError) {
      console.error('Erreur inattendue lors du téléversement standard:', unexpectedError);
      return { 
        data: null, 
        error: unexpectedError instanceof Error ? unexpectedError : new Error('Erreur inattendue') 
      };
    }
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
        try {
          // After XHR upload completes, use Supabase to properly register the file
          const { data, error } = await supabase.storage
            .from(STORAGE_BUCKET)
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: true,
            });
            
          resolve({ data, error });
        } catch (registerError) {
          console.error('Erreur lors de l\'enregistrement du fichier dans Supabase:', registerError);
          resolve({ 
            data: null, 
            error: registerError instanceof Error ? registerError : new Error('Erreur d\'enregistrement') 
          });
        }
      } else {
        console.error('Erreur de téléversement XHR:', xhr.status, xhr.statusText);
        resolve({ data: null, error: new Error(`Erreur HTTP: ${xhr.status} - ${xhr.statusText}`) });
      }
    };
    
    xhr.onerror = function() {
      console.error('Erreur réseau lors du téléversement');
      resolve({ data: null, error: new Error('Erreur réseau pendant le téléversement') });
    };
    
    xhr.ontimeout = function() {
      console.error('Délai d\'attente dépassé pour le téléversement');
      resolve({ data: null, error: new Error('Délai d\'attente dépassé pour le téléversement') });
    };
    
    // Get the signed URL for upload
    (async () => {
      try {
        console.log('Récupération de l\'URL signée pour le téléversement');
        const { data, error } = await supabase.storage.from(STORAGE_BUCKET).createSignedUploadUrl(filePath);
        
        if (error) {
          console.error('Erreur lors de la récupération de l\'URL signée:', error);
          resolve({ data: null, error });
          return;
        }
        
        if (data?.signedUrl) {
          console.log('URL signée obtenue, début du téléversement XHR');
          xhr.open('PUT', data.signedUrl);
          xhr.send(file);
          onProgress(1); // Start with 1% to show initialization
        } else {
          console.error('Échec de la récupération de l\'URL signée');
          resolve({ data: null, error: new Error('Échec de la récupération de l\'URL signée') });
        }
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'URL signée:', error);
        resolve({ data: null, error: error instanceof Error ? error : new Error('Erreur inconnue') });
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
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath);
    
    if (error) {
      console.error('Erreur lors de la récupération de l\'URL:', error);
      return null;
    }
    
    console.log('URL publique générée:', data.publicUrl);
    return data.publicUrl;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'URL:', error);
    return null;
  }
};

// Vérifier si un fichier existe
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

// Supprimer un fichier
export const deleteInvoiceFile = async (filePath: string) => {
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
