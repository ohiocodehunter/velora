import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { productService } from '@/services/product.service';
import type { Product, PaginationMeta } from '@/types';
import ProductCard from '@/components/common/ProductCard';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import Pagination from '@/components/ui/Pagination';
import { Search } from 'lucide-react';
import { SORT_OPTIONS } from '@/utils/constants';

export const SearchResultsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const page = Number(searchParams.get('page') || '1');
  const sort = searchParams.get('sort') || '-createdAt';

  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function executeSearch() {
      if (!query.trim()) {
        setProducts([]);
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const res = await productService.listProducts({
          q: query.trim(),
          page,
          limit: 12,
          sort,
        });
        setProducts(res.products);
        setMeta(res.meta);
      } catch {
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    }
    executeSearch();
  }, [query, page, sort]);

  const handleSortChange = (newSort: string) => {
    const next = new URLSearchParams(searchParams);
    next.set('sort', newSort);
    next.set('page', '1');
    setSearchParams(next);
  };

  const handlePageChange = (newPage: number) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(newPage));
    setSearchParams(next);
  };

  return (
    <div className="shell py-8 sm:py-12">
      <Breadcrumbs items={[{ label: 'Search Results' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2 mb-8">
        <div>
          <span className="eyebrow">Search Query</span>
          <h1 className="text-2xl sm:text-3xl font-normal text-ink mt-1">
            Results for <span className="font-medium italic">"{query}"</span>
          </h1>
          <p className="text-xs text-muted mt-1">
            {meta ? `Found ${meta.total} matching items in the catalogue` : 'Searching catalogue...'}
          </p>
        </div>

        {products.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted">Sort:</span>
            <select
              value={sort}
              onChange={(e) => handleSortChange(e.target.value)}
              className="h-10 px-3 rounded-xl border border-line bg-surface text-xs text-ink focus:outline-none focus:border-accent"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-80 rounded-2xl" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          icon={<Search className="h-6 w-6" />}
          title={`No products matched "${query}"`}
          description="Try checking for spelling errors, using more general keywords, or browsing our full category listings."
          actionLabel="Browse all products"
          onAction={() => (window.location.href = '/shop')}
        />
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>

          {meta && meta.pages > 1 && (
            <Pagination
              currentPage={meta.page}
              totalPages={meta.pages}
              onPageChange={handlePageChange}
              className="mt-12"
            />
          )}
        </>
      )}
    </div>
  );
};

export default SearchResultsPage;
