// Image Generation Related Interfaces

export interface GenerationTemplate {
  id: string;
  categorySlug: string;
  categoryName: string;
  basePrompt: string;
  placeholders: string[];
  suggestedPoses: string[];
}

export interface ImageGenerationRequest {
  userImage: File;
  productId: string | number;
  category: string | number | null;
  style?: string;
  customerImageUrl?: string;
  productImageUrl?: string;
  categoryTemplate?: GenerationTemplate;
  customPrompt?: string;
}

export interface ImageGenerationResponse {
  id: string;
  imageUrl: string;
  generatedImageUrl?: string;
  originalCustomerImage?: string;
  originalProductImage?: string;
  prompt?: string;
  categoryTemplate?: GenerationTemplate;
  status: 'processing' | 'completed' | 'failed';
  createdAt: string;
  processingTime?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message: string;
  error?: string;
}