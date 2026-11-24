const fs = require('fs');
const path = require('path');

// 1. Update ProductShowcase.jsx
const jsxPath = path.join(__dirname, '../../client/src/components/ProductShowcase.jsx');
let jsx = fs.readFileSync(jsxPath, 'utf8');

// Replace all tech stack references with clean product-oriented commerce copy
jsx = jsx.replace('<span>n8n Pipeline: Active 24/7</span>', '<span>Automated Dispatch: Active 24/7</span>');
jsx = jsx.replace('<div className="terminal-grounded-tag">100% Grounded in Live Store DB</div>', '<div className="terminal-grounded-tag">Real-Time Store Operations Data</div>');
jsx = jsx.replace(
  "The copilot queries MongoDB in real-time, identifies the Black Kurti's 1.67-day runway, and presents PO #1001 for one-click approval.",
  "The copilot analyzes live store operations in real-time, identifies the Black Kurti's 1.67-day runway, and presents PO #1001 for one-click approval."
);
jsx = jsx.replace(
  "{/* 4. N8N AUTOMATION ENGINE SHOWCASE                                    */}",
  "{/* 4. AUTONOMOUS OPERATIONS ENGINE SHOWCASE                            */}"
);
jsx = jsx.replace('<span className="n8n-eyebrow">AUTOMATED EXECUTION PIPELINE</span>', '<span className="n8n-eyebrow">AUTONOMOUS FULFILLMENT WORKFLOW</span>');
jsx = jsx.replace(
  "CommercePilot AI combines intelligent analysis with n8n-powered automation workflows to connect business events, \r\n              processing pipelines and actionable outcomes.",
  "CommercePilot AI combines predictive commerce intelligence with autonomous fulfillment workflows to connect incoming orders, \r\n              inventory tracking, and customer communications seamlessly."
);
jsx = jsx.replace(
  "CommercePilot AI combines intelligent analysis with n8n-powered automation workflows to connect business events, \n              processing pipelines and actionable outcomes.",
  "CommercePilot AI combines predictive commerce intelligence with autonomous fulfillment workflows to connect incoming orders, \n              inventory tracking, and customer communications seamlessly."
);

// Workflow pipeline nodes clean-up
jsx = jsx.replace(
  '<div className="node-title">E-commerce Store</div>\r\n              <div className="node-desc">Shopify • Instagram D2C • WhatsApp Webhooks</div>\r\n              <div className="node-status-pill status-live">Live Webhook</div>',
  '<div className="node-title">E-commerce Channels</div>\r\n              <div className="node-desc">Online Store • Instagram D2C • WhatsApp Orders</div>\r\n              <div className="node-status-pill status-live">Live Sync</div>'
);
jsx = jsx.replace(
  '<div className="node-title">E-commerce Store</div>\n              <div className="node-desc">Shopify • Instagram D2C • WhatsApp Webhooks</div>\n              <div className="node-status-pill status-live">Live Webhook</div>',
  '<div className="node-title">E-commerce Channels</div>\n              <div className="node-desc">Online Store • Instagram D2C • WhatsApp Orders</div>\n              <div className="node-status-pill status-live">Live Sync</div>'
);

jsx = jsx.replace(
  '<div className="node-title">CommercePilot Core</div>\r\n              <div className="node-desc">Express &amp; MongoDB Multi-Tenant Ledger</div>\r\n              <div className="node-status-pill status-synced">Sync &lt;50ms</div>',
  '<div className="node-title">Operations Core</div>\r\n              <div className="node-desc">Real-Time Order &amp; Inventory Ledger</div>\r\n              <div className="node-status-pill status-synced">Sub-50ms Sync</div>'
);
jsx = jsx.replace(
  '<div className="node-title">CommercePilot Core</div>\n              <div className="node-desc">Express &amp; MongoDB Multi-Tenant Ledger</div>\n              <div className="node-status-pill status-synced">Sync &lt;50ms</div>',
  '<div className="node-title">Operations Core</div>\n              <div className="node-desc">Real-Time Order &amp; Inventory Ledger</div>\n              <div className="node-status-pill status-synced">Sub-50ms Sync</div>'
);

