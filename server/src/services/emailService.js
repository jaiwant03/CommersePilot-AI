const nodemailer = require('nodemailer');
const config = require('../config/env');

let transporter = null;

/**
 * Initialize or get reusable Nodemailer transporter
 */
const getTransporter = () => {
  if (transporter) return transporter;

  const { host, port, user, password } = config.smtp;

  if (host && user && password) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass: password },
      tls: { rejectUnauthorized: false }
    });
  } else {
    // Development fallback mock transporter (logs output safely)
    transporter = {
      sendMail: async (mailOptions) => {
        console.log(`\n[EMAIL ENGINE - SIMULATED DISPATCH]`);
        console.log(`To:      ${mailOptions.to}`);
        console.log(`From:    ${mailOptions.from || config.smtp.from}`);
        console.log(`Subject: ${mailOptions.subject}`);
        console.log(`MessageId: sim_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`);
        console.log(`[Preview Body Snippet]: ${(mailOptions.text || mailOptions.html || '').slice(0, 140)}...\n`);
        return {
          messageId: `sim_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
          response: '250 Simulated Message Queued (Demo Mode)',
          isDemoMode: true
        };
      }
    };
  }

  return transporter;
};

/**
 * Base email dispatcher with idempotency / deduplication tracking
 */
const dispatchEmail = async ({ to, subject, html, text, eventId, senderName = 'CommercePilot AI' }) => {
  if (!to || !String(to).trim() || !String(to).includes('@')) {
    return {
      success: false,
      reason: 'No valid recipient email address provided',
      isDemoMode: false
    };
  }

  const recipient = String(to).trim();

  try {
    const client = getTransporter();
    const smtpUser = config.smtp.user;
    const configuredFrom = config.smtp.from || 'no-reply@commercepilot.ai';

    // Use authenticated SMTP user address in From header for Gmail/SMTP compliance
    // (avoids SPF/DMARC drops when EMAIL_FROM uses an unverified domain)
    const smtpUserIsEmail = smtpUser && smtpUser.includes('@');
    const isGmail = (config.smtp.host || '').toLowerCase().includes('gmail');
    const fromEmail = (smtpUserIsEmail && (isGmail || configuredFrom.includes('commercepilot.ai')))
      ? smtpUser
      : configuredFrom;

    const mailOptions = {
      from: `"${senderName}" <${fromEmail}>`,
      replyTo: configuredFrom !== fromEmail ? configuredFrom : undefined,
      to: recipient,
      subject,
      html,
      text: text || html.replace(/<[^>]*>?/gm, ''),
      headers: eventId ? { 'X-CommercePilot-Event-Id': eventId } : {}
    };

    const result = await client.sendMail(mailOptions);
    console.log(`[Email Service] Dispatched "${subject}" -> ${recipient} (MessageId: ${result.messageId})`);
    return {
      success: true,
      messageId: result.messageId,
      recipient,
      isDemoMode: Boolean(result.isDemoMode)
    };
  } catch (error) {
    console.error(`[Email Service Error] Failed to send email to ${recipient}:`, error.message);
    return {
      success: false,
      recipient,
      error: error.message,
      isDemoMode: false
    };
  }
};

/**
 * Verify active SMTP connection health
 */
const verifySmtpConnection = async () => {
  const { host, user, password } = config.smtp;
  if (!host || !user || !password) {
    return { configured: false, verified: false, mode: 'DEMO_SIMULATION' };
  }
  try {
    const client = getTransporter();
    if (typeof client.verify === 'function') {
      await client.verify();
    }
    return { configured: true, verified: true, host, user, mode: 'LIVE_SMTP' };
  } catch (err) {
    return { configured: true, verified: false, host, user, error: err.message, mode: 'SMTP_ERROR' };
  }
};

/**
 * 1. Order Confirmation Email
 */
const sendOrderConfirmationEmail = async ({ order, customer, store }) => {
  const customerEmail = customer?.email || order.customer?.email;
  if (!customerEmail) return { success: false, reason: 'No customer email provided' };

  const storeName = store?.name || 'CommercePilot Store';
  const orderNumber = order.orderNumber;
  const total = (order.totalAmount || 0).toLocaleString('en-IN');

  const subject = `Order Confirmed: #${orderNumber} from ${storeName}`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #0F172A; color: #E2E8F0; border-radius: 12px; border: 1px solid #334155;">
      <h2 style="color: #6366F1; margin-top: 0;">Order Confirmed!</h2>
      <p style="font-size: 15px; color: #CBD5E1;">Hi ${customer.fullName || 'Customer'},</p>
      <p style="font-size: 14px; color: #94A3B8; line-height: 1.6;">
        Thank you for shopping with <strong>${storeName}</strong>. Your order <strong>#${orderNumber}</strong> has been received and confirmed.
      </p>
      <div style="background: #1E293B; padding: 16px; border-radius: 8px; margin: 20px 0; border: 1px solid #334155;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="color: #94A3B8;">Total Amount:</span>
          <strong style="color: #10B981;">₹${total} (${order.paymentMethod})</strong>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: #94A3B8;">Shipping To:</span>
          <span style="color: #E2E8F0;">${order.customer?.address?.city || 'India'}</span>
        </div>
      </div>
      <p style="font-size: 12px; color: #64748B;">This is an automated notification from CommercePilot AI.</p>
    </div>
  `;

  return dispatchEmail({
    to: customerEmail,
    subject,
    html,
    eventId: `order-conf-${order._id}`
  });
};

/**
 * 2. COD Verification Email (with secure, expiring confirmation link)
 */
const sendCodVerificationEmail = async ({ order, customer, store, verificationUrl, token }) => {
  const customerEmail = customer?.email || order.customer?.email;
  if (!customerEmail) return { success: false, reason: 'No customer email provided' };

  const storeName = store?.name || 'CommercePilot Store';
  const orderNumber = order.orderNumber;
  const total = (order.totalAmount || 0).toLocaleString('en-IN');

  const subject = `Action Required: Please Confirm Your Cash-on-Delivery Order #${orderNumber}`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #0F172A; color: #E2E8F0; border-radius: 12px; border: 1px solid #334155;">
      <div style="display: inline-block; padding: 4px 10px; background: rgba(99, 102, 241, 0.2); border-radius: 20px; color: #818CF8; font-size: 12px; font-weight: 600; margin-bottom: 12px;">
        1-Click Verification
      </div>
      <h2 style="color: #F8FAFC; margin-top: 0;">Please Confirm Your Order</h2>
      <p style="font-size: 14px; color: #CBD5E1; line-height: 1.6;">
        Hi ${customer.fullName || 'Customer'}, to ensure prompt fulfillment and protect against delivery issues, <strong>${storeName}</strong> requests your confirmation for Order <strong>#${orderNumber}</strong> (Amount: ₹${total} via COD).
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" style="background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); color: #FFFFFF; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px; display: inline-block; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.4);">
          Confirm My Order
        </a>
      </div>

      <div style="background: #1E293B; padding: 14px; border-radius: 8px; border: 1px solid #334155; font-size: 12px; color: #94A3B8;">
        <strong>Delivery Address:</strong><br />
        ${order.customer?.address?.street || ''}, ${order.customer?.address?.city || ''}, ${order.customer?.address?.state || ''} - ${order.customer?.address?.pincode || ''}
      </div>

      <p style="font-size: 11px; color: #64748B; margin-top: 24px;">
        This verification link will securely expire in 24 hours. If you did not place this order, you may safely ignore or cancel it.
      </p>
    </div>
  `;

  return dispatchEmail({
    to: customerEmail,
    subject,
    html,
    eventId: `cod-verify-${order._id}`
  });
};

/**
 * 3. Delivery Recovery Email (when NDR / Delivery Failure happens)
 */
const sendDeliveryRecoveryEmail = async ({ delivery, order, customer, store, rescheduleUrl }) => {
  const customerEmail = customer?.email || order?.customer?.email;
  if (!customerEmail) return { success: false, reason: 'No customer email provided' };

  const storeName = store?.name || 'CommercePilot Store';
  const awb = delivery.awb || 'Standard Parcel';
  const courier = delivery.courier || 'Our delivery partner';
  const reason = delivery.ndrReason || 'Customer unavailable or premises closed';

  const subject = `Delivery Update: Help Us Deliver Order #${order?.orderNumber || 'Your Order'}`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #0F172A; color: #E2E8F0; border-radius: 12px; border: 1px solid #334155;">
      <div style="display: inline-block; padding: 4px 10px; background: rgba(239, 68, 68, 0.2); border-radius: 20px; color: #F87171; font-size: 12px; font-weight: 600; margin-bottom: 12px;">
        Delivery Reschedule Needed
      </div>
      <h2 style="color: #F8FAFC; margin-top: 0;">We Missed You Today!</h2>
      <p style="font-size: 14px; color: #CBD5E1; line-height: 1.6;">
        Hi ${customer.fullName || 'Customer'}, ${courier} attempted delivery for your package (Tracking: <strong>${awb}</strong>), but reported: <em>"${reason}"</em>.
      </p>
      <p style="font-size: 14px; color: #94A3B8;">
        To prevent your parcel from being returned to the warehouse, please choose a convenient re-delivery date or update your landmark:
      </p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${rescheduleUrl}" style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: #FFFFFF; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px; display: inline-block;">
          Reschedule My Delivery
        </a>
      </div>

      <p style="font-size: 11px; color: #64748B;">
        Secure link provided on behalf of ${storeName}. No login required.
      </p>
    </div>
  `;

  return dispatchEmail({
    to: customerEmail,
    subject,
    html,
    eventId: `ndr-recovery-${delivery._id}-${delivery.attemptsCount || 1}`
  });
};

/**
 * 4. Supplier Purchase Order Approval Request (Emailed to Seller for Explicit Approval)
 */
const sendSupplierPurchaseOrderApprovalEmail = async ({ store, sellerEmail, poDraft, approvalUrl, rejectUrl }) => {
  if (!sellerEmail) return { success: false, reason: 'No seller email provided' };

  const storeName = store?.name || 'Your Store';
  const poNumber = poDraft.poNumber;
  const totalCost = (poDraft.totalEstimatedCost || 0).toLocaleString('en-IN');

  const subject = `Action Required: Approve Supplier Restock PO #${poNumber} for ${storeName}`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #0F172A; color: #E2E8F0; border-radius: 12px; border: 1px solid #334155;">
      <div style="display: inline-block; padding: 4px 10px; background: rgba(245, 158, 11, 0.2); border-radius: 20px; color: #FBBF24; font-size: 12px; font-weight: 600; margin-bottom: 12px;">
        Inventory Intelligence
      </div>
      <h2 style="color: #F8FAFC; margin-top: 0;">Supplier Purchase Order Draft Generated</h2>
      <p style="font-size: 14px; color: #CBD5E1; line-height: 1.6;">
        CommercePilot AI detected SKUs falling below your minimum safety runway for <strong>${storeName}</strong>. A draft Purchase Order has been prepared for manufacturer <strong>${poDraft.supplierName}</strong>.
      </p>

      <div style="background: #1E293B; padding: 16px; border-radius: 8px; margin: 20px 0; border: 1px solid #334155;">
        <div style="font-weight: 600; color: #818CF8; margin-bottom: 10px;">PO #${poNumber} Summary:</div>
        ${poDraft.items?.map(it => `
          <div style="display: flex; justify-content: space-between; font-size: 13px; padding: 6px 0; border-bottom: 1px solid #334155;">
            <span>${it.title} (${it.sku})</span>
            <span style="font-weight: 600;">+${it.reorderQuantity} units (₹${(it.estimatedCost).toLocaleString('en-IN')})</span>
          </div>
        `).join('')}
        <div style="display: flex; justify-content: space-between; font-size: 14px; font-weight: bold; margin-top: 12px; color: #10B981;">
          <span>Total Estimated COGS:</span>
          <span>₹${totalCost}</span>
        </div>
      </div>

      <div style="margin: 28px 0; display: flex; gap: 14px; justify-content: center;">
        <a href="${approvalUrl}" style="background: #10B981; color: #FFFFFF; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px;">
          ✓ Approve & Dispatch to Supplier
        </a>
        <a href="${rejectUrl}" style="background: #334155; color: #CBD5E1; padding: 12px 20px; text-decoration: none; border-radius: 6px; font-size: 14px;">
          Reject PO
        </a>
      </div>

      <p style="font-size: 11px; color: #64748B;">
        Strict Security Policy: Supplier emails are never dispatched automatically without explicit merchant approval.
      </p>
    </div>
  `;

  return dispatchEmail({
    to: sellerEmail,
    subject,
    html,
    eventId: `po-approval-${poDraft._id}`
  });
};

/**
 * 5. Supplier Purchase Order Email (Sent to Supplier ONLY after explicit approval)
 */
const sendSupplierPurchaseOrderEmail = async ({ store, supplierEmail, po }) => {
  if (!supplierEmail) return { success: false, reason: 'No supplier email provided' };

  const storeName = store?.name || 'Retail Merchant';
  const poNumber = po.poNumber;
  const totalCost = (po.totalEstimatedCost || 0).toLocaleString('en-IN');

  const subject = `Official Purchase Order #${poNumber} from ${storeName}`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #FFFFFF; color: #1E293B; border-radius: 8px; border: 1px solid #E2E8F0;">
      <h2 style="color: #4F46E5; margin-top: 0;">Purchase Order #${poNumber}</h2>
      <p style="font-size: 14px; color: #475569;">
        Dear <strong>${po.supplierName}</strong>,
      </p>
      <p style="font-size: 14px; color: #475569;">
        Please find approved replenishment purchase order from <strong>${storeName}</strong>:
      </p>

      <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px;">
        <thead>
          <tr style="background: #F1F5F9; text-align: left;">
            <th style="padding: 10px; border-bottom: 2px solid #CBD5E1;">Item / SKU</th>
            <th style="padding: 10px; border-bottom: 2px solid #CBD5E1; text-align: center;">Qty</th>
            <th style="padding: 10px; border-bottom: 2px solid #CBD5E1; text-align: right;">Unit Rate</th>
            <th style="padding: 10px; border-bottom: 2px solid #CBD5E1; text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${po.items?.map(it => `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #E2E8F0;">${it.title}<br/><small style="color:#64748B;">SKU: ${it.sku}</small></td>
              <td style="padding: 10px; border-bottom: 1px solid #E2E8F0; text-align: center;">${it.reorderQuantity}</td>
              <td style="padding: 10px; border-bottom: 1px solid #E2E8F0; text-align: right;">₹${it.unitCost}</td>
              <td style="padding: 10px; border-bottom: 1px solid #E2E8F0; text-align: right; font-weight: 600;">₹${it.estimatedCost.toLocaleString('en-IN')}</td>
            </tr>
          `).join('')}
          <tr style="font-weight: bold; background: #F8FAFC;">
            <td colspan="3" style="padding: 12px; text-align: right;">Total Order Value:</td>
            <td style="padding: 12px; text-align: right; color: #4F46E5;">₹${totalCost}</td>
          </tr>
        </tbody>
      </table>

      <p style="font-size: 13px; color: #475569;">
        Please reply confirming fulfillment timeline and dispatch schedule.
      </p>
      <hr style="border: 0; border-top: 1px solid #E2E8F0; margin: 20px 0;" />
      <p style="font-size: 11px; color: #94A3B8;">
        Dispatched via CommercePilot AI Automated Inventory Service on behalf of ${storeName}.
      </p>
    </div>
  `;

  return dispatchEmail({
    to: supplierEmail,
    subject,
    html,
    eventId: `po-supplier-dispatch-${po._id}`
  });
};

/**
 * 6. Daily AI Business Executive Report Email
 */
const sendDailyBusinessReportEmail = async ({ store, sellerEmail, reportData, aiSummary }) => {
  if (!sellerEmail) return { success: false, reason: 'No seller email provided' };

  const storeName = store?.name || 'Your Store';
  const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const totalRevenue = (reportData.totalRevenue || 0).toLocaleString('en-IN');

  const subject = `Daily Operations Report: ${storeName} (${today})`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #0F172A; color: #E2E8F0; border-radius: 12px; border: 1px solid #334155;">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #334155; padding-bottom: 12px; margin-bottom: 16px;">
        <span style="font-weight: bold; color: #818CF8; font-size: 14px;">CommercePilot AI Operations Briefing</span>
        <span style="font-size: 12px; color: #94A3B8;">${today}</span>
      </div>

      <h2 style="color: #F8FAFC; margin-top: 0;">Daily Business Health: ${storeName}</h2>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 20px 0;">
        <div style="background: #1E293B; padding: 14px; border-radius: 8px; border: 1px solid #334155;">
          <div style="font-size: 11px; color: #94A3B8; text-transform: uppercase;">Gross Revenue</div>
          <div style="font-size: 20px; font-weight: bold; color: #34D399; margin-top: 4px;">₹${totalRevenue}</div>
        </div>
        <div style="background: #1E293B; padding: 14px; border-radius: 8px; border: 1px solid #334155;">
          <div style="font-size: 11px; color: #94A3B8; text-transform: uppercase;">Orders Logged</div>
          <div style="font-size: 20px; font-weight: bold; color: #F8FAFC; margin-top: 4px;">${reportData.totalOrders || 0}</div>
        </div>
      </div>

      <div style="background: rgba(99, 102, 241, 0.08); border: 1px solid rgba(99, 102, 241, 0.25); border-radius: 8px; padding: 16px; margin: 20px 0;">
        <div style="font-weight: 600; color: #A5B4FC; font-size: 13px; margin-bottom: 8px;">🧠 Executive AI Operational Synthesis</div>
        <div style="font-size: 13px; line-height: 1.6; color: #CBD5E1; white-space: pre-wrap;">${aiSummary || 'Store operational parameters are within nominal thresholds.'}</div>
      </div>

      <div style="font-size: 12px; color: #94A3B8; margin-top: 16px;">
        • <strong>COD Orders:</strong> ${reportData.codOrders || 0} (${reportData.needsVerificationCount || 0} flagged for verification)<br />
        • <strong>Low-Stock Alerts:</strong> ${reportData.lowStockCount || 0} SKUs near threshold<br />
        • <strong>Delivery Recovery:</strong> ${reportData.failedDeliveriesCount || 0} parcels pending customer re-scheduling
      </div>

      <p style="font-size: 11px; color: #64748B; margin-top: 24px; border-top: 1px solid #334155; padding-top: 12px;">
        Generated automatically by CommercePilot AI n8n Daily Report Engine.
      </p>
    </div>
  `;

  return dispatchEmail({
    to: sellerEmail,
    subject,
    html,
    eventId: `daily-report-${store._id}-${new Date().toISOString().split('T')[0]}`
  });
};

module.exports = {
  dispatchEmail,
  sendOrderConfirmationEmail,
  sendCodVerificationEmail,
  sendDeliveryRecoveryEmail,
  sendSupplierPurchaseOrderApprovalEmail,
  sendSupplierPurchaseOrderEmail,
  sendDailyBusinessReportEmail
};
