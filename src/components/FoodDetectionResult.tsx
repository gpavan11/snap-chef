
import { Loader2, RefreshCw, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DetectedFood } from '@/pages/Index';

interface FoodDetectionResultProps {
  image: string;
  detectedFood: DetectedFood | null;
  isAnalyzing: boolean;
  onReset: () => void;
}

export const FoodDetectionResult = ({ 
  image, 
  detectedFood, 
  isAnalyzing, 
  onReset 
}: FoodDetectionResultProps) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/2">
            <img 
              src={image} 
              alt="Uploaded food" 
              className="w-full h-64 md:h-full object-cover"
            />
          </div>
          
          <div className="md:w-1/2 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Analysis Results
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={onReset}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                New Photo
              </Button>
            </div>

            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-12 w-12 text-orange-500 animate-spin mb-4" />
                <p className="text-lg font-semibold text-gray-700 mb-2">
                  Analyzing your dish...
                </p>
                <p className="text-gray-500 text-center">
                  Our AI is identifying the ingredients and dish type
                </p>
              </div>
            ) : detectedFood ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-semibold">Detection Complete!</span>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {detectedFood.name}
                  </h3>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {detectedFood.category}
                    </span>
                    
                    <span className="font-semibold">
                      {Math.round(detectedFood.confidence * 100)}% confidence
                    </span>
                  </div>
                </div>
                
                <p className="text-gray-600">
                  Great choice! We found {Math.floor(Math.random() * 3) + 3} delicious recipes 
                  similar to this dish. Scroll down to explore them!
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
