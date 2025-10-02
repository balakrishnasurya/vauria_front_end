import { 
  type ImageGenerationRequest, 
  type ImageGenerationResponse, 
  type GenerationTemplate,
  type ApiResponse
} from '@/data/mockData';

class ImageGenerationService {
  private apiKey = 'YOUR_GEMINI_API_KEY_HERE';
  private model = 'gemini-2.5-flash-image-preview';

  /**
   * Generate image using Gemini Imagen API
   * This is a mock implementation for demonstration
   */
  async generateImage(request: ImageGenerationRequest): Promise<ApiResponse<ImageGenerationResponse>> {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Mock response - in real implementation, this would call the actual Gemini API
      const mockResponse: ImageGenerationResponse = {
        id: `gen_${Date.now()}`,
        generatedImageUrl: `https://picsum.photos/512/512?random=${Date.now()}`,
        originalCustomerImage: request.customerImageUrl,
        originalProductImage: request.productImageUrl,
        prompt: this.buildPrompt(request),
        categoryTemplate: request.categoryTemplate,
        status: 'completed',
        createdAt: new Date().toISOString(),
        processingTime: 2800
      };

      return {
        success: true,
        data: mockResponse,
        message: 'Image generated successfully'
      };

    } catch (error) {
      console.error('Image generation failed:', error);
      return {
        success: false,
        message: 'Failed to generate image. Please try again.',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get generation templates for different jewelry categories
   */
  async getGenerationTemplates(): Promise<ApiResponse<GenerationTemplate[]>> {
    try {
      // Mock data - in real implementation, this might come from a database
      const templates: GenerationTemplate[] = [
        {
          id: 'ring_template',
          categorySlug: 'rings',
          categoryName: 'Rings',
          basePrompt: 'Create a professional jewelry photo. Take the ring from the first image and show it being worn by the person from the second image. Generate a realistic, elegant shot of the person wearing the ring, with proper lighting and shadows. The photo should have a luxury jewelry aesthetic with a clean background.',
          placeholders: ['ring', 'person'],
          suggestedPoses: ['hand extended showing ring', 'elegant hand pose', 'close-up of hand with ring']
        },
        {
          id: 'necklace_template',
          categorySlug: 'necklaces',
          categoryName: 'Necklaces',
          basePrompt: 'Create a professional jewelry photo. Take the necklace from the first image and show it being worn by the person from the second image. Generate a realistic, elegant portrait of the person wearing the necklace, with proper lighting that highlights both the jewelry and the person. The photo should have a luxury jewelry aesthetic.',
          placeholders: ['necklace', 'person'],
          suggestedPoses: ['elegant portrait pose', 'three-quarter view', 'profile showing necklace']
        },
        {
          id: 'earrings_template',
          categorySlug: 'earrings',
          categoryName: 'Earrings',
          basePrompt: 'Create a professional jewelry photo. Take the earrings from the first image and show them being worn by the person from the second image. Generate a realistic, elegant portrait of the person wearing the earrings, with proper lighting that showcases the jewelry. The photo should have a luxury jewelry aesthetic with focus on the face and earrings.',
          placeholders: ['earrings', 'person'],
          suggestedPoses: ['elegant profile pose', 'head turned to show earrings', 'frontal portrait with hair styled to show earrings']
        },
        {
          id: 'bracelet_template',
          categorySlug: 'bracelets',
          categoryName: 'Bracelets',
          basePrompt: 'Create a professional jewelry photo. Take the bracelet from the first image and show it being worn by the person from the second image. Generate a realistic, elegant shot of the person wearing the bracelet, with proper lighting and composition. The photo should have a luxury jewelry aesthetic with focus on the wrist and bracelet.',
          placeholders: ['bracelet', 'person'],
          suggestedPoses: ['elegant hand pose showing wrist', 'arm extended with bracelet visible', 'graceful gesture highlighting bracelet']
        },
        {
          id: 'chain_template',
          categorySlug: 'chains',
          categoryName: 'Chains',
          basePrompt: 'Create a professional jewelry photo. Take the chain from the first image and show it being worn by the person from the second image. Generate a realistic, elegant portrait of the person wearing the chain, with proper lighting that highlights the jewelry\'s details. The photo should have a luxury jewelry aesthetic.',
          placeholders: ['chain', 'person'],
          suggestedPoses: ['elegant portrait pose', 'casual confident pose', 'sophisticated styling shot']
        }
      ];

      return {
        success: true,
        data: templates,
        message: 'Templates retrieved successfully'
      };

    } catch (error) {
      console.error('Failed to get templates:', error);
      return {
        success: false,
        message: 'Failed to load generation templates',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get user's generation history
   */
  async getGenerationHistory(userId?: string): Promise<ApiResponse<ImageGenerationResponse[]>> {
    try {
      // Mock data - in real implementation, this would query user's history
      const mockHistory: ImageGenerationResponse[] = [
        {
          id: 'gen_001',
          generatedImageUrl: 'https://picsum.photos/512/512?random=1',
          originalCustomerImage: 'https://picsum.photos/400/400?random=customer1',
          originalProductImage: 'https://picsum.photos/300/300?random=ring1',
          prompt: 'Professional jewelry photo with elegant ring',
          categoryTemplate: {
            id: 'ring_template',
            categorySlug: 'rings',
            categoryName: 'Rings',
            basePrompt: 'Create a professional jewelry photo...',
            placeholders: ['ring', 'person'],
            suggestedPoses: ['hand extended showing ring']
          },
          status: 'completed',
          createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          processingTime: 2500
        },
        {
          id: 'gen_002',
          generatedImageUrl: 'https://picsum.photos/512/512?random=2',
          originalCustomerImage: 'https://picsum.photos/400/400?random=customer2',
          originalProductImage: 'https://picsum.photos/300/300?random=necklace1',
          prompt: 'Professional jewelry photo with elegant necklace',
          categoryTemplate: {
            id: 'necklace_template',
            categorySlug: 'necklaces',
            categoryName: 'Necklaces',
            basePrompt: 'Create a professional jewelry photo...',
            placeholders: ['necklace', 'person'],
            suggestedPoses: ['elegant portrait pose']
          },
          status: 'completed',
          createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          processingTime: 3200
        }
      ];

      return {
        success: true,
        data: mockHistory,
        message: 'Generation history retrieved successfully'
      };

    } catch (error) {
      console.error('Failed to get generation history:', error);
      return {
        success: false,
        message: 'Failed to load generation history',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Build the prompt for image generation based on category and request
   */
  private buildPrompt(request: ImageGenerationRequest): string {
    const template = request.categoryTemplate;
    let prompt = template.basePrompt;

    // Add specific styling based on category
    const styleAdditions = {
      rings: 'Focus on the hand positioning and ring visibility. Ensure the ring is clearly visible and well-lit.',
      necklaces: 'Ensure the necklace drapes naturally and complements the person\'s neckline.',
      earrings: 'Make sure the earrings are clearly visible and the hair styling showcases them well.',
      bracelets: 'Focus on wrist positioning and ensure the bracelet is prominently displayed.',
      chains: 'Ensure the chain length and positioning look natural and elegant.'
    };

    const categoryKey = template.categorySlug as keyof typeof styleAdditions;
    if (styleAdditions[categoryKey]) {
      prompt += ' ' + styleAdditions[categoryKey];
    }

    prompt += ' The final image should be high-quality, professionally lit, and suitable for e-commerce use. Maintain the luxury aesthetic of the Vauria brand.';

    return prompt;
  }

  /**
   * Convert image file to base64 (for API upload)
   */
  async convertImageToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix to get just the base64 data
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Validate image file before upload
   */
  validateImageFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Please upload a valid image file (JPEG, PNG, or WebP)'
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'Image file size must be less than 10MB'
      };
    }

    return { valid: true };
  }
}

export const imageGenerationService = new ImageGenerationService();
export type { ImageGenerationRequest, ImageGenerationResponse, GenerationTemplate };