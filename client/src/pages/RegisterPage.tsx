import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '@/services/auth.service';
import { useAppDispatch } from '@/hooks/store';
import { setUser } from '@/store/slices/authSlice';
import { fetchCart } from '@/store/slices/cartSlice';
import { fetchWishlist } from '@/store/slices/wishlistSlice';
import { addToast } from '@/store/slices/uiSlice';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Mail, Lock, User, Phone } from 'lucide-react';
import { getErrorMessage } from '@/services/api';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      dispatch(addToast({ type: 'warning', message: 'Please enter your full name' }));
      return;
    }
    if (!email.trim()) {
      dispatch(addToast({ type: 'warning', message: 'Please enter your email address' }));
      return;
    }
    if (!password) {
      dispatch(addToast({ type: 'warning', message: 'Please enter a password' }));
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
    if (!agreeTerms) {
      dispatch(addToast({ type: 'warning', message: 'Please accept the Terms of Service to continue' }));
      return;
    }

    try {
      setIsLoading(true);
      const data = await authService.register({
        name: name.trim(),
        email: email.trim(),
        password,
        phone: phone.trim() || undefined,
      });
      dispatch(setUser(data.user));
      dispatch(fetchCart());
      dispatch(fetchWishlist());
      dispatch(addToast({ type: 'success', message: 'Account created! Welcome to VELORA.' }));
      navigate('/shop');
    } catch (err) {
      dispatch(addToast({ type: 'error', message: getErrorMessage(err, 'Failed to create account') }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="shell py-12 sm:py-20 flex justify-center">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-block">
            <span className="font-display text-3xl font-normal text-ink">VELORA</span>
          </Link>
          <h1 className="text-2xl font-normal text-ink">Create your account</h1>
          <p className="text-xs text-muted">Join our community of collectors and design enthusiasts</p>
        </div>

        <div className="card p-6 sm:p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              required
              icon={<User className="h-4 w-4" />}
              placeholder="e.g. Ananya Roy"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <Input
              label="Email Address"
              type="email"
              required
              icon={<Mail className="h-4 w-4" />}
              placeholder="you@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              label="Phone Number"
              icon={<Phone className="h-4 w-4" />}
              placeholder="10-digit mobile"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

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

            <div className="flex items-start gap-2 pt-1">
              <input
                type="checkbox"
                id="terms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="accent-accent mt-0.5 rounded cursor-pointer"
              />
              <label htmlFor="terms" className="text-xs text-muted cursor-pointer leading-tight">
                I agree to the VELORA Terms of Service and Privacy Policy.
              </label>
            </div>

            <Button type="submit" variant="primary" size="md" className="w-full" isLoading={isLoading}>
              Create Account
            </Button>
          </form>

          <div className="text-center pt-2 border-t border-line text-xs text-muted">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-accent hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
