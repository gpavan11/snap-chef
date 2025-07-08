
import { RecipeCard } from './RecipeCard';
import { Recipe } from '@/pages/Index';

interface RecipeGridProps {
  recipes: Recipe[];
  savedRecipes: string[];
  onSaveRecipe: (recipeId: string) => void;
}

export const RecipeGrid = ({ recipes, savedRecipes, onSaveRecipe }: RecipeGridProps) => {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Recommended Recipes
        </h2>
        <p className="text-gray-600">
          Based on your uploaded dish, here are some recipes you might love
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {recipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            isSaved={savedRecipes.includes(recipe.id)}
            onSave={() => onSaveRecipe(recipe.id)}
          />
        ))}
      </div>
    </div>
  );
};
