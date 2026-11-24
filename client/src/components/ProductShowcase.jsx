import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Boxes, 
  Truck, 
  Bot, 
  Check, 
  Activity, 
  TrendingUp, 
  CheckCircle2, 
  ArrowRight,
  Layers,
  Sparkles,
  Zap,
  Mail,
  Instagram,
  ShoppingBag,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';

const ProductShowcase = () => {
  const [activeTab, setActiveTab] = useState('cod');

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      
      {/* Section Header */}
      <div className="section-header" style={{ marginBottom: '36px', textAlign: 'center' }}>
        <div className="section-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 18px', background: 'rgba(186, 230, 253, 0.4)', border: '1px solid rgba(14, 165, 233, 0.4)', borderRadius: '9999px', fontSize: '13px', fontWeight: 600, color: '#0284C7', marginBottom: '16px', boxShadow: '0 2px 8px rgba(14, 165, 233, 0.1)' }}>
          <Activity size={14} />
          <span>Interactive Platform Architecture</span>
        </div>
        <h2 className="section-title" style={{ fontSize: 'clamp(2.2rem, 3.8vw, 3.2rem)', fontWeight: 800, color: '#0F172A', marginBottom: '16px', letterSpacing: '-0.03em' }}>
          Built for High-Velocity <br />
          <span className="text-gradient">Indian Ecommerce Operators</span>
        </h2>
        <p className="section-subtitle" style={{ fontSize: '16px', color: '#475569', maxWidth: '720px', margin: '0 auto', lineHeight: 1.6 }}>
          Inspect the live autonomous pipelines and visual telemetry modules that protect your margins, eliminate RTO losses, and automate fulfillment 24/7.
        </p>
      </div>

      {/* Tab Navigation Pill Bar */}
      <div className="tab-nav" role="tablist" style={{ maxWidth: '880px', margin: '0 auto 36px', display: 'flex', gap: '8px', background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(10px)', padding: '6px', borderRadius: '9999px', border: '1.5px solid rgba(186, 230, 253, 0.8)', boxShadow: '0 8px 24px -4px rgba(14, 165, 233, 0.12)' }}>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'cod' ? 'active' : ''}`}
          onClick={() => setActiveTab('cod')}
          role="tab"
          aria-selected={activeTab === 'cod'}
        >
          <ShieldCheck size={16} />
          <span>COD Risk Radar</span>
        </button>

        <button
          type="button"
          className={`tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
          role="tab"
          aria-selected={activeTab === 'inventory'}
        >
          <Boxes size={16} />
          <span>Predictive Inventory</span>
        </button>

        <button
          type="button"
          className={`tab-btn ${activeTab === 'ndr' ? 'active' : ''}`}
          onClick={() => setActiveTab('ndr')}
          role="tab"
          aria-selected={activeTab === 'ndr'}
        >
          <Truck size={16} />
          <span>NDR Delivery Recovery</span>
        </button>

        <button
          type="button"
          className={`tab-btn ${activeTab === 'copilot' ? 'active' : ''}`}
          onClick={() => setActiveTab('copilot')}
          role="tab"
          aria-selected={activeTab === 'copilot'}
        >
          <Bot size={16} />
          <span>AI Operations Copilot</span>
        </button>

        <button
          type="button"
          className={`tab-btn ${activeTab === 'sync' ? 'active' : ''}`}
          onClick={() => setActiveTab('sync')}
          role="tab"
          aria-selected={activeTab === 'sync'}
        >
          <Layers size={16} />
          <span>Multi-Store Parity</span>
        </button>
      </div>

      {/* Tab Content Panes with Vector SVG Demonstrations */}
      <div className="mockup-wrapper" style={{ marginBottom: '56px' }}>
        
        {/* Tab 1: COD Risk Radar */}
        {activeTab === 'cod' && (
          <div className="showcase-detail-grid">
            <div className="showcase-info-col">
              <span className="badge badge-indigo" style={{ marginBottom: '12px', display: 'inline-flex' }}>
                Pre-Dispatch Risk Screening
              </span>
              <h3 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '14px' }}>
                Deterministic COD Risk Scoring &amp; Address Verification
              </h3>
              <p style={{ fontSize: '14.5px', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
                Every cash-on-delivery order is scored against multiple risk signals before warehouse packaging. 
                Incomplete addresses or repeated returners automatically receive a 1-click email confirmation with an expiring link.
              </p>

              <div className="showcase-feature-points">
                <div className="showcase-point">
                  <div className="showcase-point-icon">
                    <Check size={13} />
                  </div>
                  <div>
                    <strong>Automated Landmark &amp; Pin Code Validation:</strong> Identifies missing house numbers or street landmarks and prompts buyers via branded email.
                  </div>
                </div>
                <div className="showcase-point">
                  <div className="showcase-point-icon">
                    <Check size={13} />
                  </div>
                  <div>
                    <strong>Prepaid Conversion Incentive:</strong> Borderline risky orders are incentivized with an instant 5% UPI discount to convert into prepaid.
                  </div>
                </div>
                <div className="showcase-point">
                  <div className="showcase-point-icon">
                    <Check size={13} />
                  </div>
                  <div>
                    <strong>99.4% Screening Accuracy:</strong> Reduces courier freight losses and return shipping fees by over 38%.
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '28px' }}>
                <Link to="/signup" className="modelled-btn-cta">
                  Test COD Verification Free
                  <ArrowRight size={16} style={{ marginLeft: '6px' }} />
                </Link>
              </div>
            </div>

            <div className="showcase-visual-container">
              <img 
                src="/assets/images/order-verification-3d.jpg" 
                alt="CommercePilot AI Order Verification 3D Interface showing Order TT10245, 65/100 High Risk" 
                style={{ width: '100%', height: 'auto', borderRadius: '16px', border: '1.5px solid rgba(186, 230, 253, 0.8)', boxShadow: '0 16px 36px -4px rgba(14, 165, 233, 0.15)' }}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Predictive Inventory */}
        {activeTab === 'inventory' && (
          <div className="showcase-detail-grid">
            <div className="showcase-info-col">
              <span className="badge badge-success" style={{ marginBottom: '12px', display: 'inline-flex' }}>
                Predictive Runway Engine
              </span>
              <h3 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '14px' }}>
                Sales Velocity &amp; Automated Supplier Purchase Orders
              </h3>
              <p style={{ fontSize: '14.5px', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
                Continuously calculates daily sales velocity, supplier lead times, and dynamic safety stock thresholds. 
                When runway drops below safe limits, a ready-to-approve purchase order is automatically drafted.
              </p>

              <div className="showcase-feature-points">
                <div className="showcase-point">
                  <div className="showcase-point-icon">
                    <Check size={13} />
                  </div>
                  <div>
                    <strong>Exact Runway Projections:</strong> Displays days of available stock based on real trailing 7-day multi-channel sales.
                  </div>
                </div>
                <div className="showcase-point">
                  <div className="showcase-point-icon">
                    <Check size={13} />
                  </div>
                  <div>
                    <strong>Automated Supplier POs:</strong> Generates ready-to-send purchase orders addressed to your registered manufacturers.
                  </div>
                </div>
                <div className="showcase-point">
                  <div className="showcase-point-icon">
                    <Check size={13} />
                  </div>
                  <div>
                    <strong>Zero Overselling:</strong> Intelligently locks safety stock reserves across Shopify, Instagram, and WhatsApp channels.
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '28px' }}>
                <Link to="/signup" className="modelled-btn-cta">
                  Prevent Stockouts Now
                  <ArrowRight size={16} style={{ marginLeft: '6px' }} />
                </Link>
              </div>
            </div>

            <div className="showcase-visual-container">
              <img 
                src="/assets/images/inventory-intelligence-3d.jpg" 
                alt="CommercePilot AI Predictive Inventory Intelligence showing Black Kurti 25 units, 1.67 days runway" 
                style={{ width: '100%', height: 'auto', borderRadius: '16px', border: '1.5px solid rgba(186, 230, 253, 0.8)', boxShadow: '0 16px 36px -4px rgba(14, 165, 233, 0.15)' }}
              />
            </div>
          </div>
        )}

        {/* Tab 3: NDR Delivery Recovery */}
        {activeTab === 'ndr' && (
          <div className="showcase-detail-grid">
            <div className="showcase-info-col">
              <span className="badge badge-warning" style={{ marginBottom: '12px', display: 'inline-flex' }}>
                Courier Event Interception
              </span>
              <h3 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '14px' }}>
                Sub-60s Delivery Exception (NDR) Customer Recovery
              </h3>
              <p style={{ fontSize: '14.5px', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
                When Delhivery or BlueDart reports a failed delivery attempt ("Customer unavailable" or "Address incomplete"), 
                CommercePilot AI immediately contacts the customer via branded email to capture a rescheduled slot.
              </p>

              <div className="showcase-feature-points">
                <div className="showcase-point">
                  <div className="showcase-point-icon">
                    <Check size={13} />
                  </div>
                  <div>
                    <strong>Instant Customer Outreach:</strong> Re-engages the customer while the courier rider is still in their locality.
                  </div>
                </div>
                <div className="showcase-point">
                  <div className="showcase-point-icon">
                    <Check size={13} />
                  </div>
                  <div>
                    <strong>Fake Attempt Dispute Logs:</strong> Verifies buyer availability with geolocation timestamps to penalize false courier remarks.
                  </div>
                </div>
                <div className="showcase-point">
                  <div className="showcase-point-icon">
                    <Check size={13} />
                  </div>
                  <div>
                    <strong>Automated Re-Attempt Scheduling:</strong> Syncs customer response back to carrier APIs for scheduled delivery.
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '28px' }}>
                <Link to="/signup" className="modelled-btn-cta">
                  Start Courier Recovery
                  <ArrowRight size={16} style={{ marginLeft: '6px' }} />
                </Link>
              </div>
            </div>

            <div className="showcase-visual-container">
              <img 
                src="/assets/images/ndr-recovery-visual.svg" 
                alt="CommercePilot AI NDR Delivery Recovery Interface" 
                style={{ width: '100%', height: 'auto', borderRadius: '16px', border: '1.5px solid rgba(186, 230, 253, 0.8)', boxShadow: '0 16px 36px -4px rgba(14, 165, 233, 0.15)' }}
              />
            </div>
          </div>
        )}

        {/* Tab 4: AI Operations Copilot */}
        {activeTab === 'copilot' && (
          <div className="showcase-detail-grid">
            <div className="showcase-info-col">
              <span className="badge badge-indigo" style={{ marginBottom: '12px', display: 'inline-flex' }}>
                Groq-Powered Intelligence
              </span>
              <h3 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '14px' }}>
                Data-Grounded Business Intelligence &amp; Margin Analytics
              </h3>
              <p style={{ fontSize: '14.5px', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
                Eliminate spreadsheet chaos. Ask natural language questions about your store's performance, return patterns, 
                and unit economics. Every answer is strictly computed from your real database with zero hallucination.
              </p>

              <div className="showcase-feature-points">
                <div className="showcase-point">
                  <div className="showcase-point-icon">
                    <Check size={13} />
                  </div>
                  <div>
                    <strong>Conversational Queries:</strong> "Which SKUs should I reorder?", "How many failed deliveries occurred this week?"
                  </div>
                </div>
                <div className="showcase-point">
                  <div className="showcase-point-icon">
                    <Check size={13} />
                  </div>
                  <div>
                    <strong>Realized Net Margin Tracking:</strong> Calculates true profits after deducting courier returns, COD fees, and marketing.
                  </div>
                </div>
                <div className="showcase-point">
                  <div className="showcase-point-icon">
                    <Check size={13} />
                  </div>
                  <div>
                    <strong>Automated Morning Digest:</strong> Delivers daily store performance updates directly to your seller inbox.
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '28px' }}>
                <Link to="/signup" className="modelled-btn-cta">
                  Ask AI Copilot
                  <ArrowRight size={16} style={{ marginLeft: '6px' }} />
                </Link>
              </div>
            </div>

            <div className="showcase-visual-container">
              <img 
                src="/assets/images/platform-hub-3d.jpg" 
                alt="CommercePilot AI Central 4-Pillar Autonomous Operations Hub" 
                style={{ width: '100%', height: 'auto', borderRadius: '16px', border: '1.5px solid rgba(186, 230, 253, 0.8)', boxShadow: '0 16px 36px -4px rgba(14, 165, 233, 0.15)' }}
              />
            </div>
          </div>
        )}

        {/* Tab 5: Multi-Store Parity */}
        {activeTab === 'sync' && (
          <div className="showcase-detail-grid">
            <div className="showcase-info-col">
              <span className="badge badge-success" style={{ marginBottom: '12px', display: 'inline-flex' }}>
                Multi-Channel Inventory Ledger
              </span>
              <h3 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '14px' }}>
                Live Ledger Synchronization Across Storefronts
              </h3>
              <p style={{ fontSize: '14.5px', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
                Synchronize stock availability across Shopify, Instagram D2C orders, and WooCommerce in real-time. 
                Enforces automated safety buffers so rapid social order surges never lead to unfulfillable cancellations.
              </p>

              <div className="showcase-feature-points">
                <div className="showcase-point">
                  <div className="showcase-point-icon">
                    <Check size={13} />
                  </div>
                  <div>
                    <strong>Zero-Latency Webhooks:</strong> Immediate balance adjustments when an order is placed anywhere.
                  </div>
                </div>
                <div className="showcase-point">
                  <div className="showcase-point-icon">
                    <Check size={13} />
                  </div>
                  <div>
                    <strong>SKU Variant Mapping:</strong> Harmonizes different naming conventions and sizes across storefronts.
                  </div>
                </div>
                <div className="showcase-point">
                  <div className="showcase-point-icon">
                    <Check size={13} />
                  </div>
                  <div>
                    <strong>Channel Prioritization:</strong> Allocates high-margin inventory to your most profitable channels first.
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '28px' }}>
                <Link to="/signup" className="modelled-btn-cta">
                  Sync Multi-Channel Catalog
                  <ArrowRight size={16} style={{ marginLeft: '6px' }} />
                </Link>
              </div>
            </div>

            <div className="showcase-visual-container">
              <img 
                src="/assets/images/ecommerce-cart-bags-3d.png" 
                alt="CommercePilot AI Multi-Channel Synchronization showing 3D Shopping Cart and Bags" 
                style={{ width: '100%', height: 'auto', borderRadius: '16px', border: '1.5px solid rgba(186, 230, 253, 0.8)', boxShadow: '0 16px 36px -4px rgba(14, 165, 233, 0.15)' }}
              />
            </div>
          </div>
        )}

      </div>

      {/* NEW SECTION: Real-World E-Commerce Automation Suite */}
      <div style={{ marginTop: '64px', paddingTop: '48px', borderTop: '1.5px solid rgba(186, 230, 253, 0.6)' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 16px', background: 'rgba(14, 165, 233, 0.1)', border: '1px solid rgba(14, 165, 233, 0.3)', borderRadius: '9999px', fontSize: '12.5px', fontWeight: 600, color: '#0284C7', marginBottom: '12px' }}>
            <Sparkles size={13} />
            <span>Real-World Operations Gallery</span>
          </div>
          <h3 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.025em', marginBottom: '12px' }}>
            Engineered for Modern Indian E-Commerce Brands
          </h3>
          <p style={{ fontSize: '15px', color: '#64748B', maxWidth: '680px', margin: '0 auto', lineHeight: 1.6 }}>
            Inspect the live autonomous pipelines protecting Trendy Threads: Smart COD risk scoring on Order #TT10245, 
            predictive 1.67-day stockout runway for Black Kurtis, and autonomous PO dispatches.
          </p>
        </div>

        {/* 3 Luxury Visual Cards Grid (3D Product UI) */}
        <div className="omnichannel-media-grid">
          
          {/* Card 1: 3D Operations Suite (Order Verification + Inventory Runway) */}
          <div className="omnichannel-media-card" style={{ background: '#FFFFFF', border: '1.5px solid rgba(186, 230, 253, 0.9)' }}>
            <img 
              src="/assets/images/trendy-threads-operations-3d.jpg" 
              alt="CommercePilot AI Order Verification & Inventory Intelligence 3D Suite"
              className="omnichannel-media-img"
              style={{ objectFit: 'cover', height: '100%' }}
            />
          </div>

          {/* Card 2: Central Platform Hub */}
          <div className="omnichannel-media-card" style={{ background: '#FFFFFF', border: '1.5px solid rgba(186, 230, 253, 0.9)' }}>
            <img 
              src="/assets/images/platform-hub-3d.jpg" 
              alt="CommercePilot AI 4-Pillar Central Autonomous Architecture Hub"
              className="omnichannel-media-img"
              style={{ objectFit: 'cover', height: '100%' }}
            />
          </div>

          {/* Card 3: 3D Shopping Cart & Bags */}
          <div className="omnichannel-media-card" style={{ background: '#FFFFFF', border: '1.5px solid rgba(186, 230, 253, 0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img 
              src="/assets/images/ecommerce-cart-bags-3d.png" 
              alt="CommercePilot AI Omnichannel Cart & Delivery Fulfillment"
              className="omnichannel-media-img"
              style={{ objectFit: 'contain', padding: '16px' }}
            />
          </div>

        </div>

        {/* Brand Economics Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '32px', flexWrap: 'wrap', padding: '20px 24px', background: 'rgba(255, 255, 255, 0.8)', border: '1px solid rgba(186, 230, 253, 0.8)', borderRadius: '20px', marginTop: '32px', boxShadow: '0 8px 20px -4px rgba(14, 165, 233, 0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)' }}></div>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>Zero Overselling Guaranteed</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#0284C7', boxShadow: '0 0 8px rgba(2, 132, 199, 0.6)' }}></div>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>Sub-60s Verification Latency</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#8B5CF6', boxShadow: '0 0 8px rgba(139, 92, 246, 0.6)' }}></div>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>Multi-Channel Shopify &amp; Instagram Sync</span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ProductShowcase;
