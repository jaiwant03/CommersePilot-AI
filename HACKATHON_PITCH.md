# CommercePilot AI — Startup Pitch & 5-Minute Demo

> **Sell without stress. Scale with success—with AI that acts on your store data.**

## 1. The idea in one sentence

**CommercePilot AI is an ecommerce operations command center for D2C brands that helps teams spot risky COD orders, make better replenishment decisions, recover delivery exceptions, and understand store performance from one workspace.**

## 2. The 30-second pitch

Small ecommerce teams do not lose time only to selling. They lose it switching between order lists, stock sheets, courier updates, and reports—often discovering a risky cash-on-delivery order, an impending stockout, or a failed delivery too late to act.

CommercePilot AI brings those operational signals together. It combines explainable rules and demand calculations with a data-grounded AI copilot, then connects insights to practical next steps such as customer verification, purchase-order review, and delivery follow-up. The goal is simple: help growing merchants protect more orders and make daily operations less manual.

## 3. The problem and opportunity

For a lean D2C team, routine operations can become fragmented:

- A COD order may need a closer look before it is dispatched.
- Inventory can run low before the next supplier delivery arrives.
- A non-delivery report can turn into a return if nobody follows up promptly.
- Revenue totals alone do not explain costs, margins, or operational risks.
- Important context is scattered across tools, leaving owners to reconcile it manually.

CommercePilot AI is designed for Indian and other COD-heavy ecommerce operations, especially early-stage and growing direct-to-consumer brands. It focuses on the operational work between receiving an order and successfully fulfilling it.

## 4. What the product does

### Order intelligence

- Shows and manages store orders in a dedicated workspace.
- Applies explainable COD risk heuristics using signals such as order value, address completeness, phone format, and available customer history.
- Surfaces orders that may need confirmation or merchant review before dispatch.
- Supports verification workflows using secure, expiring email action links where email is configured.

**Pitch it as:** “We help merchants review risk before they pay the cost of a failed shipment.”

### Inventory planning

- Tracks products, stock, categories, movements, and purchase orders.
- Calculates average daily demand, estimated days of stock, reorder points, and suggested replenishment quantities.
- Highlights low-stock and critical-runway products.
- Supports purchase-order drafting and merchant approval workflows.

Forecasts are deterministic projections based on available sales and stock data—not a claim of deep-learning prediction. Recommendations become more useful as a store accumulates history.

**Pitch it as:** “We turn stock data into a clear answer to ‘what should I reorder, and how urgent is it?’”

### Delivery exception management

- Provides a workspace for delivery records and delivery-related actions.
- Supports recovery workflow hooks for failed delivery events and customer follow-up.
- Offers customer action pages for rescheduling delivery when the configured workflow sends the relevant secure link.

Carrier and messaging integrations depend on the deployment and configured webhooks; do not present an unconfigured integration as live.

**Pitch it as:** “A failed attempt should trigger a next step—not disappear into a spreadsheet.”

### Analytics

- Summarizes orders, revenue, payment mix, delivery outcomes, and product performance.
- Separates gross revenue from estimated costs and profit views where the underlying records provide the data.
- Presents time-range views and operational breakdowns to help merchants understand what is changing.

**Pitch it as:** “The dashboard connects operational activity to the business outcome behind it.”

### Data-grounded AI operations copilot

- Accepts natural-language questions about store operations.
- Uses store records and deterministic calculations to provide context for questions about verification, stock risks, reorders, delivery failures, and performance.
- Uses Groq for AI-generated explanations when configured, with guardrails and fallback responses in the service.

**Pitch it as:** “The AI explains what is happening in your store; it is not asked to invent the store’s numbers.”

### Workflow automation

- Exposes operational workflow triggers for order analysis, inventory intelligence, delivery recovery, and daily reporting.
- Can dispatch to n8n webhooks when configured.
- Supports a demo/simulation mode so workflows can be demonstrated without a live n8n connection.
- Uses email workflows and expiring action tokens where SMTP is configured.

## 5. Explaining the supplied screenshots

### Screenshot 1 — public website navigation

This is the public-facing product website navigation:

- **Home:** the product promise and entry point.
- **Product:** interactive product walkthrough and capability examples.
- **Features:** a deeper explanation of the capabilities.
- **How It Works:** the operational workflow from data to action.
- **Pricing:** the proposed subscription tiers.

The blue underline indicates the active section. On the landing page these links navigate to sections of the page; the public site also has product, feature, workflow, and pricing pages.

**What to say:** “The public site explains the value before signup; after login, the merchant moves into the operational workspace shown in the next screenshot.”

