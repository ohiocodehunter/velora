/**
 * VELORA seed script.
 *
 *   npm run seed           create demo data
 *   npm run seed:destroy   wipe every collection and start clean
 */
import mongoose from 'mongoose';
import config from '../config/env.js';
import { connectDB, disconnectDB } from '../config/db.js';
import Address from '../models/Address.js';
import Banner from '../models/Banner.js';
import Cart from '../models/Cart.js';
import Category from '../models/Category.js';
import ContactMessage from '../models/ContactMessage.js';
import Coupon from '../models/Coupon.js';
import Newsletter from '../models/Newsletter.js';
import Notification from '../models/Notification.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Review from '../models/Review.js';
import Store from '../models/Store.js';
import User from '../models/User.js';
import Wishlist from '../models/Wishlist.js';
import { toSlug } from '../utils/slug.js';
import { buildOrderNumber } from '../utils/orderStatus.js';
import { round2 } from '../utils/money.js';
import { banners, categories, coupons, customers, products, reviewBodies, sellers, testimonials } from './data.js';

const PASSWORD = config.seed.password;
const ADMIN_PASSWORD = config.admin.password;

const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (list) => list[Math.floor(Math.random() * list.length)];
const pickMany = (list, count) => {
  const copy = [...list];
  const chosen = [];
  while (chosen.length < count && copy.length) {
    chosen.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0]);
  }
  return chosen;
};

const collections = [
  Address, Banner, Cart, Category, ContactMessage, Coupon, Newsletter, Notification,
  Order, Product, Review, Store, User, Wishlist,
];

async function wipe() {
  for (const model of collections) {
    await model.deleteMany({});
  }
}

function specsFor(product) {
  const base = {
    Brand: product.brand,
    Warranty: product.category === 'Electronics' ? '1 year manufacturer warranty' : '6 months against manufacturing defects',
    Origin: 'Made in India',
    Care: 'Wipe with a soft, dry cloth',
  };
  if (product.category === 'Watches') {
    return { ...base, Movement: 'Automatic, 41-hour reserve', 'Case size': '38 mm', 'Water resistance': '50 m', Glass: 'Sapphire crystal' };
  }
  if (product.category === 'Audio') {
    return { ...base, Connectivity: 'Bluetooth 5.3 / USB-C', Battery: 'Up to 38 hours', Drivers: '40 mm dynamic', Weight: '265 g' };
  }
  if (product.category === 'Footwear') {
    return { ...base, Upper: 'Engineered knit / leather', Sole: 'Rubber', Drop: '6 mm', Fit: 'True to size' };
  }
  if (product.category === 'Home & Living') {
    return { ...base, Material: 'Solid oak / linen upholstery', Assembly: 'Minimal, tools included', Delivery: 'White glove in 6 cities' };
  }
  if (product.category === 'Beauty') {
    return { ...base, Volume: '50 ml', Skin: 'All skin types', Free: 'Parabens, sulphates, fragrance' };
  }
  if (product.category === 'Books') {
    return { ...base, Format: 'Paperback', Language: 'English', Pages: '224' };
  }
  if (product.category === 'Coffee & Pantry') {
    return { ...base, Roast: 'Medium', Process: 'Washed', Altitude: '1,100 m', 'Best before': '6 months from roast' };
  }
  return base;
}

function descriptionFor(product) {
  return [
    `${product.name} by ${product.brand}.`,
    product.detail,
    `Sold by a verified VELORA store with a 7-day return window and free delivery above ₹999.`,
  ].join('\n\n');
}

