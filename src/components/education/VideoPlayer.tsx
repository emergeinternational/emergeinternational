
import React from "react";

const VideoPlayer = () => {
  return (
    <div style={{ width: "100%", maxWidth: "720px", margin: "0 auto" }}>
      <iframe
        width="100%"
        height="400"
        src="https://www.youtube.com/embed/4p-4fmb8dDQ"
        title="Guaranteed Working Test Video"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
      />
    </div>
  );
};

export default VideoPlayer;