### Screenshot 2 — CommercePilot workspace sidebar

This is the navigation for the authenticated merchant workspace:

- **Core Operations:** Overview, Orders, Inventory, and Deliveries.
- **Intelligence & Tools:** Analytics, AI Assistant, Automations, and Store Settings.
- **Groq badge:** identifies the AI-powered assistant area.
- **Marketing Site / Live:** takes the merchant back to the public product website.

**What to say:** “The workspace is organized around the merchant’s operating loop: see the business, manage orders and stock, follow deliveries, then use analytics and automation to decide what to do next.”

## 6. Product experience from first visit to daily use

1. A visitor lands on the public Home page and understands the product’s purpose.
2. They explore Product, Features, How It Works, and Pricing.
3. A merchant registers, signs in, and completes the available onboarding flow.
4. The workspace brings together overview metrics, orders, inventory, deliveries, analytics, the AI assistant, automation logs, and store settings.
5. The merchant reviews operational signals and takes an action or triggers a configured workflow.

The project includes a React client and an Express API backed by MongoDB. AI, n8n, and SMTP behavior depends on the corresponding server configuration. The demo can use seeded data and simulation mode.

## 7. Why this is different

- **Operations, not another storefront:** the product focuses on reducing the work and uncertainty after an order arrives.
- **Explainable decisions:** risk and replenishment logic can be described in business terms, rather than presented as an opaque score.
- **Insight connected to action:** risk flags, runway estimates, and delivery exceptions lead to review or workflow steps.
- **One operational view:** merchants can move from orders to inventory, delivery, and business performance without stitching together separate reports.
- **Practical AI:** the copilot is grounded in store records and calculations, with guardrails around its responses.
- **Demo-friendly architecture:** optional n8n and email configuration lets the prototype demonstrate workflows without requiring every external integration to be live.

## 8. Technology overview

| Layer | Technology | Role |
|---|---|---|
| Web application | React 19, Vite, React Router | Public product site and authenticated merchant workspace |
| UI and charts | Normal CSS, Lucide React, Recharts | Responsive navigation, operational views, and visual analytics |
| API | Node.js, Express | Authentication and ecommerce operations endpoints |
| Data | MongoDB, Mongoose | Stores users, stores, products, orders, deliveries, and workflow records |
| AI | Groq SDK, when configured | Generates explanations for data-grounded operational questions |
| Workflow orchestration | n8n webhooks, optional | Connects operational events to external automation flows |
| Customer actions | Email / SMTP, when configured | Delivers verification, approval, or rescheduling links |

The backend uses authenticated requests and store-scoped data access. Production deployments should configure secrets and external services securely; never put API keys in the frontend.

## 9. Running the project for a demo

### Requirements

- Node.js and npm.
- A MongoDB instance, local or hosted.
- Optional: a Groq API key, n8n webhook URLs, and SMTP credentials for live AI, workflow, and email integrations.

### Start locally

1. Install dependencies from the repository root:

   ```bash
   npm run install:all
   ```

2. Configure `server/.env` with the MongoDB URI, JWT secret, and client URL. Add Groq, n8n, and SMTP settings only if the demo needs those live integrations.
3. Configure `client/.env` with the API base URL, normally `http://localhost:5000/api`.
4. Start both applications:

   ```bash
   npm run dev
   ```

5. Open the Vite client at `http://localhost:5173`. The Express API normally runs at `http://localhost:5000`.
6. Register or sign in with a demo account. From **Overview**, use the demo-data action only with an isolated demo database.

Keep all real credentials out of recordings and screenshots. If a third-party service is not configured, present its workflow as a simulation rather than a live integration.

## 10. Business model and go-to-market

The marketing UI currently presents three monthly subscription tiers:

- **Starter — ₹999/month:** positioned for early-stage brands.
- **Growth — ₹2,499/month:** positioned for merchants needing more volume and automation.
- **Professional — ₹5,999/month:** positioned for higher-volume operations and advanced support.

These are displayed product tiers, not proof that billing is already integrated. A sensible initial go-to-market is to pilot with a small number of D2C merchants, measure operational outcomes, and refine pricing based on order volume and recovered value.

### Pilot success measures

Do not claim results until measured. Track:

- COD orders flagged and confirmed before dispatch.
- Delivery exceptions followed up and successfully rescheduled.
- Stockout incidents and urgent replenishment events.
- Time spent per day reconciling orders, stock, and courier issues.
- Merchant adoption and the number of actionable copilot queries.

## 11. Five-minute demo: exact run of show

### Before recording or presenting

