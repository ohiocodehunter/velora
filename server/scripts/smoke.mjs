/**
 * VELORA API End-to-End Smoke Test Suite
 * Validates backend controllers, MongoDB queries, authentication,
 * cart calculations, and dashboard metrics without frontend.
 */
import http from 'node:http';
import app from '../app.js';
import connectDB, { disconnectDB } from '../config/db.js';

let server;
let baseUrl;

async function request(path, options = {}) {
  const url = `${baseUrl}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, headers: res.headers, data };
}

function getCookie(res) {
  const setCookie = res.headers.get('set-cookie');
  if (!setCookie) return '';
  return setCookie.split(';')[0];
}

async function run() {
  console.log('🚀 Starting VELORA End-to-End Smoke Test...\n');

  await connectDB();
  server = http.createServer(app);

  await new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      console.log(`📡 Test server running at ${baseUrl}`);
      resolve();
    });
  });

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ ${message}`);
      passed++;
    } else {
      console.error(`  ✗ ${message}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    console.log('\n[1] Health Check');
    const health = await request('/api/health');
    assert(health.status === 200 && health.data.data.status === 'ok', 'API health check passed');

    // 2. Public Catalog
    console.log('\n[2] Public Products & Categories');
    const products = await request('/api/products?limit=5');
    assert(
      products.status === 200 && Array.isArray(products.data.data) && products.data.data.length > 0,
      `Listed ${products.data?.data?.length || 0} products from database`,
    );

    const firstProduct = products.data.data[0];
    const singleProduct = await request(`/api/products/${firstProduct.slug}`);
    assert(
      singleProduct.status === 200 && singleProduct.data.data.product.name === firstProduct.name,
      `Fetched product details for "${firstProduct.name}"`,
    );

    const categories = await request('/api/categories');
    assert(
      categories.status === 200 && categories.data.data.length > 0,
      `Listed ${categories.data?.data?.length || 0} product categories`,
    );

    // 3. Auth: Customer Login
    console.log('\n[3] Customer Authentication');
    const customerLogin = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'ananya@example.com', password: 'Velora@123' }),
    });
    assert(customerLogin.status === 200 && customerLogin.data.data.user.role === 'customer', 'Customer login successful');
    const customerCookie = getCookie(customerLogin);

    // 4. Cart Operations
    console.log('\n[4] Shopping Cart Flow');
    const addToCart = await request('/api/cart/items', {
      method: 'POST',
      headers: { Cookie: customerCookie },
      body: JSON.stringify({ productId: firstProduct._id, quantity: 2 }),
    });
    assert(addToCart.status === 200 && addToCart.data.data.items.length > 0, 'Added product to shopping cart');

    const couponApply = await request('/api/cart/coupon', {
      method: 'POST',
      headers: { Cookie: customerCookie },
      body: JSON.stringify({ code: 'VELORA10' }),
    });
    assert(
      couponApply.status === 200 && couponApply.data.data.summary.discount > 0,
      `Applied coupon VELORA10 (Saved ₹${couponApply.data?.data?.summary?.discount})`,
    );

    // 5. Wishlist
    console.log('\n[5] Wishlist Flow');
    const toggleWish = await request(`/api/wishlist/${firstProduct._id}`, {
      method: 'POST',
      headers: { Cookie: customerCookie },
    });
    assert(toggleWish.status === 200, 'Toggled wishlist item');

    // 6. Auth: Seller Login & Seller Dashboard
    console.log('\n[6] Seller Portal Flow');
    const sellerLogin = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'aarav@velora.shop', password: 'Velora@123' }),
    });
    assert(sellerLogin.status === 200 && sellerLogin.data.data.user.role === 'seller', 'Seller login successful');
    const sellerCookie = getCookie(sellerLogin);

    const sellerDash = await request('/api/seller/dashboard', {
      headers: { Cookie: sellerCookie },
    });
    assert(
      sellerDash.status === 200 && typeof sellerDash.data.data.revenue === 'number',
      `Seller dashboard loaded (Gross Revenue: ₹${sellerDash.data?.data?.revenue})`,
    );

    const sellerOrders = await request('/api/seller/orders', {
      headers: { Cookie: sellerCookie },
    });
    assert(
      sellerOrders.status === 200 && Array.isArray(sellerOrders.data.data),
      `Seller incoming orders loaded (${sellerOrders.data?.data?.length || 0} orders)`,
    );

    // 7. Auth: Admin Login & Admin Dashboard
    console.log('\n[7] Admin Console Flow');
    const adminLogin = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@velora.shop', password: 'Admin@12345' }),
    });
    assert(adminLogin.status === 200 && adminLogin.data.data.user.role === 'admin', 'Admin login successful');
    const adminCookie = getCookie(adminLogin);

    const adminDash = await request('/api/admin/dashboard', {
      headers: { Cookie: adminCookie },
    });
    assert(
      adminDash.status === 200 && adminDash.data.data.counts.products > 0,
      `Admin platform metrics loaded (${adminDash.data?.data?.counts?.products} products, ₹${adminDash.data?.data?.revenue} revenue)`,
    );

    const adminUsers = await request('/api/admin/users?limit=5', {
      headers: { Cookie: adminCookie },
    });
    assert(
      adminUsers.status === 200 && adminUsers.data.data.length > 0,
      `Admin user directory loaded (${adminUsers.data?.data?.length} users)`,
    );

    const adminSellers = await request('/api/admin/sellers', {
      headers: { Cookie: adminCookie },
    });
    assert(
      adminSellers.status === 200 && adminSellers.data.data.length > 0,
      `Admin seller queue loaded (${adminSellers.data?.data?.length} stores)`,
    );

    console.log(`\n========================================`);
    console.log(`Smoke Test Summary: ${passed} passed, ${failed} failed`);
    console.log(`========================================\n`);

    if (failed > 0) process.exitCode = 1;
  } catch (err) {
    console.error('Smoke test crashed:', err);
    process.exitCode = 1;
  } finally {
    if (server) server.close();
    await disconnectDB();
  }
}

run();
