
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
      },
      {
        id: 'su2',
        title: 'Salmon Nigiri',
        description: 'Fresh salmon over seasoned sushi rice',
        image: 'https://images.unsplash.com/photo-1563612116625-3012372fccce?w=400&h=300&fit=crop',
        cookTime: '20 mins',
        difficulty: 'Medium' as const,
        ingredients: ['Sushi rice', 'Fresh salmon', 'Wasabi', 'Soy sauce'],
        instructions: ['Prepare sushi rice', 'Slice salmon', 'Form nigiri'],
        nutrition: { calories: 180, protein: '15g', carbs: '20g', fat: '6g' }
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
      },
      {
        id: 'p2',
        title: 'Marinara Pasta',
        description: 'Simple and delicious tomato pasta',
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
        cookTime: '15 mins',
        difficulty: 'Easy' as const,
        ingredients: ['Pasta', 'Tomato sauce', 'Garlic', 'Basil', 'Olive oil'],
        instructions: ['Cook pasta', 'Make sauce', 'Combine and serve'],
        nutrition: { calories: 420, protein: '12g', carbs: '75g', fat: '8g' }
      }
    ],
    burger: [
      {
        id: 'b1',
        title: 'Classic Beef Burger',
        description: 'Juicy beef burger with fresh toppings',
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
        cookTime: '20 mins',
        difficulty: 'Easy' as const,
        ingredients: ['Ground beef', 'Burger buns', 'Lettuce', 'Tomato', 'Onion', 'Cheese'],
        instructions: ['Form patties', 'Grill burgers', 'Assemble with toppings'],
        nutrition: { calories: 650, protein: '35g', carbs: '45g', fat: '35g' }
      },
      {
        id: 'b2',
        title: 'Turkey Burger',
        description: 'Lean turkey burger with avocado',
        image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433a?w=400&h=300&fit=crop',
        cookTime: '18 mins',
        difficulty: 'Easy' as const,
        ingredients: ['Ground turkey', 'Whole wheat buns', 'Avocado', 'Sprouts', 'Red onion'],
        instructions: ['Season turkey', 'Cook patties', 'Serve with fresh toppings'],
        nutrition: { calories: 480, protein: '30g', carbs: '35g', fat: '22g' }
      }
    ],
    cake: [
      {
        id: 'ck1',
        title: 'Chocolate Fudge Cake',
        description: 'Rich and moist chocolate cake with fudge frosting',
        image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop',
        cookTime: '45 mins',
        difficulty: 'Medium' as const,
        ingredients: ['Flour', 'Cocoa powder', 'Sugar', 'Eggs', 'Butter', 'Chocolate'],
        instructions: ['Mix dry ingredients', 'Add wet ingredients', 'Bake and frost'],
        nutrition: { calories: 420, protein: '6g', carbs: '65g', fat: '18g' }
      },
      {
        id: 'ck2',
        title: 'Vanilla Sponge Cake',
        description: 'Light and fluffy vanilla cake',
        image: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400&h=300&fit=crop',
        cookTime: '35 mins',
        difficulty: 'Easy' as const,
        ingredients: ['Flour', 'Sugar', 'Eggs', 'Butter', 'Vanilla extract', 'Baking powder'],
        instructions: ['Cream butter and sugar', 'Add eggs and flour', 'Bake until golden'],
        nutrition: { calories: 320, protein: '5g', carbs: '55g', fat: '12g' }
      }
    ],
    pizza: [
      {
        id: 'pz1',
        title: 'Classic Margherita Pizza',
        description: 'Traditional pizza with tomato, mozzarella, and basil',
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
        cookTime: '25 mins',
        difficulty: 'Medium' as const,
        ingredients: ['Pizza dough', 'Tomato sauce', 'Mozzarella', 'Fresh basil', 'Olive oil'],
        instructions: ['Roll out dough', 'Add sauce and cheese', 'Bake until crispy'],
        nutrition: { calories: 520, protein: '22g', carbs: '65g', fat: '18g' }
      },
      {
        id: 'pz2',
        title: 'Pepperoni Pizza',
        description: 'Classic pepperoni pizza with cheese',
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop',
        cookTime: '25 mins',
        difficulty: 'Medium' as const,
        ingredients: ['Pizza dough', 'Tomato sauce', 'Mozzarella', 'Pepperoni'],
        instructions: ['Prepare dough', 'Add toppings', 'Bake until golden'],
        nutrition: { calories: 580, protein: '25g', carbs: '60g', fat: '24g' }
      }
    ],
    fish: [
      {
        id: 'f1',
        title: 'Beer Battered Fish',
        description: 'Crispy beer battered fish with golden coating',
        image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop',
        cookTime: '20 mins',
        difficulty: 'Medium' as const,
        ingredients: ['White fish fillets', 'Beer', 'Flour', 'Baking powder', 'Salt'],
        instructions: ['Make batter', 'Coat fish', 'Fry until golden'],
        nutrition: { calories: 380, protein: '28g', carbs: '25g', fat: '18g' }
      },
      {
        id: 'f2',
        title: 'Grilled Salmon',
        description: 'Healthy grilled salmon with herbs',
        image: 'https://images.unsplash.com/photo-1485963631004-f2f00b1d6606?w=400&h=300&fit=crop',
        cookTime: '15 mins',
        difficulty: 'Easy' as const,
        ingredients: ['Salmon fillets', 'Lemon', 'Dill', 'Olive oil', 'Garlic'],
        instructions: ['Season salmon', 'Grill 6 mins per side', 'Serve with lemon'],
        nutrition: { calories: 280, protein: '32g', carbs: '2g', fat: '16g' }
      }
    ],
    vegetable: [
      {
        id: 'v1',
        title: 'Asian Vegetable Stir Fry',
        description: 'Colorful vegetable stir fry with Asian flavors',
        image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop',
        cookTime: '15 mins',
        difficulty: 'Easy' as const,
        ingredients: ['Mixed vegetables', 'Soy sauce', 'Garlic', 'Ginger', 'Sesame oil'],
        instructions: ['Heat oil in wok', 'Add vegetables', 'Stir fry with sauce'],
        nutrition: { calories: 180, protein: '6g', carbs: '28g', fat: '6g' }
      },
      {
        id: 'v2',
        title: 'Roasted Vegetable Medley',
        description: 'Oven-roasted seasonal vegetables',
        image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop',
        cookTime: '30 mins',
        difficulty: 'Easy' as const,
        ingredients: ['Root vegetables', 'Olive oil', 'Herbs', 'Salt', 'Pepper'],
        instructions: ['Chop vegetables', 'Toss with oil and herbs', 'Roast until tender'],
        nutrition: { calories: 150, protein: '4g', carbs: '25g', fat: '5g' }
      }
    ],
    fruit: [
      {
        id: 'fr1',
        title: 'Fresh Fruit Salad',
        description: 'Refreshing mixed fruit salad with honey dressing',
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop',
        cookTime: '10 mins',
        difficulty: 'Easy' as const,
        ingredients: ['Mixed seasonal fruits', 'Honey', 'Lime juice', 'Mint leaves'],
        instructions: ['Chop fruits', 'Mix with honey and lime', 'Garnish with mint'],
        nutrition: { calories: 120, protein: '2g', carbs: '30g', fat: '0g' }
      },
      {
        id: 'fr2',
        title: 'Fruit Smoothie Bowl',
        description: 'Healthy smoothie bowl with fresh toppings',
        image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=300&fit=crop',
        cookTime: '5 mins',
        difficulty: 'Easy' as const,
        ingredients: ['Frozen berries', 'Banana', 'Yogurt', 'Granola', 'Coconut flakes'],
        instructions: ['Blend frozen fruits', 'Pour into bowl', 'Add toppings'],
        nutrition: { calories: 280, protein: '12g', carbs: '45g', fat: '8g' }
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
  else if (lowerFoodName.includes('pasta') || lowerFoodName.includes('carbonara')) recipeKey = 'pasta';
  else if (lowerFoodName.includes('burger')) recipeKey = 'burger';
  else if (lowerFoodName.includes('cake') || lowerFoodName.includes('chocolate')) recipeKey = 'cake';
  else if (lowerFoodName.includes('pizza')) recipeKey = 'pizza';
  else if (lowerFoodName.includes('fish') || lowerFoodName.includes('chips')) recipeKey = 'fish';
  else if (lowerFoodName.includes('vegetable') || lowerFoodName.includes('stir fry')) recipeKey = 'vegetable';
  else if (lowerFoodName.includes('fruit')) recipeKey = 'fruit';

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
