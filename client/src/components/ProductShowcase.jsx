import React, { useState } from 'react';
import AnimatedRupee from './AnimatedRupee';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Boxes, 
  Truck, 
  Bot, 
  BarChart3,
  TrendingUp, 
  Check, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle,
  Send,
  Zap,
  ShoppingBag,
  ExternalLink,
  Cpu,
  Layers,
  ArrowUpRight,
  Database,
  RefreshCw,
  Bell,
  Smartphone,
  Package,
  HelpCircle
} from 'lucide-react';

const ProductShowcase = () => {
  // Interactive state for Feature 4: AI Operations Copilot
  const [selectedQuestionIdx, setSelectedQuestionIdx] = useState(0);

  // Copilot questions and grounded responses matching test suite data
  const copilotQA = [
    {
      q: "Which products need immediate restocking?",
      reply: "Women's Black Kurti (TT-KUR-BLK) has 1.67 days of stock left with 25 units in warehouse and 15 daily sales. Supplier PO #PO-1001 for 650 units has been prepared for Coimbatore Fabric Mills.",
      badge: "Stockout Warning • Critical Runway",
      badgeColor: "#EF4444"
    },
    {
      q: "Which COD orders require manual review?",
      reply: "Order #TT10245 (₹2,500) for Ananya Deshmukh in Coimbatore is flagged with a Risk Score of 65/100 (HIGH RISK) due to an incomplete street address and a past RTO record. Confirmation requested.",
      badge: "COD Risk Score: 65/100 (HIGH)",
      badgeColor: "#F59E0B"
    },
    {
      q: "How many deliveries failed today?",
      reply: "1 courier non-delivery report (NDR) intercepted: AWB DEL-TT10245 via Delhivery ('Customer unavailable'). Automated WhatsApp recovery was triggered; customer replied YES. Redelivery is scheduled.",
      badge: "1 NDR Recovered (100% Rate)",
      badgeColor: "#10B981"
    },
    {
      q: "Which operational issues need my attention?",
      reply: "2 priority actions: 1) Approve Purchase Order PO-1001 (₹45,000) for Coimbatore Fabric Mills to prevent stockout, and 2) Review Order #TT10245 if buyer does not confirm within 6 hours.",
      badge: "2 Priority Action Items",
      badgeColor: "#4F46E5"
    }
  ];

  const scrollToCapabilities = () => {
    const el = document.getElementById('capabilities-breakdown');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="product-showcase-master">
      
      {/* ==================================================================== */}
      {/* 1. PRODUCT PAGE HERO: POWERFUL MARKETING & ASYMMETRIC COLLAGE       */}
      {/* ==================================================================== */}
      <section className="prod-hero-section">
        <div className="prod-hero-ambient-glow" />
        <div className="prod-blueprint-grid" />

        <div className="prod-hero-inner">
          
          {/* Left Column: Value Messaging */}
          <div className="prod-hero-text-col">
            <div className="prod-hero-eyebrow">
              <Sparkles size={14} className="prod-eyebrow-sparkle" />
              <span>THE INTELLIGENCE ENGINE FOR MODERN COMMERCE</span>
            </div>

            <h1 className="prod-hero-title">
              YOUR COMMERCE BUSINESS. <br />
              ON AUTOPILOT. <br />
              <span className="prod-title-gradient">POWERED BY AI.</span>
            </h1>

            <p className="prod-hero-desc">
              From preventing risky COD orders to predicting stock shortages and recovering failed deliveries, 
              CommercePilot AI transforms everyday e-commerce operations into intelligent, automated workflows.
            </p>

            {/* Three Concise Value Propositions */}
            <div className="prod-value-props-list">
              <div className="prod-value-prop-item">
                <div className="prod-check-circle">
                  <Check size={12} strokeWidth={3} />
                </div>
                <span>Prevent revenue losses before they happen.</span>
              </div>
              <div className="prod-value-prop-item">
                <div className="prod-check-circle">
                  <Check size={12} strokeWidth={3} />
                </div>
                <span>Predict inventory needs before products run out.</span>
              </div>
              <div className="prod-value-prop-item">
                <div className="prod-check-circle">
                  <Check size={12} strokeWidth={3} />
                </div>
                <span>Recover failed deliveries without manual follow-ups.</span>
              </div>
            </div>

            {/* Hero CTAs */}
            <div className="prod-hero-ctas">
              <button 
                type="button" 
                onClick={scrollToCapabilities}
                className="prod-btn-primary"
              >
                <span>Explore AI Capabilities</span>
                <ArrowRight size={15} />
              </button>
              <Link to="/app/overview" className="prod-btn-secondary">
                <span>Launch Workspace</span>
                <ArrowUpRight size={15} />
              </Link>
            </div>

            {/* Trust-Oriented Indicator */}
            <div className="prod-trust-bar">
              <CheckCircle2 size={15} className="prod-trust-check-icon" />
              <span>One intelligent platform. Four essential commerce operations. Continuous business visibility.</span>
            </div>
          </div>

          {/* Right Column: Creative Asymmetric Shopping Image Collage */}
          <div className="prod-hero-visual-col">
            <div className="prod-collage-canvas">
              
              {/* Main Feature Image: Designer Shoes & Sneakers Collection */}
              <div className="collage-shape-arch">
                <img 
                  src="https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80" 
                  alt="Designer Footwear and Sneakers Collection" 
                  className="collage-img-arch"
                />
                <div className="collage-arch-overlay" />
                <div className="crop-live-pill">
                  <Sparkles size={11} />
                  <span>Curated Footwear SKU</span>
                </div>
              </div>

              {/* Floating 3D Gift Shopping Bags (Top-Right Angle) */}
              <div className="collage-floating-bags">
                <img 
                  src="/assets/images/3d-shopping-cart.svg" 
                  alt="3D Miniature Wire Shopping Cart with Purple & Blue Bags" 
                  className="collage-bags-svg"
                />
              </div>

              {/* Shipping Package Card (Bottom-Left) */}
              <div className="collage-package-card">
                <div className="package-card-icon-box">
                  <Package size={18} />
                </div>
                <div>
                  <div className="package-card-title">Order #TT10245</div>
                  <div className="package-card-meta"><AnimatedRupee value={2500} suffix=" • Prepaid Verified" /></div>
                </div>
                <span className="package-status-tag">Ready to Pack</span>
              </div>

              {/* Mobile Shopping Verified Screen (Floating Right) */}
              <div className="collage-mobile-card">
                <div className="mobile-card-header">
                  <span className="mobile-signal-dot" />
                  <span>Live Telemetry</span>
                </div>
                <div className="mobile-card-body">
                  <div className="mobile-card-metric">
                    <span className="metric-label">Stock Runway</span>
                    <span className="metric-val text-cyan">1.67 Days</span>
                  </div>
                  <div className="mobile-card-metric">
                    <span className="metric-label">Courier Recovery</span>
                    <span className="metric-val text-green">91% Recovered</span>
                  </div>
                </div>
              </div>

              {/* Subtle Floating AI Intelligence Status Indicators */}
              <div className="collage-ai-chip chip-1">
                <div className="ai-chip-pulsar pulse-indigo" />
                <span>Deterministic COD Risk: Evaluated</span>
              </div>

              <div className="collage-ai-chip chip-2">
                <div className="ai-chip-pulsar pulse-green" />
                <span>Automated Dispatch: Active 24/7</span>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Anchor for Smooth Scroll */}
      <div id="capabilities-breakdown" />

      {/* ==================================================================== */}
      {/* 2. FIVE INDIVIDUAL VISUAL STORYTELLING CAPABILITIES                  */}
      {/* ==================================================================== */}

      {/* ------------------------------------------------------------------ */}
      {/* FEATURE 01: SMART COD RISK VERIFICATION                           */}
      {/* ------------------------------------------------------------------ */}
      <section className="prod-feature-story">
        <div className="prod-feature-container">
          
          <div className="prod-feature-text-block">
            <span className="prod-feature-eyebrow">PROTECT EVERY ORDER</span>
            <h2 className="prod-feature-heading">
              STOP LOSING MONEY TO ORDERS THAT SHOULD NEVER HAVE SHIPPED.
            </h2>
            <p className="prod-feature-desc">
              Not every order deserves immediate dispatch. CommercePilot AI evaluates incoming Cash-on-Delivery orders 
              using address completeness, order history and available risk signals, helping businesses identify potentially 
              risky orders before they become expensive returns.
            </p>

            <div className="prod-feature-highlights">
              <div className="highlight-row">
                <div className="highlight-bullet"><Check size={12} strokeWidth={3} /></div>
                <span>Address completeness verification and landmark checking</span>
              </div>
              <div className="highlight-row">
                <div className="highlight-bullet"><Check size={12} strokeWidth={3} /></div>
                <span>Historical delivery risk and prior RTO pattern analysis</span>
              </div>
              <div className="highlight-row">
                <div className="highlight-bullet"><Check size={12} strokeWidth={3} /></div>
                <span>Customer confirmation workflows via 1-click tokenized emails</span>
              </div>
              <div className="highlight-row">
                <div className="highlight-bullet"><Check size={12} strokeWidth={3} /></div>
                <span>Pre-dispatch risk assessment before warehouse packing begins</span>
              </div>
            </div>

            <Link to="/app/orders" className="prod-feature-cta-btn">
              <span>Discover Smart Order Verification</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="prod-feature-visual-block">
            <div className="visual-media-stack">
              {/* Luxury Designer Dresses & Fashion Apparel Showcase */}
              <div className="visual-organic-crop crop-kurti">
                <img 
                  src="https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=800&q=80" 
                  alt="Designer Boutique Dresses and Fashion Apparel" 
                  className="organic-img"
                />
                <div className="crop-live-pill">
                  <Sparkles size={11} />
                  <span>Catalog SKU: TT-KUR-COT</span>
                </div>
              </div>

              {/* 3D Shopping Trolley Logo Floating Above Corner */}
              <div className="floating-trolley-badge">
                <img 
                  src="/assets/images/3d-shopping-cart.svg" 
                  alt="E-Commerce Shopping Trolley with Bags" 
                  className="trolley-svg"
                />
              </div>

              {/* Top-Left Corner Chip */}
              <div className="corner-ai-chip chip-corner-top-left">
                <div className="ai-chip-pulsar pulse-indigo" />
                <span>Deterministic COD Risk: Evaluated</span>
              </div>

              {/* Floating Live Risk Radar Card on Upper Corner */}
              <div className="floating-telemetry-badge badge-risk">
                <div className="telemetry-badge-header">
                  <div className="telemetry-icon-box text-amber">
                    <ShieldCheck size={14} />
                  </div>
                  <div className="telemetry-title-group">
                    <span className="telemetry-badge-title">COD Risk Radar</span>
                    <span className="telemetry-sub-tag">Pre-Dispatch AI Gate</span>
                  </div>
                  <span className="telemetry-pulse-dot dot-amber" />
                </div>
                <div className="telemetry-score-row">
                  <div className="score-val-col">
                    <span className="telemetry-big-score text-amber">65/100</span>
                    <span className="telemetry-score-sub">Risk Index</span>
                  </div>
                  <span className="telemetry-tier-tag tier-high">HIGH RISK</span>
                </div>
                <div className="telemetry-reasons-list">
                  <div className="reason-item">⚠ Missing street landmark</div>
                  <div className="reason-item">⚠ Prior delivery exception</div>
                </div>
                <div className="telemetry-action-hint">
                  <span className="hint-label">Action:</span>
                  <span className="hint-status status-amber">CONFIRMATION_REQ</span>
                </div>
              </div>

              {/* Bottom-Right Corner Chip */}
              <div className="corner-ai-chip chip-corner-bottom-right">
                <div className="ai-chip-pulsar pulse-green" />
                <span>Automated Dispatch: Active 24/7</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* FEATURE 02: PREDICTIVE INVENTORY INTELLIGENCE                      */}
      {/* ------------------------------------------------------------------ */}
      <section className="prod-feature-story reverse">
        <div className="prod-feature-container">
          
          <div className="prod-feature-text-block">
            <span className="prod-feature-eyebrow">NEVER MISS A RESTOCK MOMENT</span>
            <h2 className="prod-feature-heading">
              YOUR NEXT STOCKOUT SHOULDN'T BE A SURPRISE.
            </h2>
            <p className="prod-feature-desc">
              CommercePilot AI analyzes inventory levels and sales velocity to identify products approaching stockout conditions. 
              Get intelligent reorder recommendations and prepare supplier purchase orders before demand exceeds available stock.
            </p>

            <div className="prod-feature-highlights">
              <div className="highlight-row">
                <div className="highlight-bullet"><Check size={12} strokeWidth={3} /></div>
                <span>Continuous multi-channel inventory buffer monitoring</span>
              </div>
              <div className="highlight-row">
                <div className="highlight-bullet"><Check size={12} strokeWidth={3} /></div>
                <span>Sales velocity analysis across trailing 7-day demand spikes</span>
              </div>
              <div className="highlight-row">
                <div className="highlight-bullet"><Check size={12} strokeWidth={3} /></div>
                <span>Estimated days-of-stock calculations against supplier lead times</span>
              </div>
              <div className="highlight-row">
                <div className="highlight-bullet"><Check size={12} strokeWidth={3} /></div>
                <span>Reorder recommendations with auto-drafted supplier purchase orders</span>
              </div>
              <div className="highlight-row">
                <div className="highlight-bullet"><Check size={12} strokeWidth={3} /></div>
                <span>Purchase-order draft preparation ready for 1-click merchant sign-off</span>
              </div>
            </div>

            <Link to="/app/inventory" className="prod-feature-cta-btn">
              <span>Explore Predictive Inventory</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="prod-feature-visual-block">
            <div className="visual-media-stack">
              {/* Luxury Footwear & Shoes Product Showcase */}
              <div className="visual-organic-crop crop-warehouse">
                <img 
                  src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80" 
                  alt="Premium Footwear and Athletic Shoes Product Inventory" 
                  className="organic-img"
                />
                <div className="crop-live-pill">
                  <Boxes size={11} />
                  <span>SKU TT-KUR-BLK • Live Stock</span>
                </div>
              </div>

              {/* 3D Shopping Trolley Logo Floating Above Corner */}
              <div className="floating-trolley-badge">
                <img 
                  src="/assets/images/3d-shopping-cart.svg" 
                  alt="E-Commerce Shopping Trolley with Bags" 
                  className="trolley-svg"
                />
              </div>

              {/* Top-Right Corner Chip */}
              <div className="corner-ai-chip chip-corner-top-left">
                <div className="ai-chip-pulsar pulse-cyan" />
                <span>Multi-Store Velocity Sync</span>
              </div>

              {/* Floating Inventory Runway Card on Corner */}
              <div className="floating-telemetry-badge badge-runway">
                <div className="telemetry-badge-header">
                  <div className="telemetry-icon-box text-cyan">
                    <Boxes size={14} />
                  </div>
                  <div className="telemetry-title-group">
                    <span className="telemetry-badge-title">Predictive Runway</span>
                    <span className="telemetry-sub-tag">Stockout Forecast</span>
                  </div>
                  <span className="telemetry-pulse-dot dot-red" />
                </div>
                <div className="telemetry-sku-title">Black Kurti (TT-KUR-BLK)</div>
                <div className="runway-stat-pills">
                  <div className="runway-pill">
                    <span className="pill-muted">Stock</span>
                    <span className="pill-bold">25 u</span>
                  </div>
                  <div className="runway-pill">
                    <span className="pill-muted">Velocity</span>
                    <span className="pill-bold text-cyan">15/d</span>
                  </div>
                  <div className="runway-pill pill-alert">
                    <span className="pill-muted">Runway</span>
                    <span className="pill-bold text-red">1.67 D</span>
                  </div>
                </div>
                <div className="auto-drafted-po-box">
                  <div className="po-box-header">
                    <Sparkles size={11} className="text-indigo" />
                    <span>Auto-Draft PO #1001</span>
                    <span className="po-ready-pill">Ready</span>
                  </div>
                  <div className="po-box-details">
                    Coimbatore Fabric Mills • 650 Units
                  </div>
                </div>
              </div>

              {/* Bottom-Left Corner Chip */}
              <div className="corner-ai-chip chip-corner-bottom-right">
                <div className="ai-chip-pulsar pulse-indigo" />
                <span>PO #PO-1001: Ready to Sign</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* FEATURE 03: NDR DELIVERY RECOVERY                                  */}
      {/* ------------------------------------------------------------------ */}
      <section className="prod-feature-story">
        <div className="prod-feature-container">
          
          <div className="prod-feature-text-block">
            <span className="prod-feature-eyebrow">TURN FAILED DELIVERIES INTO RECOVERED ORDERS</span>
            <h2 className="prod-feature-heading">
              A FAILED DELIVERY DOESN'T HAVE TO MEAN A LOST CUSTOMER.
            </h2>
            <p className="prod-feature-desc">
              When a delivery attempt fails, CommercePilot AI helps initiate timely customer follow-ups, capture redelivery responses 
              and keep business owners informed. Recover opportunities that might otherwise disappear in manual delivery tracking.
            </p>

            <div className="prod-feature-highlights">
              <div className="highlight-row">
                <div className="highlight-bullet"><Check size={12} strokeWidth={3} /></div>
                <span>Sub-60 second courier non-delivery report (NDR) interception</span>
              </div>
              <div className="highlight-row">
                <div className="highlight-bullet"><Check size={12} strokeWidth={3} /></div>
                <span>Automated customer follow-ups via branded email and approved WhatsApp flows</span>
              </div>
              <div className="highlight-row">
                <div className="highlight-bullet"><Check size={12} strokeWidth={3} /></div>
                <span>Direct customer response tracking: Capture "YES" confirmations or address changes</span>
              </div>
              <div className="highlight-row">
                <div className="highlight-bullet"><Check size={12} strokeWidth={3} /></div>
                <span>Automated redelivery re-attempt scheduling with carrier APIs</span>
              </div>
            </div>

            <Link to="/app/deliveries" className="prod-feature-cta-btn">
              <span>Explore Delivery Recovery</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="prod-feature-visual-block">
            <div className="visual-media-stack">
              {/* E-Commerce Courier Shipping Parcels & Packaging */}
              <div className="visual-organic-crop crop-delivery">
                <img 
                  src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80" 
                  alt="E-Commerce Courier Shipping Parcels and Packaging" 
                  className="organic-img"
                />
                <div className="crop-live-pill">
                  <Truck size={11} />
                  <span>Delhivery AWB DEL-TT10245</span>
                </div>
              </div>

              {/* 3D Shopping Trolley Logo Floating Above Corner */}
              <div className="floating-trolley-badge">
                <img 
                  src="/assets/images/3d-shopping-cart.svg" 
                  alt="E-Commerce Shopping Trolley with Bags" 
                  className="trolley-svg"
                />
              </div>

              {/* Top-Left Corner Chip */}
              <div className="corner-ai-chip chip-corner-top-left">
                <div className="ai-chip-pulsar pulse-green" />
                <span>Sub-60s NDR Interception</span>
              </div>

              {/* Floating WhatsApp / NDR Message Simulation Card on Corner */}
              <div className="floating-telemetry-badge badge-ndr">
                <div className="telemetry-badge-header">
                  <div className="telemetry-icon-box text-green">
                    <Truck size={14} />
                  </div>
                  <div className="telemetry-title-group">
                    <span className="telemetry-badge-title">WhatsApp Recovery</span>
                    <span className="telemetry-sub-tag">Buyer Outreach</span>
                  </div>
                  <span className="telemetry-pulse-dot dot-green" />
                </div>
                <div className="whatsapp-chat-bubble">
                  <div className="whatsapp-bubble-text">
                    "Order TT10245 delivery missed. Reply YES to reschedule."
                  </div>
                  <div className="whatsapp-bubble-time">10:42 AM • Delivered ✓✓</div>
                </div>
                <div className="whatsapp-reply-bubble">
                  <span>YES, deliver tomorrow 2-5 PM</span>
                  <div className="reply-check-double">✓✓</div>
                </div>
                <div className="ndr-status-recovered">
                  <CheckCircle2 size={12} />
                  <span>OUT_FOR_DELIVERY (Attempt #2 Booked)</span>
                </div>
              </div>

              {/* Bottom-Right Corner Chip */}
              <div className="corner-ai-chip chip-corner-bottom-right">
                <div className="ai-chip-pulsar pulse-green" />
                <span>Carrier Re-Attempt Scheduled</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* FEATURE 04: AI OPERATIONS COPILOT                                  */}
      {/* ------------------------------------------------------------------ */}
      <section className="prod-feature-story reverse">
        <div className="prod-feature-container">
          
          <div className="prod-feature-text-block">
            <span className="prod-feature-eyebrow">YOUR BUSINESS. ONE INTELLIGENT ASSISTANT.</span>
            <h2 className="prod-feature-heading">
              STOP SWITCHING BETWEEN TOOLS TO UNDERSTAND YOUR BUSINESS.
            </h2>
            <p className="prod-feature-desc">
              Ask questions about your commerce operations in natural language. CommercePilot AI connects business information 
              with intelligent analysis to help you understand orders, inventory, delivery issues and operational priorities.
            </p>

            {/* Clickable Example Questions */}
            <div className="copilot-questions-picker">
              <span className="picker-label">Click an example question to see live AI analysis:</span>
              <div className="picker-chips-grid">
                {copilotQA.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedQuestionIdx(idx)}
                    className={`picker-chip ${selectedQuestionIdx === idx ? 'active' : ''}`}
                  >
                    <span>{item.q}</span>
                  </button>
                ))}
              </div>
            </div>

            <Link to="/app/assistant" className="prod-feature-cta-btn">
              <span>Meet Your AI Copilot</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="prod-feature-visual-block">
            <div className="copilot-terminal-card">
              <div className="terminal-header">
                <div className="terminal-brand-group">
                  <div className="terminal-logo-box">
                    <Bot size={14} />
                  </div>
                  <div>
                    <div className="terminal-app-title">CommercePilot AI Assistant</div>
                    <div className="terminal-grounded-tag">Real-Time Store Operations Data</div>
                  </div>
                </div>
                <span className="live-badge-green">● Ready</span>
              </div>

              {/* Chat View */}
              <div className="terminal-chat-body">
                {/* User Message */}
                <div className="terminal-user-msg">
                  <span>{copilotQA[selectedQuestionIdx].q}</span>
                </div>

                {/* AI Assistant Grounded Response */}
                <div className="terminal-ai-msg">
                  <div className="ai-msg-avatar">
                    <Sparkles size={12} />
                  </div>
                  <div className="ai-msg-content">
                    <div className="ai-msg-badge" style={{ color: copilotQA[selectedQuestionIdx].badgeColor }}>
                      ● {copilotQA[selectedQuestionIdx].badge}
                    </div>
                    <p>{copilotQA[selectedQuestionIdx].reply}</p>
                  </div>
                </div>
              </div>

              <div className="terminal-footer-input">
                <span className="input-placeholder-text">Ask any question about orders, stock, or deliveries...</span>
                <button type="button" className="terminal-send-btn" aria-label="Send query">
                  <Send size={12} />
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* FEATURE 05: BUSINESS INTELLIGENCE                                  */}
      {/* ------------------------------------------------------------------ */}
      <section className="prod-feature-story">
        <div className="prod-feature-container">
          
          <div className="prod-feature-text-block">
            <span className="prod-feature-eyebrow">DECISIONS BACKED BY BUSINESS DATA</span>
            <h2 className="prod-feature-heading">
              KNOW WHAT'S HAPPENING. KNOW WHAT TO DO NEXT.
            </h2>
            <p className="prod-feature-desc">
              Transform your commerce data into understandable business intelligence. Explore sales trends, product performance, 
              customer activity and operational metrics through intelligent reports and visual analytics.
            </p>

            <div className="prod-feature-highlights">
              <div className="highlight-row">
                <div className="highlight-bullet"><Check size={12} strokeWidth={3} /></div>
                <span>True Net Profit Tracking: Gross Revenue (₹46,731) strictly distinguished from Net Margin (₹26,176) after COGS</span>
              </div>
              <div className="highlight-row">
                <div className="highlight-bullet"><Check size={12} strokeWidth={3} /></div>
                <span>Product performance analysis: Instant margin ranking across Sarees, Kurtis, and Dresses</span>
              </div>
              <div className="highlight-row">
                <div className="highlight-bullet"><Check size={12} strokeWidth={3} /></div>
                <span>Customer repeat behaviour: Identify loyal buyers to lower acquisition costs</span>
              </div>
              <div className="highlight-row">
                <div className="highlight-bullet"><Check size={12} strokeWidth={3} /></div>
                <span>Operational performance monitoring: Pinpoint courier return patterns across pin codes</span>
              </div>
              <div className="highlight-row">
                <div className="highlight-bullet"><Check size={12} strokeWidth={3} /></div>
                <span>AI-generated business recommendations: Actionable next steps, not confusing spreadsheets</span>
              </div>
            </div>

            <Link to="/app/analytics" className="prod-feature-cta-btn">
              <span>Explore Business Intelligence</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="prod-feature-visual-block">
            <div className="analytics-visual-dashboard luxury-card-elevation">
              
              {/* Luxury Top Status Header */}
              <div className="luxury-dash-topbar">
                <div className="dash-brand-pill">
                  <Sparkles size={12} className="text-indigo" />
                  <span>Verified Financial Ledger</span>
                </div>
                <div className="dash-live-badge">
                  <span className="live-pulse-dot dot-green" />
                  <span>Live Sync</span>
                </div>
              </div>

              {/* Financial KPI Summary Cards with Animated Rupee Counter */}
              <div className="kpi-two-col-grid">
                <div className="kpi-mini-card luxury-kpi-glass">
                  <div className="kpi-card-label-row">
                    <span className="kpi-card-label">Gross Revenue (GMV)</span>
                    <TrendingUp size={13} className="text-green" />
                  </div>
                  <div className="kpi-card-val text-navy">
                    <AnimatedRupee value={46731} />
                  </div>
                  <span className="luxury-trend-badge trend-up">↑ +18.4% this month</span>
                </div>

                <div className="kpi-mini-card luxury-kpi-electric">
                  <div className="kpi-card-label-row">
                    <span className="kpi-card-label text-white-80">Realized Net Profit</span>
                    <Sparkles size={13} className="text-cyan" />
                  </div>
                  <div className="kpi-card-val text-white">
                    <AnimatedRupee value={26176} />
                  </div>
                  <span className="luxury-margin-pill">56% Realized Margin</span>
                </div>
              </div>

              {/* Top Margin Product Catalog Card */}
              <div className="top-margin-card luxury-margin-card">
                <div className="top-margin-header">
                  <div className="header-icon-box">
                    <BarChart3 size={13} className="text-indigo" />
                  </div>
                  <span className="margin-header-title">High-Margin Product Performance</span>
                  <span className="live-tag-pill">Catalog</span>
                </div>

                {/* Saree Item */}
                <div className="margin-item-row">
                  <div className="item-name-col">
                    <span className="item-title">Chanderi Silk Saree</span>
                    <span className="item-sku">SKU: TT-SAR-SILK</span>
                    <div className="margin-mini-track">
                      <div className="margin-mini-fill fill-emerald" style={{ width: '68%' }} />
                    </div>
                  </div>
                  <div className="item-stat-col">
                    <span className="margin-percent-badge badge-emerald">68% Margin</span>
                    <span className="margin-rupee">
                      <AnimatedRupee value={1850} suffix=" Profit/Unit" />
                    </span>
                  </div>
                </div>

                {/* Kurti Item */}
                <div className="margin-item-row">
                  <div className="item-name-col">
                    <span className="item-title">Handloom Cotton Kurti</span>
                    <span className="item-sku">SKU: TT-KUR-COT</span>
                    <div className="margin-mini-track">
                      <div className="margin-mini-fill fill-indigo" style={{ width: '54%' }} />
                    </div>
                  </div>
                  <div className="item-stat-col">
                    <span className="margin-percent-badge badge-indigo">54% Margin</span>
                    <span className="margin-rupee">
                      <AnimatedRupee value={720} suffix=" Profit/Unit" />
                    </span>
                  </div>
                </div>
              </div>

              {/* Repeat Buyer Cohort Tag */}
              <div className="retention-cohort-tag luxury-cohort-banner">
                <div className="cohort-dot pulse-cyan-dot" />
                <span>Repeat Buyer Cohort: 14% of customers drive 32% of total store profits</span>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ==================================================================== */}
      {/* 3. REAL-WORLD BUSINESS STORYTELLING: TRENDY THREADS COIMBATORE       */}
      {/* ==================================================================== */}
      <section className="prod-storytelling-section">
        <div className="storytelling-container">
          
          <div className="storytelling-header">
            <span className="storytelling-eyebrow">REAL-WORLD COMMERCE SCENARIO</span>
            <h2 className="storytelling-title">
              BUILT FOR THE REAL CHALLENGES BEHIND EVERY ONLINE ORDER.
            </h2>
            <p className="storytelling-desc">
              Meet Trendy Threads, a growing online fashion business in Coimbatore. With hundreds of monthly orders 
              across Instagram, WhatsApp and its online store, managing orders, inventory and deliveries manually 
              becomes increasingly difficult.
            </p>
          </div>

          {/* Entrepreneur Lifestyle Visual Composition */}
          <div className="storytelling-hero-grid">
            
            <div className="storytelling-photo-col">
              <div className="lifestyle-image-frame">
                <img 
                  src="https://images.unsplash.com/photo-1479064555552-3ef4979f8908?auto=format&fit=crop&w=800&q=80" 
                  alt="Trendy Threads Curated Catalog - Dresses, Shoes & Accessories" 
                  className="lifestyle-img"
                />
                <div className="lifestyle-caption-card">
                  <div className="caption-avatar">
                    <ShoppingBag size={18} />
                  </div>
                  <div>
                    <div className="caption-name">Trendy Threads Boutique</div>
                    <div className="caption-role">Independent Online Fashion &amp; Footwear • Coimbatore, Tamil Nadu</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="storytelling-profile-col">
              <div className="store-profile-card">
                <h3 className="profile-card-title">Trendy Threads Business Profile</h3>
                <p className="profile-card-summary">
                  Independent women's ethnic fashion brand receiving ~500 monthly orders across three fragmented channels: 
                  direct website, Instagram DM selling, and WhatsApp catalogs.
                </p>

                <div className="profile-metrics-list">
                  <div className="profile-metric">
                    <span className="m-label">Product Categories</span>
                    <span className="m-val">Women's Kurtis, Sarees, Jeans, Dresses, Accessories</span>
                  </div>
                  <div className="profile-metric">
                    <span className="m-label">Active Channels</span>
                    <span className="m-val">Shopify Storefront • Instagram D2C • WhatsApp Business</span>
                  </div>
                  <div className="profile-metric">
                    <span className="m-label">Location &amp; Currency</span>
                    <span className="m-val">Coimbatore, Tamil Nadu • Default Currency: INR (₹)</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Four Real-World Operational Situations Grid */}
          <div className="scenarios-grid">
            
            {/* Situation 1 */}
            <div className="scenario-card">
              <div className="scenario-header">
                <div className="scenario-num-badge">01</div>
                <span className="scenario-type-tag">COD Order Risk</span>
              </div>
              <h4 className="scenario-title">Potentially Risky ₹2,500 COD Order</h4>
              <p className="scenario-text">
                Order #TT10245 placed via Cash-on-Delivery with an incomplete street address in Coimbatore. 
                CommercePilot AI's deterministic engine flags a risk score of <strong>65/100 (HIGH)</strong> and 
                dispatches a tokenized confirmation request before warehouse packaging.
              </p>
              <div className="scenario-footer-status status-amber">
                ● Action: Confirmation Requested Before Dispatch
              </div>
            </div>

            {/* Situation 2 */}
            <div className="scenario-card">
              <div className="scenario-header">
                <div className="scenario-num-badge">02</div>
                <span className="scenario-type-tag">Predictive Inventory</span>
              </div>
              <h4 className="scenario-title">Black Kurti: 25 Units Left / 15 Daily Sales</h4>
              <p className="scenario-text">
                Sales velocity shows 15 units/day with only 25 units in warehouse—yielding an urgent <strong>1.67 days of stock runway</strong>. 
                CommercePilot AI auto-drafts Purchase Order #PO-1001 for 650 units with Coimbatore Fabric Mills.
              </p>
              <div className="scenario-footer-status status-red">
                ● Action: Critical Runway Alert &amp; PO Ready to Approve
              </div>
            </div>

            {/* Situation 3 */}
            <div className="scenario-card">
              <div className="scenario-header">
                <div className="scenario-num-badge">03</div>
                <span className="scenario-type-tag">Delivery Failure</span>
              </div>
              <h4 className="scenario-title">Failed Delivery Requiring Follow-Up</h4>
              <p className="scenario-text">
                Shipment DEL-TT10245 fails delivery with carrier status "Customer unavailable". Within seconds, an automated 
                WhatsApp recovery message is dispatched. The customer replies "YES" and redelivery is automatically booked.
              </p>
              <div className="scenario-footer-status status-green">
                ● Action: 100% Automated Courier Re-Attempt Scheduled
              </div>
            </div>

            {/* Situation 4 */}
            <div className="scenario-card">
              <div className="scenario-header">
                <div className="scenario-num-badge">04</div>
                <span className="scenario-type-tag">Grounded Copilot</span>
              </div>
              <h4 className="scenario-title">AI Assistant Restock Guidance</h4>
              <p className="scenario-text">
                Priya asks her AI Operations Copilot: <em>"Which products should I reorder immediately?"</em> 
                The copilot analyzes live store operations in real-time, identifies the Black Kurti's 1.67-day runway, and presents PO #1001 for one-click approval.
              </p>
              <div className="scenario-footer-status status-indigo">
                ● Action: Real-Time Data Grounded Intelligence
              </div>
            </div>

          </div>

          <div className="demonstration-notice-bar">
            <span>*Operations data modeled on active Trendy Threads store catalog, fulfillment schedules, and verified order histories.</span>
          </div>

        </div>
      </section>

      {/* ==================================================================== */}
      {/* 4. AUTONOMOUS OPERATIONS ENGINE SHOWCASE                            */}
      {/* ==================================================================== */}
      <section className="prod-n8n-showcase">
        <div className="n8n-inner-container">
          
          <div className="n8n-header">
            <span className="n8n-eyebrow">AUTONOMOUS FULFILLMENT WORKFLOW</span>
            <h2 className="n8n-title">
              INTELLIGENCE MAKES THE DECISION. AUTOMATION MAKES IT HAPPEN.
            </h2>
            <p className="n8n-desc">
              CommercePilot AI combines predictive commerce intelligence with autonomous fulfillment workflows to connect incoming orders, 
              inventory tracking, and customer communications seamlessly.
            </p>
          </div>

          {/* Connected Horizontal Workflow Architecture Diagram */}
          <div className="n8n-pipeline-flow">
            
            {/* Step 1 */}
            <div className="flow-node">
              <div className="node-icon-box box-blue">
                <ShoppingBag size={20} />
              </div>
              <div className="node-step-tag">Step 01</div>
              <div className="node-title">E-commerce Channels</div>
              <div className="node-desc">Online Store • Instagram D2C • WhatsApp Orders</div>
              <div className="node-status-pill status-live">Live Sync</div>
            </div>

            <div className="flow-connector-line">
              <div className="connector-pulse" />
            </div>

            {/* Step 2 */}
            <div className="flow-node">
              <div className="node-icon-box box-navy">
                <Database size={20} />
              </div>
              <div className="node-step-tag">Step 02</div>
              <div className="node-title">Operations Core</div>
              <div className="node-desc">Real-Time Order &amp; Inventory Ledger</div>
              <div className="node-status-pill status-synced">Sub-50ms Sync</div>
            </div>

            <div className="flow-connector-line">
              <div className="connector-pulse" />
            </div>

            {/* Step 3 */}
            <div className="flow-node highlight-n8n">
              <div className="node-icon-box box-orange">
                <Zap size={20} />
              </div>
              <div className="node-step-tag">Step 03</div>
              <div className="node-title">Autonomous Workflow Engine</div>
              <div className="node-desc">Order Routing, Restock Triggers &amp; Dispatch Rules</div>
              <div className="node-status-pill status-active">24/7 Active</div>
            </div>

            <div className="flow-connector-line">
              <div className="connector-pulse" />
            </div>

            {/* Step 4 */}
            <div className="flow-node">
              <div className="node-icon-box box-purple">
                <Cpu size={20} />
              </div>
              <div className="node-step-tag">Step 04</div>
              <div className="node-title">Predictive Decision Engine</div>
              <div className="node-desc">Sub-Second Risk Scoring &amp; Demand Forecasting</div>
              <div className="node-status-pill status-speed">Sub-Second Analysis</div>
            </div>

            <div className="flow-connector-line">
              <div className="connector-pulse" />
            </div>

            {/* Step 5 */}
            <div className="flow-node">
              <div className="node-icon-box box-indigo">
                <ShieldCheck size={20} />
              </div>
              <div className="node-step-tag">Step 05</div>
              <div className="node-title">Actionable Resolutions</div>
              <div className="node-desc">Verified COD Gateways &amp; Auto-Drafted Supplier POs</div>
              <div className="node-status-pill status-verified">Verified Accuracy</div>
            </div>

            <div className="flow-connector-line">
              <div className="connector-pulse" />
            </div>

            {/* Step 6 */}
            <div className="flow-node">
              <div className="node-icon-box box-green">
                <Bell size={20} />
              </div>
              <div className="node-step-tag">Step 06</div>
              <div className="node-title">Automated Outreach</div>
              <div className="node-desc">Email Confirmations • WhatsApp Recovery • Seller Alerts</div>
              <div className="node-status-pill status-completed">Instant Delivery</div>
            </div>

          </div>

          {/* Workflow Trust Features */}
          <div className="n8n-trust-features">
            <div className="trust-feature-item">
              <CheckCircle2 size={16} className="text-cyan" />
              <span>Instant 1-Click Storefront Integration</span>
            </div>
            <div className="trust-feature-item">
              <CheckCircle2 size={16} className="text-cyan" />
              <span>Complete End-to-End Order &amp; Inventory Audit Trail</span>
            </div>
            <div className="trust-feature-item">
              <CheckCircle2 size={16} className="text-cyan" />
              <span>Fail-Safe Business Protection &amp; Continuous Uptime</span>
            </div>
          </div>

        </div>
      </section>

      {/* ==================================================================== */}
      {/* 5. FINAL CALL TO ACTION: READY TO MAKE COMMERCE INTELLIGENT?         */}
      {/* ==================================================================== */}
      <section className="prod-final-cta-section">
        <div className="prod-final-cta-card">
          <div className="final-cta-ambient" />
          
          <div className="final-cta-content">
            <h2 className="final-cta-title">
              READY TO MAKE YOUR COMMERCE BUSINESS INTELLIGENT?
            </h2>
            <p className="final-cta-desc">
              Spend less time managing operational problems and more time growing your business. 
              Let CommercePilot AI help you protect orders, anticipate inventory needs and streamline everyday commerce operations.
            </p>

            <div className="final-cta-btn-group">
              <Link to="/signup" className="final-btn-primary">
                <span>Launch CommercePilot AI</span>
                <ArrowRight size={15} />
              </Link>
              <Link to="/app/overview" className="final-btn-secondary">
                <span>Explore Workspace</span>
                <ArrowUpRight size={15} />
              </Link>
            </div>

            <div className="final-cta-guarantee">
              <Check size={14} className="text-green" />
              <span>Instant setup • No credit card required • Seamless Indian multi-channel sync</span>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default ProductShowcase;
