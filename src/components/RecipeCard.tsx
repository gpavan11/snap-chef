
import { Clock, BookOpen, Heart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Recipe } from '@/pages/Index';

interface RecipeCardProps {
  recipe: Recipe;
  isSaved: boolean;
  onSave: () => void;
}

export const RecipeCard = ({ recipe, isSaved, onSave }: RecipeCardProps) => {
  const difficultyColors = {
    Easy: 'bg-green-100 text-green-800',
    Medium: 'bg-yellow-100 text-yellow-800',
    Hard: 'bg-red-100 text-red-800'
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 group">
      <div className="relative">
        <img 
          src={recipe.image} 
          alt={recipe.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
        />
        
        <button
          onClick={onSave}
          className={`
            absolute top-3 right-3 p-2 rounded-full shadow-md transition-colors
            ${isSaved 
              ? 'bg-red-500 text-white' 
              : 'bg-white text-gray-600 hover:bg-red-50 hover:text-red-500'
            }
          `}
        >
          <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
        </button>
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-bold text-lg text-gray-800 line-clamp-2 flex-1">
            {recipe.title}
          </h3>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {recipe.description}
        </p>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            <span>{recipe.cookTime}</span>
          </div>
          
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${difficultyColors[recipe.difficulty]}`}>
            {recipe.difficulty}
          </span>
        </div>
        
        {recipe.nutrition && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>{recipe.nutrition.calories} cal</span>
              <span>{recipe.nutrition.protein} protein</span>
              <span>{recipe.nutrition.carbs} carbs</span>
            </div>
          </div>
        )}
        
        <Button 
          variant="outline" 
          className="w-full hover:bg-orange-50 hover:border-orange-300"
        >
          <BookOpen className="h-4 w-4 mr-2" />
          View Recipe
        </Button>
      </div>
    </div>
  );
};
