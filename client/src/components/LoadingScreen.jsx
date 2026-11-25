import React from 'react';
import { Sparkles } from 'lucide-react';

/**
 * Premium fullscreen loading splash screen for CommercePilot AI
 * Centered professional branding with smooth pulsing glow
 */
const LoadingScreen = ({ message = 'Initializing autonomous workspace...' }) => {
  return (
    <div className="cp-loading-container" role="status" aria-label="Loading CommercePilot AI">
      <div className="cp-loading-card">
        {/* Glowing Logo Icon */}
        <div className="cp-loading-logo-wrap">
          <div className="cp-loading-pulse-ring" />
          <div className="cp-loading-logo-box">
            <Sparkles size={28} className="cp-loading-sparkle" />
          </div>
        </div>

        {/* Brand Name */}
        <div className="cp-loading-brand">
          <span className="cp-loading-brand-name">CommercePilot</span>
          <span className="cp-loading-brand-badge">AI</span>
        </div>

        {/* Animated Progress Track */}
        <div className="cp-loading-track">
          <div className="cp-loading-bar" />
        </div>

        {/* Status Message */}
        <p className="cp-loading-text">{message}</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
