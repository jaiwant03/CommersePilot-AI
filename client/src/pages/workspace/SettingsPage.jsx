import React, { useState, useEffect } from 'react';
import {
  Settings,
  Store,
  Sliders,
  Bell,
  Save,
  RefreshCw,
  CheckCircle2,
  ShieldAlert,
  Zap,
  Mail,
  Globe,
  FileSpreadsheet,
  UploadCloud,
  Info,
  Check,
  AlertCircle,
  Sparkles,
  Layers
} from 'lucide-react';
import workspaceService from '../../services/workspace.service';
import { useAuth } from '../../context/AuthContext';

const SettingsPage = () => {
  const { store, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    category: 'Apparel & Fashion',
    channel: 'D2C',
    currency: 'INR',
    settings: {
      codRiskThreshold: 60,
      lowStockThreshold: 10,
      autoEmailVerification: true,
      autoNdrRecovery: true,
      alertEmail: ''
    }
  });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await workspaceService.getSettings();
      if (res.data?.store) {
        const s = res.data.store;
        setFormData({
          name: s.name || '',
          category: s.category || 'Apparel & Fashion',
          channel: s.channel || 'D2C',
          currency: s.currency || 'INR',
          settings: {
            codRiskThreshold: s.settings?.codRiskThreshold ?? 60,
            lowStockThreshold: s.settings?.lowStockThreshold ?? 10,
            autoEmailVerification: s.settings?.autoEmailVerification ?? true,
            autoNdrRecovery: s.settings?.autoNdrRecovery ?? true,
            alertEmail: s.settings?.alertEmail || ''
          }
        });
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('settings.')) {
      const field = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        settings: {
          ...prev.settings,
          [field]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    setErrorMessage('');

    try {
      await workspaceService.updateSettings(formData);
      setSaveSuccess(true);
      if (refreshUser) await refreshUser();
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--color-text-muted)' }}>
        <RefreshCw size={32} className="spinning" style={{ margin: '0 auto 16px' }} />
        <p>Loading store configuration from MongoDB...</p>
      </div>
    );
  }

  return (
    <div className="settings-container">
      {/* Title */}
      <div className="page-title-row">
        <div className="page-title-heading">
          <h1>Store Settings &amp; Autopilot Controls</h1>
          <p>Configure sales channels, COD risk thresholds and autonomous intervention rules</p>
        </div>
      </div>

      {saveSuccess && (
        <div style={{
          padding: '14px 18px',
          background: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          borderRadius: '12px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: '#059669',
          fontSize: '13.5px',
          fontWeight: 650,
          boxShadow: '0 2px 8px rgba(16, 185, 129, 0.06)'
        }}>
          <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
          <span>Store settings and autopilot thresholds saved successfully to MongoDB!</span>
        </div>
      )}

      {errorMessage && (
        <div style={{
          padding: '14px 18px',
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          borderRadius: '12px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: '#DC2626',
          fontSize: '13.5px',
          fontWeight: 650,
          boxShadow: '0 2px 8px rgba(239, 68, 68, 0.06)'
        }}>
          <ShieldAlert size={18} style={{ flexShrink: 0 }} />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* 1. Store Identity */}
        <div className="workspace-card">
          <div className="workspace-card-header">
            <div className="workspace-card-header-main">
              <div className="workspace-card-icon-box indigo">
                <Store size={18} />
              </div>
              <div className="workspace-card-title-group">
                <h2 className="workspace-card-title">Store Identity &amp; Channel</h2>
                <p className="workspace-card-subtitle">Primary storefront identification and operating currency</p>
              </div>
            </div>
          </div>

          <div className="workspace-card-body">
            <div className="form-grid-2">
              <div className="workspace-form-group">
                <label className="workspace-label">Store Brand Name *</label>
                <input
                  type="text"
                  name="name"
                  className="workspace-input"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Trendy Threads"
                />
              </div>

              <div className="workspace-form-group">
                <label className="workspace-label">Primary Sales Channel</label>
                <select
                  name="channel"
                  className="workspace-select"
                  value={formData.channel}
                  onChange={handleChange}
                >
                  <option value="SHOPIFY">Shopify</option>
                  <option value="WOOCOMMERCE">WooCommerce</option>
                  <option value="INSTAGRAM">Instagram / Social Sales</option>
                  <option value="MARKETPLACE">Amazon / Flipkart</option>
                  <option value="D2C">Custom D2C Website</option>
                </select>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="workspace-form-group" style={{ marginBottom: 0 }}>
                <label className="workspace-label">Business Category</label>
                <select
                  name="category"
                  className="workspace-select"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="Apparel & Fashion">Apparel &amp; Fashion</option>
                  <option value="Beauty & Cosmetics">Beauty &amp; Cosmetics</option>
                  <option value="Footwear">Footwear</option>
                  <option value="Jewelry & Accessories">Jewelry &amp; Accessories</option>
                  <option value="Home & Living">Home &amp; Living</option>
                  <option value="Electronics & Gadgets">Electronics &amp; Gadgets</option>
                </select>
              </div>

              <div className="workspace-form-group" style={{ marginBottom: 0 }}>
                <label className="workspace-label">Operational Currency</label>
                <select
                  name="currency"
                  className="workspace-select"
                  value={formData.currency}
                  onChange={handleChange}
                >
                  <option value="INR">Indian Rupee (₹ INR)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Operations & Autopilot Thresholds */}
        <div className="workspace-card">
          <div className="workspace-card-header">
            <div className="workspace-card-header-main">
              <div className="workspace-card-icon-box amber">
                <Sliders size={18} />
              </div>
              <div className="workspace-card-title-group">
                <h2 className="workspace-card-title">Autonomous Risk &amp; Stock Thresholds</h2>
                <p className="workspace-card-subtitle">Trigger parameters for automated decisions and buyer alerts</p>
              </div>
            </div>
          </div>

          <div className="workspace-card-body">
            <div className="form-grid-2">
              <div className="workspace-form-group">
                <label className="workspace-label">COD High-Risk Threshold (0-100)</label>
                <input
                  type="number"
                  name="settings.codRiskThreshold"
                  className="workspace-input"
                  min={10}
                  max={95}
                  value={formData.settings.codRiskThreshold}
                  onChange={handleChange}
                />
                <span className="workspace-help">
                  Orders with risk score ≥ this number will trigger buyer email confirmation before dispatch.
                </span>
              </div>

              <div className="workspace-form-group">
                <label className="workspace-label">Low Stock Reorder Threshold</label>
                <input
                  type="number"
                  name="settings.lowStockThreshold"
                  className="workspace-input"
                  min={1}
                  max={500}
                  value={formData.settings.lowStockThreshold}
                  onChange={handleChange}
                />
                <span className="workspace-help">
                  SKUs with available units ≤ this number trigger predictive reorder alerts.
                </span>
              </div>
            </div>

            <div className="workspace-form-group">
              <label className="workspace-label">Alert Notification Email</label>
              <input
                type="email"
                name="settings.alertEmail"
                className="workspace-input"
                placeholder="e.g. operations@trendythreads.in"
                value={formData.settings.alertEmail}
                onChange={handleChange}
              />
              <span className="workspace-help">
                Daily summary digests and low-stock alerts are dispatched to this address.
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px', borderTop: '1px solid var(--workspace-border-subtle)', paddingTop: '20px' }}>
              <label className="settings-toggle-card">
                <input
                  type="checkbox"
                  name="settings.autoEmailVerification"
                  checked={formData.settings.autoEmailVerification ?? true}
                  onChange={handleChange}
                  className="settings-toggle-checkbox"
                />
                <div className="settings-toggle-content">
                  <div className="settings-toggle-title">
                    Enable Automated Email Verification on High-Risk COD
                  </div>
                  <div className="settings-toggle-desc">
                    Automatically triggers a secure confirmation link to the customer before inventory is reserved and packed.
                  </div>
                </div>
              </label>

              <label className="settings-toggle-card">
                <input
                  type="checkbox"
                  name="settings.autoNdrRecovery"
                  checked={formData.settings.autoNdrRecovery}
                  onChange={handleChange}
                  className="settings-toggle-checkbox"
                />
                <div className="settings-toggle-content">
                  <div className="settings-toggle-title">
                    Enable Automated Courier NDR Address Verification
                  </div>
                  <div className="settings-toggle-desc">
                    Dispatches a real-time re-attempt request when courier marks customer as unavailable or address incomplete.
                  </div>
                </div>
              </label>
            </div>

            {/* Save Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <RefreshCw size={15} className="spinning" /> : <Save size={15} />}
                <span>{saving ? 'Saving Preferences...' : 'Save Store Preferences'}</span>
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* 3. Store Connection Status & Sales Channels */}
      <div className="workspace-card">
        <div className="workspace-card-header">
          <div className="workspace-card-header-main">
            <div className="workspace-card-icon-box sky">
              <Globe size={18} />
            </div>
            <div className="workspace-card-title-group">
              <h2 className="workspace-card-title">Store Connection &amp; Sales Channels</h2>
              <p className="workspace-card-subtitle">Real-time webhook sync status and active selling endpoints</p>
            </div>
          </div>
          <div className="live-status-pill">
            <span className="live-beacon-dot" />
            <span>STATUS: {store?.connectionStatus || 'CONNECTED'}</span>
          </div>
        </div>

        <div className="workspace-card-body">
          <div className="settings-telemetry-grid">
            <div className="settings-telemetry-item">
              <span className="settings-telemetry-label">OPERATING CURRENCY</span>
              <div className="settings-telemetry-value">
                {store?.currency || 'INR (₹)'}
              </div>
              <span className="settings-telemetry-sub">Primary ledger currency</span>
            </div>

            <div className="settings-telemetry-item">
              <span className="settings-telemetry-label">INTEGRATED CHANNELS</span>
              <div className="settings-channel-badges">
                {(store?.salesChannels || ['Online Store', 'Instagram', 'WhatsApp']).map((ch, idx) => (
                  <span key={idx} className="settings-channel-pill">{ch}</span>
                ))}
              </div>
              <span className="settings-telemetry-sub" style={{ marginTop: '4px' }}>
                Multi-channel sync active
              </span>
            </div>

            <div className="settings-telemetry-item">
              <span className="settings-telemetry-label">LAST SYNCHRONIZATION</span>
              <div className="settings-telemetry-value">
                {store?.lastSyncAt ? new Date(store.lastSyncAt).toLocaleString('en-IN') : 'Live Synced (Just now)'}
              </div>
              <span className="settings-telemetry-sub">
                Heartbeat operational
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. CSV / JSON Store Data Importer */}
      <div className="workspace-card">
        <div className="workspace-card-header">
          <div className="workspace-card-header-main">
            <div className="workspace-card-icon-box emerald">
              <FileSpreadsheet size={18} />
            </div>
            <div className="workspace-card-title-group">
              <h2 className="workspace-card-title">Store Data Importer (CSV / JSON)</h2>
              <p className="workspace-card-subtitle">Bulk upload Products, Orders, Customers &amp; Inventory</p>
            </div>
          </div>
          <span className="sidebar-badge" style={{ fontSize: '11px', padding: '3px 10px' }}>
            Auto-Mapped Ingestion
          </span>
        </div>

        <div className="workspace-card-body">
          <div className="importer-desc-banner">
            <Info size={18} style={{ color: '#0284C7', flexShrink: 0, marginTop: '2px' }} />
            <div>
              Paste comma-separated values (CSV) or JSON array to automatically ingest store catalogs, customer records, and orders into your tenant database with auto-mapping.
            </div>
          </div>

          <DataImporterSubcomponent onImportSuccess={fetchSettings} />
        </div>
      </div>
    </div>
  );
};

