/**
 * Demo catalogue for VELORA.
 *
 * Photography: Unsplash (free to use under the Unsplash licence). Each entry was
 * checked to load before being included.
 */

export const img = (id, w = 1200, h = 1500) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

const P = {
  watchSilver: '1523275335684-37898b6baf30',
  watchSmart: '1546868871-7041f2a55e12',
  watchChrono: '1524805444758-089113d48a6d',
  watchLeather: '1522312346375-d1a52e2b99b3',
  watchLux: '1567016432779-094069958ea5',
  headphonesYellow: '1505740420928-5e560c06d30e',
  headphonesBlack: '1546435770-a3e426bf472b',
  headphonesGrey: '1583394838336-acd977736f90',
  sneakerRed: '1542291026-7eec264c27ff',
  sneakerCoral: '1600185365483-26d7a4cc7519',
  sneakerBlack: '1491553895911-0055eca6402d',
  derbyTeal: '1560343090-f0409e92791a',
  heelBlue: '1543163521-1bf539c55dd2',
  sneakerMulti: '1560769629-975ec94e6a86',
  backpack: '1553062407-98eeb64c6a62',
  handbag: '1548036328-c9fa89d128fa',
  camera: '1526170375885-4d8ecf77b99f',
  laptopPurple: '1517336714731-489689fd1ca8',
  laptopDark: '1531297484001-80022131f5a1',
  phoneFront: '1511707171634-5f897ff02aa9',
  phoneBack: '1592750475338-74b7b21085ab',
  stool: '1503602642458-232111445657',
  chairCream: '1567538096630-e0c55bd6374c',
  interiorLamp: '1524758631624-e2822e304c36',
  sofaGreen: '1555041469-a586c61ea9bc',
  livingNeutral: '1616486338812-3dadae4b4ace',
  chairYellow: '1586023492125-27b2c045efd7',
  sofaGrey: '1493663284031-b7e3aefcae8e',
  livingBrass: '1618221195710-dd6b41faaea6',
  deskMinimal: '1519710164239-da123dc03ef4',
  chairBlack: '1592078615290-033ee584e267',
  lampPendant: '1513506003901-1e6a229e2d15',
  chairWhite: '1519947486511-46149fa0a254',
  sofaRust: '1567016432779-094069958ea5',
  makeup: '1526947425960-945c6e72858f',
  serum: '1571781926291-c477ebfd024b',
  perfumeBlack: '1585386959984-a4155224a1ad',
  perfumeClear: '1541643600914-78b084683601',
  skincareTube: '1608571423902-eed4a5ad8108',
  bodyOil: '1556228720-195a672e8a03',
  skincareSet: '1596462502278-27bfdc403348',
  bookPoetry: '1544947950-fa07a98d237f',
  bookStack: '1512820790803-83ca734da794',
  booksShelf: '1495446815901-a7297e633e8d',
  library: '1507842217343-583bb7270b66',
  coffeeCups: '1495474472287-4d71bcdd2085',
  coffeeBeans: '1447933601403-0c6688de566e',
};

const gallery = (...ids) => ids.map((id) => img(id));

const shoeSizes = {
  name: 'Size',
  options: ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10'].map((label, index) => ({
    label,
    priceDelta: 0,
    stock: 12 - index,
  })),
};

const strap = {
  name: 'Strap',
  options: [
    { label: 'Leather', priceDelta: 1200, stock: 6 },
    { label: 'Steel Mesh', priceDelta: 0, stock: 8 },
    { label: 'Silicone', priceDelta: -800, stock: 10 },
  ],
};

const colorway = (labels) => ({
  name: 'Colour',
  options: labels.map((label) => ({ label, priceDelta: 0, stock: 8 })),
});

export const categories = [
  {
    name: 'Watches',
    description: 'Mechanical precision and quiet design, from everyday automatics to moonphase complications.',
    image: gallery(P.watchSilver, 900, 900)[0],
    sortOrder: 1,
    isFeatured: true,
  },
  {
    name: 'Audio',
    description: 'Headphones, monitors and turntables tuned for long listening sessions.',
    image: gallery(P.headphonesYellow, 900, 900)[0],
    sortOrder: 2,
    isFeatured: true,
  },
  {
    name: 'Footwear',
    description: 'Everyday runners, court classics and hand-finished leather.',
    image: gallery(P.sneakerRed, 900, 900)[0],
    sortOrder: 3,
    isFeatured: true,
  },
  {
    name: 'Bags',
    description: 'Carry pieces built from full-grain leather and heavyweight canvas.',
    image: gallery(P.backpack, 900, 900)[0],
    sortOrder: 4,
    isFeatured: true,
  },
  {
    name: 'Electronics',
    description: 'Laptops, phones and cameras for work that travels with you.',
    image: gallery(P.laptopDark, 900, 900)[0],
    sortOrder: 5,
    isFeatured: true,
  },
  {
    name: 'Home & Living',
    description: 'Furniture and objects chosen for texture, proportion and warmth.',
    image: gallery(P.interiorLamp, 900, 900)[0],
    sortOrder: 6,
    isFeatured: true,
  },
  {
    name: 'Beauty',
    description: 'Fragrance, skincare and colour with considered, quiet formulas.',
    image: gallery(P.makeup, 900, 900)[0],
    sortOrder: 7,
    isFeatured: true,
  },
  {
    name: 'Books',
    description: 'Design, business and poetry for the bedside table.',
    image: gallery(P.bookStack, 900, 900)[0],
    sortOrder: 8,
    isFeatured: true,
  },
  {
    name: 'Coffee & Pantry',
    description: 'Single-origin beans, brewing tools and slow mornings.',
    image: gallery(P.coffeeCups, 900, 900)[0],
    sortOrder: 9,
    isFeatured: true,
  },
];

