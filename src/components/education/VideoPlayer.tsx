
import React from 'react';
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface VideoPlayerProps {
  videoId?: string;
  source?: string;
  title?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  source = "https://www.youtube.com/embed/4p-4fmb8dDQ", 
  title = "Video content" 
}) => {
  return (
    <div className="mb-6">
      <AspectRatio ratio={16 / 9}>
        <iframe
          width="100%"
          height="100%"
          src={source}
          title={title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
          className="w-full h-full rounded"
        />
      </AspectRatio>
    </div>
  );
};

export default VideoPlayer;
