import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '@/services/auth.service';
import { useAppDispatch } from '@/hooks/store';
import { setUser } from '@/store/slices/authSlice';
import { fetchCart } from '@/store/slices/cartSlice';
import { fetchWishlist } from '@/store/slices/wishlistSlice';
import { addToast } from '@/store/slices/uiSlice';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Lock, Mail } from 'lucide-react';
import { getErrorMessage } from '@/services/api';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    try {
      setIsLoading(true);
      const data = await authService.login({ email: email.trim(), password });
      dispatch(setUser(data.user));
      dispatch(fetchCart());
      dispatch(fetchWishlist());
      dispatch(addToast({ type: 'success', message: `Welcome back, ${data.user.name}!` }));

      if (data.user.role === 'admin' && redirect === '/') {
        navigate('/admin/dashboard');
      } else if (data.user.role === 'seller' && redirect === '/') {
        navigate('/seller/dashboard');
      } else {
        navigate(redirect);
      }
    } catch (err) {
      dispatch(addToast({ type: 'error', message: getErrorMessage(err, 'Failed to sign in') }));
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
          <h1 className="text-2xl font-normal text-ink">Sign in to your account</h1>
          <p className="text-xs text-muted">
            Access your orders, saved collection, and seller portals
          </p>
        </div>

        {/* Login Form */}
        <div className="card p-6 sm:p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
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
              label="Password"
              type="password"
              required
              icon={<Lock className="h-4 w-4" />}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button type="submit" variant="primary" size="md" className="w-full" isLoading={isLoading}>
              Sign In
            </Button>
          </form>

          <div className="text-center pt-2 border-t border-line text-xs text-muted space-y-2">
            <p>
              New to VELORA?{' '}
              <Link to="/register" className="font-semibold text-accent hover:underline">
                Create Customer Account
              </Link>
            </p>
            <p>
              Are you an artisan or brand?{' '}
              <Link to="/seller/register" className="font-semibold text-ink hover:underline">
                Register as a Seller
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
