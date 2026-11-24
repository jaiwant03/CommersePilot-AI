# CommercePilot AI

> **"Your Ecommerce Business. On Autopilot."**

An AI-powered ecommerce operations platform engineered to help Indian D2C brands, social commerce merchants, and Shopify/WooCommerce stores reduce Cash-on-Delivery (COD) order failures, predict stockouts, recover failed courier deliveries (NDR), and automate high-friction operational workflows.

---

## 🏗️ Technology Architecture

```
                                  ┌───────────────────────────┐
                                  │   React 19 + Vite Client  │
                                  │   (Vercel SPA Hosting)    │
                                  └─────────────┬─────────────┘
                                                │ HTTPS / Cookies
                                                ▼
┌───────────────────────────────┐  HTTP / REST  ┌───────────────────────────┐
│       Groq AI Engine          │◄─────────────►│    Node.js / Express API  │
│    (Llama 3.3 70B Versatile)  │               │      (Render Hosting)     │
└───────────────────────────────┘               └─────────────┬─────────────┘
                                                              │
                    ┌─────────────────────────────────────────┼───────────────────────────────┐
                    │                                         │                               │
                    ▼                                         ▼                               ▼
     ┌─────────────────────────────┐           ┌─────────────────────────────┐ ┌─────────────────────────────┐
     │      MongoDB Database       │           │   n8n Automation Engine     │ │   Nodemailer Email Engine   │
     │   (MongoDB Atlas Cluster)   │           │   (4 Core Hybrid Webhooks)  │ │ (Expiring Action Tokens)    │
     └─────────────────────────────┘           └─────────────────────────────┘ └─────────────────────────────┘
```

### Frontend (`client/`)
- **Core Framework**: React 19 with Vite
- **Routing**: React Router DOM (v7) with protected workspace and public marketing shells
- **Charts & Visualization**: Recharts (Area, Bar, Donut, and Custom Tooltip components)
- **Icons**: Lucide React
- **HTTP Client**: Axios with preconfigured base URL & interceptors for HTTP-only cookies
- **Styling**: **Strictly Normal CSS**. No Tailwind, No Bootstrap, No Material UI. Uses CSS variables, modern CSS Grid, and Flexbox for responsive layouts.

### Backend (`server/`)
- **Runtime**: Node.js & Express.js
- **Database**: MongoDB with Mongoose ODM (strict store-level multi-tenant isolation)
- **Security**: Helmet, CORS with origin allowlists, Rate Limiting (`express-rate-limit`), Bcrypt password hashing, secure HTTP-only cookies
- **AI Engine**: Groq SDK (`llama-3.3-70b-versatile`) with deterministic database grounding
- **Automation**: n8n Webhook orchestration with hybrid local simulation fallback
- **Email Service**: Nodemailer SMTP integration with single-use, 256-bit expiring action tokens

> **Zero-WhatsApp Communication Policy**: All customer, supplier, and merchant communications strictly use **Email** with expiring cryptographic action tokens. WhatsApp and WhatsApp Business APIs are not used anywhere in this architecture.

---

## 📁 Project Directory Structure

```text
CommercePilot AI/
├── client/                     # Frontend Vite + React application
│   ├── public/                 # Static assets (favicon.svg, robots.txt)
│   ├── src/
│   │   ├── components/         # Reusable UI components (Navbar, Footer, Hero, etc.)
│   │   ├── context/            # React Contexts (AppContext, AuthContext)
│   │   ├── layouts/            # Layout shells (MainLayout, WorkspaceLayout)
│   │   ├── pages/
│   │   │   ├── public/         # Customer action pages (/verify-order, /reschedule-delivery, /approve-po)
│   │   │   ├── workspace/      # Authenticated seller workspace (/app/*)
│   │   │   └── ...             # Marketing pages (Home, Features, Pricing, Auth)
│   │   ├── services/           # API clients & HTTP services (api.js, workspace.service.js)
│   │   ├── styles/             # Dedicated CSS stylesheets (variables, workspace, auth, etc.)
│   │   ├── App.jsx             # Router definition & route mapping
│   │   └── main.jsx            # React root mount
│   ├── vercel.json             # Vercel deployment configuration & SPA rewrites
│   ├── .env.example            # Frontend environment variable template
│   └── package.json            # Frontend dependencies and Vite build scripts
│
├── server/                     # Backend Node.js + Express API
│   ├── src/
│   │   ├── config/             # Config loaders (env.js, db.js)
│   │   ├── controllers/        # Express controllers (auth, order, inventory, analytics, assistant, etc.)
│   │   ├── middleware/         # Custom middleware (auth, cors, rateLimiter, errorHandler)
│   │   ├── models/             # Mongoose schemas (User, Store, Product, Order, Delivery, etc.)
│   │   ├── routes/             # API routes
│   │   └── services/           # Core services (aiAssistant, forecasting, analytics, n8n, email)
│   ├── n8n/                    # Importable n8n workflow templates & architecture manual
│   │   ├── workflow_1_cod_order_verification.json
│   │   ├── workflow_2_inventory_intelligence.json
│   │   ├── workflow_3_failed_delivery_recovery.json
│   │   ├── workflow_4_daily_ai_business_report.json
│   │   └── README.md           # Webhook schemas & n8n setup guide
│   ├── scripts/                # End-to-end integration and QA test suites
│   ├── render.yaml             # Render backend deployment blueprint
│   ├── .env.example            # Backend environment variable template
│   └── package.json            # Backend dependencies and startup scripts
│
├── package.json                # Root package.json with concurrent dev scripts
└── README.md                   # This documentation
```

