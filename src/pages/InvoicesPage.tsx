
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import InvoiceList from '@/components/invoices/InvoiceList';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Upload } from 'lucide-react';

const InvoicesPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <div className="flex flex-1">
        <Sidebar />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Mes factures</h1>
                <p className="text-gray-500">Gérez et consultez toutes vos factures</p>
              </div>
              <Button className="bg-invoice-blue hover:bg-invoice-blue-dark" asChild>
                <Link to="/upload">
                  <Upload className="mr-2 h-4 w-4" />
                  Téléverser
                </Link>
              </Button>
            </div>
            
            {/* Filters and Search - Will be implemented later */}
            
            {/* Invoices List */}
            <div className="bg-white shadow-sm rounded-lg p-6">
              <InvoiceList />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default InvoicesPage;
