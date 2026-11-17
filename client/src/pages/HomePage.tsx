import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '@/services/product.service';
import { categoryService } from '@/services/category.service';
import { miscService } from '@/services/misc.service';
import type { Product, Category, Banner } from '@/types';
import ProductCard from '@/components/common/ProductCard';
import CategoryCard from '@/components/common/CategoryCard';
import Skeleton from '@/components/ui/Skeleton';
import { ArrowRight, Sparkles, ShieldCheck, Award, Star, Store, Quote } from 'lucide-react';
import Button from '@/components/ui/Button';

export const HomePage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [heroBanners, setHeroBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      try {
        setIsLoading(true);
        const [featuredRes, newRes, bestRes, catRes, bannersRes] = await Promise.allSettled([
          productService.listProducts({ featured: true, limit: 8 }),
          productService.listProducts({ sort: '-createdAt', limit: 8 }),
          productService.listProducts({ sort: '-soldCount', limit: 8 }),
          categoryService.getCategories({ featured: true }),
          miscService.getBanners('home_hero'),
        ]);

        if (featuredRes.status === 'fulfilled') setFeaturedProducts(featuredRes.value.products);
        if (newRes.status === 'fulfilled') setNewArrivals(newRes.value.products);
        if (bestRes.status === 'fulfilled') setBestSellers(bestRes.value.products);
        if (catRes.status === 'fulfilled') setCategories(catRes.value);
        if (bannersRes.status === 'fulfilled') setHeroBanners(bannersRes.value);
      } finally {
        setIsLoading(false);
      }
    }
    loadHomeData();
  }, []);

  const heroBanner = heroBanners[0];

  const testimonials = [
    {
      name: 'Vikramaditya Roy',
      title: 'Horology Collector, Mumbai',
      quote:
        'VELORA is what Indian online shopping needed. The craftsmanship of the independent watchmakers and leather artisans featured here rivals the best European ateliers.',
      rating: 5,
    },
    {
      name: 'Ananya Deshmukh',
      title: 'Interior Stylist, Bangalore',
      quote:
        'Finding genuine artisanal home decor and curated audio setups across multiple boutique verified sellers in one basket was frictionless. Delivery was impeccable.',
      rating: 5,
    },
    {
      name: 'Rohan Mehra',
      title: 'Sound Engineer, Delhi',
      quote:
        'The audio gear curation is world-class. Transparent seller profiles, authentic serial numbers, and instant COD verification make VELORA my top destination.',
      rating: 5,
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#FAF3E8] border-b border-line">
        <div className="shell py-14 sm:py-24 lg:py-28 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface/80 border border-line backdrop-blur-xs text-xs font-medium text-ink">
                <Sparkles className="h-3.5 w-3.5 text-accent" />
                <span>Curated Multi-Vendor Marketplace</span>
              </div>
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-light text-ink tracking-tight leading-[1.08]">
                Discover More. <br />
                <span className="font-normal italic">Shop Smarter.</span>
              </h1>
              <p className="text-sm sm:text-base text-muted max-w-lg leading-relaxed">
                Step into an elevated world of independent horology, acoustic perfection, handcrafted
                leather goods, and artisanal home objects — gathered from verified creators.
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link to="/shop">
                  <Button size="lg" variant="primary">
                    Explore Catalogue <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
                <Link to="/categories">
                  <Button size="lg" variant="outline">
                    Browse Categories
                  </Button>
                </Link>
              </div>

              {/* Trust stats */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-line/70 max-w-md">
                <div>
                  <p className="text-xl sm:text-2xl font-normal text-ink font-display">100%</p>
                  <p className="text-[11px] text-muted uppercase tracking-wider">Authentic</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-normal text-ink font-display">50+</p>
                  <p className="text-[11px] text-muted uppercase tracking-wider">Verified Stores</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-normal text-ink font-display">₹999+</p>
                  <p className="text-[11px] text-muted uppercase tracking-wider">Free Delivery</p>
                </div>
              </div>
            </div>

            {/* Hero Image / Editorial Display */}
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-4/5 rounded-3xl overflow-hidden shadow-lift border border-line bg-surface">
                <img
                  src={
                    heroBanner?.image?.url ||
                    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=900&auto=format&fit=crop&q=80'
                  }
                  alt="Velora Editorial Showcase"
                  className="h-full w-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
                <div className="absolute bottom-6 inset-x-6 p-4 rounded-2xl bg-surface/90 backdrop-blur-md border border-line">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-accent-strong">
                    Private Reserve Collection
                  </p>
                  <h3 className="text-sm font-medium text-ink mt-0.5">
                    Chronographs & Artisanal Accessories
                  </h3>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-line/60">
                    <span className="text-xs text-muted">Limited Production Batches</span>
                    <Link
                      to="/shop?featured=true"
                      className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
                    >
                      Shop drop <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories Grid */}
      <section className="shell">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="eyebrow">Curated Collections</span>
            <h2 className="text-2xl sm:text-3xl text-ink mt-1">Explore by Category</h2>
          </div>
          <Link
            to="/categories"
            className="text-xs font-semibold text-accent hover:text-accent-strong flex items-center gap-1 transition-colors"
          >
            All categories <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="aspect-4/5 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {categories.slice(0, 4).map((category) => (
              <CategoryCard key={category._id} category={category} />
            ))}
          </div>
        )}
      </section>

      {/* Curated Featured Products */}
      <section className="shell">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="eyebrow">Editorial Spotlight</span>
            <h2 className="text-2xl sm:text-3xl text-ink mt-1">Featured Creations</h2>
          </div>
          <Link
            to="/shop?featured=true"
            className="text-xs font-semibold text-accent hover:text-accent-strong flex items-center gap-1 transition-colors"
          >
            View all featured <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-80 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
            {featuredProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* Promotional Banner Strip */}
      <section className="shell">
        <div className="relative rounded-3xl overflow-hidden bg-ink text-surface p-8 sm:p-14 border border-line">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative z-10">
            <div className="space-y-4">
              <span className="px-3 py-1 rounded-full bg-accent/20 text-accent-soft text-xs font-semibold uppercase tracking-wider">
                Velora Collective
              </span>
              <h2 className="text-3xl sm:text-4xl text-surface font-light">
                Direct from Independent <br />
                <span className="font-normal italic">Ateliers & Boutiques.</span>
              </h2>
              <p className="text-xs sm:text-sm text-surface/70 max-w-md leading-relaxed">
                Every seller is vetted for authenticity, ethically sourced materials, and reliable
                fulfillment. By shopping on VELORA, you support genuine craftsmanship.
              </p>
              <div className="pt-2">
                <Link to="/seller/register">
                  <Button variant="accent" size="md">
                    Apply to Sell on VELORA <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-surface/10 border border-surface/10 backdrop-blur-xs">
                <Award className="h-6 w-6 text-accent mb-3" />
                <h4 className="text-sm font-medium text-surface">Curated Quality</h4>
                <p className="text-xs text-surface/60 mt-1">
                  Strict standards for product photography and specifications.
                </p>
              </div>
              <div className="p-5 rounded-2xl bg-surface/10 border border-surface/10 backdrop-blur-xs">
                <ShieldCheck className="h-6 w-6 text-accent mb-3" />
                <h4 className="text-sm font-medium text-surface">Buyer Protection</h4>
                <p className="text-xs text-surface/60 mt-1">
                  Escrow-style payment disbursement ensures you get what you ordered.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trending / New Arrivals Grid */}
      <section className="shell">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="eyebrow">Just Landed</span>
            <h2 className="text-2xl sm:text-3xl text-ink mt-1">New Arrivals</h2>
          </div>
          <Link
            to="/shop?sort=-createdAt"
            className="text-xs font-semibold text-accent hover:text-accent-strong flex items-center gap-1 transition-colors"
          >
            Explore all new <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-80 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
            {newArrivals.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* Customer Testimonials */}
      <section className="bg-surface border-y border-line py-16 sm:py-20">
        <div className="shell">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="eyebrow">Customer Voices</span>
            <h2 className="text-2xl sm:text-3xl text-ink mt-1">Trusted by Discerning Buyers</h2>
            <p className="text-xs text-muted mt-2">
              Read how shoppers across India discover bespoke pieces through our marketplace.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="card p-6 sm:p-7 flex flex-col justify-between space-y-4 hover:border-line-strong transition-all"
              >
                <div>
                  <div className="flex items-center gap-1 text-accent mb-3">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-accent" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-ink/90 leading-relaxed italic">
                    "{t.quote}"
                  </p>
                </div>
                <div className="pt-4 border-t border-line/60">
                  <p className="text-xs font-semibold text-ink">{t.name}</p>
                  <p className="text-[11px] text-muted">{t.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
