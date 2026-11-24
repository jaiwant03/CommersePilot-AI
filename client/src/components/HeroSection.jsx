import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AnimatedCounter from './AnimatedCounter';
import { 
  Sparkles, 
  Check, 
  Mail, 
  ArrowRight, 
  ThumbsUp, 
  ThumbsDown, 
  Send,
  Bot
} from 'lucide-react';

const HeroSection = () => {
  const [email, setEmail] = useState('');

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (email) {
      window.location.href = `/signup?email=${encodeURIComponent(email)}`;
    }
  };

  return (
    <section id="home" className="home-hero-section">
      <div className="home-hero-canvas">
        
        {/* Soft Background Curves & Horizon Lighting */}
        <div className="hero-ambient-glow-center" />
        <div className="hero-ambient-glow-right" />
        <div className="hero-blueprint-grid" />

        {/* Main Two-Column Hero Content Grid */}
        <div className="home-hero-grid">
          
          {/* ========================================================= */}
          {/* LEFT COLUMN: Brand Tag, Title, Subtitle, Bullets & CTA    */}
          {/* ========================================================= */}
          <div className="home-hero-left">
            
            {/* Tag Pill: AI-Powered Commerce Autopilot */}
            <div className="hero-tag-capsule">
              <Sparkles size={14} className="hero-tag-sparkle-icon" />
              <span>AI-Powered Commerce Autopilot</span>
            </div>

            {/* Main Rhyming Headline with Stylized Cyan Glowing Wave under "AI" */}
            <h1 className="home-hero-title">
              Sell Without Stress. <br />
              Scale With Success <br />
              with <span className="title-ai-wrapper">
                AI
                <svg className="title-ai-wave" viewBox="0 0 130 26" fill="none" aria-hidden="true">
                  <path d="M4 18 C30 22, 58 6, 84 13 C104 18, 118 4, 126 2 C124 7, 112 16, 94 18 C70 21, 48 25, 4 18 Z" fill="url(#waveGlowGrad)"/>
                  <path d="M2 17 C28 21, 56 6, 82 12 C102 17, 116 3, 128 1" stroke="#38BDF8" strokeWidth="2.8" strokeLinecap="round"/>
                  <defs>
                    <linearGradient id="waveGlowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.85"/>
                      <stop offset="50%" stopColor="#0284C7" stopOpacity="0.75"/>
                      <stop offset="100%" stopColor="#38BDF8" stopOpacity="0"/>
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </h1>

            {/* Subtitle */}
            <p className="home-hero-subtitle">
              Prevent risky returns before they ship, predict stockouts before they slip, and recover every lost order on intelligent autopilot.
            </p>

            {/* 2x2 Feature Checkmarks Grid */}
            <div className="hero-feature-bullets-grid">
              <div className="hero-bullet-point">
                <div className="bullet-check-circle">
                  <Check size={11} strokeWidth={3.5} />
                </div>
                <span>Smart Order Verification</span>
              </div>
              <div className="hero-bullet-point">
                <div className="bullet-check-circle">
                  <Check size={11} strokeWidth={3.5} />
                </div>
                <span>Delivery Recovery</span>
              </div>
              <div className="hero-bullet-point">
                <div className="bullet-check-circle">
                  <Check size={11} strokeWidth={3.5} />
                </div>
                <span>Predictive Inventory</span>
              </div>
              <div className="hero-bullet-point">
                <div className="bullet-check-circle">
                  <Check size={11} strokeWidth={3.5} />
                </div>
                <span>Business Intelligence</span>
              </div>
            </div>

            {/* Email CTA Pill Bar */}
            <form onSubmit={handleFormSubmit} className="hero-pill-email-form">
              <div className="hero-email-icon-wrapper">
                <Mail size={18} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="hero-email-input-field"
                aria-label="Your work email address"
                required
              />
              <button type="submit" className="hero-btn-get-started">
                <span>Get Started</span>
                <ArrowRight size={15} />
              </button>
            </form>

            {/* Micro-Trust Indicator Note */}
            <div className="hero-trust-note">
              <div className="trust-check-badge">
                <Check size={10} strokeWidth={3.5} />
              </div>
              <span>30 day free trial, no credit card required</span>
            </div>

          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: 3D Scene (White Phone, Shopping Cart, Cards) */}
          {/* ========================================================= */}
          <div className="home-hero-right">
            
            {/* 3D Ascending Purple Growth Arrow (Positioned directly behind phone) */}
            <div className="hero-3d-arrow-container" aria-hidden="true">
              <img 
                src="/assets/images/3d-growth-arrow.svg" 
                alt="3D Ecommerce Growth Trend" 
                className="hero-3d-arrow-img"
              />
            </div>

            {/* Top Floating White Badge: #1 Best Website */}
            <div className="hero-floating-card-top-left">
              <div className="badge-trophy-icon">🏆</div>
              <div className="badge-top-left-content">
                <div className="badge-num-title">#1</div>
                <div className="badge-num-desc">Best website using AI for E-Commerce</div>
              </div>

              {/* Curved Blue Connecting Arrow pointing to Phone */}
              <svg className="badge-connector-curve" viewBox="0 0 60 40" fill="none">
                <path 
                  d="M 6 4 Q 38 4 52 28" 
                  stroke="#38BDF8" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeDasharray="4 3"
                />
                <path d="M 47 22 L 53 29 L 45 30" fill="none" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>

            {/* Middle Left Floating Dark Badge: Sales Growth +125% */}
            <div className="hero-floating-dark-sales-card">
              <div className="dark-sales-top-row">
                <span className="dark-sales-label">Sales Growth</span>
              </div>
              <div className="dark-sales-stat-row">
                <div className="dark-sales-number-col">
                  <span className="dark-sales-percentage"><AnimatedCounter value={125} prefix="+" suffix="%" /></span>
                  <span className="dark-sales-subtext">vs last month</span>
                </div>
                {/* Glowing Cyan/Blue Vertical Bar Chart */}
                <div className="dark-sales-chart-bars">
                  <div className="chart-bar bar-1" />
                  <div className="chart-bar bar-2" />
                  <div className="chart-bar bar-3" />
                  <div className="chart-bar bar-4" />
                </div>
              </div>
            </div>

            {/* Floor Miniature 3D Wire Shopping Cart with Purple & Blue Bags */}
            <div className="hero-3d-shopping-cart-wrapper" aria-hidden="true">
              <img 
                src="/assets/images/3d-shopping-cart.svg" 
                alt="3D Wire Shopping Cart with Gift Bags" 
                className="hero-3d-cart-img"
              />
            </div>

            {/* Central Modern Smartphone Mockup with PURE WHITE CHAT THEME */}
            <div className="hero-phone-mockup-frame">
              <div className="hero-phone-glass-screen">
                
                {/* Phone Status Bar */}
                <div className="phone-screen-top-bar">
                  <span className="phone-clock">9:41</span>
                  <div className="phone-dynamic-island" />
                  <div className="phone-status-icons">
                    <span className="status-sig">●●●</span>
                    <span className="status-wifi">5G</span>
                    <span className="status-battery">100%</span>
                  </div>
                </div>

                {/* Phone App Navigation Header */}
                <div className="phone-app-header">
                  <div className="phone-app-brand">
                    <div className="phone-app-logo-box">
                      <Sparkles size={12} />
                    </div>
                    <div>
                      <div className="phone-app-name">CommercePilot AI</div>
                      <div className="phone-app-online-status">
                        <span className="online-green-dot" />
                        <span>Online</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Phone Chat Conversation Stream (Light / Pure White Theme) */}
                <div className="phone-chat-scroll-area">
                  
                  {/* Message 1: AI Greeting */}
                  <div className="phone-msg-row ai-msg-row">
                    <div className="phone-chat-avatar-squircle">
                      <Sparkles size={11} />
                    </div>
                    <div className="phone-msg-bubble ai-bubble">
                      Hi, Welcome to CommercePilot AI. How can I help?
                    </div>
                    <div className="phone-user-avatar-circle">
                      <img 
                        src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=80&q=80" 
                        alt="Customer Avatar"
                      />
                    </div>
                  </div>

                  {/* Message 2: Customer Query */}
                  <div className="phone-msg-row user-msg-row">
                    <div className="phone-chat-avatar-squircle user-squircle">
                      <Sparkles size={11} />
                    </div>
                    <div className="phone-msg-bubble user-bubble">
                      Hi! I need help with order verification &amp; stockout risk.
                    </div>
                  </div>

                  {/* Message 3: AI Operational Intelligence & PO Action */}
                  <div className="phone-msg-row ai-msg-row full-width">
                    <div className="phone-chat-avatar-squircle">
                      <Sparkles size={11} />
                    </div>
                    <div className="phone-msg-bubble ai-bubble po-recommendation">
                      Sure! I'd be happy to assist. 3 COD orders verified, and Chennai's large runway is 3.2 days. Would you like me to approve PO #2009?
                      
                      {/* Thumbs Up / Down Action Bar */}
                      <div className="phone-chat-feedback-actions">
                        <button type="button" className="chat-feedback-btn" aria-label="Helpful recommendation">
                          <ThumbsUp size={11} />
                        </button>
                        <button type="button" className="chat-feedback-btn" aria-label="Not helpful">
                          <ThumbsDown size={11} />
                        </button>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Bottom Message Input Bar */}
                <div className="phone-chat-input-bar">
                  <div className="phone-chat-input-box">
                    <span>Type a message...</span>
                    <button type="button" className="phone-send-pill-btn" aria-label="Send message">
                      <Send size={11} />
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* Right Floating White Badge: 100K+ Happy Customers */}
            <div className="hero-floating-card-right-users">
              <div className="avatar-overlap-stack">
                <img 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=64&q=80" 
                  alt="Customer 1" 
                  className="stack-avatar" 
                />
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=64&q=80" 
                  alt="Customer 2" 
                  className="stack-avatar" 
                />
                <img 
                  src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=64&q=80" 
                  alt="Customer 3" 
                  className="stack-avatar" 
                />
                <img 
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=64&q=80" 
                  alt="Customer 4" 
                  className="stack-avatar" 
                />
              </div>
              <div className="users-stat-number">100K+</div>
              <div className="users-stat-subtext">Happy Customers</div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

export default HeroSection;
