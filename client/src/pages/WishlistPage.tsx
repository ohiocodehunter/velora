import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/hooks/store';
import { fetchWishlist, removeWishlistItem } from '@/store/slices/wishlistSlice';
import { addToCart } from '@/store/slices/cartSlice';
import { addToast } from '@/store/slices/uiSlice';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';
import { formatCurrency } from '@/utils/format';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';

export const WishlistPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { items, isLoading } = useAppSelector((state) => state.wishlist);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, isAuthenticated]);

  const handleRemove = async (productId: string) => {
    try {
      await dispatch(removeWishlistItem(productId)).unwrap();
      dispatch(addToast({ type: 'success', message: 'Removed from your wishlist' }));
    } catch {
      dispatch(addToast({ type: 'error', message: 'Failed to remove item' }));
    }
  };

  const handleMoveToCart = async (product: (typeof items)[0]) => {
    try {
      await dispatch(addToCart({ productId: product._id, quantity: 1 })).unwrap();
      await dispatch(removeWishlistItem(product._id)).unwrap();
      dispatch(addToast({ type: 'success', message: `Moved "${product.name}" to cart` }));
    } catch (err: any) {
      dispatch(addToast({ type: 'error', message: err || 'Could not move to cart' }));
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="shell py-16">
        <Breadcrumbs items={[{ label: 'My Wishlist' }]} />
        <EmptyState
          icon={<Heart className="h-8 w-8" />}
          title="Sign in to view your wishlist"
          description="Save pieces you love to access them later across all your devices."
          actionLabel="Sign In Now"
          onAction={() => navigate('/login?redirect=/wishlist')}
          className="mt-6"
        />
      </div>
    );
  }

  return (
    <div className="shell py-8 sm:py-12 space-y-8">
      <Breadcrumbs items={[{ label: 'My Wishlist' }]} />

      <div className="border-b border-line pb-4">
        <h1 className="text-2xl sm:text-3xl font-normal text-ink">
          My Saved Wishlist <span className="text-sm text-muted">({items.length} items)</span>
        </h1>
        <p className="text-xs text-muted mt-1">
          Items saved for your private luxury curation.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-80 rounded-2xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Heart className="h-8 w-8" />}
          title="Your Wishlist is Empty"
          description="Explore our collections and tap the heart icon on any piece to save it here."
          actionLabel="Explore Collections"
          onAction={() => navigate('/shop')}
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((prod) => {
            const isOutOfStock = prod.stock <= 0;
            return (
              <div
                key={prod._id}
                className="group relative flex flex-col rounded-2xl border border-line bg-surface overflow-hidden shadow-xs hover:border-line-strong transition-all"
              >
                <Link to={`/product/${prod.slug}`} className="relative aspect-square bg-canvas">
                  <img
                    src={prod.images[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'}
                    alt={prod.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleRemove(prod._id);
                    }}
                    className="absolute top-3 right-3 h-8 w-8 rounded-full bg-surface/90 text-danger flex items-center justify-center hover:bg-surface shadow-xs transition-colors cursor-pointer"
                    aria-label="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </Link>

                <div className="p-4 flex flex-1 flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[11px] font-medium tracking-wider uppercase text-muted">
                      {prod.brand}
                    </span>
                    <Link
                      to={`/product/${prod.slug}`}
                      className="text-xs sm:text-sm font-medium text-ink hover:text-accent line-clamp-1 block mt-0.5"
                    >
                      {prod.name}
                    </Link>
                    <p className="text-sm font-semibold text-ink mt-2">
                      {formatCurrency(prod.finalPrice)}
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isOutOfStock}
                    onClick={() => handleMoveToCart(prod)}
                    className="w-full text-xs"
                  >
                    <ShoppingBag className="h-3.5 w-3.5 mr-1.5" />
                    {isOutOfStock ? 'Out of Stock' : 'Move to Cart'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
