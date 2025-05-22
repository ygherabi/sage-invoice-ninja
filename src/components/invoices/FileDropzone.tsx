
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UploadCloud } from "lucide-react";

interface FileDropzoneProps {
  file: File | null;
  isUploading: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearFile: () => void;
}

const FileDropzone = ({ file, isUploading, onFileChange, onClearFile }: FileDropzoneProps) => {
  return (
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
            onClick={onClearFile} 
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
            onChange={onFileChange}
            accept=".pdf,.png,.jpg,.jpeg"
            disabled={isUploading}
          />
        </label>
      )}
    </div>
  );
};

export default FileDropzone;
