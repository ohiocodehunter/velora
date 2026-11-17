import React, { useEffect, useState } from 'react';
import { sellerService } from '@/services/seller.service';
import type { Product, PaginationMeta } from '@/types';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import Pagination from '@/components/ui/Pagination';
import Modal from '@/components/ui/Modal';
import { useAppDispatch } from '@/hooks/store';
import { addToast } from '@/store/slices/uiSlice';
import { Boxes, AlertTriangle, Edit2, CheckCircle2 } from 'lucide-react';
import { getErrorMessage } from '@/services/api';

export const SellerInventoryPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Edit stock modal
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newStock, setNewStock] = useState<number>(0);
  const [newThreshold, setNewThreshold] = useState<number>(3);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadInventory();
  }, [page, lowStockOnly]);

  async function loadInventory() {
    try {
      setIsLoading(true);
      const res = await sellerService.getInventory({
        page,
        limit: 12,
        lowStockOnly: lowStockOnly || undefined,
      });
      setProducts(res.inventory);
      setMeta(res.meta);
    } catch {
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setNewStock(p.stock);
    setNewThreshold(p.lowStockThreshold || 3);
  };

  const handleSaveStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      setIsUpdating(true);
      const updated = await sellerService.updateStock(
        editingProduct._id,
        newStock,
        newThreshold,
      );
      setProducts(products.map((p) => (p._id === updated._id ? updated : p)));
      dispatch(addToast({ type: 'success', message: `Stock updated for "${editingProduct.name}"` }));
      setEditingProduct(null);
    } catch (err) {
      dispatch(addToast({ type: 'error', message: getErrorMessage(err, 'Failed to update stock') }));
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line">
        <div>
          <h1 className="text-xl font-normal text-ink">Inventory Manager</h1>
          <p className="text-xs text-muted mt-0.5">
            Monitor real-time warehouse units and restock thresholds
          </p>
        </div>

        <label className="flex items-center gap-2 text-xs font-medium text-ink cursor-pointer bg-surface border border-line px-3.5 py-2 rounded-xl">
          <input
            type="checkbox"
            checked={lowStockOnly}
            onChange={(e) => {
              setLowStockOnly(e.target.checked);
              setPage(1);
            }}
            className="accent-accent rounded"
          />
          <span>Show Low Stock Alerts Only</span>
        </label>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          icon={<Boxes className="h-8 w-8" />}
          title="No inventory alerts"
          description={
            lowStockOnly
              ? 'Great news! All products are currently above their low stock warning thresholds.'
              : 'No products in inventory.'
          }
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-canvas border-b border-line text-[11px] font-semibold text-muted uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Item</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Units in Stock</th>
                  <th className="py-3 px-4">Threshold</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Quick Restock</th>
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
                            className="h-10 w-10 rounded-lg object-cover bg-canvas shrink-0"
                          />
                          <span className="font-medium text-ink truncate max-w-xs">{p.name}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-muted">{p.sku || '—'}</td>

                      <td className="py-3 px-4 font-semibold text-sm">
                        <span className={isOut ? 'text-danger' : isLow ? 'text-[#8a6d3b]' : 'text-ink'}>
                          {p.stock}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-muted">{p.lowStockThreshold || 3}</td>

                      <td className="py-3 px-4">
                        {isOut ? (
                          <span className="px-2 py-0.5 rounded-md bg-danger/10 border border-danger/20 text-danger text-[10px] font-semibold uppercase">
                            Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="px-2 py-0.5 rounded-md bg-[#FAF3E6] border border-[#EBDCC0] text-[#8a6d3b] text-[10px] font-semibold uppercase flex items-center gap-1 w-fit">
                            <AlertTriangle className="h-3 w-3" /> Low Stock
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-[#EEF3F0] border border-[#D6E4DC] text-success text-[10px] font-semibold uppercase">
                            Sufficient
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(p)}
                          className="h-8 text-xs"
                        >
                          <Edit2 className="h-3 w-3 mr-1" /> Update Stock
                        </Button>
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

      {/* Edit Stock Modal */}
      <Modal
        isOpen={Boolean(editingProduct)}
        onClose={() => setEditingProduct(null)}
        title="Update Stock Levels"
        description={editingProduct?.name}
      >
        <form onSubmit={handleSaveStock} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-ink">Units in Stock *</label>
            <input
              type="number"
              min={0}
              required
              value={newStock}
              onChange={(e) => setNewStock(Number(e.target.value))}
              className="w-full h-10 px-3 rounded-xl border border-line text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-ink">Low Stock Warning Limit</label>
            <input
              type="number"
              min={1}
              required
              value={newThreshold}
              onChange={(e) => setNewThreshold(Number(e.target.value))}
              className="w-full h-10 px-3 rounded-xl border border-line text-xs"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setEditingProduct(null)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isUpdating}>
              Save Stock
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SellerInventoryPage;
