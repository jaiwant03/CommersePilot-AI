import React from 'react';
import { Link } from 'react-router-dom';
import { 
  PlugZap, 
  BrainCircuit, 
  Cpu, 
  TrendingUp, 
  Check, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Server
} from 'lucide-react';
import FinalCtaSection from '../components/FinalCtaSection';

const HowItWorksPage = () => {
  const steps = [
    {
      step: '01',
      title: 'Store & Courier Onboarding (5 Minutes)',
      summary: 'Plug your existing ecosystem into CommercePilot AI without code changes or disruption.',
      details: [
        'Install the native webhook connector for Shopify, WooCommerce, or your custom store.',
        'Connect courier partners (Shiprocket, Delhivery, NimbusPost, Blue Dart, Shadowfax) with your API keys.',
        'Configure verified SMTP email credentials to enable automated customer & supplier messaging.',
        'Zero downtime and no migration required—runs parallel to your existing operations.'
      ]
    },
    {
      step: '02',
      title: 'Historical Audit & Risk Calibration',
      summary: 'Our neural models study past returns, pin code performance, and inventory velocity.',
      details: [
        'Analyzes past 90 days of orders to benchmark customer return patterns and COD failure rates.',
        'Maps pin code delivery success rates across major Indian courier networks.',
        'Calibrates automated risk thresholds tailored specifically to your average order value and margin structure.',
        'Establishes SKU sales velocity baselines to identify seasonal fast-movers.'
      ]
    },
    {
      step: '03',
      title: 'Autonomous Real-Time Execution',
      summary: 'CommercePilot AI operates 24/7 in the background across three critical operational pillars.',
      details: [
        'Pre-Dispatch Filter: Incoming COD orders evaluated; high-risk orders receive automated email verification links.',
        'Continuous Stock Watch: Alerts sent when safety thresholds are breached; automated POs drafted for merchant approval.',
        'Zero-Latency NDR: Non-delivery reports trigger immediate customer email recovery links.',
        'Daily Autopilot: Fake delivery attempts disputed, address discrepancies cleaned, and daily operational logs filed.'
      ]
    },
    {
      step: '04',
      title: 'Sustainable Growth & Profit Maximization',
      summary: 'Scale marketing spend and monthly GMV with protected net profits and reliable inventory.',
      details: [
        'Eliminate wasteful courier freight on unverified returns.',
        'Prevent stockouts during high-stakes sales and influencer promotions.',
        'Free up 10+ hours per week of manual merchant follow-ups.',
        'Make data-driven purchasing decisions with the Groq-powered AI operations copilot.'
      ]
    }
  ];

  return (
    <div className="how-it-works-page" style={{ paddingTop: 'calc(var(--navbar-height) + 40px)' }}>
      {/* Header Banner */}
      <div className="container" style={{ textAlign: 'center', marginBottom: '64px' }}>
        <div className="section-tag">
          <Cpu size={14} />
          <span>Operational Architecture</span>
        </div>
        <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', marginBottom: '16px' }}>
          How CommercePilot AI <br />
          <span className="text-gradient">Runs Your Operations</span>
        </h1>
        <p style={{ maxWidth: '680px', margin: '0 auto', fontSize: '1.125rem' }}>
          A step-by-step walkthrough of how our platform seamlessly connects, assesses risk, 
          and handles exceptions without manual intervention.
        </p>
      </div>

      {/* Stepper Timeline */}
      <div className="container" style={{ maxWidth: '960px', marginBottom: '80px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {steps.map((s, idx) => (
            <div 
              key={idx}
              className="card"
              style={{
                display: 'flex',
                gap: '24px',
                padding: '36px',
                background: 'linear-gradient(180deg, rgba(13, 21, 39, 0.9) 0%, rgba(19, 30, 54, 0.8) 100%)',
                borderColor: 'rgba(99, 102, 241, 0.25)'
              }}
            >
              <div 
                style={{ 
                  width: '56px', 
                  height: '56px', 
                  borderRadius: '12px', 
                  background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  fontWeight: 800,
                  color: '#FFF',
                  flexShrink: 0
                }}
              >
                {s.step}
              </div>

              <div style={{ flexGrow: 1 }}>
                <h2 style={{ fontSize: '1.35rem', marginBottom: '8px' }}>{s.title}</h2>
                <p style={{ fontSize: '0.95rem', color: '#94A3B8', marginBottom: '20px' }}>{s.summary}</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {s.details.map((d, dIdx) => (
                    <div key={dIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', color: '#E2E8F0' }}>
                      <Check size={16} style={{ color: '#34D399', flexShrink: 0, marginTop: '2px' }} />
                      <span>{d}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <FinalCtaSection />
    </div>
  );
};

export default HowItWorksPage;
