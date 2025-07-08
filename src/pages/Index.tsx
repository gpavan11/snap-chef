
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
      const mockDetection = analyzeImage(imageUrl);
      setDetectedFood(mockDetection);
      setRecipes(getRelevantRecipes(mockDetection.name, mockDetection.category));
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
              Snap Chef
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Snap a photo of any dish and discover amazing recipes you can make with those ingredients
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

// Mock image analysis - detects different food types based on filename or random selection
const analyzeImage = (imageUrl: string): DetectedFood => {
  const filename = imageUrl.toLowerCase();
  
  // Simple mock detection based on common food keywords or random selection
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

  // Try to match based on filename
  for (const detection of foodDetections) {
    if (detection.keywords.some(keyword => filename.includes(keyword))) {
      return {
        name: detection.name,
        confidence: detection.confidence,
        category: detection.category
      };
    }
  }

  // If no match, return a random detection
  const randomIndex = Math.floor(Math.random() * foodDetections.length);
  const randomDetection = foodDetections[randomIndex];
  
  return {
    name: randomDetection.name,
    confidence: randomDetection.confidence,
    category: randomDetection.category
  };
};

// Get recipes based on detected food type
const getRelevantRecipes = (foodName: string, category: string): Recipe[] => {
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
      },
      {
        id: 's2',
        title: 'Mediterranean Salad',
        description: 'Fresh Mediterranean salad with olives and feta',
        image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop',
        cookTime: '10 mins',
        difficulty: 'Easy' as const,
        ingredients: ['Mixed greens', 'Olives', 'Feta cheese', 'Olive oil'],
        instructions: ['Mix greens', 'Add olives and feta', 'Drizzle with olive oil'],
        nutrition: { calories: 220, protein: '10g', carbs: '8g', fat: '18g' }
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
      },
      {
        id: 'c2',
        title: 'Chicken Teriyaki',
        description: 'Sweet and savory teriyaki glazed chicken',
        image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&h=300&fit=crop',
        cookTime: '20 mins',
        difficulty: 'Easy' as const,
        ingredients: ['Chicken thighs', 'Teriyaki sauce', 'Rice', 'Green onions'],
        instructions: ['Cook chicken', 'Add teriyaki sauce', 'Serve over rice'],
        nutrition: { calories: 380, protein: '28g', carbs: '35g', fat: '12g' }
      }
    ],
    sushi: [
      {
        id: 'su1',
        title: 'California Roll',
        description: 'Classic California roll with crab and avocado',
        image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
        cookTime: '30 mins',
        difficulty: 'Hard' as const,
        ingredients: ['Sushi rice', 'Nori', 'Crab stick', 'Avocado', 'Cucumber'],
        instructions: ['Prepare sushi rice', 'Roll with filling', 'Slice carefully'],
        nutrition: { calories: 250, protein: '12g', carbs: '45g', fat: '8g' }
      }
    ],
    pasta: [
      {
        id: 'p1',
        title: 'Classic Spaghetti Carbonara',
        description: 'Authentic Italian pasta dish with eggs, cheese, and pancetta',
        image: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop',
        cookTime: '20 mins',
        difficulty: 'Medium' as const,
        ingredients: ['Spaghetti', 'Pancetta', 'Eggs', 'Pecorino Romano', 'Black pepper'],
        instructions: ['Cook pasta', 'Fry pancetta', 'Mix with egg mixture'],
        nutrition: { calories: 580, protein: '25g', carbs: '65g', fat: '22g' }
      }
    ],
    // Add more recipe categories for other food types
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
      },
      {
        id: 'd2',
        title: 'Simple Omelet',
        description: 'Fluffy omelet with herbs',
        image: 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=400&h=300&fit=crop',
        cookTime: '10 mins',
        difficulty: 'Easy' as const,
        ingredients: ['Eggs', 'Milk', 'Herbs', 'Butter'],
        instructions: ['Beat eggs', 'Cook in pan', 'Fold and serve'],
        nutrition: { calories: 240, protein: '16g', carbs: '2g', fat: '18g' }
      }
    ]
  };

  // Determine which recipe set to use based on detected food
  let recipeKey = 'default';
  const lowerFoodName = foodName.toLowerCase();
  
  if (lowerFoodName.includes('salad')) recipeKey = 'salad';
  else if (lowerFoodName.includes('chicken')) recipeKey = 'chicken';
  else if (lowerFoodName.includes('sushi')) recipeKey = 'sushi';
  else if (lowerFoodName.includes('pasta')) recipeKey = 'pasta';

  const selectedRecipes = allRecipes[recipeKey as keyof typeof allRecipes] || allRecipes.default;
  
  // Return 3-4 recipes, adding some from default if needed
  const result = [...selectedRecipes];
  if (result.length < 3) {
    const additionalRecipes = allRecipes.default.slice(0, 4 - result.length);
    result.push(...additionalRecipes);
  }
  
  return result.slice(0, 4);
};

export default Index;
