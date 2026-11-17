import { sendMail } from '../config/mailer.js';
import config from '../config/env.js';
import { formatINR } from '../utils/money.js';
import logger from '../utils/logger.js';

const layout = (title, body) => `
  <div style="font-family:Inter,Arial,sans-serif;background:#FAF9F6;padding:32px;color:#171717">
    <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #EAE7E1;border-radius:16px;padding:32px">
      <p style="letter-spacing:.32em;font-size:11px;color:#B89B72;margin:0 0 8px">VELORA</p>
      <h1 style="font-size:22px;margin:0 0 16px;font-weight:600">${title}</h1>
      <div style="font-size:14px;line-height:1.7;color:#3f3f3f">${body}</div>
      <hr style="border:none;border-top:1px solid #EAE7E1;margin:24px 0" />
      <p style="font-size:11px;color:#777">Discover More. Shop Smarter.<br/>This is an automated message from VELORA.</p>
    </div>
  </div>`;

async function safeSend(payload) {
  try {
    return await sendMail(payload);
  } catch (error) {
    logger.warn('Email delivery failed:', error.message);
    return { delivered: false, error: error.message };
  }
}

export function sendWelcomeEmail(user) {
  return safeSend({
    to: user.email,
    subject: 'Welcome to VELORA',
    text: `Hi ${user.name}, your VELORA account is ready.`,
    html: layout(
      `Welcome, ${user.name}`,
      `<p>Your account is ready. Explore curated stores, trending products and member-only offers.</p>
       <p><a href="${config.clientUrl}/shop" style="color:#B89B72">Start shopping →</a></p>`,
    ),
  });
}

export function sendOrderConfirmation(order, user) {
  const rows = order.items
    .map(
      (item) =>
        `<tr><td style="padding:6px 0">${item.name}${item.variant ? ` <span style="color:#777">(${item.variant})</span>` : ''} × ${item.quantity}</td>
         <td style="text-align:right">${formatINR(item.lineTotal)}</td></tr>`,
    )
    .join('');

  return safeSend({
    to: user.email,
    subject: `Order ${order.orderNumber} confirmed`,
    text: `Thanks ${user.name}! Your order ${order.orderNumber} total is ${formatINR(order.summary.grandTotal)}.`,
    html: layout(
      `Order ${order.orderNumber} confirmed`,
      `<p>Thanks ${user.name}, we have received your order.</p>
       <table style="width:100%;font-size:13px">${rows}</table>
       <p style="margin-top:12px"><strong>Total: ${formatINR(order.summary.grandTotal)}</strong><br/>
       Payment: ${order.payment.method === 'cod' ? 'Cash on Delivery' : 'Paid online'}</p>
       <p><a href="${config.clientUrl}/orders/${order._id}" style="color:#B89B72">Track your order →</a></p>`,
    ),
  });
}

export function sendOrderStatusEmail(order, user, statusLabel) {
  return safeSend({
    to: user.email,
    subject: `Order ${order.orderNumber} is now ${statusLabel}`,
    text: `Your VELORA order ${order.orderNumber} is now ${statusLabel}.`,
    html: layout(
      `Order ${order.orderNumber}: ${statusLabel}`,
      `<p>Your order status has been updated to <strong>${statusLabel}</strong>.</p>
       <p><a href="${config.clientUrl}/orders/${order._id}" style="color:#B89B72">View order →</a></p>`,
    ),
  });
}

export function sendSellerDecisionEmail(user, store, approved, reason = '') {
  return safeSend({
    to: user.email,
    subject: approved ? 'Your VELORA store is live' : 'Update on your VELORA seller application',
    text: approved
      ? `Congratulations ${user.name}, ${store.name} has been approved.`
      : `Your application for ${store.name} was not approved. ${reason}`,
    html: layout(
      approved ? `${store.name} is approved` : 'Seller application update',
      approved
        ? `<p>Congratulations ${user.name}! Your store <strong>${store.name}</strong> is now live on VELORA.</p>
           <p><a href="${config.clientUrl}/seller" style="color:#B89B72">Open your dashboard →</a></p>`
        : `<p>Hi ${user.name}, we could not approve <strong>${store.name}</strong> at this time.</p>
           <p>Reason: ${reason || 'Application did not meet our seller guidelines.'}</p>`,
    ),
  });
}

export function sendPasswordResetEmail(user, token) {
  const link = `${config.clientUrl}/reset-password/${token}`;
  return safeSend({
    to: user.email,
    subject: 'Reset your VELORA password',
    text: `Reset your password using this link: ${link} (valid for 30 minutes)`,
    html: layout(
      'Reset your password',
      `<p>We received a request to reset your password. This link is valid for 30 minutes.</p>
       <p><a href="${link}" style="color:#B89B72">Choose a new password →</a></p>
       <p style="font-size:12px;color:#777">If you did not request this, you can ignore this email.</p>`,
    ),
  });
}

export default {
  sendWelcomeEmail,
  sendOrderConfirmation,
  sendOrderStatusEmail,
  sendSellerDecisionEmail,
  sendPasswordResetEmail,
};
