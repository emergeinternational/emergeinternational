
import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

interface VideoPlayerProps {
  videoId?: string;
  source?: string;
  title?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoId, source, title = "Video content" }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [embedId, setEmbedId] = useState<string | null>(videoId || null);
  
  useEffect(() => {
    // Extract video ID from URL if not directly provided
    if (!embedId && source) {
      try {
        const extractedId = extractYouTubeId(source);
        setEmbedId(extractedId);
        setHasError(!extractedId);
      } catch (error) {
        console.error("Error processing video source:", error);
        setHasError(true);
      }
    }
  }, [videoId, source, embedId]);

  const extractYouTubeId = (url: string): string | null => {
    // Handle youtu.be short URLs
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1]?.split(/[?&#]/)[0];
      return id || null;
    }
    
    // Handle youtube.com/watch?v= URLs
    if (url.includes('youtube.com/watch')) {
      const urlParams = new URLSearchParams(url.split('?')[1]);
      return urlParams.get('v');
    }
    
    // Handle youtube.com/embed/ URLs
    if (url.includes('youtube.com/embed/')) {
      const id = url.split('youtube.com/embed/')[1]?.split(/[?&#]/)[0];
      return id || null;
    }
    
    return null;
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  if (!embedId || hasError) {
    return (
      <div className="bg-gray-100 p-8 mb-6 rounded flex flex-col items-center justify-center text-center min-h-[250px]">
        <AlertCircle className="h-10 w-10 text-amber-500 mb-4" />
        <p className="text-gray-700 font-medium">
          This video is currently unavailable. Please check back soon for updated content.
        </p>
        <p className="text-gray-500 text-sm mt-2">
          {source ? "The video may have been removed or restricted by the publisher." : "No video source provided."}
        </p>
      </div>
    );
  }
  
  return (
    <div className="aspect-w-16 aspect-h-9 mb-6 relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-pulse text-emerge-gold">Loading video...</div>
        </div>
      )}
      <iframe
        src={`https://www.youtube.com/embed/${embedId}`}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="w-full h-full rounded"
        title={title}
        onLoad={handleIframeLoad}
        onError={handleIframeError}
      ></iframe>
    </div>
  );
};

export default VideoPlayer;
