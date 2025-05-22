
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useInvoiceUpload } from '@/hooks/useInvoiceUpload';
import FileDropzone from './FileDropzone';
import UploadProgress from './UploadProgress';

const InvoiceUpload = () => {
  const {
    title,
    setTitle,
    file,
    isUploading,
    uploadProgress,
    processingStep,
    handleFileChange,
    handleClearFile,
    handleUpload
  } = useInvoiceUpload();

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="pt-6">
        <form onSubmit={handleUpload} className="space-y-6">
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
            <FileDropzone
              file={file}
              isUploading={isUploading}
              onFileChange={handleFileChange}
              onClearFile={handleClearFile}
            />
          </div>
          
          {isUploading && (
            <UploadProgress progress={uploadProgress} step={processingStep} />
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
