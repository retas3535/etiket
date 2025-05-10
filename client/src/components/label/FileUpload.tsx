import React, { useState, useRef } from "react";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onFileChange: (file: File | null) => void;
  acceptedFileTypes: string;
  maxSizeMB: number;
}

export default function FileUpload({ 
  onFileChange, 
  acceptedFileTypes = ".jpg,.jpeg,.pdf", 
  maxSizeMB = 10 
}: FileUploadProps) {
  const [isDragActive, setIsDragActive] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const maxFileSize = maxSizeMB * 1024 * 1024; // Convert to bytes
  
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      onFileChange(null);
      setFileName(null);
      return;
    }
    
    const file = files[0];
    validateAndProcessFile(file);
  };
  
  const validateAndProcessFile = (file: File) => {
    console.log("Dosya doğrulama başladı:", file.name, file.type, file.size);
    
    // Check file type
    const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    const isAcceptedType = acceptedFileTypes
      .split(',')
      .some(type => type === fileExtension || type === file.type);
    
    console.log("Dosya uzantısı:", fileExtension, "Kabul ediliyor mu:", isAcceptedType);
    
    if (!isAcceptedType) {
      toast({
        title: "Dosya türü desteklenmiyor",
        description: `Yalnızca ${acceptedFileTypes} türleri desteklenmektedir.`,
        variant: "destructive",
      });
      return;
    }
    
    // Check file size
    if (file.size > maxFileSize) {
      toast({
        title: "Dosya boyutu çok büyük",
        description: `Dosya boyutu ${maxSizeMB}MB'den küçük olmalıdır.`,
        variant: "destructive",
      });
      return;
    }
    
    // All checks passed
    console.log("Dosya doğrulama başarılı, callback çağrılıyor");
    onFileChange(file);
    setFileName(file.name);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
    
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;
    
    validateAndProcessFile(files[0]);
  };
  
  const handleClick = () => {
    fileInputRef.current?.click();
  };
  
  return (
    <div
      className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 ${
        isDragActive ? "border-primary bg-blue-50" : "border-dashed"
      } rounded-md cursor-pointer`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <div className="space-y-1 text-center">
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <div className="flex text-sm text-gray-600">
          <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-dark focus-within:outline-none">
            <span>Dosya Yükle</span>
            <input
              ref={fileInputRef}
              type="file"
              className="sr-only"
              accept={acceptedFileTypes}
              onChange={handleFileInputChange}
            />
          </label>
          <p className="pl-1">veya sürükleyip bırakın</p>
        </div>
        {fileName ? (
          <p className="text-xs text-gray-500">{fileName}</p>
        ) : (
          <p className="text-xs text-gray-500">
            JPG veya PDF, max {maxSizeMB}MB
          </p>
        )}
      </div>
    </div>
  );
}
