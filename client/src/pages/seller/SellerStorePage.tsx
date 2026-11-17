import React, { useEffect, useState } from 'react';
import { sellerService } from '@/services/seller.service';
import type { Store } from '@/types';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import { useAppDispatch } from '@/hooks/store';
import { addToast } from '@/store/slices/uiSlice';
import { Store as StoreIcon, ShieldCheck } from 'lucide-react';
import { getErrorMessage } from '@/services/api';

export const SellerStorePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [store, setStore] = useState<Store | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [shippingPolicy, setShippingPolicy] = useState('');
  const [returnPolicy, setReturnPolicy] = useState('');

  useEffect(() => {
    async function loadStore() {
      try {
        setIsLoading(true);
        const myStore = await sellerService.getMyStore();
        setStore(myStore);
        setName(myStore.name);
        setTagline(myStore.tagline || '');
        setDescription(myStore.description || '');
        setEmail(myStore.email || '');
        setPhone(myStore.phone || '');
        setShippingPolicy(myStore.policies?.shipping || '');
        setReturnPolicy(myStore.policies?.returns || '');
      } catch {
        // store might not exist
      } finally {
        setIsLoading(false);
      }
    }
    loadStore();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsSaving(true);
      const updated = await sellerService.updateMyStore({
        name: name.trim(),
        tagline: tagline.trim() || undefined,
        description: description.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        policies: {
          shipping: shippingPolicy.trim() || undefined,
          returns: returnPolicy.trim() || undefined,
        },
      });
      setStore(updated);
      dispatch(addToast({ type: 'success', message: 'Store profile updated successfully' }));
    } catch (err) {
      dispatch(addToast({ type: 'error', message: getErrorMessage(err, 'Failed to update store') }));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="card p-8 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-44 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-line">
        <h1 className="text-xl font-normal text-ink">Store Profile & Policy Settings</h1>
        <p className="text-xs text-muted mt-0.5">
          Public storefront brand presentation seen by marketplace collectors
        </p>
      </div>

      <div className="card p-6 sm:p-8 space-y-6">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Store Brand Name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              label="Tagline"
              placeholder="e.g. Bespoke Horology & Fine Timepieces"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
            />
          </div>

          <Textarea
            label="Store Biography & Story"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-line">
            <Input
              label="Official Contact Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Contact Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="space-y-4 pt-2 border-t border-line">
            <Input
              label="Shipping Commitment"
              value={shippingPolicy}
              onChange={(e) => setShippingPolicy(e.target.value)}
            />
            <Input
              label="Return & Warranty Policy"
              value={returnPolicy}
              onChange={(e) => setReturnPolicy(e.target.value)}
            />
          </div>

          <div className="pt-4 border-t border-line flex justify-end">
            <Button type="submit" variant="primary" size="md" isLoading={isSaving}>
              Save Store Profile
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SellerStorePage;
