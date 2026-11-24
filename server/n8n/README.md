# CommercePilot AI — n8n Workflow Automation Architecture

This directory contains the production n8n workflow definitions, schemas, and operational instructions for **CommercePilot AI**.

CommercePilot AI leverages a **hybrid dual-engine architecture**:
1. **Live n8n Mode**: When webhook URLs are configured in your server `.env`, requests are securely dispatched to your live n8n instance over HTTP POST.
2. **Deterministic Simulation & Fallback Mode**: When n8n is offline or unconfigured, the backend automatically executes the exact same deterministic business logic, Groq AI LLM reasoning (`llama-3.3-70b-versatile`), database persistence, and email loops in **Simulated Demo Mode**.

> **Communication Policy**: All customer, supplier, and merchant communications strictly use **Email** (Nodemailer / SMTP) with expiring cryptographic action tokens. WhatsApp and WhatsApp Business APIs are not used anywhere in this architecture.

---

## Workflows Included

| # | Workflow File | Trigger Type | Webhook Path / Schedule | Output Actions |
|---|---|---|---|---|
| **1** | `workflow_1_cod_order_verification.json` | Webhook (POST) | `/webhook/commercepilot/order-analysis` | Computes 0-100 risk score, Groq AI summary, dispatches expiring confirmation email (`/verify-order?token=...`) |
| **2** | `workflow_2_inventory_intelligence.json` | Webhook (POST) | `/webhook/commercepilot/inventory-analysis` | 30-day velocity, runway days, low-stock alerts, auto-drafts PO, emails merchant for approval (`/approve-po?token=...`) |
| **3** | `workflow_3_failed_delivery_recovery.json` | Webhook (POST) | `/webhook/commercepilot/delivery-recovery` | Captures carrier NDR exception, dispatches interactive email with 1-click rescheduling (`/reschedule-delivery?token=...`) |
| **4** | `workflow_4_daily_ai_business_report.json` | Schedule / Webhook | Cron `0 9 * * *` (09:00 AM IST) | Synthesizes daily revenue, order risk & delivery stats via Groq AI, emails HTML executive briefing to store owner |

---

## 1. COD Order Verification Workflow

### Webhook Endpoint
- **URL**: `http://localhost:5678/webhook/commercepilot/order-analysis`
- **Method**: `POST`
- **Headers**:
  - `Content-Type: application/json`
  - `X-CommercePilot-Secret: <N8N_WEBHOOK_SECRET>`
  - `X-Idempotency-Key: <unique-order-uuid>`

### Request Payload Example
```json
{
  "orderId": "651a2b3c4d5e6f7a8b9c0d1e",
  "orderNumber": "ORD-2026-9041",
  "totalAmount": 4299,
  "paymentMethod": "COD",
  "customer": {
    "name": "Arjun Mehta",
    "email": "arjun.m@example.com",
    "phone": "9876543210",
    "address": "Flat 402, Greenfield Apts, Indiranagar",
    "city": "Bengaluru",
    "state": "Karnataka",
    "pincode": "560038",
    "pastOrdersCount": 0,
    "pastDeliveredCount": 0,
    "pastRtoCount": 0
  },
  "items": [
    {
      "productId": "651a1a...",
      "title": "Raw Silk Festive Kurta",
      "sku": "CC-KUR-01",
      "quantity": 1,
      "price": 4299
    }
  ],
  "storeId": "651a00...",
  "riskThreshold": 60
}
```

### Deterministic Risk Scoring Rules
- **Phone Sanity**: +30 if missing, < 10 digits, or repetitive numbers (`9999999999`).
- **Address Validation**: +25 if address < 15 characters; +20 if invalid 6-digit Indian PIN code.
- **RTO History**: +25 per past RTO up to +45.
- **High-Value COD**: +15 for new buyer with cart > ₹3,000.
- **Repeat Loyalty Discount**: -20 risk deduction for repeat buyers with 2+ completed deliveries and 0 RTOs.
- **Decision Tiers**:
  - `0 - 39`: `PROCEED` (Automatic fulfillment)
  - `40 - 69`: `REQUEST_CONFIRMATION` (Dispatch secure email confirmation)
  - `70 - 100`: `MANUAL_REVIEW` (Flagged for merchant attention)

### Response Payload Example
```json
{
  "orderId": "651a2b3c4d5e6f7a8b9c0d1e",
  "orderNumber": "ORD-2026-9041",
  "riskScore": 65,
  "riskLevel": "MEDIUM",
  "recommendation": "REQUEST_CONFIRMATION",
  "reasons": [
    "First-time buyer with high COD cart value (> ₹3,000)",
    "Brief shipping address"
  ],
  "aiAnalysis": {
    "summary": "First-time buyer with high cart value of ₹4,299 and minimal address details. Verification link dispatched to prevent courier RTO cost.",
    "model": "llama-3.3-70b-versatile",
    "confidence": 0.88
  },
  "requiresAction": true,
  "suggestedAction": "EMAIL_CONFIRMATION"
}
```

