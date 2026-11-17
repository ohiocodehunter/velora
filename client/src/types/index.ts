export type Role = 'customer' | 'seller' | 'admin';
export type SellerStatus = 'none' | 'pending' | 'approved' | 'rejected';
export type ProductStatus = 'draft' | 'active' | 'archived';
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: PaginationMeta;
  message?: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface Image {
  url: string;
  publicId?: string;
  alt?: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: Image;
  role: Role;
  sellerStatus: SellerStatus;
  store?: Store | string | null;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface Store {
  _id: string;
  owner: User | string;
  name: string;
  slug: string;
  tagline?: string;
  description?: string;
  logo?: Image;
  banner?: Image;
  email?: string;
  phone?: string;
  address?: { line1?: string; city?: string; state?: string; pincode?: string; country?: string };
  policies?: { shipping?: string; returns?: string };
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  rejectionReason?: string;
  ratingAverage: number;
  ratingCount: number;
  productCount: number;
  totalSales: number;
  createdAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: Image;
  parent?: string | null;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  productCount?: number;
}

export interface VariantOption {
  label: string;
  priceDelta: number;
  stock: number;
}

export interface Variant {
  name: string;
  options: VariantOption[];
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  images: Image[];
  price: number;
  discountPrice: number;
  finalPrice: number;
  discountPercent?: number;
  category: Category | string;
  brand: string;
  seller: User | string;
  store: Store | string;
  stock: number;
  lowStockThreshold?: number;
  sku: string;
  variants: Variant[];
  specifications: Record<string, string>;
  tags: string[];
  ratingAverage: number;
  ratingCount: number;
  isFeatured: boolean;
  status: ProductStatus;
  soldCount: number;
  isReported?: boolean;
  createdAt: string;
}

export interface CartLine {
  id: string;
  product: {
    id: string;
    name: string;
    slug: string;
    image: string;
    price: number;
    discountPrice: number;
  };
  store: { id: string; name: string; slug: string } | null;
  seller: { id: string; name: string } | null;
  quantity: number;
  variant: string;
  unitPrice: number;
  lineTotal: number;
  stock: number;
  available: boolean;
  stockMessage: string;
}

export interface CartSummary {
  itemsTotal: number;
  discount: number;
  shipping: number;
  tax: number;
  grandTotal: number;
  couponCode: string;
  eligibleSubtotal: number;
  freeShippingAbove: number;
  taxRate: number;
}

export interface Cart {
  id: string;
  items: CartLine[];
  coupon: { code: string; type: 'percent' | 'fixed'; value: number; description?: string } | null;
  summary: CartSummary;
  itemCount: number;
  totalQuantity: number;
  hasUnavailable: boolean;
}

export interface Address {
  _id: string;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
}

export interface OrderItem {
  _id: string;
  product: string;
  seller: User | string;
  store: Store | string;
  name: string;
  image: string;
  slug?: string;
  sku?: string;
  variant?: string;
  price: number;
  quantity: number;
  lineTotal: number;
  status: OrderStatus;
  statusHistory: StatusEntry[];
}

export interface StatusEntry {
  status: OrderStatus;
  note: string;
  at: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  user: User | string;
  items: OrderItem[];
  shippingAddress: {
    fullName: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  summary: {
    itemsTotal: number;
    discount: number;
    shipping: number;
    tax: number;
    grandTotal: number;
    couponCode?: string;
    currency: string;
  };
  payment: {
    method: 'razorpay' | 'cod';
    status: 'pending' | 'paid' | 'failed' | 'refunded';
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    paidAt?: string;
    isMock?: boolean;
  };
  status: OrderStatus;
  statusHistory: StatusEntry[];
  cancelReason?: string;
  cancelledBy?: string;
  deliveredAt?: string;
  createdAt: string;
  sellerTotal?: number;
  sellerItemCount?: number;
}

export interface Review {
  _id: string;
  product: Product | string;
  seller?: string;
  user: { _id: string; name: string; avatar?: Image } | string;
  rating: number;
  title?: string;
  body: string;
  isVerifiedPurchase: boolean;
  status: 'visible' | 'hidden' | 'reported';
  reportCount?: number;
  createdAt: string;
}

export interface Coupon {
  _id: string;
  code: string;
  description: string;
  type: 'percent' | 'fixed';
  value: number;
  minOrder: number;
  maxDiscount: number;
  usageLimit: number;
  perUserLimit: number;
  usedCount: number;
  startsAt: string;
  expiresAt: string;
  isActive: boolean;
  appliesTo?: { categories?: Category[] | string[]; products?: string[]; sellers?: string[] };
}

export interface Banner {
  _id: string;
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  link: string;
  image?: Image;
  theme: 'light' | 'dark' | 'accent';
  position: 'home_hero' | 'home_strip' | 'category_top';
  sortOrder: number;
  isActive: boolean;
}

export interface NotificationItem {
  _id: string;
  type: string;
  title: string;
  message: string;
  link: string;
  isRead: boolean;
  createdAt: string;
}

export interface SellerDashboard {
  revenue: number;
  deliveredRevenue: number;
  unitsSold: number;
  orderCount: number;
  productCount: number;
  lowStock: number;
  pendingCount: number;
  averageOrderValue: number;
  series: { month: string; key: string; revenue: number; units: number }[];
  topProducts: { id: string; name: string; image: string; revenue: number; units: number }[];
  recentOrders: Order[];
  store: Store | null;
}

export interface AdminDashboard {
  counts: {
    customers: number;
    sellers: number;
    pendingSellers: number;
    products: number;
    orders: number;
    lowStock: number;
    reportedReviews: number;
  };
  revenue: number;
  averageOrderValue: number;
  today: { customers: number; orders: number; revenue: number };
  series: { month: string; key: string; revenue: number; orders: number }[];
  signups: { month: string; key: string; customers: number; sellers: number }[];
  byStatus: { status: OrderStatus; count: number }[];
  recentOrders: Order[];
  topProducts: Product[];
  topStores: Store[];
  pendingApplications: Store[];
}

export interface UploadResult {
  images: { url: string; publicId: string }[];
}
