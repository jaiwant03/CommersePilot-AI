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
  Mail
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
    <div style={{ maxWidth: '800px' }}>
      {/* Title */}
      <div className="page-title-row">
        <div className="page-title-heading">
          <h1>Store Settings & Autopilot Controls</h1>
          <p>Configure sales channels, COD risk thresholds and autonomous intervention rules</p>
        </div>
      </div>

      {saveSuccess && (
        <div style={{
          padding: '12px 16px',
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: '#34D399',
          fontSize: '13px',
          fontWeight: 600
        }}>
          <CheckCircle2 size={18} />
          <span>Store settings and autopilot thresholds saved successfully to MongoDB!</span>
        </div>
      )}

      {errorMessage && (
        <div style={{
          padding: '12px 16px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '20px',
          color: '#F87171',
          fontSize: '13px'
        }}>
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* 1. Store Identity */}
        <div className="data-table-card" style={{ padding: '24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
            <Store size={20} style={{ color: '#818CF8' }} />
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                Store Identity & Channel
              </h2>
              <div style={{ fontSize: '12px', color: 'var(--color-text-faint)' }}>
                Primary storefront identification
              </div>
            </div>
          </div>

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
            <div className="workspace-form-group">
              <label className="workspace-label">Business Category</label>
              <select
                name="category"
                className="workspace-select"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="Apparel & Fashion">Apparel & Fashion</option>
                <option value="Beauty & Cosmetics">Beauty & Cosmetics</option>
                <option value="Footwear">Footwear</option>
                <option value="Jewelry & Accessories">Jewelry & Accessories</option>
                <option value="Home & Living">Home & Living</option>
                <option value="Electronics & Gadgets">Electronics & Gadgets</option>
              </select>
            </div>

            <div className="workspace-form-group">
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

        {/* 2. Operations & Autopilot Thresholds */}
        <div className="data-table-card" style={{ padding: '24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
            <Sliders size={20} style={{ color: '#F59E0B' }} />
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                Autonomous Risk & Stock Thresholds
              </h2>
              <div style={{ fontSize: '12px', color: 'var(--color-text-faint)' }}>
                Trigger parameters for automated decisions
              </div>
            </div>
          </div>

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
                Orders with risk score ≥ this number will require buyer email confirmation before dispatch.
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
              placeholder="e.g. operations@chiccouture.in"
              value={formData.settings.alertEmail}
              onChange={handleChange}
            />
            <span className="workspace-help">
              Daily summary digests and low-stock alerts are dispatched to this address.
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="settings.autoEmailVerification"
                checked={formData.settings.autoEmailVerification ?? true}
                onChange={handleChange}
                style={{ width: '16px', height: '16px' }}
              />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  Enable Automated Email Verification on High-Risk COD
                </div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-faint)' }}>
                  Automatically triggers a secure confirmation link to the customer before inventory is packed.
                </div>
              </div>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="settings.autoNdrRecovery"
                checked={formData.settings.autoNdrRecovery}
                onChange={handleChange}
                style={{ width: '16px', height: '16px' }}
              />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  Enable Automated Courier NDR Address Verification
                </div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-faint)' }}>
                  Dispatches real-time re-attempt request when courier marks customer unavailable.
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginBottom: '32px' }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? <RefreshCw size={16} className="spinning" /> : <Save size={16} />}
            <span>{saving ? 'Saving Changes...' : 'Save Store Preferences'}</span>
          </button>
        </div>
      </form>

      {/* Store Connection Status & Sales Channels */}
      <div className="workspace-card" style={{ marginBottom: '24px' }}>
        <div className="workspace-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Store size={18} style={{ color: '#4F46E5' }} />
            <h2 className="workspace-card-title">Store Connection &amp; Sales Channels</h2>
          </div>
          <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '9999px', background: 'rgba(16, 185, 129, 0.15)', color: '#16A34A', fontWeight: 700, border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            ● STATUS: {store?.connectionStatus || 'CONNECTED'}
          </span>
        </div>
        <div className="workspace-card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--color-text-faint)', fontWeight: 600 }}>OPERATING CURRENCY</span>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '2px' }}>
                {store?.currency || 'INR (₹)'}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--color-text-faint)', fontWeight: 600 }}>INTEGRATED CHANNELS</span>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '2px' }}>
                {(store?.salesChannels || ['Online Store', 'Instagram', 'WhatsApp']).join(', ')}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--color-text-faint)', fontWeight: 600 }}>LAST SYNCHRONIZATION</span>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '2px' }}>
                {store?.lastSyncAt ? new Date(store.lastSyncAt).toLocaleString('en-IN') : 'Live Synced (Just now)'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSV / JSON Store Data Importer */}
      <div className="workspace-card">
        <div className="workspace-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sliders size={18} style={{ color: '#0284C7' }} />
            <h2 className="workspace-card-title">Store Data Importer (CSV / JSON)</h2>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--color-text-faint)' }}>
            Bulk upload Products, Orders &amp; Inventory
          </span>
        </div>
        <div className="workspace-card-body">
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '14px', lineHeight: 1.5 }}>
            Paste comma-separated values (CSV) or JSON array to automatically ingest store catalogs, customer records, and orders into your tenant database with auto-mapping.
          </p>

          <DataImporterSubcomponent onImportSuccess={fetchSettings} />
        </div>
      </div>
    </div>
  );
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

  return (
    <form onSubmit={handleImport}>
      <div className="form-grid-2" style={{ marginBottom: '14px' }}>
        <div className="workspace-form-group">
          <label className="workspace-label">Import Target Entity</label>
          <select
            className="workspace-select"
            value={importType}
            onChange={(e) => setImportType(e.target.value)}
          >
            <option value="products">Products Catalog</option>
            <option value="orders">Orders &amp; Customers</option>
            <option value="customers">Customer Profiles</option>
            <option value="inventory">Inventory Adjustments</option>
          </select>
        </div>
      </div>

      <div className="workspace-form-group" style={{ marginBottom: '14px' }}>
        <label className="workspace-label">Paste CSV or JSON Payload</label>
        <textarea
          className="workspace-textarea"
          rows={5}
          placeholder={
            importType === 'products'
              ? 'title,sku,price,costPrice,stockQuantity\nWomen\'s Black Kurti,TT-KUR-BLK,1299,450,25\nFloral Anarkali Kurti,TT-KUR-FLOR,1999,750,18'
              : 'orderNumber,customerName,phone,email,city,amount,paymentMethod\nTT10245,Ananya Deshmukh,+919876543210,ananya@example.com,Coimbatore,2500,COD'
          }
          value={rawData}
          onChange={(e) => setRawData(e.target.value)}
          style={{ fontFamily: 'monospace', fontSize: '12px' }}
        />
      </div>

      {resultMsg && (
        <div style={{
          padding: '10px 14px',
          borderRadius: '6px',
          fontSize: '12.5px',
          fontWeight: 600,
          marginBottom: '14px',
          background: resultMsg.success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          color: resultMsg.success ? '#16A34A' : '#DC2626',
          border: `1px solid ${resultMsg.success ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
        }}>
          {resultMsg.text}
        </div>
      )}

      <button type="submit" className="btn btn-primary" disabled={importing}>
        {importing ? <RefreshCw size={15} className="spinning" /> : <Sliders size={15} />}
        <span>{importing ? 'Processing Import...' : 'Import Data Into Store'}</span>
      </button>
    </form>
  );
};

export default SettingsPage;
