import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/hooks/store';
import {
  updateCartItem,
  removeCartItem,
  applyCartCoupon,
  removeCartCoupon,
  clearEntireCart,
} from '@/store/slices/cartSlice';
import { addToast } from '@/store/slices/uiSlice';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import QuantityStepper from '@/components/common/QuantityStepper';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import { formatCurrency } from '@/utils/format';
import {
  ShoppingBag,
  Trash2,
  Tag,
  ArrowRight,
  ShieldCheck,
  Truck,
  CheckCircle2,
  X,
  AlertTriangle,
} from 'lucide-react';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { cart, isLoading } = useAppSelector((state) => state.cart);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const [couponCode, setCouponCode] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const items = cart?.items || [];
  const summary = cart?.summary;

  const handleUpdateQuantity = async (itemId: string, newQty: number) => {
    try {
      await dispatch(updateCartItem({ itemId, quantity: newQty })).unwrap();
    } catch (err: any) {
      dispatch(addToast({ type: 'error', message: err || 'Could not update quantity' }));
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await dispatch(removeCartItem(itemId)).unwrap();
      dispatch(addToast({ type: 'success', message: 'Item removed from your cart' }));
    } catch (err: any) {
      dispatch(addToast({ type: 'error', message: err || 'Could not remove item' }));
    }
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    try {
      setIsApplyingCoupon(true);
      await dispatch(applyCartCoupon(couponCode.trim().toUpperCase())).unwrap();
      dispatch(addToast({ type: 'success', message: `Coupon "${couponCode.trim()}" applied!` }));
      setCouponCode('');
    } catch (err: any) {
      dispatch(addToast({ type: 'error', message: err || 'Invalid coupon code' }));
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = async () => {
    try {
      await dispatch(removeCartCoupon()).unwrap();
      dispatch(addToast({ type: 'info', message: 'Coupon removed' }));
    } catch (err: any) {
      dispatch(addToast({ type: 'error', message: err || 'Could not remove coupon' }));
    }
  };

  const handleClearCart = async () => {
    try {
      await dispatch(clearEntireCart()).unwrap();
      dispatch(addToast({ type: 'info', message: 'Cart cleared' }));
    } catch (err: any) {
      dispatch(addToast({ type: 'error', message: err || 'Could not clear cart' }));
    }
  };

  if (!cart || items.length === 0) {
    return (
      <div className="shell py-16">
        <Breadcrumbs items={[{ label: 'Shopping Cart' }]} />
        <EmptyState
          icon={<ShoppingBag className="h-8 w-8" />}
          title="Your Shopping Cart is Empty"
          description="Explore our curated collection of verified timepieces, audio essentials, and luxury artisanal goods."
          actionLabel="Start Exploring"
          onAction={() => navigate('/shop')}
          className="mt-6"
        />
      </div>
    );
  }

  // Calculate free shipping progress
  const freeThreshold = summary?.freeShippingAbove || 999;
  const eligibleAmount = summary?.itemsTotal || 0;
  const progressPercent = Math.min(100, Math.round((eligibleAmount / freeThreshold) * 100));
  const amountToFree = Math.max(0, freeThreshold - eligibleAmount);

  return (
    <div className="shell py-8 sm:py-12 space-y-8">
      <Breadcrumbs items={[{ label: 'Shopping Cart' }]} />

      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-line pb-4">
        <h1 className="text-2xl sm:text-3xl font-normal text-ink">
          Shopping Cart <span className="text-sm text-muted">({cart.itemCount} items)</span>
        </h1>
        <button
          onClick={handleClearCart}
          className="text-xs text-muted hover:text-danger transition-colors cursor-pointer self-start sm:self-auto"
        >
          Clear all items
        </button>
      </div>

      {/* Free Shipping Progress Indicator */}
      <div className="p-4 rounded-2xl bg-surface border border-line space-y-2">
        <div className="flex items-center justify-between text-xs font-medium">
          <div className="flex items-center gap-1.5 text-ink">
            <Truck className="h-4 w-4 text-accent" />
            {amountToFree === 0 ? (
              <span className="text-success font-semibold">You have unlocked Free Express Delivery!</span>
            ) : (
              <span>
                Add <strong className="text-ink">{formatCurrency(amountToFree)}</strong> more to unlock{' '}
                <strong className="text-accent">Free Delivery</strong>
              </span>
            )}
          </div>
          <span className="text-muted">{progressPercent}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-canvas overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Cart Line Items */}
        <div className="lg:col-span-8 space-y-4">
          <div className="card divide-y divide-line overflow-hidden">
            {items.map((item) => (
              <div key={item.id} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6">
                <Link
                  to={`/product/${item.product.slug}`}
                  className="h-24 w-24 rounded-xl overflow-hidden bg-canvas border border-line shrink-0"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="h-full w-full object-cover"
                  />
                </Link>

                <div className="flex-1 flex flex-col justify-between space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      {item.store && (
                        <p className="text-[11px] font-medium uppercase tracking-wider text-muted">
                          Sold by {item.store.name}
                        </p>
                      )}
                      <Link
                        to={`/product/${item.product.slug}`}
                        className="text-sm font-medium text-ink hover:text-accent transition-colors line-clamp-1 mt-0.5"
                      >
                        {item.product.name}
                      </Link>
                      {item.variant && (
                        <p className="text-xs text-muted mt-0.5">Variant: {item.variant}</p>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-ink sm:text-right">
                      {formatCurrency(item.lineTotal)}
                    </span>
                  </div>

                  {!item.available && (
                    <div className="flex items-center gap-1.5 text-xs text-danger font-medium">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      <span>{item.stockMessage || 'Unavailable in requested quantity'}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-line/60">
                    <div className="flex items-center gap-3">
                      <QuantityStepper
                        size="sm"
                        value={item.quantity}
                        min={1}
                        max={Math.min(item.stock, 10)}
                        onChange={(q) => handleUpdateQuantity(item.id, q)}
                      />
                      <span className="text-xs text-muted hidden sm:inline">
                        @ {formatCurrency(item.unitPrice)} each
                      </span>
                    </div>

                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-1 text-muted hover:text-danger transition-colors cursor-pointer"
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-2">
            <Link
              to="/shop"
              className="text-xs font-semibold text-accent hover:text-accent-strong flex items-center gap-1"
            >
              ← Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order Summary & Coupon Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="card p-6 space-y-5">
            <h3 className="text-base font-normal text-ink pb-3 border-b border-line">
              Order Summary
            </h3>

            {/* Subtotal lines */}
            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-muted">
                <span>Subtotal ({cart.totalQuantity} items)</span>
                <span className="text-ink font-medium">{formatCurrency(summary?.itemsTotal)}</span>
              </div>

              {summary && summary.discount > 0 && (
                <div className="flex justify-between text-success font-medium">
                  <span>Coupon Discount</span>
                  <span>-{formatCurrency(summary.discount)}</span>
                </div>
              )}

              <div className="flex justify-between text-muted">
                <span>Estimated Shipping</span>
                <span className="text-ink font-medium">
                  {summary?.shipping === 0 ? (
                    <span className="text-success font-semibold">FREE</span>
                  ) : (
                    formatCurrency(summary?.shipping)
                  )}
                </span>
              </div>

              <div className="flex justify-between text-muted">
                <span>Estimated GST (5%)</span>
                <span className="text-ink font-medium">{formatCurrency(summary?.tax)}</span>
              </div>

              <div className="flex justify-between text-sm font-semibold text-ink pt-3 border-t border-line">
                <span>Payable Amount</span>
                <span>{formatCurrency(summary?.grandTotal)}</span>
              </div>
            </div>

            {/* Coupon Code Input */}
            <div className="pt-2">
              {cart.coupon ? (
                <div className="p-3 rounded-xl bg-accent-soft/50 border border-accent/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-accent" />
                    <div>
                      <p className="text-xs font-semibold text-ink">{cart.coupon.code}</p>
                      <p className="text-[10px] text-muted">
                        Saved {formatCurrency(summary?.discount)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="p-1 text-muted hover:text-ink cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter Coupon (e.g. VELORA10)"
                    className="h-10 px-3 flex-1 rounded-xl border border-line bg-canvas text-xs uppercase font-mono tracking-wider text-ink"
                  />
                  <Button
                    type="submit"
                    variant="outline"
                    size="sm"
                    isLoading={isApplyingCoupon}
                    className="h-10 px-4"
                  >
                    Apply
                  </Button>
                </form>
              )}
            </div>

            {/* Checkout Button */}
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              disabled={cart.hasUnavailable}
              onClick={() => {
                if (!isAuthenticated) {
                  navigate('/login?redirect=/checkout');
                } else {
                  navigate('/checkout');
                }
              }}
            >
              Proceed to Checkout <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-muted pt-2">
              <ShieldCheck className="h-4 w-4 text-success" />
              <span>Safe & Encrypted 256-Bit SSL Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
