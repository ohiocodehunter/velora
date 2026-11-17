import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '@/services/order.service';
import type { Order, OrderStatus } from '@/types';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import Pagination from '@/components/ui/Pagination';
import { formatCurrency, formatDate } from '@/utils/format';
import { ORDER_STATUS_LABEL, ORDER_STATUS_TONE } from '@/utils/constants';
import { useAppDispatch } from '@/hooks/store';
import { addToast } from '@/store/slices/uiSlice';
import { Package, Truck, XCircle, ArrowRight } from 'lucide-react';
import { getErrorMessage } from '@/services/api';

export const MyOrdersPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Cancel order modal
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    async function loadOrders() {
      try {
        setIsLoading(true);
        const res = await orderService.getMyOrders({
          page: currentPage,
          limit: 8,
          status: statusFilter === 'all' ? undefined : statusFilter,
        });
        setOrders(res.orders);
        setTotalPages(res.meta.pages);
      } catch {
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    }
    loadOrders();
  }, [currentPage, statusFilter]);

  const handleCancelOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderToCancel) return;
    try {
      setIsCancelling(true);
      await orderService.cancelOrder(orderToCancel._id, cancelReason.trim());
      dispatch(addToast({ type: 'success', message: 'Order has been cancelled successfully' }));
      setCancelModalOpen(false);
      setOrderToCancel(null);
      setCancelReason('');

      // Refresh list
      const res = await orderService.getMyOrders({ page: currentPage, limit: 8 });
      setOrders(res.orders);
    } catch (err) {
      dispatch(addToast({ type: 'error', message: getErrorMessage(err, 'Failed to cancel order') }));
    } finally {
      setIsCancelling(false);
    }
  };

  const tabs = [
    { id: 'all', label: 'All Orders' },
    { id: 'pending', label: 'Pending' },
    { id: 'processing', label: 'Processing' },
    { id: 'shipped', label: 'In Transit' },
    { id: 'delivered', label: 'Delivered' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line">
        <div>
          <h2 className="text-xl font-normal text-ink">My Order History</h2>
          <p className="text-xs text-muted mt-0.5">Track, review, or reorder previous purchases</p>
        </div>

        {/* Status filter tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setStatusFilter(tab.id);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-ink text-surface'
                  : 'bg-surface border border-line text-ink hover:bg-canvas'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-44 rounded-2xl" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={<Package className="h-8 w-8" />}
          title="No orders found"
          description="You haven't placed any orders in this category yet."
          actionLabel="Explore Catalog"
          onAction={() => (window.location.href = '/shop')}
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isEligibleForCancel =
              order.status === 'pending' || order.status === 'confirmed';

            return (
              <div key={order._id} className="card p-5 sm:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-line">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-semibold text-ink">
                      {order.orderNumber}
                    </span>
                    <span
                      className={`text-[11px] px-2.5 py-0.5 rounded-md border font-medium ${
                        ORDER_STATUS_TONE[order.status]
                      }`}
                    >
                      {ORDER_STATUS_LABEL[order.status]}
                    </span>
                  </div>
                  <div className="text-xs text-muted flex items-center gap-4">
                    <span>{formatDate(order.createdAt)}</span>
                    <span className="font-semibold text-ink text-sm">
                      {formatCurrency(order.summary.grandTotal)}
                    </span>
                  </div>
                </div>

                {/* Items preview */}
                <div className="divide-y divide-line/60">
                  {order.items.map((it, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between text-xs gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={it.image}
                          alt={it.name}
                          className="h-12 w-12 rounded-lg object-cover bg-canvas shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-medium text-ink truncate">{it.name}</p>
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

                {/* Action buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-line/60">
                  <div className="text-xs text-muted">
                    Ship to: <span className="text-ink">{order.shippingAddress.fullName}</span> (
                    {order.shippingAddress.city})
                  </div>

                  <div className="flex items-center gap-2">
                    {isEligibleForCancel && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setOrderToCancel(order);
                          setCancelModalOpen(true);
                        }}
                        className="text-danger hover:bg-danger/5 hover:border-danger text-xs h-8"
                      >
                        Cancel Order
                      </Button>
                    )}
                    <Link to={`/order/track/${order._id}`}>
                      <Button variant="outline" size="sm" className="text-xs h-8">
                        <Truck className="h-3.5 w-3.5 mr-1" /> Track Delivery
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      )}

      {/* Cancel Order Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Order"
        description={`Order #${orderToCancel?.orderNumber}`}
      >
        <form onSubmit={handleCancelOrder} className="space-y-4">
          <p className="text-xs text-muted">
            Are you sure you want to cancel this order? If already paid via Razorpay, a refund will be
            initiated back to the original payment source.
          </p>
          <div>
            <label className="block text-xs font-medium text-ink mb-1">
              Reason for cancellation (optional)
            </label>
            <textarea
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Changed mind, ordered by mistake, found another item..."
              className="w-full p-3 rounded-xl border border-line text-xs"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCancelModalOpen(false)}
            >
              Keep Order
            </Button>
            <Button type="submit" variant="danger" size="sm" isLoading={isCancelling}>
              Confirm Cancellation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MyOrdersPage;
