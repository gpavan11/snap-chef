
import { useState, useRef } from 'react';
import { Upload, Camera, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageUploadProps {
  onImageUpload: (imageUrl: string) => void;
}

export const ImageUpload = ({ onImageUpload }: ImageUploadProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setPreview(imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleAnalyze = () => {
    if (preview) {
      onImageUpload(preview);
    }
  };

  const clearPreview = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (preview) {
    return (
      <div className="max-w-md mx-auto">
        <div className="relative group">
          <img 
            src={preview} 
            alt="Food preview" 
            className="w-full h-64 object-cover rounded-lg shadow-lg"
          />
          <button
            onClick={clearPreview}
            className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="h-4 w-4 text-gray-600" />
          </button>
        </div>
        
        <div className="mt-4 space-y-3">
          <Button 
            onClick={handleAnalyze} 
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 text-lg font-semibold"
          >
            <Camera className="mr-2 h-5 w-5" />
            Analyze This Dish
          </Button>
          
          <Button 
            variant="outline" 
            onClick={clearPreview}
            className="w-full"
          >
            Choose Different Photo
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200
          ${isDragOver 
            ? 'border-orange-400 bg-orange-50' 
            : 'border-gray-300 hover:border-orange-300 hover:bg-orange-25'
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Upload Your Food Photo
        </h3>
        
        <p className="text-gray-500 mb-6">
          Drag and drop your image here, or click to browse
        </p>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
        />
        
        <Button
          onClick={() => fileInputRef.current?.click()}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2"
        >
          <Camera className="mr-2 h-4 w-4" />
          Choose Photo
        </Button>
        
        <p className="text-xs text-gray-400 mt-4">
          Supports JPG, PNG, and WebP formats
        </p>
      </div>
    </div>
  );
};
