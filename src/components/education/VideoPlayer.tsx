
import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface VideoPlayerProps {
  videoId?: string;
  source?: string;
  title?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ source, title = "Video content" }) => {
  const [hasError, setHasError] = useState(false);
  
  const isValidYoutubeUrl = (url?: string): boolean => {
    if (!url) return false;
    return url.includes('youtube.com/embed/');
  };

  if (!source || !isValidYoutubeUrl(source) || hasError) {
    return (
      <div className="bg-gray-100 p-8 mb-6 rounded flex flex-col items-center justify-center text-center min-h-[250px]">
        <AlertCircle className="h-10 w-10 text-amber-500 mb-4" />
        <p className="text-gray-700 font-medium">
          This video is currently unavailable. Please check back later or try a different lesson.
        </p>
      </div>
    );
  }
  
  return (
    <div className="mb-6">
      <AspectRatio ratio={16 / 9}>
        <iframe
          src={source}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full rounded"
          title={title}
          onError={() => setHasError(true)}
        />
      </AspectRatio>
    </div>
  );
};

export default VideoPlayer;
