import React from 'react';
import { Sparkles } from 'lucide-react';

/**
 * Minimalist, ultra-clean fullscreen loading screen for CommercePilot AI
 * Centered professional logo with smooth spinning animation — zero text or clutter.
 */
const LoadingScreen = () => {
  return (
    <div className="cp-loading-container" role="status" aria-label="Loading">
      <div className="cp-spinning-loader">
        <div className="cp-spinning-logo">
          <Sparkles size={28} className="cp-spinning-icon" />
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
