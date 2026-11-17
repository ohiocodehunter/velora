import React, { useEffect, useState } from 'react';
import { sellerService } from '@/services/seller.service';
import type { Review, PaginationMeta } from '@/types';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import Rating from '@/components/ui/Rating';
import Pagination from '@/components/ui/Pagination';
import { formatDate } from '@/utils/format';
import { Star } from 'lucide-react';

export const SellerReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadReviews() {
      try {
        setIsLoading(true);
        const res = await sellerService.getReviews({ page, limit: 10 });
        setReviews(res.reviews);
        setMeta(res.meta);
      } catch {
        setReviews([]);
      } finally {
        setIsLoading(false);
      }
    }
    loadReviews();
  }, [page]);

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-line">
        <h1 className="text-xl font-normal text-ink">Customer Reviews</h1>
        <p className="text-xs text-muted mt-0.5">
          Feedback and ratings on products crafted and dispatched by your store
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <EmptyState
          icon={<Star className="h-8 w-8" />}
          title="No customer reviews yet"
          description="Customer evaluations will appear here once verified buyers share their experiences."
        />
      ) : (
        <div className="space-y-4">
          {reviews.map((rev) => (
            <div key={rev._id} className="card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Rating value={rev.rating} size="sm" />
                  {rev.isVerifiedPurchase && (
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-[#EEF3F0] text-success border border-[#D6E4DC]">
                      Verified Purchase
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted">{formatDate(rev.createdAt)}</span>
              </div>

              {rev.title && <h4 className="text-xs font-semibold text-ink">{rev.title}</h4>}
              <p className="text-xs text-ink/80 leading-relaxed">{rev.body}</p>

              <div className="pt-2 border-t border-line/60 flex items-center justify-between text-[11px] text-muted">
                <span>By {typeof rev.user === 'object' ? rev.user?.name : 'Customer'}</span>
                {typeof rev.product === 'object' && (
                  <span className="font-medium text-ink truncate max-w-xs">
                    Product: {rev.product.name}
                  </span>
                )}
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
    </div>
  );
};

export default SellerReviewsPage;
