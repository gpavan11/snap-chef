import OpenAI from 'openai';
import axios from 'axios';
import { DetectedFood, Recipe } from '@/pages/Index';

// AI Service Configuration
const AI_CONFIG = {
  openai: {
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  },
  googleVision: {
    apiKey: import.meta.env.VITE_GOOGLE_CLOUD_VISION_API_KEY,
  },
  edamam: {
    appId: import.meta.env.VITE_EDAMAM_APP_ID,
    appKey: import.meta.env.VITE_EDAMAM_APP_KEY,
  },
  huggingface: {
    apiKey: import.meta.env.VITE_HUGGINGFACE_API_KEY,
  }
};

// Initialize OpenAI client
const openai = AI_CONFIG.openai.apiKey ? new OpenAI({
  apiKey: AI_CONFIG.openai.apiKey,
  dangerouslyAllowBrowser: true // Note: In production, use a backend proxy
}) : null;

// Food Detection using Computer Vision
export class FoodDetectionService {
  
  // Primary method using OpenAI Vision
  static async detectFoodWithOpenAI(imageUrl: string): Promise<DetectedFood> {
    if (!openai) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this food image and return ONLY a JSON object with this exact format:
                {
                  "name": "specific food name",
                  "confidence": 0.95,
                  "category": "cuisine type or food category",
                  "ingredients": ["ingredient1", "ingredient2"],
                  "description": "brief description"
                }
                Be as accurate as possible about the food identification.`
              },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ],
        max_tokens: 300
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from AI');
      }

      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid JSON response');
      }

      const result = JSON.parse(jsonMatch[0]);
      return {
        name: result.name,
        confidence: result.confidence,
        category: result.category
      };
    } catch (error) {
      console.error('OpenAI food detection error:', error);
      throw error;
    }
  }

  // Fallback using Google Vision API
  static async detectFoodWithGoogle(imageUrl: string): Promise<DetectedFood> {
    if (!AI_CONFIG.googleVision.apiKey) {
      throw new Error('Google Vision API key not configured');
    }

    try {
      const response = await axios.post(
        `https://vision.googleapis.com/v1/images:annotate?key=${AI_CONFIG.googleVision.apiKey}`,
        {
          requests: [{
            image: { source: { imageUri: imageUrl } },
            features: [
              { type: 'LABEL_DETECTION', maxResults: 10 },
              { type: 'TEXT_DETECTION', maxResults: 5 }
            ]
          }]
        }
      );

      const labels = response.data.responses[0]?.labelAnnotations || [];
      const foodLabels = labels.filter((label: any) => 
        label.description.toLowerCase().includes('food') ||
        label.description.toLowerCase().includes('dish') ||
        label.description.toLowerCase().includes('cuisine') ||
        label.score > 0.8
      );

      if (foodLabels.length === 0) {
        throw new Error('No food detected in image');
      }

