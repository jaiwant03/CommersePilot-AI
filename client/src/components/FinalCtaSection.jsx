import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

const FinalCtaSection = () => {
  return (
    <div 
      style={{ 
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', 
        borderRadius: '32px', 
        padding: '56px 40px', 
        border: '2px solid rgba(56, 189, 248, 0.4)', 
        boxShadow: '0 25px 65px -10px rgba(15, 23, 42, 0.55)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Decorative Ambient Radial Glow inside Banner */}
      <div 
        style={{
          position: 'absolute',
          top: '-50%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.25) 0%, transparent 70%)',
          pointerEvents: 'none'
        }}
      />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '780px', margin: '0 auto' }}>
        
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 18px', background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.35)', borderRadius: '9999px', fontSize: '12.5px', fontWeight: 700, color: '#38BDF8', marginBottom: '20px' }}>
          <Sparkles size={14} />
          <span>Zero-Risk 30-Day Autonomous Pilot</span>
        </div>

        <h2 style={{ fontSize: 'clamp(2.3rem, 4.2vw, 3.6rem)', fontWeight: 900, color: '#FFFFFF', lineHeight: 1.15, letterSpacing: '-0.035em', marginBottom: '18px' }}>
          Put Your Store Operations <br />
          <span style={{ background: 'linear-gradient(135deg, #38BDF8 0%, #818CF8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            On Autopilot Today
          </span>
        </h2>

        <p style={{ fontSize: '16px', color: '#94A3B8', lineHeight: 1.65, maxWidth: '640px', margin: '0 auto 36px' }}>
          Join forward-thinking Indian D2C brands that have eliminated manual delivery tracking, protected profit margins from bogus COD returns, and automated inventory safety 24/7.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px' }}>
          <Link 
            to="/signup" 
            className="modelled-btn-cta" 
            style={{ 
              background: '#38BDF8', 
              color: '#0F172A', 
              fontWeight: 800, 
              padding: '14px 36px', 
              fontSize: '15.5px',
              boxShadow: '0 8px 24px rgba(56, 189, 248, 0.4)',
              whiteSpace: 'nowrap',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              textDecoration: 'none'
            }}
          >
            <span>Start Free Trial Now</span>
            <ArrowRight size={18} />
          </Link>
        </div>

        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '24px', 
            flexWrap: 'wrap',
            fontSize: '13px',
            color: '#CBD5E1',
            fontWeight: 600
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={16} style={{ color: '#34D399' }} />
            No credit card required
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={16} style={{ color: '#34D399' }} />
            5-minute Shopify &amp; WooCommerce setup
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={16} style={{ color: '#34D399' }} />
            Cancel anytime
          </span>
        </div>

      </div>
    </div>
  );
};

export default FinalCtaSection;