export const sellers = [
  {
    key: 'aurel',
    name: 'Aarav Mehta',
    email: 'aarav@velora.shop',
    store: 'Aurel Studio',
    tagline: 'Watches and leather, made to be worn daily.',
    description:
      'Aurel Studio is a small Bengaluru atelier working with Swiss movements, Italian leather and a deliberately short catalogue. Every strap is cut and finished by hand.',
    city: 'Bengaluru',
    state: 'Karnataka',
    logo: gallery(P.watchSilver, 400, 400)[0],
    banner: gallery(P.watchChrono, 1600, 600)[0],
  },
  {
    key: 'northline',
    name: 'Diya Kapoor',
    store: 'Northline Audio',
    tagline: 'Listening rooms, not showrooms.',
    description:
      'Northline Audio curates headphones, monitors and turntables for people who listen closely. Each unit is bench-tested in our Pune workshop before it ships.',
    email: 'diya@velora.shop',
    city: 'Pune',
    state: 'Maharashtra',
    logo: gallery(P.headphonesBlack, 400, 400)[0],
    banner: gallery(P.headphonesYellow, 1600, 600)[0],
  },
  {
    key: 'stride',
    name: 'Meera Joshi',
    store: 'Stride Supply',
    tagline: 'Footwear for the long walk home.',
    description:
      'Stride Supply stocks running silhouettes, court classics and small-batch leather. Sizes run UK 6–10 and every pair ships with a spare set of laces.',
    email: 'meera@velora.shop',
    city: 'Mumbai',
    state: 'Maharashtra',
    logo: gallery(P.sneakerCoral, 400, 400)[0],
    banner: gallery(P.sneakerRed, 1600, 600)[0],
  },
  {
    key: 'terra',
    name: 'Rohan Iyer',
    store: 'Atelier Terra',
    tagline: 'Furniture that settles a room.',
    description:
      'Atelier Terra works with Indian workshops on oak, cane and linen. Pieces are made to order in small runs, with white-glove delivery in six cities.',
    email: 'rohan@velora.shop',
    city: 'Hyderabad',
    state: 'Telangana',
    logo: gallery(P.chairCream, 400, 400)[0],
    banner: gallery(P.livingNeutral, 1600, 600)[0],
  },
  {
    key: 'vela',
    name: 'Sana Sheikh',
    store: 'Vela Beauty',
    tagline: 'Quiet formulas, generous results.',
    description:
      'Vela Beauty formulates fragrance and skincare in small batches in Goa. No sulphates, no parabens, and refillable glass wherever we can manage it.',
    email: 'sana@velora.shop',
    city: 'Panaji',
    state: 'Goa',
    logo: gallery(P.serum, 400, 400)[0],
    banner: gallery(P.makeup, 1600, 600)[0],
  },
  {
    key: 'press',
    name: 'Kabir Nair',
    store: 'Page & Press',
    tagline: 'Books, beans and slow mornings.',
    description:
      'Page & Press is a Kochi bookshop and micro-roastery. We publish a short list of design titles and roast single-origin coffee every Tuesday.',
    email: 'kabir@velora.shop',
    city: 'Kochi',
    state: 'Kerala',
    logo: gallery(P.bookStack, 400, 400)[0],
    banner: gallery(P.booksShelf, 1600, 600)[0],
  },
];

export const customers = [
  { name: 'Ananya Sharma', email: 'ananya@example.com', city: 'Delhi', state: 'Delhi', phone: '9810012345' },
  { name: 'Vikram Rao', email: 'vikram@example.com', city: 'Bengaluru', state: 'Karnataka', phone: '9845012345' },
  { name: 'Isha Menon', email: 'isha@example.com', city: 'Kochi', state: 'Kerala', phone: '9847012345' },
  { name: 'Dev Patel', email: 'dev@example.com', city: 'Ahmedabad', state: 'Gujarat', phone: '9825012345' },
  { name: 'Naina Verma', email: 'naina@example.com', city: 'Jaipur', state: 'Rajasthan', phone: '9829012345' },
];

