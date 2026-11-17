import React from 'react';
import { Link } from 'react-router-dom';
import type { Category } from '@/types';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface CategoryCardProps {
  category: Category;
  className?: string;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category, className }) => {
  const imageUrl =
    category.image?.url ||
    'https://images.unsplash.com/photo-1513094735237-8f2714d57c13?w=600&auto=format&fit=crop&q=80';

  return (
    <Link
      to={`/shop?category=${category.slug}`}
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-line bg-surface block aspect-4/5 transition-all duration-300 hover:shadow-soft',
        className,
      )}
    >
      <img
        src={imageUrl}
        alt={category.name}
        loading="lazy"
        className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />

      <div className="absolute bottom-0 inset-x-0 p-5 flex items-end justify-between">
        <div>
          <h3 className="text-lg font-normal text-surface group-hover:text-accent-soft transition-colors">
            {category.name}
          </h3>
          {category.description && (
            <p className="text-xs text-surface/70 line-clamp-1 mt-0.5">{category.description}</p>
          )}
        </div>
        <div className="h-8 w-8 rounded-full bg-surface/20 backdrop-blur-xs flex items-center justify-center text-surface group-hover:bg-surface group-hover:text-ink transition-colors shrink-0">
          <ArrowUpRight className="h-4 w-4" />
        </div>
      </div>
    </Link>
  );
};

export default CategoryCard;
