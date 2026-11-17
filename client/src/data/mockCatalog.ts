import type { Category, Product, ProductFacets } from '@/types';

export const img = (id: string, w = 1200, h = 1500) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

export const MOCK_CATEGORIES: Category[] = [
  {
    _id: 'cat-watches',
    name: 'Watches',
    slug: 'watches',
    description: 'Mechanical precision and quiet design, from everyday automatics to moonphase complications.',
    image: { url: img('1523275335684-37898b6baf30', 900, 900), publicId: '' },
    sortOrder: 1,
    isFeatured: true,
    isActive: true,
    productCount: 6,
  },
  {
    _id: 'cat-audio',
    name: 'Audio',
    slug: 'audio',
    description: 'Headphones, monitors and turntables tuned for long listening sessions.',
    image: { url: img('1505740420928-5e560c06d30e', 900, 900), publicId: '' },
    sortOrder: 2,
    isFeatured: true,
    isActive: true,
    productCount: 8,
  },
  {
    _id: 'cat-footwear',
    name: 'Footwear',
    slug: 'footwear',
    description: 'Everyday runners, court classics and hand-finished leather.',
    image: { url: img('1542291026-7eec264c27ff', 900, 900), publicId: '' },
    sortOrder: 3,
    isFeatured: true,
    isActive: true,
    productCount: 8,
  },
  {
    _id: 'cat-bags',
    name: 'Bags',
    slug: 'bags',
    description: 'Carry pieces built from full-grain leather and heavyweight canvas.',
    image: { url: img('1553062407-98eeb64c6a62', 900, 900), publicId: '' },
    sortOrder: 4,
    isFeatured: true,
    isActive: true,
    productCount: 6,
  },
  {
    _id: 'cat-electronics',
    name: 'Electronics',
    slug: 'electronics',
    description: 'Laptops, phones and cameras for work that travels with you.',
    image: { url: img('1531297484001-80022131f5a1', 900, 900), publicId: '' },
    sortOrder: 5,
    isFeatured: true,
    isActive: true,
    productCount: 8,
  },
  {
    _id: 'cat-home',
    name: 'Home & Living',
    slug: 'home-decor',
    description: 'Furniture and objects chosen for texture, proportion and warmth.',
    image: { url: img('1524758631624-e2822e304c36', 900, 900), publicId: '' },
    sortOrder: 6,
    isFeatured: true,
    isActive: true,
    productCount: 8,
  },
  {
    _id: 'cat-beauty',
    name: 'Beauty',
    slug: 'beauty',
    description: 'Fragrance, skincare and colour with considered, quiet formulas.',
    image: { url: img('1526947425960-945c6e72858f', 900, 900), publicId: '' },
    sortOrder: 7,
    isFeatured: true,
    isActive: true,
    productCount: 6,
  },
  {
    _id: 'cat-books',
    name: 'Books & Roastery',
    slug: 'books',
    description: 'Design, business, poetry, and single-origin beans.',
    image: { url: img('1512820790803-83ca734da794', 900, 900), publicId: '' },
    sortOrder: 8,
    isFeatured: true,
    isActive: true,
    productCount: 6,
  },
];

