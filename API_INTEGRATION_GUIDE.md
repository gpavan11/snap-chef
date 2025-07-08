# API Integration Guide for Snap Chef

This guide will help you integrate your Snap Chef application with real APIs for food detection and recipe suggestions using API keys.

## Overview

The application now supports integration with multiple AI services:
- **OpenAI** (Primary): Advanced AI for food detection and recipe generation
- **Clarifai** (Backup): AI-powered food detection from images  
- **Spoonacular** (Backup): Recipe search and detailed recipe information

**OpenAI is the recommended choice** for the best food detection accuracy and most creative recipe suggestions.

## Quick Setup

### 1. Environment Configuration

Copy the example environment file:
```bash
cp .env.example .env
```

### 2. Get Your API Keys

#### OpenAI API Key (Recommended - Primary)
1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign up for an account
3. Create a new API key
4. Copy the key to your `.env` file:
   ```
   VITE_OPENAI_API_KEY=your_actual_api_key_here
   ```

#### Optional Backup Services

**Clarifai API Key (Food Detection Backup)**
1. Visit [Clarifai.com](https://clarifai.com/)
2. Sign up for a free account
3. Go to your [API Keys page](https://clarifai.com/settings/security)
4. Create a new API key
5. Copy the key to your `.env` file:
   ```
   VITE_CLARIFAI_API_KEY=your_actual_api_key_here
   ```

**Spoonacular API Key (Recipe Search Backup)**
1. Visit [Spoonacular Food API](https://spoonacular.com/food-api)
2. Sign up for a free account (150 requests/day free tier)
3. Go to your [Profile page](https://spoonacular.com/food-api/console#Profile)
4. Copy your API key to your `.env` file:
   ```
   VITE_SPOONACULAR_API_KEY=your_actual_api_key_here
   ```

### 3. Restart the Development Server

```bash
npm run dev
```

## API Features

### OpenAI (Primary AI Service)
- **Advanced food recognition** using GPT-4 Vision for unmatched accuracy
- **Creative recipe generation** tailored to detected ingredients
- **Intelligent categorization** and confidence scoring
- **Dynamic ingredient extraction** from visual analysis
- **Contextual cooking instructions** written in natural language
- **Realistic nutrition calculations** based on ingredients and portions

### Clarifai (Backup Food Detection)
- **Real-time food recognition** from uploaded images
- **Confidence scores** for detection accuracy
- **Category classification** (Healthy, Protein, Italian, etc.)
- **Ingredient extraction** from detected food items

### Spoonacular (Backup Recipe Search)
- **Recipe suggestions** based on detected ingredients
- **Detailed nutrition information** (calories, protein, carbs, fat)
- **Step-by-step cooking instructions**
- **Difficulty ratings** and cooking times
- **Source URLs** for complete recipes

## Fallback Behavior

The application gracefully handles missing API keys:
- **No Clarifai key**: Uses mock food detection with realistic results
- **No Spoonacular key**: Falls back to curated mock recipes
- **API errors**: Automatically switches to demo mode with user notification

## API Usage Limits

### OpenAI Pricing
- **Pay-per-use** model (no free tier)
- **GPT-4o-mini**: ~$0.003 per food detection + ~$0.02 per recipe generation
- **Very cost-effective**: Typically $0.02-0.05 per complete analysis
- **High quality**: Best accuracy and most creative recipes

### Clarifai Free Tier
- **1,000 operations/month** free
- Additional usage: $0.20 per 1,000 operations

### Spoonacular Free Tier
- **150 requests/day** free
- Additional usage: Various paid plans available

## Development Notes

### API Service Architecture

The API integration is built with a modular service architecture:

```typescript
// Main service coordinator
foodApiService.analyzeFood(imageBase64)  // Food detection
foodApiService.getRecipes(detectedFood)  // Recipe search
foodApiService.isConfigured()            // Check API status
```

### Error Handling

- **Network errors**: Automatic fallback to mock data
- **Rate limiting**: Graceful degradation with user notification  
- **Invalid API keys**: Clear error messages with setup instructions

### Image Processing

Images are automatically:
- **Converted to base64** for API transmission
- **Validated** for proper format and size
- **Optimized** for API requirements

## Testing Your Integration

1. **Upload a food image** - Any food photo will work
2. **Check the console** - Look for API calls and responses
3. **Verify detection** - Real APIs provide more accurate results
4. **Test recipes** - API recipes include actual cooking instructions

## Troubleshooting

### Common Issues

**"Using Demo Mode" notification**
- Check that your `.env` file exists in the project root
- Verify your OpenAI API key is correctly formatted (starts with sk-proj-)
- Ensure no extra spaces in the API key
- Restart the development server after adding keys

**API Error responses**
- Verify your API keys are active and valid
- Check if you've exceeded rate limits
- Ensure your internet connection is stable

**No recipes found**
- Spoonacular may not have recipes for very specific ingredients
- The fallback system will provide mock recipes as backup

### Debug Mode

Add this to your `.env` for additional logging:
```
VITE_DEBUG_API=true
```

## Cost Optimization

### Tips to minimize API usage:
1. **Test with the same images** during development
2. **Use mock mode** for UI development
3. **Implement caching** for production usage
4. **Monitor your usage** on API provider dashboards

## Security Best Practices

1. **Never commit your `.env` file** to version control
2. **Use different API keys** for development and production
3. **Rotate keys regularly** if you suspect they're compromised
4. **Monitor usage** for unexpected spikes

## Next Steps

Once your APIs are integrated, you can:
- **Add more food categories** to improve detection accuracy
- **Implement user preferences** for recipe filtering
- **Add recipe saving** with a backend database
- **Integrate with meal planning** features

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify API key formatting in your `.env` file
3. Test API keys directly on provider websites
4. Review the API provider documentation for updates

---

Your Snap Chef application is now ready for real-world food detection and recipe discovery! 🍳👨‍🍳