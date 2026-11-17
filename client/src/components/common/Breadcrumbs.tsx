import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className }) => {
  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center text-xs text-muted py-3', className)}>
      <ol className="flex items-center gap-1.5 flex-wrap">
        <li>
          <Link to="/" className="hover:text-ink flex items-center transition-colors">
            <Home className="h-3.5 w-3.5" />
          </Link>
        </li>
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <React.Fragment key={idx}>
              <li>
                <ChevronRight className="h-3 w-3 text-muted/60" />
              </li>
              <li>
                {item.href && !isLast ? (
                  <Link to={item.href} className="hover:text-ink transition-colors">
                    {item.label}
                  </Link>
                ) : (
                  <span className="font-medium text-ink max-w-[200px] sm:max-w-xs truncate inline-block">
                    {item.label}
                  </span>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
