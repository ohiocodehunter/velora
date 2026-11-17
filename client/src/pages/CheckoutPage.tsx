import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/hooks/store';
import { addressService, type AddressPayload } from '@/services/address.service';
import { orderService, type PaymentOrderResult } from '@/services/order.service';
import { fetchCart } from '@/store/slices/cartSlice';
import { addToast } from '@/store/slices/uiSlice';
import type { Address, Order } from '@/types';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Skeleton from '@/components/ui/Skeleton';
import RazorpayModal from '@/components/common/RazorpayModal';
import { formatCurrency } from '@/utils/format';
import { getErrorMessage } from '@/services/api';
import { INDIAN_STATES } from '@/utils/constants';
import {
  MapPin,
  Plus,
  CreditCard,
  Banknote,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { cart } = useAppSelector((state) => state.cart);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');
  const [orderNotes, setOrderNotes] = useState('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);

  // New Address Modal
  const [isNewAddressModalOpen, setIsNewAddressModalOpen] = useState(false);
  const [newAddr, setNewAddr] = useState<AddressPayload>({
    label: 'Home',
    fullName: user?.name || '',
    phone: user?.phone || '',
    line1: '',
    line2: '',
    city: '',
    state: 'Maharashtra',
    pincode: '',
    country: 'India',
    isDefault: true,
  });
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  // Razorpay test payment modal
  const [isRazorpayOpen, setIsRazorpayOpen] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentOrderResult | null>(null);
  const [activeOrderId, setActiveOrderId] = useState<string>('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
      return;
    }

    async function loadAddresses() {
      try {
        setIsLoadingAddresses(true);
        const addrs = await addressService.getAddresses();
        setAddresses(addrs);
        const def = addrs.find((a) => a.isDefault) || addrs[0];
        if (def) setSelectedAddressId(def._id);
      } catch {
        setAddresses([]);
      } finally {
        setIsLoadingAddresses(false);
      }
    }
    loadAddresses();
  }, [isAuthenticated, navigate]);

  const items = cart?.items || [];
  const summary = cart?.summary;

  if (items.length === 0) {
    return (
      <div className="shell py-16 text-center">
        <h2 className="text-2xl font-normal text-ink">Your cart is empty</h2>
        <p className="text-xs text-muted mt-2">Add items to your cart before proceeding to checkout.</p>
        <Link to="/shop">
          <Button variant="primary" size="md" className="mt-6">
            Continue Shopping
          </Button>
        </Link>
      </div>
    );
  }

  const handleSaveNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddr.fullName || !newAddr.phone || !newAddr.line1 || !newAddr.city || !newAddr.pincode) {
      dispatch(addToast({ type: 'warning', message: 'Please fill in all required address fields' }));
      return;
    }
    try {
      setIsSavingAddress(true);
      const created = await addressService.createAddress(newAddr);
      setAddresses([...addresses, created]);
      setSelectedAddressId(created._id);
      setIsNewAddressModalOpen(false);
      dispatch(addToast({ type: 'success', message: 'Delivery address saved' }));
    } catch (err) {
      dispatch(addToast({ type: 'error', message: getErrorMessage(err, 'Failed to save address') }));
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      dispatch(addToast({ type: 'warning', message: 'Please select a delivery address' }));
      return;
    }

    try {
      setIsPlacingOrder(true);
      const res = await orderService.placeOrder({
        addressId: selectedAddressId,
        paymentMethod,
        notes: orderNotes.trim() || undefined,
      });

      const order = res.order;
      setActiveOrderId(order._id);

      if (paymentMethod === 'cod') {
        dispatch(fetchCart()); // refresh cart
        dispatch(addToast({ type: 'success', message: 'Order placed successfully!' }));
        navigate(`/order/success/${order._id}`);
      } else {
        // Razorpay payment flow
        const payRes = await orderService.createRazorpayOrder(order._id);
        setPaymentData(payRes);
        setIsRazorpayOpen(true);
      }
    } catch (err) {
      dispatch(addToast({ type: 'error', message: getErrorMessage(err, 'Failed to place order') }));
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handlePaymentSuccess = async (details: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) => {
    try {
      setIsRazorpayOpen(false);
      await orderService.verifyRazorpayPayment(details);
      dispatch(fetchCart());
      dispatch(addToast({ type: 'success', message: 'Payment confirmed! Your order is placed.' }));
      navigate(`/order/success/${activeOrderId}`);
    } catch (err) {
      dispatch(addToast({ type: 'error', message: getErrorMessage(err, 'Payment verification failed') }));
    }
  };

  return (
    <div className="shell py-8 sm:py-12 space-y-8">
      <Breadcrumbs items={[{ label: 'Cart', href: '/cart' }, { label: 'Secure Checkout' }]} />

      <div className="border-b border-line pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-normal text-ink">Checkout</h1>
          <p className="text-xs text-muted mt-1">Review your delivery address and payment choice</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-success font-medium bg-[#EEF3F0] px-3 py-1.5 rounded-full border border-[#D6E4DC]">
          <Lock className="h-3.5 w-3.5" />
          <span>256-Bit SSL Encrypted</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column: Addresses & Payment */}
        <div className="lg:col-span-8 space-y-8">
          {/* Section 1: Delivery Address */}
          <div className="card p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <div className="flex items-center gap-2">
                <span className="h-6 w-6 rounded-full bg-ink text-surface text-xs font-semibold flex items-center justify-center">
                  1
                </span>
                <h3 className="text-base font-medium text-ink">Select Delivery Address</h3>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsNewAddressModalOpen(true)}
                className="text-xs"
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Add New Address
              </Button>
            </div>

            {isLoadingAddresses ? (
              <div className="space-y-3">
                <Skeleton className="h-20 rounded-xl" />
                <Skeleton className="h-20 rounded-xl" />
              </div>
            ) : addresses.length === 0 ? (
              <div className="p-6 rounded-xl border border-dashed border-line text-center text-xs text-muted space-y-3">
                <p>No saved addresses found. Please add a shipping address to proceed.</p>
                <Button size="sm" variant="primary" onClick={() => setIsNewAddressModalOpen(true)}>
                  Add Shipping Address
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((addr) => {
                  const isSelected = selectedAddressId === addr._id;
                  return (
                    <div
                      key={addr._id}
                      onClick={() => setSelectedAddressId(addr._id)}
                      className={`p-4 rounded-xl border text-xs cursor-pointer transition-all space-y-2 ${
                        isSelected
                          ? 'border-ink bg-canvas shadow-xs ring-1 ring-ink'
                          : 'border-line bg-surface hover:border-line-strong'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-ink">{addr.fullName}</span>
                        <span className="px-2 py-0.5 rounded bg-line/60 text-[10px] uppercase font-medium">
                          {addr.label}
                        </span>
                      </div>
                      <p className="text-muted leading-relaxed">
                        {addr.line1}
                        {addr.line2 ? `, ${addr.line2}` : ''}
                        <br />
                        {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                      <p className="text-muted">Phone: {addr.phone}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 2: Payment Method */}
          <div className="card p-6 space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-line">
              <span className="h-6 w-6 rounded-full bg-ink text-surface text-xs font-semibold flex items-center justify-center">
                2
              </span>
              <h3 className="text-base font-medium text-ink">Payment Method</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Razorpay Option */}
              <label
                className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-4 ${
                  paymentMethod === 'razorpay'
                    ? 'border-ink bg-canvas shadow-xs ring-1 ring-ink'
                    : 'border-line bg-surface hover:border-line-strong'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'razorpay'}
                      onChange={() => setPaymentMethod('razorpay')}
                      className="accent-ink"
                    />
                    <div>
                      <p className="text-sm font-semibold text-ink">Online Payment (Razorpay)</p>
                      <p className="text-xs text-muted mt-0.5">UPI, Debit/Credit Cards, NetBanking</p>
                    </div>
                  </div>
                  <CreditCard className="h-5 w-5 text-accent" />
                </div>
                <div className="text-[11px] text-muted border-t border-line/60 pt-2 flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-success" />
                  <span>Instant verification & order priority</span>
                </div>
              </label>

              {/* Cash on Delivery Option */}
              <label
                className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-4 ${
                  paymentMethod === 'cod'
                    ? 'border-ink bg-canvas shadow-xs ring-1 ring-ink'
                    : 'border-line bg-surface hover:border-line-strong'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="accent-ink"
                    />
                    <div>
                      <p className="text-sm font-semibold text-ink">Cash on Delivery</p>
                      <p className="text-xs text-muted mt-0.5">Pay upon doorstep receipt</p>
                    </div>
                  </div>
                  <Banknote className="h-5 w-5 text-ink/70" />
                </div>
                <div className="text-[11px] text-muted border-t border-line/60 pt-2 flex items-center gap-1.5">
                  <Truck className="h-3.5 w-3.5 text-accent" />
                  <span>Available on all domestic PIN codes</span>
                </div>
              </label>
            </div>
          </div>

          {/* Section 3: Delivery Notes */}
          <div className="card p-6 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-ink">
              Delivery Notes (Optional)
            </h4>
            <textarea
              rows={2}
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              placeholder="e.g. Leave with building security if unavailable, landmark instructions..."
              className="w-full p-3 rounded-xl border border-line text-xs bg-canvas text-ink"
            />
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-4 space-y-6">
          <div className="card p-6 space-y-5 sticky top-28">
            <h3 className="text-base font-normal text-ink pb-3 border-b border-line">
              Items in Order ({items.length})
            </h3>

            {/* Compact items list */}
            <div className="divide-y divide-line/60 max-h-60 overflow-y-auto pr-1">
              {items.map((it) => (
                <div key={it.id} className="py-2.5 flex items-center justify-between text-xs gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={it.product.image}
                      alt={it.product.name}
                      className="h-10 w-10 rounded-lg object-cover bg-canvas shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-medium text-ink truncate">{it.product.name}</p>
                      <p className="text-[11px] text-muted">
                        Qty: {it.quantity} {it.variant ? `• ${it.variant}` : ''}
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold text-ink shrink-0">
                    {formatCurrency(it.lineTotal)}
                  </span>
                </div>
              ))}
            </div>

            {/* Price breakdown */}
            <div className="space-y-2.5 pt-3 border-t border-line text-xs">
              <div className="flex justify-between text-muted">
                <span>Items Subtotal</span>
                <span className="text-ink font-medium">{formatCurrency(summary?.itemsTotal)}</span>
              </div>
              {summary && summary.discount > 0 && (
                <div className="flex justify-between text-success font-medium">
                  <span>Coupon ({summary.couponCode})</span>
                  <span>-{formatCurrency(summary.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-muted">
                <span>Shipping</span>
                <span className="text-ink font-medium">
                  {summary?.shipping === 0 ? (
                    <span className="text-success font-semibold">FREE</span>
                  ) : (
                    formatCurrency(summary?.shipping)
                  )}
                </span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Taxes (GST 5%)</span>
                <span className="text-ink font-medium">{formatCurrency(summary?.tax)}</span>
              </div>
              <div className="flex justify-between text-base font-semibold text-ink pt-3 border-t border-line">
                <span>Total Amount</span>
                <span>{formatCurrency(summary?.grandTotal)}</span>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isPlacingOrder}
              disabled={!selectedAddressId}
              onClick={handlePlaceOrder}
            >
              {paymentMethod === 'cod' ? 'Confirm Order' : 'Proceed to Payment'}
            </Button>
          </div>
        </div>
      </div>

      {/* Add New Address Modal */}
      <Modal
        isOpen={isNewAddressModalOpen}
        onClose={() => setIsNewAddressModalOpen(false)}
        title="Add Delivery Address"
        description="Enter full street details for accurate delivery"
      >
        <form onSubmit={handleSaveNewAddress} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Recipient Name"
              required
              value={newAddr.fullName}
              onChange={(e) => setNewAddr({ ...newAddr, fullName: e.target.value })}
            />
            <Input
              label="Phone Number"
              required
              placeholder="10-digit mobile"
              value={newAddr.phone}
              onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
            />
          </div>
          <Input
            label="Street Address / Flat No."
            required
            value={newAddr.line1}
            onChange={(e) => setNewAddr({ ...newAddr, line1: e.target.value })}
          />
          <Input
            label="Apartment, Landmark (Optional)"
            value={newAddr.line2}
            onChange={(e) => setNewAddr({ ...newAddr, line2: e.target.value })}
          />
          <div className="grid grid-cols-3 gap-3">
            <Input
              label="City"
              required
              value={newAddr.city}
              onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
            />
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-ink/80">State *</label>
              <select
                value={newAddr.state}
                onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                className="w-full h-11 px-3 rounded-xl border border-line text-xs bg-surface"
              >
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Pincode"
              required
              maxLength={6}
              value={newAddr.pincode}
              onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-3 pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsNewAddressModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSavingAddress}>
              Save Address
            </Button>
          </div>
        </form>
      </Modal>

      {/* Razorpay Test Modal */}
      <RazorpayModal
        isOpen={isRazorpayOpen}
        onClose={() => setIsRazorpayOpen(false)}
        paymentData={paymentData}
        amount={summary?.grandTotal || 0}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default CheckoutPage;
