import React from 'react';
import { Check, ShieldCheck, Zap, Bot, RefreshCw } from 'lucide-react';

const SolutionSection = () => {
  return (
    <section className="section">
      <div className="container">
        <div className="solution-banner">
          <div className="solution-grid">
            <div className="solution-content">
              <div className="section-tag">
                <Zap size={14} />
                <span>The Unified Solution</span>
              </div>
              <h2>
                One Autonomous Brain for Your <br />
                <span className="text-gradient-accent">Entire Store Operations</span>
              </h2>
              <p>
                CommercePilot AI connects your storefront, courier partners, and messaging channels into 
                a single proactive command center. It identifies order risks before dispatch, forecasts inventory 
                depletion in real-time, and recovers failing deliveries automatically.
              </p>

              <div className="solution-pillars">
                <div className="solution-pillar-item">
                  <div className="pillar-check">
                    <Check size={14} />
                  </div>
                  <div>
                    <div className="pillar-title">Proactive Pre-Dispatch Filter</div>
                    <div className="pillar-desc">
                      Flags risky COD orders and verifies customer delivery address via secure email before you pack.
                    </div>
                  </div>
                </div>

                <div className="solution-pillar-item">
                  <div className="pillar-check">
                    <Check size={14} />
                  </div>
                  <div>
                    <div className="pillar-title">Unified Multi-Channel Sync</div>
                    <div className="pillar-desc">
                      Synchronizes real inventory across Shopify, WooCommerce, and marketplaces.
                    </div>
                  </div>
                </div>

                <div className="solution-pillar-item">
                  <div className="pillar-check">
                    <Check size={14} />
                  </div>
                  <div>
                    <div className="pillar-title">Zero-Latency NDR Workflow</div>
                    <div className="pillar-desc">
                      Courier non-delivery webhooks instantly trigger customer re-scheduling bots.
                    </div>
                  </div>
                </div>

                <div className="solution-pillar-item">
                  <div className="pillar-check">
                    <Check size={14} />
                  </div>
                  <div>
                    <div className="pillar-title">Daily Operations Copilot</div>
                    <div className="pillar-desc">
                      Natural language intelligence on daily revenue, reorder needs, and courier performance.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Architecture Graphic Visual */}
            <div className="card card-glow" style={{ padding: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <Bot size={24} style={{ color: '#818CF8' }} />
                <h3 style={{ fontSize: '1.25rem' }}>Autonomous Execution Pipeline</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ padding: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: '11px', color: '#818CF8', fontWeight: 600, textTransform: 'uppercase' }}>Step 1 • Ingestion</div>
                  <div style={{ fontSize: '13px', color: '#FFF', fontWeight: 500, marginTop: '2px' }}>Store & Courier Webhooks Received (Shopify, Shiprocket, Delhivery)</div>
                </div>
                <div style={{ padding: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: '11px', color: '#38BDF8', fontWeight: 600, textTransform: 'uppercase' }}>Step 2 • Neural Evaluation</div>
                  <div style={{ fontSize: '13px', color: '#FFF', fontWeight: 500, marginTop: '2px' }}>Groq AI Risk Scoring & Stock Depletion Velocity Modeling</div>
                </div>
                <div style={{ padding: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: '11px', color: '#34D399', fontWeight: 600, textTransform: 'uppercase' }}>Step 3 • Autonomous Intervention</div>
                  <div style={{ fontSize: '13px', color: '#FFF', fontWeight: 500, marginTop: '2px' }}>n8n Email Verification & Automated Purchase Order Draft Generation</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SolutionSection;
