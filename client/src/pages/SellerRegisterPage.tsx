import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/hooks/store';
import { authService } from '@/services/auth.service';
import { setUser } from '@/store/slices/authSlice';
import { fetchCart } from '@/store/slices/cartSlice';
import { fetchWishlist } from '@/store/slices/wishlistSlice';
import { addToast } from '@/store/slices/uiSlice';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import { Store, ShieldCheck, Award, CheckCircle2, ArrowRight, User, Mail, Lock, Phone } from 'lucide-react';
import { INDIAN_STATES } from '@/utils/constants';
import { getErrorMessage } from '@/services/api';

export const SellerRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  // Account details (for new sellers who aren't signed in yet)
  const [name, setName] = useState(user?.name || '');
  const [accountEmail, setAccountEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accountPhone, setAccountPhone] = useState(user?.phone || '');

  // Store identity details
  const [storeName, setStoreName] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [contactEmail, setContactEmail] = useState(user?.email || '');
  const [contactPhone, setContactPhone] = useState(user?.phone || '');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Maharashtra');
  const [pincode, setPincode] = useState('');
  const [shippingPolicy, setShippingPolicy] = useState(
    'Dispatches within 24-48 business hours with tracked insured courier.',
  );
  const [returnPolicy, setReturnPolicy] = useState('Complimentary 7-day hassle-free doorstep returns.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate account info if not logged in
    if (!isAuthenticated) {
      if (!name.trim()) {
        dispatch(addToast({ type: 'warning', message: 'Please enter your full name' }));
        return;
      }
      if (!accountEmail.trim()) {
        dispatch(addToast({ type: 'warning', message: 'Please enter your account email' }));
        return;
      }
      if (!password) {
        dispatch(addToast({ type: 'warning', message: 'Please create a password for your seller account' }));
        return;
      }
      if (password.length < 6) {
        dispatch(addToast({ type: 'warning', message: 'Password must be at least 6 characters' }));
        return;
      }
      if (password !== confirmPassword) {
        dispatch(addToast({ type: 'warning', message: 'Passwords do not match' }));
        return;
      }
    }

    // Validate store details
    if (!storeName.trim()) {
      dispatch(addToast({ type: 'warning', message: 'Please enter your store or brand name' }));
      return;
    }
    if (!city.trim()) {
      dispatch(addToast({ type: 'warning', message: 'Please enter your dispatch hub city' }));
      return;
    }
    if (!pincode.trim()) {
      dispatch(addToast({ type: 'warning', message: 'Please enter your dispatch pincode' }));
      return;
    }

    try {
      setIsSubmitting(true);
      const data = await authService.registerSeller({
        name: !isAuthenticated ? name.trim() : undefined,
        email: !isAuthenticated ? accountEmail.trim() : undefined,
        password: !isAuthenticated ? password : undefined,
        phone: (!isAuthenticated ? accountPhone.trim() : contactPhone.trim()) || undefined,
        storeName: storeName.trim(),
        tagline: tagline.trim() || undefined,
        description: description.trim() || undefined,
        city: city.trim(),
        state,
        pincode: pincode.trim(),
        shippingPolicy: shippingPolicy.trim() || undefined,
        returnPolicy: returnPolicy.trim() || undefined,
      });

      if (data?.user) {
        dispatch(setUser(data.user));
        dispatch(fetchCart());
        dispatch(fetchWishlist());
      }

      dispatch(
        addToast({
          type: 'success',
          message: `Welcome to VELORA Sellers! Your store "${storeName.trim()}" is now active.`,
        }),
      );
      navigate('/seller/dashboard');
    } catch (err) {
      dispatch(
        addToast({
          type: 'error',
          message: getErrorMessage(err, 'Failed to complete seller registration'),
        }),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="shell py-10 sm:py-16 space-y-12">
      <Breadcrumbs items={[{ label: 'Sell on VELORA' }]} />

      {/* Header Banner */}
      <div className="max-w-3xl space-y-4">
        <span className="eyebrow">Marketplace Partnership</span>
        <h1 className="text-3xl sm:text-5xl font-light text-ink leading-tight">
          Partner with VELORA. <br />
          <span className="font-normal italic">Reach discerning collectors.</span>
        </h1>
        <p className="text-xs sm:text-sm text-muted leading-relaxed max-w-2xl">
          Join India's premier multi-vendor destination for independent horologists, acoustic
          designers, leather ateliers, and bespoke creators. We manage payment escrow, high-intent
          customer reach, and platform marketing while you craft excellence.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Registration Form */}
        <div className="lg:col-span-8">
          <div className="card p-6 sm:p-10 space-y-8">
            <div>
              <h2 className="text-xl font-normal text-ink">Store Registration</h2>
              <p className="text-xs text-muted mt-1">
                Complete your seller registration to instantly launch your storefront and access the Seller Portal.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Account Details */}
              {isAuthenticated && user ? (
                <div className="p-4 rounded-2xl bg-canvas border border-line flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-surface border border-line flex items-center justify-center text-accent">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-ink">{user.name}</p>
                      <p className="text-[11px] text-muted">{user.email}</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-medium text-success flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Authenticated
                  </span>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-line pb-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-ink">
                      1. Seller Account Details
                    </h3>
                    <span className="text-xs text-muted">
                      Already registered?{' '}
                      <Link to="/login?redirect=/seller/register" className="text-accent hover:underline font-medium">
                        Sign In
                      </Link>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Full Name"
                      required
                      icon={<User className="h-4 w-4" />}
                      placeholder="e.g. Aarav Mehta"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                    <Input
                      label="Account Email"
                      type="email"
                      required
                      icon={<Mail className="h-4 w-4" />}
                      placeholder="you@domain.com"
                      value={accountEmail}
                      onChange={(e) => setAccountEmail(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Password"
                      type="password"
                      required
                      icon={<Lock className="h-4 w-4" />}
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <Input
                      label="Confirm Password"
                      type="password"
                      required
                      icon={<Lock className="h-4 w-4" />}
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>

                  <Input
                    label="Mobile Phone"
                    icon={<Phone className="h-4 w-4" />}
                    placeholder="10-digit mobile number"
                    value={accountPhone}
                    onChange={(e) => setAccountPhone(e.target.value)}
                  />
                </div>
              )}

              {/* Section 2: Store Identity */}
              <div className="space-y-4 pt-4 border-t border-line">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-ink border-b border-line pb-2">
                  {isAuthenticated ? '1. Store & Brand Identity' : '2. Store & Brand Identity'}
                </h3>
                <Input
                  label="Store / Brand Name"
                  required
                  placeholder="e.g. Atelier Aurelius, Horizon Soundworks"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                />
                <Input
                  label="Store Tagline"
                  placeholder="e.g. Hand-finished automatic movements & heirloom horology"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                />
                <Textarea
                  label="Brand Story & Overview"
                  rows={4}
                  placeholder="Tell our collectors about your heritage, crafting philosophy, and materials..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Section 3: Contact & Dispatch Hub */}
              <div className="space-y-4 pt-4 border-t border-line">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-ink border-b border-line pb-2">
                  {isAuthenticated ? '2. Dispatch Hub Location' : '3. Dispatch Hub Location'}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Input
                    label="Hub City"
                    required
                    placeholder="e.g. Mumbai, Jaipur, Bengaluru"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-ink/80">State *</label>
                    <select
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl border border-line text-xs bg-surface"
                    >
                      {INDIAN_STATES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Input
                    label="Dispatch Pincode"
                    required
                    maxLength={6}
                    placeholder="6-digit pincode"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                  />
                </div>
              </div>

              {/* Section 4: Policies */}
              <div className="space-y-4 pt-4 border-t border-line">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-ink border-b border-line pb-2">
                  {isAuthenticated ? '3. Customer Assurances' : '4. Customer Assurances'}
                </h3>
                <Input
                  label="Shipping Standard"
                  value={shippingPolicy}
                  onChange={(e) => setShippingPolicy(e.target.value)}
                />
                <Input
                  label="Return Policy"
                  value={returnPolicy}
                  onChange={(e) => setReturnPolicy(e.target.value)}
                />
              </div>

              <div className="pt-4">
                <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={isSubmitting}>
                  Register Store & Open Seller Portal <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
                <p className="text-[11px] text-muted text-center mt-2.5">
                  By registering, you agree to VELORA's Seller Code of Conduct, Authenticity Guarantee, and Escrow Terms.
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* Benefits Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="card p-6 space-y-5 bg-canvas border-line">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-ink">
              Why Partner with VELORA?
            </h3>
            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <Award className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-ink">Curated Audience</h4>
                  <p className="text-muted mt-0.5">
                    Connect directly with collectors looking for authenticity rather than mass-market discounts.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-ink">Guaranteed Payouts</h4>
                  <p className="text-muted mt-0.5">
                    Direct automated settlement to your bank account upon delivery verification.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Store className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-ink">Boutique Storefront</h4>
                  <p className="text-muted mt-0.5">
                    Your own dedicated brand URL, custom banner, and catalog showcase on VELORA.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerRegisterPage;
