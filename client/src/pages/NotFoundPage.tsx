import React from 'react';
import { Link } from 'react-router-dom';
import Button from '@/components/ui/Button';
import { ArrowLeft, Home, Compass } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="shell py-24 sm:py-36 text-center space-y-6 max-w-lg mx-auto">
      <span className="font-display text-7xl sm:text-8xl font-light text-ink/30 block tracking-tight">
        404
      </span>
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-normal text-ink">Page Not Found</h1>
        <p className="text-xs sm:text-sm text-muted leading-relaxed">
          The page or product catalogue path you requested does not exist or may have been relocated.
        </p>
      </div>

      <div className="flex items-center justify-center gap-3 pt-4">
        <Link to="/">
          <Button variant="primary" size="md">
            <Home className="h-4 w-4 mr-1.5" /> Return to Home
          </Button>
        </Link>
        <Link to="/shop">
          <Button variant="outline" size="md">
            <Compass className="h-4 w-4 mr-1.5" /> Browse Catalogue
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
