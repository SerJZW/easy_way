import React, { useEffect, useState } from "react";

const LoadingScreen = ({ onLoaded }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
      onLoaded();
    }, 1000);
  }, [onLoaded]);

  if (!isLoading) return null;

  return (
    <div className="loading-container">
      <div className="loader"></div>
    </div>
  );
};

export default LoadingScreen;
