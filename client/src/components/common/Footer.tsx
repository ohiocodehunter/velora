import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { miscService } from '@/services/misc.service';
import { useAppDispatch } from '@/hooks/store';
import { addToast } from '@/store/slices/uiSlice';
import { ShieldCheck, Truck, RotateCcw, CreditCard, ArrowRight, Loader2 } from 'lucide-react';
import { getErrorMessage } from '@/services/api';

export const Footer: React.FC = () => {
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await miscService.subscribeNewsletter(email.trim());
      dispatch(
        addToast({
          type: 'success',
          message: res.message || 'Thank you for subscribing to VELORA updates!',
        }),
      );
      setEmail('');
    } catch (err) {
      dispatch(
        addToast({
          type: 'error',
          message: getErrorMessage(err, 'Failed to subscribe. Please try again.'),
        }),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="border-t border-line bg-canvas mt-20">
      {/* Guarantees Strip */}
      <div className="border-b border-line bg-surface/60 py-8">
        <div className="shell grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-accent-soft text-accent flex items-center justify-center shrink-0">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-ink">Free Express Delivery</h4>
              <p className="text-xs text-muted mt-0.5">On all qualified orders above ₹999</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-accent-soft text-accent flex items-center justify-center shrink-0">
              <RotateCcw className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-ink">7-Day Easy Returns</h4>
              <p className="text-xs text-muted mt-0.5">Hassle-free direct reverse pick-up</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-accent-soft text-accent flex items-center justify-center shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-ink">Verified Sellers</h4>
              <p className="text-xs text-muted mt-0.5">100% genuine and curated merchandise</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-accent-soft text-accent flex items-center justify-center shrink-0">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-ink">Secure Checkout</h4>
              <p className="text-xs text-muted mt-0.5">Razorpay UPI, Cards & Cash on Delivery</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="shell py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-block">
              <span className="font-display text-2xl font-normal tracking-tight text-ink">
                VELORA
              </span>
            </Link>
            <p className="text-xs text-muted max-w-sm leading-relaxed">
              Discover More. Shop Smarter. VELORA is a premier multi-vendor marketplace connecting
              discerning shoppers with verified independent craftsmen, boutiques, and heritage brands.
            </p>
            <div className="pt-2">
              <p className="text-xs font-medium text-ink mb-2">Subscribe to private previews & updates</p>
              <form onSubmit={handleSubscribe} className="flex max-w-md gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="h-10 px-3.5 flex-1 rounded-xl border border-line bg-surface text-xs text-ink placeholder:text-muted/60 focus:outline-none focus:border-accent"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-10 px-4 rounded-xl bg-ink text-surface text-xs font-medium hover:bg-ink/90 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <span>Join</span>}
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>
          </div>

          {/* Column 1: Shop */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-ink mb-3.5">
              Shop Collections
            </h4>
            <ul className="space-y-2 text-xs text-muted">
              <li>
                <Link to="/shop" className="hover:text-ink transition-colors">
                  All Catalog
                </Link>
              </li>
              <li>
                <Link to="/categories" className="hover:text-ink transition-colors">
                  Category Index
                </Link>
              </li>
              <li>
                <Link to="/shop?sort=-createdAt" className="hover:text-ink transition-colors">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link to="/shop?featured=true" className="hover:text-ink transition-colors">
                  Curated Featured
                </Link>
              </li>
              <li>
                <Link to="/shop?sort=-soldCount" className="hover:text-ink transition-colors">
                  Best Sellers
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Assistance */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-ink mb-3.5">
              Customer Care
            </h4>
            <ul className="space-y-2 text-xs text-muted">
              <li>
                <Link to="/orders" className="hover:text-ink transition-colors">
                  My Orders
                </Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-ink transition-colors">
                  Track Delivery
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-ink transition-colors">
                  Help & FAQs
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-ink transition-colors">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-ink transition-colors">
                  About VELORA
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Sellers & Partners */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-ink mb-3.5">
              Marketplace
            </h4>
            <ul className="space-y-2 text-xs text-muted">
              <li>
                <Link to="/seller/register" className="hover:text-ink transition-colors">
                  Become a Seller
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-ink transition-colors">
                  Seller Portal Login
                </Link>
              </li>
              <li>
                <Link to="/contact?topic=partner" className="hover:text-ink transition-colors">
                  Brand Partnerships
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-ink transition-colors">
                  Admin Console
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-line mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted">
          <p>© {new Date().getFullYear()} VELORA Marketplace Ltd. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Cookie Settings</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
