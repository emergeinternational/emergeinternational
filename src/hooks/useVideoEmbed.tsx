
import { useState, useEffect } from 'react';
import { validateYoutubeUrl, formatYoutubeEmbedUrl } from '@/services/education/videoValidator';

interface UseVideoEmbedOptions {
  onError?: (error: string) => void;
  onSuccess?: () => void;
}

interface UseVideoEmbedReturn {
  embedUrl: string | null;
  isValid: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * A hook to handle video embedding with validation and error handling
 */
export const useVideoEmbed = (
  sourceUrl: string | undefined, 
  options?: UseVideoEmbedOptions
): UseVideoEmbedReturn => {
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [isValid, setIsValid] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!sourceUrl) {
      setIsLoading(false);
      setError('No video URL provided');
      options?.onError?.('No video URL provided');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Validate the URL format
      const valid = validateYoutubeUrl(sourceUrl);
      setIsValid(valid);
      
      if (valid) {
        // Format the URL for embedding
        const formatted = formatYoutubeEmbedUrl(sourceUrl);
        setEmbedUrl(formatted);
        
        if (formatted) {
          options?.onSuccess?.();
        } else {
          setError('Unable to format video URL');
          options?.onError?.('Unable to format video URL');
        }
      } else {
        setError('Invalid video URL format');
        options?.onError?.('Invalid video URL format');
      }
    } catch (err) {
      console.error('Error processing video URL:', err);
      setError('Error processing video URL');
      options?.onError?.('Error processing video URL');
    } finally {
      setIsLoading(false);
    }
  }, [sourceUrl, options]);
  
  return {
    embedUrl,
    isValid,
    isLoading,
    error
  };
};

export default useVideoEmbed;