const SAMPLE_PAYLOADS = {
  products: `title,sku,price,costPrice,stockQuantity\nWomen's Black Kurti,TT-KUR-BLK,1299,450,25\nFloral Anarkali Kurti,TT-KUR-FLOR,1999,750,18\nEmbroidered Silk Saree,TT-SAR-SLK,3499,1400,12`,
  orders: `orderNumber,customerName,phone,email,city,amount,paymentMethod\nTT10245,Ananya Deshmukh,+919876543210,ananya@example.com,Coimbatore,2500,COD\nTT10246,Rohan Mehta,+919823456789,rohan@example.com,Mumbai,4200,PREPAID`,
  customers: `name,email,phone,city,state,ordersCount\nKavita Sharma,kavita@example.com,+919811223344,Bengaluru,Karnataka,5\nVikram Singh,vikram@example.com,+919877889900,Jaipur,Rajasthan,3`,
  inventory: `sku,title,stockQuantity,reorderLevel\nTT-KUR-BLK,Women's Black Kurti,25,10\nTT-KUR-FLOR,Floral Anarkali Kurti,18,8`
};

const DataImporterSubcomponent = ({ onImportSuccess }) => {
  const [importType, setImportType] = useState('products');
  const [rawData, setRawData] = useState('');
  const [importing, setImporting] = useState(false);
  const [resultMsg, setResultMsg] = useState(null);

  const handleImport = async (e) => {
    e.preventDefault();
    if (!rawData.trim()) {
      alert('Please enter CSV text or JSON data to import.');
      return;
    }

    try {
      setImporting(true);
      setResultMsg(null);

      let payloadData = rawData.trim();
      if (payloadData.startsWith('[') || payloadData.startsWith('{')) {
        try {
          payloadData = JSON.parse(payloadData);
        } catch (jsonErr) {
          // If JSON parse fails, send as string
        }
      }

      const res = await workspaceService.importStoreData({
        type: importType,
        data: payloadData
      });

      setResultMsg({
        success: true,
        text: res.message || `Successfully imported ${res.importedCount || 0} ${importType} records.`
      });
      setRawData('');
      if (onImportSuccess) onImportSuccess();
    } catch (err) {
      setResultMsg({
        success: false,
        text: err.response?.data?.message || err.message || 'Import failed.'
      });
    } finally {
      setImporting(false);
    }
  };

  const loadSample = () => {
    setRawData(SAMPLE_PAYLOADS[importType] || SAMPLE_PAYLOADS.products);
  };

  return (
    <form onSubmit={handleImport}>
      <div className="importer-control-bar">
        <div className="workspace-form-group" style={{ marginBottom: 0, minWidth: '240px' }}>
          <label className="workspace-label">Import Target Entity</label>
          <select
            className="workspace-select"
            value={importType}
            onChange={(e) => {
              setImportType(e.target.value);
            }}
          >
            <option value="products">Products Catalog</option>
            <option value="orders">Orders &amp; Customers</option>
            <option value="customers">Customer Profiles</option>
            <option value="inventory">Inventory Adjustments</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="importer-sample-btn"
            onClick={loadSample}
            title="Load sample data structure"
          >
            <Sparkles size={13} />
            <span>Load Sample {importType}</span>
          </button>
          {rawData && (
            <button
              type="button"
              className="importer-sample-btn"
              onClick={() => setRawData('')}
              style={{ color: '#64748B', borderColor: 'rgba(203, 213, 225, 0.8)' }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="importer-textarea-container">
        <label className="workspace-label" style={{ display: 'block', marginBottom: '6px' }}>
          Paste CSV or JSON Payload
        </label>
        <textarea
          className="importer-textarea"
          rows={6}
          placeholder={SAMPLE_PAYLOADS[importType]}
          value={rawData}
          onChange={(e) => setRawData(e.target.value)}
        />
      </div>

      {resultMsg && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '10px',
          fontSize: '13px',
          fontWeight: 650,
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: resultMsg.success ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
          color: resultMsg.success ? '#059669' : '#DC2626',
          border: `1px solid ${resultMsg.success ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`
        }}>
          {resultMsg.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{resultMsg.text}</span>
        </div>
      )}

      <button type="submit" className="btn btn-primary" disabled={importing}>
        {importing ? <RefreshCw size={15} className="spinning" /> : <UploadCloud size={15} />}
        <span>{importing ? 'Processing Ingestion...' : 'Import Data Into Store'}</span>
      </button>
    </form>
  );
};

export default SettingsPage;
