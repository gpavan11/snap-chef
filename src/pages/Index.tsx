
import { useState } from 'react';
import { ImageUpload } from '@/components/ImageUpload';
import { FoodDetectionResult } from '@/components/FoodDetectionResult';
import { RecipeGrid } from '@/components/RecipeGrid';
import { Header } from '@/components/Header';

export interface DetectedFood {
  name: string;
  confidence: number;
  category: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  image: string;
  cookTime: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  ingredients: string[];
  instructions: string[];
  nutrition?: {
    calories: number;
    protein: string;
    carbs: string;
    fat: string;
  };
}

const Index = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [detectedFood, setDetectedFood] = useState<DetectedFood | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [savedRecipes, setSavedRecipes] = useState<string[]>([]);

  const handleImageUpload = async (imageUrl: string) => {
    setUploadedImage(imageUrl);
    setIsAnalyzing(true);
    
    // Mock AI detection with realistic delay
    setTimeout(() => {
      const mockDetection: DetectedFood = {
        name: "Pasta Carbonara",
        confidence: 0.89,
        category: "Italian Cuisine"
      };
      
      setDetectedFood(mockDetection);
      setRecipes(getMockRecipes(mockDetection.name));
      setIsAnalyzing(false);
    }, 2500);
  };

  const handleSaveRecipe = (recipeId: string) => {
    setSavedRecipes(prev => 
      prev.includes(recipeId) 
        ? prev.filter(id => id !== recipeId)
        : [...prev, recipeId]
    );
  };

  const resetAnalysis = () => {
    setUploadedImage(null);
    setDetectedFood(null);
    setRecipes([]);
    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {!uploadedImage ? (
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-800 mb-4">
              Culinary Snapshot Chef
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Upload a photo of any dish and discover amazing recipes you can make with those ingredients
            </p>
            <ImageUpload onImageUpload={handleImageUpload} />
          </div>
        ) : (
          <div className="space-y-8">
            <FoodDetectionResult 
              image={uploadedImage}
              detectedFood={detectedFood}
              isAnalyzing={isAnalyzing}
              onReset={resetAnalysis}
            />
            
            {recipes.length > 0 && (
              <RecipeGrid 
                recipes={recipes} 
                savedRecipes={savedRecipes}
                onSaveRecipe={handleSaveRecipe}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
};

// Mock recipe data
const getMockRecipes = (foodName: string): Recipe[] => {
  const baseRecipes: Recipe[] = [
    {
      id: '1',
      title: 'Classic Spaghetti Carbonara',
      description: 'Authentic Italian pasta dish with eggs, cheese, and pancetta',
      image: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop',
      cookTime: '20 mins',
      difficulty: 'Medium',
      ingredients: [
        '400g spaghetti',
        '200g pancetta or guanciale',
        '4 large eggs',
        '100g Pecorino Romano cheese',
        'Black pepper',
        'Salt'
      ],
      instructions: [
        'Cook spaghetti in salted boiling water until al dente',
        'Fry pancetta until crispy',
        'Whisk eggs with grated cheese and black pepper',
        'Combine hot pasta with pancetta',
        'Add egg mixture off heat, tossing quickly',
        'Serve immediately with extra cheese'
      ],
      nutrition: {
        calories: 580,
        protein: '25g',
        carbs: '65g',
        fat: '22g'
      }
    },
    {
      id: '2',
      title: 'Creamy Mushroom Pasta',
      description: 'Rich and creamy pasta with mixed mushrooms and herbs',
      image: 'https://images.unsplash.com/photo-1563379091339-03246963d059?w=400&h=300&fit=crop',
      cookTime: '25 mins',
      difficulty: 'Easy',
      ingredients: [
        '350g penne pasta',
        '300g mixed mushrooms',
        '200ml heavy cream',
        '2 cloves garlic',
        'Fresh thyme',
        'Parmesan cheese'
      ],
      instructions: [
        'Cook pasta according to package directions',
        'Sauté mushrooms until golden',
        'Add garlic and thyme',
        'Pour in cream and simmer',
        'Toss with pasta and cheese',
        'Season and serve hot'
      ],
      nutrition: {
        calories: 520,
        protein: '18g',
        carbs: '58g',
        fat: '24g'
      }
    },
    {
      id: '3',
      title: 'Lemon Garlic Linguine',
      description: 'Light and fresh pasta with lemon, garlic, and herbs',
      image: 'https://images.unsplash.com/photo-1572441713132-51c75654db73?w=400&h=300&fit=crop',
      cookTime: '15 mins',
      difficulty: 'Easy',
      ingredients: [
        '400g linguine',
        '4 cloves garlic',
        '2 lemons (zested and juiced)',
        'Extra virgin olive oil',
        'Fresh parsley',
        'Red pepper flakes'
      ],
      instructions: [
        'Cook linguine until al dente',
        'Heat olive oil and sauté garlic',
        'Add lemon zest and juice',
        'Toss with pasta and parsley',
        'Add pasta water if needed',
        'Finish with pepper flakes'
      ],
      nutrition: {
        calories: 420,
        protein: '12g',
        carbs: '72g',
        fat: '8g'
      }
    },
    {
      id: '4',
      title: 'Spicy Arrabbiata',
      description: 'Fiery tomato sauce with garlic, chili, and fresh basil',
      image: 'https://images.unsplash.com/photo-1551892589-865f69869476?w=400&h=300&fit=crop',
      cookTime: '30 mins',
      difficulty: 'Medium',
      ingredients: [
        '400g penne pasta',
        '400g canned tomatoes',
        '4 cloves garlic',
        '2-3 dried chilies',
        'Fresh basil',
        'Olive oil'
      ],
      instructions: [
        'Heat oil and fry chilies',
        'Add garlic until fragrant',
        'Add tomatoes and simmer',
        'Cook pasta until al dente',
        'Combine pasta with sauce',
        'Garnish with fresh basil'
      ],
      nutrition: {
        calories: 380,
        protein: '14g',
        carbs: '68g',
        fat: '6g'
      }
    }
  ];

  return baseRecipes;
};

export default Index;