---

## ⚙️ Environment Variables

### Backend (`server/.env`)
Copy `server/.env.example` to `server/.env`:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Client Application URL (For CORS allowlist & email action links)
CLIENT_URL=http://localhost:5173

# MongoDB Connection String (Local or MongoDB Atlas)
MONGODB_URI=mongodb://127.0.0.1:27017/commercepilot_ai

# JWT Secret for Session Cookie Signing (Use a 64+ char random string)
JWT_SECRET=your_super_secret_jwt_key_here_at_least_32_chars

# Groq API Key (For Llama 3.3 70B inference)
GROQ_API_KEY=gsk_your_groq_api_key_here

# n8n Automation Engine Webhooks (Leave blank for local demo simulation mode)
N8N_ORDER_WEBHOOK_URL=http://localhost:5678/webhook/commercepilot/order-analysis
N8N_INVENTORY_WEBHOOK_URL=http://localhost:5678/webhook/commercepilot/inventory-analysis
N8N_DELIVERY_WEBHOOK_URL=http://localhost:5678/webhook/commercepilot/delivery-recovery
N8N_REPORT_WEBHOOK_URL=http://localhost:5678/webhook/commercepilot/daily-report

# Shared Secret for Webhook Signature Verification (X-CommercePilot-Secret header)
N8N_WEBHOOK_SECRET=your_production_n8n_shared_secret

# SMTP Email Configuration (Nodemailer)
# If empty, system runs in safe Simulated Fallback Mode with formatted console logs
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM="CommercePilot Operations" <no-reply@commercepilot.ai>
```

### Frontend (`client/.env`)
Copy `client/.env.example` to `client/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 🚀 Quickstart & Setup Instructions

### 1. Install Dependencies
Run from the root directory:
```bash
npm run install:all
```

### 2. Start Local MongoDB
Ensure MongoDB is running locally on port `27017` or update `MONGODB_URI` to a MongoDB Atlas cluster URI.

### 3. Start Development Servers
From the root directory:
```bash
npm run dev
```
- **React Frontend**: `http://localhost:5173`
- **Express Backend API**: `http://localhost:5000`
- **Health Check API**: `http://localhost:5000/api/health`

---

## 🧠 Core Feature Capabilities

### 1. Controlled, Data-Grounded AI Assistant (`/app/assistant`)
Answers real operational questions strictly grounded in MongoDB database records:
- *"Which products should I reorder?"* → Evaluates Average Daily Demand (ADD) and lists SKUs below Reorder Point (ROP).
- *"Which orders need verification?"* → Lists high-risk COD orders on hold.
- *"What are my biggest inventory risks?"* → Identifies stockouts, critical runways, and slow-moving capital.
- *"Which products have the highest sales?"* → Ranks top products strictly distinguishing Gross Revenue from Net Realized Profit.
- *"How many failed deliveries occurred this month?"* → Summarizes carrier delivery exceptions and active NDR recovery loops.
- *"Summarize my business performance."* → Produces an executive 30-day health digest with margin analytics.

### 2. Demand Forecasting & Inventory Runway Engine
Calculates moving-average demand parameters:
- **Average Daily Demand (ADD)**: $\text{Units Sold in Window} / \text{Lookback Days}$
- **Days of Stock (Runway)**: $\text{Available Stock} / \text{ADD}$
- **Reorder Point (ROP)**: $(\text{ADD} \times \text{Lead Time}) + \text{Safety Stock}$
- **Suggested Order Quantity**: Replenishes to a 45-day demand cycle.

