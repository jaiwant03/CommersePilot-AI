import React from 'react';
import { 
  ShieldCheck, 
  Boxes, 
  Truck, 
  BrainCircuit, 
  Mail, 
  CheckCircle2, 
  Sparkles,
  Layers,
  Zap,
  TrendingUp,
  Activity
} from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: <ShieldCheck size={22} />,
      tag: '99.4% Accurate',
      title: 'Smart COD Order Intelligence',
      description:
        'Analyzes past buyer behavior, phone validity, and pin code delivery track record to compute real-time RTO risk before you dispatch.',
      highlights: [
        'Automated email address & landmark verification',
        'Prepaid conversion incentives for borderline risk',
        'Auto-verification for proven buyer patterns'
      ]
    },
    {
      icon: <Boxes size={22} />,
      tag: 'Zero Stockouts',
      title: 'Predictive Inventory Management',
      description:
        'Monitors sales velocity across all channels to project exact days of stock runway and alert you before stockouts cause unfulfillable orders.',
      highlights: [
        'Dynamic safety stock threshold calculation',
        'Supplier reorder triggers via email approval',
        'Multi-channel inventory buffer sync'
      ]
    },
    {
      icon: <Truck size={22} />,
      tag: 'Sub-60s Intercept',
      title: 'Delivery Failure Recovery (NDR)',
      description:
        'Captures courier non-delivery reports (NDRs) in real-time and triggers automated email recovery flows to re-engage customers within seconds.',
      highlights: [
        'Instant customer re-attempt scheduling',
        'Address correction & landmark capture',
        'Courier fake attempt dispute logs'
      ]
    },
    {
      icon: <BrainCircuit size={22} />,
      tag: 'Grounded Groq AI',
      title: 'AI Business Intelligence',
      description:
        'Eliminates tedious spreadsheet exports. Ask conversational questions and get instant insights into margins, return causes, and SKU velocity.',
      highlights: [
        'Plain-English operations queries',
        'Daily morning health digest via email',
        'Product return root-cause analysis'
      ]
    },
    {
      icon: <Mail size={22} />,
      tag: 'Branded SMTP',
      title: 'Automated Email Notifications',
      description:
        'Keep both your team and your buyers informed with automated, branded transaction notifications triggered by critical operational milestones.',
      highlights: [
        'Low stock supplier purchase orders',
        'Real-time transit updates for buyers',
        'Daily operational exception summaries'
      ]
    },
    {
      icon: <Layers size={22} />,
      tag: 'Unified Ledger',
      title: 'Multi-Channel Inventory Sync',
      description:
        'Synchronizes live stock allocations across Shopify, WooCommerce, Instagram, and social channels to prevent accidental overselling.',
      highlights: [
        'Unified buffer reservation across channels',
        'Automated SKU mapping across storefronts',
        'Zero-latency channel webhooks'
      ]
    }
  ];

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      {/* Header */}
      <div className="section-header" style={{ marginBottom: '36px', textAlign: 'center' }}>
        <div className="section-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 18px', background: 'rgba(186, 230, 253, 0.4)', border: '1px solid rgba(14, 165, 233, 0.4)', borderRadius: '9999px', fontSize: '13px', fontWeight: 600, color: '#0284C7', marginBottom: '16px', boxShadow: '0 2px 8px rgba(14, 165, 233, 0.1)' }}>
          <Sparkles size={14} />
          <span>Product Capabilities</span>
        </div>
        <h2 className="section-title" style={{ fontSize: 'clamp(2.2rem, 3.8vw, 3.2rem)', fontWeight: 800, color: '#0F172A', marginBottom: '16px', letterSpacing: '-0.03em' }}>
          Engineered to Solve Real <br />
          <span className="text-gradient">Ecommerce Friction</span>
        </h2>
        <p className="section-subtitle" style={{ fontSize: '16px', color: '#475569', maxWidth: '720px', margin: '0 auto', lineHeight: 1.6 }}>
          Every feature in CommercePilot AI directly targets the operational bottlenecks that drain profitability from growing online businesses.
        </p>
      </div>

      {/* Luxury Features Grid */}
      <div className="features-grid">
        {features.map((feature, index) => (
          <div key={index} className="feature-card" style={{ background: 'rgba(255, 255, 255, 0.95)', border: '1.5px solid rgba(186, 230, 253, 0.75)', borderRadius: '24px', padding: '28px', boxShadow: '0 10px 25px -5px rgba(14, 165, 233, 0.08)' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: 'linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%)', color: '#0284C7', border: '1px solid #7DD3FC', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(2, 132, 199, 0.15)' }}>
                {feature.icon}
              </div>
              <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', background: 'rgba(14, 165, 233, 0.08)', color: '#0284C7', border: '1px solid rgba(14, 165, 233, 0.25)', letterSpacing: '0.02em' }}>
                {feature.tag}
              </span>
            </div>

            <h3 className="feature-title" style={{ fontSize: '17px', fontWeight: 700, color: '#0F172A', marginBottom: '10px' }}>
              {feature.title}
            </h3>

            <p className="feature-desc" style={{ fontSize: '13.5px', color: '#64748B', lineHeight: 1.6, marginBottom: '20px' }}>
              {feature.description}
            </p>
            
            <div className="feature-highlights" style={{ borderTop: '1px solid rgba(226, 232, 240, 0.8)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {feature.highlights.map((h, i) => (
                <div key={i} className="feature-highlight-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#334155' }}>
                  <CheckCircle2 size={14} style={{ color: '#10B981', flexShrink: 0 }} />
                  <span>{h}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturesSection;
