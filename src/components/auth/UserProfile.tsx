
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { updateProfile } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';

const UserProfile = () => {
  const { profile, user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [company, setCompany] = useState(profile?.company || '');
  
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await updateProfile({
        full_name: fullName,
        company: company,
      });
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de mettre à jour le profil.",
        });
        return;
      }
      
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été mises à jour avec succès.",
      });
      
      setIsEditing(false);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur s'est produite lors de la mise à jour du profil.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!profile || !user) {
    return <div>Chargement du profil...</div>;
  }
  
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Profil utilisateur</CardTitle>
        <CardDescription>
          Gérez vos informations personnelles.
        </CardDescription>
      </CardHeader>
      
      {isEditing ? (
        <form onSubmit={handleSaveProfile}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={user.email} 
                disabled 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="full-name">Nom complet</Label>
              <Input 
                id="full-name" 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Entreprise</Label>
              <Input 
                id="company" 
                value={company} 
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </CardFooter>
        </form>
      ) : (
        <>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm">{user.email}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Nom complet</p>
              <p className="text-sm">{profile.full_name || '-'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Entreprise</p>
              <p className="text-sm">{profile.company || '-'}</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={() => setIsEditing(true)}>
              Modifier le profil
            </Button>
          </CardFooter>
        </>
      )}
    </Card>
  );
};

export default UserProfile;
