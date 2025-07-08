// API Configuration and Service Layer
export interface ApiConfig {
  clarifaiApiKey?: string;
  spoonacularApiKey?: string;
  edamamAppId?: string;
  edamamAppKey?: string;
}

// Get API configuration from environment variables
export const getApiConfig = (): ApiConfig => ({
  clarifaiApiKey: import.meta.env.VITE_CLARIFAI_API_KEY,
  spoonacularApiKey: import.meta.env.VITE_SPOONACULAR_API_KEY,
  edamamAppId: import.meta.env.VITE_EDAMAM_APP_ID,
  edamamAppKey: import.meta.env.VITE_EDAMAM_APP_KEY,
});

// Food detection result interface
export interface FoodDetectionResult {
  name: string;
  confidence: number;
  category: string;
  ingredients?: string[];
}

// Recipe interface
export interface ApiRecipe {
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
  sourceUrl?: string;
}

// Clarifai Food Detection API
export class ClarifaiService {
  private apiKey: string;
  private baseUrl = 'https://api.clarifai.com/v2';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async detectFood(imageBase64: string): Promise<FoodDetectionResult> {
    const response = await fetch(`${this.baseUrl}/models/food-item-recognition/outputs`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: [
          {
            data: {
              image: {
                base64: imageBase64.split(',')[1] // Remove data:image/... prefix
              }
            }
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Clarifai API error: ${response.statusText}`);
    }

    const data = await response.json();
    const concepts = data.outputs[0]?.data?.concepts || [];
    
    if (concepts.length === 0) {
      throw new Error('No food detected in the image');
    }

    const topConcept = concepts[0];
    return {
      name: this.formatFoodName(topConcept.name),
      confidence: Math.round(topConcept.value * 100) / 100,
      category: this.categorizeFood(topConcept.name),
      ingredients: this.extractIngredients(concepts.slice(0, 5))
    };
  }

  private formatFoodName(name: string): string {
    return name.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  private categorizeFood(name: string): string {
    const categories = {
      'Healthy': ['salad', 'vegetable', 'fruit', 'quinoa', 'kale'],
      'Protein': ['chicken', 'beef', 'fish', 'egg', 'tofu'],
      'Italian': ['pasta', 'pizza', 'lasagna', 'risotto'],
      'Asian': ['sushi', 'ramen', 'stir-fry', 'dim-sum'],
      'Dessert': ['cake', 'cookie', 'ice-cream', 'chocolate'],
      'American': ['burger', 'fries', 'sandwich', 'bbq'],
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => name.toLowerCase().includes(keyword))) {
        return category;
      }
    }
    return 'General';
  }

  private extractIngredients(concepts: any[]): string[] {
    return concepts.map(concept => this.formatFoodName(concept.name));
  }
}

// Spoonacular Recipe API
export class SpoonacularService {
  private apiKey: string;
  private baseUrl = 'https://api.spoonacular.com/recipes';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async searchRecipesByIngredients(ingredients: string[], number: number = 6): Promise<ApiRecipe[]> {
    const ingredientList = ingredients.join(',');
    const response = await fetch(
      `${this.baseUrl}/findByIngredients?ingredients=${encodeURIComponent(ingredientList)}&number=${number}&apiKey=${this.apiKey}`
    );

    if (!response.ok) {
      throw new Error(`Spoonacular API error: ${response.statusText}`);
    }

    const data = await response.json();
    return Promise.all(data.map((recipe: any) => this.getRecipeDetails(recipe.id)));
  }

  async getRecipeDetails(id: string): Promise<ApiRecipe> {
    const response = await fetch(
      `${this.baseUrl}/${id}/information?apiKey=${this.apiKey}`
    );

    if (!response.ok) {
      throw new Error(`Spoonacular API error: ${response.statusText}`);
    }

    const recipe = await response.json();

    return {
      id: recipe.id.toString(),
      title: recipe.title,
      description: recipe.summary?.replace(/<[^>]*>/g, '').slice(0, 150) + '...' || 'Delicious recipe',
      image: recipe.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
      cookTime: `${recipe.readyInMinutes || 30} mins`,
      difficulty: this.determineDifficulty(recipe.readyInMinutes, recipe.extendedIngredients?.length),
      ingredients: recipe.extendedIngredients?.map((ing: any) => ing.original) || [],
      instructions: recipe.analyzedInstructions?.[0]?.steps?.map((step: any) => step.step) || [],
      nutrition: this.parseNutrition(recipe.nutrition),
      sourceUrl: recipe.sourceUrl
    };
  }

  private determineDifficulty(cookTime: number, ingredientCount: number): 'Easy' | 'Medium' | 'Hard' {
    if (cookTime <= 15 && ingredientCount <= 5) return 'Easy';
    if (cookTime <= 45 && ingredientCount <= 10) return 'Medium';
    return 'Hard';
  }

  private parseNutrition(nutrition: any): any {
    if (!nutrition?.nutrients) return undefined;

    const nutrients = nutrition.nutrients;
    return {
      calories: nutrients.find((n: any) => n.name === 'Calories')?.amount || 0,
      protein: `${nutrients.find((n: any) => n.name === 'Protein')?.amount || 0}g`,
      carbs: `${nutrients.find((n: any) => n.name === 'Carbohydrates')?.amount || 0}g`,
      fat: `${nutrients.find((n: any) => n.name === 'Fat')?.amount || 0}g`,
    };
  }
}

// Main API service that coordinates different providers
export class FoodApiService {
  private clarifaiService?: ClarifaiService;
  private spoonacularService?: SpoonacularService;

  constructor() {
    const config = getApiConfig();
    
    if (config.clarifaiApiKey) {
      this.clarifaiService = new ClarifaiService(config.clarifaiApiKey);
    }
    
    if (config.spoonacularApiKey) {
      this.spoonacularService = new SpoonacularService(config.spoonacularApiKey);
    }
  }

  async analyzeFood(imageBase64: string): Promise<FoodDetectionResult> {
    if (!this.clarifaiService) {
      throw new Error('Clarifai API key not configured');
    }

    return await this.clarifaiService.detectFood(imageBase64);
  }

  async getRecipes(detectedFood: FoodDetectionResult): Promise<ApiRecipe[]> {
    if (!this.spoonacularService) {
      // Fallback to mock recipes if no API key
      return this.getMockRecipes(detectedFood);
    }

    try {
      const ingredients = detectedFood.ingredients || [detectedFood.name];
      return await this.spoonacularService.searchRecipesByIngredients(ingredients);
    } catch (error) {
      console.error('Recipe API error, falling back to mock data:', error);
      return this.getMockRecipes(detectedFood);
    }
  }

  private getMockRecipes(detectedFood: FoodDetectionResult): ApiRecipe[] {
    // Fallback mock recipes (simplified version of existing logic)
    return [
      {
        id: 'mock1',
        title: `${detectedFood.name} Recipe`,
        description: `A delicious recipe featuring ${detectedFood.name}`,
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
        cookTime: '25 mins',
        difficulty: 'Medium',
        ingredients: detectedFood.ingredients || ['Main ingredient', 'Seasoning', 'Oil'],
        instructions: ['Prepare ingredients', 'Cook according to preference', 'Serve hot'],
        nutrition: { calories: 300, protein: '20g', carbs: '30g', fat: '10g' }
      }
    ];
  }

  isConfigured(): { clarifai: boolean; spoonacular: boolean } {
    return {
      clarifai: !!this.clarifaiService,
      spoonacular: !!this.spoonacularService
    };
  }
}

// Export singleton instance
export const foodApiService = new FoodApiService();