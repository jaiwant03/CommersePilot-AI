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

      {/* Section Sub-Header & 3 Omnichannel Media Cards (Matching Luxury Reference) */}
      <div style={{ marginBottom: '40px', background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(10px)', border: '1.5px solid rgba(186, 230, 253, 0.8)', borderRadius: '28px', padding: '32px', boxShadow: '0 16px 36px -8px rgba(14, 165, 233, 0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 12px', borderRadius: '20px', background: 'rgba(14, 165, 233, 0.1)', color: '#0284C7', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Multi-Channel Protection &amp; Policy Audit Suite
          </span>
          <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', marginTop: '8px', marginBottom: '6px' }}>
            Unified Operations Across Instagram, Web Banner Flash Sales &amp; Email
          </h3>
          <p style={{ fontSize: '14px', color: '#64748B', maxWidth: '640px', margin: '0 auto' }}>
            CommercePilot AI continuously inspects ad traffic, social D2C inquiries, and courier status to protect brand profitability 24/7.
          </p>
        </div>

        {/* 3 Luxury Media Cards: Instagram Post, Web Banner, Email */}
        <div className="omnichannel-media-grid" style={{ marginTop: '0', marginBottom: '0' }}>
          <div className="omnichannel-media-card">
            <img 
              src="/assets/images/instagram-d2c-post.svg" 
              alt="CommercePilot AI Instagram D2C Ad Protection"
              className="omnichannel-media-img"
            />
          </div>
          <div className="omnichannel-media-card">
            <img 
              src="/assets/images/web-banner-creative.svg" 
              alt="CommercePilot AI Web Banner Flash Sale Protection"
              className="omnichannel-media-img"
            />
          </div>
          <div className="omnichannel-media-card">
            <img 
              src="/assets/images/email-campaign-creative.svg" 
              alt="CommercePilot AI Email Campaign 1-Click Verification"
              className="omnichannel-media-img"
            />
          </div>
        </div>
      </div>

      {/* Luxury Features Grid with Embedded Tactical Gadgets */}
      <div className="features-grid">
        {features.map((feature, index) => (
          <div key={index} className="feature-card" style={{ background: 'rgba(255, 255, 255, 0.95)', border: '1.5px solid rgba(186, 230, 253, 0.85)', borderRadius: '24px', padding: '28px', boxShadow: '0 12px 30px -6px rgba(14, 165, 233, 0.1)', display: 'flex', flexDirection: 'column' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: 'linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%)', color: '#0284C7', border: '1px solid #7DD3FC', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(2, 132, 199, 0.15)' }}>
                {feature.icon}
              </div>
              <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', background: 'rgba(14, 165, 233, 0.08)', color: '#0284C7', border: '1px solid rgba(14, 165, 233, 0.25)', letterSpacing: '0.02em' }}>
                {feature.tag}
              </span>
            </div>

            <h3 className="feature-title" style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
              {feature.title}
            </h3>

            <p className="feature-desc" style={{ fontSize: '13.5px', color: '#64748B', lineHeight: 1.6, marginBottom: '18px' }}>
              {feature.description}
            </p>

            {/* Embedded Live Modelled Gadget for each Feature */}
            <div style={{ marginBottom: '18px', padding: '12px 14px', borderRadius: '12px', background: '#F8FAFC', border: '1px solid #E2E8F0', fontSize: '12px' }}>
              {index === 0 && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700, color: '#0F172A' }}>Order #TT10245 (Coimbatore)</span>
                    <span style={{ color: '#DC2626', fontWeight: 800, background: '#FEE2E2', padding: '1px 6px', borderRadius: '4px', fontSize: '10px' }}>RISK: 65/100</span>
                  </div>
                  <div style={{ color: '#64748B', fontSize: '11px' }}>⚠️ Incomplete address: House # / landmark missing</div>
                  <div style={{ color: '#16A34A', fontSize: '11px', fontWeight: 600, marginTop: '4px' }}>✓ Verification email sent to buyer</div>
                </div>
              )}
              {index === 1 && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700, color: '#0F172A' }}>Women's Black Kurti</span>
                    <span style={{ color: '#D97706', fontWeight: 800, background: '#FEF3C7', padding: '1px 6px', borderRadius: '4px', fontSize: '10px' }}>1.67 DAYS LEFT</span>
                  </div>
                  <div style={{ color: '#64748B', fontSize: '11px' }}>Stock: 25 units • Sales: 15/day (Lead time: 5d)</div>
                  <div style={{ color: '#4F46E5', fontSize: '11px', fontWeight: 600, marginTop: '4px' }}>⚡ Auto-drafted PO #PO-1001 (100 units)</div>
                </div>
              )}
              {index === 2 && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700, color: '#059669' }}>WhatsApp NDR Recovery</span>
                    <span style={{ color: '#16A34A', fontWeight: 800, background: '#DCFCE7', padding: '1px 6px', borderRadius: '4px', fontSize: '10px' }}>RECOVERED</span>
                  </div>
                  <div style={{ color: '#334155', fontSize: '11px', fontStyle: 'italic' }}>"Reply YES to request redelivery..."</div>
                  <div style={{ color: '#16A34A', fontSize: '11px', fontWeight: 600, marginTop: '4px' }}>✓ Buyer replied YES • Re-attempt scheduled</div>
                </div>
              )}
              {index === 3 && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700, color: '#4F46E5' }}>Grounded Groq AI</span>
                    <span style={{ color: '#0284C7', fontWeight: 800, background: '#E0F2FE', padding: '1px 6px', borderRadius: '4px', fontSize: '10px' }}>ACCURATE</span>
                  </div>
                  <div style={{ color: '#334155', fontSize: '11px' }}>Q: "Which product gives highest profit margin?"</div>
                  <div style={{ color: '#16A34A', fontSize: '11px', fontWeight: 600, marginTop: '4px' }}>AI: Premium Kurti (₹1,600 profit, 64.0% margin)</div>
                </div>
              )}
              {index === 4 && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700, color: '#0F172A' }}>Tokenized Email Dispatch</span>
                    <span style={{ color: '#16A34A', fontWeight: 800, background: '#DCFCE7', padding: '1px 6px', borderRadius: '4px', fontSize: '10px' }}>EXPIRING</span>
                  </div>
                  <div style={{ color: '#64748B', fontSize: '11px' }}>1-Click Confirm / Cancel token with 24h expiry</div>
                  <div style={{ color: '#4F46E5', fontSize: '11px', fontWeight: 600, marginTop: '4px' }}>✓ Branded SMTP dispatch with zero spam flags</div>
                </div>
              )}
              {index === 5 && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700, color: '#0F172A' }}>Live Channel Buffer</span>
                    <span style={{ color: '#4F46E5', fontWeight: 800, background: '#EEF2FF', padding: '1px 6px', borderRadius: '4px', fontSize: '10px' }}>SYNCED</span>
                  </div>
                  <div style={{ color: '#64748B', fontSize: '11px' }}>Shopify: 40 • Instagram: 10 • WhatsApp: 5</div>
                  <div style={{ color: '#16A34A', fontSize: '11px', fontWeight: 600, marginTop: '4px' }}>✓ Safety buffer locked • Zero overselling</div>
                </div>
              )}
            </div>
            
            <div className="feature-highlights" style={{ borderTop: '1px solid rgba(226, 232, 240, 0.8)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto' }}>
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