      const topLabel = foodLabels[0];
      return {
        name: this.formatFoodName(topLabel.description),
        confidence: topLabel.score,
        category: this.categorizeFood(topLabel.description)
      };
    } catch (error) {
      console.error('Google Vision food detection error:', error);
      throw error;
    }
  }

  // Fallback using Hugging Face
  static async detectFoodWithHuggingFace(imageUrl: string): Promise<DetectedFood> {
    if (!AI_CONFIG.huggingface.apiKey) {
      throw new Error('Hugging Face API key not configured');
    }

    try {
      // Convert image URL to blob for HuggingFace
      const imageResponse = await fetch(imageUrl);
      const imageBlob = await imageResponse.blob();
      
      const response = await axios.post(
        'https://api-inference.huggingface.co/models/nateraw/food',
        imageBlob,
        {
          headers: {
            Authorization: `Bearer ${AI_CONFIG.huggingface.apiKey}`,
            'Content-Type': 'application/octet-stream'
          }
        }
      );

      const predictions = response.data;
      if (!predictions || predictions.length === 0) {
        throw new Error('No food detected');
      }

      const topPrediction = predictions[0];
      return {
        name: this.formatFoodName(topPrediction.label),
        confidence: topPrediction.score,
        category: this.categorizeFood(topPrediction.label)
      };
    } catch (error) {
      console.error('Hugging Face food detection error:', error);
      throw error;
    }
  }

  // Main detection method with fallbacks
  static async detectFood(imageUrl: string): Promise<DetectedFood> {
    const methods = [
      () => this.detectFoodWithOpenAI(imageUrl),
      () => this.detectFoodWithGoogle(imageUrl),
      () => this.detectFoodWithHuggingFace(imageUrl)
    ];

    for (const method of methods) {
      try {
        return await method();
      } catch (error) {
        console.warn('Food detection method failed, trying next...', error);
        continue;
      }
    }

    // Final fallback to mock detection
    console.warn('All AI detection methods failed, using mock detection');
    return this.mockDetection(imageUrl);
  }

  // Helper methods
  private static formatFoodName(name: string): string {
    return name
      .split(/[\s_-]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  private static categorizeFood(foodName: string): string {
    const categories = {
      'Asian': ['sushi', 'ramen', 'stir fry', 'rice', 'noodle'],
      'Italian': ['pasta', 'pizza', 'lasagna', 'risotto'],
      'Mexican': ['taco', 'burrito', 'quesadilla', 'salsa'],
      'American': ['burger', 'fries', 'sandwich', 'bbq'],
      'Healthy': ['salad', 'fruit', 'vegetable', 'grain'],
      'Dessert': ['cake', 'cookie', 'ice cream', 'chocolate'],
      'Breakfast': ['pancake', 'waffle', 'egg', 'cereal']
    };

    const lowerName = foodName.toLowerCase();
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => lowerName.includes(keyword))) {
        return category;
      }
    }
    return 'International';
  }

  private static mockDetection(imageUrl: string): DetectedFood {
    const mockFoods = [
      { name: "Grilled Chicken Breast", confidence: 0.88, category: "Protein" },
      { name: "Caesar Salad", confidence: 0.92, category: "Healthy" },
      { name: "Spaghetti Carbonara", confidence: 0.87, category: "Italian" },
      { name: "Sushi Roll", confidence: 0.94, category: "Asian" },
      { name: "Chocolate Cake", confidence: 0.89, category: "Dessert" }
    ];
    return mockFoods[Math.floor(Math.random() * mockFoods.length)];
  }
}

// Recipe Generation using AI
export class RecipeGenerationService {
  
