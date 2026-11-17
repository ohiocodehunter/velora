import React, { useState } from 'react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import { ChevronDown, HelpCircle, Link as LinkIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  title: string;
  items: FAQItem[];
}

export const FAQPage: React.FC = () => {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    '0-0': true,
    '1-0': true,
  });

  const toggle = (key: string) => {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const categories: FAQCategory[] = [
    {
      title: 'Orders & Multi-Vendor Marketplace',
      items: [
        {
          question: 'Can I purchase items from multiple sellers in one order?',
          answer:
            'Yes. VELORA is engineered as a unified multi-vendor platform. You can place items from different boutiques or craftsmen into a single cart. We handle a single consolidated checkout, while each seller receives their specific dispatch notification to package and fulfill their goods.',
        },
        {
          question: 'How do I cancel an order?',
          answer:
            'Orders in "Pending" or "Confirmed" states can be cancelled directly through your "My Orders" panel with a single click. Once an atelier marks an item as "Processing" or "Shipped", you can initiate a complimentary return upon delivery.',
        },
      ],
    },
    {
      title: 'Payments & Razorpay Test Integration',
      items: [
        {
          question: 'What payment modes are accepted on VELORA?',
          answer:
            'We support all domestic Indian payment modes powered by Razorpay: UPI (Google Pay, PhonePe, Paytm, BHIM), all major Credit/Debit Cards (Visa, MasterCard, RuPay, Amex), NetBanking across 50+ banks, and Cash on Delivery (COD).',
        },
        {
          question: 'Is online transaction data secure?',
          answer:
            'All payment processing occurs via bank-grade 256-bit SSL encrypted sessions. VELORA never stores card numbers or CVVs on our application servers. Payment verification is validated with server-side HMAC cryptographic signatures.',
        },
      ],
    },
    {
      title: 'Shipping, Delivery & Returns',
      items: [
        {
          question: 'What is the shipping fee and threshold?',
          answer:
            'All orders totaling ₹999 or more enjoy complimentary express insured courier delivery across India. Orders under ₹999 incur a standard handling fee of ₹79.',
        },
        {
          question: 'How does the 7-day return guarantee work?',
          answer:
            'If an item arrives damaged, defective, or fails to meet specifications, you may request a return within 7 calendar days of delivery. Our courier will pick up the package directly from your doorstep at zero reverse shipping cost.',
        },
      ],
    },
    {
      title: 'Selling on VELORA',
      items: [
        {
          question: 'Who can register as a seller?',
          answer:
            'Independent designers, bespoke ateliers, horologists, audio gear creators, and curated boutiques based in India can apply through our "Become a Seller" portal. Applications undergo vetting to ensure authenticity and quality standards.',
        },
        {
          question: 'When are seller payouts disbursed?',
          answer:
            'Disbursements are credited directly to the seller registered bank account within 3 business days following successful delivery verification.',
        },
      ],
    },
  ];

  return (
    <div className="shell py-10 sm:py-16 space-y-12 max-w-4xl">
      <Breadcrumbs items={[{ label: 'Help & FAQ' }]} />

      <div className="space-y-3">
        <span className="eyebrow">Frequently Answered Questions</span>
        <h1 className="text-3xl sm:text-4xl font-normal text-ink">Everything you need to know</h1>
        <p className="text-xs sm:text-sm text-muted leading-relaxed">
          Clear answers regarding purchasing, seller fulfillment, insured shipping, and security.
        </p>
      </div>

      <div className="space-y-10">
        {categories.map((cat, catIdx) => (
          <div key={cat.title} className="space-y-4">
            <h2 className="text-base font-semibold text-ink uppercase tracking-wider text-xs border-b border-line pb-2">
              {cat.title}
            </h2>

            <div className="card divide-y divide-line overflow-hidden">
              {cat.items.map((item, itemIdx) => {
                const key = `${catIdx}-${itemIdx}`;
                const isOpen = Boolean(openItems[key]);

                return (
                  <div key={item.question} className="transition-colors">
                    <button
                      type="button"
                      onClick={() => toggle(key)}
                      className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left cursor-pointer hover:bg-canvas/50"
                    >
                      <span className="text-xs sm:text-sm font-medium text-ink">
                        {item.question}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 text-muted shrink-0 transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-ink' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-5 sm:px-5 sm:pb-5 text-xs text-muted leading-relaxed animate-fade-in">
                        {item.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="card p-6 sm:p-8 bg-surface text-center space-y-3 border-line">
        <h3 className="text-base font-medium text-ink">Still have an unanswered question?</h3>
        <p className="text-xs text-muted max-w-md mx-auto">
          Our customer concierge team is on standby to assist with any bespoke orders or special requests.
        </p>
        <div className="pt-2">
          <Link to="/contact" className="inline-block text-xs font-semibold text-accent hover:underline">
            Contact Support Concierge →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
