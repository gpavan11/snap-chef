# 🤖 AI Integration Setup Guide

Your Snap Chef app has been successfully integrated with multiple AI services! Here's how to set up and use the new AI features.

## 🔑 API Keys Setup

Create a `.env.local` file in your project root with the following API keys:

```bash
# OpenAI (Primary AI Service) - Get from https://platform.openai.com/api-keys
VITE_OPENAI_API_KEY=your_openai_api_key_here

# Google Cloud Vision API - Get from https://console.cloud.google.com/
VITE_GOOGLE_CLOUD_VISION_API_KEY=your_google_vision_api_key_here

# Hugging Face API - Get from https://huggingface.co/settings/tokens
VITE_HUGGINGFACE_API_KEY=your_huggingface_api_key_here

# Edamam Nutrition API - Get from https://developer.edamam.com/
VITE_EDAMAM_APP_ID=your_edamam_app_id_here
VITE_EDAMAM_APP_KEY=your_edamam_app_key_here
```

## 🚀 AI Features Implemented

### 1. **Computer Vision Food Detection**
- **Primary**: OpenAI GPT-4 Vision for accurate food identification
- **Fallback**: Google Vision API for object/label detection
- **Fallback**: Hugging Face food classification model
- **Final Fallback**: Smart mock detection based on image analysis

### 2. **AI Recipe Generation**
- Uses OpenAI GPT-4 to generate personalized recipes
- Creates recipes based on detected food items
- Includes detailed ingredients, instructions, and cooking times
- Generates realistic Unsplash food photography URLs

### 3. **Nutritional Analysis**
- **Primary**: Edamam API for precise nutritional data
- **Fallback**: Smart estimation based on ingredients
- Provides calories, protein, carbs, fat, fiber, and sugar content

### 4. **Smart Recipe Search**
- AI-powered recipe discovery based on detected food
- Generates similar and complementary recipes
- Uses natural language processing for intelligent matching

### 5. **AI Food Insights** (New Component!)
- Personalized cooking tips and techniques
- Health benefits analysis
- Smart ingredient substitutions
- Category-specific cooking advice

## 🛠️ Technical Implementation

### Service Architecture
```
AIServices/
├── FoodDetectionService     # Computer vision analysis
├── RecipeGenerationService  # LLM-powered recipe creation
├── NutritionalAnalysis     # Nutrition data processing
└── SmartRecipeSearch       # Intelligent recipe discovery
```

### Error Handling & Fallbacks
- Each AI service has multiple fallback options
- Graceful degradation to mock data if all APIs fail
- User-friendly error messages and recovery options
- Offline-capable with cached responses

## 📦 Dependencies Added

```json
{
  "openai": "^4.52.0",
  "axios": "^1.6.0", 
  "@types/uuid": "^9.0.7",
  "uuid": "^9.0.1"
}
```

## 🔧 Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up API keys** (see above section)

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Test AI features**:
   - Upload a food image
   - Watch AI analyze and detect the food
   - Generate personalized recipes
   - Get AI-powered cooking insights

## 🌟 AI Service Options

### Option 1: OpenAI Only (Recommended for beginners)
- Sign up at https://platform.openai.com/
- Add just `VITE_OPENAI_API_KEY` to your `.env.local`
- Handles both vision and text generation

### Option 2: Google Vision + OpenAI
- Best accuracy for food detection
- Add both `VITE_GOOGLE_CLOUD_VISION_API_KEY` and `VITE_OPENAI_API_KEY`

### Option 3: Full AI Stack
- Maximum capabilities with all services
- Best user experience with comprehensive fallbacks
- Add all API keys listed above

## 🎯 Usage Examples

### Basic Usage (Mock Mode)
Even without API keys, the app will work with intelligent mock data that simulates AI responses.

### With OpenAI API Key
```bash
VITE_OPENAI_API_KEY=sk-your-key-here
```
- Real food detection with GPT-4 Vision
- AI-generated recipes
- Smart recipe search

### Production Setup
For production deployment:
1. Use environment variables (not .env files)
2. Implement a backend proxy for API calls
3. Set up rate limiting and caching
4. Monitor API usage and costs

## 🔒 Security Notes

- Never commit `.env.local` files to version control
- Use environment variables in production
- Implement API key rotation
- Monitor API usage to prevent unexpected costs
- Consider using a backend proxy to hide API keys from client

## 🎨 UI Enhancements

The AI integration includes:
- Real-time loading states with animated feedback
- Toast notifications for AI operations
- Error handling with user-friendly messages
- Smart insights panel with categorized tips
- Responsive design for all screen sizes

## 🚀 Next Steps

1. **Add your API keys** to start using real AI features
2. **Customize prompts** in `src/lib/aiServices.ts` for your specific needs
3. **Extend insights** by adding more categories in `AIInsights.tsx`
4. **Add caching** to reduce API calls and improve performance
5. **Implement user accounts** to save preferences and favorite recipes

## 📊 Performance Tips

- API calls are optimized with proper error handling
- Multiple fallback services ensure reliability
- Smart caching can be added to reduce API costs
- Lazy loading prevents unnecessary API calls

## 🆘 Troubleshooting

### Common Issues:
1. **"API key not configured"** - Check your `.env.local` file
2. **CORS errors** - Some APIs require backend proxy in production
3. **Rate limits** - Implement caching and request throttling
4. **TypeScript errors** - Ensure all dependencies are installed

Your AI-powered Snap Chef app is ready to go! 🍽️✨