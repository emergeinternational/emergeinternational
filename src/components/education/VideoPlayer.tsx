
import React from "react";
import { useVideoEmbed } from "@/hooks/useVideoEmbed";

interface VideoPlayerProps {
  videoUrl?: string;
}

const VideoPlayer = ({ videoUrl }: VideoPlayerProps) => {
  console.log("VideoPlayer component rendering", { videoUrl });
  
  const { embedUrl, isLoading, error } = useVideoEmbed(videoUrl);
  
  // Use the provided URL or fall back to a known working video
  const safeEmbedUrl = embedUrl || "https://www.youtube.com/embed/LXb3EKWsInQ";
  
  if (isLoading) {
    return (
      <div className="w-full max-w-720px mx-auto h-64 flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">Loading video...</p>
      </div>
    );
  }
  
  if (error) {
    console.warn("Video error:", error);
  }
  
  return (
    <div style={{ width: "100%", maxWidth: "720px", margin: "0 auto" }}>
      <iframe
        width="100%"
        height="400"
        src={safeEmbedUrl}
        title="Course Video"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
      />
      {error && (
        <p className="text-amber-600 text-sm mt-2 p-2 bg-amber-50 rounded">
          Note: Using a fallback video. Original video source was unavailable.
        </p>
      )}
    </div>
  );
};

export default VideoPlayer;
