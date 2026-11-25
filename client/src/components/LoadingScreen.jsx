import React from 'react';

/**
 * Minimal fullscreen loading indicator.
 */
const LoadingScreen = () => {
  return (
    <div className="cp-loading-container" role="status" aria-label="Loading">
      <span className="cp-loading-spinner" aria-hidden="true" />
    </div>
  );
};

export default LoadingScreen;
