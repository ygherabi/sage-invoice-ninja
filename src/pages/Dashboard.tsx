
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import InvoiceList from '@/components/invoices/InvoiceList';
import { Upload, FileText, Settings, ChevronRight } from 'lucide-react';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('invoices');

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
                <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
                <p className="text-gray-500">Gérez vos factures et documents</p>
              </div>
              <Button className="bg-invoice-blue hover:bg-invoice-blue-dark" asChild>
                <Link to="/upload">
                  <Upload className="mr-2 h-4 w-4" />
                  Téléverser une facture
                </Link>
              </Button>
            </div>
            
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link to="/upload">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Téléverser des factures</h3>
                      <p className="text-sm text-gray-500 mt-1">Ajoutez de nouveaux documents</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-full text-blue-500">
                      <Upload size={20} />
                    </div>
                  </div>
                </div>
              </Link>
              
              <Link to="/invoices">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Gérer vos factures</h3>
                      <p className="text-sm text-gray-500 mt-1">Consultez vos documents traités</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-full text-green-500">
                      <FileText size={20} />
                    </div>
                  </div>
                </div>
              </Link>
              
              <Link to="/profile">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Paramètres</h3>
                      <p className="text-sm text-gray-500 mt-1">Configurez votre profil</p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-full text-purple-500">
                      <Settings size={20} />
                    </div>
                  </div>
                </div>
              </Link>
            </div>
            
            {/* Main Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList>
                <TabsTrigger value="invoices">Factures récentes</TabsTrigger>
                <TabsTrigger value="stats">Statistiques</TabsTrigger>
              </TabsList>
              
              <TabsContent value="invoices" className="space-y-4">
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Factures récentes</h2>
                    <Button variant="ghost" asChild>
                      <Link to="/invoices" className="flex items-center text-sm">
                        Voir toutes <ChevronRight className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                  <InvoiceList />
                </div>
              </TabsContent>
              
              <TabsContent value="stats" className="space-y-4">
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <h2 className="text-xl font-semibold mb-4">Statistiques</h2>
                  <p className="text-gray-500">
                    Les statistiques sur vos factures et extractions seront bientôt disponibles.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
