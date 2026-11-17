import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { sellerService } from '@/services/seller.service';
import type { Product, PaginationMeta } from '@/types';
import Button from '@/components/ui/Button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import Pagination from '@/components/ui/Pagination';
import { formatCurrency } from '@/utils/format';
import { useAppDispatch } from '@/hooks/store';
import { addToast } from '@/store/slices/uiSlice';
import { Package, Plus, Search, Edit2, Trash2, ExternalLink } from 'lucide-react';
import { getErrorMessage } from '@/services/api';

export const SellerProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // Delete modal state
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function loadProducts() {
      try {
        setIsLoading(true);
        const res = await sellerService.getMyProducts({
          page,
          limit: 10,
          q: searchQuery.trim() || undefined,
          status: statusFilter === 'all' ? undefined : statusFilter,
        });
        setProducts(res.products);
        setMeta(res.meta);
      } catch {
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    }
    loadProducts();
  }, [page, searchQuery, statusFilter]);

  const handleDelete = async () => {
    if (!productToDelete) return;
    try {
      setIsDeleting(true);
      await sellerService.deleteProduct(productToDelete._id);
      setProducts(products.filter((p) => p._id !== productToDelete._id));
      dispatch(addToast({ type: 'success', message: 'Product removed successfully' }));
      setDeleteConfirmOpen(false);
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
          <h1 className="text-xl font-normal text-ink">Store Product Catalog</h1>
          <p className="text-xs text-muted mt-0.5">Manage, edit, or create new listings</p>
        </div>
        <Link to="/seller/products/new">
          <Button variant="primary" size="sm">
            <Plus className="h-3.5 w-3.5 mr-1" /> Add New Product
          </Button>
        </Link>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search by product name, brand, or tag..."
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
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          icon={<Package className="h-8 w-8" />}
          title="No products listed"
          description="You haven't listed any items in your store yet."
          actionLabel="Add Your First Product"
          onAction={() => navigate('/seller/products/new')}
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-canvas border-b border-line text-[11px] font-semibold text-muted uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {products.map((p) => {
                  const isLow = p.stock > 0 && p.stock <= (p.lowStockThreshold || 5);
                  const isOut = p.stock <= 0;

                  return (
                    <tr key={p._id} className="hover:bg-canvas/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.images[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                            alt={p.name}
                            className="h-11 w-11 rounded-lg object-cover bg-canvas shrink-0"
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

                      <td className="py-3 px-4">
                        {isOut ? (
                          <span className="text-danger font-semibold">Out of Stock</span>
                        ) : isLow ? (
                          <span className="text-[#8a6d3b] font-medium">{p.stock} left (Low)</span>
                        ) : (
                          <span className="text-ink">{p.stock} units</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-medium text-ink">{p.ratingAverage.toFixed(1)}</span>
                        <span className="text-[11px] text-muted ml-1">({p.ratingCount})</span>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] uppercase font-semibold border ${
                            p.status === 'active'
                              ? 'bg-[#EEF3F0] text-success border-[#D6E4DC]'
                              : 'bg-canvas text-muted border-line'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/seller/products/edit/${p._id}`}
                            className="p-1 text-muted hover:text-ink cursor-pointer"
                            aria-label="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => {
                              setProductToDelete(p);
                              setDeleteConfirmOpen(true);
                            }}
                            className="p-1 text-muted hover:text-danger cursor-pointer"
                            aria-label="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Product Listing"
        description={`Are you sure you want to delete "${productToDelete?.name}"? This action cannot be reversed.`}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default SellerProductsPage;