- Start the client, API, and MongoDB; confirm the workspace loads.
- Sign in with a prepared demo merchant account.
- Use an isolated demo database and seed sample records in advance if needed.
- Check that the selected demo route works before presenting.
- Use simulation mode for workflow triggers unless live n8n and email have been deliberately configured for the demo.
- Avoid showing real customer personal information or sending real customer emails.

### Timed walkthrough and spoken script

| Time | Screen / action | Presenter narration |
|---|---|---|
| **0:00–0:35** | Open on the public Home page. | “Growing an ecommerce brand is not just about getting orders. Teams also need to catch risky COD orders, replenish stock in time, and respond when delivery fails. Today that work is split across tools. CommercePilot AI brings those operational decisions into one place.” |
| **0:35–1:00** | Point to the public navigation in screenshot 1: Home, Product, Features, How It Works, Pricing. | “This is the public product experience. A merchant can understand the product, explore its capabilities, see how the workflow fits together, and review the proposed plans before entering the workspace.” |
| **1:00–1:30** | Sign in and open **Overview**. | “The Overview gives the merchant a starting point: order and revenue indicators, verification needs, low-stock signals, delivery issues, recent orders, and inventory alerts. Instead of asking ‘where do I look first?’, the team can start with the exceptions.” |
| **1:30–2:05** | Open **Orders** and select a representative COD order. | “For COD, CommercePilot applies explainable checks such as basket value, address completeness, phone format, and available customer history. The point is not to reject customers automatically; it is to identify orders that may deserve confirmation before dispatch.” |
| **2:05–2:40** | Open **Inventory** and show stock or forecast details. | “For inventory, the system uses recent sales and current stock to estimate daily demand, stock runway, and reorder points. Here the merchant can see which products need attention and review replenishment actions. These are transparent calculations, and confidence improves as store history grows.” |
| **2:40–3:10** | Open **Deliveries** and show an exception or recovery view. | “When a delivery exception is recorded, the recovery workflow can prompt timely follow-up and a customer rescheduling action. The workflow can run through configured webhooks, or be demonstrated in simulation mode.” |
| **3:10–3:45** | Open **Analytics** and show the revenue, orders, payment, or delivery charts. | “Analytics connect daily operations to business performance: order trends, payment mix, delivery outcomes, and product economics. This helps the merchant move from a raw activity list to a clearer view of where attention is needed.” |
| **3:45–4:25** | Open **AI Assistant** and ask: “Which products should I reorder?” or “Which orders need verification?” | “The copilot accepts a natural-language question, then grounds its response in the authenticated store’s data and the platform’s calculations. It is designed to explain operational context—not fabricate numbers. Here it turns a question into a practical next step.” |
| **4:25–4:45** | Briefly open **Automations** and identify the remaining sidebar destinations in screenshot 2. | “Automations exposes the workflow triggers and execution history. The rest of the sidebar keeps core operations—Overview, Orders, Inventory, Deliveries—separate from intelligence tools—Analytics, AI Assistant, Automations—and Store Settings.” |
| **4:45–5:00** | Return to Overview or the product Home page. | “CommercePilot AI helps a lean ecommerce team see risk earlier and act with more context. Our next step is to pilot with merchants and measure fewer preventable failures, faster recovery, and less manual operational work. Thank you.” |

**Total: 5:00.** If the demo runs long, skip the public Product page and show only the two supplied navigation screenshots, then spend the saved time on the live workspace.

## 12. Suggested judge questions

### “What is actually AI here?”

“The product combines deterministic calculations for risk and inventory with a Groq-powered natural-language layer for explanations. We keep the underlying operational numbers grounded in store records; the AI helps make those numbers easier to query and act on.”

### “Are Shopify, courier, n8n, and email integrations all live?”

“The project has API workflows and optional webhook/email configuration. A live connection depends on deployment credentials and partner configuration. In this demo, we will clearly label anything running in simulation mode and will not imply an unconfigured connector is live.”

### “How will you prove business value?”

“We will run a merchant pilot and compare a baseline with the pilot period: COD verification outcomes, delivery recovery, stockout frequency, and time spent on manual operations. We are not presenting unmeasured savings as proven results.”

### “Who is the first customer?”

“A small or growing D2C merchant with meaningful COD volume, a lean operations team, and recurring stock or delivery exceptions. The initial focus is on making the daily operating loop manageable without needing a large ops team.”

## 13. Closing line

> **CommercePilot AI turns scattered ecommerce signals into clear, explainable next steps—so merchants can spend less time chasing operations and more time growing their business.**
