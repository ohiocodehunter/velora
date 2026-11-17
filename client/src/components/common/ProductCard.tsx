import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Product } from '@/types';
import { formatCurrency } from '@/utils/format';
import { Rating } from '@/components/ui/Rating';
import { useAppDispatch, useAppSelector } from '@/hooks/store';
import { addToCart } from '@/store/slices/cartSlice';
import { toggleWishlistItem } from '@/store/slices/wishlistSlice';
import { addToast } from '@/store/slices/uiSlice';
import { Heart, ShoppingBag, Check, Eye } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface ProductCardProps {
  product: Product;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, className }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const wishlistIds = useAppSelector((state) => state.wishlist.productIds);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const isWishlisted = wishlistIds.includes(product._id);
  const hasVariants = product.variants && product.variants.length > 0;
  const isOutOfStock = product.stock <= 0;

  const primaryImage =
    product.images[0]?.url ||
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';
  const secondaryImage = product.images[1]?.url || primaryImage;

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

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

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (hasVariants) {
      navigate(`/product/${product.slug}`);
      return;
    }

    if (isOutOfStock) return;

    try {
      setIsAdding(true);
      await dispatch(addToCart({ productId: product._id, quantity: 1 })).unwrap();
      setJustAdded(true);
      dispatch(addToast({ type: 'success', message: `Added "${product.name}" to cart` }));
      setTimeout(() => setJustAdded(false), 2000);
    } catch (err: any) {
      dispatch(addToast({ type: 'error', message: err || 'Could not add to cart' }));
    } finally {
      setIsAdding(false);
    }
  };

  const discountPercent =
    product.discountPrice && product.discountPrice < product.price
      ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
      : 0;

  return (
    <div
      className={cn(
        'group relative flex flex-col rounded-2xl border border-line bg-surface overflow-hidden transition-all duration-300 hover:shadow-soft hover:border-line-strong',
        className,
      )}
    >
      {/* Product Image Area */}
      <Link to={`/product/${product.slug}`} className="relative block aspect-square overflow-hidden bg-canvas">
        <img
          src={primaryImage}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover object-center transition-all duration-500 group-hover:scale-105 group-hover:opacity-0"
        />
        <img
          src={secondaryImage}
          alt={`${product.name} preview`}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover object-center opacity-0 transition-all duration-500 group-hover:scale-105 group-hover:opacity-100"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
          {discountPercent > 0 && (
            <span className="px-2 py-0.5 rounded-md bg-accent text-[11px] font-semibold text-surface tracking-wide">
              -{discountPercent}%
            </span>
          )}
          {product.isFeatured && (
            <span className="px-2 py-0.5 rounded-md bg-ink text-[11px] font-medium text-surface tracking-wide">
              Featured
            </span>
          )}
          {isOutOfStock && (
            <span className="px-2 py-0.5 rounded-md bg-muted text-[11px] font-medium text-surface">
              Out of stock
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          className={cn(
            'absolute top-3 right-3 h-8.5 w-8.5 rounded-full flex items-center justify-center transition-all duration-200 z-10 cursor-pointer shadow-xs',
            isWishlisted
              ? 'bg-surface text-danger'
              : 'bg-surface/90 text-ink/70 hover:text-danger hover:bg-surface',
          )}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={cn('h-4 w-4', isWishlisted && 'fill-danger')} />
        </button>

        {/* Quick View / Add to Cart Overlay on Desktop Hover */}
        <div className="absolute bottom-3 inset-x-3 hidden sm:flex items-center gap-2 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-200 z-10">
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAdding}
            className={cn(
              'flex-1 h-9.5 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer',
              justAdded
                ? 'bg-success text-surface'
                : 'bg-surface text-ink hover:bg-ink hover:text-surface',
            )}
          >
            {justAdded ? (
              <>
                <Check className="h-3.5 w-3.5" /> Added
              </>
            ) : hasVariants ? (
              <>
                <Eye className="h-3.5 w-3.5" /> Select Options
              </>
            ) : (
              <>
                <ShoppingBag className="h-3.5 w-3.5" /> Add to Cart
              </>
            )}
          </button>
        </div>
      </Link>

      {/* Product Information */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-[11px] font-medium tracking-wider uppercase text-muted truncate">
            {product.brand}
          </span>
          <Rating value={product.ratingAverage} count={product.ratingCount} size="sm" />
        </div>

        <Link
          to={`/product/${product.slug}`}
          className="text-xs sm:text-sm font-medium text-ink hover:text-accent transition-colors line-clamp-2 leading-snug mb-3 flex-1"
        >
          {product.name}
        </Link>

        {/* Price & Actions */}
        <div className="flex items-baseline justify-between gap-2 pt-2 border-t border-line/60">
          <div className="flex items-baseline gap-2">
            <span className="text-sm sm:text-base font-semibold text-ink">
              {formatCurrency(product.finalPrice)}
            </span>
            {product.discountPrice && product.discountPrice < product.price && (
              <span className="text-xs text-muted line-through">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>

          {/* Mobile Quick Add */}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAdding}
            className="sm:hidden h-8 w-8 rounded-lg bg-canvas border border-line flex items-center justify-center text-ink active:scale-95"
            aria-label="Add to cart"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
