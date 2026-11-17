import type { OrderStatus } from '@/types';

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};

export const ORDER_STATUS_TONE: Record<OrderStatus, string> = {
  pending: 'bg-[#FAF3E6] text-[#8a6d3b] border-[#EBDCC0]',
  confirmed: 'bg-[#EEF3F0] text-[#2f6b4f] border-[#D6E4DC]',
  processing: 'bg-[#F2EEE6] text-[#7a6a4f] border-[#E6DDCB]',
  shipped: 'bg-[#EDF1F6] text-[#41587a] border-[#D8E2EE]',
  out_for_delivery: 'bg-[#EDF1F6] text-[#41587a] border-[#D8E2EE]',
  delivered: 'bg-[#EAF2EC] text-[#2f6b4f] border-[#CFE2D6]',
  cancelled: 'bg-[#F8ECEC] text-[#A33D3D] border-[#EFD5D5]',
  refunded: 'bg-[#F4F0F8] text-[#6b4b83] border-[#E3D9EC]',
};

export const ORDER_FLOW: OrderStatus[] = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'out_for_delivery',
  'delivered',
];

export const SELLER_STATUS_OPTIONS = [
  { value: 'confirmed', label: 'Mark confirmed' },
  { value: 'processing', label: 'Start processing' },
  { value: 'shipped', label: 'Mark shipped' },
  { value: 'out_for_delivery', label: 'Out for delivery' },
  { value: 'delivered', label: 'Mark delivered' },
];

export const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest first' },
  { value: 'finalPrice', label: 'Price: low to high' },
  { value: '-finalPrice', label: 'Price: high to low' },
  { value: '-ratingAverage', label: 'Top rated' },
  { value: '-soldCount', label: 'Best selling' },
];

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chandigarh', 'Chhattisgarh',
  'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu & Kashmir', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
];

export const SHIPPING_NOTE = 'Free delivery above ₹999 · 7-day returns';
