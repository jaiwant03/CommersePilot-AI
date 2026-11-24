import React, { useState, useEffect } from 'react';
import AnimatedRupee from './AnimatedRupee';
import { Link } from 'react-router-dom';
import { Check, Minus, ArrowRight, Tag, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

const PricingSection = () => {
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);

  useEffect(() => {
    if (window.location.hash === '#compare-plans') {
      setIsComparisonOpen(true);
      setTimeout(() => {
        const el = document.getElementById('compare-plans');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, []);

  const handleToggleComparison = () => {
    setIsComparisonOpen((prev) => {
      const nextState = !prev;
      if (nextState) {
        setTimeout(() => {
          const el = document.getElementById('compare-plans');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 50);
      }
      return nextState;
    });
  };

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
      return <Minus size={18} style={{ color: '#94A3B8', margin: '0 auto' }} />;
    }
    return <span>{val}</span>;
  };

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      badge: null,
      desc: 'Ideal for early-stage D2C brands and Instagram sellers looking to eliminate initial COD returns.',
      price: '999',
      billingLabel: 'Billed monthly • 14-day free trial',
      popular: false,
      features: [
        'Up to 500 orders / month',
        'Smart COD Risk Scoring',
        'Basic Email address verification',
        'Predictive Stockout Alerts (1 store)',
        'Standard Courier Webhook Support',
        'Email Support'
      ]
    },
    {
      id: 'growth',
      name: 'Growth',
      badge: 'Most Popular',
      desc: 'Designed for scaling Shopify & WooCommerce merchants needing proactive automation and NDR recovery.',
      price: '2,499',
      billingLabel: 'Billed monthly • Cancel anytime',
      popular: true,
      features: [
        'Up to 2,500 orders / month',
        'Advanced Neural RTO Scoring',
        'Automated Email NDR Recovery Flow',
        'Multi-Channel Inventory Sync (Shopify + Social)',
        'Autonomous Supplier Purchase Order Drafts',
        'AI Operations Copilot (Unlimited queries)',
        'Priority Courier Dispute Logger',
        'Verified Email Priority Support'
      ]
    },
    {
      id: 'professional',
      name: 'Professional',
      badge: 'High Velocity',
      desc: 'Full-suite operational autonomy for high-volume fashion, cosmetics, and multi-brand merchants.',
      price: '5,999',
      billingLabel: 'Billed monthly • Dedicated SLA',
      popular: false,
      features: [
        'Up to 10,000 orders / month',
        'Custom Risk Thresholds & Blacklists',
        'Dedicated Custom Email Domain & Webhooks',
        'Multi-Warehouse Inventory Allocation',
        'Custom Courier SLA Tracking & Penalties',
        'Dedicated Operations Account Manager',
        'Custom Webhooks & ERP Sync (Tally / Zoho)',
        '24/7 SLA Guarantee'
      ]
    }
  ];

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      <div className="section-header" style={{ marginBottom: '36px', textAlign: 'center' }}>
        <div className="section-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 18px', background: 'rgba(186, 230, 253, 0.4)', border: '1px solid rgba(14, 165, 233, 0.4)', borderRadius: '9999px', fontSize: '13px', fontWeight: 600, color: '#0284C7', marginBottom: '16px', boxShadow: '0 2px 8px rgba(14, 165, 233, 0.1)' }}>
          <Tag size={14} />
          <span>Transparent Investment</span>
        </div>
        <h2 className="section-title" style={{ fontSize: 'clamp(2.2rem, 3.8vw, 3.2rem)', fontWeight: 800, color: '#0F172A', marginBottom: '16px', letterSpacing: '-0.03em' }}>
          Simple, Predictable Pricing for <br />
          <span className="text-gradient">Every Stage of Growth</span>
        </h2>
        <p className="section-subtitle" style={{ fontSize: '16px', color: '#475569', maxWidth: '720px', margin: '0 auto', lineHeight: 1.6 }}>
          Choose the operational plan that matches your monthly order volume. No hidden implementation fees.
        </p>
      </div>

      {/* Pricing Cards Grid */}
      <div className="pricing-grid">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`pricing-card ${plan.popular ? 'popular' : ''}`}
          >
            {plan.badge && (
              <div className="popular-badge" style={{ background: '#0F172A', color: '#FFFFFF', padding: '4px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.04em' }}>
                {plan.badge}
              </div>
            )}

            <h3 className="plan-name" style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
              {plan.name}
            </h3>
            <p className="plan-desc" style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.5, minHeight: '40px', marginBottom: '20px' }}>
              {plan.desc}
            </p>

            <div className="plan-pricing-area" style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '4px' }}>
              <span className="plan-currency" style={{ fontSize: '22px', fontWeight: 700, color: '#0F172A' }}>₹</span>
              <span className="plan-price" style={{ fontSize: '40px', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.03em' }}>
                <AnimatedRupee value={plan.price} prefix="" />
              </span>
              <span className="plan-period" style={{ fontSize: '13px', color: '#64748B', fontWeight: 500 }}>
                / month
              </span>
            </div>

            <div className="plan-price-label" style={{ fontSize: '11.5px', color: '#0284C7', fontWeight: 600, marginBottom: '24px' }}>
              {plan.billingLabel}
            </div>

            {/* Pricing Buttons */}
            <div className="plan-cta">
              <Link
                to={`/signup?plan=${plan.id}`}
                className={plan.popular ? 'modelled-btn-cta' : 'modelled-nav-btn-white'}
              >
                <span>Choose {plan.name}</span>
                <ArrowRight size={14} style={{ flexShrink: 0 }} />
              </Link>
            </div>

            <div className="plan-features-list" style={{ borderTop: '1px solid rgba(226, 232, 240, 0.8)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {plan.features.map((feature, i) => (
                <div key={i} className="plan-feature-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: '#334155' }}>
                  <Check size={15} style={{ color: '#10B981', flexShrink: 0 }} />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Center Toggle Compare Plans Button */}
      <div style={{ textAlign: 'center', marginTop: '44px', display: 'flex', justifyContent: 'center' }}>
        <button
          type="button"
          onClick={handleToggleComparison}
          className="modelled-nav-btn-white"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 32px',
            fontSize: '14.5px',
            fontWeight: 700,
            borderRadius: '9999px',
            border: '1.5px solid #0284C7',
            color: '#0284C7',
            background: isComparisonOpen ? 'rgba(2, 132, 199, 0.1)' : 'rgba(2, 132, 199, 0.05)',
            boxShadow: '0 4px 14px rgba(2, 132, 199, 0.1)',
            cursor: 'pointer',
            transition: 'all 0.25s ease',
            whiteSpace: 'nowrap'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#0284C7';
            e.currentTarget.style.color = '#FFFFFF';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(2, 132, 199, 0.28)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = isComparisonOpen ? 'rgba(2, 132, 199, 0.1)' : 'rgba(2, 132, 199, 0.05)';
            e.currentTarget.style.color = '#0284C7';
            e.currentTarget.style.boxShadow = '0 4px 14px rgba(2, 132, 199, 0.1)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <span>{isComparisonOpen ? 'Hide Detailed Plan Comparison' : 'Compare All Plans & Features'}</span>
          {isComparisonOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* In-Page Detailed Plan Feature Matrix (Appears below on the same page) */}
      {isComparisonOpen && (
        <div
          id="compare-plans"
          style={{
            marginTop: '48px',
            animation: 'fadeIn 0.35s ease-out',
            background: '#FFFFFF',
            borderRadius: '24px',
            border: '1.5px solid rgba(226, 232, 240, 0.9)',
            padding: '36px 28px',
            boxShadow: '0 20px 45px -15px rgba(15, 23, 42, 0.08)'
          }}
        >
          <div className="section-header" style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 14px', background: 'rgba(2, 132, 199, 0.08)', borderRadius: '9999px', fontSize: '12px', fontWeight: 700, color: '#0284C7', marginBottom: '12px' }}>
              <Sparkles size={13} />
              <span>Side-by-Side Feature Breakdown</span>
            </div>
            <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
              Detailed Plan Feature Matrix
            </h3>
            <p style={{ fontSize: '14px', color: '#64748B', maxWidth: '600px', margin: '0 auto' }}>
              Compare capabilities across tiers to select the ideal operational fit for your brand.
            </p>
          </div>

          <div style={{ overflowX: 'auto', borderRadius: '16px', border: '1px solid rgba(226, 232, 240, 0.8)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '650px', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
                  <th style={{ padding: '14px 18px', width: '40%', fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>Feature / Capability</th>
                  <th style={{ padding: '14px 18px', textAlign: 'center', width: '20%', fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>Starter</th>
                  <th style={{ padding: '14px 18px', textAlign: 'center', width: '20%', fontSize: '13px', fontWeight: 800, color: '#0284C7', background: 'rgba(2, 132, 199, 0.06)' }}>Growth (Popular)</th>
                  <th style={{ padding: '14px 18px', textAlign: 'center', width: '20%', fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>Professional</th>
                </tr>
              </thead>
              <tbody>
                {comparisonCategories.map((cat, cIdx) => (
                  <React.Fragment key={cIdx}>
                    <tr>
                      <td
                        colSpan={4}
                        style={{
                          background: 'rgba(241, 245, 249, 0.9)',
                          padding: '10px 18px',
                          fontSize: '11px',
                          fontWeight: 800,
                          color: '#0284C7',
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                          borderTop: '1px solid #E2E8F0',
                          borderBottom: '1px solid #E2E8F0'
                        }}
                      >
                        {cat.category}
                      </td>
                    </tr>
                    {cat.rows.map((row, rIdx) => (
                      <tr key={rIdx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '12px 18px', fontSize: '13px', color: '#334155', fontWeight: 500 }}>{row.feature}</td>
                        <td style={{ padding: '12px 18px', textAlign: 'center', fontSize: '13px', color: '#64748B' }}>{renderCell(row.starter)}</td>
                        <td style={{ padding: '12px 18px', textAlign: 'center', fontSize: '13px', color: '#0284C7', fontWeight: 600, background: 'rgba(2, 132, 199, 0.03)' }}>{renderCell(row.growth)}</td>
                        <td style={{ padding: '12px 18px', textAlign: 'center', fontSize: '13px', color: '#64748B' }}>{renderCell(row.pro)}</td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingSection;