/**
 * Compact product table. `detail` becomes part of the description so every
 * listing reads like a real catalogue rather than filler copy.
 */
export const products = [
  // ---------------------------------------------------------------- Watches
  { name: 'Meridian Automatic 38', brand: 'Aurel', category: 'Watches', store: 'aurel', price: 28900, discountPrice: 24900, stock: 12, images: [P.watchSilver, P.watchChrono], variants: [strap], featured: true, detail: 'A 38 mm brushed-steel case over a sandblasted dial, with a 41-hour power reserve.' },
  { name: 'Lumen Smart Watch Series 7', brand: 'Lumen', category: 'Watches', store: 'aurel', price: 24500, discountPrice: 21900, stock: 18, images: [P.watchSmart, P.watchSilver], variants: [colorway(['Midnight', 'Silver', 'Sand'])], featured: true, detail: 'Always-on AMOLED display, seven-day battery and sleep tracking that actually stays on.' },
  { name: 'Heritage Chronograph Tan', brand: 'Aurel', category: 'Watches', store: 'aurel', price: 32000, discountPrice: 28500, stock: 7, images: [P.watchChrono, P.watchLeather], variants: [strap], detail: 'Twin-register chronograph with a domed sapphire crystal and hand-stitched tan leather.' },
  { name: 'Noir Ceramic Minimal', brand: 'Lumen', category: 'Watches', store: 'aurel', price: 12400, discountPrice: 0, stock: 22, images: [P.watchSmart, P.watchLux], detail: 'Matte ceramic bezel, 34 mm case, and a dial stripped back to two hands and a date.' },
  { name: 'Atelier Moonphase', brand: 'Aurel', category: 'Watches', store: 'aurel', price: 41500, discountPrice: 39900, stock: 4, images: [P.watchLux, P.watchChrono], variants: [strap], featured: true, detail: 'A moonphase aperture in deep navy, limited to 120 pieces for this collection.' },
  { name: 'Studio Mesh 34', brand: 'Aurel', category: 'Watches', store: 'aurel', price: 9800, discountPrice: 8400, stock: 16, images: [P.watchLeather, P.watchSilver], detail: 'Slim 34 mm case on a Milanese mesh strap — the easiest watch to wear every day.' },

  // ------------------------------------------------------------------ Audio
  { name: 'Solstice Over-Ear Wireless', brand: 'Northline', category: 'Audio', store: 'northline', price: 14900, discountPrice: 12665, stock: 24, images: [P.headphonesBlack, P.headphonesYellow, P.headphonesGrey], variants: [colorway(['Black', 'Sand'])], featured: true, detail: 'Adaptive noise cancelling, 38-hour battery, and earcups that stay comfortable past hour four.' },
  { name: 'Halo Studio Monitors', brand: 'Northline', category: 'Audio', store: 'northline', price: 18400, discountPrice: 0, stock: 9, images: [P.headphonesYellow, P.headphonesGrey], detail: 'A pair of near-field monitors with a genuinely flat response and rear-ported cabinets.' },
  { name: 'Drift Wireless Earbuds', brand: 'Northline', category: 'Audio', store: 'northline', price: 6900, discountPrice: 5520, stock: 40, images: [P.headphonesGrey, P.headphonesBlack], featured: true, detail: 'Six hours per bud, a pocketable case, and multipoint pairing that switches cleanly.' },
  { name: 'Ridge Wired Headphones', brand: 'Northline', category: 'Audio', store: 'northline', price: 3200, discountPrice: 0, stock: 32, images: [P.headphonesGrey, P.headphonesBlack], detail: 'Closed-back wired headphones with a detachable cable — no battery, no app.' },
  { name: 'Echo Mini Speaker', brand: 'Northline', category: 'Audio', store: 'northline', price: 4500, discountPrice: 3999, stock: 28, images: [P.headphonesYellow, P.headphonesBlack], detail: 'A palm-sized speaker with surprising low end and a twelve-hour charge.' },
  { name: 'Northline DAC Amplifier', brand: 'Northline', category: 'Audio', store: 'northline', price: 21000, discountPrice: 0, stock: 6, images: [P.headphonesBlack, P.headphonesGrey], detail: 'Desktop DAC and headphone amplifier in machined aluminium, with balanced output.' },
  { name: 'Aero Sport Buds', brand: 'Northline', category: 'Audio', store: 'northline', price: 2999, discountPrice: 0, stock: 50, images: [P.headphonesGrey, P.headphonesYellow], detail: 'Sweat-resistant buds with ear hooks that hold through a full run.' },
  { name: 'Vinyl One Turntable', brand: 'Northline', category: 'Audio', store: 'northline', price: 26500, discountPrice: 24900, stock: 5, images: [P.headphonesBlack, P.headphonesYellow], detail: 'Belt-driven turntable with a carbon tonearm and a pre-mounted moving-magnet cartridge.' },

  // --------------------------------------------------------------- Footwear
  { name: 'Ace Runner Crimson', brand: 'Stride', category: 'Footwear', store: 'stride', price: 8999, discountPrice: 7199, stock: 30, images: [P.sneakerRed, P.sneakerCoral], variants: [shoeSizes], featured: true, detail: 'A lightweight knit runner with a 6 mm drop and a foam midsole that holds its shape.' },
  { name: 'Aero Max Coral', brand: 'Stride', category: 'Footwear', store: 'stride', price: 9499, discountPrice: 8099, stock: 26, images: [P.sneakerCoral, P.sneakerRed], variants: [shoeSizes], featured: true, detail: 'A retro-inspired upper over a visible air unit, finished in coral and bone.' },
  { name: 'Velocity Black Knit', brand: 'Stride', category: 'Footwear', store: 'stride', price: 7499, discountPrice: 0, stock: 34, images: [P.sneakerBlack, P.sneakerRed], variants: [shoeSizes], detail: 'All-black everyday runner with a sock-fit collar and a grippy rubber outsole.' },
  { name: 'Derby Teal Suede', brand: 'Atelier', category: 'Footwear', store: 'stride', price: 6900, discountPrice: 5900, stock: 14, images: [P.derbyTeal, P.sneakerBlack], variants: [shoeSizes], detail: 'A hand-finished suede derby on a leather sole — soft from the first wear.' },
  { name: 'Bloom Heel Azure', brand: 'Atelier', category: 'Footwear', store: 'stride', price: 5400, discountPrice: 4590, stock: 11, images: [P.heelBlue, P.derbyTeal], variants: [colorway(['Azure Floral', 'Ivory'])], detail: 'A 90 mm stiletto in printed satin, with a padded insole for longer evenings.' },
  { name: 'Nomad Trail GTX', brand: 'Stride', category: 'Footwear', store: 'stride', price: 10900, discountPrice: 9810, stock: 18, images: [P.sneakerMulti, P.sneakerBlack], variants: [shoeSizes], detail: 'Waterproof trail shoe with a lugged outsole and a reinforced toe cap.' },
  { name: 'Court Low Mono', brand: 'Stride', category: 'Footwear', store: 'stride', price: 4999, discountPrice: 0, stock: 40, images: [P.sneakerRed, P.sneakerMulti], variants: [shoeSizes], detail: 'A clean court silhouette in full-grain white leather with a gum sole.' },
  { name: 'Slide Sandal Earth', brand: 'Stride', category: 'Footwear', store: 'stride', price: 1899, discountPrice: 1499, stock: 46, images: [P.derbyTeal, P.heelBlue], variants: [shoeSizes], detail: 'Moulded footbed, wide strap, and a sole that survives a wet Indian monsoon.' },
  { name: 'Runner Lite Grey', brand: 'Stride', category: 'Footwear', store: 'stride', price: 6299, discountPrice: 5299, stock: 24, images: [P.sneakerBlack, P.sneakerCoral], variants: [shoeSizes], detail: 'A breathable mesh trainer built for daily mileage at under 240 grams.' },
  { name: 'Studio Sneaker Multi', brand: 'Stride', category: 'Footwear', store: 'stride', price: 7900, discountPrice: 6700, stock: 15, images: [P.sneakerMulti, P.sneakerCoral], variants: [shoeSizes], featured: true, detail: 'Colour-blocked panels and an exaggerated sole — the loudest quiet shoe we stock.' },

  // ------------------------------------------------------------------- Bags
  { name: 'Voyager Leather Backpack', brand: 'Aurel', category: 'Bags', store: 'aurel', price: 7900, discountPrice: 6320, stock: 20, images: [P.backpack, P.handbag], featured: true, detail: 'Full-grain leather, a padded 16-inch laptop sleeve, and brass hardware that patinas.' },
  { name: 'Chevron Quilted Crossbody', brand: 'Aurel', category: 'Bags', store: 'aurel', price: 12600, discountPrice: 10700, stock: 12, images: [P.handbag, P.backpack], variants: [colorway(['Black', 'Bone'])], detail: 'Chevron-quilted leather with a chain strap that can be doubled for evening.' },
  { name: 'Weekender Canvas Duffel', brand: 'Aurel', category: 'Bags', store: 'aurel', price: 5400, discountPrice: 0, stock: 17, images: [P.backpack, P.handbag], detail: 'Waxed 18 oz canvas with leather handles — three days of clothes, one bag.' },
  { name: 'Mini Camera Bag Noir', brand: 'Aurel', category: 'Bags', store: 'aurel', price: 8900, discountPrice: 7600, stock: 9, images: [P.handbag, P.backpack], detail: 'A compact structured bag with an interior divider sized for a mirrorless camera.' },
  { name: 'Everyday Tote Sand', brand: 'Aurel', category: 'Bags', store: 'aurel', price: 4200, discountPrice: 3570, stock: 25, images: [P.backpack, P.handbag], detail: 'Unlined canvas tote with a leather base and a zip pocket for keys.' },
  { name: 'Card Holder Set', brand: 'Aurel', category: 'Bags', store: 'aurel', price: 1900, discountPrice: 0, stock: 60, images: [P.handbag, P.backpack], detail: 'Two slim card holders cut from the same hide, stitched by hand.' },

  // ------------------------------------------------------------- Electronics
  { name: 'Slate Book Pro 14', brand: 'Slate', category: 'Electronics', store: 'northline', price: 149900, discountPrice: 139900, stock: 8, images: [P.laptopPurple, P.laptopDark], variants: [{ name: 'Memory', options: [{ label: '16 GB / 512 GB', priceDelta: 0, stock: 5 }, { label: '32 GB / 1 TB', priceDelta: 30000, stock: 3 }] }], featured: true, detail: 'A 14-inch mini-LED display, 12-hour battery, and a keyboard worth typing on.' },
  { name: 'Pulse Phone 15', brand: 'Pulse', category: 'Electronics', store: 'northline', price: 79900, discountPrice: 74900, stock: 14, images: [P.phoneBack, P.phoneFront], variants: [{ name: 'Storage', options: [{ label: '128 GB', priceDelta: 0, stock: 6 }, { label: '256 GB', priceDelta: 8000, stock: 5 }, { label: '512 GB', priceDelta: 18000, stock: 3 }] }], featured: true, detail: 'A triple-camera system, titanium frame and a display that stays readable outdoors.' },
  { name: 'Polaroid Now+ Camera', brand: 'Field', category: 'Electronics', store: 'northline', price: 12900, discountPrice: 11610, stock: 16, images: [P.camera, P.laptopDark], detail: 'Instant film camera with app-controlled aperture, double exposure and a tripod mount.' },
  { name: 'Slate Book Air 13', brand: 'Slate', category: 'Electronics', store: 'northline', price: 99900, discountPrice: 0, stock: 11, images: [P.laptopDark, P.laptopPurple], detail: 'Fanless, 1.1 kg, and enough battery for a full working day away from a plug.' },
  { name: 'Pulse Phone Mini', brand: 'Pulse', category: 'Electronics', store: 'northline', price: 54900, discountPrice: 51900, stock: 19, images: [P.phoneFront, P.phoneBack], variants: [{ name: 'Storage', options: [{ label: '128 GB', priceDelta: 0, stock: 12 }, { label: '256 GB', priceDelta: 6000, stock: 7 }] }], detail: 'The same camera system in a body that fits a jacket pocket.' },
  { name: 'Studio Display 27', brand: 'Slate', category: 'Electronics', store: 'northline', price: 44900, discountPrice: 0, stock: 7, images: [P.laptopPurple, P.camera], detail: '27-inch 5K panel with 600 nits, a built-in webcam and a height-adjustable stand.' },
  { name: 'Field Instant Film Pack', brand: 'Field', category: 'Electronics', store: 'northline', price: 1499, discountPrice: 0, stock: 80, images: [P.camera, P.phoneBack], detail: 'Sixteen frames of instant film, cool-toned, for the Field and Polaroid cameras.' },
  { name: 'Desk Hub 8-in-1', brand: 'Northline', category: 'Electronics', store: 'northline', price: 3499, discountPrice: 2999, stock: 36, images: [P.laptopDark, P.camera], detail: 'HDMI, two USB-C, SD, Ethernet and 100 W passthrough in an aluminium shell.' },

  // ----------------------------------------------------------- Home & Living
  { name: 'Halden Oak Stool', brand: 'Terra', category: 'Home & Living', store: 'terra', price: 4900, discountPrice: 4200, stock: 22, images: [P.stool, P.interiorLamp], detail: 'Solid white oak, hand-sanded and finished with hardwax oil. 46 cm seat height.' },
  { name: 'Margot Tufted Lounge Chair', brand: 'Terra', category: 'Home & Living', store: 'terra', price: 18900, discountPrice: 16900, stock: 6, images: [P.chairCream, P.chairWhite], variants: [colorway(['Ivory', 'Sand'])], featured: true, detail: 'Button-tufted upholstery on turned legs — a reading chair with proper back support.' },
  { name: 'Arc Floor Lamp Noir', brand: 'Terra', category: 'Home & Living', store: 'terra', price: 12400, discountPrice: 10900, stock: 10, images: [P.interiorLamp, P.lampPendant], detail: 'A 2.1 m arc in powder-coated steel with a weighted marble base.' },
  { name: 'Velvet Two-Seater Sofa', brand: 'Terra', category: 'Home & Living', store: 'terra', price: 42000, discountPrice: 37800, stock: 4, images: [P.sofaGreen, P.sofaGrey], variants: [colorway(['Emerald', 'Charcoal'])], featured: true, detail: 'Deep green cotton velvet over a kiln-dried hardwood frame, with feather-blend cushions.' },
  { name: 'Linen Sofa Ivory', brand: 'Terra', category: 'Home & Living', store: 'terra', price: 38500, discountPrice: 0, stock: 5, images: [P.livingNeutral, P.sofaGrey], detail: 'Washed linen slipcover, removable and washable, on a low oak base.' },
  { name: 'Ochre Accent Chair', brand: 'Terra', category: 'Home & Living', store: 'terra', price: 16500, discountPrice: 14900, stock: 7, images: [P.chairYellow, P.livingBrass], detail: 'A single bold chair — ochre bouclé on tapered black legs.' },
  { name: 'Ash Lounge Chair', brand: 'Terra', category: 'Home & Living', store: 'terra', price: 14900, discountPrice: 12900, stock: 9, images: [P.chairBlack, P.chairWhite], detail: 'Moulded shell seat on solid ash legs; comfortable without a single cushion.' },
  { name: 'Pendant Lamp Chalk', brand: 'Terra', category: 'Home & Living', store: 'terra', price: 3900, discountPrice: 3300, stock: 28, images: [P.lampPendant, P.interiorLamp], detail: 'Spun aluminium pendant with a 2 m fabric cord and a warm 2700 K bulb.' },
  { name: 'Round Coffee Table Oak', brand: 'Terra', category: 'Home & Living', store: 'terra', price: 9900, discountPrice: 8900, stock: 12, images: [P.livingBrass, P.deskMinimal], detail: 'A 90 cm oak top on three turned legs, low enough to sit around on the floor.' },
  { name: 'Tassel Cushion Cover', brand: 'Terra', category: 'Home & Living', store: 'terra', price: 899, discountPrice: 749, stock: 70, images: [P.sofaGrey, P.sofaGreen], variants: [colorway(['Teal', 'Sand', 'Rust'])], detail: 'Handwoven cotton with a tasselled edge. Cover only, 45 × 45 cm.' },
  { name: 'Woven Pouf Sand', brand: 'Terra', category: 'Home & Living', store: 'terra', price: 2400, discountPrice: 2040, stock: 18, images: [P.livingNeutral, P.livingBrass], detail: 'A dense woven pouf that works as an extra seat or a footrest.' },
  { name: 'Canvas Wall Print Set', brand: 'Terra', category: 'Home & Living', store: 'terra', price: 1800, discountPrice: 0, stock: 32, images: [P.chairYellow, P.livingNeutral], detail: 'Three archival prints on textured paper, unframed, 30 × 40 cm each.' },
  { name: 'Reed Diffuser Cedar', brand: 'Vela', category: 'Home & Living', store: 'terra', price: 1450, discountPrice: 1200, stock: 44, images: [P.deskMinimal, P.lampPendant], detail: 'Cedar, vetiver and a little smoke. Lasts about ten weeks.' },
  { name: 'Ceramic Vase Matte', brand: 'Terra', category: 'Home & Living', store: 'terra', price: 1299, discountPrice: 1099, stock: 38, images: [P.chairBlack, P.stool], detail: 'Wheel-thrown stoneware in a chalk matte glaze; each piece varies slightly.' },
  { name: 'Curtain Panel Oat', brand: 'Terra', category: 'Home & Living', store: 'terra', price: 2200, discountPrice: 0, stock: 26, images: [P.sofaGrey, P.livingBrass], detail: 'Heavy linen-blend panel with a 3-inch rod pocket, 140 × 260 cm.' },
  { name: 'Cane Bar Stool', brand: 'Terra', category: 'Home & Living', store: 'terra', price: 5600, discountPrice: 4900, stock: 14, images: [P.stool, P.chairBlack], detail: 'Hand-woven cane seat on a solid teak frame, 66 cm.' },

  // ----------------------------------------------------------------- Beauty
  { name: 'No. 05 Eau de Parfum', brand: 'Vela', category: 'Beauty', store: 'vela', price: 9800, discountPrice: 8600, stock: 16, images: [P.perfumeClear, P.perfumeBlack], variants: [{ name: 'Size', options: [{ label: '50 ml', priceDelta: 0, stock: 10 }, { label: '100 ml', priceDelta: 3200, stock: 6 }] }], featured: true, detail: 'Bergamot, jasmine and a warm cedar base. Eau de parfum, eight-hour wear.' },
  { name: 'Coco Body Oil', brand: 'Vela', category: 'Beauty', store: 'vela', price: 1499, discountPrice: 1299, stock: 40, images: [P.bodyOil, P.serum], detail: 'Cold-pressed coconut and sweet almond oil, unscented, in a 200 ml glass bottle.' },
  { name: 'Midnight Repair Serum', brand: 'Vela', category: 'Beauty', store: 'vela', price: 2400, discountPrice: 2040, stock: 30, images: [P.serum, P.bodyOil], featured: true, detail: '0.3% retinol with squalane and niacinamide — start twice a week.' },
  { name: 'Studio Brush Set', brand: 'Vela', category: 'Beauty', store: 'vela', price: 3200, discountPrice: 2750, stock: 20, images: [P.makeup, P.skincareTube], detail: 'Six vegan brushes with weighted handles and a canvas roll.' },
  { name: 'Noir Parfum Intense', brand: 'Vela', category: 'Beauty', store: 'vela', price: 12500, discountPrice: 0, stock: 8, images: [P.perfumeBlack, P.perfumeClear], detail: 'Oud, black tea and vanilla in a heavy glass flacon. A colder-weather scent.' },
  { name: 'Hydra Cleansing Balm', brand: 'Vela', category: 'Beauty', store: 'vela', price: 1199, discountPrice: 0, stock: 36, images: [P.skincareSet, P.makeup], detail: 'A sherbet balm that melts sunscreen and makeup without stripping the skin.' },
  { name: 'Lip Tint Rosewood', brand: 'Vela', category: 'Beauty', store: 'vela', price: 899, discountPrice: 749, stock: 55, images: [P.makeup, P.perfumeClear], variants: [colorway(['Rosewood', 'Brick', 'Plum'])], detail: 'A soft, buildable tint with shea butter. No fragrance, no shimmer.' },
  { name: 'Day Cream SPF 40', brand: 'Vela', category: 'Beauty', store: 'vela', price: 1650, discountPrice: 1485, stock: 34, images: [P.skincareTube, P.skincareSet], detail: 'Broad-spectrum SPF 40 in a lightweight gel-cream that sits well under makeup.' },

  // ------------------------------------------------------------------ Books
  { name: 'The Quiet Garden', brand: 'Page & Press', category: 'Books', store: 'press', price: 599, discountPrice: 499, stock: 40, images: [P.bookPoetry, P.booksShelf], detail: 'A slow novel about three generations and one overgrown garden. Paperback, 312 pages.' },
  { name: 'Zero to One', brand: 'Page & Press', category: 'Books', store: 'press', price: 499, discountPrice: 0, stock: 52, images: [P.bookStack, P.booksShelf], detail: 'Notes on startups, monopolies and building the future. Paperback, 224 pages.' },
  { name: 'Modern Home Stories', brand: 'Page & Press', category: 'Books', store: 'press', price: 1299, discountPrice: 1099, stock: 22, images: [P.library, P.bookPoetry], featured: true, detail: 'Twenty-four interiors photographed across India, with plans and material notes.' },
  { name: 'Milk and Honey', brand: 'Page & Press', category: 'Books', store: 'press', price: 450, discountPrice: 399, stock: 60, images: [P.bookPoetry, P.library], detail: 'Poetry and prose on love, loss and healing. Paperback, 208 pages.' },
  { name: 'Design Thinking Handbook', brand: 'Page & Press', category: 'Books', store: 'press', price: 899, discountPrice: 799, stock: 28, images: [P.bookStack, P.library], detail: 'A practical workbook of research, prototyping and critique methods.' },
  { name: "The Startup Owner's Manual", brand: 'Page & Press', category: 'Books', store: 'press', price: 1499, discountPrice: 1299, stock: 16, images: [P.bookStack, P.booksShelf], detail: 'The step-by-step guide to building a company that customers actually want.' },

  // --------------------------------------------------------- Coffee & Pantry
  { name: 'Single Origin Beans 250g', brand: 'Press Roastery', category: 'Coffee & Pantry', store: 'press', price: 649, discountPrice: 549, stock: 60, images: [P.coffeeBeans, P.coffeeCups], variants: [{ name: 'Grind', options: [{ label: 'Whole bean', priceDelta: 0, stock: 30 }, { label: 'Espresso', priceDelta: 0, stock: 15 }, { label: 'Filter', priceDelta: 0, stock: 15 }] }], featured: true, detail: 'A washed Chikmagalur lot with notes of cocoa, orange peel and jaggery.' },
  { name: 'Cold Brew Bottle 500ml', brand: 'Press Roastery', category: 'Coffee & Pantry', store: 'press', price: 449, discountPrice: 0, stock: 40, images: [P.coffeeCups, P.coffeeBeans], detail: 'Steeped for eighteen hours, bottled cold, no sugar. Best within five days.' },
  { name: 'Ceramic Pour-Over Set', brand: 'Press Roastery', category: 'Coffee & Pantry', store: 'press', price: 1899, discountPrice: 1650, stock: 18, images: [P.coffeeCups, P.coffeeBeans], detail: 'A stoneware dripper, carafe and 40 filters — everything for two cups.' },
  { name: 'Espresso Blend 500g', brand: 'Press Roastery', category: 'Coffee & Pantry', store: 'press', price: 1049, discountPrice: 899, stock: 44, images: [P.coffeeBeans, P.coffeeCups], detail: 'A 70/30 arabica-robusta blend built for milk drinks and consistency.' },
];

