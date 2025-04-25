
import React, { useState } from 'react';
import { AspectRatio } from "@/components/ui/aspect-ratio";

export const TestVideo = () => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="bg-gray-100 p-8 rounded text-center">
        <p>This video is currently unavailable. Please check back later or try a different lesson.</p>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <AspectRatio ratio={16 / 9}>
        <iframe
          className="w-full h-full rounded"
          src="https://www.youtube.com/embed/4p-4fmb8dDQ"
          title="Test Video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onError={() => setHasError(true)}
        />
      </AspectRatio>
    </div>
  );
};

export default TestVideo;
