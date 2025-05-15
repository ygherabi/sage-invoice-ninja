
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import InvoiceUpload from '@/components/invoices/InvoiceUpload';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const InvoiceUploadPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <div className="flex flex-1">
        <Sidebar />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Page Header */}
            <div>
              <Link to="/dashboard" className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-4">
                <ArrowLeft className="h-4 w-4 mr-1" /> Retour au tableau de bord
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Téléverser une facture</h1>
              <p className="text-gray-500">Téléversez des factures pour extraction automatique des données</p>
            </div>
            
            {/* Upload Form */}
            <div className="my-8">
              <InvoiceUpload />
            </div>
            
            {/* Help Box */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-blue-800 text-sm">
              <h3 className="font-semibold mb-1">Formats acceptés</h3>
              <p>Vous pouvez téléverser des factures aux formats PDF, PNG ou JPEG.</p>
              <h3 className="font-semibold mt-3 mb-1">Comment ça marche ?</h3>
              <ol className="list-decimal list-inside space-y-1">
                <li>Téléversez votre facture</li>
                <li>Notre système analyse automatiquement le document</li>
                <li>Vérifiez et validez les données extraites</li>
                <li>Les données sont prêtes à être exportées ou intégrées</li>
              </ol>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default InvoiceUploadPage;
