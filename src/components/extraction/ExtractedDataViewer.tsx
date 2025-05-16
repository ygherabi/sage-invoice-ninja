
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, Check, X, ExternalLink, Save } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { type Invoice, type InvoiceField } from '@/types';
import { validateExtractedData, exportToSage } from '@/lib/ai-extraction';

// Composant pour afficher l'indicateur de confiance
const ConfidenceIndicator = ({ value }: { value: number }) => {
  const getColor = () => {
    if (value >= 0.95) return 'bg-green-500';
    if (value >= 0.80) return 'bg-amber-500';
    return 'bg-red-500';
  };
  
  return (
    <div className="flex items-center gap-1">
      <div className={`h-2 w-2 rounded-full ${getColor()}`} />
      <span className="text-xs text-gray-500">{Math.round(value * 100)}%</span>
    </div>
  );
};

type ExtractedDataViewerProps = {
  invoice: Invoice;
  fields: InvoiceField[];
  onValidationComplete?: () => void;
};

const ExtractedDataViewer = ({ 
  invoice, 
  fields, 
  onValidationComplete 
}: ExtractedDataViewerProps) => {
  const { toast } = useToast();
  const [editableFields, setEditableFields] = useState<Record<string, string>>({});
  const [isValidating, setIsValidating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    // Initialiser les champs éditables avec les valeurs extraites
    const initialFields: Record<string, string> = {};
    fields.forEach(field => {
      if (field.field_value) {
        initialFields[field.field_name] = field.field_value;
      }
    });
    setEditableFields(initialFields);
  }, [fields]);

  const handleInputChange = (fieldName: string, value: string) => {
    setEditableFields(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleValidate = async () => {
    setIsValidating(true);
    try {
      console.log("Validating data for invoice:", invoice.id);
      console.log("Fields to validate:", editableFields);
      
      const result = await validateExtractedData(invoice.id, editableFields);
      console.log("Validation result:", result);
      
      if (result.success) {
        toast({
          title: 'Validation réussie',
          description: 'Les données ont été validées avec succès',
        });
        if (onValidationComplete) onValidationComplete();
      } else {
        console.error("Validation error:", result.error);
        toast({
          variant: 'destructive',
          title: 'Erreur de validation',
          description: 'Une erreur est survenue lors de la validation',
        });
      }
    } catch (error) {
      console.error('Error validating data:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur de validation',
        description: 'Une erreur inattendue est survenue',
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleExportToSage = async () => {
    setIsExporting(true);
    try {
      const result = await exportToSage(invoice.id);
      
      if (result.success) {
        toast({
          title: 'Export réussi',
          description: result.message,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Erreur d\'export',
          description: result.message,
        });
      }
    } catch (error) {
      console.error('Error exporting to Sage:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur d\'export',
        description: 'Une erreur inattendue est survenue',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Données Extraites</CardTitle>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-blue-500 text-blue-600 hover:bg-blue-50"
            onClick={handleExportToSage}
            disabled={isExporting || invoice.status !== 'validated'}
          >
            {isExporting ? (
              <>
                <div className="h-4 w-4 mr-1 animate-spin rounded-full border-2 border-b-transparent border-blue-600"></div>
                Export...
              </>
            ) : (
              <>
                <ExternalLink className="h-4 w-4 mr-1" /> Exporter vers Sage
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="border-green-500 text-green-600 hover:bg-green-50"
            onClick={handleValidate}
            disabled={isValidating || invoice.status === 'validated' || fields.length === 0}
          >
            {isValidating ? (
              <>
                <div className="h-4 w-4 mr-1 animate-spin rounded-full border-2 border-b-transparent border-green-600"></div>
                Validation...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-1" /> Valider
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {fields.length > 0 ? (
            fields.map((field) => (
              <div key={field.id} className="grid grid-cols-3 items-center gap-2 border-b pb-2">
                <div className="text-sm font-medium capitalize text-gray-700">
                  {field.field_name === 'invoice_number' ? 'Numéro' : 
                  field.field_name === 'date' ? 'Date' : 
                  field.field_name === 'due_date' ? 'Échéance' : 
                  field.field_name === 'supplier' ? 'Fournisseur' : 
                  field.field_name === 'total_amount' ? 'Montant total' : 
                  field.field_name === 'tax_amount' ? 'TVA' : 
                  field.field_name === 'reference' ? 'Référence' :
                  field.field_name === 'description' ? 'Description' : field.field_name}
                </div>
                
                <div className="text-sm">
                  <Input 
                    value={editableFields[field.field_name] || ''}
                    onChange={(e) => handleInputChange(field.field_name, e.target.value)}
                    disabled={invoice.status === 'validated'}
                  />
                </div>
                
                <div className="ml-auto">
                  {field.confidence !== null && <ConfidenceIndicator value={field.confidence} />}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center p-4 text-gray-500">
              <div className="mb-2">
                <AlertCircle className="h-8 w-8 mx-auto text-amber-500" />
              </div>
              <p className="font-medium">Aucune donnée extraite</p>
              <p className="text-sm mt-1">Cliquez sur "Analyser avec IA" pour extraire les données de cette facture</p>
            </div>
          )}
          
          {/* Statut de validation */}
          <div className={`flex items-start gap-2 p-2 rounded-md text-sm ${
            invoice.status === 'validated' 
              ? 'bg-green-50 text-green-700' 
              : fields.length > 0 ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'
          }`}>
            {invoice.status === 'validated' ? (
              <>
                <Check className="h-4 w-4 mt-0.5" />
                <span>Les données ont été validées et sont prêtes pour l'export vers Sage.</span>
              </>
            ) : fields.length > 0 ? (
              <>
                <AlertCircle className="h-4 w-4 mt-0.5" />
                <span>Vérifiez les données extraites avant de les valider pour l'intégration dans Sage.</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4 mt-0.5" />
                <span>Aucune donnée extraite. Lancez l'analyse pour extraire les données du document.</span>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExtractedDataViewer;
