
import { useState } from 'react';
import { ImageUpload } from '@/components/ImageUpload';
import { FoodDetectionResult } from '@/components/FoodDetectionResult';
import { RecipeGrid } from '@/components/RecipeGrid';
import { Header } from '@/components/Header';
import { AIInsights } from '@/components/AIInsights';
import { AIServices } from '@/lib/aiServices';
import { toast } from 'sonner';

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
  const [aiError, setAiError] = useState<string | null>(null);

  const handleImageUpload = async (imageUrl: string) => {
    setUploadedImage(imageUrl);
    setIsAnalyzing(true);
    setAiError(null);
    
    try {
      // Use AI services for food detection
      toast.info('🔍 Analyzing your food image with AI...');
      const detection = await AIServices.FoodDetection.detectFood(imageUrl);
      setDetectedFood(detection);
      
      // Generate AI-powered recipes
      toast.info('🧑‍🍳 Generating personalized recipes...');
      const generatedRecipes = await AIServices.RecipeGeneration.generateRecipes(detection, 4);
      
      // Enhance recipes with nutritional analysis
      const recipesWithNutrition = await Promise.all(
        generatedRecipes.map(async (recipe) => {
          try {
            const nutrition = await AIServices.NutritionalAnalysis.analyzeIngredients(recipe.ingredients);
            return { ...recipe, nutrition };
          } catch (error) {
            console.warn('Nutrition analysis failed for recipe:', recipe.title);
            return recipe;
          }
        })
      );
      
      setRecipes(recipesWithNutrition);
      toast.success('✨ AI analysis complete! Found delicious recipes for you.');
      
    } catch (error) {
      console.error('AI analysis failed:', error);
      setAiError('AI analysis failed. Using fallback detection.');
      toast.error('AI analysis failed, using fallback detection');
      
      // Fallback to mock detection
      const mockDetection = analyzeImageMock(imageUrl);
      setDetectedFood(mockDetection);
      setRecipes(getRelevantRecipesMock(mockDetection.name, mockDetection.category));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveRecipe = (recipeId: string) => {
    setSavedRecipes(prev => 
      prev.includes(recipeId) 
        ? prev.filter(id => id !== recipeId)
        : [...prev, recipeId]
    );
    
    const recipe = recipes.find(r => r.id === recipeId);
    if (recipe) {
      const action = savedRecipes.includes(recipeId) ? 'removed from' : 'added to';
      toast.success(`Recipe ${action} your saved collection!`);
    }
  };

  const resetAnalysis = () => {
    setUploadedImage(null);
    setDetectedFood(null);
    setRecipes([]);
    setIsAnalyzing(false);
    setAiError(null);
  };

  const searchSimilarRecipes = async (query: string) => {
    try {
      toast.info('🔍 Searching for similar recipes...');
      const similarRecipes = await AIServices.SmartRecipeSearch.searchSimilarRecipes(query, 6);
      setRecipes(prev => [...prev, ...similarRecipes]);
      toast.success(`Found ${similarRecipes.length} more recipes!`);
    } catch (error) {
      console.error('Recipe search failed:', error);
      toast.error('Recipe search failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {!uploadedImage ? (
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-800 mb-4">
              🍽️ Snap Chef AI
            </h1>
            <p className="text-xl text-gray-600 mb-4 max-w-2xl mx-auto">
              Snap a photo of any dish and discover amazing recipes powered by advanced AI
            </p>
            <div className="mb-8 p-4 bg-blue-50 rounded-lg max-w-xl mx-auto">
              <p className="text-sm text-blue-800">
                <strong>🤖 AI-Powered Features:</strong>
                <br />
                • Computer vision food detection
                <br />
                • Smart recipe generation
                <br />
                • Nutritional analysis
                <br />
                • Personalized recommendations
              </p>
            </div>
            {aiError && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg max-w-md mx-auto">
                <p className="text-sm text-yellow-800">⚠️ {aiError}</p>
              </div>
            )}
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
            
            {detectedFood && !isAnalyzing && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <div className="text-center mb-6">
                    <button
                      onClick={() => searchSimilarRecipes(detectedFood.name)}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      🔍 Find More Similar Recipes
                    </button>
                  </div>
                  
                  {recipes.length > 0 && (
                    <RecipeGrid 
                      recipes={recipes} 
                      savedRecipes={savedRecipes}
                      onSaveRecipe={handleSaveRecipe}
                    />
                  )}
                </div>
                
                <div className="lg:col-span-1">
                  <AIInsights 
                    detectedFood={detectedFood}
                    ingredients={recipes.length > 0 ? recipes[0]?.ingredients : []}
                  />
                </div>
              </div>
            )}
            
            {/* Show recipes in full width if no insights */}
            {recipes.length > 0 && !detectedFood && (
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

// Fallback mock functions (kept for when AI services fail)
const analyzeImageMock = (imageUrl: string): DetectedFood => {
  const filename = imageUrl.toLowerCase();
  
  const foodDetections = [
    { name: "Fresh Garden Salad", confidence: 0.92, category: "Healthy", keywords: ["salad", "lettuce", "green"] },
    { name: "Grilled Chicken Breast", confidence: 0.88, category: "Protein", keywords: ["chicken", "meat", "grilled"] },
    { name: "Sushi Roll", confidence: 0.94, category: "Japanese", keywords: ["sushi", "roll", "rice"] },
    { name: "Chocolate Cake", confidence: 0.89, category: "Dessert", keywords: ["cake", "chocolate", "dessert"] },
    { name: "Beef Burger", confidence: 0.91, category: "American", keywords: ["burger", "beef", "sandwich"] },
    { name: "Pasta Carbonara", confidence: 0.87, category: "Italian", keywords: ["pasta", "noodle", "carbonara"] },
    { name: "Vegetable Stir Fry", confidence: 0.85, category: "Asian", keywords: ["vegetable", "stir", "wok"] },
    { name: "Fresh Fruit Bowl", confidence: 0.93, category: "Healthy", keywords: ["fruit", "bowl", "fresh"] },
    { name: "Pizza Margherita", confidence: 0.90, category: "Italian", keywords: ["pizza", "cheese", "tomato"] },
    { name: "Fish and Chips", confidence: 0.86, category: "British", keywords: ["fish", "chips", "fried"] }
  ];

  for (const detection of foodDetections) {
    if (detection.keywords.some(keyword => filename.includes(keyword))) {
      return {
        name: detection.name,
        confidence: detection.confidence,
        category: detection.category
      };
    }
  }

  const randomIndex = Math.floor(Math.random() * foodDetections.length);
  const randomDetection = foodDetections[randomIndex];
  
  return {
    name: randomDetection.name,
    confidence: randomDetection.confidence,
    category: randomDetection.category
  };
};

const getRelevantRecipesMock = (foodName: string, category: string): Recipe[] => {
  const allRecipes = {
    salad: [
      {
        id: 's1',
        title: 'Caesar Salad',
        description: 'Classic Caesar salad with crispy croutons and parmesan',
        image: 'https://images.unsplash.com/photo-1551248429-40975aa4de74?w=400&h=300&fit=crop',
        cookTime: '15 mins',
        difficulty: 'Easy' as const,
        ingredients: ['Romaine lettuce', 'Caesar dressing', 'Croutons', 'Parmesan cheese'],
        instructions: ['Wash and chop lettuce', 'Add dressing', 'Top with croutons and cheese'],
        nutrition: { calories: 180, protein: '8g', carbs: '12g', fat: '14g' }
      }
    ],
    chicken: [
      {
        id: 'c1',
        title: 'Herb Grilled Chicken',
        description: 'Juicy grilled chicken with fresh herbs and spices',
        image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400&h=300&fit=crop',
        cookTime: '25 mins',
        difficulty: 'Medium' as const,
        ingredients: ['Chicken breast', 'Fresh herbs', 'Olive oil', 'Garlic'],
        instructions: ['Marinate chicken', 'Preheat grill', 'Grill until cooked through'],
        nutrition: { calories: 320, protein: '35g', carbs: '2g', fat: '18g' }
      }
    ],
    default: [
      {
        id: 'd1',
        title: 'Quick Stir Fry',
        description: 'Healthy and quick vegetable stir fry',
        image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop',
        cookTime: '15 mins',
        difficulty: 'Easy' as const,
        ingredients: ['Mixed vegetables', 'Soy sauce', 'Garlic', 'Ginger'],
        instructions: ['Heat oil', 'Add vegetables', 'Stir fry with sauce'],
        nutrition: { calories: 180, protein: '6g', carbs: '28g', fat: '6g' }
      }
    ]
  };

  let recipeKey = 'default';
  const lowerFoodName = foodName.toLowerCase();
  
  if (lowerFoodName.includes('salad')) recipeKey = 'salad';
  else if (lowerFoodName.includes('chicken')) recipeKey = 'chicken';

  const selectedRecipes = allRecipes[recipeKey as keyof typeof allRecipes] || allRecipes.default;
  const result = [...selectedRecipes];
  if (result.length < 3) {
    const additionalRecipes = allRecipes.default.slice(0, 4 - result.length);
    result.push(...additionalRecipes);
  }
  
  return result.slice(0, 4);
};

export default Index;
