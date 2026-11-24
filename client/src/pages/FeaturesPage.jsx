import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Boxes, 
  Truck, 
  BrainCircuit, 
  Mail, 
  Check, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import FinalCtaSection from '../components/FinalCtaSection';

const FeaturesPage = () => {
  const deepFeatures = [
    {
      id: 'cod-intelligence',
      icon: <ShieldCheck size={28} />,
      title: 'Smart COD Order Intelligence',
      badge: 'Core Margin Safeguard',
      description:
        'Cash-on-Delivery remains the preferred payment mode for over 65% of Indian online shoppers, yet it causes the highest failure rates. Our neural evaluation model analyzes past order completion histories, evaluates pin code deliverability, and confirms buyer commitment prior to fulfillment.',
      specs: [
        { label: 'Address Quality Scoring', detail: 'Identifies incomplete addresses missing house numbers or landmarks' },
        { label: 'Automated Email Verification', detail: 'Dispatches instant confirmation links to unverified buyers' },
        { label: 'Prepaid Incentive Engine', detail: 'Offers dynamic 5% discounts to convert borderline COD to UPI' },
        { label: 'Blacklist Sync', detail: 'Cross-checks chronic fraud numbers and automated bot submissions' }
      ]
    },
    {
      id: 'predictive-inventory',
      icon: <Boxes size={28} />,
      title: 'Predictive Inventory Management',
      badge: 'Stockout Prevention',
      description:
        'Stockouts during high-intent shopping weekends cause immediate revenue loss and damage ad performance. CommercePilot AI continuously projects SKU runway based on real-time order velocity, supplier reorder lead times, and seasonal demand fluctuations.',
      specs: [
        { label: 'Continuous Velocity Tracking', detail: 'Calculates hourly consumption rate per SKU and variant' },
        { label: 'Dynamic Safety Buffers', detail: 'Automatically calculates restock triggers before stock hits zero' },
        { label: 'Multi-Channel Allocation', detail: 'Prevents overselling across Shopify, WooCommerce, and marketplaces' },
        { label: 'Supplier PO Drafting', detail: 'Generates automated purchase orders ready for manufacturer review' }
      ]
    },
    {
      id: 'ndr-recovery',
      icon: <Truck size={28} />,
      title: 'Real-Time Delivery Failure Recovery (NDR)',
      badge: 'Courier Accountability',
      description:
        'When courier partners log non-delivery events, merchants usually discover it days later when the parcel is already on its return journey. CommercePilot AI connects directly to courier webhooks to trigger immediate buyer outreach within seconds of an NDR event.',
      specs: [
        { label: 'Under-60-Second Trigger', detail: 'Dispatches recovery email to customer the moment courier logs an NDR' },
        { label: 'Self-Serve Rescheduling', detail: 'Enables customer to choose their preferred date and delivery time slot' },
        { label: 'Address Revision Capture', detail: 'Captures updated delivery locations or office alternate contact details' },
        { label: 'Courier Dispute Logging', detail: 'Timestamped proof of buyer responsiveness to contest fake rider attempts' }
      ]
    },
    {
      id: 'ai-bi',
      icon: <BrainCircuit size={28} />,
      title: 'AI Business Intelligence Copilot',
      badge: 'Decision Intelligence',
      description:
        'Say goodbye to static, messy spreadsheets. Powered by Groq fast AI inference, ask your store assistant any operational question in plain language to get instant clarity on gross vs. net margins, regional return clusters, and courier fulfillment efficiency.',
      specs: [
        { label: 'Natural Language Queries', detail: 'Ask "Which courier has the lowest RTO in South India?" and get instant answers' },
        { label: 'Morning Email Digest', detail: 'Delivers daily revenue, pending verifications, and alert summaries at 9 AM' },
        { label: 'Root Cause Diagnostics', detail: 'Classifies returns by size issues, transit delays, or impulsive buyers' },
        { label: 'Actionable Recommendations', detail: 'Provides concrete suggestions to adjust pricing, listings, or dispatch rules' }
      ]
    },
    {
      id: 'notifications',
      icon: <Mail size={28} />,
      title: 'Automated Email Notifications & Reports',
      badge: 'Customer Communication',
      description:
        'Keep all stakeholders aligned without lifting a finger. From alerting your warehouse team about stock depletion to sending branded email tracking milestones to buyers, automated notifications ensure seamless visibility.',
      specs: [
        { label: 'Verified SMTP Delivery', detail: 'High deliverability under your verified store domain address' },
        { label: 'Courier Milestone Tracking', detail: 'Order dispatched, in-transit, out for delivery, and delivered updates' },
        { label: 'Supplier Restock Triggers', detail: 'Direct email PO dispatch upon merchant explicit approval' },
        { label: 'Team Escalation Alerts', detail: 'Instant alerts for unusual cancellation spikes or courier delays' }
      ]
    }
  ];

  return (
    <div className="features-page" style={{ paddingTop: 'calc(var(--navbar-height) + 40px)' }}>
      {/* Header Banner */}
      <div className="container" style={{ textAlign: 'center', marginBottom: '64px' }}>
        <div className="section-tag">
          <Sparkles size={14} />
          <span>Complete Feature Deep Dive</span>
        </div>
        <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', marginBottom: '16px' }}>
          Autonomous Tools Built for <br />
          <span className="text-gradient">Real Ecommerce Growth</span>
        </h1>
        <p style={{ maxWidth: '680px', margin: '0 auto', fontSize: '1.125rem' }}>
          Explore how each module in CommercePilot AI works together to safeguard your margins,
          automate daily busywork, and provide deep operational clarity.
        </p>
      </div>

      {/* Feature Deep Dive List */}
      <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '48px', marginBottom: '80px' }}>
        {deepFeatures.map((feat, idx) => (
          <div 
            key={feat.id} 
            className="card"
            style={{ 
              padding: '40px', 
              background: 'linear-gradient(180deg, rgba(13, 21, 39, 0.85) 0%, rgba(19, 30, 54, 0.7) 100%)',
              borderColor: 'rgba(99, 102, 241, 0.2)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <div className="icon-wrapper" style={{ margin: 0 }}>
                {feat.icon}
              </div>
              <div>
                <span className="badge badge-info" style={{ marginBottom: '6px' }}>{feat.badge}</span>
                <h2 style={{ fontSize: '1.5rem' }}>{feat.title}</h2>
              </div>
            </div>

            <p style={{ fontSize: '1rem', lineHeight: 1.7, marginBottom: '28px', maxWidth: '850px' }}>
              {feat.description}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              {feat.specs.map((spec, sIdx) => (
                <div 
                  key={sIdx}
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.03)', 
                    border: '1px solid rgba(255, 255, 255, 0.06)', 
                    borderRadius: '8px', 
                    padding: '16px' 
                  }}
                >
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#A5B4FC', marginBottom: '4px' }}>
                    {spec.label}
                  </div>
                  <div style={{ fontSize: '12px', color: '#94A3B8', lineHeight: 1.5 }}>
                    {spec.detail}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <FinalCtaSection />
    </div>
  );
};

export default FeaturesPage;
