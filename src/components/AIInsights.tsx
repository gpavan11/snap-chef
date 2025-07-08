import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, ChefHat, Heart, Zap } from 'lucide-react';
import { AIServices } from '@/lib/aiServices';
import { DetectedFood } from '@/pages/Index';
import { toast } from 'sonner';

interface AIInsightsProps {
  detectedFood: DetectedFood;
  ingredients?: string[];
}

interface FoodInsight {
  type: 'tip' | 'substitution' | 'nutrition' | 'technique';
  title: string;
  content: string;
  icon: React.ReactNode;
}

export const AIInsights = ({ detectedFood, ingredients = [] }: AIInsightsProps) => {
  const [insights, setInsights] = useState<FoodInsight[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const generateInsights = async () => {
    setIsLoading(true);
    try {
      toast.info('🧠 Generating AI insights...');
      
      // This would call an AI service to generate insights
      // For now, we'll use a mix of real and mock insights
      const aiInsights = await generateFoodInsights(detectedFood, ingredients);
      setInsights(aiInsights);
      
      toast.success('✨ AI insights generated!');
    } catch (error) {
      console.error('Failed to generate insights:', error);
      toast.error('Failed to generate insights');
      
      // Fallback to mock insights
      setInsights(getMockInsights(detectedFood));
    } finally {
      setIsLoading(false);
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'tip': return <Lightbulb className="h-5 w-5 text-yellow-500" />;
      case 'substitution': return <Zap className="h-5 w-5 text-blue-500" />;
      case 'nutrition': return <Heart className="h-5 w-5 text-red-500" />;
      case 'technique': return <ChefHat className="h-5 w-5 text-green-500" />;
      default: return <Lightbulb className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🧠 AI Food Insights
          <Badge variant="secondary">{detectedFood.category}</Badge>
        </CardTitle>
        <CardDescription>
          Get personalized cooking tips and insights for {detectedFood.name}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {insights.length === 0 ? (
          <div className="text-center py-6">
            <Button 
              onClick={generateInsights} 
              disabled={isLoading}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {isLoading ? '🤖 Analyzing...' : '✨ Generate AI Insights'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div key={index} className="flex gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                {getIconForType(insight.type)}
                <div className="flex-1">
                  <h4 className="font-semibold text-sm text-gray-800">{insight.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{insight.content}</p>
                </div>
              </div>
            ))}
            <Button 
              onClick={generateInsights} 
              variant="outline" 
              size="sm"
              disabled={isLoading}
              className="w-full mt-4"
            >
              🔄 Generate New Insights
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// AI-powered insight generation
const generateFoodInsights = async (detectedFood: DetectedFood, ingredients: string[]): Promise<FoodInsight[]> => {
  // This would use OpenAI or another LLM to generate insights
  // For now, we'll create intelligent mock insights based on the food
  return getMockInsights(detectedFood);
};

const getMockInsights = (detectedFood: DetectedFood): FoodInsight[] => {
  const baseInsights = [
    {
      type: 'tip' as const,
      title: 'Chef\'s Secret',
      content: `For the best ${detectedFood.name}, always use fresh, high-quality ingredients and let flavors develop naturally.`,
      icon: <ChefHat className="h-5 w-5 text-green-500" />
    },
    {
      type: 'nutrition' as const,
      title: 'Health Benefits',
      content: getHealthBenefits(detectedFood.category),
      icon: <Heart className="h-5 w-5 text-red-500" />
    },
    {
      type: 'technique' as const,
      title: 'Cooking Technique',
      content: getCookingTechnique(detectedFood.category),
      icon: <ChefHat className="h-5 w-5 text-green-500" />
    },
    {
      type: 'substitution' as const,
      title: 'Smart Substitutions',
      content: getSubstitutions(detectedFood.category),
      icon: <Zap className="h-5 w-5 text-blue-500" />
    }
  ];

  // Return 2-3 random insights
  const shuffled = baseInsights.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 3);
};

const getHealthBenefits = (category: string): string => {
  const benefits: Record<string, string> = {
    'Healthy': 'Rich in vitamins, minerals, and antioxidants that support overall wellness and boost immunity.',
    'Protein': 'Excellent source of complete proteins for muscle building and tissue repair.',
    'Italian': 'Mediterranean ingredients like olive oil and tomatoes provide heart-healthy compounds.',
    'Asian': 'Often includes anti-inflammatory spices and vegetables rich in phytonutrients.',
    'Dessert': 'Enjoy in moderation! Dark chocolate varieties can provide antioxidants.',
    'American': 'Can be made healthier by using lean proteins and adding extra vegetables.',
    'Breakfast': 'Provides essential energy to start your day and can include fiber-rich ingredients.',
    'Mexican': 'Features nutrient-dense ingredients like avocados, beans, and peppers.',
    'British': 'Traditional comfort food that can be lightened up with baking instead of frying.'
  };
  return benefits[category] || 'This dish can be part of a balanced diet when prepared with fresh ingredients.';
};

const getCookingTechnique = (category: string): string => {
  const techniques: Record<string, string> = {
    'Healthy': 'Steam or grill to preserve nutrients, and use minimal oil for the cleanest flavors.',
    'Protein': 'Use a meat thermometer to ensure perfect doneness and let meat rest before serving.',
    'Italian': 'Build flavors slowly with garlic and herbs, and always finish pasta in the sauce.',
    'Asian': 'High heat and quick cooking preserve texture. Prep all ingredients before you start.',
    'Dessert': 'Room temperature ingredients mix better, and don\'t overmix to keep textures light.',
    'American': 'Layer flavors with seasonings and don\'t overcrowd the pan when cooking.',
    'Breakfast': 'Cook eggs low and slow for creaminess, and toast bread just before serving.',
    'Mexican': 'Toast spices briefly to release oils, and char vegetables for smoky depth.',
    'British': 'For fish and chips, double-fry for extra crispiness and use malt vinegar.'
  };
  return techniques[category] || 'Focus on timing and temperature for the best results.';
};

const getSubstitutions = (category: string): string => {
  const substitutions: Record<string, string> = {
    'Healthy': 'Try zucchini noodles for pasta, cauliflower rice for grains, or Greek yogurt for sour cream.',
    'Protein': 'Swap chicken for turkey, use plant-based proteins, or try leaner cuts of meat.',
    'Italian': 'Use zucchini noodles for pasta, cashew cream for dairy, or nutritional yeast for cheese.',
    'Asian': 'Coconut aminos for soy sauce, shiitaki mushrooms for umami, or rice paper for wheat wraps.',
    'Dessert': 'Use applesauce for oil, stevia for sugar, or almond flour for regular flour.',
    'American': 'Try turkey burger for beef, sweet potato fries for regular fries.',
    'Breakfast': 'Use egg whites for whole eggs, or try chia seed pudding for cereal.',
    'Mexican': 'Lettuce wraps for tortillas, Greek yogurt for sour cream, or salsa for creamy sauces.',
    'British': 'Baked sweet potato for chips, or grilled fish instead of fried.'
  };
  return substitutions[category] || 'Consider healthier alternatives like whole grains, lean proteins, and extra vegetables.';
};