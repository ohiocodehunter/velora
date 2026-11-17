import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { sellerService, type ProductInputPayload } from '@/services/seller.service';
import { categoryService } from '@/services/category.service';
import { uploadService } from '@/services/upload.service';
import { productService } from '@/services/product.service';
import type { Category, Product } from '@/types';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import { useAppDispatch } from '@/hooks/store';
import { addToast } from '@/store/slices/uiSlice';
import {
  Upload,
  Plus,
  Trash2,
  Image as ImageIcon,
  ArrowLeft,
  Loader2,
  Check,
} from 'lucide-react';
import { getErrorMessage } from '@/services/api';

export const SellerProductEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [discountPrice, setDiscountPrice] = useState<number | ''>('');
  const [stock, setStock] = useState<number | ''>(10);
  const [lowStockThreshold, setLowStockThreshold] = useState<number | ''>(3);
  const [sku, setSku] = useState('');
  const [status, setStatus] = useState<'active' | 'draft'>('active');

  // Images state
  const [images, setImages] = useState<{ url: string; alt?: string }[]>([]);
  const [manualImageUrl, setManualImageUrl] = useState('');

  // Specifications state (key / val)
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([
    { key: 'Material', value: '' },
    { key: 'Origin', value: '' },
  ]);

  // Load categories & existing product
  useEffect(() => {
    async function init() {
      try {
        const catList = await categoryService.getCategories();
        setCategories(catList);
        if (catList.length > 0 && !category) {
          setCategory(catList[0]._id);
        }

        if (id) {
          setIsLoadingProduct(true);
          const p = await productService.getProduct(id);
          if (p) {
            setName(p.name);
            setBrand(p.brand);
            setCategory(typeof p.category === 'object' ? p.category._id : p.category);
            setDescription(p.description);
            setShortDescription(p.shortDescription || '');
            setPrice(p.price);
            setDiscountPrice(p.discountPrice || '');
            setStock(p.stock);
            setLowStockThreshold(p.lowStockThreshold || 3);
            setSku(p.sku || '');
            setStatus(p.status === 'active' ? 'active' : 'draft');
            setImages(p.images || []);
            if (p.specifications) {
              setSpecs(
                Object.entries(p.specifications).map(([k, v]) => ({ key: k, value: String(v) })),
              );
            }
          }
        }
      } catch {
        // ignore
      } finally {
        setIsLoadingProduct(false);
      }
    }
    init();
  }, [id]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsUploading(true);
      const uploaded = await uploadService.uploadImages(Array.from(files));
      setImages([...images, ...uploaded.map((img) => ({ url: img.url }))]);
      dispatch(addToast({ type: 'success', message: 'Images uploaded successfully' }));
    } catch (err) {
      dispatch(addToast({ type: 'error', message: getErrorMessage(err, 'Failed to upload images') }));
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddManualImage = () => {
    if (!manualImageUrl.trim()) return;
    setImages([...images, { url: manualImageUrl.trim() }]);
    setManualImageUrl('');
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, idx) => idx !== index));
  };

  const handleAddSpecRow = () => {
    setSpecs([...specs, { key: '', value: '' }]);
  };

  const handleRemoveSpecRow = (index: number) => {
    setSpecs(specs.filter((_, idx) => idx !== index));
  };

  const handleSpecChange = (index: number, field: 'key' | 'value', text: string) => {
    const next = [...specs];
    next[index][field] = text;
    setSpecs(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !brand.trim() || !category || !description.trim() || price === '') {
      dispatch(addToast({ type: 'warning', message: 'Please complete all required fields' }));
      return;
    }

    if (discountPrice !== '' && Number(discountPrice) >= Number(price)) {
      dispatch(addToast({ type: 'warning', message: 'Discount price must be lower than standard price' }));
      return;
    }

    if (images.length === 0) {
      dispatch(addToast({ type: 'warning', message: 'Please add at least one product photo' }));
      return;
    }

    const specifications: Record<string, string> = {};
    for (const s of specs) {
      if (s.key.trim() && s.value.trim()) {
        specifications[s.key.trim()] = s.value.trim();
      }
    }

    const payload: ProductInputPayload = {
      name: name.trim(),
      brand: brand.trim(),
      category,
      description: description.trim(),
      shortDescription: shortDescription.trim() || undefined,
      price: Number(price),
      discountPrice: discountPrice !== '' ? Number(discountPrice) : undefined,
      stock: Number(stock || 0),
      lowStockThreshold: Number(lowStockThreshold || 3),
      sku: sku.trim() || undefined,
      images,
      specifications,
      status,
    };

    try {
      setIsSaving(true);
      if (isEditing && id) {
        await sellerService.updateProduct(id, payload);
        dispatch(addToast({ type: 'success', message: 'Product listing updated successfully' }));
      } else {
        await sellerService.createProduct(payload);
        dispatch(addToast({ type: 'success', message: 'New product listed in catalogue!' }));
      }
      navigate('/seller/products');
    } catch (err) {
      dispatch(addToast({ type: 'error', message: getErrorMessage(err, 'Failed to save product') }));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-line">
        <Link
          to="/seller/products"
          className="p-1.5 rounded-lg border border-line text-muted hover:text-ink hover:bg-canvas transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-normal text-ink">
            {isEditing ? 'Edit Product Listing' : 'Create New Product'}
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Configure specifications, pricing, imagery, and inventory levels
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info Card */}
        <div className="card p-6 sm:p-8 space-y-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-ink border-b border-line pb-2">
            1. General Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Product Title"
              required
              placeholder="e.g. Master Chronometer Heritage Automatic 40mm"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              label="Brand / Atelier Name"
              required
              placeholder="e.g. Atelier Aurelius"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-ink/80">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-line text-xs bg-surface"
              >
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-ink/80">Listing Visibility</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full h-11 px-3 rounded-xl border border-line text-xs bg-surface"
              >
                <option value="active">Active (Published to Catalog)</option>
                <option value="draft">Draft (Private to Seller)</option>
              </select>
            </div>
          </div>

          <Textarea
            label="Full Product Description *"
            rows={5}
            required
            placeholder="Detailed narrative regarding heritage, craftsmanship, materials, movement calibration, and aesthetics..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Pricing & Inventory */}
        <div className="card p-6 sm:p-8 space-y-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-ink border-b border-line pb-2">
            2. Pricing & Stock Control
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Regular Price (₹)"
              type="number"
              required
              min={1}
              placeholder="e.g. 14999"
              value={price}
              onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
            />
            <Input
              label="Discounted Price (₹, Optional)"
              type="number"
              min={1}
              placeholder="e.g. 12999"
              value={discountPrice}
              onChange={(e) =>
                setDiscountPrice(e.target.value === '' ? '' : Number(e.target.value))
              }
              helperText="Must be lower than regular price to render savings badge"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Stock Quantity"
              type="number"
              min={0}
              required
              value={stock}
              onChange={(e) => setStock(e.target.value === '' ? '' : Number(e.target.value))}
            />
            <Input
              label="Low Stock Warning Limit"
              type="number"
              min={1}
              value={lowStockThreshold}
              onChange={(e) =>
                setLowStockThreshold(e.target.value === '' ? '' : Number(e.target.value))
              }
            />
            <Input
              label="SKU / Stock ID (Optional)"
              placeholder="e.g. HOR-CHRONO-01"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
            />
          </div>
        </div>

        {/* Imagery */}
        <div className="card p-6 sm:p-8 space-y-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-ink border-b border-line pb-2">
            3. Product Imagery
          </h3>

          {/* Upload files */}
          <div className="p-6 rounded-2xl border-2 border-dashed border-line bg-canvas text-center space-y-3">
            <Upload className="h-8 w-8 text-accent mx-auto" />
            <div>
              <label
                htmlFor="photoUpload"
                className="text-xs font-semibold text-accent hover:underline cursor-pointer"
              >
                Choose image files to upload
              </label>
              <input
                id="photoUpload"
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <p className="text-[11px] text-muted mt-1">PNG, JPG or WebP up to 5MB</p>
            </div>
            {isUploading && (
              <div className="flex items-center justify-center gap-2 text-xs text-accent">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Uploading to store media server...</span>
              </div>
            )}
          </div>

          {/* Or add via URL */}
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="Or paste an image web URL..."
              value={manualImageUrl}
              onChange={(e) => setManualImageUrl(e.target.value)}
              className="flex-1 h-10 px-3 rounded-xl border border-line text-xs"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddManualImage}
              className="h-10 px-4"
            >
              Add URL
            </Button>
          </div>

          {/* Image preview grid */}
          {images.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 pt-2">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="relative aspect-square rounded-xl overflow-hidden border border-line bg-canvas group"
                >
                  <img src={img.url} alt={`Photo ${idx + 1}`} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 p-1 rounded-md bg-surface text-danger opacity-0 group-hover:opacity-100 transition-opacity shadow-xs"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                  {idx === 0 && (
                    <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-ink/80 text-surface text-[9px] uppercase font-semibold">
                      Cover
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Specifications Table Builder */}
        <div className="card p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between border-b border-line pb-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink">
              4. Technical Specifications
            </h3>
            <button
              type="button"
              onClick={handleAddSpecRow}
              className="text-xs text-accent hover:underline font-medium flex items-center gap-1 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" /> Add Attribute
            </button>
          </div>

          <div className="space-y-3">
            {specs.map((row, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Attribute (e.g. Case Diameter)"
                  value={row.key}
                  onChange={(e) => handleSpecChange(idx, 'key', e.target.value)}
                  className="w-1/3 h-10 px-3 rounded-xl border border-line text-xs"
                />
                <input
                  type="text"
                  placeholder="Value (e.g. 40mm, Sapphire Crystal)"
                  value={row.value}
                  onChange={(e) => handleSpecChange(idx, 'value', e.target.value)}
                  className="flex-1 h-10 px-3 rounded-xl border border-line text-xs"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveSpecRow(idx)}
                  className="p-2 text-muted hover:text-danger cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Action submit */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-line">
          <Link to="/seller/products">
            <Button type="button" variant="outline" size="md">
              Cancel
            </Button>
          </Link>
          <Button type="submit" variant="primary" size="md" isLoading={isSaving}>
            {isEditing ? 'Save Product Changes' : 'Publish Product to Catalog'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SellerProductEditorPage;
