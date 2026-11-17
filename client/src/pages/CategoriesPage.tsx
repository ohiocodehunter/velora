import React, { useEffect, useState } from 'react';
import { categoryService } from '@/services/category.service';
import type { Category } from '@/types';
import CategoryCard from '@/components/common/CategoryCard';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        const data = await categoryService.getCategories();
        setCategories(data);
      } catch {
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="shell py-8 sm:py-12">
      <Breadcrumbs items={[{ label: 'Categories' }]} />

      <div className="max-w-2xl mt-2 mb-10">
        <span className="eyebrow">Discover the Marketplace</span>
        <h1 className="text-3xl sm:text-4xl font-normal text-ink mt-1">All Departments</h1>
        <p className="text-xs sm:text-sm text-muted mt-2 leading-relaxed">
          Explore handcrafted timepieces, audiophile grade gear, heirloom leather accessories,
          bespoke furnishings, and modern tailored apparel from our verified multi-vendor community.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="aspect-4/5 rounded-2xl" />
          ))}
        </div>
      ) : !Array.isArray(categories) || categories.length === 0 ? (
        <EmptyState title="No categories found" description="Categories are currently being curated." />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <CategoryCard key={cat._id} category={cat} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;
