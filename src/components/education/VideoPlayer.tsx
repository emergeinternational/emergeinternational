
import React from 'react';
import { Clock } from "lucide-react";

interface VideoPlayerProps {
  videoId: string;
  source: string;
}

const VideoPlayer = ({ videoId, source }: VideoPlayerProps) => {
  // Example duration - in a real app, this would come from an API
  const videoDuration = "8 minutes 30 seconds";
  
  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-medium">Watch Lesson</h2>
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="mr-2 h-4 w-4 text-emerge-gold" />
          <span>Duration: {videoDuration}</span>
        </div>
      </div>
      <div className="aspect-video w-full">
        <iframe 
          width="100%" 
          height="100%" 
          src={`https://www.youtube.com/embed/${videoId}`}
          title="Video Lesson" 
          frameBorder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
};

export default VideoPlayer;
