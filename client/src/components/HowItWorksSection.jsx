import React from 'react';
import { Link } from 'react-router-dom';
import { 
  PlugZap, 
  ShieldCheck, 
  Mail, 
  Boxes, 
  Truck, 
  Cpu, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

const HowItWorksSection = () => {
  const steps = [
    {
      number: '01',
      icon: <PlugZap size={20} />,
      title: 'Store & Catalog Integration',
      description:
        'Connect your Shopify, WooCommerce, or custom storefront in under 5 minutes with zero code via webhooks.',
      meta: 'One-click webhook connection'
    },
    {
      number: '02',
      icon: <ShieldCheck size={20} />,
      title: 'Deterministic COD Risk Scoring',
      description:
        'Evaluates pin code delivery history, phone validity, buyer track record, and address completeness.',
      meta: '99.4% pre-dispatch screening'
    },
    {
      number: '03',
      icon: <Mail size={20} />,
      title: '1-Click Customer Action Email',
      description:
        'Sends secure, expiring confirmation links to buyers, with automated UPI incentives to convert to prepaid.',
      meta: 'Secure tokenized verification'
    },
    {
      number: '04',
      icon: <Boxes size={20} />,
      title: 'Predictive Stockout Radar',
      description:
        'Trailing sales velocity algorithms calculate exact runway days and draft ready-to-approve supplier POs.',
      meta: 'Auto-drafted purchase orders'
    },
    {
      number: '05',
      icon: <Truck size={20} />,
      title: 'Autonomous Courier NDR Recovery',
      description:
        'Captures courier delivery failure webhooks (Delhivery, BlueDart) within 60s to capture buyer rescheduled slots.',
      meta: 'Sub-60s customer outreach'
    },
    {
      number: '06',
      icon: <Cpu size={20} />,
      title: 'Groq AI Margin Realization',
      description:
        'Conversational business intelligence computes true net profits after RTO write-offs and returns tactical guidance.',
      meta: 'Grounded store database analytics'
    }
  ];

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      <div className="section-header" style={{ marginBottom: '36px', textAlign: 'center' }}>
        <div className="section-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 18px', background: 'rgba(186, 230, 253, 0.4)', border: '1px solid rgba(14, 165, 233, 0.4)', borderRadius: '9999px', fontSize: '13px', fontWeight: 600, color: '#0284C7', marginBottom: '16px', boxShadow: '0 2px 8px rgba(14, 165, 233, 0.1)' }}>
          <Sparkles size={14} />
          <span>End-to-End Operational Pipeline</span>
        </div>
        <h2 className="section-title" style={{ fontSize: 'clamp(2.2rem, 3.8vw, 3.2rem)', fontWeight: 800, color: '#0F172A', marginBottom: '16px', letterSpacing: '-0.03em' }}>
          How CommercePilot AI Works <br />
          <span className="text-gradient">From Day One</span>
        </h2>
        <p className="section-subtitle" style={{ fontSize: '16px', color: '#475569', maxWidth: '720px', margin: '0 auto', lineHeight: 1.6 }}>
          Deploy in minutes without changing your existing fulfillment workflow or migrating away from your current platforms.
        </p>
      </div>

      <div className="steps-container">
        {steps.map((step, index) => (
          <div key={index} className="step-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div className="step-num-badge" style={{ width: '38px', height: '38px', borderRadius: '12px', background: '#0F172A', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 800, transition: 'all 0.3s ease' }}>
                {step.number}
              </div>
              <div className="step-icon-glow" style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%)', color: '#0284C7', border: '1px solid #7DD3FC', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s ease' }}>
                {step.icon}
              </div>
            </div>
            <h3 className="step-title" style={{ fontSize: '17px', fontWeight: 700, color: '#0F172A', marginBottom: '10px' }}>
              {step.title}
            </h3>
            <p className="step-desc" style={{ fontSize: '13.5px', color: '#64748B', lineHeight: 1.6, marginBottom: '18px' }}>
              {step.description}
            </p>
            <div className="step-meta" style={{ borderTop: '1px solid rgba(226, 232, 240, 0.8)', paddingTop: '14px', fontSize: '12px', color: '#0284C7', fontWeight: 600 }}>
              <span>✓ {step.meta}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <Link to="/signup" className="modelled-btn-cta" style={{ marginRight: '14px' }}>
          Get Started in 5 Minutes
          <ArrowRight size={16} style={{ marginLeft: '6px' }} />
        </Link>
        <a href="#product" className="modelled-nav-btn-white" style={{ padding: '10px 24px' }}>
          Inspect Architecture Details
        </a>
      </div>
    </div>
  );
};

export default HowItWorksSection;
