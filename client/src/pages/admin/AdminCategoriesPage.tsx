import React, { useEffect, useState } from 'react';
import { adminService } from '@/services/admin.service';
import type { Category } from '@/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import { useAppDispatch } from '@/hooks/store';
import { addToast } from '@/store/slices/uiSlice';
import { Layers, Plus, Edit2, Trash2, CheckCircle2 } from 'lucide-react';
import { getErrorMessage } from '@/services/api';

export const AdminCategoriesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Delete State
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      setIsLoading(true);
      const data = await adminService.getCategories();
      setCategories(data);
    } catch {
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  }

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setImageUrl('');
    setIsFeatured(false);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setImageUrl(cat.image?.url || '');
    setIsFeatured(cat.isFeatured);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsSaving(true);
      if (editingCategory) {
        const updated = await adminService.updateCategory(editingCategory._id, {
          name: name.trim(),
          description: description.trim() || undefined,
          image: imageUrl ? { url: imageUrl.trim() } : undefined,
          isFeatured,
        });
        setCategories(categories.map((c) => (c._id === updated._id ? updated : c)));
        dispatch(addToast({ type: 'success', message: 'Category updated successfully' }));
      } else {
        const created = await adminService.createCategory({
          name: name.trim(),
          description: description.trim() || undefined,
          image: imageUrl ? { url: imageUrl.trim() } : undefined,
          isFeatured,
        });
        setCategories([...categories, created]);
        dispatch(addToast({ type: 'success', message: 'New category created' }));
      }
      setIsModalOpen(false);
    } catch (err) {
      dispatch(addToast({ type: 'error', message: getErrorMessage(err, 'Failed to save category') }));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;
    try {
      setIsDeleting(true);
      await adminService.deleteCategory(categoryToDelete._id);
      setCategories(categories.filter((c) => c._id !== categoryToDelete._id));
      dispatch(addToast({ type: 'success', message: 'Category removed' }));
      setDeleteConfirmOpen(false);
    } catch (err) {
      dispatch(addToast({ type: 'error', message: getErrorMessage(err, 'Failed to delete category') }));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line">
        <div>
          <h1 className="text-xl font-normal text-ink">Product Categories</h1>
          <p className="text-xs text-muted mt-0.5">
            Organize the marketplace hierarchy, department taxonomy, and landing links
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={openCreateModal}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Add Category
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <EmptyState
          icon={<Layers className="h-8 w-8" />}
          title="No categories configured"
          actionLabel="Add Category"
          onAction={openCreateModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((c) => (
            <div key={c._id} className="card p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={c.image?.url || 'https://images.unsplash.com/photo-1513094735237-8f2714d57c13?w=100'}
                  alt={c.name}
                  className="h-12 w-12 rounded-xl object-cover bg-canvas shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-semibold text-ink text-sm truncate">{c.name}</p>
                    {c.isFeatured && (
                      <span className="px-1.5 py-0.5 rounded bg-ink text-surface text-[9px] uppercase font-semibold">
                        Featured
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted truncate">{c.slug}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(c)}
                  className="p-1.5 rounded-lg border border-line text-muted hover:text-ink hover:bg-canvas"
                  aria-label="Edit"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => {
                    setCategoryToDelete(c);
                    setDeleteConfirmOpen(true);
                  }}
                  className="p-1.5 rounded-lg border border-line text-muted hover:text-danger hover:bg-danger/5"
                  aria-label="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Category Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Create New Category'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Category Name"
            required
            placeholder="e.g. Mechanical Timepieces"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            label="Short Description"
            placeholder="e.g. Horology, tourbillons and chronometers"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Input
            label="Banner / Thumbnail Image URL"
            placeholder="https://images.unsplash.com/..."
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
          <label className="flex items-center gap-2 text-xs text-ink cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="accent-accent rounded"
            />
            <span>Feature on Homepage Spotlight</span>
          </label>
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
              Save Category
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Category"
        description={`Are you sure you want to delete "${categoryToDelete?.name}"?`}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default AdminCategoriesPage;
