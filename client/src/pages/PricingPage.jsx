import React from 'react';
import { Link } from 'react-router-dom';
import { Check, Minus, HelpCircle, ArrowRight, Sparkles } from 'lucide-react';
import PricingSection from '../components/PricingSection';
import FaqSection from '../components/FaqSection';
import FinalCtaSection from '../components/FinalCtaSection';

const PricingPage = () => {
  const comparisonCategories = [
    {
      category: 'Order Volume & Storefronts',
      rows: [
        { feature: 'Monthly Evaluated Orders', starter: 'Up to 500', growth: 'Up to 2,500', pro: 'Up to 10,000+' },
        { feature: 'Connected Storefronts', starter: '1 Store', growth: '3 Stores', pro: 'Unlimited' },
        { feature: 'Additional Order Overage', starter: '₹4 / order', growth: '₹2.5 / order', pro: '₹1.5 / order' }
      ]
    },
    {
      category: 'COD Intelligence & RTO Shield',
      rows: [
        { feature: 'Real-time Risk Scoring Algorithm', starter: true, growth: true, pro: true },
        { feature: 'Automated Email Address Verification', starter: 'Basic', growth: 'Advanced Interactive', pro: 'Custom Logic' },
        { feature: 'Dynamic Prepaid Conversion Discounts', starter: false, growth: true, pro: true },
        { feature: 'Fraud & Chronic Returner Blacklist Sync', starter: true, growth: true, pro: true },
        { feature: 'Customizable Risk Thresholds', starter: false, growth: true, pro: true }
      ]
    },
    {
      category: 'Predictive Inventory Management',
      rows: [
        { feature: 'Stockout Runway Calculation', starter: true, growth: true, pro: true },
        { feature: 'Multi-Channel Stock Reservation (Shopify + WooCommerce)', starter: false, growth: true, pro: true },
        { feature: 'Automated Supplier PO Drafting & Approval', starter: false, growth: true, pro: true },
        { feature: 'Multi-Warehouse Allocation', starter: false, growth: false, pro: true }
      ]
    },
    {
      category: 'Delivery Failure Recovery (NDR)',
      rows: [
        { feature: 'Courier Webhook Ingestion', starter: true, growth: true, pro: true },
        { feature: 'Under-60-Second Email Customer Trigger', starter: false, growth: true, pro: true },
        { feature: 'Self-Serve Re-attempt Scheduling', starter: false, growth: true, pro: true },
        { feature: 'Fake Courier Attempt Dispute Logging', starter: false, growth: true, pro: true }
      ]
    },
    {
      category: 'AI Copilot & Automation',
      rows: [
        { feature: 'Groq-Powered Operations Copilot', starter: '10 queries/day', growth: 'Unlimited', pro: 'Unlimited Dedicated' },
        { feature: 'Daily Morning Email Operations Digest', starter: false, growth: true, pro: true },
        { feature: 'Custom n8n Workflow Webhooks', starter: false, growth: false, pro: true },
        { feature: 'Dedicated Account Manager & SLA Guarantee', starter: false, growth: false, pro: true }
      ]
    }
  ];

  const renderCell = (val) => {
    if (val === true) {
      return <Check size={18} style={{ color: '#10B981', margin: '0 auto' }} />;
    }
    if (val === false) {
      return <Minus size={18} style={{ color: '#64748B', margin: '0 auto' }} />;
    }
    return <span>{val}</span>;
  };

  return (
    <div className="pricing-page" style={{ paddingTop: 'calc(var(--navbar-height) + 40px)' }}>
      {/* Header Banner */}
      <div className="container" style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div className="section-tag">
          <Sparkles size={14} />
          <span>Flexible Plans & Transparent Pricing</span>
        </div>
        <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', marginBottom: '16px' }}>
          Invest in Operations that <br />
          <span className="text-gradient">Pay for Themselves</span>
        </h1>
        <p style={{ maxWidth: '680px', margin: '0 auto', fontSize: '1.125rem' }}>
          Stop letting high RTO rates, stockouts, and manual errors eat your margins.
          Choose your plan and launch in under 10 minutes.
        </p>
      </div>

      {/* Pricing Cards Component */}
      <PricingSection />

      {/* Feature Comparison Matrix */}
      <div className="container" style={{ marginTop: '64px', marginBottom: '80px' }}>
        <div className="section-header">
          <h2 className="section-title">Detailed Plan Feature Matrix</h2>
          <p className="section-subtitle">
            Compare capabilities across tiers to select the ideal operational fit for your brand.
          </p>
        </div>

        <div 
          style={{ 
            background: 'var(--color-bg-card)', 
            border: '1px solid var(--border-subtle)', 
            borderRadius: '16px', 
            overflowX: 'auto',
            padding: '16px' 
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '650px', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-light)', background: 'var(--color-bg-secondary)' }}>
                <th style={{ padding: '14px 16px', width: '40%', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>Feature / Capability</th>
                <th style={{ padding: '14px 16px', textAlign: 'center', width: '20%', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>Starter</th>
                <th style={{ padding: '14px 16px', textAlign: 'center', width: '20%', fontSize: '13px', fontWeight: 600, color: 'var(--color-primary)' }}>Growth (Popular)</th>
                <th style={{ padding: '14px 16px', textAlign: 'center', width: '20%', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>Professional</th>
              </tr>
            </thead>
            <tbody>
              {comparisonCategories.map((cat, cIdx) => (
                <React.Fragment key={cIdx}>
                  <tr>
                    <td 
                      colSpan={4} 
                      style={{ 
                        background: 'var(--color-bg-secondary)', 
                        padding: '10px 16px', 
                        fontSize: '11px', 
                        fontWeight: 700, 
                        color: 'var(--color-primary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        borderTop: '1px solid var(--border-subtle)',
                        borderBottom: '1px solid var(--border-subtle)'
                      }}
                    >
                      {cat.category}
                    </td>
                  </tr>
                  {cat.rows.map((row, rIdx) => (
                    <tr key={rIdx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--color-text-primary)' }}>{row.feature}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: '13px', color: 'var(--color-text-muted)' }}>{renderCell(row.starter)}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: '13px', color: 'var(--color-primary)', fontWeight: 600, background: 'var(--color-accent-bg)' }}>{renderCell(row.growth)}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: '13px', color: 'var(--color-text-muted)' }}>{renderCell(row.pro)}</td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <FaqSection />
      <FinalCtaSection />
    </div>
  );
};

export default PricingPage;
