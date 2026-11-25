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

#### 1. Home — introduce the problem and promise

small ecommerce teams often manage order risk, inventory, and delivery issues across separate tools. CommercePilot AI brings those signals into one operations workspace.

**Say:** “CommercePilot AI helps online sellers catch operational problems earlier—before a risky order ships, stock runs out, or a delivery exception becomes a lost sale.”

#### 2. Product — show what the platform brings together

COD order review, inventory runway, delivery recovery, and the AI operations copilot. Emphasize that the product connects insights to follow-up actions rather than stopping at charts.

**Say:** “This is one place to understand what needs attention and move from an operational signal to a practical next step.”

#### 3. Features — explain the capabilities

- Explainable COD risk checks that can flag orders for confirmation.
- Demand and stock-runway calculations that help prioritize replenishment.
- Delivery exception workflows that support customer follow-up.
- Analytics and a data-grounded AI copilot for operational questions.

**Say:** “Each feature addresses a specific point where a growing store can lose time, inventory availability, or a successful delivery.”

#### 4. How It Works — connect the steps

this can store and order data enters the platform; rules and calculations identify risk or urgency; the merchant reviews a recommended action; and configured workflows can route the follow-up through email or n8n. 

**Say:** “CommercePilot turns store data into an explainable signal, then gives the team a clear action path—with automation available when the relevant integration is configured.”

#### 5. Pricing — close the public-site tour

Show the three displayed monthly tiers—Starter at ₹999, Growth at ₹2,499, and Professional at ₹5,999. Explain that the tiers are positioned for increasing store volume and operational needs. The current project displays these plans; do not imply that subscription billing is already integrated.

**Say:** “The plans are designed to grow with a merchant, from a smaller store beginning to automate operations to a higher-volume team needing more workflow capacity.”

**Transition to Screenshot 2:** “That is the public product story. Now I’ll sign in and show how the same capabilities are organized in the merchant workspace.”

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
| **0:00–0:25** | **Home:** open the landing page and introduce the merchant problem. | “Growing an ecommerce brand is not just about getting orders. Teams also need to catch risky COD orders, replenish stock in time, and respond when delivery fails. CommercePilot AI brings those operational decisions into one place.” |
| **0:25–0:45** | **Product:** move to the product walkthrough. | “The product brings order review, inventory planning, delivery recovery, and operational intelligence together. The goal is to move from seeing a problem to knowing what to do next.” |
| **0:45–1:05** | **Features:** highlight the main capability groups. | “The platform checks COD risk, estimates stock runway, supports delivery follow-up, and gives merchants analytics and a data-grounded copilot. Each feature focuses on a practical operational bottleneck.” |
| **1:05–1:25** | **How It Works:** summarize the data-to-action flow. | “Store data is evaluated with explainable rules and calculations. The merchant gets a clear signal and can review the next action; email or n8n automation can be used when configured.” |
| **1:25–1:40** | **Pricing:** show the proposed plans, then transition to the workspace. | “The public site presents Starter, Growth, and Professional plans for different operating needs. Now let’s move from the product story into the merchant workspace.” |
| **1:40–2:05** | Sign in and open **Overview**. | “The Overview gives the merchant a starting point: order and revenue indicators, verification needs, low-stock signals, delivery issues, recent orders, and inventory alerts. The team can start with the exceptions that need attention.” |
| **2:05–2:35** | Open **Orders** and select a representative COD order. | “For COD, CommercePilot applies explainable checks such as basket value, address completeness, phone format, and available customer history. It helps identify orders that may deserve confirmation before dispatch.” |
| **2:35–3:05** | Open **Inventory** and show stock or forecast details. | “Using recent sales and current stock, the system estimates daily demand, stock runway, and reorder points. The merchant can see which products need attention and review replenishment actions.” |
| **3:05–3:25** | Open **Deliveries** and show an exception or recovery view. | “When a delivery exception is recorded, the recovery workflow can prompt timely follow-up and a customer rescheduling action. It can run through configured webhooks or in simulation mode.” |
| **3:25–3:50** | Open **Analytics** and show the revenue, orders, payment, or delivery charts. | “Analytics connect daily operations to business performance: order trends, payment mix, delivery outcomes, and product economics. This helps the merchant see where attention is needed.” |
| **3:50–4:25** | Open **AI Assistant** and ask: “Which products should I reorder?” | “The copilot answers a natural-language question using the authenticated store’s data and platform calculations. It is designed to explain operational context—not fabricate numbers—and turn a question into a practical next step.” |
| **4:25–4:45** | Briefly open **Automations** and identify the remaining sidebar destinations in screenshot 2. | “Automations exposes workflow triggers and execution history. The sidebar keeps core operations—Overview, Orders, Inventory, Deliveries—separate from intelligence tools—Analytics, AI Assistant, Automations—and Store Settings.” |
| **4:45–5:00** | Return to Overview or the product Home page. | “CommercePilot AI helps a lean ecommerce team see risk earlier and act with more context. Our next step is to pilot with merchants and measure fewer preventable failures, faster recovery, and less manual operational work. Thank you.” |

**Total: 5:00.** To keep the requested public-site order and stay within time, give each of the five sections one concise explanation, then move directly into the workspace.

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