export const coupons = [
  {
    code: 'VELORA10',
    description: '10% off your order, up to ₹750',
    type: 'percent',
    value: 10,
    minOrder: 1499,
    maxDiscount: 750,
    usageLimit: 0,
    perUserLimit: 2,
    daysValid: 90,
  },
  {
    code: 'WELCOME200',
    description: '₹200 off your first order above ₹999',
    type: 'fixed',
    value: 200,
    minOrder: 999,
    maxDiscount: 0,
    usageLimit: 500,
    perUserLimit: 1,
    daysValid: 120,
  },
  {
    code: 'ATHOME15',
    description: '15% off Home & Living, up to ₹2,500',
    type: 'percent',
    value: 15,
    minOrder: 2499,
    maxDiscount: 2500,
    usageLimit: 0,
    perUserLimit: 3,
    daysValid: 60,
    category: 'Home & Living',
  },
  {
    code: 'STYLE500',
    description: '₹500 off when you spend ₹4,999 or more',
    type: 'fixed',
    value: 500,
    minOrder: 4999,
    maxDiscount: 0,
    usageLimit: 300,
    perUserLimit: 2,
    daysValid: 45,
  },
];

export const banners = [
  {
    title: 'The Quiet Hours Edit',
    subtitle: 'Cashmere-soft lighting, low-slung seating and objects that ask for nothing.',
    ctaLabel: 'Shop the edit',
    link: '/category/home-living',
    image: gallery(P.livingNeutral, 1600, 900)[0],
    theme: 'light',
    position: 'home_hero',
    sortOrder: 1,
  },
  {
    title: 'Mechanical, not magical',
    subtitle: 'Automatic movements and hand-finished straps from Aurel Studio.',
    ctaLabel: 'Explore watches',
    link: '/category/watches',
    image: gallery(P.watchChrono, 1600, 900)[0],
    theme: 'dark',
    position: 'home_hero',
    sortOrder: 2,
  },
  {
    title: 'Up to 25% off footwear',
    subtitle: 'Runners, court classics and leather derbies — this week only.',
    ctaLabel: 'Shop footwear',
    link: '/category/footwear',
    image: gallery(P.sneakerCoral, 1600, 700)[0],
    theme: 'accent',
    position: 'home_strip',
    sortOrder: 1,
  },
  {
    title: 'Free delivery above ₹999',
    subtitle: 'Across all six VELORA stores, on every pin code we serve.',
    ctaLabel: 'Start shopping',
    link: '/shop',
    image: gallery(P.sofaGreen, 1600, 700)[0],
    theme: 'light',
    position: 'home_strip',
    sortOrder: 2,
  },
];