  static async generateRecipes(detectedFood: DetectedFood, count: number = 4): Promise<Recipe[]> {
    if (!openai) {
      console.warn('OpenAI not configured, using mock recipes');
      return this.getMockRecipes(detectedFood, count);
    }

    try {
      const prompt = `Generate ${count} detailed recipes inspired by or that use ingredients similar to "${detectedFood.name}". 
      Return ONLY a JSON array with this exact format:
      [
        {
          "id": "unique_id",
          "title": "Recipe Name",
          "description": "Brief appetizing description",
          "image": "https://images.unsplash.com/photo-relevant-food-image?w=400&h=300&fit=crop",
          "cookTime": "X mins",
          "difficulty": "Easy|Medium|Hard",
          "ingredients": ["ingredient1", "ingredient2", "..."],
          "instructions": ["step1", "step2", "..."],
          "nutrition": {
            "calories": 300,
            "protein": "25g",
            "carbs": "30g",
            "fat": "15g"
          }
        }
      ]
      
      Make the recipes creative, practical, and ensure Unsplash URLs are realistic food photography.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 2000,
        temperature: 0.7
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from AI');
      }

      // Extract JSON from response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('Invalid JSON response');
      }

      const recipes = JSON.parse(jsonMatch[0]);
      return recipes;

    } catch (error) {
      console.error('Recipe generation error:', error);
      return this.getMockRecipes(detectedFood, count);
    }
  }

  private static getMockRecipes(detectedFood: DetectedFood, count: number): Recipe[] {
    const mockRecipes: Recipe[] = [
      {
        id: 'ai-recipe-1',
        title: `Inspired ${detectedFood.name} Bowl`,
        description: `A creative take on ${detectedFood.name} with fresh ingredients`,
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
        cookTime: '25 mins',
        difficulty: 'Medium',
        ingredients: ['Fresh ingredients', 'Seasonal vegetables', 'Quality proteins', 'Aromatic herbs'],
        instructions: ['Prepare ingredients', 'Cook with care', 'Season to taste', 'Serve beautifully'],
        nutrition: { calories: 350, protein: '20g', carbs: '35g', fat: '15g' }
      },
      {
        id: 'ai-recipe-2',
        title: `${detectedFood.category} Fusion Dish`,
        description: `Fusion cuisine inspired by ${detectedFood.category} flavors`,
        image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop',
        cookTime: '30 mins',
        difficulty: 'Easy',
        ingredients: ['Mixed proteins', 'Fresh herbs', 'Seasonal produce', 'Quality oils'],
        instructions: ['Prepare mise en place', 'Cook with technique', 'Balance flavors', 'Present well'],
        nutrition: { calories: 280, protein: '18g', carbs: '25g', fat: '12g' }
      }
    ];

    return mockRecipes.slice(0, count);
  }
}

// Nutritional Analysis Service
export class NutritionalAnalysisService {
  
  static async analyzeIngredients(ingredients: string[]): Promise<any> {
    if (!AI_CONFIG.edamam.appId || !AI_CONFIG.edamam.appKey) {
      console.warn('Edamam API not configured, using estimated nutrition');
      return this.estimateNutrition(ingredients);
    }

    try {
      const response = await axios.post(
        `https://api.edamam.com/api/nutrition-details?app_id=${AI_CONFIG.edamam.appId}&app_key=${AI_CONFIG.edamam.appKey}`,
        {
          title: "Recipe Analysis",
          ingr: ingredients
        }
      );

      return {
        calories: Math.round(response.data.calories),
        protein: `${Math.round(response.data.totalNutrients.PROCNT?.quantity || 0)}g`,
        carbs: `${Math.round(response.data.totalNutrients.CHOCDF?.quantity || 0)}g`,
        fat: `${Math.round(response.data.totalNutrients.FAT?.quantity || 0)}g`,
        fiber: `${Math.round(response.data.totalNutrients.FIBTG?.quantity || 0)}g`,
        sugar: `${Math.round(response.data.totalNutrients.SUGAR?.quantity || 0)}g`
      };
    } catch (error) {
      console.error('Nutritional analysis error:', error);
      return this.estimateNutrition(ingredients);
    }
  }

  private static estimateNutrition(ingredients: string[]): any {
    // Simple estimation based on ingredient count and common values
    const baseCalories = ingredients.length * 50;
    return {
      calories: baseCalories + Math.floor(Math.random() * 100),
      protein: `${Math.floor(Math.random() * 20) + 10}g`,
      carbs: `${Math.floor(Math.random() * 30) + 20}g`,
      fat: `${Math.floor(Math.random() * 15) + 5}g`,
      fiber: `${Math.floor(Math.random() * 8) + 2}g`,
      sugar: `${Math.floor(Math.random() * 15) + 5}g`
    };
  }
}

// Smart Recipe Search Service
export class SmartRecipeSearchService {
  
  static async searchSimilarRecipes(query: string, count: number = 6): Promise<Recipe[]> {
    if (!openai) {
      return this.mockSearchResults(query, count);
    }

    try {
      const prompt = `Find ${count} recipes similar to or related to "${query}". 
      Return ONLY a JSON array of recipes with the same format as before.
      Focus on practical, delicious recipes that home cooks can make.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1500,
        temperature: 0.8
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from AI');
      }

      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('Invalid JSON response');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Recipe search error:', error);
      return this.mockSearchResults(query, count);
    }
  }

  private static mockSearchResults(query: string, count: number): Recipe[] {
    const mockResults: Recipe[] = [
      {
        id: 'search-1',
        title: `${query} Variation`,
        description: `A delicious take on ${query}`,
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
        cookTime: '20 mins',
        difficulty: 'Easy',
        ingredients: ['Fresh ingredients', 'Quality seasonings'],
        instructions: ['Prepare', 'Cook', 'Serve'],
        nutrition: { calories: 300, protein: '15g', carbs: '25g', fat: '12g' }
      }
    ];
    
    return Array(count).fill(0).map((_, index) => ({
      ...mockResults[0],
      id: `search-${index + 1}`,
      title: `${query} Recipe ${index + 1}`
    }));
  }
}

export const AIServices = {
  FoodDetection: FoodDetectionService,
  RecipeGeneration: RecipeGenerationService,
  NutritionalAnalysis: NutritionalAnalysisService,
  SmartRecipeSearch: SmartRecipeSearchService
};