export const MOCK_PRODUCTS: Product[] = [
  // ---------------- Watches ----------------
  {
    _id: 'prod-watch-1',
    name: 'Meridian Automatic 38',
    slug: 'meridian-automatic-38',
    description: 'A 38 mm brushed-steel case over a sandblasted dial, with a 41-hour power reserve. Built by Aurel Studio with an automatic Swiss movement.',
    shortDescription: '38 mm brushed-steel automatic watch with 41h power reserve.',
    images: [
      { url: img('1523275335684-37898b6baf30'), publicId: '', alt: 'Meridian Automatic 38' },
      { url: img('1524805444758-089113d48a6d'), publicId: '', alt: 'Meridian Automatic angle' },
    ],
    price: 28900,
    discountPrice: 24900,
    finalPrice: 24900,
    category: MOCK_CATEGORIES[0],
    brand: 'Aurel',
    seller: 'seller-aurel' as any,
    store: { _id: 'store-aurel', name: 'Aurel Studio', slug: 'aurel-studio' } as any,
    stock: 12,
    sku: 'AUR-WAT-01',
    variants: [
      {
        name: 'Strap',
        options: [
          { label: 'Leather', priceDelta: 1200, stock: 6 },
          { label: 'Steel Mesh', priceDelta: 0, stock: 8 },
        ],
      },
    ],
    specifications: { Movement: 'Automatic Calibre 18', Case: '316L Stainless Steel', Diameter: '38 mm', WaterResistance: '5 ATM' },
    tags: ['watch', 'automatic', 'horology', 'steel'],
    ratingAverage: 4.9,
    ratingCount: 38,
    isFeatured: true,
    status: 'active',
    soldCount: 84,
    createdAt: '2026-01-10T10:00:00.000Z',
  },
  {
    _id: 'prod-watch-2',
    name: 'Lumen Smart Watch Series 7',
    slug: 'lumen-smart-watch-series-7',
    description: 'Always-on AMOLED display, seven-day battery and biometric sleep tracking that actually stays on. Crafted with an aerospace aluminium casing.',
    shortDescription: 'Always-on AMOLED display with 7-day battery.',
    images: [
      { url: img('1546868871-7041f2a55e12'), publicId: '', alt: 'Lumen Smart Watch' },
      { url: img('1523275335684-37898b6baf30'), publicId: '', alt: 'Lumen Smart Watch angle' },
    ],
    price: 24500,
    discountPrice: 21900,
    finalPrice: 21900,
    category: MOCK_CATEGORIES[0],
    brand: 'Lumen',
    seller: 'seller-lumen' as any,
    store: { _id: 'store-lumen', name: 'Lumen Studio', slug: 'lumen-studio' } as any,
    stock: 18,
    sku: 'LUM-WAT-07',
    variants: [
      {
        name: 'Colour',
        options: [
          { label: 'Midnight', priceDelta: 0, stock: 8 },
          { label: 'Silver', priceDelta: 0, stock: 6 },
          { label: 'Sand', priceDelta: 0, stock: 4 },
        ],
      },
    ],
    specifications: { Display: '1.4 inch AMOLED', Battery: '7 Days', Sensors: 'HR, SpO2, Sleep', WaterResistance: '50m' },
    tags: ['watch', 'smartwatch', 'amoled', 'fitness'],
    ratingAverage: 4.8,
    ratingCount: 42,
    isFeatured: true,
    status: 'active',
    soldCount: 110,
    createdAt: '2026-01-12T10:00:00.000Z',
  },
  {
    _id: 'prod-watch-3',
    name: 'Heritage Chronograph Tan',
    slug: 'heritage-chronograph-tan',
    description: 'Twin-register chronograph with a domed sapphire crystal and hand-stitched tan Italian leather. Limited batch production.',
    shortDescription: 'Twin-register mechanical chronograph with domed sapphire.',
    images: [
      { url: img('1524805444758-089113d48a6d'), publicId: '', alt: 'Heritage Chronograph' },
      { url: img('1522312346375-d1a52e2b99b3'), publicId: '', alt: 'Heritage Chronograph strap' },
    ],
    price: 32000,
    discountPrice: 28500,
    finalPrice: 28500,
    category: MOCK_CATEGORIES[0],
    brand: 'Aurel',
    seller: 'seller-aurel' as any,
    store: { _id: 'store-aurel', name: 'Aurel Studio', slug: 'aurel-studio' } as any,
    stock: 7,
    sku: 'AUR-CHR-03',
    variants: [],
    specifications: { Movement: 'Manual Chrono', Case: 'Polished Steel', Crystal: 'Domed Sapphire', Strap: 'Tan Italian Calfskin' },
    tags: ['watch', 'chronograph', 'leather', 'heritage'],
    ratingAverage: 5.0,
    ratingCount: 19,
    isFeatured: false,
    status: 'active',
    soldCount: 29,
    createdAt: '2026-01-15T10:00:00.000Z',
  },
  {
    _id: 'prod-watch-4',
    name: 'Atelier Moonphase Navy',
    slug: 'atelier-moonphase-navy',
    description: 'A moonphase aperture in deep navy, limited to 120 numbered pieces. Hand-assembled with mirror-polished indices and blued steel hands.',
    shortDescription: 'Limited edition 120-piece moonphase timepiece.',
    images: [
      { url: img('1567016432779-094069958ea5'), publicId: '', alt: 'Atelier Moonphase' },
      { url: img('1524805444758-089113d48a6d'), publicId: '', alt: 'Moonphase dial' },
    ],
    price: 41500,
    discountPrice: 39900,
    finalPrice: 39900,
    category: MOCK_CATEGORIES[0],
    brand: 'Aurel',
    seller: 'seller-aurel' as any,
    store: { _id: 'store-aurel', name: 'Aurel Studio', slug: 'aurel-studio' } as any,
    stock: 4,
    sku: 'AUR-MP-04',
    variants: [],
    specifications: { Complication: 'Moonphase & Date', Case: '39 mm Rose Gold PVD', Limited: '120 pieces' },
    tags: ['watch', 'moonphase', 'luxury', 'limited'],
    ratingAverage: 5.0,
    ratingCount: 16,
    isFeatured: true,
    status: 'active',
    soldCount: 15,
    createdAt: '2026-01-18T10:00:00.000Z',
  },

  // ---------------- Audio ----------------
  {
    _id: 'prod-audio-1',
    name: 'Solstice Over-Ear Wireless',
    slug: 'solstice-over-ear-wireless',
    description: 'Adaptive noise cancelling, 38-hour battery, and memory foam earcups that stay comfortable past hour four. Custom tuned 45mm neodymium drivers.',
    shortDescription: 'ANC over-ear wireless headphones with 38h battery.',
    images: [
      { url: img('1546435770-a3e426bf472b'), publicId: '', alt: 'Solstice Headphones' },
      { url: img('1505740420928-5e560c06d30e'), publicId: '', alt: 'Solstice detail' },
    ],
    price: 14900,
    discountPrice: 12665,
    finalPrice: 12665,
    category: MOCK_CATEGORIES[1],
    brand: 'Northline',
    seller: 'seller-northline' as any,
    store: { _id: 'store-northline', name: 'Northline Audio', slug: 'northline-audio' } as any,
    stock: 24,
    sku: 'NOR-SOL-01',
    variants: [
      {
        name: 'Colour',
        options: [
          { label: 'Black', priceDelta: 0, stock: 14 },
          { label: 'Sand', priceDelta: 0, stock: 10 },
        ],
      },
    ],
    specifications: { Driver: '45mm Neodymium', Battery: '38 Hours', Connectivity: 'Bluetooth 5.3 & 3.5mm', Codec: 'LDAC, AAC' },
    tags: ['audio', 'headphones', 'wireless', 'anc'],
    ratingAverage: 4.8,
    ratingCount: 52,
    isFeatured: true,
    status: 'active',
    soldCount: 95,
    createdAt: '2026-01-05T10:00:00.000Z',
  },
  {
    _id: 'prod-audio-2',
    name: 'Halo Studio Reference Monitors',
    slug: 'halo-studio-reference-monitors',
    description: 'A pair of active near-field studio monitors with genuinely flat frequency response, rear-ported acoustic birch cabinets and bi-amped Class-D power.',
    shortDescription: 'Bi-amplified studio monitors with acoustic birch cabinets.',
    images: [
      { url: img('1505740420928-5e560c06d30e'), publicId: '', alt: 'Halo Monitors' },
      { url: img('1583394838336-acd977736f90'), publicId: '', alt: 'Halo Monitors setup' },
    ],
    price: 18400,
    discountPrice: 16900,
    finalPrice: 16900,
    category: MOCK_CATEGORIES[1],
    brand: 'Northline',
    seller: 'seller-northline' as any,
    store: { _id: 'store-northline', name: 'Northline Audio', slug: 'northline-audio' } as any,
    stock: 9,
    sku: 'NOR-HAL-02',
    variants: [],
    specifications: { Power: '100W RMS Pair', Frequency: '42Hz - 22kHz', Inputs: 'XLR, TRS, RCA', Cabinet: 'Birch Plywood' },
    tags: ['audio', 'monitors', 'studio', 'speakers'],
    ratingAverage: 4.9,
    ratingCount: 23,
    isFeatured: true,
    status: 'active',
    soldCount: 37,
    createdAt: '2026-01-08T10:00:00.000Z',
  },
  {
    _id: 'prod-audio-3',
    name: 'Vinyl One Precision Turntable',
    slug: 'vinyl-one-precision-turntable',
    description: 'Belt-driven analogue turntable with a carbon fibre tonearm, heavy acrylic platter and pre-mounted Ortofon moving-magnet cartridge.',
    shortDescription: 'Belt-driven turntable with carbon tonearm & acrylic platter.',
    images: [
      { url: img('1546435770-a3e426bf472b'), publicId: '', alt: 'Vinyl One' },
      { url: img('1505740420928-5e560c06d30e'), publicId: '', alt: 'Vinyl One platter' },
    ],
    price: 26500,
    discountPrice: 24900,
    finalPrice: 24900,
    category: MOCK_CATEGORIES[1],
    brand: 'Northline',
    seller: 'seller-northline' as any,
    store: { _id: 'store-northline', name: 'Northline Audio', slug: 'northline-audio' } as any,
    stock: 5,
    sku: 'NOR-VIN-03',
    variants: [],
    specifications: { Drive: 'Belt Drive', Platter: 'Heavy Acrylic', Tonearm: 'Carbon Fibre', Speeds: '33 1/3, 45 RPM' },
    tags: ['audio', 'turntable', 'vinyl', 'analog'],
    ratingAverage: 5.0,
    ratingCount: 14,
    isFeatured: true,
    status: 'active',
    soldCount: 21,
    createdAt: '2026-01-14T10:00:00.000Z',
  },

  // ---------------- Footwear ----------------
  {
    _id: 'prod-foot-1',
    name: 'Ace Runner Crimson',
    slug: 'ace-runner-crimson',
    description: 'A lightweight engineered knit runner with a 6 mm drop, supercritical nitrogen-infused foam midsole that holds its responsiveness through high mileage.',
    shortDescription: 'Lightweight knit runner with supercritical foam midsole.',
    images: [
      { url: img('1542291026-7eec264c27ff'), publicId: '', alt: 'Ace Runner Crimson' },
      { url: img('1600185365483-26d7a4cc7519'), publicId: '', alt: 'Ace Runner side' },
    ],
    price: 8999,
    discountPrice: 7199,
    finalPrice: 7199,
    category: MOCK_CATEGORIES[2],
    brand: 'Stride',
    seller: 'seller-stride' as any,
    store: { _id: 'store-stride', name: 'Stride Athletics', slug: 'stride-athletics' } as any,
    stock: 30,
    sku: 'STR-ACE-01',
    variants: [
      {
        name: 'Size',
        options: [
          { label: 'UK 7', priceDelta: 0, stock: 10 },
          { label: 'UK 8', priceDelta: 0, stock: 10 },
          { label: 'UK 9', priceDelta: 0, stock: 10 },
        ],
      },
    ],
    specifications: { Weight: '215 grams', Drop: '6 mm', Upper: 'Recycled Knit', Outsole: 'Vibram Rubber' },
    tags: ['footwear', 'running', 'sneakers', 'stride'],
    ratingAverage: 4.8,
    ratingCount: 45,
    isFeatured: true,
    status: 'active',
    soldCount: 140,
    createdAt: '2026-01-03T10:00:00.000Z',
  },
  {
    _id: 'prod-foot-2',
    name: 'Derby Teal Handcrafted Suede',
    slug: 'derby-teal-handcrafted-suede',
    description: 'A hand-finished teal Italian suede derby on a Goodyear welted leather sole. Fully leather-lined and comfortable from the very first outing.',
    shortDescription: 'Goodyear welted teal suede derby shoes.',
    images: [
      { url: img('1560343090-f0409e92791a'), publicId: '', alt: 'Derby Suede' },
      { url: img('1491553895911-0055eca6402d'), publicId: '', alt: 'Derby Suede sole' },
    ],
    price: 6900,
    discountPrice: 5900,
    finalPrice: 5900,
    category: MOCK_CATEGORIES[2],
    brand: 'Atelier',
    seller: 'seller-atelier' as any,
    store: { _id: 'store-atelier', name: 'The Leather Atelier', slug: 'the-leather-atelier' } as any,
    stock: 14,
    sku: 'ATL-DRB-02',
    variants: [
      {
        name: 'Size',
        options: [
          { label: 'UK 8', priceDelta: 0, stock: 6 },
          { label: 'UK 9', priceDelta: 0, stock: 8 },
        ],
      },
    ],
    specifications: { Construction: 'Goodyear Welted', Upper: 'Italian Calf Suede', Sole: 'Stacked Vegetable Leather' },
    tags: ['footwear', 'derby', 'suede', 'leather'],
    ratingAverage: 4.9,
    ratingCount: 28,
    isFeatured: false,
    status: 'active',
    soldCount: 52,
    createdAt: '2026-01-09T10:00:00.000Z',
  },

  // ---------------- Bags ----------------
  {
    _id: 'prod-bag-1',
    name: 'Voyager Leather Backpack',
    slug: 'voyager-leather-backpack',
    description: 'Full-grain vegetable-tanned leather, a padded 16-inch laptop compartment, and antique brass hardware that develops rich patina over years of use.',
    shortDescription: 'Full-grain leather commuter backpack with 16-inch laptop sleeve.',
    images: [
      { url: img('1553062407-98eeb64c6a62'), publicId: '', alt: 'Voyager Backpack' },
      { url: img('1548036328-c9fa89d128fa'), publicId: '', alt: 'Voyager interior' },
    ],
    price: 7900,
    discountPrice: 6320,
    finalPrice: 6320,
    category: MOCK_CATEGORIES[3],
    brand: 'Aurel',
    seller: 'seller-aurel' as any,
    store: { _id: 'store-aurel', name: 'Aurel Studio', slug: 'aurel-studio' } as any,
    stock: 20,
    sku: 'AUR-VOY-01',
    variants: [],
    specifications: { Material: 'Full Grain Leather', Capacity: '22 Litres', LaptopFit: 'Up to 16 inch' },
    tags: ['bag', 'backpack', 'leather', 'commute'],
    ratingAverage: 4.9,
    ratingCount: 36,
    isFeatured: true,
    status: 'active',
    soldCount: 78,
    createdAt: '2026-01-06T10:00:00.000Z',
  },
  {
    _id: 'prod-bag-2',
    name: 'Chevron Quilted Crossbody',
    slug: 'chevron-quilted-crossbody',
    description: 'Chevron-quilted lambskin with a gold-tone chain strap that can be doubled for evening shoulder carry. Magnetic envelope flap closure.',
    shortDescription: 'Quilted lambskin crossbody with convertible chain strap.',
    images: [
      { url: img('1548036328-c9fa89d128fa'), publicId: '', alt: 'Chevron Crossbody' },
      { url: img('1553062407-98eeb64c6a62'), publicId: '', alt: 'Chevron Crossbody angle' },
    ],
    price: 12600,
    discountPrice: 10700,
    finalPrice: 10700,
    category: MOCK_CATEGORIES[3],
    brand: 'Aurel',
    seller: 'seller-aurel' as any,
    store: { _id: 'store-aurel', name: 'Aurel Studio', slug: 'aurel-studio' } as any,
    stock: 12,
    sku: 'AUR-CHV-02',
    variants: [],
    specifications: { Material: 'Quilted Lambskin', Strap: 'Convertible Chain', Hardware: '18k Gold Plated' },
    tags: ['bag', 'crossbody', 'luxury', 'evening'],
    ratingAverage: 4.8,
    ratingCount: 22,
    isFeatured: false,
    status: 'active',
    soldCount: 41,
    createdAt: '2026-01-11T10:00:00.000Z',
  },

  // ---------------- Electronics ----------------
  {
    _id: 'prod-elec-1',
    name: 'Slate Book Pro 14',
    slug: 'slate-book-pro-14',
    description: 'A 14-inch mini-LED display with 120Hz ProMotion, 18-hour battery, silent magnetic thermal architecture, and an anodized space-black chassis.',
    shortDescription: '14-inch mini-LED laptop with 18h battery & M-Series performance.',
    images: [
      { url: img('1517336714731-489689fd1ca8'), publicId: '', alt: 'Slate Book Pro' },
      { url: img('1531297484001-80022131f5a1'), publicId: '', alt: 'Slate Book Pro keyboard' },
    ],
    price: 149900,
    discountPrice: 139900,
    finalPrice: 139900,
    category: MOCK_CATEGORIES[4],
    brand: 'Slate',
    seller: 'seller-northline' as any,
    store: { _id: 'store-northline', name: 'Northline Audio', slug: 'northline-audio' } as any,
    stock: 8,
    sku: 'SLA-PRO-14',
    variants: [],
    specifications: { Screen: '14.2 inch Liquid Retina XDR', Memory: '32 GB Unified', Storage: '1 TB PCIe Gen4 SSD', Weight: '1.5 kg' },
    tags: ['electronics', 'laptop', 'pro', 'slate'],
    ratingAverage: 5.0,
    ratingCount: 31,
    isFeatured: true,
    status: 'active',
    soldCount: 60,
    createdAt: '2026-01-02T10:00:00.000Z',
  },
  {
    _id: 'prod-elec-2',
    name: 'Pulse Phone 15 Titanium',
    slug: 'pulse-phone-15-titanium',
    description: 'Triple 48MP computational camera system, aerospace grade brushed titanium frame, and an OLED panel that stays sharp under direct sunlight.',
    shortDescription: 'Titanium flagship smartphone with 48MP triple camera.',
    images: [
      { url: img('1511707171634-5f897ff02aa9'), publicId: '', alt: 'Pulse Phone 15' },
      { url: img('1592750475338-74b7b21085ab'), publicId: '', alt: 'Pulse Phone back' },
    ],
    price: 79900,
    discountPrice: 74900,
    finalPrice: 74900,
    category: MOCK_CATEGORIES[4],
    brand: 'Pulse',
    seller: 'seller-northline' as any,
    store: { _id: 'store-northline', name: 'Northline Audio', slug: 'northline-audio' } as any,
    stock: 14,
    sku: 'PLS-PH-15',
    variants: [],
    specifications: { Processor: 'Bionic Octa-core', Storage: '256 GB', Camera: '48MP + 12MP + 12MP', Battery: '4400 mAh' },
    tags: ['electronics', 'smartphone', 'titanium', 'pulse'],
    ratingAverage: 4.8,
    ratingCount: 44,
    isFeatured: true,
    status: 'active',
    soldCount: 88,
    createdAt: '2026-01-04T10:00:00.000Z',
  },
  {
    _id: 'prod-elec-3',
    name: 'Polaroid Now+ Instant Camera',
    slug: 'polaroid-now-plus-instant-camera',
    description: 'Analog instant camera with app-connected creative controls, dual-lens autofocus, double exposure mode and light painting attachments.',
    shortDescription: 'App-connected analog instant film camera with autofocus.',
    images: [
      { url: img('1526170375885-4d8ecf77b99f'), publicId: '', alt: 'Polaroid Camera' },
      { url: img('1531297484001-80022131f5a1'), publicId: '', alt: 'Polaroid prints' },
    ],
    price: 12900,
    discountPrice: 11610,
    finalPrice: 11610,
    category: MOCK_CATEGORIES[4],
    brand: 'Field',
    seller: 'seller-northline' as any,
    store: { _id: 'store-northline', name: 'Northline Audio', slug: 'northline-audio' } as any,
    stock: 16,
    sku: 'FLD-POL-01',
    variants: [],
    specifications: { FilmFormat: 'i-Type & 600', Connectivity: 'Bluetooth LE', Lens: 'Optical grade coated PC' },
    tags: ['electronics', 'camera', 'polaroid', 'instant'],
    ratingAverage: 4.7,
    ratingCount: 18,
    isFeatured: false,
    status: 'active',
    soldCount: 39,
    createdAt: '2026-01-16T10:00:00.000Z',
  },

  // ---------------- Home & Living ----------------
  {
    _id: 'prod-home-1',
    name: 'Halden Solid White Oak Stool',
    slug: 'halden-solid-white-oak-stool',
    description: 'Solid white oak, hand-sanded and finished with natural organic hardwax oil. 46 cm seat height suitable as stool, side table, or plant plinth.',
    shortDescription: 'Hand-sanded solid white oak stool and accent table.',
    images: [
      { url: img('1503602642458-232111445657'), publicId: '', alt: 'Oak Stool' },
      { url: img('1524758631624-e2822e304c36'), publicId: '', alt: 'Oak Stool setting' },
    ],
    price: 4900,
    discountPrice: 4200,
    finalPrice: 4200,
    category: MOCK_CATEGORIES[5],
    brand: 'Terra',
    seller: 'seller-terra' as any,
    store: { _id: 'store-terra', name: 'Terra Objects', slug: 'terra-objects' } as any,
    stock: 22,
    sku: 'TER-STL-01',
    variants: [],
    specifications: { Material: 'FSC Solid White Oak', Height: '46 cm', Finish: 'Natural Matte Hardwax' },
    tags: ['home', 'furniture', 'oak', 'minimal'],
    ratingAverage: 4.9,
    ratingCount: 27,
    isFeatured: true,
    status: 'active',
    soldCount: 70,
    createdAt: '2026-01-07T10:00:00.000Z',
  },
  {
    _id: 'prod-home-2',
    name: 'Margot Tufted Bouclé Lounge Chair',
    slug: 'margot-tufted-boucle-lounge-chair',
    description: 'Button-tufted heavy bouclé upholstery on turned dark walnut legs. Engineered lumbar contouring for proper support during reading sessions.',
    shortDescription: 'Deep bouclé lounge chair with solid walnut timber base.',
    images: [
      { url: img('1567538096630-e0c55bd6374c'), publicId: '', alt: 'Lounge Chair' },
      { url: img('1519947486511-46149fa0a254'), publicId: '', alt: 'Lounge Chair profile' },
    ],
    price: 18900,
    discountPrice: 16900,
    finalPrice: 16900,
    category: MOCK_CATEGORIES[5],
    brand: 'Terra',
    seller: 'seller-terra' as any,
    store: { _id: 'store-terra', name: 'Terra Objects', slug: 'terra-objects' } as any,
    stock: 6,
    sku: 'TER-CHR-02',
    variants: [],
    specifications: { Fabric: 'Heavy Textured Bouclé', Frame: 'Kiln-Dried Hardwood', Fill: 'High-Density Foam & Feathers' },
    tags: ['home', 'chair', 'boucle', 'furniture'],
    ratingAverage: 5.0,
    ratingCount: 15,
    isFeatured: true,
    status: 'active',
    soldCount: 33,
    createdAt: '2026-01-13T10:00:00.000Z',
  },
];

