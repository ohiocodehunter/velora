import React, { useEffect, useState } from 'react';
import { adminService } from '@/services/admin.service';
import type { Coupon, PaginationMeta } from '@/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import Pagination from '@/components/ui/Pagination';
import { formatCurrency, formatDate } from '@/utils/format';
import { useAppDispatch } from '@/hooks/store';
import { addToast } from '@/store/slices/uiSlice';
import { Tag, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { getErrorMessage } from '@/services/api';

export const AdminCouponsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'percent' | 'fixed'>('percent');
  const [value, setValue] = useState<number | ''>(10);
  const [minOrder, setMinOrder] = useState<number | ''>(0);
  const [maxDiscount, setMaxDiscount] = useState<number | ''>(1000);
  const [expiresAt, setExpiresAt] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Delete State
  const [couponToDelete, setCouponToDelete] = useState<Coupon | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadCoupons();
  }, [page]);

  async function loadCoupons() {
    try {
      setIsLoading(true);
      const res = await adminService.getCoupons({ page, limit: 10 });
      setCoupons(res.coupons);
      setMeta(res.meta);
    } catch {
      setCoupons([]);
    } finally {
      setIsLoading(false);
    }
  }

  const handleToggleActive = async (coupon: Coupon) => {
    try {
      const nextActive = !coupon.isActive;
      const updated = await adminService.updateCoupon(coupon._id, { isActive: nextActive });
      setCoupons(coupons.map((c) => (c._id === updated._id ? updated : c)));
      dispatch(
        addToast({
          type: 'success',
          message: `Coupon "${coupon.code}" is now ${nextActive ? 'Active' : 'Deactivated'}`,
        }),
      );
    } catch (err) {
      dispatch(addToast({ type: 'error', message: getErrorMessage(err, 'Failed to update coupon') }));
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || value === '' || !expiresAt) {
      dispatch(addToast({ type: 'warning', message: 'Please complete required coupon fields' }));
      return;
    }

    try {
      setIsSaving(true);
      const created = await adminService.createCoupon({
        code: code.trim().toUpperCase(),
        description: description.trim() || undefined,
        type,
        value: Number(value),
        minOrder: Number(minOrder || 0),
        maxDiscount: Number(maxDiscount || 0),
        expiresAt: new Date(expiresAt).toISOString(),
        isActive: true,
      });
      setCoupons([created, ...coupons]);
      dispatch(addToast({ type: 'success', message: 'Coupon promo code created' }));
      setIsModalOpen(false);
      setCode('');
      setDescription('');
    } catch (err) {
      dispatch(addToast({ type: 'error', message: getErrorMessage(err, 'Failed to create coupon') }));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!couponToDelete) return;
    try {
      setIsDeleting(true);
      await adminService.deleteCoupon(couponToDelete._id);
      setCoupons(coupons.filter((c) => c._id !== couponToDelete._id));
      dispatch(addToast({ type: 'success', message: 'Coupon code deleted' }));
      setDeleteConfirmOpen(false);
    } catch (err) {
      dispatch(addToast({ type: 'error', message: getErrorMessage(err, 'Failed to delete coupon') }));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line">
        <div>
          <h1 className="text-xl font-normal text-ink">Coupons & Promotional Discounts</h1>
          <p className="text-xs text-muted mt-0.5">
            Configure promotional campaign voucher codes and discounts
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Create Coupon
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      ) : coupons.length === 0 ? (
        <EmptyState
          icon={<Tag className="h-8 w-8" />}
          title="No promotional coupons active"
          actionLabel="Create Coupon"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-canvas border-b border-line text-[11px] font-semibold text-muted uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Coupon Code</th>
                  <th className="py-3 px-4">Discount</th>
                  <th className="py-3 px-4">Min. Spend</th>
                  <th className="py-3 px-4">Max. Cap</th>
                  <th className="py-3 px-4">Expires</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {coupons.map((c) => (
                  <tr key={c._id} className="hover:bg-canvas/50 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-ink text-sm uppercase px-2 py-0.5 rounded bg-canvas border border-line">
                        {c.code}
                      </span>
                      {c.description && (
                        <p className="text-[11px] text-muted mt-1">{c.description}</p>
                      )}
                    </td>

                    <td className="py-3 px-4 font-semibold text-ink">
                      {c.type === 'percent' ? `${c.value}% OFF` : `₹${c.value} OFF`}
                    </td>

                    <td className="py-3 px-4 text-muted">
                      {c.minOrder ? formatCurrency(c.minOrder) : 'None'}
                    </td>

                    <td className="py-3 px-4 text-muted">
                      {c.maxDiscount ? formatCurrency(c.maxDiscount) : 'No Cap'}
                    </td>

                    <td className="py-3 px-4 text-muted">{formatDate(c.expiresAt)}</td>

                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleActive(c)}
                        className={`px-2 py-0.5 rounded-md text-[10px] uppercase font-semibold border cursor-pointer ${
                          c.isActive
                            ? 'bg-[#EEF3F0] text-success border-[#D6E4DC]'
                            : 'bg-canvas text-muted border-line'
                        }`}
                      >
                        {c.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setCouponToDelete(c);
                          setDeleteConfirmOpen(true);
                        }}
                        className="p-1 text-muted hover:text-danger cursor-pointer"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
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

      {/* Create Coupon Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Promotional Coupon"
      >
        <form onSubmit={handleCreateCoupon} className="space-y-4">
          <Input
            label="Promo Code *"
            required
            placeholder="e.g. FESTIVE20, WELCOME10"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
          />
          <Input
            label="Description (Optional)"
            placeholder="e.g. 10% off for first time luxury orders"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-ink">Discount Type *</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full h-11 px-3 rounded-xl border border-line text-xs bg-surface"
              >
                <option value="percent">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>
            <Input
              label="Value *"
              type="number"
              required
              min={1}
              value={value}
              onChange={(e) => setValue(e.target.value === '' ? '' : Number(e.target.value))}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Minimum Order Spend (₹)"
              type="number"
              min={0}
              value={minOrder}
              onChange={(e) => setMinOrder(e.target.value === '' ? '' : Number(e.target.value))}
            />
            <Input
              label="Maximum Discount Cap (₹)"
              type="number"
              min={0}
              value={maxDiscount}
              onChange={(e) => setMaxDiscount(e.target.value === '' ? '' : Number(e.target.value))}
            />
          </div>
          <Input
            label="Expiry Date *"
            type="date"
            required
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
          />
          <div className="flex justify-end gap-3 pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSaving}>
              Create Coupon
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Coupon"
        description={`Are you sure you want to delete coupon "${couponToDelete?.code}"?`}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default AdminCouponsPage;
