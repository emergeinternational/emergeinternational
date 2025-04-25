
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
          src={source}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full rounded"
          title={title}
        />
      </AspectRatio>
    </div>
  );
};

export default VideoPlayer;
