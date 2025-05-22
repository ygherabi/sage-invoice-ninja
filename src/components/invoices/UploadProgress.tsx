
import { Progress } from "@/components/ui/progress";

interface UploadProgressProps {
  progress: number;
  step: string;
}

const UploadProgress = ({ progress, step }: UploadProgressProps) => {
  return (
    <div className="space-y-3">
      <div className="flex justify-between text-xs text-gray-500">
        <span>{step}</span>
        <span>{progress}%</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
};

export default UploadProgress;
