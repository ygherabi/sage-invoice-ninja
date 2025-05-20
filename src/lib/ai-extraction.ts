import { createInvoice, createInvoiceField, getInvoiceFields, updateInvoiceField } from '@/lib/supabase';
import { type Invoice, type InvoiceField } from '@/types';

// Configuration par défaut des champs à extraire
export const DEFAULT_EXTRACTION_SCHEMA = {
  invoice_number: { label: 'Numéro de facture', required: true },
  date: { label: 'Date de facture', required: true },
  due_date: { label: 'Date d\'échéance', required: false },
  supplier: { label: 'Fournisseur', required: true },
  total_amount: { label: 'Montant total', required: true },
  tax_amount: { label: 'Montant TVA', required: false },
  reference: { label: 'Référence', required: false },
  description: { label: 'Description', required: false },
};

// Interface pour le résultat de l'extraction
export interface ExtractionResult {
  fields: {
    [key: string]: {
      value: string;
      confidence: number;
      position?: { x: number, y: number, width: number, height: number };
    }
  };
  rawText?: string;
}

// Service pour l'extraction de données via Azure Document Intelligence
export const extractDataFromDocument = async (fileUrl: string): Promise<ExtractionResult> => {
  try {
    // Simulation d'appel à un service d'OCR comme Azure Document Intelligence
    console.log('Extraction des données du document:', fileUrl);
    
    // Simuler un délai pour l'OCR
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Données simulées - en production, ces données proviendraient d'Azure
    const extractedData: ExtractionResult = {
      fields: {
        invoice_number: { value: 'INV-' + Math.floor(10000 + Math.random() * 90000), confidence: 0.94 },
        date: { value: new Date().toISOString().split('T')[0], confidence: 0.96 },
        due_date: { value: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], confidence: 0.91 },
        supplier: { value: 'Fournisseur Demo', confidence: 0.98 },
        total_amount: { value: (Math.random() * 1000).toFixed(2), confidence: 0.95 },
        tax_amount: { value: (Math.random() * 200).toFixed(2), confidence: 0.92 },
        reference: { value: 'REF-' + Math.floor(1000 + Math.random() * 9000), confidence: 0.88 },
        description: { value: 'Achat de fournitures', confidence: 0.76 },
      },
      rawText: 'Ceci est le texte brut extrait du document...'
    };
    
    console.log('Données extraites avec succès:', extractedData);
    return extractedData;
  } catch (error) {
    console.error('Erreur lors de l\'extraction des données du document:', error);
    throw new Error('Échec de l\'extraction des données du document');
  }
};

