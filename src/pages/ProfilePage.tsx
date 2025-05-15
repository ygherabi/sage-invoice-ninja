
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import UserProfile from '@/components/auth/UserProfile';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ArrowLeft, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProfilePage = () => {
  const { signOut } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <div className="flex flex-1">
        <Sidebar />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Page Header */}
            <div>
              <Link to="/dashboard" className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-4">
                <ArrowLeft className="h-4 w-4 mr-1" /> Retour au tableau de bord
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Profil utilisateur</h1>
              <p className="text-gray-500">Gérez vos informations personnelles et préférences</p>
            </div>
            
            {/* User Profile */}
            <div className="my-8">
              <UserProfile />
            </div>
            
            {/* Logout Button */}
            <div className="flex justify-center">
              <Button variant="outline" onClick={signOut} className="text-red-500">
                <LogOut className="h-4 w-4 mr-2" />
                Se déconnecter
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProfilePage;
