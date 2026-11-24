const fs = require('fs');
const path = require('path');

// 1. Update ProductShowcase.jsx
const pShowcasePath = path.join(__dirname, '../../client/src/components/ProductShowcase.jsx');
let pShowcase = fs.readFileSync(pShowcasePath, 'utf8');

// Ensure AnimatedRupee and TrendingUp are imported
if (!pShowcase.includes('import AnimatedRupee')) {
  pShowcase = pShowcase.replace(
    "import React, { useState } from 'react';",
    "import React, { useState } from 'react';\nimport AnimatedRupee from './AnimatedRupee';"
  );
}

if (!pShowcase.includes('TrendingUp,')) {
  pShowcase = pShowcase.replace(
    '  BarChart3,',
    '  BarChart3,\n  TrendingUp,'
  );
}

// Hero shipping card rupee replacement
pShowcase = pShowcase.replace(
  '<div className="package-card-meta">₹2,500 • Prepaid Verified</div>',
  '<div className="package-card-meta"><AnimatedRupee value={2500} suffix=" • Prepaid Verified" /></div>'
);

// Feature 2 PO box rupee replacement
pShowcase = pShowcase.replace(
  'Supplier: Coimbatore Fabric Mills • 650 Units (₹45,000)',
  'Supplier: Coimbatore Fabric Mills • 650 Units (<AnimatedRupee value={45000} />)'
);

// Feature 5 Dashboard replacement with Luxury UI
const oldBiDashboard = `<div className="analytics-visual-dashboard">
              
              {/* Financial KPI Summary Cards */}
              <div className="kpi-two-col-grid">
                <div className="kpi-mini-card">
                  <span className="kpi-card-label">Gross Revenue (GMV)</span>
                  <span className="kpi-card-val text-navy">₹46,731</span>
                  <span className="kpi-card-trend trend-up">↑ +18.4% this month</span>
                </div>
                <div className="kpi-mini-card highlight-profit">
                  <span className="kpi-card-label">Realized Net Profit</span>
                  <span className="kpi-card-val text-indigo">₹26,176</span>
                  <span className="kpi-card-sub">56% Realized Margin</span>
                </div>
              </div>

              {/* Top Margin Product Catalog Card */}
              <div className="top-margin-card">
                <div className="top-margin-header">
                  <BarChart3 size={15} className="text-cyan" />
                  <span>High-Margin Product Performance</span>
                </div>
                <div className="margin-item-row">
                  <div className="item-name-col">
                    <span className="item-title">Chanderi Silk Saree</span>
                    <span className="item-sku">SKU: TT-SAR-SILK</span>
                  </div>
                  <div className="item-stat-col">
                    <span className="margin-percent">68% Margin</span>
                    <span className="margin-rupee">₹1,850 Profit/Unit</span>
                  </div>
                </div>
                <div className="margin-item-row">
                  <div className="item-name-col">
                    <span className="item-title">Handloom Cotton Kurti</span>
                    <span className="item-sku">SKU: TT-KUR-COT</span>
                  </div>
                  <div className="item-stat-col">
                    <span className="margin-percent">54% Margin</span>
                    <span className="margin-rupee">₹720 Profit/Unit</span>
                  </div>
                </div>
              </div>

              {/* Repeat Buyer Cohort Tag */}
              <div className="retention-cohort-tag">
                <div className="cohort-dot" />
                <span>Repeat Buyer Cohort: 14% of customers drive 32% of total store profits</span>
              </div>

            </div>`;

const newBiDashboard = `<div className="analytics-visual-dashboard luxury-card-elevation">
              
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

            </div>`;

const normalize = str => str.replace(/\r\n/g, '\n');

let normShowcase = normalize(pShowcase);
if (normShowcase.includes(normalize(oldBiDashboard))) {
  normShowcase = normShowcase.replace(normalize(oldBiDashboard), normalize(newBiDashboard));
  console.log('ProductShowcase Feature 5 successfully upgraded to luxury dashboard with AnimatedRupee.');
} else {
  console.log('oldBiDashboard block not found for exact replacement, checking fallback...');
}
fs.writeFileSync(pShowcasePath, normShowcase, 'utf8');

// 2. Update PricingSection.jsx with AnimatedRupee
const pricingPath = path.join(__dirname, '../../client/src/components/PricingSection.jsx');
let pricing = fs.readFileSync(pricingPath, 'utf8');

if (!pricing.includes('import AnimatedRupee')) {
  pricing = pricing.replace(
    "import React, { useState } from 'react';",
    "import React, { useState } from 'react';\nimport AnimatedRupee from './AnimatedRupee';"
  );
}

const oldPriceSpan = `<span className="plan-price" style={{ fontSize: '40px', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.03em' }}>
                {isAnnual ? plan.annualPrice : plan.monthlyPrice}
              </span>`;

const newPriceSpan = `<span className="plan-price" style={{ fontSize: '40px', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.03em' }}>
                <AnimatedRupee value={isAnnual ? plan.annualPrice : plan.monthlyPrice} prefix="" />
              </span>`;

let normPricing = normalize(pricing);
if (normPricing.includes(normalize(oldPriceSpan))) {
  normPricing = normPricing.replace(normalize(oldPriceSpan), normalize(newPriceSpan));
  console.log('PricingSection successfully updated with AnimatedRupee.');
}
fs.writeFileSync(pricingPath, normPricing, 'utf8');

