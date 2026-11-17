import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/hooks/store';
import { sellerService } from '@/services/seller.service';
import { fetchCurrentUser } from '@/store/slices/authSlice';
import { addToast } from '@/store/slices/uiSlice';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import { Store, ShieldCheck, Award, Truck, CheckCircle2, ArrowRight } from 'lucide-react';
import { INDIAN_STATES } from '@/utils/constants';
import { getErrorMessage } from '@/services/api';

export const SellerRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const [storeName, setStoreName] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Maharashtra');
  const [pincode, setPincode] = useState('');
  const [shippingPolicy, setShippingPolicy] = useState('Dispatches within 24-48 business hours with tracked insured courier.');
  const [returnPolicy, setReturnPolicy] = useState('Complimentary 7-day hassle-free doorstep returns.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      dispatch(addToast({ type: 'info', message: 'Please sign in or create an account before applying' }));
      navigate('/login?redirect=/seller/register');
      return;
    }

    if (!storeName.trim() || !city.trim() || !pincode.trim()) {
      dispatch(addToast({ type: 'warning', message: 'Please complete all required store fields' }));
      return;
    }

    try {
      setIsSubmitting(true);
      await sellerService.applyForStore({
        name: storeName.trim(),
        tagline: tagline.trim() || undefined,
        description: description.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        address: {
          city: city.trim(),
          state,
          pincode: pincode.trim(),
          country: 'India',
        },
        policies: {
          shipping: shippingPolicy.trim() || undefined,
          returns: returnPolicy.trim() || undefined,
        },
      });

      await dispatch(fetchCurrentUser());
      dispatch(
        addToast({
          type: 'success',
          message: 'Seller application submitted! Our team will review your store credentials.',
        }),
      );
      navigate('/seller/dashboard');
    } catch (err) {
      dispatch(addToast({ type: 'error', message: getErrorMessage(err, 'Failed to submit seller application') }));
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
              <h2 className="text-xl font-normal text-ink">Store Application Form</h2>
              <p className="text-xs text-muted mt-1">
                Provide accurate business information for swift approval by our moderation team.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Section 1: Store Brand */}
              <div className="space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-ink border-b border-line pb-2">
                  1. Brand & Store Identity
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

              {/* Section 2: Contact & Base */}
              <div className="space-y-4 pt-4 border-t border-line">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-ink border-b border-line pb-2">
                  2. Business Contact & Dispatch Hub
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Official Business Email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Input
                    label="Business Phone"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Input
                    label="Hub City"
                    required
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
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                  />
                </div>
              </div>

              {/* Section 3: Policies */}
              <div className="space-y-4 pt-4 border-t border-line">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-ink border-b border-line pb-2">
                  3. Customer Assurances
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
                  Submit Application for Review <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
                <p className="text-[11px] text-muted text-center mt-2.5">
                  Applications are typically verified by our admin team within 24 hours.
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
