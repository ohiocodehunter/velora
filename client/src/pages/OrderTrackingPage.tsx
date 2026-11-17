import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderService } from '@/services/order.service';
import type { Order, OrderStatus } from '@/types';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import Badge from '@/components/ui/Badge';
import { formatCurrency, formatDateTime } from '@/utils/format';
import { ORDER_STATUS_LABEL, ORDER_STATUS_TONE, ORDER_FLOW } from '@/utils/constants';
import { Search, CheckCircle2, Circle, Clock, Truck, Package, ShieldCheck } from 'lucide-react';

export const OrderTrackingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [searchId, setSearchId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadTrack(id);
    }
  }, [id]);

  async function loadTrack(orderId: string) {
    try {
      setIsLoading(true);
      setError(null);
      const data = await orderService.trackOrder(orderId);
      setOrder(data);
    } catch {
      setError('Order not found or tracking is unavailable.');
      setOrder(null);
    } finally {
      setIsLoading(false);
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;
    navigate(`/order/track/${searchId.trim()}`);
  };

  const getStepStatus = (step: OrderStatus, current: OrderStatus) => {
    const currentIndex = ORDER_FLOW.indexOf(current);
    const stepIndex = ORDER_FLOW.indexOf(step);
    if (current === 'cancelled' || current === 'refunded') return 'cancelled';
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  return (
    <div className="shell py-8 sm:py-12 space-y-10">
      <Breadcrumbs items={[{ label: 'Orders', href: '/orders' }, { label: 'Track Delivery' }]} />

      <div className="max-w-2xl">
        <span className="eyebrow">Real-Time Logistics</span>
        <h1 className="text-2xl sm:text-3xl font-normal text-ink mt-1">Order Tracking</h1>
        <p className="text-xs text-muted mt-1">
          Monitor your parcel dispatch, milestones, and fulfillment progress.
        </p>

        {/* Lookup Bar */}
        <form onSubmit={handleSearch} className="flex gap-2 mt-5">
          <input
            type="text"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            placeholder="Enter Order ID to track"
            className="h-10 px-3.5 flex-1 rounded-xl border border-line bg-surface text-xs font-mono text-ink placeholder:font-sans"
          />
          <Button type="submit" variant="primary" size="sm">
            <Search className="h-3.5 w-3.5 mr-1" /> Track
          </Button>
        </form>
      </div>

      {isLoading && (
        <div className="card p-8 space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
      )}

      {error && (
        <div className="card p-8 text-center text-xs text-danger space-y-2">
          <p className="font-semibold">{error}</p>
          <p className="text-muted">Please double check the Order ID.</p>
        </div>
      )}

      {order && !isLoading && (
        <div className="space-y-8 animate-rise">
          {/* Order Header Summary */}
          <div className="card p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-base font-semibold font-mono text-ink">
                  {order.orderNumber}
                </span>
                <span
                  className={`text-xs px-2.5 py-1 rounded-md border font-medium ${
                    ORDER_STATUS_TONE[order.status]
                  }`}
                >
                  {ORDER_STATUS_LABEL[order.status]}
                </span>
              </div>
              <p className="text-xs text-muted mt-1">
                Placed on {formatDateTime(order.createdAt)} • Total: {formatCurrency(order.summary.grandTotal)}
              </p>
            </div>
            <div className="text-xs text-muted sm:text-right">
              <p>Destination: {order.shippingAddress.city}, {order.shippingAddress.state}</p>
              <p>Recipient: {order.shippingAddress.fullName}</p>
            </div>
          </div>

          {/* Visual Milestone Progress */}
          {order.status !== 'cancelled' && order.status !== 'refunded' ? (
            <div className="card p-6 sm:p-10 space-y-8">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-ink">
                Fulfillment Timeline
              </h3>

              <div className="relative">
                {/* Horizontal Progress bar on desktop */}
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-6 relative">
                  {ORDER_FLOW.map((step, idx) => {
                    const stepState = getStepStatus(step, order.status);
                    return (
                      <div key={step} className="flex flex-col items-center text-center relative z-10">
                        <div
                          className={`h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all ${
                            stepState === 'completed'
                              ? 'border-success bg-[#EEF3F0] text-success'
                              : stepState === 'current'
                              ? 'border-accent bg-accent text-surface shadow-xs'
                              : 'border-line bg-canvas text-muted/60'
                          }`}
                        >
                          {stepState === 'completed' ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : (
                            <span className="text-xs font-semibold">{idx + 1}</span>
                          )}
                        </div>
                        <span
                          className={`text-xs mt-3 capitalize font-medium ${
                            stepState === 'current'
                              ? 'text-ink font-semibold'
                              : stepState === 'completed'
                              ? 'text-ink'
                              : 'text-muted'
                          }`}
                        >
                          {ORDER_STATUS_LABEL[step]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="card p-6 border-danger/30 bg-danger/5 text-danger text-xs">
              This order has been {order.status}.
            </div>
          )}

          {/* Status History Logs */}
          <div className="card p-6 sm:p-8 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-ink">
              Activity History
            </h3>
            <div className="space-y-4">
              {order.statusHistory && order.statusHistory.length > 0 ? (
                order.statusHistory.map((entry, idx) => (
                  <div key={idx} className="flex items-start gap-3.5 pb-4 border-b border-line/60 last:border-0 last:pb-0">
                    <Clock className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-ink capitalize">
                          {ORDER_STATUS_LABEL[entry.status]}
                        </span>
                        <span className="text-[11px] text-muted">{formatDateTime(entry.at)}</span>
                      </div>
                      {entry.note && <p className="text-xs text-muted mt-0.5">{entry.note}</p>}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted">Order initiated.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTrackingPage;
