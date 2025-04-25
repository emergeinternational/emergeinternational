
import React from 'react';

interface VideoPlayerProps {
  videoId: string;
  source?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoId, source }) => {
  // Logic to determine video platform
  const isYoutube = source?.includes('youtube.com') || source?.includes('youtu.be');
  
  if (isYoutube) {
    return (
      <div className="aspect-w-16 aspect-h-9 mb-6">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full rounded"
          title="Video content"
        ></iframe>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-100 p-4 mb-6 rounded">
      <p className="text-gray-500 text-center">
        Video source not supported or unavailable. Please check the link.
      </p>
    </div>
  );
};

export default VideoPlayer;
