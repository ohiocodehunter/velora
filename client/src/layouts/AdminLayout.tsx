import React from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import {
  ShieldCheck,
  LayoutDashboard,
  Users,
  Store,
  Package,
  ShoppingBag,
  Layers,
  Tag,
  Image,
  Star,
  Mail,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/utils/cn';

export const AdminLayout: React.FC = () => {
  const navLinks = [
    { label: 'Platform Overview', href: '/admin/dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
    { label: 'Customer Accounts', href: '/admin/users', icon: <Users className="h-4 w-4" /> },
    { label: 'Seller Verification', href: '/admin/sellers', icon: <Store className="h-4 w-4" /> },
    { label: 'Product Catalog', href: '/admin/products', icon: <Package className="h-4 w-4" /> },
    { label: 'Marketplace Orders', href: '/admin/orders', icon: <ShoppingBag className="h-4 w-4" /> },
    { label: 'Categories', href: '/admin/categories', icon: <Layers className="h-4 w-4" /> },
    { label: 'Coupons & Promos', href: '/admin/coupons', icon: <Tag className="h-4 w-4" /> },
    { label: 'Platform Banners', href: '/admin/banners', icon: <Image className="h-4 w-4" /> },
    { label: 'Review Moderation', href: '/admin/reviews', icon: <Star className="h-4 w-4" /> },
    { label: 'Contact Inquiries', href: '/admin/messages', icon: <Mail className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen bg-canvas">
      {/* Top Admin Header */}
      <div className="bg-ink text-surface py-3.5 px-5 sm:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-display text-xl text-surface">VELORA</span>
            <span className="text-surface/40 text-xs">/</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-accent-soft flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-accent" />
              Admin Command Console
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <Link to="/" className="text-surface/70 hover:text-surface transition-colors">
              Return to Marketplace
            </Link>
          </div>
        </div>
      </div>

      <div className="shell py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Admin Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="card p-4 space-y-1 sticky top-20">
              <div className="px-3 py-2 mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
                Admin Controls
              </div>
              {navLinks.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  end={item.href === '/admin/dashboard'}
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

          {/* Admin Content Area */}
          <div className="lg:col-span-4">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