---

## 2. Inventory Intelligence & Auto-PO Workflow

### Webhook Endpoint
- **URL**: `http://localhost:5678/webhook/commercepilot/inventory-analysis`
- **Method**: `POST`

### Request Payload Example
```json
{
  "storeId": "651a00...",
  "items": [
    {
      "id": "651a01...",
      "title": "Chanderi Handloom Saree",
      "sku": "CC-SAR-01",
      "stockQuantity": 8,
      "reorderThreshold": 15,
      "salesVelocity30Days": 36,
      "price": 2899,
      "costPrice": 1200
    }
  ]
}
```

### Response Payload Example
```json
{
  "storeId": "651a00...",
  "scannedProductsCount": 1,
  "alertsCount": 1,
  "alerts": [
    {
      "productId": "651a01...",
      "title": "Chanderi Handloom Saree",
      "sku": "CC-SAR-01",
      "currentStock": 8,
      "threshold": 15,
      "runwayDays": 7,
      "dailyVelocity": 1.2,
      "severity": "CRITICAL"
    }
  ],
  "purchaseOrderDraft": {
    "poNumber": "PO-829103",
    "supplier": {
      "name": "Apex Apparel & Textile Mills",
      "email": "orders@apextextiles.in",
      "leadTimeDays": 7
    },
    "items": [
      {
        "productId": "651a01...",
        "title": "Chanderi Handloom Saree",
        "sku": "CC-SAR-01",
        "suggestedQuantity": 46,
        "costPrice": 1200,
        "estimatedCost": 55200
      }
    ],
    "totalEstimatedCost": 55200,
    "status": "DRAFT_PENDING_APPROVAL"
  }
}
```

---

## 3. Failed Delivery (NDR) Recovery Workflow

### Webhook Endpoint
- **URL**: `http://localhost:5678/webhook/commercepilot/delivery-recovery`
- **Method**: `POST`

### Request Payload Example
```json
{
  "deliveryId": "651b11...",
  "awb": "DEL98213812",
  "courier": "Delhivery",
  "ndrReason": "Customer unavailable during afternoon delivery attempt",
  "orderNumber": "ORD-2026-8812",
  "customerName": "Rohan Gupta",
  "customerEmail": "rohan.g@example.com"
}
```

### Action Logic
- Generates a single-use, 48-hour expiring action token.
- Dispatches an interactive email to the customer with direct link: `http://localhost:5173/reschedule-delivery?token=<token>`.
- Allows customer to select preferred re-attempt date, morning/evening delivery window, and nearest landmark.
- Upon customer submission, updates Delivery status to `SHIPPED` and adds audit notes to the seller timeline.

---

## 4. Daily AI Business Report Workflow

### Schedule Trigger
- **Cron**: `0 9 * * *` (Daily at 09:00 AM IST)
- Can also be triggered on-demand via the CommercePilot Seller Workspace (`/app/automations`).

### Executive Briefing Sections
1. **24-Hour Highlights & Net Revenue**: Total sales, COD vs. prepaid split, average order value.
2. **Operations & Critical Alerts**: Low-stock SKUs, pending carrier NDR exceptions, COD verification backlog.
3. **Groq AI Strategic Advisory**: Tactical recommendations tailored to Indian D2C fulfillment.

---

## Setup & Deployment Guide

### Step 1: Import Workflows into n8n
1. Open your n8n dashboard (default: `http://localhost:5678`).
2. Click **Workflows** → **Import from File...**
3. Select the JSON file (e.g. `workflow_1_cod_order_verification.json`).
4. Repeat for Workflows 2, 3, and 4.

### Step 2: Configure Environment Variables in n8n
Ensure your n8n host environment has access to:
```env
GROQ_API_KEY=gsk_your_groq_api_key_here
```

### Step 3: Configure CommercePilot Server `.env`
Update your `server/.env` with the active n8n webhook URLs:
```env
N8N_ORDER_WEBHOOK_URL=http://localhost:5678/webhook/commercepilot/order-analysis
N8N_INVENTORY_WEBHOOK_URL=http://localhost:5678/webhook/commercepilot/inventory-analysis
N8N_DELIVERY_WEBHOOK_URL=http://localhost:5678/webhook/commercepilot/delivery-recovery
N8N_REPORT_WEBHOOK_URL=http://localhost:5678/webhook/commercepilot/daily-report
N8N_WEBHOOK_SECRET=your_production_shared_secret
```

### Step 4: Verify in Seller Workspace
1. Log in to CommercePilot AI.
2. Navigate to **Automations** (`/app/automations`).
3. Verify that all 4 workflow cards display status **Connected** (or **Simulated Demo Mode** if testing locally without n8n running).
4. Click **Test Workflow** on any card to perform live verification.
