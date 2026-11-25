import React, { useState, useEffect, useCallback } from 'react';
import {
  Zap,
  RefreshCw,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Mail,
  Truck,
  RotateCcw,
  ShieldCheck,
  Package,
  Layers,
  ArrowRight,
  ExternalLink,
  Cpu,
  FileText,
  Play,
  X,
  Send,
  Sparkles,
  Activity
} from 'lucide-react';
import workspaceService from '../../services/workspace.service';

const AutomationsPage = () => {
  const [statuses, setStatuses] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [loadingStatuses, setLoadingStatuses] = useState(true);
  const [triggeringWorkflow, setTriggeringWorkflow] = useState(null);
  const [actionFeedback, setActionFeedback] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);
  const [filterWorkflow, setFilterWorkflow] = useState('ALL');

  const fetchStatuses = useCallback(async () => {
    try {
      setLoadingStatuses(true);
      const res = await workspaceService.getWorkflowStatuses();
      setStatuses(res.workflows);
    } catch (err) {
      console.error('Failed to load workflow statuses:', err);
    } finally {
      setLoadingStatuses(false);
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    try {
      setLoadingLogs(true);
      const res = await workspaceService.getAutomations(
        filterWorkflow !== 'ALL' ? { workflow: filterWorkflow } : {}
      );
      setLogs(res.automations || []);
    } catch (err) {
      console.error('Failed to load automation logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  }, [filterWorkflow]);

  useEffect(() => {
    fetchStatuses();
  }, [fetchStatuses]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Handle Manual Workflow Triggers
  const handleTriggerTest = async (workflowKey) => {
    try {
      setTriggeringWorkflow(workflowKey);
      setActionFeedback(null);
      let res;

      if (workflowKey === 'orderVerification') {
        // Fetch recent order to test against, or trigger with 'demo'
        const ordersRes = await workspaceService.getOrders({ limit: 1 });
        const targetOrder = ordersRes.orders?.[0];
        const targetId = targetOrder?._id || 'sample-order';
        res = await workspaceService.triggerOrderAnalysis(targetId);
      } else if (workflowKey === 'inventoryIntelligence') {
        res = await workspaceService.triggerInventoryAnalysis();
      } else if (workflowKey === 'deliveryRecovery') {
        const delRes = await workspaceService.getDeliveries({ limit: 1 });
        const targetDelivery = delRes.deliveries?.[0];
        const targetId = targetDelivery?._id || 'sample-delivery';
        res = await workspaceService.triggerDeliveryRecovery(targetId);
      } else if (workflowKey === 'dailyReport') {
        res = await workspaceService.triggerDailyReport();
      }

      setActionFeedback({
        type: 'success',
        message: res?.message || `${workflowKey} triggered successfully! Mode: ${res?.executionMode || 'SIMULATION'}`
      });

      // Refresh data
      await Promise.all([fetchStatuses(), fetchLogs()]);
    } catch (err) {
      console.error(`Workflow ${workflowKey} failed:`, err);
      setActionFeedback({
        type: 'error',
        message: err.response?.data?.message || err.message || `Failed to execute ${workflowKey}`
      });
    } finally {
      setTriggeringWorkflow(null);
    }
  };

  const getWorkflowBadge = (wf) => {
    if (!wf) {
      return (
        <span className="status-indicator-badge native_active">
          <span className="status-dot-pulse" />
          <span>Native AI Active</span>
        </span>
      );
    }
    if (wf.isConfigured || wf.status === 'CONNECTED') {
      return (
        <span className="status-indicator-badge connected" title="External n8n Webhook Stream Active">
          <span className="status-dot-pulse" />
          <span>Live n8n</span>
        </span>
      );
    }
    if (wf.status === 'RUNNING') {
      return (
        <span className="status-indicator-badge running">
          <RefreshCw size={11} className="spinning" />
          <span>Running</span>
        </span>
      );
    }
    if (wf.status === 'FAILED') {
      return (
        <span className="status-indicator-badge failed">
          <span className="status-dot-pulse" />
          <span>Failed</span>
        </span>
      );
    }
    return (
      <span className="status-indicator-badge native_active" title="CommercePilot Built-in AI Automation Engine Active">
        <span className="status-dot-pulse" />
        <span>Native AI Active</span>
      </span>
    );
  };

  const getIconForWorkflow = (name) => {
    switch (name) {
      case 'ORDER_ANALYSIS_VERIFICATION':
        return <ShieldCheck size={18} style={{ color: '#818CF8' }} />;
      case 'INVENTORY_INTELLIGENCE':
        return <Package size={18} style={{ color: '#F59E0B' }} />;
      case 'DELIVERY_RECOVERY_NDR':
        return <Truck size={18} style={{ color: '#38BDF8' }} />;
      case 'DAILY_BUSINESS_REPORT':
        return <FileText size={18} style={{ color: '#10B981' }} />;
      default:
        return <Zap size={18} style={{ color: '#A5B4FC' }} />;
    }
  };

  return (
    <div>
      {/* Title & Actions */}
      <div className="page-title-row">
        <div className="page-title-heading">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1>Workflow Automation Engine</h1>
            <span className="status-badge badge-purple" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Cpu size={12} /> n8n & Groq Hybrid
            </span>
          </div>
          <p>
            Autonomous ecommerce workflows triggered via n8n webhooks, powered by Groq AI and secure customer email actions.
          </p>
        </div>
        <div className="page-actions-group">
          <button
            onClick={() => { fetchStatuses(); fetchLogs(); }}
            className="btn btn-secondary"
            disabled={loadingLogs || loadingStatuses}
          >
            <RefreshCw size={15} className={loadingLogs || loadingStatuses ? 'spinning' : ''} />
            <span>Refresh State</span>
          </button>
        </div>
      </div>

      {/* Action Notification Feedback */}
      {actionFeedback && (
        <div
          style={{
            marginBottom: 'var(--space-5)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            background: actionFeedback.type === 'success' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
            border: `1px solid ${actionFeedback.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            color: actionFeedback.type === 'success' ? '#34D399' : '#F87171',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '13px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {actionFeedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
            <span>{actionFeedback.message}</span>
          </div>
          <button
            onClick={() => setActionFeedback(null)}
            style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer' }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Dual-Engine Architecture Notice */}
      <div className="automation-banner">
        <div className="automation-banner-left">
          <div className="automation-banner-icon">
            <Zap size={22} />
          </div>
          <div>
            <div className="automation-banner-title">
              Dual-Engine Automation Support
            </div>
            <div className="automation-banner-desc">
              When n8n webhooks are configured in your environment, events stream live to your n8n instance. When offline, CommercePilot AI seamlessly executes the exact same deterministic rules, Groq AI risk scoring, and verified email actions in <strong>Simulated Demo Mode</strong>.
            </div>
          </div>
        </div>
        <div className="automation-banner-tags">
          <div className="automation-banner-chip">
            <Cpu size={13} style={{ color: '#6366F1' }} />
            <span>n8n Webhook Stream</span>
          </div>
          <div className="automation-banner-chip">
            <ShieldCheck size={13} style={{ color: '#059669' }} />
            <span>Deterministic Rules</span>
          </div>
          <div className="automation-banner-chip">
            <Sparkles size={13} style={{ color: '#D97706' }} />
            <span>Groq AI Fallback</span>
          </div>
        </div>
      </div>

      {/* 4 Core Workflow Cards Grid (Strict Horizontal Row) */}
      <div className="automation-workflows-grid">
        {/* Workflow 1: COD Verification */}
        <div className="workflow-card cod-card">
          <div>
            <div className="workflow-card-top">
              <div
                className="workflow-icon-box"
                style={{
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.16) 0%, rgba(99, 102, 241, 0.05) 100%)',
                  color: '#6366F1',
                  border: '1px solid rgba(99, 102, 241, 0.25)'
                }}
              >
                <ShieldCheck size={22} />
              </div>
              {getWorkflowBadge(statuses?.orderVerification)}
            </div>
            <div className="workflow-title">COD Order Verification</div>
            <div className="workflow-desc">
              Scores COD orders with deterministic risk rules & Groq AI. Automatically dispatches expiring email confirmation links to high-risk buyers.
            </div>
          </div>
          <div>
            <div className="workflow-meta-box">
              <div className="workflow-meta-row">
                <span className="workflow-meta-label">Trigger:</span>
                <span className="workflow-meta-value" title="POST /order-analysis">POST /order-analysis</span>
              </div>
              <div className="workflow-meta-row">
                <span className="workflow-meta-label">Engine:</span>
                <span className={`mode-badge ${statuses?.orderVerification?.isConfigured ? 'live' : 'native'}`}>
                  {statuses?.orderVerification?.isConfigured ? 'Live n8n' : 'Native AI'}
                </span>
              </div>
              <div className="workflow-meta-row">
                <span className="workflow-meta-label">Channel:</span>
                <span className="workflow-meta-value" style={{ color: '#6366F1' }}>Buyer Email</span>
              </div>
            </div>
            <button
              onClick={() => handleTriggerTest('orderVerification')}
              className="workflow-btn"
              disabled={triggeringWorkflow === 'orderVerification'}
            >
              {triggeringWorkflow === 'orderVerification' ? (
                <>
                  <RefreshCw size={14} className="spinning" />
                  <span>Analyzing Order...</span>
                </>
              ) : (
                <>
                  <Play size={14} />
                  <span>Test Verification</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Workflow 2: Inventory Intelligence */}
        <div className="workflow-card inv-card">
          <div>
            <div className="workflow-card-top">
              <div
                className="workflow-icon-box"
                style={{
                  background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.16) 0%, rgba(245, 158, 11, 0.05) 100%)',
                  color: '#D97706',
                  border: '1px solid rgba(245, 158, 11, 0.25)'
                }}
              >
                <Package size={22} />
              </div>
              {getWorkflowBadge(statuses?.inventoryIntelligence)}
            </div>
            <div className="workflow-title">Inventory Intelligence</div>
            <div className="workflow-desc">
              Calculates 30-day velocity and runway days. Auto-drafts POs for low stock and emails merchant for one-click approval before supplier dispatch.
            </div>
          </div>
          <div>
            <div className="workflow-meta-box">
              <div className="workflow-meta-row">
                <span className="workflow-meta-label">Trigger:</span>
                <span className="workflow-meta-value" title="POST /inventory-analysis">POST /inventory-scan</span>
              </div>
              <div className="workflow-meta-row">
                <span className="workflow-meta-label">Engine:</span>
                <span className={`mode-badge ${statuses?.inventoryIntelligence?.isConfigured ? 'live' : 'native'}`}>
                  {statuses?.inventoryIntelligence?.isConfigured ? 'Live n8n' : 'Native AI'}
                </span>
              </div>
              <div className="workflow-meta-row">
                <span className="workflow-meta-label">Channel:</span>
                <span className="workflow-meta-value" style={{ color: '#D97706' }}>Merchant PO</span>
              </div>
            </div>
            <button
              onClick={() => handleTriggerTest('inventoryIntelligence')}
              className="workflow-btn"
              disabled={triggeringWorkflow === 'inventoryIntelligence'}
            >
              {triggeringWorkflow === 'inventoryIntelligence' ? (
                <>
                  <RefreshCw size={14} className="spinning" />
                  <span>Scanning Inventory...</span>
                </>
              ) : (
                <>
                  <Play size={14} />
                  <span>Test Inventory Scan</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Workflow 3: Delivery Recovery */}
        <div className="workflow-card ndr-card">
          <div>
            <div className="workflow-card-top">
              <div
                className="workflow-icon-box"
                style={{
                  background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.16) 0%, rgba(2, 132, 199, 0.05) 100%)',
                  color: '#0284C7',
                  border: '1px solid rgba(2, 132, 199, 0.25)'
                }}
              >
                <Truck size={22} />
              </div>
              {getWorkflowBadge(statuses?.deliveryRecovery)}
            </div>
            <div className="workflow-title">NDR Delivery Recovery</div>
            <div className="workflow-desc">
              Intercepts courier delivery failures. Dispatches secure rescheduling emails with landmark & preferred time-slot capture within 60 seconds.
            </div>
          </div>
          <div>
            <div className="workflow-meta-box">
              <div className="workflow-meta-row">
                <span className="workflow-meta-label">Trigger:</span>
                <span className="workflow-meta-value" title="POST /delivery-recovery">POST /delivery-ndr</span>
              </div>
              <div className="workflow-meta-row">
                <span className="workflow-meta-label">Engine:</span>
                <span className={`mode-badge ${statuses?.deliveryRecovery?.isConfigured ? 'live' : 'native'}`}>
                  {statuses?.deliveryRecovery?.isConfigured ? 'Live n8n' : 'Native AI'}
                </span>
              </div>
              <div className="workflow-meta-row">
                <span className="workflow-meta-label">Channel:</span>
                <span className="workflow-meta-value" style={{ color: '#0284C7' }}>Buyer Email</span>
              </div>
            </div>
            <button
              onClick={() => handleTriggerTest('deliveryRecovery')}
              className="workflow-btn"
              disabled={triggeringWorkflow === 'deliveryRecovery'}
            >
              {triggeringWorkflow === 'deliveryRecovery' ? (
                <>
                  <RefreshCw size={14} className="spinning" />
                  <span>Recovering NDR...</span>
                </>
              ) : (
                <>
                  <Play size={14} />
                  <span>Test NDR Recovery</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Workflow 4: Daily AI Business Report */}
        <div className="workflow-card rep-card">
          <div>
            <div className="workflow-card-top">
              <div
                className="workflow-icon-box"
                style={{
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.16) 0%, rgba(16, 185, 129, 0.05) 100%)',
                  color: '#059669',
                  border: '1px solid rgba(16, 185, 129, 0.25)'
                }}
              >
                <FileText size={22} />
              </div>
              {getWorkflowBadge(statuses?.dailyReport)}
            </div>
            <div className="workflow-title">Daily AI Business Briefing</div>
            <div className="workflow-desc">
              Aggregates orders, revenue, inventory runway, and delivery metrics. Groq AI generates an executive briefing emailed to the store owner.
            </div>
          </div>
          <div>
            <div className="workflow-meta-box">
              <div className="workflow-meta-row">
                <span className="workflow-meta-label">Schedule:</span>
                <span className="workflow-meta-value" title="Daily @ 09:00 AM IST">09:00 AM IST</span>
              </div>
              <div className="workflow-meta-row">
                <span className="workflow-meta-label">Engine:</span>
                <span className={`mode-badge ${statuses?.dailyReport?.isConfigured ? 'live' : 'native'}`}>
                  {statuses?.dailyReport?.isConfigured ? 'Live n8n' : 'Native AI'}
                </span>
              </div>
              <div className="workflow-meta-row">
                <span className="workflow-meta-label">Channel:</span>
                <span className="workflow-meta-value" style={{ color: '#059669' }}>Owner Email</span>
              </div>
            </div>
            <button
              onClick={() => handleTriggerTest('dailyReport')}
              className="workflow-btn"
              disabled={triggeringWorkflow === 'dailyReport'}
            >
              {triggeringWorkflow === 'dailyReport' ? (
                <>
                  <RefreshCw size={14} className="spinning" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <Send size={14} />
                  <span>Generate Report</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Execution History Table */}
      <div className="data-table-card">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--space-4) var(--space-6)',
          borderBottom: '1px solid var(--border-subtle)',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--color-text-primary)' }}>
              Execution Audit Trail
            </span>
            <span className="sidebar-badge">{logs.length} events</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Filter Workflow:</span>
            <select
              value={filterWorkflow}
              onChange={(e) => setFilterWorkflow(e.target.value)}
              style={{
                background: 'var(--color-bg-primary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '6px 12px',
                color: 'var(--color-text-primary)',
                fontSize: '12px'
              }}
            >
              <option value="ALL">All Workflows</option>
              <option value="ORDER_ANALYSIS_VERIFICATION">COD Order Verification</option>
              <option value="INVENTORY_INTELLIGENCE">Inventory Intelligence</option>
              <option value="DELIVERY_RECOVERY_NDR">NDR Recovery</option>
              <option value="DAILY_BUSINESS_REPORT">Daily Report</option>
            </select>
          </div>
        </div>

        <div className="data-table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Workflow & Trigger</th>
                <th>Execution Mode</th>
                <th>Action & Result</th>
                <th>Email Dispatch</th>
                <th>Duration</th>
                <th>Executed At</th>
                <th style={{ textAlign: 'right' }}>Inspection</th>
              </tr>
            </thead>
            <tbody>
              {loadingLogs && logs.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>
                    <RefreshCw size={24} className="spinning" style={{ margin: '0 auto 10px' }} />
                    <p>Fetching workflow execution telemetry...</p>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '48px', color: 'var(--color-text-muted)' }}>
                    <Zap size={32} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
                    <p style={{ fontWeight: 600 }}>No automation executions logged yet.</p>
                    <p style={{ fontSize: '12px', color: 'var(--color-text-faint)', marginTop: '4px' }}>
                      Click "Test Workflow" on any card above to trigger an autonomous execution.
                    </p>
                  </td>
                </tr>
              ) : (
                logs.map((log, idx) => (
                  <tr key={log._id || idx}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'rgba(255, 255, 255, 0.04)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          {getIconForWorkflow(log.workflowName)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                            {log.workflowName?.replace(/_/g, ' ') || 'SYSTEM_WORKFLOW'}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--color-text-faint)' }}>
                            {log.triggerEvent || 'DIRECT_TRIGGER'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`mode-badge ${log.executionMode === 'LIVE_N8N' ? 'live' : 'demo'}`}>
                        {log.executionMode === 'LIVE_N8N' ? 'Live n8n' : 'Simulated Demo'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', display: 'block', maxWidth: '300px' }}>
                        {log.actionSummary || log.description || 'Action completed successfully'}
                      </span>
                    </td>
                    <td>
                      {log.emailSent ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#10B981' }}>
                          <Mail size={13} />
                          <span>{log.emailRecipient || 'Dispatched'}</span>
                        </div>
                      ) : (
                        <span style={{ fontSize: '12px', color: 'var(--color-text-faint)' }}>None</span>
                      )}
                    </td>
                    <td>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
                        {log.durationMs ? `${log.durationMs}ms` : '—'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                        {new Date(log.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="inspect-pill-btn"
                      >
                        <span>Inspect</span>
                        <ArrowRight size={11} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Execution Inspection Modal */}
      {selectedLog && (
        <div className="automation-modal-backdrop" onClick={() => setSelectedLog(null)}>
          <div className="automation-modal" onClick={(e) => e.stopPropagation()}>
            <div className="automation-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {getIconForWorkflow(selectedLog.workflowName)}
                <div>
                  <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--color-text-primary)' }}>
                    {selectedLog.workflowName}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-faint)' }}>
                    Idempotency Key: {selectedLog.idempotencyKey || 'N/A'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>
            <div className="automation-modal-body">
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                  Execution Summary
                </div>
                <div style={{ padding: '10px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-md)', fontSize: '13px', color: 'var(--color-text-primary)' }}>
                  {selectedLog.actionSummary || 'No summary text provided.'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                  Payload Sent ({selectedLog.executionMode})
                </div>
                <div className="automation-json-box">
                  {JSON.stringify(selectedLog.payload || {}, null, 2)}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                  Result / Response
                </div>
                <div className="automation-json-box">
                  {JSON.stringify(selectedLog.response || { status: selectedLog.status, message: 'Execution completed' }, null, 2)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutomationsPage;