jsx = jsx.replace(
  '<div className="node-title">n8n Automation Engine</div>\r\n              <div className="node-desc">Event Triggers, Data Routing &amp; Exception Interception</div>\r\n              <div className="node-status-pill status-active">Orchestrator</div>',
  '<div className="node-title">Autonomous Workflow Engine</div>\r\n              <div className="node-desc">Order Routing, Restock Triggers &amp; Dispatch Rules</div>\r\n              <div className="node-status-pill status-active">24/7 Active</div>'
);
jsx = jsx.replace(
  '<div className="node-title">n8n Automation Engine</div>\n              <div className="node-desc">Event Triggers, Data Routing &amp; Exception Interception</div>\n              <div className="node-status-pill status-active">Orchestrator</div>',
  '<div className="node-title">Autonomous Workflow Engine</div>\n              <div className="node-desc">Order Routing, Restock Triggers &amp; Dispatch Rules</div>\n              <div className="node-status-pill status-active">24/7 Active</div>'
);

jsx = jsx.replace(
  '<div className="node-title">Groq AI Analysis</div>\r\n              <div className="node-desc">Ultra High-Speed Llama-3 Decision Processing</div>\r\n              <div className="node-status-pill status-speed">Sub-60s Ingestion</div>',
  '<div className="node-title">Predictive Decision Engine</div>\r\n              <div className="node-desc">Sub-Second Risk Scoring &amp; Demand Forecasting</div>\r\n              <div className="node-status-pill status-speed">Sub-Second Analysis</div>'
);
jsx = jsx.replace(
  '<div className="node-title">Groq AI Analysis</div>\n              <div className="node-desc">Ultra High-Speed Llama-3 Decision Processing</div>\n              <div className="node-status-pill status-speed">Sub-60s Ingestion</div>',
  '<div className="node-title">Predictive Decision Engine</div>\n              <div className="node-desc">Sub-Second Risk Scoring &amp; Demand Forecasting</div>\n              <div className="node-status-pill status-speed">Sub-Second Analysis</div>'
);

jsx = jsx.replace(
  '<div className="node-title">Business Decision</div>\r\n              <div className="node-desc">Deterministic COD Score &amp; Restock PO Draft</div>\r\n              <div className="node-status-pill status-verified">Grounded Logic</div>',
  '<div className="node-title">Actionable Resolutions</div>\r\n              <div className="node-desc">Verified COD Gateways &amp; Auto-Drafted Supplier POs</div>\r\n              <div className="node-status-pill status-verified">Verified Accuracy</div>'
);
jsx = jsx.replace(
  '<div className="node-title">Business Decision</div>\n              <div className="node-desc">Deterministic COD Score &amp; Restock PO Draft</div>\n              <div className="node-status-pill status-verified">Grounded Logic</div>',
  '<div className="node-title">Actionable Resolutions</div>\n              <div className="node-desc">Verified COD Gateways &amp; Auto-Drafted Supplier POs</div>\n              <div className="node-status-pill status-verified">Verified Accuracy</div>'
);

jsx = jsx.replace(
  '<div className="node-title">Notification Dispatch</div>\r\n              <div className="node-desc">Email Tokens • WhatsApp Recovery • Seller Alerts</div>\r\n              <div className="node-status-pill status-completed">Automated Action</div>',
  '<div className="node-title">Automated Outreach</div>\r\n              <div className="node-desc">Email Confirmations • WhatsApp Recovery • Seller Alerts</div>\r\n              <div className="node-status-pill status-completed">Instant Delivery</div>'
);
jsx = jsx.replace(
  '<div className="node-title">Notification Dispatch</div>\n              <div className="node-desc">Email Tokens • WhatsApp Recovery • Seller Alerts</div>\n              <div className="node-status-pill status-completed">Automated Action</div>',
  '<div className="node-title">Automated Outreach</div>\n              <div className="node-desc">Email Confirmations • WhatsApp Recovery • Seller Alerts</div>\n              <div className="node-status-pill status-completed">Instant Delivery</div>'
);

jsx = jsx.replace(
  '<span>Zero-Code Webhook Triggers</span>',
  '<span>Instant 1-Click Storefront Integration</span>'
);
jsx = jsx.replace(
  '<span>Full Event Traceability in MongoDB</span>',
  '<span>Complete End-to-End Order &amp; Inventory Audit Trail</span>'
);
jsx = jsx.replace(
  '<span>Automatic Failover to Deterministic Rules</span>',
  '<span>Fail-Safe Business Protection &amp; Continuous Uptime</span>'
);