// 3. Update layout.css with Luxury Styling for Feature 5 and AnimatedRupee
const cssPath = path.join(__dirname, '../../client/src/styles/layout.css');
let css = fs.readFileSync(cssPath, 'utf8');

const luxuryCss = `
/* ==========================================================================
   Luxury Premium Business Intelligence Dashboard & Animated Rupee Styles
   ========================================================================== */
.luxury-card-elevation {
  background: linear-gradient(165deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.95) 50%, rgba(238, 242, 255, 0.85) 100%) !important;
  border: 1.5px solid rgba(99, 102, 241, 0.28) !important;
  border-radius: 24px !important;
  padding: 22px !important;
  box-shadow: 
    0 30px 65px -15px rgba(79, 70, 229, 0.18),
    0 0 0 1px rgba(255, 255, 255, 0.9),
    inset 0 1px 0 rgba(255, 255, 255, 0.95) !important;
  position: relative;
  overflow: hidden;
}

.luxury-dash-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.8);
  margin-bottom: 4px;
}

.dash-brand-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #EEF2FF;
  border: 1px solid #C7D2FE;
  border-radius: 20px;
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 700;
  color: #4F46E5;
  letter-spacing: 0.02em;
}

.dash-live-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 700;
  color: #16A34A;
}

.live-pulse-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #10B981;
  box-shadow: 0 0 8px #10B981;
}

.luxury-kpi-glass {
  background: rgba(255, 255, 255, 0.85) !important;
  border: 1.5px solid #E2E8F0 !important;
  border-radius: 16px !important;
  padding: 14px 16px !important;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04) !important;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.luxury-kpi-glass:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 22px rgba(15, 23, 42, 0.08) !important;
}

.luxury-kpi-electric {
  background: linear-gradient(135deg, #4338CA 0%, #4F46E5 55%, #6366F1 100%) !important;
  border: 1.5px solid rgba(255, 255, 255, 0.2) !important;
  border-radius: 16px !important;
  padding: 14px 16px !important;
  box-shadow: 0 12px 28px -6px rgba(79, 70, 229, 0.42) !important;
  color: #FFFFFF !important;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.luxury-kpi-electric:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 36px -6px rgba(79, 70, 229, 0.55) !important;
}

.kpi-card-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2px;
}

.text-white-80 {
  color: rgba(255, 255, 255, 0.85) !important;
}

.luxury-kpi-num {
  font-size: 24px;
  font-weight: 850;
  letter-spacing: -0.025em;
  line-height: 1.1;
  font-feature-settings: "tnum";
  font-variant-numeric: tabular-nums;
}

.luxury-trend-badge {
  font-size: 11px;
  font-weight: 700;
  color: #16A34A;
  margin-top: 4px;
  display: inline-block;
}

.luxury-margin-pill {
  font-size: 10.5px;
  font-weight: 750;
  color: #E0E7FF;
  background: rgba(255, 255, 255, 0.16);
  padding: 3px 8px;
  border-radius: 6px;
  width: fit-content;
  margin-top: 4px;
  display: inline-block;
}

.luxury-margin-card {
  background: #FFFFFF !important;
  border: 1.5px solid #E2E8F0 !important;
  border-radius: 16px !important;
  padding: 14px 16px !important;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.03) !important;
}

.header-icon-box {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: #EEF2FF;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.margin-header-title {
  font-size: 12.5px;
  font-weight: 750;
  color: #0F172A;
  flex-grow: 1;
}

.live-tag-pill {
  font-size: 10px;
  font-weight: 700;
  color: #0284C7;
  background: #E0F2FE;
  padding: 2px 7px;
  border-radius: 4px;
}

.margin-mini-track {
  width: 100%;
  height: 4px;
  background: #F1F5F9;
  border-radius: 9999px;
  overflow: hidden;
  margin-top: 6px;
}

.margin-mini-fill {
  height: 100%;
  border-radius: 9999px;
  transition: width 0.8s ease;
}

.fill-emerald {
  background: linear-gradient(90deg, #10B981 0%, #34D399 100%);
}

.fill-indigo {
  background: linear-gradient(90deg, #4F46E5 0%, #818CF8 100%);
}

.margin-percent-badge {
  font-size: 10.5px;
  font-weight: 750;
  padding: 2px 7px;
  border-radius: 6px;
}

.badge-emerald {
  background: #DCFCE7;
  color: #15803D;
}

.badge-indigo {
  background: #EEF2FF;
  color: #4F46E5;
}

.luxury-cohort-banner {
  background: linear-gradient(135deg, rgba(238, 242, 255, 0.9) 0%, rgba(240, 249, 255, 0.9) 100%) !important;
  border: 1px solid #C7D2FE !important;
  border-radius: 12px !important;
  padding: 10px 14px !important;
  font-size: 11.5px !important;
  font-weight: 600 !important;
  color: #334155 !important;
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
}

.pulse-cyan-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #0EA5E9;
  box-shadow: 0 0 8px #0EA5E9;
  flex-shrink: 0;
}

/* Animated Rupee Value Styling */
.animated-rupee-value {
  display: inline-block;
  font-feature-settings: "tnum";
  font-variant-numeric: tabular-nums;
  transition: transform 0.2s ease;
}
`;

if (!css.includes('luxury-card-elevation')) {
  css += luxuryCss;
  console.log('Luxury layout CSS appended.');
}

fs.writeFileSync(cssPath, css, 'utf8');
console.log('Layout CSS updated successfully.');
