import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productService, type ProductFacets } from '@/services/product.service';
import { categoryService } from '@/services/category.service';
import type { Product, Category, PaginationMeta } from '@/types';
import ProductCard from '@/components/common/ProductCard';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import Pagination from '@/components/ui/Pagination';
import Button from '@/components/ui/Button';
import { SORT_OPTIONS } from '@/utils/constants';
import { Filter, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

export const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [facets, setFacets] = useState<ProductFacets | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Read filters from URL
  const page = Number(searchParams.get('page') || '1');
  const sort = searchParams.get('sort') || '-createdAt';
  const categoryParam = searchParams.get('category') || '';
  const brandParam = searchParams.get('brand') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const inStock = searchParams.get('inStock') === 'true';
  const featured = searchParams.get('featured') === 'true';
  const ratingParam = searchParams.get('rating') || '';
  const sellerParam = searchParams.get('seller') || '';

  // Load categories and facets
  useEffect(() => {
    async function loadMeta() {
      try {
        const [cats, facetData] = await Promise.all([
          categoryService.getCategories(),
          productService.getFacets(),
        ]);
        setCategories(cats);
        setFacets(facetData);
      } catch {
        // ignore
      }
    }
    loadMeta();
  }, []);

  // Fetch products whenever filters change
  useEffect(() => {
    async function fetchProducts() {
      try {
        setIsLoading(true);
        const { products, meta } = await productService.listProducts({
          page,
          limit: 12,
          sort,
          category: categoryParam || undefined,
          brand: brandParam || undefined,
          minPrice: minPrice ? Number(minPrice) : undefined,
          maxPrice: maxPrice ? Number(maxPrice) : undefined,
          inStock: inStock || undefined,
          featured: featured || undefined,
          rating: ratingParam ? Number(ratingParam) : undefined,
          seller: sellerParam || undefined,
        });
        setProducts(products);
        setMeta(meta);
      } catch {
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProducts();
  }, [
    page,
    sort,
    categoryParam,
    brandParam,
    minPrice,
    maxPrice,
    inStock,
    featured,
    ratingParam,
    sellerParam,
  ]);

  const updateFilter = (key: string, val: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (val === null || val === '') {
      next.delete(key);
    } else {
      next.set(key, val);
    }
    next.set('page', '1'); // reset page
    setSearchParams(next);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters =
    Boolean(categoryParam) ||
    Boolean(brandParam) ||
    Boolean(minPrice) ||
    Boolean(maxPrice) ||
    inStock ||
    featured ||
    Boolean(ratingParam) ||
    Boolean(sellerParam);

  return (
    <div className="shell py-8">
      <Breadcrumbs items={[{ label: 'Catalogue', href: '/shop' }, { label: 'All Products' }]} />

      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-normal text-ink">Catalogue</h1>
          <p className="text-xs text-muted mt-1">
            {meta ? `Showing ${meta.total} authenticated items` : 'Discover curated products'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 h-10 px-4 rounded-xl border border-line bg-surface text-xs font-medium text-ink"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filters {hasActiveFilters && '•'}</span>
          </button>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted hidden sm:inline">Sort:</span>
            <select
              value={sort}
              onChange={(e) => updateFilter('sort', e.target.value)}
              className="h-10 px-3 rounded-xl border border-line bg-surface text-xs text-ink focus:outline-none focus:border-accent"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Active Filter Pills */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap mb-6 pb-4 border-b border-line">
          <span className="text-xs text-muted">Active:</span>
          {categoryParam && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface border border-line text-xs">
              Category: {categoryParam}
              <button onClick={() => updateFilter('category', null)}>
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {brandParam && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface border border-line text-xs">
              Brand: {brandParam}
              <button onClick={() => updateFilter('brand', null)}>
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {(minPrice || maxPrice) && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface border border-line text-xs">
              Price: ₹{minPrice || '0'} - ₹{maxPrice || '∞'}
              <button
                onClick={() => {
                  updateFilter('minPrice', null);
                  updateFilter('maxPrice', null);
                }}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {inStock && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface border border-line text-xs">
              In Stock Only
              <button onClick={() => updateFilter('inStock', null)}>
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {featured && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface border border-line text-xs">
              Featured Only
              <button onClick={() => updateFilter('featured', null)}>
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          <button
            onClick={clearAllFilters}
            className="text-xs text-accent hover:underline font-medium ml-2"
          >
            Clear all
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block space-y-6">
          <div className="card p-5 space-y-6 sticky top-28">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink">Filters</span>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-muted hover:text-accent font-medium"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Categories */}
            <div>
              <h4 className="text-xs font-medium text-ink uppercase tracking-wider mb-3">
                Categories
              </h4>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                <button
                  onClick={() => updateFilter('category', null)}
                  className={`block w-full text-left text-xs py-1 transition-colors ${
                    !categoryParam ? 'text-accent font-semibold' : 'text-muted hover:text-ink'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((c) => (
                  <button
                    key={c._id}
                    onClick={() => updateFilter('category', c.slug)}
                    className={`block w-full text-left text-xs py-1 transition-colors ${
                      categoryParam === c.slug
                        ? 'text-accent font-semibold'
                        : 'text-muted hover:text-ink'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Brands */}
            {facets?.brands && facets.brands.length > 0 && (
              <div className="pt-4 border-t border-line">
                <h4 className="text-xs font-medium text-ink uppercase tracking-wider mb-3">
                  Brands
                </h4>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {facets.brands.map((b) => (
                    <label
                      key={b.brand}
                      className="flex items-center justify-between text-xs text-muted hover:text-ink cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="brand"
                          checked={brandParam.toLowerCase() === b.brand.toLowerCase()}
                          onChange={() => updateFilter('brand', b.brand)}
                          className="accent-accent"
                        />
                        <span>{b.brand}</span>
                      </span>
                      <span className="text-[11px] text-muted/60">{b.count}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Price Filter */}
            <div className="pt-4 border-t border-line">
              <h4 className="text-xs font-medium text-ink uppercase tracking-wider mb-3">
                Price (₹)
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => updateFilter('minPrice', e.target.value)}
                  className="h-9 px-3 rounded-lg border border-line text-xs bg-canvas text-ink"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => updateFilter('maxPrice', e.target.value)}
                  className="h-9 px-3 rounded-lg border border-line text-xs bg-canvas text-ink"
                />
              </div>
            </div>

            {/* Checkboxes: Stock / Featured */}
            <div className="pt-4 border-t border-line space-y-2.5">
              <label className="flex items-center gap-2.5 text-xs text-ink cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStock}
                  onChange={(e) => updateFilter('inStock', e.target.checked ? 'true' : null)}
                  className="accent-accent rounded"
                />
                <span>In Stock Items Only</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-ink cursor-pointer">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => updateFilter('featured', e.target.checked ? 'true' : null)}
                  className="accent-accent rounded"
                />
                <span>Featured Curation</span>
              </label>
            </div>
          </div>
        </aside>

        {/* Product Grid Area */}
        <main className="lg:col-span-3">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-80 rounded-2xl" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <EmptyState
              title="No products match your criteria"
              description="Try adjusting your filters, searching for a different brand, or clearing all selections."
              actionLabel="Clear all filters"
              onAction={clearAllFilters}
            />
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6">
                {products.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>

              {meta && meta.pages > 1 && (
                <Pagination
                  currentPage={meta.page}
                  totalPages={meta.pages}
                  onPageChange={(p) => updateFilter('page', String(p))}
                  className="mt-10"
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Mobile Filter Slide-over */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-ink/50 backdrop-blur-xs"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          <div className="relative ml-auto w-full max-w-xs bg-surface h-full p-6 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-line">
              <h3 className="text-base font-medium text-ink">Filters</h3>
              <button onClick={() => setIsMobileFilterOpen(false)}>
                <X className="h-5 w-5 text-muted" />
              </button>
            </div>

            {/* Mobile Categories */}
            <div>
              <h4 className="text-xs font-semibold uppercase text-ink mb-2">Categories</h4>
              <div className="space-y-1">
                <button
                  onClick={() => {
                    updateFilter('category', null);
                    setIsMobileFilterOpen(false);
                  }}
                  className="block text-xs py-1 text-muted"
                >
                  All Categories
                </button>
                {categories.map((c) => (
                  <button
                    key={c._id}
                    onClick={() => {
                      updateFilter('category', c.slug);
                      setIsMobileFilterOpen(false);
                    }}
                    className="block text-xs py-1 text-muted"
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Price */}
            <div>
              <h4 className="text-xs font-semibold uppercase text-ink mb-2">Price (₹)</h4>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => updateFilter('minPrice', e.target.value)}
                  className="h-9 px-3 rounded-lg border border-line text-xs"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => updateFilter('maxPrice', e.target.value)}
                  className="h-9 px-3 rounded-lg border border-line text-xs"
                />
              </div>
            </div>

            <Button
              variant="primary"
              size="md"
              className="w-full mt-6"
              onClick={() => setIsMobileFilterOpen(false)}
            >
              Apply Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopPage;
