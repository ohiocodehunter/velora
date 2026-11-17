import React, { useEffect, useState } from 'react';
import { sellerService } from '@/services/seller.service';
import type { Order, OrderItem, OrderStatus, PaginationMeta } from '@/types';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import Pagination from '@/components/ui/Pagination';
import { formatCurrency, formatDateTime } from '@/utils/format';
import { ORDER_STATUS_LABEL, ORDER_STATUS_TONE, SELLER_STATUS_OPTIONS } from '@/utils/constants';
import { useAppDispatch } from '@/hooks/store';
import { addToast } from '@/store/slices/uiSlice';
import { ShoppingBag, Truck, CheckCircle2, Search, ArrowRight } from 'lucide-react';
import { getErrorMessage } from '@/services/api';

export const SellerOrdersPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [orders, setOrders] = useState<Order[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Status update modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedItem, setSelectedItem] = useState<OrderItem | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>('confirmed');
  const [statusNote, setStatusNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadOrders();
  }, [page, statusFilter, searchQuery]);

  async function loadOrders() {
    try {
      setIsLoading(true);
      const res = await sellerService.getOrders({
        page,
        limit: 10,
        status: statusFilter === 'all' ? undefined : statusFilter,
        q: searchQuery.trim() || undefined,
      });
      setOrders(res.orders);
      setMeta(res.meta);
    } catch {
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }

  const openStatusModal = (order: Order, item: OrderItem) => {
    setSelectedOrder(order);
    setSelectedItem(item);
    setNewStatus(item.status);
    setStatusNote('');
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !selectedItem) return;

    try {
      setIsUpdating(true);
      await sellerService.updateItemStatus(
        selectedOrder._id,
        selectedItem._id,
        newStatus,
        statusNote.trim() || undefined,
      );
      dispatch(addToast({ type: 'success', message: 'Item fulfillment status updated' }));
      setSelectedOrder(null);
      setSelectedItem(null);
      loadOrders();
    } catch (err) {
      dispatch(addToast({ type: 'error', message: getErrorMessage(err, 'Failed to update status') }));
    } finally {
      setIsUpdating(false);
    }
  };

  const tabs = [
    { id: 'all', label: 'All Orders' },
    { id: 'pending', label: 'Pending' },
    { id: 'confirmed', label: 'Confirmed' },
    { id: 'processing', label: 'Processing' },
    { id: 'shipped', label: 'Shipped' },
    { id: 'delivered', label: 'Delivered' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line">
        <div>
          <h1 className="text-xl font-normal text-ink">Store Orders & Fulfillment</h1>
          <p className="text-xs text-muted mt-0.5">Manage dispatch and update tracking progress</p>
        </div>
      </div>

      {/* Tabs and Search */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setStatusFilter(tab.id);
                setPage(1);
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

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search order # or recipient..."
            className="w-full h-9 pl-8 pr-3 rounded-xl border border-line bg-surface text-xs text-ink"
          />
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted pointer-events-none" />
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
          icon={<ShoppingBag className="h-8 w-8" />}
          title="No orders found"
          description="Orders containing your products will appear here as customers checkout."
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
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
                <div className="text-xs text-muted">
                  <span>{formatDateTime(order.createdAt)}</span>
                </div>
              </div>

              {/* Order Items belonging to seller */}
              <div className="divide-y divide-line/60">
                {order.items.map((it) => (
                  <div
                    key={it._id}
                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                  >
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
                        <p className="text-xs font-semibold text-ink mt-0.5">
                          {formatCurrency(it.lineTotal)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded border font-medium ${
                          ORDER_STATUS_TONE[it.status]
                        }`}
                      >
                        Item: {ORDER_STATUS_LABEL[it.status]}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openStatusModal(order, it)}
                        className="text-xs h-8"
                      >
                        Update Status
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Customer shipping info */}
              <div className="pt-3 border-t border-line/60 text-xs text-muted flex flex-col sm:flex-row justify-between gap-2">
                <div>
                  <span className="font-medium text-ink">Ship to: </span>
                  {order.shippingAddress.fullName}, {order.shippingAddress.line1},{' '}
                  {order.shippingAddress.city}, {order.shippingAddress.state} -{' '}
                  {order.shippingAddress.pincode} (Tel: {order.shippingAddress.phone})
                </div>
                <div>
                  Payment Mode: <strong className="uppercase text-ink">{order.payment.method}</strong>{' '}
                  ({order.payment.status})
                </div>
              </div>
            </div>
          ))}

          {meta && meta.pages > 1 && (
            <Pagination
              currentPage={meta.page}
              totalPages={meta.pages}
              onPageChange={setPage}
            />
          )}
        </div>
      )}

      {/* Fulfillment Status Modal */}
      <Modal
        isOpen={Boolean(selectedOrder && selectedItem)}
        onClose={() => {
          setSelectedOrder(null);
          setSelectedItem(null);
        }}
        title="Update Item Fulfillment Status"
        description={`Order #${selectedOrder?.orderNumber} • ${selectedItem?.name}`}
      >
        <form onSubmit={handleUpdateStatus} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-ink">New Status *</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
              className="w-full h-11 px-3 rounded-xl border border-line text-xs bg-surface"
            >
              {SELLER_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-ink">
              Tracking Note / Courier Airway Bill (AWB)
            </label>
            <input
              type="text"
              placeholder="e.g. Dispatched via Bluedart AWB #98127391"
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-line text-xs"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedOrder(null);
                setSelectedItem(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isUpdating}>
              Save Status
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SellerOrdersPage;
