import React, { useEffect, useState } from 'react';
import { adminService } from '@/services/admin.service';
import type { Store, PaginationMeta } from '@/types';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import Pagination from '@/components/ui/Pagination';
import { formatDate } from '@/utils/format';
import { useAppDispatch } from '@/hooks/store';
import { addToast } from '@/store/slices/uiSlice';
import { Store as StoreIcon, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { getErrorMessage } from '@/services/api';

export const AdminSellersPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [sellers, setSellers] = useState<Store[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // Reject / Reason Modal
  const [rejectingStore, setRejectingStore] = useState<Store | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadSellers();
  }, [page, statusFilter]);

  async function loadSellers() {
    try {
      setIsLoading(true);
      const res = await adminService.getSellers({
        page,
        limit: 10,
        status: statusFilter === 'all' ? undefined : statusFilter,
      });
      setSellers(res.sellers);
      setMeta(res.meta);
    } catch {
      setSellers([]);
    } finally {
      setIsLoading(false);
    }
  }

  const handleUpdateStatus = async (
    id: string,
    status: 'approved' | 'rejected' | 'suspended' | 'pending',
    reason?: string,
  ) => {
    try {
      setIsSubmitting(true);
      const updated = await adminService.updateSellerStatus(id, { status, reason });
      setSellers(sellers.map((s) => (s._id === updated._id ? updated : s)));
      dispatch(addToast({ type: 'success', message: `Seller store status marked as ${status}` }));
      setRejectingStore(null);
      setRejectReason('');
    } catch (err) {
      dispatch(addToast({ type: 'error', message: getErrorMessage(err, 'Failed to update seller status') }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    { id: 'all', label: 'All Stores' },
    { id: 'pending', label: 'Pending Review' },
    { id: 'approved', label: 'Approved' },
    { id: 'suspended', label: 'Suspended' },
    { id: 'rejected', label: 'Rejected' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line">
        <div>
          <h1 className="text-xl font-normal text-ink">Seller Stores & Verification</h1>
          <p className="text-xs text-muted mt-0.5">
            Approve onboarding applications and audit seller compliance
          </p>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
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
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : sellers.length === 0 ? (
        <EmptyState
          icon={<StoreIcon className="h-8 w-8" />}
          title="No seller stores found"
          description="Applications will populate here as independent artisans register."
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-canvas border-b border-line text-[11px] font-semibold text-muted uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Store & Owner</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Products</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Verification Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {sellers.map((s) => (
                  <tr key={s._id} className="hover:bg-canvas/50 transition-colors">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-semibold text-ink text-sm">{s.name}</p>
                        <p className="text-[11px] text-muted">
                          Owner: {typeof s.owner === 'object' ? s.owner?.name : 'User'}
                        </p>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <p className="text-ink">{s.email || '—'}</p>
                      <p className="text-[11px] text-muted">{s.phone || '—'}</p>
                    </td>

                    <td className="py-3 px-4 text-muted">
                      {s.address?.city ? `${s.address.city}, ${s.address.state}` : 'India'}
                    </td>

                    <td className="py-3 px-4 font-medium text-ink">{s.productCount || 0}</td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] uppercase font-semibold border ${
                          s.status === 'approved'
                            ? 'bg-[#EEF3F0] text-success border-[#D6E4DC]'
                            : s.status === 'pending'
                            ? 'bg-[#FAF3E6] text-[#8a6d3b] border-[#EBDCC0]'
                            : 'bg-danger/10 text-danger border-danger/20'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {s.status !== 'approved' && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleUpdateStatus(s._id, 'approved')}
                            className="h-7 text-xs bg-success hover:bg-success/90"
                          >
                            Approve
                          </Button>
                        )}
                        {s.status === 'pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setRejectingStore(s);
                              setRejectReason('');
                            }}
                            className="h-7 text-xs text-danger hover:bg-danger/5"
                          >
                            Reject
                          </Button>
                        )}
                        {s.status === 'approved' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateStatus(s._id, 'suspended')}
                            className="h-7 text-xs text-danger hover:bg-danger/5"
                          >
                            Suspend
                          </Button>
                        )}
                        {s.status === 'suspended' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateStatus(s._id, 'approved')}
                            className="h-7 text-xs text-success hover:bg-success/5"
                          >
                            Reactivate
                          </Button>
                        )}
                      </div>
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

      {/* Reject Modal */}
      <Modal
        isOpen={Boolean(rejectingStore)}
        onClose={() => setRejectingStore(null)}
        title="Reject Store Application"
        description={`State justification for rejecting ${rejectingStore?.name}`}
      >
        <div className="space-y-4">
          <textarea
            rows={3}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="e.g. Incomplete authenticity verification documents, catalog does not fit marketplace criteria..."
            className="w-full p-3 rounded-xl border border-line text-xs"
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRejectingStore(null)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={isSubmitting}
              onClick={() =>
                rejectingStore && handleUpdateStatus(rejectingStore._id, 'rejected', rejectReason)
              }
            >
              Confirm Rejection
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminSellersPage;