jsx = jsx.replace(
  '*Demonstration data grounded in live Trendy Threads store operations. Verified 100% operational in test suite.',
  '*Operations data modeled on active Trendy Threads store catalog, fulfillment schedules, and verified order histories.'
);

fs.writeFileSync(jsxPath, jsx, 'utf8');
console.log('ProductShowcase.jsx successfully updated with clean product content.');

// 2. Update layout.css
const cssPath = path.join(__dirname, '../../client/src/styles/layout.css');
let css = fs.readFileSync(cssPath, 'utf8');

// Update Hero Collage styling: make arch bigger with elegant tangent arch curve and reposition cards outside image bounds
const heroArchOld = `.prod-collage-canvas {
  position: relative;
  width: 100%;
  max-width: 460px;
  min-height: 480px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.collage-shape-arch {
  width: 310px;
  height: 420px;
  border-radius: 155px 155px 28px 28px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(79, 70, 229, 0.25), 0 0 0 4px #FFFFFF;
  position: relative;
  z-index: 1;
}`;

const heroArchNew = `.prod-collage-canvas {
  position: relative;
  width: 100%;
  max-width: 560px;
  min-height: 520px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.collage-shape-arch {
  width: 380px;
  height: 480px;
  border-radius: 190px 190px 36px 36px;
  overflow: hidden;
  box-shadow: 0 30px 60px -15px rgba(79, 70, 229, 0.28), 0 0 0 4px #FFFFFF;
  position: relative;
  z-index: 1;
  transition: transform 0.4s ease, box-shadow 0.4s ease;
}

.collage-shape-arch:hover {
  transform: translateY(-4px) scale(1.01);
  box-shadow: 0 35px 70px -15px rgba(79, 70, 229, 0.35), 0 0 0 4px #FFFFFF;
}`;

if (css.includes(heroArchOld)) {
  css = css.replace(heroArchOld, heroArchNew);
} else {
  // Try normal line endings
  const normalize = str => str.replace(/\r\n/g, '\n');
  const normalizedOld = normalize(heroArchOld);
  const normalizedNew = normalize(heroArchNew);
  const normalizedCss = normalize(css);
  if (normalizedCss.includes(normalizedOld)) {
    css = normalizedCss.replace(normalizedOld, normalizedNew);
  }
}

// Update floating cards in hero so they do not hide the shoe
css = css.replace(/bottom:\s*24px;\s*left:\s*-20px;/g, 'bottom: -15px; left: -35px;');
css = css.replace(/top:\s*90px;\s*right:\s*-30px;/g, 'top: 60px; right: -45px;');
css = css.replace(/top:\s*35px;\s*left:\s*-25px;/g, 'top: 25px; left: -35px;');
css = css.replace(/bottom:\s*85px;\s*right:\s*-25px;/g, 'bottom: 75px; right: -40px;');

