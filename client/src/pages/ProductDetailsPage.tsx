import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productService } from '@/services/product.service';
import { reviewService, type ReviewPayload } from '@/services/review.service';
import type { Product, Review, Store } from '@/types';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import Rating from '@/components/ui/Rating';
import Button from '@/components/ui/Button';
import QuantityStepper from '@/components/common/QuantityStepper';
import ProductCard from '@/components/common/ProductCard';
import Modal from '@/components/ui/Modal';
import Skeleton from '@/components/ui/Skeleton';
import { formatCurrency, formatDate } from '@/utils/format';
import { useAppDispatch, useAppSelector } from '@/hooks/store';
import { addToCart } from '@/store/slices/cartSlice';
import { toggleWishlistItem } from '@/store/slices/wishlistSlice';
import { addToast } from '@/store/slices/uiSlice';
import {
  Heart,
  ShoppingBag,
  Truck,
  RotateCcw,
  ShieldCheck,
  Store as StoreIcon,
  Flag,
  CheckCircle2,
  AlertCircle,
  Share2,
} from 'lucide-react';
import { getErrorMessage } from '@/services/api';

export const ProductDetailsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const wishlistIds = useAppSelector((state) => state.wishlist.productIds);

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  // Review form state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewBody, setReviewBody] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Report modal state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!slug) return;
      try {
        setIsLoading(true);
        setSelectedImage(0);
        setQuantity(1);
        const prod = await productService.getProduct(slug);
        if (!prod) {
          setProduct(null);
          return;
        }
        setProduct(prod);

        // Preselect first variant option if available
        if (prod.variants && prod.variants.length > 0 && prod.variants[0]?.options?.length > 0) {
          const firstOpt = prod.variants[0].options[0];
          setSelectedVariant(`${prod.variants[0].name}: ${firstOpt.label}`);
        } else {
          setSelectedVariant('');
        }

        // Fetch related and reviews in parallel
        const [relatedRes, reviewsRes] = await Promise.allSettled([
          productService.getRelated(slug),
          reviewService.getProductReviews(prod._id, { limit: 10 }),
        ]);

        if (relatedRes.status === 'fulfilled' && Array.isArray(relatedRes.value)) {
          setRelated(relatedRes.value);
        } else {
          setRelated([]);
        }

        if (reviewsRes.status === 'fulfilled' && Array.isArray(reviewsRes.value?.reviews)) {
          setReviews(reviewsRes.value.reviews);
        } else {
          setReviews([]);
        }
      } catch {
        setProduct(null);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="shell py-12 space-y-8">
        <Skeleton className="h-6 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <Skeleton className="aspect-square rounded-3xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="shell py-20 text-center">
        <h2 className="text-2xl font-normal text-ink">Product Not Found</h2>
        <p className="text-xs text-muted mt-2">
          The requested product may have been archived or removed from the marketplace.
        </p>
        <Link to="/shop">
          <Button variant="primary" size="md" className="mt-6">
            Browse All Products
          </Button>
        </Link>
      </div>
    );
  }

  const isWishlisted = wishlistIds.includes(product._id);
  const isOutOfStock = product.stock <= 0;
  const store = typeof product.store === 'object' ? (product.store as Store) : null;
  const category = typeof product.category === 'object' ? product.category : null;

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      dispatch(addToast({ type: 'info', message: 'Please sign in to save items to your wishlist' }));
      navigate('/login');
      return;
    }
    try {
      await dispatch(toggleWishlistItem(product._id)).unwrap();
      dispatch(
        addToast({
          type: 'success',
          message: isWishlisted ? 'Removed from your wishlist' : 'Added to your wishlist',
        }),
      );
    } catch {
      dispatch(addToast({ type: 'error', message: 'Failed to update wishlist' }));
    }
  };

  const handleAddToCart = async () => {
    if (isOutOfStock) return;
    try {
      setIsAdding(true);
      await dispatch(
        addToCart({
          productId: product._id,
          quantity,
          variant: selectedVariant || undefined,
        }),
      ).unwrap();
      dispatch(addToast({ type: 'success', message: `Added ${quantity} item(s) to your cart` }));
    } catch (err: any) {
      dispatch(addToast({ type: 'error', message: err || 'Could not add to cart' }));
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (isOutOfStock) return;
    try {
      setIsAdding(true);
      await dispatch(
        addToCart({
          productId: product._id,
          quantity,
          variant: selectedVariant || undefined,
        }),
      ).unwrap();
      navigate('/checkout');
    } catch (err: any) {
      dispatch(addToast({ type: 'error', message: err || 'Could not proceed to checkout' }));
    } finally {
      setIsAdding(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewBody.trim() || reviewBody.trim().length < 10) {
      dispatch(addToast({ type: 'warning', message: 'Please write at least 10 characters' }));
      return;
    }
    try {
      setIsSubmittingReview(true);
      const newRev = await reviewService.createReview({
        productId: product._id,
        rating: reviewRating,
        title: reviewTitle.trim() || undefined,
        body: reviewBody.trim(),
      });
      setReviews([newRev, ...reviews]);
      setIsReviewModalOpen(false);
      setReviewTitle('');
      setReviewBody('');
      dispatch(addToast({ type: 'success', message: 'Thank you! Your review has been submitted.' }));
    } catch (err) {
      dispatch(addToast({ type: 'error', message: getErrorMessage(err, 'Failed to submit review') }));
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReason.trim()) return;
    try {
      setIsSubmittingReport(true);
      await productService.reportProduct(product._id, reportReason.trim());
      setIsReportModalOpen(false);
      setReportReason('');
      dispatch(
        addToast({
          type: 'success',
          message: 'Thank you. Our moderation team will investigate this listing.',
        }),
      );
    } catch (err) {
      dispatch(addToast({ type: 'error', message: getErrorMessage(err, 'Failed to report product') }));
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const images = product.images.length > 0 ? product.images : [{ url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800' }];

  const discountPercent =
    product.discountPrice && product.discountPrice < product.price
      ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
      : 0;

  return (
    <div className="shell py-8 sm:py-12 space-y-16">
      <Breadcrumbs
        items={[
          { label: 'Shop', href: '/shop' },
          ...(category ? [{ label: category.name, href: `/shop?category=${category.slug}` }] : []),
          { label: product.name },
        ]}
      />

      {/* Main Product Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        {/* Left: Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-square rounded-3xl overflow-hidden border border-line bg-surface shadow-soft">
            <img
              src={images[selectedImage]?.url}
              alt={product.name}
              className="h-full w-full object-cover object-center transition-all duration-300"
            />
            {discountPercent > 0 && (
              <span className="absolute top-4 left-4 px-3 py-1 rounded-lg bg-accent text-xs font-semibold text-surface">
                Save {discountPercent}%
              </span>
            )}
          </div>

          {/* Thumbnail list */}
          {images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`h-20 w-20 rounded-2xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                    selectedImage === idx ? 'border-ink shadow-xs' : 'border-line opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img.url} alt={`Preview ${idx + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Buy Box & Details */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-semibold tracking-wider uppercase text-muted">
                {product.brand}
              </span>
              <button
                onClick={handleWishlistToggle}
                className="p-2 rounded-full border border-line hover:border-line-strong hover:bg-canvas transition-colors"
                aria-label="Wishlist"
              >
                <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-danger text-danger' : 'text-ink'}`} />
              </button>
            </div>

            <h1 className="text-2xl sm:text-3xl font-normal text-ink leading-tight">{product.name}</h1>

            <div className="flex items-center gap-3 mt-3">
              <Rating value={product.ratingAverage} count={product.ratingCount} size="md" />
              <span className="text-muted text-xs">•</span>
              <a href="#reviews" className="text-xs text-accent hover:underline">
                {product.ratingCount} Customer Reviews
              </a>
            </div>
          </div>

          {/* Price Box */}
          <div className="p-5 rounded-2xl bg-surface border border-line space-y-1">
            <div className="flex items-baseline gap-3">
              <span className="text-2xl sm:text-3xl font-semibold text-ink">
                {formatCurrency(product.finalPrice)}
              </span>
              {product.discountPrice && product.discountPrice < product.price && (
                <span className="text-sm text-muted line-through">
                  {formatCurrency(product.price)}
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted">Inclusive of all taxes. Free shipping on this order.</p>
          </div>

          {/* Variants selector if available */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-4">
              {product.variants.map((v, idx) => (
                <div key={idx}>
                  <label className="block text-xs font-medium text-ink uppercase tracking-wider mb-2">
                    {v.name}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {v.options.map((opt) => {
                      const optValue = `${v.name}: ${opt.label}`;
                      const isSelected = selectedVariant === optValue;
                      return (
                        <button
                          key={opt.label}
                          type="button"
                          onClick={() => setSelectedVariant(optValue)}
                          className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                            isSelected
                              ? 'border-ink bg-ink text-surface'
                              : 'border-line bg-surface text-ink hover:bg-canvas'
                          }`}
                        >
                          {opt.label}
                          {opt.priceDelta !== 0 && (
                            <span className="ml-1 opacity-70">
                              ({opt.priceDelta > 0 ? '+' : ''}₹{opt.priceDelta})
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quantity and Action Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted">Quantity:</span>
                <QuantityStepper
                  value={quantity}
                  min={1}
                  max={Math.min(product.stock, 10)}
                  onChange={setQuantity}
                  disabled={isOutOfStock}
                />
              </div>
              <span className="text-xs text-muted">
                {isOutOfStock ? (
                  <span className="text-danger font-medium">Out of stock</span>
                ) : (
                  <span>{product.stock} units available</span>
                )}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                variant="outline"
                size="lg"
                className="flex-1"
                disabled={isOutOfStock}
                isLoading={isAdding}
                onClick={handleAddToCart}
              >
                <ShoppingBag className="h-4 w-4 mr-2" /> Add to Cart
              </Button>
              <Button
                variant="primary"
                size="lg"
                className="flex-1"
                disabled={isOutOfStock}
                isLoading={isAdding}
                onClick={handleBuyNow}
              >
                Buy Now
              </Button>
            </div>
          </div>

          {/* Verified Store Card */}
          {store && (
            <div className="p-4 rounded-2xl bg-canvas border border-line flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-surface border border-line flex items-center justify-center text-accent">
                  <StoreIcon className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-ink">{store.name}</span>
                    <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                  </div>
                  <p className="text-[11px] text-muted">Verified Independent Seller</p>
                </div>
              </div>
              <Link
                to={store.slug ? `/shop?store=${store.slug}` : `/shop`}
                className="text-xs font-medium text-accent hover:underline"
              >
                Visit Store →
              </Link>
            </div>
          )}

          {/* Delivery & Assurance Perks */}
          <div className="space-y-2.5 pt-4 border-t border-line text-xs text-muted">
            <div className="flex items-center gap-2.5">
              <Truck className="h-4 w-4 text-ink shrink-0" />
              <span>Complimentary insured shipping across India. Delivery in 3-5 business days.</span>
            </div>
            <div className="flex items-center gap-2.5">
              <RotateCcw className="h-4 w-4 text-ink shrink-0" />
              <span>7-day return window with doorstep reverse pickup.</span>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="h-4 w-4 text-ink shrink-0" />
              <span>Verified serial authentic certificate included with every luxury dispatch.</span>
            </div>
          </div>

          {/* Report listing */}
          <div className="pt-2">
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="text-[11px] text-muted hover:text-danger flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Flag className="h-3 w-3" />
              <span>Report an issue with this product listing</span>
            </button>
          </div>
        </div>
      </div>

      {/* Description & Specifications Tabs */}
      <div className="border-t border-line pt-12 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 space-y-4">
            <h2 className="text-xl font-normal text-ink">Product Overview</h2>
            <div className="text-sm text-ink/80 leading-relaxed whitespace-pre-line prose-body">
              {product.description}
            </div>
          </div>

          {/* Specifications Table */}
          {product.specifications && typeof product.specifications === 'object' && Object.keys(product.specifications).length > 0 && (
            <div className="lg:col-span-5 space-y-4">
              <h2 className="text-xl font-normal text-ink">Specifications</h2>
              <div className="card divide-y divide-line overflow-hidden">
                {Object.entries(product.specifications).map(([key, val]) => (
                  <div key={key} className="flex justify-between py-3 px-4 text-xs">
                    <span className="text-muted font-medium">{key}</span>
                    <span className="text-ink font-semibold">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Customer Reviews Section */}
      <section id="reviews" className="border-t border-line pt-12 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-normal text-ink">Customer Reviews</h2>
            <p className="text-xs text-muted mt-1">
              Verified evaluations from buyers who purchased this product.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (!isAuthenticated) {
                dispatch(addToast({ type: 'info', message: 'Please sign in to write a review' }));
                navigate('/login');
                return;
              }
              setIsReviewModalOpen(true);
            }}
          >
            Write a Review
          </Button>
        </div>

        {(!Array.isArray(reviews) || reviews.length === 0) ? (
          <div className="p-8 rounded-2xl bg-surface border border-line text-center text-xs text-muted">
            There are no reviews for this product yet. Be the first to share your experience!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((rev) => (
              <div key={rev._id} className="card p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Rating value={rev.rating} size="sm" />
                    {rev.isVerifiedPurchase && (
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-[#EEF3F0] text-success border border-[#D6E4DC]">
                        Verified Buyer
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-muted">{formatDate(rev.createdAt)}</span>
                </div>
                {rev.title && <h4 className="text-xs font-semibold text-ink">{rev.title}</h4>}
                <p className="text-xs text-ink/80 leading-relaxed">{rev.body}</p>
                <div className="pt-2 text-[11px] text-muted">
                  By {typeof rev.user === 'object' ? rev.user?.name : 'Verified Customer'}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Related Products Carousel/Grid */}
      {Array.isArray(related) && related.length > 0 && (
        <section className="border-t border-line pt-12">
          <div className="mb-8">
            <span className="eyebrow">Complementary Pieces</span>
            <h2 className="text-2xl font-normal text-ink mt-1">You May Also Like</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {related.slice(0, 4).map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Write Review Modal */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title="Write a Customer Review"
        description={`Share your thoughts on ${product.name}`}
      >
        <form onSubmit={handleSubmitReview} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Your Rating</label>
            <Rating value={reviewRating} size="lg" interactive onChange={setReviewRating} />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Headline (Optional)</label>
            <input
              type="text"
              value={reviewTitle}
              onChange={(e) => setReviewTitle(e.target.value)}
              placeholder="e.g. Exceptional craftsmanship and finish"
              className="w-full h-10 px-3 rounded-xl border border-line text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Detailed Review *</label>
            <textarea
              required
              rows={4}
              value={reviewBody}
              onChange={(e) => setReviewBody(e.target.value)}
              placeholder="What did you like or dislike about this product? How is the material quality?"
              className="w-full p-3 rounded-xl border border-line text-xs"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsReviewModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSubmittingReview}>
              Submit Review
            </Button>
          </div>
        </form>
      </Modal>

      {/* Report Product Modal */}
      <Modal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title="Report Product Listing"
        description="Help us maintain marketplace authenticity and trust"
      >
        <form onSubmit={handleSubmitReport} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-ink mb-1">
              Reason for reporting *
            </label>
            <textarea
              required
              rows={4}
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Describe the discrepancy, counterfeit concern, or policy violation..."
              className="w-full p-3 rounded-xl border border-line text-xs"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsReportModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="danger" size="sm" isLoading={isSubmittingReport}>
              Submit Report
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProductDetailsPage;
