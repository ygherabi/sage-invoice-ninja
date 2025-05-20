
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Eye, RefreshCw, X, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { type Invoice, type InvoiceField } from '@/types';
import { getInvoiceFileUrl, checkFileExists } from '@/lib/supabase';
import ExtractedDataViewer from './ExtractedDataViewer';
import { extractDataFromDocument, saveExtractedData } from '@/lib/ai-extraction';
import { Progress } from '@/components/ui/progress';

type DocumentAnalysisViewerProps = {
  invoice: Invoice;
  fields: InvoiceField[];
  onAnalysisComplete?: () => void;
};

const DocumentAnalysisViewer = ({ 
  invoice, 
  fields, 
  onAnalysisComplete 
}: DocumentAnalysisViewerProps) => {
  const { toast } = useToast();
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeProgress, setAnalyzeProgress] = useState(0);
  const [showFullScreen, setShowFullScreen] = useState(false);
  const [fileExists, setFileExists] = useState<boolean | null>(null);

  useEffect(() => {
    if (invoice.file_path) {
      checkDocumentExists();
      loadDocumentUrl();
    }
  }, [invoice.file_path]);

  const checkDocumentExists = async () => {
    if (invoice.file_path) {
      try {
        const exists = await checkFileExists(invoice.file_path);
        setFileExists(exists);
        
        if (!exists) {
          toast({
            variant: 'warning',
            title: 'Fichier non trouvé',
            description: 'Le fichier associé à cette facture n\'est pas disponible.'
          });
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du fichier:', error);
        setFileExists(false);
      }
    }
  };

  const loadDocumentUrl = async () => {
    if (invoice.file_path) {
      try {
        console.log("Loading document URL for:", invoice.file_path);
        const url = await getInvoiceFileUrl(invoice.file_path);
        
        if (!url) {
          toast({
            variant: 'destructive',
            title: 'Erreur',
            description: 'Impossible de récupérer l\'URL du document'
          });
          return;
        }
        
        console.log("Document URL loaded:", url);
        setDocumentUrl(url);
      } catch (error) {
        console.error('Error loading document URL:', error);
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: 'Impossible de charger l\'aperçu du document'
        });
      }
    }
  };

  const handleAnalyzeDocument = async () => {
    if (!documentUrl) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Aucun document à analyser'
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalyzeProgress(0);
    
    try {
      console.log("Starting document analysis for invoice:", invoice.id);
      
      // Simuler le début du processus
      setAnalyzeProgress(10);
      
      // Extraire les données avec l'IA
      toast({
        title: 'Analyse en cours',
        description: 'Extraction des données du document...'
      });
      
      // Simuler l'avancement
      const progressInterval = setInterval(() => {
        setAnalyzeProgress(prev => {
          const newProgress = prev + Math.floor(Math.random() * 5) + 5;
          return newProgress >= 90 ? 90 : newProgress;
        });
      }, 500);
      
      const extractionResult = await extractDataFromDocument(documentUrl);
      console.log("Extraction result:", extractionResult);
      
      setAnalyzeProgress(95);
      
      // Sauvegarder les données extraites
      const saveResult = await saveExtractedData(invoice, extractionResult);
      console.log("Save result:", saveResult);
      
      clearInterval(progressInterval);
      setAnalyzeProgress(100);
      
      if (saveResult.success) {
        toast({
          title: 'Analyse réussie',
          description: 'Les données ont été extraites avec succès du document'
        });
        if (onAnalysisComplete) onAnalysisComplete();
      } else {
        throw new Error('Erreur lors de la sauvegarde des données');
      }
    } catch (error) {
      console.error('Error analyzing document:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur d\'analyse',
        description: 'Une erreur est survenue lors de l\'analyse du document'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Document Preview Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Aperçu du Document</CardTitle>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open(documentUrl || '#', '_blank')}
              disabled={!documentUrl || fileExists === false}
            >
              <Download className="h-4 w-4 mr-1" /> Télécharger
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowFullScreen(true)}
              disabled={!documentUrl || fileExists === false}
            >
              <Eye className="h-4 w-4 mr-1" /> Plein écran
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center bg-gray-100 p-0 min-h-[400px]">
          {fileExists === false ? (
            <div className="flex flex-col items-center justify-center p-6 text-amber-700 bg-amber-50 h-full w-full">
              <AlertCircle className="h-12 w-12 mb-4 text-amber-500" />
              <p className="font-medium">Fichier non disponible</p>
              <p className="text-sm text-amber-600 mt-2">Le fichier associé à cette facture n'est pas accessible.</p>
            </div>
          ) : documentUrl ? (
            <div className="w-full h-full min-h-[400px] flex items-center justify-center">
              {invoice.file_type?.includes('pdf') ? (
                <iframe 
                  src={documentUrl}
                  className="w-full h-full min-h-[400px]"
                  title="PDF Preview"
                />
              ) : (
                <img
                  src={documentUrl}
                  alt="Document preview"
                  className="max-w-full max-h-[400px] object-contain"
                />
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-gray-500">
              <img 
                src="https://cdn-icons-png.freepik.com/512/3143/3143460.png" 
                alt="Invoice placeholder" 
                className="w-32 h-32 mb-4 opacity-50"
              />
              <p>Aperçu non disponible</p>
              <p className="text-sm">{invoice.file_path || 'Aucun fichier'}</p>
            </div>
          )}
        </CardContent>
        
        {/* Analyze button footer */}
        <div className="px-6 py-4 border-t">
          {isAnalyzing && (
            <div className="mb-4 space-y-2">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Analyse en cours...</span>
                <span>{analyzeProgress}%</span>
              </div>
              <Progress value={analyzeProgress} className="h-2" />
            </div>
          )}
          
          <Button 
            onClick={handleAnalyzeDocument}
            disabled={isAnalyzing || !documentUrl || invoice.status === 'validated' || fileExists === false}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-b-transparent border-white"></div>
                Analyse en cours...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                {invoice.status === 'pending' 
                  ? 'Analyser avec IA' 
                  : 'Relancer l\'analyse'}
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Extracted Data Card */}
      <ExtractedDataViewer 
        invoice={invoice} 
        fields={fields} 
        onValidationComplete={onAnalysisComplete}
      />
      
      {/* Full Screen Preview Modal */}
      {showFullScreen && documentUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-medium">
                {invoice.title || 'Aperçu du document'}
              </h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowFullScreen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-auto bg-gray-100">
              {invoice.file_type?.includes('pdf') ? (
                <iframe 
                  src={documentUrl}
                  className="w-full h-full"
                  title="PDF Preview" 
                />
              ) : (
                <div className="flex items-center justify-center h-full p-4">
                  <img 
                    src={documentUrl}
                    alt="Document preview"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentAnalysisViewer;
