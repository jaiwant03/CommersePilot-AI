import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bot, 
  Sparkles, 
  Clock, 
  DollarSign, 
  Star, 
  PhoneCall, 
  ShieldCheck, 
  ArrowRight,
  TrendingUp,
  Share2,
  ThumbsUp,
  CheckCircle2,
  Users
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
    <section id="home" style={{ width: '100%', padding: '0' }}>
      <div className="modelled-island-container">
        <div className="modelled-hero-island">
          
          {/* Top Half: Two-Column Modelled Hero */}
          <div className="modelled-hero-grid">
            
            {/* Left Column: Heading, Subtitle & Modelled Input Pill */}
            <div className="modelled-hero-left">
              <h1 className="modelled-title">
                E-Commerce <br />
                Revolutionized <br />
                with AI <span className="modelled-ai-icon-pill" aria-label="CommercePilot AI Engine"><Bot size={24} /></span> Powered
              </h1>

              <p className="modelled-subtitle">
                Boost sales, enhance customer experience, and streamline operations with our cutting-edge AI technology.
              </p>

              {/* Modelled Input Group Bar */}
              <form onSubmit={handleFormSubmit} className="modelled-input-group">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="modelled-input-field"
                  aria-label="Your work email address"
                />
                <button type="submit" className="modelled-btn-cta">
                  Get Started
                </button>
              </form>

              {/* Micro-Trust Note */}
              <div className="modelled-micro-trust">
                <span>💳 30 day free trial, no credit card required.</span>
              </div>
            </div>

            {/* Right Column: Smartphone Mockup & Tactile Connected Floating Badges */}
            <div className="modelled-hero-right">
              
              {/* Connector SVG Lines Linking Badges to Phone */}
              <svg className="modelled-connectors-svg" viewBox="0 0 500 520" fill="none">
                {/* Line to Top Badge */}
                <path 
                  d="M 120 75 Q 160 120 200 140" 
                  stroke="#93C5FD" 
                  strokeWidth="1.5" 
                  strokeDasharray="4 3"
                  opacity="0.85"
                />
                {/* Line to Left Dark Card */}
                <path 
                  d="M 155 240 L 195 240" 
                  stroke="#93C5FD" 
                  strokeWidth="1.5" 
                  strokeDasharray="4 3"
                  opacity="0.85"
                />
                {/* Line to Bottom Users Badge */}
                <path 
                  d="M 330 380 Q 345 320 330 280" 
                  stroke="#93C5FD" 
                  strokeWidth="1.5" 
                  strokeDasharray="4 3"
                  opacity="0.85"
                />
              </svg>

              {/* Top Floating Badge (#1 Badge) */}
              <div className="modelled-float-badge-top">
                <div style={{ fontSize: '18px', marginBottom: '2px' }}>🏆 #1</div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#0F172A', lineHeight: 1.3 }}>
                  Best website using AI for E-Commerce
                </div>
              </div>

              {/* Left Floating Dark Card (Time / Wave Graph) */}
              <div className="modelled-float-badge-dark">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#94A3B8', marginBottom: '8px' }}>
                  <Clock size={12} style={{ color: '#38BDF8' }} />
                  <span>Time Increase</span>
                </div>

                {/* Glowing Waveform Chart */}
                <div style={{ margin: '8px 0 10px' }}>
                  <svg width="125" height="36" viewBox="0 0 125 36" fill="none">
                    <path
                      d="M 2 28 Q 30 32 45 16 T 85 8 T 123 26"
                      stroke="#38BDF8"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <circle cx="85" cy="8" r="3.5" fill="#FFFFFF" stroke="#38BDF8" strokeWidth="2" />
                  </svg>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  <span style={{ fontSize: '22px', fontWeight: 800, color: '#FFFFFF', lineHeight: 1 }}>5</span>
                  <span style={{ fontSize: '12px', color: '#94A3B8' }}>second</span>
                </div>
              </div>

              {/* Central Smartphone Device Mockup */}
              <div className="modelled-phone-wrap">
                <div className="modelled-phone-screen">
                  {/* Status Bar */}
                  <div className="modelled-phone-topbar">
                    <span>9:41</span>
                    <div className="modelled-phone-notch"></div>
                    <span>5G 100%</span>
                  </div>

                  {/* App Header */}
                  <div className="modelled-phone-header">
                    <div className="modelled-phone-avatar">
                      <Bot size={13} />
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#FFFFFF' }}>CommercePilot AI</div>
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <div className="modelled-phone-chat">
                    <div style={{ textAlign: 'center', fontSize: '9px', color: '#64748B', margin: '2px 0' }}>
                      Today 9:41 AM
                    </div>

                    <div className="modelled-chat-bubble-ai">
                      Hi, Welcome to CommercePilot AI. How can I help?
                    </div>

                    <div className="modelled-chat-bubble-user">
                      Hi, I need help with order verification & stockout risk.
                    </div>

                    <div className="modelled-chat-bubble-ai">
                      Sure! I'd be happy to assist. 3 COD orders verified, and Chanderi Saree runway is 3.2 days. Would you like me to auto-approve PO #2009?
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', color: '#64748B' }}>
                        <ThumbsUp size={11} />
                        <Share2 size={11} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Right Floating Badge (100K+ Satisfied Users) */}
              <div className="modelled-float-badge-users">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '-6px', marginBottom: '6px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#FDE047', border: '2px solid #FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>👩</div>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#93C5FD', border: '2px solid #FFFFFF', marginLeft: '-6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>👨</div>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#86EFAC', border: '2px solid #FFFFFF', marginLeft: '-6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>🧑</div>
                </div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>100K+</div>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748B', letterSpacing: '0.04em' }}>SATISFIED USERS</div>
              </div>

            </div>

          </div>

          {/* Bottom Half: Modelled Bento Grid (4 Cards exactly matching the image) */}
          <div className="modelled-bento-grid">
            
            {/* Bento Card 1: Deep Navy Stat Card (24K+) */}
            <div className="modelled-bento-card-dark">
              <div>
                <div style={{ fontSize: '38px', fontWeight: 800, lineHeight: 1, letterSpacing: '-0.03em' }}>
                  24K+
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(255, 255, 255, 0.12)', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', marginTop: '10px' }}>
                  <span>+4%</span>
                </div>
              </div>
              <div style={{ fontSize: '13px', color: '#94A3B8', marginTop: '20px' }}>
                Start a chat with <br />
                <strong style={{ color: '#FFFFFF' }}>CommercePilot AI</strong>
              </div>
            </div>

            {/* Bento Card 2: 3D Commerce Cart & Bags with Live Chips */}
            <div className="modelled-bento-card-blue" style={{ position: 'relative', overflow: 'hidden', minHeight: '180px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '18px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', position: 'relative', zIndex: 2, maxWidth: '65%' }}>
                <span style={{ background: 'rgba(255, 255, 255, 0.25)', backdropFilter: 'blur(8px)', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600 }}>
                  ⚡ Order #TT10245
                </span>
                <span style={{ background: 'rgba(255, 255, 255, 0.25)', backdropFilter: 'blur(8px)', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600 }}>
                  🛍️ Black Kurti (1.67d)
                </span>
                <span style={{ background: 'rgba(255, 255, 255, 0.25)', backdropFilter: 'blur(8px)', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600 }}>
                  ✓ PO #PO-1001
                </span>
                <span style={{ background: 'rgba(255, 255, 255, 0.25)', backdropFilter: 'blur(8px)', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600 }}>
                  💬 WhatsApp NDR
                </span>
              </div>
              <img 
                src="/assets/images/ecommerce-cart-bags-3d.png" 
                alt="3D E-Commerce Cart & Bags" 
                style={{ position: 'absolute', right: '-10px', bottom: '-10px', height: '145px', width: 'auto', objectFit: 'contain', zIndex: 1, filter: 'drop-shadow(0 12px 24px rgba(15, 23, 42, 0.35))' }}
              />
            </div>

            {/* Bento Card 3: White AI Suggestion Card */}
            <div className="modelled-bento-card-white">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ width: '22px', height: '22px', borderRadius: '6px', background: '#E0F2FE', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Bot size={13} />
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                    CommercePilot Suggestion
                  </span>
                </div>
                <p style={{ fontSize: '12.5px', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                  Women's Black Kurti stock runway is 1.67 days. Auto-drafted PO #PO-1001 for 100 units ready.
                </p>
              </div>

              <div style={{ marginTop: '14px' }}>
                <Link to="/app/inventory" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#0F172A', color: '#FFFFFF', border: 'none', borderRadius: '20px', padding: '6px 16px', fontSize: '12px', fontWeight: 600, textDecoration: 'none' }}>
                  <span>✦ Review PO #1001</span>
                </Link>
              </div>
            </div>

            {/* Bento Card 4: 2x2 Value Tiles Grid */}
            <div className="modelled-bento-grid-2x2">
              <div className="modelled-bento-tile">
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <DollarSign size={15} />
                </div>
                <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#0F172A' }}>Cost savings</span>
              </div>

              <div className="modelled-bento-tile">
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Star size={15} />
                </div>
                <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#0F172A' }}>User experience</span>
              </div>

              <div className="modelled-bento-tile">
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#FFF7ED', color: '#EA580C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <PhoneCall size={15} />
                </div>
                <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#0F172A' }}>24/7 support</span>
              </div>

              <div className="modelled-bento-tile">
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#F0FDF4', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={15} />
                </div>
                <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#0F172A' }}>Safety guaranteed</span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;