### 3. Business Analytics with Recharts (`/app/analytics`)
- **Gross Revenue vs. Net Profit**: Visualizes billed revenue alongside realized profit after Cost of Goods Sold (COGS).
- **Orders vs. Cancellations Timeline**: Daily fulfillment versus customer cancellation trends.
- **Payment Mix**: COD vs Prepaid online payment volume and return ratios.
- **Logistics Breakdown**: Delivery success rates, in-transit parcels, and courier RTO penalties.

### 4. Hybrid Automation Engine & Action Email Loops (`/app/automations`)
- **COD Order Verification**: Computes deterministic risk (0–100); emails buyer an expiring confirmation link (`/verify-order?token=...`).
- **Inventory Intelligence & Auto-PO**: Detects low stock; auto-drafts POs; emails merchant for approval (`/approve-po?token=...`) before supplier dispatch.
- **Failed Delivery (NDR) Recovery**: Intercepts courier failures; emails buyer an interactive rescheduling link (`/reschedule-delivery?token=...`) with slot & landmark capture.
- **Daily AI Executive Briefing**: Synthesizes daily revenue and alerts; emails HTML summary to the store owner at 09:00 AM IST.

---

## 🔒 Security Architecture

- **Bcrypt Password Hashing**: Salted with 10 rounds; passwords never stored or logged in plaintext.
- **HTTP-Only Cookies**: JWT tokens delivered via `httpOnly`, `sameSite`, and `secure` cookies in production.
- **Rate Limiting**: `express-rate-limit` protects authentication endpoints (25 req/15 min) and general API endpoints (300 req/15 min).
- **Multi-Tenant Data Isolation**: Every MongoDB query strictly enforces `store: req.store._id`. Verified by cross-tenant security test suites.
- **Expiring Action Tokens**: Cryptographically random 256-bit hex tokens with 7-day TTL index auto-cleanup and single-use invalidation.
- **Zero Frontend Secrets**: API keys (`GROQ_API_KEY`, `JWT_SECRET`, `N8N_WEBHOOK_SECRET`) are strictly kept on the server.

---

## 🌐 Production Deployment Guide

### Frontend Deployment (Vercel)
1. Push your repository to GitHub.
2. Import the repository in [Vercel](https://vercel.com).
3. Set **Root Directory** to `client`.
4. Configure Build Command: `npm run build` and Output Directory: `dist`.
5. Add Environment Variable:
   - `VITE_API_BASE_URL`: `https://your-backend-api.onrender.com/api`
6. Deploy. The included `client/vercel.json` automatically handles SPA routing and asset caching.

### Backend Deployment (Render)
1. In [Render](https://render.com), create a new **Web Service** or use the included `server/render.yaml` blueprint.
2. Set **Root Directory** to `server`.
3. Build Command: `npm install` | Start Command: `npm start`.
4. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
   - `MONGODB_URI`: `<Your MongoDB Atlas Connection String>`
   - `JWT_SECRET`: `<Secure 64+ char random string>`
   - `CLIENT_URL`: `https://your-frontend.vercel.app`
   - `GROQ_API_KEY`: `<Your Groq API Key>`
   - `N8N_WEBHOOK_SECRET`: `<Your Shared Secret>`
5. Deploy. Verify health at `https://your-backend-api.onrender.com/api/health`.

### Database Deployment (MongoDB Atlas)
1. Create a cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a database user and allow your Render backend IP address (or `0.0.0.0/0` with secure credentials).
3. Copy the SRV connection string into `MONGODB_URI`.

---

## 🧪 Automated Test Suite

Run the full end-to-end integration and security audit:
```bash
node server/scripts/test_phase6_final.js
```

**Test Coverage (48/48 Passing Checks):**
1. Password hashing and authentication cookie security.
2. Multi-tenant store-level isolation (zero cross-tenant data leakage).
3. Product and Inventory CRUD with real-time stock movements.
4. COD order risk scoring and single-use email verification actions.
5. Deterministic demand forecasting (ADD, ROP, Runway days).
6. Courier delivery NDR recovery and customer slot rescheduling.
7. Gross revenue versus net profit margin calculations.
8. Grounded AI assistant responses across all 6 business categories.
9. Edge cases (empty datasets, missing history, offline API fallbacks).
