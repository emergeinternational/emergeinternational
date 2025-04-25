
import React from "react";

const VideoPlayer = () => {
  console.log("VideoPlayer component rendering");
  
  return (
    <div style={{ width: "100%", maxWidth: "720px", margin: "0 auto" }}>
      <iframe
        width="100%"
        height="400"
        src="https://www.youtube.com/embed/LXb3EKWsInQ"
        title="Guaranteed Working Public YouTube Video"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
      />
    </div>
  );
};

export default VideoPlayer;
