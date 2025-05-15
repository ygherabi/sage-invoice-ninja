
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createInvoice, uploadInvoiceFile } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { UploadCloud, Loader2 } from 'lucide-react';

const InvoiceUpload = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Auto-generate title from filename if empty
      if (!title) {
        setTitle(selectedFile.name.split('.')[0]);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez sélectionner un fichier.",
      });
      return;
    }
    
    if (!user) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Vous devez être connecté pour téléverser une facture.",
      });
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + 5;
          return newProgress >= 90 ? 90 : newProgress;
        });
      }, 300);
      
      // Create invoice record in database
      const { data: invoice, error: invoiceError } = await createInvoice({
        user_id: user.id,
        title: title || file.name,
        status: 'pending',
        file_type: file.type,
      });
      
      if (invoiceError) {
        clearInterval(progressInterval);
        throw new Error(invoiceError.message);
      }
      
      // Upload file to storage
      const filePath = `${user.id}/${invoice.id}/${file.name}`;
      const { error: uploadError } = await uploadInvoiceFile(file, filePath);
      
      if (uploadError) {
        clearInterval(progressInterval);
        throw new Error(uploadError.message);
      }
      
      // Update invoice with file path
      await createInvoice({
        id: invoice.id,
        file_path: filePath,
      });
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      toast({
        title: "Téléversement réussi",
        description: "Votre facture a été téléversée avec succès et est en cours d'analyse.",
      });
      
      // Redirect to invoice details after short delay
      setTimeout(() => {
        navigate(`/invoices/${invoice.id}`);
      }, 1500);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Erreur de téléversement",
        description: err.message || "Une erreur s'est produite lors du téléversement.",
      });
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Titre de la facture</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Facture électricité juin 2025"
              disabled={isUploading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="file">Fichier de facture</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center">
              {file ? (
                <div className="space-y-2 w-full">
                  <div className="flex items-center justify-center mb-4">
                    <div className="h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-500">
                      <UploadCloud size={28} />
                    </div>
                  </div>
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setFile(null)} 
                    className="mt-2"
                    disabled={isUploading}
                  >
                    Changer de fichier
                  </Button>
                </div>
              ) : (
                <label className="w-full cursor-pointer">
                  <div className="flex flex-col items-center justify-center py-4">
                    <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-4">
                      <UploadCloud size={28} />
                    </div>
                    <p className="text-sm font-medium">Cliquez pour téléverser</p>
                    <p className="text-xs text-gray-500 mt-1">ou déposez votre fichier ici</p>
                    <p className="text-xs text-gray-500 mt-2">PDF, PNG, JPEG acceptés</p>
                  </div>
                  <Input
                    id="file"
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".pdf,.png,.jpg,.jpeg"
                    disabled={isUploading}
                  />
                </label>
              )}
            </div>
          </div>
          
          {isUploading && (
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
              <p className="text-xs text-gray-500 mt-2 text-center">
                {uploadProgress === 100 ? 'Terminé !' : `Téléversement en cours... ${uploadProgress}%`}
              </p>
            </div>
          )}
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={!file || isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Téléversement en cours...
              </>
            ) : (
              'Téléverser la facture'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default InvoiceUpload;
