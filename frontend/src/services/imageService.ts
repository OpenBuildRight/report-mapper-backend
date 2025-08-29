import { useAuth } from '../auth/useAuth';

export interface ImageUrlOptions {
  imageId: string;
  thumbnail?: boolean;
  isPublished?: boolean;
}

/**
 * Service for handling image URLs based on publication status and authentication
 */
class ImageUrlService {
  /**
   * Get the appropriate image URL based on publication status
   * @param imageId - The image ID
   * @param thumbnail - Whether to get thumbnail or full image
   * @param isPublished - Whether the image is part of a published observation
   * @returns The appropriate image URL
   */
  static getImageUrl(imageId: string, thumbnail: boolean = true, isPublished: boolean = false): string {
    const baseUrl = process.env.REACT_APP_API_BASE_URL || '';
    
    if (isPublished) {
      // Published images are publicly accessible
      return `${baseUrl}/api/image/published/${thumbnail ? 'thumbnail-' : ''}${imageId}`;
    } else {
      // Draft images require authentication - use smart endpoint
      return `${baseUrl}/api/image/download/${thumbnail ? 'thumbnail-' : ''}${imageId}`;
    }
  }

  /**
   * Get image URL with authentication headers
   * This is used for draft images that require authentication
   */
  static async getAuthenticatedImageUrl(
    imageId: string, 
    thumbnail: boolean = true, 
    isPublished: boolean = false
  ): Promise<string> {
    if (isPublished) {
      // Published images don't need authentication
      return this.getImageUrl(imageId, thumbnail, true);
    }

    // For draft images, we need to include authentication
    const baseUrl = process.env.REACT_APP_API_BASE_URL || '';
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      throw new Error('Authentication required for draft images');
    }

    // Use smart endpoint that handles authentication automatically
    return `${baseUrl}/api/image/download/${thumbnail ? 'thumbnail-' : ''}${imageId}`;
  }
}

/**
 * Hook for getting image URLs with authentication context
 */
export const useImageUrl = () => {
  const { isAuthenticated } = useAuth();

  const getImageUrl = (imageId: string, thumbnail: boolean = true, isPublished: boolean = false): string => {
    if (isPublished) {
      // Published images are always accessible
      return ImageUrlService.getImageUrl(imageId, thumbnail, true);
    }

    if (!isAuthenticated) {
      // If not authenticated, we can't access draft images
      // Return a placeholder or throw an error
      throw new Error('Authentication required for draft images');
    }

    // Use smart endpoint that handles authentication automatically
    return ImageUrlService.getImageUrl(imageId, thumbnail, false);
  };

  const getImageUrlWithAuth = async (
    imageId: string, 
    thumbnail: boolean = true, 
    isPublished: boolean = false
  ): Promise<string> => {
    return ImageUrlService.getAuthenticatedImageUrl(imageId, thumbnail, isPublished);
  };

  return {
    getImageUrl,
    getImageUrlWithAuth,
    isAuthenticated
  };
};

export default ImageUrlService;
