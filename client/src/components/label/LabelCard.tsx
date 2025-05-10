import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Eye, Trash } from "lucide-react";

interface LabelCardProps {
  label: {
    id: number;
    name: string;
    imageData: string;
  };
  onPreview: () => void;
  onDelete: () => void;
}

export default function LabelCard({ label, onPreview, onDelete }: LabelCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="h-40 bg-gray-100 flex items-center justify-center p-2">
        <img
          src={label.imageData}
          alt={label.name}
          className="h-full object-contain"
        />
      </div>
      <CardContent className="p-3">
        <h4 className="font-medium text-sm">{label.name}</h4>
      </CardContent>
      <CardFooter className="p-2 pt-0 flex justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs text-primary hover:text-primary-dark font-medium"
          onClick={onPreview}
        >
          <Eye size={14} className="mr-1" /> Önizle
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs text-error hover:text-red-700 font-medium"
          onClick={onDelete}
        >
          <Trash size={14} className="mr-1" /> Sil
        </Button>
      </CardFooter>
    </Card>
  );
}
