// API Configuration and Service Layer
export interface ApiConfig {
  openaiApiKey?: string;
  clarifaiApiKey?: string;
  spoonacularApiKey?: string;
  edamamAppId?: string;
  edamamAppKey?: string;
}

// Get API configuration from environment variables
export const getApiConfig = (): ApiConfig => ({
  openaiApiKey: import.meta.env.VITE_OPENAI_API_KEY,
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

// OpenAI Food Detection and Recipe API
export class OpenAIService {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async detectFood(imageBase64: string): Promise<FoodDetectionResult> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this food image and provide a JSON response with the following structure:
{
  "name": "detected food name",
  "confidence": 0.95,
  "category": "food category (Healthy/Protein/Italian/Asian/Dessert/American/General)",
  "ingredients": ["ingredient1", "ingredient2", "ingredient3"]
}

Detect the main food item visible, provide a confidence score between 0 and 1, categorize it appropriately, and list 3-5 key ingredients you can see or that would typically be in this dish.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageBase64
                }
              }
            ]
          }
        ],
        max_tokens: 300,
        temperature: 0.1
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    try {
      // Extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      const result = JSON.parse(jsonMatch[0]);
      
      return {
        name: result.name || 'Unknown Food',
        confidence: Math.min(Math.max(result.confidence || 0.8, 0), 1),
        category: result.category || 'General',
        ingredients: result.ingredients || []
      };
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      // Fallback parsing if JSON fails
      return this.parseTextResponse(content);
    }
  }

  async generateRecipes(detectedFood: FoodDetectionResult, count: number = 4): Promise<ApiRecipe[]> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: `Generate ${count} diverse recipes featuring "${detectedFood.name}" or similar ingredients: ${detectedFood.ingredients?.join(', ')}. 

Provide a JSON array with this exact structure:
[
  {
    "id": "recipe_1",
    "title": "Recipe Name",
    "description": "Brief appealing description (max 150 chars)",
    "cookTime": "25 mins",
    "difficulty": "Easy|Medium|Hard",
    "ingredients": ["ingredient 1", "ingredient 2", "ingredient 3"],
    "instructions": ["step 1", "step 2", "step 3"],
    "nutrition": {
      "calories": 350,
      "protein": "25g",
      "carbs": "30g",
      "fat": "12g"
    }
  }
]

Make the recipes practical, diverse in cooking style, and appropriate for the detected food category: ${detectedFood.category}. Ensure realistic nutrition values and clear instructions.`
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    try {
      // Extract JSON array from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON array found in response');
      }
      
      const recipes = JSON.parse(jsonMatch[0]);
      
      return recipes.map((recipe: any, index: number) => ({
        id: recipe.id || `openai_${index + 1}`,
        title: recipe.title || 'Generated Recipe',
        description: recipe.description || 'Delicious recipe generated by AI',
        image: this.getRecipeImage(recipe.title, detectedFood.category),
        cookTime: recipe.cookTime || '30 mins',
        difficulty: recipe.difficulty || 'Medium',
        ingredients: recipe.ingredients || [],
        instructions: recipe.instructions || [],
        nutrition: recipe.nutrition || {
          calories: 300,
          protein: '20g',
          carbs: '25g',
          fat: '15g'
        }
      }));
    } catch (parseError) {
      console.error('Failed to parse OpenAI recipe response:', parseError);
      // Return fallback recipes
      return this.generateFallbackRecipes(detectedFood, count);
    }
  }

  private parseTextResponse(content: string): FoodDetectionResult {
    // Simple text parsing fallback
    const lines = content.toLowerCase();
    
    let name = 'Detected Food';
    let confidence = 0.85;
    let category = 'General';
    let ingredients: string[] = [];

    // Try to extract food name
    const nameMatch = lines.match(/(?:food|dish|item):\s*([^\n]+)/);
    if (nameMatch) {
      name = nameMatch[1].trim();
    }

    // Try to extract confidence
    const confMatch = lines.match(/confidence:\s*([0-9.]+)/);
    if (confMatch) {
      confidence = parseFloat(confMatch[1]);
    }

    // Try to extract category
    const categories = ['healthy', 'protein', 'italian', 'asian', 'dessert', 'american'];
    for (const cat of categories) {
      if (lines.includes(cat)) {
        category = cat.charAt(0).toUpperCase() + cat.slice(1);
        break;
      }
    }

    return { name, confidence, category, ingredients };
  }

  private getRecipeImage(title: string, category: string): string {
    // Return appropriate Unsplash images based on recipe type
    const imageMap: Record<string, string> = {
      'Healthy': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
      'Protein': 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400&h=300&fit=crop',
      'Italian': 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop',
      'Asian': 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop',
      'Dessert': 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop',
      'American': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop'
    };

    return imageMap[category] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop';
  }

  private generateFallbackRecipes(detectedFood: FoodDetectionResult, count: number): ApiRecipe[] {
    const fallbackRecipes = [];
    for (let i = 0; i < count; i++) {
      fallbackRecipes.push({
        id: `fallback_${i + 1}`,
        title: `${detectedFood.name} Recipe ${i + 1}`,
        description: `A delicious recipe featuring ${detectedFood.name}`,
        image: this.getRecipeImage('', detectedFood.category),
        cookTime: '30 mins',
        difficulty: 'Medium' as const,
        ingredients: detectedFood.ingredients || ['Main ingredient', 'Seasoning', 'Oil'],
        instructions: ['Prepare ingredients', 'Cook according to preference', 'Serve hot'],
        nutrition: { calories: 300, protein: '20g', carbs: '25g', fat: '15g' }
      });
    }
    return fallbackRecipes;
  }
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
  private openaiService?: OpenAIService;
  private clarifaiService?: ClarifaiService;
  private spoonacularService?: SpoonacularService;

  constructor() {
    const config = getApiConfig();
    
    if (config.openaiApiKey) {
      this.openaiService = new OpenAIService(config.openaiApiKey);
    }
    
    if (config.clarifaiApiKey) {
      this.clarifaiService = new ClarifaiService(config.clarifaiApiKey);
    }
    
    if (config.spoonacularApiKey) {
      this.spoonacularService = new SpoonacularService(config.spoonacularApiKey);
    }
  }

  async analyzeFood(imageBase64: string): Promise<FoodDetectionResult> {
    // Prefer OpenAI for food detection (most accurate)
    if (this.openaiService) {
      try {
        return await this.openaiService.detectFood(imageBase64);
      } catch (error) {
        console.error('OpenAI food detection failed, trying Clarifai:', error);
      }
    }

    // Fallback to Clarifai
    if (this.clarifaiService) {
      try {
        return await this.clarifaiService.detectFood(imageBase64);
      } catch (error) {
        console.error('Clarifai food detection failed:', error);
      }
    }

    throw new Error('No food detection API configured or all APIs failed');
  }

  async getRecipes(detectedFood: FoodDetectionResult): Promise<ApiRecipe[]> {
    // Prefer OpenAI for recipe generation (most creative and detailed)
    if (this.openaiService) {
      try {
        return await this.openaiService.generateRecipes(detectedFood);
      } catch (error) {
        console.error('OpenAI recipe generation failed, trying Spoonacular:', error);
      }
    }

    // Fallback to Spoonacular
    if (this.spoonacularService) {
      try {
        const ingredients = detectedFood.ingredients || [detectedFood.name];
        return await this.spoonacularService.searchRecipesByIngredients(ingredients);
      } catch (error) {
        console.error('Spoonacular API error, falling back to mock data:', error);
      }
    }

    // Final fallback to mock recipes
    return this.getMockRecipes(detectedFood);
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

  isConfigured(): { openai: boolean; clarifai: boolean; spoonacular: boolean } {
    return {
      openai: !!this.openaiService,
      clarifai: !!this.clarifaiService,
      spoonacular: !!this.spoonacularService
    };
  }
}

// Export singleton instance
export const foodApiService = new FoodApiService();