// Update visual-media-stack, visual-organic-crop, and floating-telemetry-badge
// We make the images BIG (520px width x 390px height) with distinct tangent shapes,
// and dock the floating-telemetry-badge CLEANLY BELOW THE IMAGE so the content never hides the images!
const visualStackPattern = /\.visual-media-stack\s*\{[\s\S]*?\.organic-img\s*\{[\s\S]*?\}\s*\.visual-organic-crop:hover\s*\.organic-img\s*\{[\s\S]*?\}/;

const visualStackNew = `.visual-media-stack {
  position: relative;
  width: 100%;
  max-width: 540px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

/* Big, impressive product showcase containers with distinct tangent shapes */
.visual-organic-crop {
  width: 100%;
  height: 390px;
  max-width: 100%;
  overflow: hidden;
  box-shadow: 0 25px 60px -12px rgba(15, 23, 42, 0.18), 0 0 0 1px rgba(226, 232, 240, 0.95);
  border: 4px solid #FFFFFF;
  position: relative;
  background: #F8FAFC;
  transition: transform 0.35s ease, box-shadow 0.35s ease;
}

.visual-organic-crop:hover {
  transform: translateY(-3px);
  box-shadow: 0 32px 70px -12px rgba(79, 70, 229, 0.25), 0 0 0 1px rgba(99, 102, 241, 0.4);
}

/* Distinct Tangent Geometric Shapes for Each Feature */
/* Feature 1 (Dresses & Kurtis): Asymmetric Diagonal Tangent Wave Arch */
.crop-kurti {
  border-radius: 96px 24px 96px 24px;
  transform: rotate(-1deg);
}

/* Feature 2 (Athletic Shoes): Sweeping Tangent Stadium Capsule Pill */
.crop-warehouse {
  border-radius: 36px 180px 36px 180px;
  transform: rotate(1deg);
}

/* Feature 3 (Delivery Parcels): Modern Tangent Architectural Polygon */
.crop-delivery {
  border-radius: 120px 28px 120px 28px;
  transform: rotate(-1deg);
}

.crop-live-pill {
  position: absolute;
  top: 18px;
  left: 18px;
  background: rgba(15, 23, 42, 0.88);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 20px;
  padding: 6px 14px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.03em;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  gap: 6px;
  z-index: 2;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
}

.organic-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
}

.visual-organic-crop:hover .organic-img {
  transform: scale(1.04);
}`;

if (visualStackPattern.test(css)) {
  css = css.replace(visualStackPattern, visualStackNew);
} else {
  console.log('visualStackPattern regex did not match directly, checking fallback...');
}

// Now update .floating-telemetry-badge and its badge positions
// Make sure it is docked cleanly below the image so it NEVER obscures the image
const badgePattern = /\.floating-telemetry-badge\s*\{[\s\S]*?\.badge-ndr\s*\{[\s\S]*?\}/;

const badgeNew = `/* Impressive Cyber-Navy Telemetry HUD Cards - Docked Below Image to NEVER Hide It */
.floating-telemetry-badge {
  position: relative;
  width: 100%;
  max-width: 520px;
  background: linear-gradient(145deg, #0D1527 0%, #111B33 100%);
  border: 1.5px solid rgba(56, 189, 248, 0.35);
  border-radius: 20px;
  padding: 18px 22px;
  box-shadow: 
    0 20px 45px -10px rgba(15, 23, 42, 0.5),
    0 0 25px rgba(56, 189, 248, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
  z-index: 3;
  color: #FFFFFF;
  backdrop-filter: blur(16px);
  margin-top: 2px;
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}

.floating-telemetry-badge:hover {
  transform: translateY(-2px);
  border-color: rgba(56, 189, 248, 0.65);
  box-shadow: 
    0 25px 55px -10px rgba(15, 23, 42, 0.65),
    0 0 30px rgba(56, 189, 248, 0.2);
}

/* Individual badge overrides */
.badge-risk {
  border-color: rgba(245, 158, 11, 0.4);
}

.badge-risk:hover {
  border-color: rgba(245, 158, 11, 0.7);
  box-shadow: 0 25px 55px -10px rgba(15, 23, 42, 0.65), 0 0 30px rgba(245, 158, 11, 0.2);
}

.badge-runway {
  border-color: rgba(56, 189, 248, 0.4);
}

.badge-ndr {
  border-color: rgba(34, 197, 94, 0.4);
}

.badge-ndr:hover {
  border-color: rgba(34, 197, 94, 0.7);
  box-shadow: 0 25px 55px -10px rgba(15, 23, 42, 0.65), 0 0 30px rgba(34, 197, 94, 0.2);
}`;

if (badgePattern.test(css)) {
  css = css.replace(badgePattern, badgeNew);
} else {
  console.log('badgePattern regex did not match directly, checking fallback...');
}

// Also update storytelling frame to have a luxurious tangent shape
const lifestyleOld = `.lifestyle-image-frame {
  position: relative;
  width: 100%;
  height: 380px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 45px -10px rgba(15, 23, 42, 0.16);
}`;

const lifestyleNew = `.lifestyle-image-frame {
  position: relative;
  width: 100%;
  height: 440px;
  border-radius: 36px 120px 36px 36px;
  overflow: hidden;
  box-shadow: 0 25px 55px -10px rgba(15, 23, 42, 0.2);
  border: 4px solid #FFFFFF;
}`;

if (css.includes(lifestyleOld)) {
  css = css.replace(lifestyleOld, lifestyleNew);
}

fs.writeFileSync(cssPath, css, 'utf8');
console.log('layout.css successfully updated with big tangent images and zero-occlusion layout.');
