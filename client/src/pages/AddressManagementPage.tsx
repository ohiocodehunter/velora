import React, { useEffect, useState } from 'react';
import { addressService, type AddressPayload } from '@/services/address.service';
import type { Address } from '@/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import { useAppDispatch } from '@/hooks/store';
import { addToast } from '@/store/slices/uiSlice';
import { MapPin, Plus, Edit2, Trash2, CheckCircle2 } from 'lucide-react';
import { INDIAN_STATES } from '@/utils/constants';
import { getErrorMessage } from '@/services/api';

export const AddressManagementPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Address Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState<AddressPayload>({
    label: 'Home',
    fullName: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: 'Maharashtra',
    pincode: '',
    country: 'India',
    isDefault: false,
  });
  const [isSaving, setIsSaving] = useState(false);

  // Delete Confirm State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<Address | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadAddresses();
  }, []);

  async function loadAddresses() {
    try {
      setIsLoading(true);
      const data = await addressService.getAddresses();
      setAddresses(data);
    } catch {
      setAddresses([]);
    } finally {
      setIsLoading(false);
    }
  }

  const openCreateModal = () => {
    setEditingAddress(null);
    setFormData({
      label: 'Home',
      fullName: '',
      phone: '',
      line1: '',
      line2: '',
      city: '',
      state: 'Maharashtra',
      pincode: '',
      country: 'India',
      isDefault: addresses.length === 0,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (addr: Address) => {
    setEditingAddress(addr);
    setFormData({
      label: addr.label,
      fullName: addr.fullName,
      phone: addr.phone,
      line1: addr.line1,
      line2: addr.line2 || '',
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      country: addr.country,
      isDefault: addr.isDefault,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.line1 || !formData.city || !formData.pincode) {
      dispatch(addToast({ type: 'warning', message: 'Please complete all required address fields' }));
      return;
    }

    try {
      setIsSaving(true);
      if (editingAddress) {
        const updated = await addressService.updateAddress(editingAddress._id, formData);
        setAddresses(addresses.map((a) => (a._id === updated._id ? updated : a)));
        dispatch(addToast({ type: 'success', message: 'Address updated' }));
      } else {
        const created = await addressService.createAddress(formData);
        setAddresses([...addresses, created]);
        dispatch(addToast({ type: 'success', message: 'New address saved' }));
      }
      setIsModalOpen(false);
    } catch (err) {
      dispatch(addToast({ type: 'error', message: getErrorMessage(err, 'Failed to save address') }));
    } finally {
      setIsSaving(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await addressService.setDefaultAddress(id);
      setAddresses(addresses.map((a) => ({ ...a, isDefault: a._id === id })));
      dispatch(addToast({ type: 'success', message: 'Default delivery address updated' }));
    } catch (err) {
      dispatch(addToast({ type: 'error', message: getErrorMessage(err, 'Failed to set default') }));
    }
  };

  const handleDelete = async () => {
    if (!addressToDelete) return;
    try {
      setIsDeleting(true);
      await addressService.deleteAddress(addressToDelete._id);
      setAddresses(addresses.filter((a) => a._id !== addressToDelete._id));
      dispatch(addToast({ type: 'success', message: 'Address removed' }));
      setDeleteConfirmOpen(false);
    } catch (err) {
      dispatch(addToast({ type: 'error', message: getErrorMessage(err, 'Failed to delete address') }));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line">
        <div>
          <h2 className="text-xl font-normal text-ink">Saved Addresses</h2>
          <p className="text-xs text-muted mt-0.5">Manage your delivery and billing locations</p>
        </div>
        <Button variant="primary" size="sm" onClick={openCreateModal}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Add New Address
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-36 rounded-2xl" />
          <Skeleton className="h-36 rounded-2xl" />
        </div>
      ) : addresses.length === 0 ? (
        <EmptyState
          icon={<MapPin className="h-8 w-8" />}
          title="No addresses saved yet"
          description="Add your shipping locations for faster and smoother checkout."
          actionLabel="Add Address"
          onAction={openCreateModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr._id}
              className={`card p-5 space-y-3 relative transition-all ${
                addr.isDefault ? 'border-ink/80 shadow-xs ring-1 ring-ink/20' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-ink text-sm">{addr.fullName}</span>
                  <span className="px-2 py-0.5 rounded bg-line/60 text-[10px] uppercase font-medium">
                    {addr.label}
                  </span>
                </div>
                {addr.isDefault && (
                  <span className="text-[11px] font-semibold text-success flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Default
                  </span>
                )}
              </div>

              <p className="text-xs text-muted leading-relaxed">
                {addr.line1}
                {addr.line2 ? `, ${addr.line2}` : ''}
                <br />
                {addr.city}, {addr.state} - {addr.pincode}
                <br />
                {addr.country}
              </p>
              <p className="text-xs text-muted">Phone: {addr.phone}</p>

              <div className="flex items-center justify-between pt-3 border-t border-line/60 text-xs">
                {!addr.isDefault ? (
                  <button
                    onClick={() => handleSetDefault(addr._id)}
                    className="text-accent font-medium hover:underline cursor-pointer"
                  >
                    Set as default
                  </button>
                ) : (
                  <span />
                )}

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => openEditModal(addr)}
                    className="p-1 text-muted hover:text-ink cursor-pointer"
                    aria-label="Edit"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setAddressToDelete(addr);
                      setDeleteConfirmOpen(true);
                    }}
                    className="p-1 text-muted hover:text-danger cursor-pointer"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Address Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAddress ? 'Edit Address' : 'Add New Address'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Recipient Name"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            />
            <Input
              label="Phone Number"
              required
              placeholder="10-digit mobile"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <Input
            label="Street Address / Line 1"
            required
            value={formData.line1}
            onChange={(e) => setFormData({ ...formData, line1: e.target.value })}
          />
          <Input
            label="Apartment, Floor, Landmark (Optional)"
            value={formData.line2}
            onChange={(e) => setFormData({ ...formData, line2: e.target.value })}
          />
          <div className="grid grid-cols-3 gap-3">
            <Input
              label="City"
              required
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-ink/80">State *</label>
              <select
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
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
              label="Pincode"
              required
              maxLength={6}
              value={formData.pincode}
              onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isDefaultAddr"
              checked={formData.isDefault}
              onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
              className="accent-accent rounded"
            />
            <label htmlFor="isDefaultAddr" className="text-xs text-ink cursor-pointer">
              Set as primary default address
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSaving}>
              Save Address
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Address"
        description="Are you sure you want to remove this delivery address? This action cannot be undone."
        isLoading={isDeleting}
      />
    </div>
  );
};

export default AddressManagementPage;
