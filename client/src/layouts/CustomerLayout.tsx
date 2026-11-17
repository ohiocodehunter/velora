import React from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { useAppSelector } from '@/hooks/store';
import { User, Package, Heart, MapPin, Settings, Store, LogOut } from 'lucide-react';
import { cn } from '@/utils/cn';

export const CustomerLayout: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);

  const navItems = [
    { label: 'Profile Overview', href: '/profile', icon: <User className="h-4 w-4" /> },
    { label: 'My Orders', href: '/orders', icon: <Package className="h-4 w-4" /> },
    { label: 'My Wishlist', href: '/wishlist', icon: <Heart className="h-4 w-4" /> },
    { label: 'Saved Addresses', href: '/addresses', icon: <MapPin className="h-4 w-4" /> },
  ];

  return (
    <div className="shell py-8 sm:py-12">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-normal text-ink">My Account</h1>
        <p className="text-xs text-muted mt-1">Manage your profile, orders, addresses, and wishlist</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Nav */}
        <div className="lg:col-span-1">
          <div className="card p-5 space-y-6 sticky top-28">
            {/* User Card */}
            <div className="flex items-center gap-3.5 pb-5 border-b border-line">
              {user?.avatar?.url ? (
                <img
                  src={user.avatar.url}
                  alt={user.name}
                  className="h-12 w-12 rounded-full object-cover border border-line"
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-accent text-surface text-base font-semibold flex items-center justify-center uppercase">
                  {user?.name?.charAt(0) || 'U'}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink truncate">{user?.name}</p>
                <p className="text-xs text-muted truncate">{user?.email}</p>
                <span className="inline-block mt-1 text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-canvas border border-line text-ink">
                  {user?.role}
                </span>
              </div>
            </div>

            {/* Navigation links */}
            <nav className="space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  end={item.href === '/profile'}
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

              {user?.role === 'customer' && (
                <Link
                  to="/seller/register"
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-accent-strong hover:bg-accent-soft/40 transition-colors mt-3"
                >
                  <Store className="h-4 w-4 text-accent" />
                  <span>Become a Seller</span>
                </Link>
              )}
            </nav>
          </div>
        </div>

        {/* Content Outlet */}
        <div className="lg:col-span-3">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default CustomerLayout;
