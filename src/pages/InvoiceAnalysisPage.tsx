
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, FileText, RefreshCw, Settings } from 'lucide-react';
import DocumentAnalysisViewer from '@/components/extraction/DocumentAnalysisViewer';
import ExtractionSchemaEditor from '@/components/extraction/ExtractionSchemaEditor';
import { getInvoice, getInvoiceFields } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Invoice, InvoiceField } from '@/types';

const InvoiceAnalysisPage = () => {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('analysis');
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [fields, setFields] = useState<InvoiceField[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (invoiceId) {
      loadInvoiceData(invoiceId);
    }
  }, [invoiceId]);

  const loadInvoiceData = async (id: string) => {
    setIsLoading(true);
    try {
      const invoiceData = await getInvoice(id);
      if (!invoiceData) {
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: 'Facture non trouvée'
        });
        return;
      }
      
      setInvoice(invoiceData);
      
      const fieldsData = await getInvoiceFields(id);
      setFields(fieldsData || []);
    } catch (error) {
      console.error('Error loading invoice data:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de charger les données de la facture'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshData = () => {
    if (invoiceId) {
      loadInvoiceData(invoiceId);
    }
  };

  // Afficher un message de chargement si les données ne sont pas encore disponibles
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-center items-center h-96">
                <div className="flex flex-col items-center">
                  <div className="animate-spin h-8 w-8 border-4 border-invoice-blue border-t-transparent rounded-full mb-4"></div>
                  <p className="text-gray-500">Chargement des données...</p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }
  
  if (!invoice) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col items-center justify-center h-96 text-center">
                <FileText className="h-16 w-16 text-gray-300 mb-4" />
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Facture non trouvée</h2>
                <p className="text-gray-500 mb-4">
                  La facture que vous recherchez n'existe pas ou a été supprimée.
                </p>
                <Button asChild>
                  <Link to="/invoices">Retour à la liste des factures</Link>
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <div className="flex flex-1">
        <Sidebar />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Page Header */}
            <div>
              <Link to="/invoices" className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-4">
                <ArrowLeft className="h-4 w-4 mr-1" /> Retour aux factures
              </Link>
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {invoice.title || 'Facture sans titre'}
                  </h1>
                  <p className="text-gray-500">
                    {invoice.supplier ? `Fournisseur: ${invoice.supplier}` : 'Analyse de document'}
                    {invoice.invoice_number && ` • N° ${invoice.invoice_number}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    onClick={handleRefreshData}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Actualiser
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="analysis">
                  <FileText className="h-4 w-4 mr-2" />
                  Analyse du document
                </TabsTrigger>
                <TabsTrigger value="schema">
                  <Settings className="h-4 w-4 mr-2" />
                  Schéma d'extraction
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="analysis" className="space-y-6 mt-6">
                <DocumentAnalysisViewer 
                  invoice={invoice} 
                  fields={fields} 
                  onAnalysisComplete={handleRefreshData}
                />
              </TabsContent>
              
              <TabsContent value="schema" className="space-y-6 mt-6">
                <ExtractionSchemaEditor />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default InvoiceAnalysisPage;
