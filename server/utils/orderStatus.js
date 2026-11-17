import { ORDER_STATUS_FLOW } from './constants.js';

const progress = (status) => ORDER_STATUS_FLOW.indexOf(status);

/**
 * A single customer order can contain items from several sellers. The order's
 * headline status is the least advanced active line item, so the customer never
 * sees "delivered" while part of the parcel is still in transit.
 */
export function computeOrderStatus(items = []) {
  const active = items.filter((item) => item.status !== 'cancelled');
  if (active.length === 0) return 'cancelled';
  const indexes = active.map((item) => Math.max(0, progress(item.status)));
  return ORDER_STATUS_FLOW[Math.min(...indexes)] || 'pending';
}

export function nextStatuses(status) {
  const index = ORDER_STATUS_FLOW.indexOf(status);
  if (index < 0 || index === ORDER_STATUS_FLOW.length - 1) return [];
  return [ORDER_STATUS_FLOW[index + 1]];
}

export function buildOrderNumber(sequence = 0) {
  const now = new Date();
  const y = String(now.getFullYear()).slice(2);
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const rand = String(Math.floor(1000 + Math.random() * 9000));
  const seq = sequence ? String(sequence).padStart(3, '0') : '';
  return `VLR-${y}${m}${d}-${rand}${seq}`;
}

export default { computeOrderStatus, nextStatuses, buildOrderNumber };
