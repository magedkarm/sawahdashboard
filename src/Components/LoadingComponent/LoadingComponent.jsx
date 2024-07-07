import React from "react";
import { Circles } from "react-loader-spinner"; // Import the desired spinner

const LoadingComponent = ({ isLoading }) => {
  if (isLoading) return null;

  return (
    <div className="loading-container">
      <Circles height="150" width="150" color="#FF0000" ariaLabel="loading" />
    </div>
  );
};

export default LoadingComponent;
