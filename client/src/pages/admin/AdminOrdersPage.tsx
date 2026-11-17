import React, { useEffect, useState } from 'react';
import { adminService } from '@/services/admin.service';
import type { Order, OrderStatus, PaginationMeta } from '@/types';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import Pagination from '@/components/ui/Pagination';
import { formatCurrency, formatDateTime } from '@/utils/format';
import { ORDER_STATUS_LABEL, ORDER_STATUS_TONE } from '@/utils/constants';
import { useAppDispatch } from '@/hooks/store';
import { addToast } from '@/store/slices/uiSlice';
import { ShoppingBag, Search, Edit2, Truck, ExternalLink } from 'lucide-react';
import { getErrorMessage } from '@/services/api';

export const AdminOrdersPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [orders, setOrders] = useState<Order[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Status Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>('pending');
  const [statusNote, setStatusNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadOrders();
  }, [page, statusFilter, searchQuery]);

  async function loadOrders() {
    try {
      setIsLoading(true);
      const res = await adminService.getOrders({
        page,
        limit: 12,
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

  const openStatusModal = (ord: Order) => {
    setSelectedOrder(ord);
    setNewStatus(ord.status);
    setStatusNote('');
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    try {
      setIsUpdating(true);
      await adminService.updateOrderStatus(selectedOrder._id, {
        status: newStatus,
        note: statusNote.trim() || undefined,
      });
      dispatch(addToast({ type: 'success', message: 'Order status updated by admin' }));
      setSelectedOrder(null);
      loadOrders();
    } catch (err) {
      dispatch(addToast({ type: 'error', message: getErrorMessage(err, 'Failed to update order status') }));
    } finally {
      setIsUpdating(false);
    }
  };

  const statusList: OrderStatus[] = [
    'pending',
    'confirmed',
    'processing',
    'shipped',
    'out_for_delivery',
    'delivered',
    'cancelled',
    'refunded',
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line">
        <div>
          <h1 className="text-xl font-normal text-ink">Marketplace Orders</h1>
          <p className="text-xs text-muted mt-0.5">
            Cross-seller transaction logs and status overrides
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search by order number or customer name..."
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-line bg-surface text-xs text-ink placeholder:text-muted"
          />
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted pointer-events-none" />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="h-10 px-3 rounded-xl border border-line bg-surface text-xs text-ink"
        >
          <option value="all">All Statuses</option>
          {statusList.map((st) => (
            <option key={st} value={st}>
              {ORDER_STATUS_LABEL[st]}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 rounded-2xl" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="h-8 w-8" />}
          title="No orders found"
          description="Orders placed across the platform will display here."
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-canvas border-b border-line text-[11px] font-semibold text-muted uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Grand Total</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {orders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-canvas/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-ink">
                      {ord.orderNumber}
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-medium text-ink">{ord.shippingAddress?.fullName}</p>
                      <p className="text-[11px] text-muted">{ord.shippingAddress?.city}</p>
                    </td>

                    <td className="py-3 px-4 text-muted">{ord.items?.length || 0} line(s)</td>

                    <td className="py-3 px-4 font-semibold text-ink">
                      {formatCurrency(ord.summary?.grandTotal)}
                    </td>

                    <td className="py-3 px-4">
                      <span className="uppercase font-semibold text-[11px] text-ink">
                        {ord.payment?.method}
                      </span>
                      <p className="text-[10px] text-muted capitalize">({ord.payment?.status})</p>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded border font-medium ${
                          ORDER_STATUS_TONE[ord.status]
                        }`}
                      >
                        {ORDER_STATUS_LABEL[ord.status]}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openStatusModal(ord)}
                        className="h-7 text-xs"
                      >
                        Override Status
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {meta && meta.pages > 1 && (
            <div className="p-4 border-t border-line">
              <Pagination
                currentPage={meta.page}
                totalPages={meta.pages}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      )}

      {/* Admin Status Override Modal */}
      <Modal
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        title="Admin Status Override"
        description={`Order #${selectedOrder?.orderNumber}`}
      >
        <form onSubmit={handleUpdateStatus} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-ink">New Order Status *</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
              className="w-full h-11 px-3 rounded-xl border border-line text-xs bg-surface"
            >
              {statusList.map((st) => (
                <option key={st} value={st}>
                  {ORDER_STATUS_LABEL[st]}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-ink">Admin Action Log / Note</label>
            <input
              type="text"
              placeholder="e.g. Manually refunded after customer support resolution"
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
              onClick={() => setSelectedOrder(null)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isUpdating}>
              Save Override
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminOrdersPage;
