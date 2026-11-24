import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  RefreshCw,
  Lightbulb,
  Database,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  ShieldCheck,
  Package,
  TrendingUp,
  Truck,
  BarChart2,
  RotateCcw,
  Copy,
  Check,
  Cpu,
  Lock,
  Zap,
  CornerDownLeft,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import workspaceService from '../../services/workspace.service';
import { useAuth } from '../../context/AuthContext';
import FormattedAssistantMessage from '../../components/FormattedAssistantMessage';

const STARTER_PROMPTS = [
  {
    title: 'Restock Runways',
    query: 'Which products should I reorder?',
    desc: 'Analyzes average daily sales velocity to compute exact inventory days remaining.',
    icon: <Package size={15} />
  },
  {
    title: 'COD Fraud Screening',
    query: 'Which orders need verification?',
    desc: 'Surfaces orders exceeding the risk threshold (>= 60) requiring buyer email confirmation.',
    icon: <ShieldCheck size={15} />
  },
  {
    title: 'Inventory Stockout Risks',
    query: 'What are my biggest inventory risks?',
    desc: 'Identifies critical SKUs with stock runway below supplier reorder lead time.',
    icon: <AlertTriangle size={15} />
  },
  {
    title: 'Margin & Profit Leaders',
    query: 'Which products have the highest sales?',
    desc: 'Evaluates gross sales volume and unit margins across your active product lines.',
    icon: <TrendingUp size={15} />
  },
  {
    title: 'Courier NDR Failures',
    query: 'How many failed deliveries occurred this month?',
    desc: 'Reviews non-delivery reports (NDR) and automated customer re-attempt verifications.',
    icon: <Truck size={15} />
  },
  {
    title: 'Executive Store Brief',
    query: 'Summarize my business performance.',
    desc: 'Synthesizes total orders, gross revenue, COD risk health, and fulfillment pipeline.',
    icon: <BarChart2 size={15} />
  }
];

