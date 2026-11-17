import React, { useEffect, useState } from 'react';
import { adminService } from '@/services/admin.service';
import type { Banner } from '@/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import { useAppDispatch } from '@/hooks/store';
import { addToast } from '@/store/slices/uiSlice';
import { Image as ImageIcon, Plus, Edit2, Trash2 } from 'lucide-react';
import { getErrorMessage } from '@/services/api';

export const AdminBannersPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [ctaLabel, setCtaLabel] = useState('Shop now');
  const [link, setLink] = useState('/shop');
  const [imageUrl, setImageUrl] = useState('');
  const [position, setPosition] = useState<'home_hero' | 'home_strip' | 'category_top'>('home_strip');
  const [theme, setTheme] = useState<'light' | 'dark' | 'accent'>('dark');
  const [isSaving, setIsSaving] = useState(false);

  // Delete State
  const [bannerToDelete, setBannerToDelete] = useState<Banner | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadBanners();
  }, []);

  async function loadBanners() {
    try {
      setIsLoading(true);
      const data = await adminService.getBanners();
      setBanners(data);
    } catch {
      setBanners([]);
    } finally {
      setIsLoading(false);
    }
  }

  const openCreateModal = () => {
    setEditingBanner(null);
    setTitle('');
    setSubtitle('');
    setCtaLabel('Shop now');
    setLink('/shop');
    setImageUrl('');
    setPosition('home_strip');
    setTheme('dark');
    setIsModalOpen(true);
  };

  const openEditModal = (b: Banner) => {
    setEditingBanner(b);
    setTitle(b.title);
    setSubtitle(b.subtitle || '');
    setCtaLabel(b.ctaLabel || 'Shop now');
    setLink(b.link);
    setImageUrl(b.image?.url || '');
    setPosition(b.position);
    setTheme(b.theme);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !link.trim()) return;

    try {
      setIsSaving(true);
      if (editingBanner) {
        const updated = await adminService.updateBanner(editingBanner._id, {
          title: title.trim(),
          subtitle: subtitle.trim() || undefined,
          ctaLabel: ctaLabel.trim(),
          link: link.trim(),
          image: imageUrl ? { url: imageUrl.trim() } : undefined,
          position,
          theme,
        });
        setBanners(banners.map((b) => (b._id === updated._id ? updated : b)));
        dispatch(addToast({ type: 'success', message: 'Banner updated' }));
      } else {
        const created = await adminService.createBanner({
          title: title.trim(),
          subtitle: subtitle.trim() || undefined,
          ctaLabel: ctaLabel.trim(),
          link: link.trim(),
          image: imageUrl ? { url: imageUrl.trim() } : undefined,
          position,
          theme,
          isActive: true,
        });
        setBanners([created, ...banners]);
        dispatch(addToast({ type: 'success', message: 'New banner published' }));
      }
      setIsModalOpen(false);
    } catch (err) {
      dispatch(addToast({ type: 'error', message: getErrorMessage(err, 'Failed to save banner') }));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!bannerToDelete) return;
    try {
      setIsDeleting(true);
      await adminService.deleteBanner(bannerToDelete._id);
      setBanners(banners.filter((b) => b._id !== bannerToDelete._id));
      dispatch(addToast({ type: 'success', message: 'Banner removed' }));
      setDeleteConfirmOpen(false);
    } catch (err) {
      dispatch(addToast({ type: 'error', message: getErrorMessage(err, 'Failed to delete banner') }));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line">
        <div>
          <h1 className="text-xl font-normal text-ink">Platform Promotional Banners</h1>
          <p className="text-xs text-muted mt-0.5">
            Manage editorial heroes, discount ribbons, and category banners
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={openCreateModal}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Add Banner
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
      ) : banners.length === 0 ? (
        <EmptyState
          icon={<ImageIcon className="h-8 w-8" />}
          title="No banners published"
          actionLabel="Create Banner"
          onAction={openCreateModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {banners.map((b) => (
            <div key={b._id} className="card p-5 space-y-3 flex flex-col justify-between">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-canvas border border-line text-accent-strong">
                    {b.position}
                  </span>
                  <h3 className="font-semibold text-ink text-sm mt-1">{b.title}</h3>
                  {b.subtitle && <p className="text-xs text-muted line-clamp-1">{b.subtitle}</p>}
                </div>
                {b.image?.url && (
                  <img
                    src={b.image.url}
                    alt={b.title}
                    className="h-14 w-20 rounded-lg object-cover bg-canvas shrink-0 border border-line"
                  />
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-line/60 text-xs">
                <span className="text-muted truncate max-w-xs">Link: {b.link}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(b)}
                    className="p-1 text-muted hover:text-ink cursor-pointer"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      setBannerToDelete(b);
                      setDeleteConfirmOpen(true);
                    }}
                    className="p-1 text-muted hover:text-danger cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Banner Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBanner ? 'Edit Banner' : 'Create Platform Banner'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Banner Title *"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Input
            label="Subtitle"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="CTA Button Label"
              value={ctaLabel}
              onChange={(e) => setCtaLabel(e.target.value)}
            />
            <Input
              label="Target Link *"
              required
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
          </div>
          <Input
            label="Background Image URL"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-ink">Position Placement</label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value as any)}
                className="w-full h-11 px-3 rounded-xl border border-line text-xs bg-surface"
              >
                <option value="home_hero">Homepage Hero</option>
                <option value="home_strip">Homepage Promo Strip</option>
                <option value="category_top">Category Top Ribbon</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-ink">Visual Theme</label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as any)}
                className="w-full h-11 px-3 rounded-xl border border-line text-xs bg-surface"
              >
                <option value="dark">Dark Luxury</option>
                <option value="light">Light Minimal</option>
                <option value="accent">Warm Gold Accent</option>
              </select>
            </div>
          </div>
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
              Save Banner
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Banner"
        description={`Remove "${bannerToDelete?.title}" from platform displays?`}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default AdminBannersPage;
