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

      <style>{`
        .cp-loading-container {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100vw;
          height: 100vh;
          background: #F8FAFC;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 99999;
          font-family: var(--font-sans, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
        }

        .cp-loading-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 32px 40px;
          border-radius: 20px;
          background: #FFFFFF;
          border: 1px solid rgba(226, 232, 240, 0.8);
          box-shadow: 0 20px 40px -15px rgba(15, 23, 42, 0.08), 0 0 1px 1px rgba(226, 232, 240, 0.6);
          animation: cpFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          max-width: 360px;
          width: 90%;
        }

        .cp-loading-logo-wrap {
          position: relative;
          width: 68px;
          height: 68px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 18px;
        }

        .cp-loading-pulse-ring {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 20px;
          background: linear-gradient(135deg, rgba(56, 189, 248, 0.35), rgba(99, 102, 241, 0.35));
          animation: cpPulse 2s ease-in-out infinite;
        }

        .cp-loading-logo-box {
          position: relative;
          width: 56px;
          height: 56px;
          border-radius: 16px;
          background: linear-gradient(135deg, #0284C7 0%, #2563EB 50%, #4F46E5 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 20px -5px rgba(37, 99, 235, 0.45);
          color: #FFFFFF;
        }

        .cp-loading-sparkle {
          animation: cpSparkle 1.8s ease-in-out infinite;
        }

        .cp-loading-brand {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 16px;
        }

        .cp-loading-brand-name {
          font-size: 20px;
          font-weight: 700;
          color: #0F172A;
          letter-spacing: -0.02em;
        }

        .cp-loading-brand-badge {
          font-size: 11px;
          font-weight: 800;
          padding: 2px 7px;
          border-radius: 6px;
          background: linear-gradient(135deg, #0284C7, #4F46E5);
          color: #FFFFFF;
          letter-spacing: 0.05em;
        }

        .cp-loading-track {
          width: 140px;
          height: 4px;
          background: #E2E8F0;
          border-radius: 99px;
          overflow: hidden;
          position: relative;
          margin-bottom: 14px;
        }

        .cp-loading-bar {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: 45%;
          background: linear-gradient(90deg, #0284C7, #4F46E5);
          border-radius: 99px;
          animation: cpBarSlide 1.4s ease-in-out infinite;
        }

        .cp-loading-text {
          font-size: 13px;
          font-weight: 500;
          color: #64748B;
          margin: 0;
          letter-spacing: -0.01em;
        }

        @keyframes cpPulse {
          0%, 100% {
            transform: scale(0.95);
            opacity: 0.4;
          }
          50% {
            transform: scale(1.15);
            opacity: 0.8;
          }
        }

        @keyframes cpSparkle {
          0%, 100% {
            transform: rotate(0deg) scale(1);
          }
          50% {
            transform: rotate(15deg) scale(1.1);
          }
        }

        @keyframes cpBarSlide {
          0% {
            left: -45%;
          }
          50% {
            left: 35%;
            width: 60%;
          }
          100% {
            left: 100%;
            width: 45%;
          }
        }

        @keyframes cpFadeIn {
          from {
            opacity: 0;
            transform: scale(0.96) translateY(6px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