// Fonction pour sauvegarder les données extraites
export const saveExtractedData = async (
  invoice: Invoice, 
  extractionResult: ExtractionResult
): Promise<{ success: boolean; error?: any }> => {
  try {
    console.log("Sauvegarde des données extraites pour la facture:", invoice.id);
    console.log("Résultat d'extraction:", extractionResult);
    
    // Vérifier que les champs essentiels sont présents
    if (!extractionResult.fields) {
      console.error("Les champs extraits sont manquants");
      return { success: false, error: "Données d'extraction invalides" };
    }
    
    // Préparer les données à mettre à jour
    const invoiceUpdateData: any = {
      id: invoice.id,
      status: 'processed'
    };
    
    // Ajouter les champs extraits s'ils existent
    if (extractionResult.fields.invoice_number?.value) {
      invoiceUpdateData.invoice_number = extractionResult.fields.invoice_number.value;
    }
    
    if (extractionResult.fields.date?.value) {
      invoiceUpdateData.invoice_date = extractionResult.fields.date.value;
    }
    
    if (extractionResult.fields.due_date?.value) {
      invoiceUpdateData.due_date = extractionResult.fields.due_date.value;
    }
    
    if (extractionResult.fields.supplier?.value) {
      invoiceUpdateData.supplier = extractionResult.fields.supplier.value;
    }
    
    if (extractionResult.fields.total_amount?.value) {
      const totalAmount = parseFloat(extractionResult.fields.total_amount.value);
      if (!isNaN(totalAmount)) {
        invoiceUpdateData.total_amount = totalAmount;
      }
    }
    
    if (extractionResult.fields.tax_amount?.value) {
      const taxAmount = parseFloat(extractionResult.fields.tax_amount.value);
      if (!isNaN(taxAmount)) {
        invoiceUpdateData.tax_amount = taxAmount;
      }
    }
    
    // Mettre à jour les informations de base de la facture
    console.log("Mise à jour de la facture avec les données:", invoiceUpdateData);
    const { error: updateError } = await createInvoice(invoiceUpdateData);
    
    if (updateError) {
      console.error("Erreur lors de la mise à jour de la facture:", updateError);
      return { success: false, error: updateError };
    }
    
    console.log("Facture mise à jour avec succès, enregistrement des champs");
    
    // Enregistrer tous les champs extraits
    const fieldPromises = Object.entries(extractionResult.fields).map(async ([field_name, data]) => {
      const fieldData = {
        invoice_id: invoice.id,
        field_name,
        field_value: data.value,
        confidence: data.confidence,
        position_data: data.position || null,
      };
      
      console.log(`Sauvegarde du champ ${field_name}:`, fieldData);
      return createInvoiceField(fieldData);
    });
    
    const fieldResults = await Promise.allSettled(fieldPromises);
    
    // Vérifier si des erreurs se sont produites
    const errors = fieldResults
      .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
      .map(result => result.reason);
    
    if (errors.length > 0) {
      console.warn("Certains champs n'ont pas pu être sauvegardés:", errors);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des données extraites:', error);
    return { success: false, error };
  }
};

// Fonction pour valider les données extraites
export const validateExtractedData = async (
  invoiceId: string,
  validatedFields: Record<string, string>
): Promise<{ success: boolean; error?: any }> => {
  try {
    // Récupérer tous les champs existants
    const fields = await getInvoiceFields(invoiceId);
    
    if (!fields) throw new Error('Champs de facture non trouvés');
    
    // Mettre à jour chaque champ avec la valeur validée
    for (const field of fields) {
      if (validatedFields[field.field_name]) {
        await updateInvoiceField(field.id, {
          field_value: validatedFields[field.field_name],
          // Marquer comme validé avec 100% de confiance
          confidence: 1.0
        });
      }
    }
    
    // Mettre à jour le statut de la facture
    await createInvoice({
      id: invoiceId,
      status: 'validated'
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error validating extracted data:', error);
    return { success: false, error };
  }
};

// Fonction pour transformer les données au format compatible avec Sage
export const transformDataForSage = (
  invoice: Invoice, 
  fields: InvoiceField[]
): Record<string, any> => {
  // Structure attendue par Sage
  const sageData = {
    NumFacture: invoice.invoice_number || '',
    DateFacture: invoice.invoice_date || '',
    DateEcheance: invoice.due_date || '',
    Fournisseur: invoice.supplier || '',
    MontantHT: invoice.total_amount ? (invoice.total_amount - (invoice.tax_amount || 0)) : 0,
    MontantTVA: invoice.tax_amount || 0,
    MontantTTC: invoice.total_amount || 0,
    Reference: fields.find(f => f.field_name === 'reference')?.field_value || '',
    Description: fields.find(f => f.field_name === 'description')?.field_value || '',
    // Champs additionnels spécifiques à Sage
    TypeDocument: 'FACTURE',
    CodeJournal: 'ACH',
    DeviseCode: 'EUR',
  };
  
  return sageData;
};

// Fonction pour générer un exemple de connecteur vers Sage (simulation)
export const exportToSage = async (
  invoiceId: string
): Promise<{ success: boolean; message: string; error?: any }> => {
  try {
    console.log('Exporting invoice to Sage:', invoiceId);
    
    // Simuler un délai pour l'export
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Dans une implémentation réelle, ici nous ferions un appel à l'API de Sage
    // avec les données transformées
    
    return { 
      success: true, 
      message: 'Facture exportée avec succès vers Sage' 
    };
  } catch (error) {
    console.error('Error exporting to Sage:', error);
    return { 
      success: false, 
      message: 'Échec de l\'export vers Sage', 
      error 
    };
  }
};
