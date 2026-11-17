import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/hooks/store';
import { logoutUser } from '@/store/slices/authSlice';
import { toggleMobileMenu, setMobileMenuOpen } from '@/store/slices/uiSlice';
import {
  Search,
  ShoppingBag,
  Heart,
  User as UserIcon,
  Menu,
  X,
  ChevronDown,
  LayoutDashboard,
  Store as StoreIcon,
  ShieldCheck,
  Package,
  MapPin,
  LogOut,
} from 'lucide-react';
import { productService } from '@/services/product.service';
import type { Product } from '@/types';
import { formatCurrency } from '@/utils/format';
import { SHIPPING_NOTE } from '@/utils/constants';

export const Header: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const cart = useAppSelector((state) => state.cart.cart);
  const wishlistIds = useAppSelector((state) => state.wishlist.productIds);
  const isMobileMenuOpen = useAppSelector((state) => state.ui.isMobileMenuOpen);

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Live search suggestions debounce
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const { products } = await productService.listProducts({
          q: searchQuery.trim(),
          limit: 5,
        });
        setSuggestions(products);
        setShowDropdown(true);
      } catch {
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside to close menus
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setShowDropdown(false);
    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleLogout = async () => {
    setIsUserMenuOpen(false);
    await dispatch(logoutUser());
    navigate('/');
  };

  const cartCount = cart?.itemCount ?? 0;
  const wishlistCount = wishlistIds.length;

  return (
    <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-line">
      {/* Top Announcement Bar */}
      <div className="bg-ink text-surface text-[12px] py-2 px-4 text-center font-medium tracking-wide">
        <span className="opacity-90">{SHIPPING_NOTE}</span>
        <span className="mx-2 opacity-40">|</span>
        <span className="text-accent-soft">Multi-Vendor Verified Sellers</span>
      </div>

      <div className="shell py-3.5 sm:py-4">
        <div className="flex items-center justify-between gap-4 sm:gap-8">
          {/* Mobile menu trigger */}
          <button
            onClick={() => dispatch(toggleMobileMenu())}
            className="lg:hidden p-2 text-ink hover:text-accent rounded-lg"
            aria-label="Toggle navigation"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-decoration-none">
            <span className="font-display text-2xl sm:text-3xl font-normal tracking-tight text-ink">
              VELORA
            </span>
          </Link>

          {/* Search Bar (Desktop) */}
          <div ref={searchContainerRef} className="hidden md:block flex-1 max-w-lg relative">
            <form onSubmit={handleSearchSubmit}>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search watches, audio, leather, apparel..."
                  className="w-full h-10.5 pl-10 pr-4 rounded-full border border-line bg-canvas/70 text-xs text-ink placeholder:text-muted/60 focus:bg-surface focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15 transition-all"
                />
                <Search className="absolute left-3.5 h-4 w-4 text-muted pointer-events-none" />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setShowDropdown(false);
                    }}
                    className="absolute right-3 text-muted hover:text-ink text-xs"
                  >
                    Clear
                  </button>
                )}
              </div>
            </form>

            {/* Instant Search Suggestions Dropdown */}
            {showDropdown && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-surface rounded-2xl border border-line shadow-lift p-2 z-50 animate-rise">
                <div className="text-[11px] font-medium text-muted uppercase tracking-wider px-3 py-1.5 border-b border-line">
                  Suggested Products
                </div>
                <div className="divide-y divide-line/40">
                  {suggestions.map((p) => (
                    <Link
                      key={p._id}
                      to={`/product/${p.slug}`}
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-3 p-2 hover:bg-canvas rounded-xl transition-colors"
                    >
                      <img
                        src={p.images[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                        alt={p.name}
                        className="h-10 w-10 object-cover rounded-lg bg-canvas shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-ink truncate">{p.name}</p>
                        <p className="text-[11px] text-muted">{p.brand}</p>
                      </div>
                      <span className="text-xs font-medium text-ink">
                        {formatCurrency(p.finalPrice)}
                      </span>
                    </Link>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleSearchSubmit}
                  className="w-full mt-2 py-2 text-center text-xs text-accent font-medium hover:underline block cursor-pointer"
                >
                  View all results for "{searchQuery}" →
                </button>
              </div>
            )}
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3.5">
            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="relative p-2.5 rounded-full text-ink hover:bg-canvas transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 h-4 min-w-4 px-1 rounded-full bg-accent text-[10px] font-bold text-surface flex items-center justify-center leading-none">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Shopping Cart */}
            <Link
              to="/cart"
              className="relative p-2.5 rounded-full text-ink hover:bg-canvas transition-colors"
              aria-label="Cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 h-4 min-w-4 px-1 rounded-full bg-ink text-[10px] font-bold text-surface flex items-center justify-center leading-none">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Profile / Menu */}
            <div ref={userMenuRef} className="relative">
              {isAuthenticated && user ? (
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-full border border-line hover:border-line-strong hover:bg-canvas transition-colors cursor-pointer"
                  aria-expanded={isUserMenuOpen}
                >
                  {user.avatar?.url ? (
                    <img
                      src={user.avatar.url}
                      alt={user.name}
                      className="h-7 w-7 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="h-7 w-7 rounded-full bg-accent text-surface text-xs font-semibold flex items-center justify-center uppercase shrink-0">
                      {user.name.charAt(0)}
                    </div>
                  )}
                  <span className="hidden sm:inline-block text-xs font-medium text-ink max-w-[100px] truncate">
                    {user.name}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted hidden sm:block" />
                </button>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-line text-xs font-medium text-ink hover:border-ink hover:bg-canvas transition-colors"
                >
                  <UserIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign In</span>
                </Link>
              )}

              {/* Account Dropdown Menu */}
              {isUserMenuOpen && user && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-surface border border-line shadow-lift p-2 z-50 animate-rise">
                  <div className="px-3 py-2 border-b border-line">
                    <p className="text-xs font-medium text-ink truncate">{user.name}</p>
                    <p className="text-[11px] text-muted truncate">{user.email}</p>
                    <span className="inline-block mt-1 text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-md bg-canvas border border-line text-ink">
                      {user.role}
                    </span>
                  </div>

                  <div className="py-1 text-xs">
                    <Link
                      to="/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-ink hover:bg-canvas rounded-xl transition-colors"
                    >
                      <UserIcon className="h-4 w-4 text-muted" />
                      Customer Profile
                    </Link>
                    <Link
                      to="/orders"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-ink hover:bg-canvas rounded-xl transition-colors"
                    >
                      <Package className="h-4 w-4 text-muted" />
                      My Orders
                    </Link>
                    <Link
                      to="/addresses"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-ink hover:bg-canvas rounded-xl transition-colors"
                    >
                      <MapPin className="h-4 w-4 text-muted" />
                      Saved Addresses
                    </Link>

                    {/* Role Specific Shortcuts */}
                    {user.role === 'seller' && (
                      <Link
                        to="/seller/dashboard"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-accent-strong font-medium hover:bg-accent-soft/50 rounded-xl transition-colors mt-1"
                      >
                        <StoreIcon className="h-4 w-4 text-accent" />
                        Seller Dashboard
                      </Link>
                    )}

                    {user.role === 'customer' && (
                      <Link
                        to="/seller/register"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-accent-strong font-medium hover:bg-accent-soft/50 rounded-xl transition-colors mt-1"
                      >
                        <StoreIcon className="h-4 w-4 text-accent" />
                        Become a Seller
                      </Link>
                    )}

                    {user.role === 'admin' && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-ink font-semibold hover:bg-line/40 rounded-xl transition-colors mt-1"
                      >
                        <ShieldCheck className="h-4 w-4 text-ink" />
                        Admin Dashboard
                      </Link>
                    )}
                  </div>

                  <div className="border-t border-line pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-danger hover:bg-danger/5 rounded-xl transition-colors text-left cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Categories Navbar */}
        <nav className="hidden lg:flex items-center justify-between pt-3.5 border-t border-line/50 mt-3 text-xs font-medium text-ink/80">
          <div className="flex items-center gap-7">
            <Link to="/shop" className="hover:text-accent transition-colors">
              All Products
            </Link>
            <Link to="/categories" className="hover:text-accent transition-colors">
              Categories
            </Link>
            <Link to="/shop?category=watches" className="hover:text-accent transition-colors">
              Watches & Horology
            </Link>
            <Link to="/shop?category=audio" className="hover:text-accent transition-colors">
              Hi-Fi Audio
            </Link>
            <Link to="/shop?category=leather-goods" className="hover:text-accent transition-colors">
              Leather Goods
            </Link>
            <Link to="/shop?category=home-decor" className="hover:text-accent transition-colors">
              Home & Objects
            </Link>
            <Link to="/shop?featured=true" className="text-accent hover:text-accent-strong transition-colors">
              Featured Curation
            </Link>
          </div>
          <div className="flex items-center gap-5 text-muted">
            <Link to="/about" className="hover:text-ink transition-colors">
              Our Story
            </Link>
            <Link to="/contact" className="hover:text-ink transition-colors">
              Help & Support
            </Link>
          </div>
        </nav>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-line bg-surface p-5 space-y-4 animate-fade-in shadow-lift">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full h-10 pl-9 pr-3 rounded-xl border border-line text-xs bg-canvas text-ink"
            />
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted" />
          </form>

          <div className="flex flex-col gap-2.5 text-sm font-medium text-ink">
            <Link
              to="/shop"
              onClick={() => dispatch(setMobileMenuOpen(false))}
              className="py-1.5 hover:text-accent"
            >
              Shop All Products
            </Link>
            <Link
              to="/categories"
              onClick={() => dispatch(setMobileMenuOpen(false))}
              className="py-1.5 hover:text-accent"
            >
              Explore Categories
            </Link>
            <Link
              to="/wishlist"
              onClick={() => dispatch(setMobileMenuOpen(false))}
              className="py-1.5 flex justify-between items-center"
            >
              <span>Wishlist</span>
              <span className="text-xs text-muted">({wishlistCount})</span>
            </Link>
            <Link
              to="/cart"
              onClick={() => dispatch(setMobileMenuOpen(false))}
              className="py-1.5 flex justify-between items-center"
            >
              <span>Cart</span>
              <span className="text-xs text-muted">({cartCount})</span>
            </Link>
            <div className="border-t border-line pt-2">
              <Link
                to="/about"
                onClick={() => dispatch(setMobileMenuOpen(false))}
                className="block py-1.5 text-xs text-muted"
              >
                About Velora
              </Link>
              <Link
                to="/contact"
                onClick={() => dispatch(setMobileMenuOpen(false))}
                className="block py-1.5 text-xs text-muted"
              >
                Contact & Support
              </Link>
              <Link
                to="/faq"
                onClick={() => dispatch(setMobileMenuOpen(false))}
                className="block py-1.5 text-xs text-muted"
              >
                FAQ
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
