
import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { getSafeVideoEmbedUrl } from '@/services/education/simpleCourseService';

interface VideoPlayerProps {
  videoId?: string;
  source?: string;
  title?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoId, source, title = "Video content" }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  
  // Get safe embed URL from our utility function
  const embedUrl = getSafeVideoEmbedUrl(source);

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  if (!embedUrl || hasError) {
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
        src={embedUrl}
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
