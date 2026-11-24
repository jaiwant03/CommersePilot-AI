import React from 'react';
import AnimatedRupee from './AnimatedRupee';
import { Link } from 'react-router-dom';
import { Check, ArrowRight, Tag } from 'lucide-react';

const PricingSection = () => {
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
            <div className="plan-cta" style={{ marginBottom: '24px' }}>
              <Link
                to={`/signup?plan=${plan.id}`}
                className={plan.popular ? 'modelled-btn-cta' : 'modelled-nav-btn-white'}
                style={{ width: '100%', justifyContent: 'center', padding: '12px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <span>Choose {plan.name}</span>
                <ArrowRight size={14} />
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
    </div>
  );
};

export default PricingSection;
