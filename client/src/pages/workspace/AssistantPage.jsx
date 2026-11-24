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
  BarChart2
} from 'lucide-react';
import workspaceService from '../../services/workspace.service';
import { useAuth } from '../../context/AuthContext';

const EXAMPLE_QUESTIONS = [
  { label: 'Which products should I reorder?', icon: <Package size={13} /> },
  { label: 'Which orders need verification?', icon: <ShieldCheck size={13} /> },
  { label: 'What are my biggest inventory risks?', icon: <AlertTriangle size={13} /> },
  { label: 'Which products have the highest sales?', icon: <TrendingUp size={13} /> },
  { label: 'How many failed deliveries occurred this month?', icon: <Truck size={13} /> },
  { label: 'Summarize my business performance.', icon: <BarChart2 size={13} /> }
];

const AssistantPage = () => {
  const { user, store } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: `Hello ${user?.fullName ? user.fullName.split(' ')[0] : 'Merchant'}! I am your CommercePilot AI Operations Copilot.\n\nI am grounded strictly in ${store?.name || 'your store'}'s live database—evaluating real Cash-on-Delivery orders, moving-average demand runways, and courier NDR tracking. How can I assist your business operations today?`,
      intent: 'WELCOME',
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [inspectedDataIndex, setInspectedDataIndex] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

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

  return (
    <div>
      {/* Title */}
      <div className="page-title-row">
        <div className="page-title-heading">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1>AI Operations Copilot</h1>
            <span className="status-badge badge-purple" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Sparkles size={12} /> Groq Llama 3.3
            </span>
          </div>
          <p>Controlled, data-grounded intelligence answering real queries from your authenticated store database</p>
        </div>
      </div>

      {/* Accuracy & Grounding Info Banner */}
      <div className="demo-banner" style={{ background: 'rgba(99, 102, 241, 0.08)', borderColor: 'rgba(99, 102, 241, 0.2)', marginBottom: 'var(--space-6)' }}>
        <div className="demo-banner-left">
          <div className="demo-badge-icon" style={{ background: 'var(--gradient-primary)' }}>
            <Database size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--color-text-primary)' }}>
              100% Data-Grounded AI Architecture
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              Every response is calculated from your actual orders, inventory stock, and courier events. Gross revenue is strictly distinguished from net profit. LLM responses provide operational recommendations, not verified financial audits.
            </div>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="chat-container">
        {/* Header Bar */}
        <div className="chat-header-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="chat-avatar-icon assistant">
              <Bot size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--color-text-primary)' }}>
                CommercePilot Autonomous Intelligence
              </div>
              <div style={{ fontSize: '11px', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
                Store Database Connected ({store?.name || 'Active Merchant'})
              </div>
            </div>
          </div>
        </div>

        {/* Message Thread */}
        <div className="chat-messages">
          {messages.map((m, idx) => {
            const isUser = m.role === 'user';
            return (
              <div key={idx} className={`chat-bubble-row ${isUser ? 'user' : 'assistant'}`}>
                <div className={`chat-avatar-icon ${isUser ? 'user' : 'assistant'}`}>
                  {isUser ? <User size={16} /> : <Sparkles size={16} />}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '85%' }}>
                  <div className="chat-bubble" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                    {m.text}
                  </div>

                  {/* Groq AI & Guardrails Security Pills */}
                  {!isUser && m.guardrails && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '2px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 600,
                        background: m.guardrails.passed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: m.guardrails.passed ? '#10B981' : '#EF4444',
                        border: `1px solid ${m.guardrails.passed ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`
                      }}>
                        <ShieldCheck size={12} />
                        <span>{m.guardrails.passed ? 'Groq Guardrail Protected' : 'Guardrail Flagged'}</span>
                      </span>

                      {m.usedGroq && (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 600,
                          background: 'rgba(99, 102, 241, 0.1)',
                          color: '#818CF8',
                          border: '1px solid rgba(99, 102, 241, 0.25)'
                        }}>
                          <Sparkles size={12} />
                          <span>{m.guardrails.modelUsed || 'Groq AI'}</span>
                        </span>
                      )}

                      {m.guardrails.checks?.promptGuard === 'PASSED' && (
                        <span style={{
                          fontSize: '10.5px',
                          color: 'var(--color-text-muted)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}>
                          Threat Risk: {(m.guardrails.threatScore * 100).toFixed(2)}%
                        </span>
                      )}
                    </div>
                  )}

                  {/* Grounding & Telemetry Inspection for Assistant Replies */}
                  {!isUser && m.groundedData && (
                    <div style={{ marginTop: '2px' }}>
                      <button
                        onClick={() => setInspectedDataIndex(inspectedDataIndex === idx ? null : idx)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#A5B4FC',
                          fontSize: '11px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          cursor: 'pointer',
                          padding: '2px 4px'
                        }}
                      >
                        <Database size={12} />
                        <span>{inspectedDataIndex === idx ? 'Hide Grounded Database Context & Guardrails' : 'Inspect Grounded Database Context & Guardrails'}</span>
                        {inspectedDataIndex === idx ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      </button>

                      {inspectedDataIndex === idx && (
                        <div style={{
                          background: '#090D1A',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-md)',
                          padding: '12px',
                          marginTop: '6px',
                          fontSize: '11px',
                          color: '#94A3B8'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontWeight: 600, color: '#E2E8F0', flexWrap: 'wrap', gap: '4px' }}>
                            <span>Query Category: {m.intent}</span>
                            <span>Date Scope: {m.dateRange || 'Current'}</span>
                          </div>

                          {m.guardrails && (
                            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', padding: '8px 10px', marginBottom: '10px' }}>
                              <div style={{ fontWeight: 700, color: '#38BDF8', marginBottom: '4px' }}>🛡️ Guardrail Audit Telemetry</div>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '6px', fontSize: '10.5px' }}>
                                <div>• Prompt Shield: <strong style={{ color: '#10B981' }}>{m.guardrails.checks?.promptGuard}</strong> (Risk: {(m.guardrails.threatScore * 100).toFixed(2)}%)</div>
                                <div>• Scope Check: <strong style={{ color: '#10B981' }}>{m.guardrails.checks?.scopeEnforcement}</strong></div>
                                <div>• PII Sanitizer: <strong style={{ color: '#38BDF8' }}>{m.guardrails.checks?.piiSanitization}</strong></div>
                                <div>• Grounding Audit: <strong style={{ color: '#10B981' }}>{m.guardrails.checks?.groundingValidation}</strong></div>
                                <div>• Guardrail Model: <span style={{ color: '#94A3B8' }}>{m.guardrails.guardrailModel}</span></div>
                                <div>• Inference Engine: <span style={{ color: '#94A3B8' }}>{m.guardrails.modelUsed}</span></div>
                              </div>
                            </div>
                          )}

                          <pre style={{ margin: 0, maxHeight: '200px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '11px' }}>
                            {JSON.stringify(m.groundedData, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}

                  <div style={{ fontSize: '10px', color: 'var(--color-text-faint)', alignSelf: isUser ? 'flex-end' : 'flex-start' }}>
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="chat-bubble-row assistant">
              <div className="chat-avatar-icon assistant">
                <Sparkles size={16} className="spinning" />
              </div>
              <div className="chat-bubble" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-muted)' }}>
                <span>Retrieving authorized store records & calculating metrics...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Example Suggestion Chips */}
        <div className="chat-prompt-suggestions" style={{ flexWrap: 'wrap', gap: '6px' }}>
          <span style={{ fontSize: '11px', color: 'var(--color-text-faint)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Lightbulb size={13} />
            Suggested Questions:
          </span>
          {EXAMPLE_QUESTIONS.map((sug, i) => (
            <button
              key={i}
              type="button"
              className="prompt-chip"
              onClick={() => handleSendMessage(sug.label)}
              disabled={loading}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
            >
              {sug.icon}
              <span>{sug.label}</span>
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSubmit} className="chat-input-row">
          <input
            type="text"
            placeholder="Ask about inventory runways, COD risk verifications, delivery failures or business profit..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !inputValue.trim()}
            style={{ padding: '0 20px' }}
          >
            {loading ? <RefreshCw size={16} className="spinning" /> : <Send size={16} />}
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default AssistantPage;
