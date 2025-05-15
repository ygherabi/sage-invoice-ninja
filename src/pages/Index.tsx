
import React from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import StatsCard from '@/components/dashboard/StatsCard';
import RecentActivity from '@/components/dashboard/RecentActivity';
import AccuracyChart from '@/components/dashboard/AccuracyChart';
import ProcessingTimeline from '@/components/dashboard/ProcessingTimeline';
import UploadSection from '@/components/dashboard/UploadSection';
import DocumentPreview from '@/components/DocumentPreview';
import { FileText, CheckCircle, Clock, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <div className="flex flex-1">
        <Sidebar />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
              <Button className="bg-invoice-blue hover:bg-invoice-blue-dark">
                Téléverser des Factures
              </Button>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard 
                title="Factures traitées" 
                value="124" 
                icon={<FileText className="h-4 w-4" />}
                trend={{ value: "12%", positive: true }}
              />
              <StatsCard 
                title="Taux de réussite" 
                value="94%" 
                icon={<CheckCircle className="h-4 w-4" />}
                trend={{ value: "3%", positive: true }}
              />
              <StatsCard 
                title="Temps moyen" 
                value="12s" 
                icon={<Clock className="h-4 w-4" />}
                trend={{ value: "5%", positive: false }}
              />
              <StatsCard 
                title="Économies estimées" 
                value="23h" 
                icon={<BarChart3 className="h-4 w-4" />}
                trend={{ value: "18%", positive: true }}
              />
            </div>
            
            {/* Main Content Tabs */}
            <Tabs defaultValue="dashboard" className="space-y-4">
              <TabsList>
                <TabsTrigger value="dashboard">Tableau de bord</TabsTrigger>
                <TabsTrigger value="upload">Téléversement</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
              </TabsList>
              
              <TabsContent value="dashboard" className="space-y-4">
                {/* Dashboard Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <RecentActivity />
                  <div className="grid grid-rows-2 gap-4">
                    <AccuracyChart />
                    <ProcessingTimeline />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="upload" className="space-y-4">
                {/* Upload Content */}
                <UploadSection />
              </TabsContent>
              
              <TabsContent value="documents" className="space-y-4">
                {/* Documents Preview */}
                <DocumentPreview />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
