import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/store';
import { authService } from '@/services/auth.service';
import { setUser } from '@/store/slices/authSlice';
import { addToast } from '@/store/slices/uiSlice';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { formatDate } from '@/utils/format';
import { getErrorMessage } from '@/services/api';
import { User, Lock, ShieldCheck, Mail, Phone, Calendar } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  // Profile Edit State
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsUpdatingProfile(true);
      const updated = await authService.updateProfile({
        name: name.trim(),
        phone: phone.trim() || undefined,
      });
      dispatch(setUser(updated));
      dispatch(addToast({ type: 'success', message: 'Profile updated successfully' }));
    } catch (err) {
      dispatch(addToast({ type: 'error', message: getErrorMessage(err, 'Failed to update profile') }));
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      dispatch(addToast({ type: 'warning', message: 'New password must be at least 6 characters' }));
      return;
    }
    if (newPassword !== confirmPassword) {
      dispatch(addToast({ type: 'warning', message: 'Passwords do not match' }));
      return;
    }

    try {
      setIsChangingPassword(true);
      await authService.changePassword({ currentPassword, newPassword });
      dispatch(addToast({ type: 'success', message: 'Password changed successfully' }));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      dispatch(addToast({ type: 'error', message: getErrorMessage(err, 'Failed to change password') }));
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Account Info Card */}
      <div className="card p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-xl font-normal text-ink">Personal Profile</h2>
          <p className="text-xs text-muted mt-0.5">Manage your personal identification details</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-canvas border border-line text-xs">
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-accent" />
            <div>
              <p className="text-muted">Account Email</p>
              <p className="font-semibold text-ink">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-4 w-4 text-accent" />
            <div>
              <p className="text-muted">Role Privilege</p>
              <p className="font-semibold text-ink capitalize">{user?.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-accent" />
            <div>
              <p className="text-muted">Member Since</p>
              <p className="font-semibold text-ink">{formatDate(user?.createdAt)}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-xl">
          <Input
            label="Full Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            label="Phone Number"
            placeholder="10-digit mobile"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <Button type="submit" variant="primary" size="sm" isLoading={isUpdatingProfile}>
            Save Profile Changes
          </Button>
        </form>
      </div>

      {/* Change Password Card */}
      <div className="card p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-xl font-normal text-ink">Security Credentials</h2>
          <p className="text-xs text-muted mt-0.5">Update your account login password</p>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-xl">
          <Input
            label="Current Password"
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="New Password"
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <Input
              label="Confirm New Password"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <Button type="submit" variant="outline" size="sm" isLoading={isChangingPassword}>
            Update Password
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
