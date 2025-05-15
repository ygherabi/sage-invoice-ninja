
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Download, Check, AlertCircle } from 'lucide-react';

const mockExtractedData = {
  fournisseur: { value: 'EDF', confidence: 98 },
  numero: { value: 'F-230495', confidence: 95 },
  date: { value: '15/04/2023', confidence: 97 },
  montantHT: { value: '245,00 €', confidence: 96 },
  tva: { value: '49,00 €', confidence: 96 },
  montantTTC: { value: '294,00 €', confidence: 99 },
  ref: { value: 'REF-CLIENT-12345', confidence: 80 },
  echeance: { value: '30/05/2023', confidence: 75 }
};

const ConfidenceIndicator = ({ value }: { value: number }) => {
  const getColor = () => {
    if (value >= 95) return 'bg-green-500';
    if (value >= 80) return 'bg-amber-500';
    return 'bg-red-500';
  };
  
  return (
    <div className="flex items-center gap-1">
      <div className={`h-2 w-2 rounded-full ${getColor()}`} />
      <span className="text-xs text-gray-500">{value}%</span>
    </div>
  );
};

const DocumentPreview = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Left side - Document Preview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Aperçu du Document</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" /> Télécharger
            </Button>
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-1" /> Plein écran
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-center bg-gray-100 p-0 min-h-[400px]">
          {/* This would be a real preview in a production app */}
          <div className="flex flex-col items-center justify-center p-6 text-gray-500">
            <img 
              src="https://cdn-icons-png.freepik.com/512/3143/3143460.png" 
              alt="Invoice placeholder" 
              className="w-32 h-32 mb-4 opacity-50"
            />
            <p>Aperçu de la facture</p>
            <p className="text-sm">EDF_Facture_2023-04.pdf</p>
          </div>
        </CardContent>
      </Card>

      {/* Right side - Extracted Data */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Données Extraites</CardTitle>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="border-green-500 text-green-600 hover:bg-green-50"
            >
              <Check className="h-4 w-4 mr-1" /> Valider
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(mockExtractedData).map(([key, data]) => (
              <div key={key} className="grid grid-cols-3 items-center gap-2 border-b pb-2">
                <div className="text-sm font-medium capitalize text-gray-700">
                  {key === 'montantHT' ? 'Montant HT' : 
                   key === 'montantTTC' ? 'Montant TTC' : 
                   key === 'echeance' ? 'Échéance' : 
                   key === 'fournisseur' ? 'Fournisseur' : 
                   key === 'numero' ? 'Numéro' : 
                   key === 'date' ? 'Date' : 
                   key === 'tva' ? 'TVA' : 
                   key === 'ref' ? 'Référence' : key}
                </div>
                <div className="text-sm font-mono">{data.value}</div>
                <div className="ml-auto">
                  <ConfidenceIndicator value={data.confidence} />
                </div>
              </div>
            ))}
            
            {/* Note about validation */}
            <div className="flex items-start gap-2 p-2 bg-blue-50 rounded-md text-sm text-blue-700">
              <AlertCircle className="h-4 w-4 mt-0.5" />
              <span>Vérifiez les données extraites avant de les valider pour l'intégration dans Sage.</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentPreview;