export const MOCK_FACETS: ProductFacets = {
  brands: ['Aurel', 'Lumen', 'Northline', 'Stride', 'Atelier', 'Slate', 'Pulse', 'Field', 'Terra'],
  categories: MOCK_CATEGORIES.map((c) => ({ _id: c._id, name: c.name, slug: c.slug, count: c.productCount || 6 })),
  priceRange: { min: 4200, max: 139900 },
};

export function queryMockProducts(params: {
  q?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  featured?: boolean;
  rating?: number;
  sort?: string;
  page?: number;
  limit?: number;
}) {
  let list = [...MOCK_PRODUCTS];

  if (params.q) {
    const rx = params.q.toLowerCase().trim();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(rx) ||
        p.brand.toLowerCase().includes(rx) ||
        p.description.toLowerCase().includes(rx) ||
        p.tags.some((t) => t.toLowerCase().includes(rx)),
    );
  }

  if (params.category) {
    const catSlug = params.category.toLowerCase();
    list = list.filter((p) => {
      const c = typeof p.category === 'object' ? p.category.slug : p.category;
      return String(c).toLowerCase() === catSlug || (typeof p.category === 'object' && p.category._id === params.category);
    });
  }

  if (params.brand) {
    const b = params.brand.toLowerCase();
    list = list.filter((p) => p.brand.toLowerCase() === b);
  }

  if (params.minPrice !== undefined && Number.isFinite(params.minPrice)) {
    list = list.filter((p) => p.finalPrice >= params.minPrice!);
  }

  if (params.maxPrice !== undefined && Number.isFinite(params.maxPrice)) {
    list = list.filter((p) => p.finalPrice <= params.maxPrice!);
  }

  if (params.inStock) {
    list = list.filter((p) => p.stock > 0);
  }

  if (params.featured) {
    list = list.filter((p) => p.isFeatured);
  }

  if (params.rating) {
    list = list.filter((p) => p.ratingAverage >= params.rating!);
  }

  // Sort
  const sort = params.sort || '-createdAt';
  if (sort === 'finalPrice' || sort === 'price') {
    list.sort((a, b) => a.finalPrice - b.finalPrice);
  } else if (sort === '-finalPrice' || sort === '-price') {
    list.sort((a, b) => b.finalPrice - a.finalPrice);
  } else if (sort === '-ratingAverage') {
    list.sort((a, b) => b.ratingAverage - a.ratingAverage);
  } else if (sort === '-soldCount') {
    list.sort((a, b) => b.soldCount - a.soldCount);
  } else {
    // default recent
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  const page = Math.max(1, params.page || 1);
  const limit = Math.max(1, params.limit || 12);
  const total = list.length;
  const pages = Math.ceil(total / limit) || 1;
  const skip = (page - 1) * limit;
  const paginated = list.slice(skip, skip + limit);

  return {
    products: paginated,
    meta: {
      total,
      page,
      limit,
      pages,
      hasNext: page < pages,
      hasPrev: page > 1,
    },
  };
}
