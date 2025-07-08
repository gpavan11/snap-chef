
import { ChefHat, Bookmark } from 'lucide-react';

export const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ChefHat className="h-8 w-8 text-orange-500" />
            <h1 className="text-xl font-bold text-gray-800">
              Snap Chef
            </h1>
          </div>
          
          <nav className="flex items-center space-x-6">
            <button className="flex items-center space-x-2 text-gray-600 hover:text-orange-500 transition-colors">
              <Bookmark className="h-5 w-5" />
              <span className="hidden sm:inline">Saved Recipes</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