export const testimonials = [
  {
    name: 'Priya Raghavan',
    role: 'Interior designer, Chennai',
    quote:
      'The Terra sofa arrived in nine days with the fabric swatch I asked for. It is the only marketplace where the photography matched the piece.',
    rating: 5,
  },
  {
    name: 'Arjun Deshpande',
    role: 'Sound engineer, Mumbai',
    quote:
      'Northline actually bench-tests what they sell. My monitors arrived with the frequency response sheet in the box.',
    rating: 5,
  },
  {
    name: 'Leela Thomas',
    role: 'Writer, Bengaluru',
    quote:
      'I bought a watch, returned a strap, and the refund landed before the courier update did. Quietly excellent service.',
    rating: 5,
  },
  {
    name: 'Mohit Bansal',
    role: 'Founder, Gurugram',
    quote:
      'Ordered from three different sellers in one checkout and could track each parcel separately. That is the whole promise, delivered.',
    rating: 4,
  },
];

export const reviewBodies = [
  { rating: 5, title: 'Exactly as described', body: 'Packaging was careful and the finish is better than the photos suggest. Would order from this store again.' },
  { rating: 5, title: 'Worth the price', body: 'I waited a month before reviewing. It has held up beautifully with daily use — no loose stitching, no fading.' },
  { rating: 4, title: 'Very good, minor niggle', body: 'Build quality is excellent. Delivery took a day longer than the estimate, but the seller kept me updated.' },
  { rating: 4, title: 'Great everyday piece', body: 'Slightly heavier than I expected, which I actually like. Sizing advice in the listing was accurate.' },
  { rating: 5, title: 'Bought a second one', body: 'Ordered one for myself and immediately ordered another as a gift. The colour is true to the photographs.' },
  { rating: 3, title: 'Good, not perfect', body: 'Does what it says. I would have liked a longer cable and a slightly softer finish at this price.' },
  { rating: 5, title: 'Beautifully finished', body: 'You can tell someone checked this before it shipped. The little care card was a nice touch.' },
  { rating: 4, title: 'Happy with the purchase', body: 'Arrived well packed, works exactly as expected, and the return window gave me confidence to try it.' },
];