async function seed() {
  console.log('\nClearing existing collections…');
  await wipe();

  /* ------------------------------------------------------------ admin */
  const admin = await User.create({
    name: 'VELORA Admin',
    email: config.admin.email,
    password: ADMIN_PASSWORD,
    role: 'admin',
    phone: '9000000000',
  });

  /* -------------------------------------------------------- categories */
  const categoryDocs = {};
  const categoryList = await Category.insertMany(
    categories.map((category, index) => ({
      name: category.name,
      slug: toSlug(category.name),
      description: category.description,
      image: { url: category.image },
      isFeatured: category.isFeatured,
      sortOrder: category.sortOrder ?? index,
    })),
  );
  categoryList.forEach((category) => {
    categoryDocs[category.name] = category;
  });
  console.log(`Categories: ${categoryList.length}`);

  /* ------------------------------------------------------ stores/users */
  const sellerDocs = {};
  const storeDocs = {};
  for (const seller of sellers) {
    const user = await User.create({
      name: seller.name,
      email: seller.email,
      password: PASSWORD,
      phone: `98${random(10000000, 99999999)}`.slice(0, 10),
      role: 'seller',
      sellerStatus: 'approved',
    });
    const store = await Store.create({
      owner: user._id,
      name: seller.store,
      slug: toSlug(seller.store),
      tagline: seller.tagline,
      description: seller.description,
      logo: { url: seller.logo },
      banner: { url: seller.banner },
      email: seller.email,
      phone: `98${random(10000000, 99999999)}`.slice(0, 10),
      address: { line1: 'Studio 4, Warehouse Lane', city: seller.city, state: seller.state, pincode: String(random(110001, 700099)).slice(0, 6).padStart(6, '4') },
      policies: {
        shipping: 'Dispatched within 2 working days. Free above ₹999.',
        returns: '7-day returns on unused items in original packaging.',
      },
      status: 'approved',
      ratingAverage: round2(4.2 + Math.random() * 0.7),
      ratingCount: random(24, 180),
    });
    user.store = store._id;
    await user.save({ validateBeforeSave: false });
    sellerDocs[seller.key] = user;
    storeDocs[seller.key] = store;
  }
  console.log(`Sellers: ${sellers.length}`);

  const customerDocs = [];
  for (const customer of customers) {
    const user = await User.create({
      name: customer.name,
      email: customer.email,
      password: PASSWORD,
      phone: customer.phone,
      role: 'customer',
    });
    await Address.create({
      user: user._id,
      label: 'Home',
      fullName: customer.name,
      phone: customer.phone,
      line1: `${random(10, 99)}, ${pick(['Rosewood Residency', 'Palm Grove Apartments', 'Cedar Court', 'Lakeside Enclave'])}`,
      line2: pick(['Near Metro Station', 'Opposite City Park', 'Behind the Market']),
      city: customer.city,
      state: customer.state,
      pincode: String(random(110001, 682099)),
      isDefault: true,
    });
    await Address.create({
      user: user._id,
      label: 'Office',
      fullName: customer.name,
      phone: customer.phone,
      line1: `${random(1, 40)} ${pick(['Tech Park', 'Business Bay', 'Commerce House'])}`,
      line2: `${pick(['Level 3', 'Tower B', 'Block C'])}`,
      city: customer.city,
      state: customer.state,
      pincode: String(random(110001, 682099)),
      isDefault: false,
    });
    customerDocs.push(user);
  }
  console.log(`Customers: ${customerDocs.length}`);

  // One pending application so the admin approval queue is never empty.
  const applicant = customerDocs[3];
  const pendingStore = await Store.create({
    owner: applicant._id,
    name: "Dev's Den",
    slug: 'devs-den',
    tagline: 'Independent design objects.',
    description: 'A small selection of ceramics and prints from studio potters in Ahmedabad.',
    status: 'pending',
    address: { line1: '12 Design Street', city: 'Ahmedabad', state: 'Gujarat', pincode: '380015' },
    email: applicant.email,
    phone: applicant.phone,
  });
  applicant.sellerStatus = 'pending';
  await applicant.save({ validateBeforeSave: false });
  console.log(`Pending seller application: ${pendingStore.name}`);

  /* ------------------------------------------------------------ products */
  const productDocs = [];
  for (const item of products) {
    const storeOwner = sellerDocs[item.store];
    const store = storeDocs[item.store];
    const slug = toSlug(item.name);
    productDocs.push({
      name: item.name,
      slug,
      description: descriptionFor(item),
      shortDescription: item.detail,
      images: item.images.map((url, index) => ({
        url: `https://images.unsplash.com/photo-${url}?auto=format&fit=crop&w=1200&h=1500&q=80`,
        alt: `${item.name} — view ${index + 1}`,
      })),
      price: item.price,
      discountPrice: item.discountPrice || 0,
      finalPrice:
        item.discountPrice > 0 && item.discountPrice < item.price ? item.discountPrice : item.price,
      category: categoryDocs[item.category]._id,
      brand: item.brand,
      seller: storeOwner._id,
      store: store._id,
      stock: item.stock,
      sku: `VLR-${item.category.slice(0, 2).toUpperCase()}-${slug.slice(0, 10).toUpperCase().replace(/-/g, '')}-${String(productDocs.length + 1).padStart(3, '0')}`,
      variants: item.variants || [],
      specifications: specsFor(item),
      tags: [item.category.toLowerCase(), item.brand.toLowerCase(), ...item.name.toLowerCase().split(' ').slice(0, 3)],
      isFeatured: Boolean(item.featured),
      status: 'active',
      soldCount: random(0, 40),
      createdAt: new Date(Date.now() - random(20, 200) * 24 * 60 * 60 * 1000),
    });
  }
  const createdProducts = await Product.insertMany(productDocs);
  console.log(`Products: ${createdProducts.length}`);

  // Store counters
  for (const key of Object.keys(storeDocs)) {
    const count = createdProducts.filter((p) => String(p.store) === String(storeDocs[key]._id)).length;
    await Store.updateOne({ _id: storeDocs[key]._id }, { $set: { productCount: count } });
  }

  /* ------------------------------------------------------------- coupons */
  const couponDocs = [];
  for (const coupon of coupons) {
    couponDocs.push(
      await Coupon.create({
        code: coupon.code,
        description: coupon.description,
        type: coupon.type,
        value: coupon.value,
        minOrder: coupon.minOrder,
        maxDiscount: coupon.maxDiscount,
        usageLimit: coupon.usageLimit,
        perUserLimit: coupon.perUserLimit,
        startsAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(Date.now() + coupon.daysValid * 24 * 60 * 60 * 1000),
        isActive: true,
        appliesTo: coupon.category ? { categories: [categoryDocs[coupon.category]._id] } : {},
      }),
    );
  }
  console.log(`Coupons: ${couponDocs.length}`);

  /* ------------------------------------------------------------- banners */
  await Banner.insertMany(
    banners.map((banner) => ({
      title: banner.title,
      subtitle: banner.subtitle,
      ctaLabel: banner.ctaLabel,
      link: banner.link,
      image: { url: banner.image },
      theme: banner.theme,
      position: banner.position,
      sortOrder: banner.sortOrder,
      isActive: true,
    })),
  );

  /* -------------------------------------------------------------- orders */
  const statusPlan = [
    'delivered', 'delivered', 'delivered', 'delivered', 'delivered', 'delivered',
    'delivered', 'delivered', 'delivered', 'delivered', 'delivered', 'delivered',
    'shipped', 'shipped', 'processing', 'processing', 'confirmed', 'confirmed',
    'pending', 'cancelled', 'delivered', 'delivered', 'shipped', 'processing',
  ];
  const flow = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'];

  let orderCount = 0;
  for (let i = 0; i < 48; i += 1) {
    const customer = pick(customerDocs);
    const basket = pickMany(createdProducts, random(1, 3));
    const daysAgo = random(0, 175);
    const placedAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    const status = statusPlan[i % statusPlan.length];
    const paymentMethod = Math.random() > 0.35 ? 'razorpay' : 'cod';

    const items = basket.map((product) => {
      const quantity = random(1, 2);
      const price = product.finalPrice || product.price;
      const itemStatus = status === 'cancelled' ? 'cancelled' : status;
      return {
        product: product._id,
        seller: product.seller,
        store: product.store,
        name: product.name,
        image: product.images[0]?.url || '',
        slug: product.slug,
        sku: product.sku,
        variant: '',
        price,
        quantity,
        lineTotal: round2(price * quantity),
        status: itemStatus,
        statusHistory: [{ status: itemStatus, note: 'Seeded order', at: placedAt }],
      };
    });

    const itemsTotal = round2(items.reduce((sum, item) => sum + item.lineTotal, 0));
    const shipping = itemsTotal >= config.shipping.freeAbove ? 0 : config.shipping.fee;
    const tax = round2(itemsTotal * config.shipping.taxRate);
    const grandTotal = round2(itemsTotal + shipping + tax);

    const paid = paymentMethod === 'razorpay' ? status !== 'pending' && status !== 'cancelled' : status === 'delivered';

    let historyStatus = flow[Math.min(flow.indexOf(status) < 0 ? 1 : flow.indexOf(status), flow.length - 1)];
    if (status === 'cancelled') historyStatus = 'cancelled';
    const history = flow
      .slice(0, Math.max(1, flow.indexOf(historyStatus) + 1))
      .map((entry, index) => ({
        status: entry,
        note: index === 0 ? 'Order placed' : `Marked ${entry}`,
        at: new Date(placedAt.getTime() + index * 22 * 60 * 60 * 1000),
      }));
    if (status === 'cancelled') {
      history.push({ status: 'cancelled', note: 'Cancelled by customer', at: new Date(placedAt.getTime() + 6 * 60 * 60 * 1000) });
    }

    const address = await Address.findOne({ user: customer._id, isDefault: true });

    const order = new Order({
      orderNumber: `${buildOrderNumber()}-${String(i + 1).padStart(2, '0')}`,
      user: customer._id,
      items,
      shippingAddress: {
        fullName: address.fullName,
        phone: address.phone,
        line1: address.line1,
        line2: address.line2,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        country: 'India',
      },
      summary: {
        itemsTotal,
        discount: 0,
        shipping,
        tax,
        grandTotal,
        couponCode: '',
        currency: 'INR',
      },
      payment: {
        method: paymentMethod,
        status: paid ? 'paid' : status === 'cancelled' ? 'failed' : 'pending',
        paidAt: paid ? new Date(placedAt.getTime() + 30 * 60 * 1000) : undefined,
        razorpayOrderId: paymentMethod === 'razorpay' ? `order_seed_${i + 1}` : '',
        razorpayPaymentId: paid && paymentMethod === 'razorpay' ? `pay_seed_${i + 1}` : '',
      },
      status: status === 'pending' && paymentMethod === 'razorpay' ? 'pending' : status,
      statusHistory: history,
      deliveredAt: status === 'delivered' ? new Date(placedAt.getTime() + 4 * 24 * 60 * 60 * 1000) : undefined,
      cancelReason: status === 'cancelled' ? 'Changed my mind' : '',
      cancelledBy: status === 'cancelled' ? 'customer' : '',
      createdAt: placedAt,
      updatedAt: placedAt,
    });
    await order.save({ timestamps: false });
    orderCount += 1;
  }
  console.log(`Orders: ${orderCount}`);

  /* ------------------------------------------------------------- reviews */
  const reviewDocs = [];
  const usedPairs = new Set();
  for (let i = 0; i < 150; i += 1) {
    const product = pick(createdProducts);
    const customer = pick(customerDocs);
    const key = `${product._id}-${customer._id}`;
    if (usedPairs.has(key)) continue;
    usedPairs.add(key);

    const template = pick(reviewBodies);
    const delivered = await Order.exists({
      user: customer._id,
      'items.product': product._id,
      'items.status': 'delivered',
    });
    reviewDocs.push({
      product: product._id,
      seller: product.seller,
      user: customer._id,
      order: delivered?._id || null,
      rating: template.rating,
      title: template.title,
      body: template.body,
      isVerifiedPurchase: Boolean(delivered),
      status: 'visible',
      createdAt: new Date(Date.now() - random(1, 120) * 24 * 60 * 60 * 1000),
    });
    if (reviewDocs.length >= 110) break;
  }
  await Review.insertMany(reviewDocs);
  console.log(`Reviews: ${reviewDocs.length}`);

  // Recompute product and store ratings from the reviews just created.
  const ratingRows = await Review.aggregate([
    { $match: { status: 'visible' } },
    { $group: { _id: '$product', average: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  await Promise.all(
    ratingRows.map((row) =>
      Product.updateOne(
        { _id: row._id },
        { $set: { ratingAverage: Math.round(row.average * 10) / 10, ratingCount: row.count } },
      ),
    ),
  );

  for (const key of Object.keys(storeDocs)) {
    const store = storeDocs[key];
    const storeProducts = createdProducts.filter((product) => String(product.store) === String(store._id));
    const ids = storeProducts.map((product) => product._id);
    const [agg] = await Review.aggregate([
      { $match: { product: { $in: ids }, status: 'visible' } },
      { $group: { _id: null, average: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    await Store.updateOne(
      { _id: store._id },
      {
        $set: {
          ratingAverage: agg ? Math.round(agg.average * 10) / 10 : 0,
          ratingCount: agg?.count || 0,
        },
      },
    );
  }

  /* ------------------------------------------------ newsletter / misc */
  await Newsletter.insertMany([
    { email: 'priya.raghavan@example.com', source: 'homepage' },
    { email: 'arjun.d@example.com', source: 'footer' },
    { email: 'leela.thomas@example.com', source: 'homepage' },
  ]);

  await ContactMessage.create({
    name: 'Ritika Shah',
    email: 'ritika@example.com',
    subject: 'Bulk order for a studio',
    message: 'We are furnishing a 12-seat studio in Pune and would like a quote on the Halden stools and Margot chairs. Could someone call us this week?',
    status: 'new',
  });

  /* ------------------------------------------------------------- summary */
  const counts = {
    users: await User.countDocuments(),
    stores: await Store.countDocuments(),
    products: await Product.countDocuments(),
    orders: await Order.countDocuments(),
    reviews: await Review.countDocuments(),
    coupons: await Coupon.countDocuments(),
  };

  console.log('\n──────────────────────────────────────────────');
  console.log(' VELORA demo data ready');
  console.log('──────────────────────────────────────────────');
  console.log(` ${counts.users} users · ${counts.stores} stores · ${counts.products} products`);
  console.log(` ${counts.orders} orders · ${counts.reviews} reviews · ${counts.coupons} coupons`);
  console.log('\n Sign in with:');
  console.log(`  Admin    ${config.admin.email} / ${ADMIN_PASSWORD}`);
  console.log(`  Seller   ${sellers[0].email} / ${PASSWORD}`);
  console.log(`  Seller   ${sellers[1].email} / ${PASSWORD}`);
  console.log(`  Customer ${customers[0].email} / ${PASSWORD}`);
  console.log(`  Customer ${customers[1].email} / ${PASSWORD}`);
  console.log('\n Coupons: VELORA10 · WELCOME200 · ATHOME15 · STYLE500');
  console.log('──────────────────────────────────────────────\n');

  return { admin, testimonials };
}

async function main() {
  await connectDB();
  if (process.argv.includes('--destroy')) {
    await wipe();
    console.log('All VELORA collections cleared.');
  } else {
    await seed();
  }
  await disconnectDB();
  await mongoose.connection.close().catch(() => {});
  process.exit(0);
}

main().catch(async (error) => {
  console.error('\nSeed failed:', error);
  await disconnectDB().catch(() => {});
  process.exit(1);
});
