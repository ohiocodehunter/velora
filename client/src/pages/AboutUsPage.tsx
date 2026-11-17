import React from 'react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import { Award, ShieldCheck, Heart, Users, Sparkles } from 'lucide-react';

export const AboutUsPage: React.FC = () => {
  return (
    <div className="shell py-10 sm:py-16 space-y-16">
      <Breadcrumbs items={[{ label: 'About Us' }]} />

      {/* Hero statement */}
      <div className="max-w-3xl space-y-4">
        <span className="eyebrow">The Velora Philosophy</span>
        <h1 className="text-3xl sm:text-5xl font-light text-ink leading-[1.15]">
          A home for objects crafted with <span className="font-normal italic">intention and soul.</span>
        </h1>
        <p className="text-sm sm:text-base text-muted leading-relaxed">
          VELORA was founded on a singular conviction: that in an era of disposable mass production,
          the objects we bring into our daily lives should possess provenance, enduring materials, and
          uncompromising artistry.
        </p>
      </div>

      {/* Main Narrative */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6 relative aspect-4/3 rounded-3xl overflow-hidden border border-line shadow-soft bg-canvas">
          <img
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=900&auto=format&fit=crop&q=80"
            alt="Artisan workshop"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="lg:col-span-6 space-y-6 text-xs sm:text-sm text-ink/80 leading-relaxed">
          <h2 className="text-2xl font-normal text-ink font-display">
            The Multi-Vendor Atelier
          </h2>
          <p>
            Rather than standardizing merchandise under a generic warehouse label, VELORA serves as a
            curated digital pavilion. Each store featured on our platform is an independent
            workshop, boutique designer, or heritage manufacturer.
          </p>
          <p>
            When you purchase a mechanical chronograph, a top-grain bridle leather briefcase, or a
            hand-thrown ceramic vessel on VELORA, you are purchasing directly from the craftsman who
            calibrated, hand-stitched, or sculpted it.
          </p>
          <p>
            We handle the complexities of unified payments, escrow security, insured courier
            dispatch, and verified seller moderation — allowing our partners to focus solely on their
            trade.
          </p>
        </div>
      </div>

      {/* Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        <div className="card p-6 sm:p-8 space-y-3">
          <Award className="h-6 w-6 text-accent mb-2" />
          <h3 className="text-base font-medium text-ink">Bespoke Curation</h3>
          <p className="text-xs text-muted leading-relaxed">
            Every seller must pass rigorous evaluations of raw material provenance, photographic
            fidelity, and ethical labor standards before listing.
          </p>
        </div>

        <div className="card p-6 sm:p-8 space-y-3">
          <ShieldCheck className="h-6 w-6 text-accent mb-2" />
          <h3 className="text-base font-medium text-ink">Escrow Trust Architecture</h3>
          <p className="text-xs text-muted leading-relaxed">
            Funds are held securely until the recipient confirms doorstep satisfaction, ensuring
            flawless buyer protection and authentic dispatches.
          </p>
        </div>

        <div className="card p-6 sm:p-8 space-y-3">
          <Users className="h-6 w-6 text-accent mb-2" />
          <h3 className="text-base font-medium text-ink">Empowering Makers</h3>
          <p className="text-xs text-muted leading-relaxed">
            By eliminating predatory distributor markups, our independent vendor community retains fair
            margins to sustain heritage crafts.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutUsPage;
