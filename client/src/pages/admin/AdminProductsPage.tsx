import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '@/services/admin.service';
import type { Product, PaginationMeta } from '@/types';
import Button from '@/components/ui/Button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import Pagination from '@/components/ui/Pagination';
import { formatCurrency } from '@/utils/format';
import { useAppDispatch } from '@/hooks/store';
import { addToast } from '@/store/slices/uiSlice';
import { Package, Search, Star, Trash2, Flag, ExternalLink } from 'lucide-react';
import { getErrorMessage } from '@/services/api';

export const AdminProductsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [reportedOnly, setReportedOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Delete Confirm
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadProducts();
  }, [page, searchQuery, reportedOnly]);

  async function loadProducts() {
    try {
      setIsLoading(true);
      const res = await adminService.getProducts({
        page,
        limit: 12,
        q: searchQuery.trim() || undefined,
        reported: reportedOnly || undefined,
      });
      setProducts(res.products);
      setMeta(res.meta);
    } catch {
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }

  const handleToggleFeatured = async (p: Product) => {
    try {
      const nextFeatured = !p.isFeatured;
      const updated = await adminService.updateProduct(p._id, { isFeatured: nextFeatured });
      setProducts(products.map((item) => (item._id === updated._id ? updated : item)));
      dispatch(
        addToast({
          type: 'success',
          message: `Product "${p.name}" ${nextFeatured ? 'marked as Featured' : 'unfeatured'}`,
        }),
      );
    } catch (err) {
      dispatch(addToast({ type: 'error', message: getErrorMessage(err, 'Failed to update product') }));
    }
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    try {
      setIsDeleting(true);
      await adminService.deleteProduct(productToDelete._id);
      setProducts(products.filter((p) => p._id !== productToDelete._id));
      dispatch(addToast({ type: 'success', message: 'Product listing removed by admin' }));
      setDeleteModalOpen(false);
    } catch (err) {
      dispatch(addToast({ type: 'error', message: getErrorMessage(err, 'Failed to delete product') }));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line">
        <div>
          <h1 className="text-xl font-normal text-ink">Catalog Oversight & Moderation</h1>
          <p className="text-xs text-muted mt-0.5">
            Audit seller products, featured placements, and customer reports
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
            <Flag className="h-3.5 w-3.5" /> Flagged / Reported Items Only
          </span>
        </label>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(1);
          }}
          placeholder="Search products across entire marketplace..."
          className="w-full h-10 pl-9 pr-3 rounded-xl border border-line bg-surface text-xs text-ink placeholder:text-muted"
        />
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted pointer-events-none" />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 rounded-2xl" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          icon={<Package className="h-8 w-8" />}
          title="No products found"
          description={reportedOnly ? 'No products currently flagged by users.' : 'No listings found.'}
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-canvas border-b border-line text-[11px] font-semibold text-muted uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Item & Brand</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Featured</th>
                  <th className="py-3 px-4">Reports</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {products.map((p) => (
                  <tr key={p._id} className="hover:bg-canvas/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.images[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                          alt={p.name}
                          className="h-10 w-10 rounded-lg object-cover bg-canvas shrink-0"
                        />
                        <div className="min-w-0 max-w-xs">
                          <Link
                            to={`/product/${p.slug}`}
                            target="_blank"
                            className="font-medium text-ink hover:text-accent truncate block"
                          >
                            {p.name}
                          </Link>
                          <span className="text-[11px] text-muted">{p.brand}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-semibold text-ink">
                      {formatCurrency(p.finalPrice)}
                    </td>

                    <td className="py-3 px-4 text-ink">{p.stock}</td>

                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleFeatured(p)}
                        className={`px-2.5 py-1 rounded-md text-[10px] uppercase font-semibold border transition-colors cursor-pointer ${
                          p.isFeatured
                            ? 'bg-ink text-surface border-ink'
                            : 'bg-surface border-line text-muted hover:text-ink'
                        }`}
                      >
                        {p.isFeatured ? 'Featured ★' : 'Standard'}
                      </button>
                    </td>

                    <td className="py-3 px-4">
                      {p.isReported ? (
                        <span className="px-2 py-0.5 rounded-md bg-danger/10 text-danger border border-danger/20 text-[10px] font-semibold uppercase flex items-center gap-1 w-fit">
                          <Flag className="h-3 w-3" /> Reported
                        </span>
                      ) : (
                        <span className="text-muted text-[11px]">Clean</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setProductToDelete(p);
                          setDeleteModalOpen(true);
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

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Admin Delete Product"
        description={`Permanently remove "${productToDelete?.name}" from marketplace listings?`}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default AdminProductsPage;
