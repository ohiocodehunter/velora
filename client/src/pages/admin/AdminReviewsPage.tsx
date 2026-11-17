import React, { useEffect, useState } from 'react';
import { adminService } from '@/services/admin.service';
import type { Review, PaginationMeta } from '@/types';
import Button from '@/components/ui/Button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import Pagination from '@/components/ui/Pagination';
import Rating from '@/components/ui/Rating';
import { formatDate } from '@/utils/format';
import { useAppDispatch } from '@/hooks/store';
import { addToast } from '@/store/slices/uiSlice';
import { Star, Flag, Trash2, Eye, EyeOff } from 'lucide-react';
import { getErrorMessage } from '@/services/api';

export const AdminReviewsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [reportedOnly, setReportedOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Delete State
  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadReviews();
  }, [page, reportedOnly]);

  async function loadReviews() {
    try {
      setIsLoading(true);
      const res = await adminService.getReviews({
        page,
        limit: 12,
        reportedOnly: reportedOnly || undefined,
      });
      setReviews(res.reviews);
      setMeta(res.meta);
    } catch {
      setReviews([]);
    } finally {
      setIsLoading(false);
    }
  }

  const handleModerate = async (rev: Review, nextStatus: 'visible' | 'hidden') => {
    try {
      const updated = await adminService.moderateReview(rev._id, nextStatus);
      setReviews(reviews.map((r) => (r._id === updated._id ? updated : r)));
      dispatch(addToast({ type: 'success', message: `Review marked as ${nextStatus}` }));
    } catch (err) {
      dispatch(addToast({ type: 'error', message: getErrorMessage(err, 'Failed to update review status') }));
    }
  };

  const handleDelete = async () => {
    if (!reviewToDelete) return;
    try {
      setIsDeleting(true);
      await adminService.deleteReview(reviewToDelete._id);
      setReviews(reviews.filter((r) => r._id !== reviewToDelete._id));
      dispatch(addToast({ type: 'success', message: 'Review deleted by admin' }));
      setDeleteConfirmOpen(false);
    } catch (err) {
      dispatch(addToast({ type: 'error', message: getErrorMessage(err, 'Failed to delete review') }));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line">
        <div>
          <h1 className="text-xl font-normal text-ink">Customer Reviews Moderation</h1>
          <p className="text-xs text-muted mt-0.5">
            Audit customer evaluations and moderate reported counterfeit or abusive claims
          </p>
        </div>

        <label className="flex items-center gap-2 text-xs font-medium text-ink cursor-pointer bg-surface border border-line px-3.5 py-2 rounded-xl">
          <input
            type="checkbox"
            checked={reportedOnly}
            onChange={(e) => {
              setReportedOnly(e.target.checked);
              setPage(1);
            }}
            className="accent-danger rounded"
          />
          <span className="flex items-center gap-1.5 text-danger">
            <Flag className="h-3.5 w-3.5" /> Flagged Reviews Only
          </span>
        </label>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <EmptyState
          icon={<Star className="h-8 w-8" />}
          title="No reviews found"
          description={reportedOnly ? 'No reviews are currently flagged for moderation.' : 'No reviews.'}
        />
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r._id} className="card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Rating value={r.rating} size="sm" />
                  <span
                    className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded border ${
                      r.status === 'visible'
                        ? 'bg-[#EEF3F0] text-success border-[#D6E4DC]'
                        : 'bg-danger/10 text-danger border-danger/20'
                    }`}
                  >
                    {r.status}
                  </span>
                  {r.reportCount && r.reportCount > 0 ? (
                    <span className="text-[10px] font-semibold text-danger bg-danger/10 px-2 py-0.5 rounded">
                      {r.reportCount} Report(s)
                    </span>
                  ) : null}
                </div>
                <span className="text-xs text-muted">{formatDate(r.createdAt)}</span>
              </div>

              {r.title && <h4 className="text-xs font-semibold text-ink">{r.title}</h4>}
              <p className="text-xs text-ink/80 leading-relaxed">{r.body}</p>

              <div className="pt-3 border-t border-line/60 flex items-center justify-between text-xs">
                <span className="text-muted text-[11px]">
                  Author: {typeof r.user === 'object' ? r.user?.name : 'Customer'}
                </span>

                <div className="flex items-center gap-2">
                  {r.status === 'visible' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleModerate(r, 'hidden')}
                      className="h-7 text-xs text-muted"
                    >
                      <EyeOff className="h-3.5 w-3.5 mr-1" /> Hide Review
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleModerate(r, 'visible')}
                      className="h-7 text-xs text-success"
                    >
                      <Eye className="h-3.5 w-3.5 mr-1" /> Restore Visible
                    </Button>
                  )}
                  <button
                    onClick={() => {
                      setReviewToDelete(r);
                      setDeleteConfirmOpen(true);
                    }}
                    className="p-1.5 text-muted hover:text-danger rounded-lg border border-line cursor-pointer"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
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

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Review"
        description="Permanently delete this customer review from database records?"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default AdminReviewsPage;
