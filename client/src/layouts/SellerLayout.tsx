import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/hooks/store';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  ShoppingBag,
  Boxes,
  Star,
  Store as StoreIcon,
  ChevronRight,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';
import { sellerService } from '@/services/seller.service';
import type { Store } from '@/types';
import { cn } from '@/utils/cn';

export const SellerLayout: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const [store, setStore] = useState<Store | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStore() {
      try {
        const myStore = await sellerService.getMyStore();
        setStore(myStore);
      } catch {
        // store might not exist or be pending
      } finally {
        setIsLoading(false);
      }
    }
    loadStore();
  }, []);

  const navLinks = [
    { label: 'Overview', href: '/seller/dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
    { label: 'Products', href: '/seller/products', icon: <Package className="h-4 w-4" /> },
    { label: 'Add New Product', href: '/seller/products/new', icon: <PlusCircle className="h-4 w-4" /> },
    { label: 'Orders & Fulfillment', href: '/seller/orders', icon: <ShoppingBag className="h-4 w-4" /> },
    { label: 'Inventory Manager', href: '/seller/inventory', icon: <Boxes className="h-4 w-4" /> },
    { label: 'Customer Reviews', href: '/seller/reviews', icon: <Star className="h-4 w-4" /> },
    { label: 'Store Settings', href: '/seller/store', icon: <StoreIcon className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen bg-canvas">
      {/* Top Seller Bar */}
      <div className="bg-surface border-b border-line py-3 px-5 sm:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-display text-xl text-ink">VELORA</span>
            <span className="text-muted text-xs">/</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-accent-strong">
              Seller Portal
            </span>
            {store && (
              <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-md bg-canvas border border-line text-xs font-medium text-ink">
                {store.name}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 text-xs">
            {store?.slug && (
              <Link
                to={`/shop?seller=${user?._id}`}
                target="_blank"
                className="text-muted hover:text-ink flex items-center gap-1 transition-colors"
              >
                <span>View Public Storefront</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            )}
            <Link to="/" className="text-muted hover:text-ink transition-colors">
              Back to Marketplace
            </Link>
          </div>
        </div>
      </div>

      <div className="shell py-8">
        {/* Status notice if suspended or pending */}
        {store && store.status !== 'approved' && (
          <div className="mb-6 p-4 rounded-xl border border-[#EBDCC0] bg-[#FAF3E6] flex items-center gap-3 text-xs text-[#8a6d3b]">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">Store Status: {store.status.toUpperCase()}</p>
              <p className="mt-0.5">
                {store.status === 'pending'
                  ? 'Your seller store application is currently undergoing verification by the VELORA moderation team.'
                  : `Your store is currently ${store.status}. ${store.rejectionReason || 'Please contact marketplace admin for details.'}`}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-4 space-y-1 sticky top-20">
              <div className="px-3 py-2 mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
                Seller Navigation
              </div>
              {navLinks.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  end={item.href === '/seller/dashboard'}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors',
                      isActive
                        ? 'bg-ink text-surface'
                        : 'text-ink/80 hover:bg-canvas hover:text-ink',
                    )
                  }
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>

          {/* Main Seller Workspace */}
          <div className="lg:col-span-4">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerLayout;