const AssistantPage = () => {
  const { user, store } = useAuth();

  const getInitialMessage = () => ({
    role: 'assistant',
    text: `Hello ${user?.fullName ? user.fullName.split(' ')[0] : 'Merchant'}! I am your CommercePilot AI Operations Copilot.\n\nI am grounded strictly in ${store?.name || 'your store'}'s live database—evaluating real Cash-on-Delivery orders, moving-average demand runways, and courier NDR tracking. How can I assist your business operations today?`,
    intent: 'WELCOME',
    timestamp: new Date().toISOString()
  });

  const [messages, setMessages] = useState([getInitialMessage()]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [inspectedDataIndex, setInspectedDataIndex] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleResetThread = () => {
    setMessages([getInitialMessage()]);
    setInputValue('');
    setInspectedDataIndex(null);
  };

  const handleCopyMessage = (text, idx) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => {
      setCopiedIndex(null);
    }, 2000);
  };

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputValue;
    if (!query.trim() || loading) return;

    // Append user message
    const newMsgList = [...messages, { role: 'user', text: query, timestamp: new Date().toISOString() }];
    setMessages(newMsgList);
    setInputValue('');
    setLoading(true);

    try {
      const res = await workspaceService.chatAssistant(query);
      const reply = res.reply || 'I analyzed your store telemetry but could not generate a response.';
      setMessages([
        ...newMsgList,
        {
          role: 'assistant',
          text: reply,
          intent: res.intent,
          dateRange: res.dateRange,
          groundedData: res.groundedData,
          usedGroq: res.usedGroq,
          guardrails: res.guardrails,
          timestamp: res.timestamp || new Date().toISOString()
        }
      ]);
    } catch (err) {
      setMessages([
        ...newMsgList,
        {
          role: 'assistant',
          text: `⚠️ Operational copilot error: ${err.response?.data?.message || err.message || 'Service temporarily unavailable'}. Please verify connection.`,
          isError: true,
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSendMessage();
  };

  const isInitialState = messages.length === 1 && messages[0].intent === 'WELCOME';
  const merchantName = user?.fullName ? user.fullName.split(' ')[0] : 'Merchant';
  const userInitial = user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'M';

  return (
    <div>
      {/* Title */}
      <div className="page-title-row">
        <div className="page-title-heading">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1>AI Operations Copilot</h1>
            <span className="status-badge badge-purple" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Cpu size={12} /> Groq Llama 3.3 70B
            </span>
          </div>
          <p>Deterministic, data-grounded intelligence answering real queries from your authenticated store database</p>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="chat-container">
        {/* Luxury Glass Header Bar */}
        <div className="chat-header-bar">
          <div className="chat-header-left">
            <div className="chat-copilot-emblem">
              <Sparkles size={18} />
            </div>
            <div className="chat-header-title-col">
              <div className="chat-header-title-row">
                <h2 className="chat-header-title">CommercePilot Autonomous Intelligence</h2>
                <span className="ai-model-pill">
                  <Cpu size={10} /> PRO 70B
                </span>
              </div>
              <div className="chat-header-sub">
                <span className="live-status-pill">
                  <span className="live-beacon-dot" />
                  <span>STORE GROUNDED</span>
                </span>
                <span>·</span>
                <span>{store?.name || 'Trendy Threads'} ({store?.currency || 'INR'})</span>
              </div>
            </div>
          </div>

          <div className="chat-header-right">
            <button
              type="button"
              className="chat-action-btn"
              onClick={handleResetThread}
              title="Reset conversation thread"
            >
              <RotateCcw size={13} />
              <span>New Thread</span>
            </button>
            <div className="chat-grounding-tag" title="Strictly isolated to your tenant data">
              <Database size={12} />
              <span>100% Grounded</span>
            </div>
          </div>
        </div>

        {/* Message Thread Canvas */}
        <div className="chat-messages">
          {/* Welcome Screen & Luxury Starters Grid */}
          {isInitialState && (
            <div>
              <div className="chat-welcome-banner">
                <div className="welcome-badge-tag">
                  <Sparkles size={11} />
                  <span>Autonomous E-Commerce Intelligence</span>
                </div>
                <h3 className="welcome-headline">
                  Welcome back, {merchantName}! Your operations copilot is ready.
                </h3>
                <p className="welcome-desc">
                  Connected live to <strong>{store?.name || 'Trendy Threads'}</strong> on MongoDB Atlas. You can ask anything regarding Cash-on-Delivery fraud screening, inventory stockout forecasting, courier NDR recovery, or gross-versus-net margins.
                </p>

                <div className="welcome-telemetry-row">
                  <div className="welcome-telemetry-pill">
                    <Package size={13} style={{ color: '#38BDF8' }} />
                    <span>Real-Time Inventory Runways</span>
                  </div>
                  <div className="welcome-telemetry-pill">
                    <ShieldCheck size={13} style={{ color: '#34D399' }} />
                    <span>Deterministic COD Risk Scoring</span>
                  </div>
                  <div className="welcome-telemetry-pill">
                    <Truck size={13} style={{ color: '#FBBF24' }} />
                    <span>Automated NDR Recovery</span>
                  </div>
                  <div className="welcome-telemetry-pill">
                    <TrendingUp size={13} style={{ color: '#A78BFA' }} />
                    <span>Net Profit vs Gross Revenue</span>
                  </div>
                </div>
              </div>

              {/* 6 Luxury Starter Cards */}
              <div style={{ marginTop: '18px', marginBottom: '8px' }}>
                <div style={{ fontSize: '11.5px', fontWeight: 750, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748B', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Lightbulb size={13} style={{ color: '#0284C7' }} />
                  <span>Recommended Operational Inquiries:</span>
                </div>

                <div className="chat-starters-grid">
                  {STARTER_PROMPTS.map((starter, i) => (
                    <button
                      key={i}
                      type="button"
                      className="chat-starter-card"
                      onClick={() => handleSendMessage(starter.query)}
                      disabled={loading}
                    >
                      <div>
                        <div className="starter-top">
                          <div className="starter-icon-box">
                            {starter.icon}
                          </div>
                          <CornerDownLeft size={13} className="starter-action-icon" />
                        </div>
                        <div className="starter-label">{starter.query}</div>
                        <div className="starter-desc">{starter.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((m, idx) => {
            const isUser = m.role === 'user';

            if (isUser) {
              return (
                <div key={idx} className="chat-bubble-row user">
                  <div className="user-message-container">
                    <div className="user-avatar-badge" title={user?.fullName || 'Merchant'}>
                      {userInitial}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                      <div className="user-bubble">
                        {m.text}
                      </div>
                      <span style={{ fontSize: '10.5px', color: '#94A3B8', fontWeight: 500, paddingRight: '4px' }}>
                        {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            }

            // If initial welcome and user has not asked anything yet, we already rendered the banner above, but let's show the full assistant response card cleanly
            return (
              <div key={idx} className="chat-bubble-row assistant">
                <div className="assistant-card-container">
                  {/* Card Header Strip */}
                  <div className="assistant-card-header">
                    <div className="assistant-identity-badge">
                      <div className="assistant-micro-icon">
                        <Sparkles size={12} />
                      </div>
                      <span className="assistant-name">CommercePilot Copilot</span>
                      <span className="assistant-grounded-pill">
                        MongoDB Grounded
                      </span>
                    </div>

                    <div className="assistant-meta-tools">
                      <button
                        type="button"
                        className="assistant-copy-btn"
                        onClick={() => handleCopyMessage(m.text, idx)}
                        title="Copy response to clipboard"
                      >
                        {copiedIndex === idx ? (
                          <>
                            <Check size={12} style={{ color: '#10B981' }} />
                            <span style={{ color: '#10B981' }}>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy size={12} />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                      <span className="assistant-timestamp">
                        {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  {/* Card Message Body */}
                  <div className="assistant-card-body">
                    <FormattedAssistantMessage content={m.text} />
                  </div>

                  {/* Card Footer: Guardrail & Grounding Inspector */}
                  {(!isInitialState || m.guardrails || m.groundedData) && (
                    <div className="assistant-card-footer">
                      {/* Security Pills */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        {m.guardrails && (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 650,
                            background: m.guardrails.passed ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                            color: m.guardrails.passed ? '#059669' : '#DC2626',
                            border: `1px solid ${m.guardrails.passed ? 'rgba(16, 185, 129, 0.22)' : 'rgba(239, 68, 68, 0.22)'}`
                          }}>
                            <ShieldCheck size={12} />
                            <span>{m.guardrails.passed ? 'Groq Guardrail Verified' : 'Security Flagged'}</span>
                          </span>
                        )}

                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 650,
                          background: 'rgba(99, 102, 241, 0.08)',
                          color: '#4F46E5',
                          border: '1px solid rgba(99, 102, 241, 0.22)'
                        }}>
                          <Cpu size={11} />
                          <span>{m.guardrails?.modelUsed || 'Llama 3.3 70B (Groq)'}</span>
                        </span>

                        {m.guardrails?.checks?.promptGuard === 'PASSED' && (
                          <span style={{ fontSize: '11px', color: '#64748B', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            Threat Risk: <strong style={{ color: '#059669' }}>{(m.guardrails.threatScore * 100).toFixed(2)}%</strong>
                          </span>
                        )}
                      </div>

                      {/* Collapsible Telemetry Inspector */}
                      {m.groundedData && (
                        <div>
                          <button
                            type="button"
                            onClick={() => setInspectedDataIndex(inspectedDataIndex === idx ? null : idx)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#0284C7',
                              fontSize: '11.5px',
                              fontWeight: 600,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              cursor: 'pointer',
                              padding: '2px 0'
                            }}
                          >
                            <Database size={12} />
                            <span>{inspectedDataIndex === idx ? 'Hide Grounded Database Context & Guardrails' : 'Inspect Grounded Database Context & Guardrails'}</span>
                            {inspectedDataIndex === idx ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                          </button>

                          {inspectedDataIndex === idx && (
                            <div style={{
                              background: '#090D1A',
                              border: '1px solid rgba(255, 255, 255, 0.08)',
                              borderRadius: '10px',
                              padding: '14px',
                              marginTop: '8px',
                              fontSize: '11px',
                              color: '#94A3B8',
                              boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.4)'
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontWeight: 650, color: '#E2E8F0', flexWrap: 'wrap', gap: '4px' }}>
                                <span>Query Category: <strong style={{ color: '#38BDF8' }}>{m.intent}</strong></span>
                                <span>Date Scope: <strong style={{ color: '#A78BFA' }}>{m.dateRange || 'Current'}</strong></span>
                              </div>

                              {m.guardrails && (
                                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', padding: '8px 10px', marginBottom: '10px' }}>
                                  <div style={{ fontWeight: 700, color: '#38BDF8', marginBottom: '6px' }}>🛡️ Guardrail Audit Telemetry</div>
                                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '6px', fontSize: '10.5px' }}>
                                    <div>• Prompt Shield: <strong style={{ color: '#10B981' }}>{m.guardrails.checks?.promptGuard}</strong></div>
                                    <div>• Scope Check: <strong style={{ color: '#10B981' }}>{m.guardrails.checks?.scopeEnforcement}</strong></div>
                                    <div>• PII Sanitizer: <strong style={{ color: '#38BDF8' }}>{m.guardrails.checks?.piiSanitization}</strong></div>
                                    <div>• Grounding Audit: <strong style={{ color: '#10B981' }}>{m.guardrails.checks?.groundingValidation}</strong></div>
                                    <div>• Guardrail Model: <span style={{ color: '#94A3B8' }}>{m.guardrails.guardrailModel}</span></div>
                                    <div>• Inference Engine: <span style={{ color: '#94A3B8' }}>{m.guardrails.modelUsed}</span></div>
                                  </div>
                                </div>
                              )}

                              <pre style={{ margin: 0, maxHeight: '220px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '11px', color: '#CBD5E1', lineHeight: 1.5 }}>
                                {JSON.stringify(m.groundedData, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Thinking / Shimmering State */}
          {loading && (
            <div className="chat-bubble-row assistant">
              <div className="assistant-card-container">
                <div className="assistant-card-header">
                  <div className="assistant-identity-badge">
                    <div className="assistant-micro-icon">
                      <Sparkles size={12} className="spinning" />
                    </div>
                    <span className="assistant-name">CommercePilot Copilot</span>
                    <span className="assistant-grounded-pill" style={{ background: 'rgba(2, 132, 199, 0.08)', color: '#0284C7', borderColor: 'rgba(2, 132, 199, 0.2)' }}>
                      Computing Telemetry...
                    </span>
                  </div>
                </div>
                <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '12px', color: '#475569', fontSize: '13.5px' }}>
                  <RefreshCw size={17} className="spinning" style={{ color: '#0284C7', flexShrink: 0 }} />
                  <span>Retrieving authorized store records from MongoDB Atlas &amp; synthesizing operational intelligence...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Omnibar Input Command Console */}
        <div className="chat-omnibar-section">
          {/* Quick Follow-up Chips (shown during active conversation) */}
          {!isInitialState && (
            <div className="chat-followup-row">
              <span className="chat-followup-label">
                <Lightbulb size={12} style={{ color: '#F59E0B' }} />
                <span>Follow-ups:</span>
              </span>
              {STARTER_PROMPTS.slice(0, 4).map((starter, i) => (
                <button
                  key={i}
                  type="button"
                  className="prompt-chip"
                  onClick={() => handleSendMessage(starter.query)}
                  disabled={loading}
                >
                  {starter.icon}
                  <span>{starter.query}</span>
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="chat-omnibar-box">
              <input
                type="text"
                className="chat-omnibar-input"
                placeholder="Ask about inventory runways, COD risk verifications, delivery failures or business profit..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={loading}
              />

              <div className="chat-omnibar-bottom-bar">
                <div className="chat-omnibar-pills">
                  <span className="omnibar-tag">
                    <Zap size={11} style={{ color: '#F59E0B' }} />
                    <span>Groq 70B Engine</span>
                  </span>
                  <span className="omnibar-tag">
                    <ShieldCheck size={11} style={{ color: '#10B981' }} />
                    <span>Llama Guard 3</span>
                  </span>
                  <span className="omnibar-tag">
                    <Lock size={11} style={{ color: '#6366F1' }} />
                    <span>Tenant Isolated</span>
                  </span>
                </div>

                <div className="chat-omnibar-send-actions">
                  <span className="omnibar-hint">Press Enter ↵</span>
                  <button
                    type="submit"
                    className="chat-send-btn"
                    disabled={loading || !inputValue.trim()}
                  >
                    {loading ? <RefreshCw size={14} className="spinning" /> : <Send size={14} />}
                    <span>Ask Copilot</span>
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AssistantPage;