# VELORA — Discover More. Shop Smarter.

> **Full-Stack Multi-Vendor E-Commerce Marketplace**  
> **Development Level:** Advanced College Major Project (B.Tech Computer Science)  
> **Architecture:** MERN Stack (MongoDB, Express.js, React 19, Node.js) with TypeScript & Tailwind CSS

---

## 1. Project Overview

**VELORA** is an advanced, production-style multi-vendor e-commerce web application engineered for high-intent shoppers, independent brand sellers, and marketplace administrators.

Unlike single-merchant storefronts, VELORA enables:
- **Customers** to discover authentic, verified products across independent creators, consolidate purchases from multiple vendors into a unified cart, apply coupons, select addresses, pay via Razorpay or Cash on Delivery, and track order fulfillment milestones.
- **Sellers** to register their boutique stores, create and manage product catalogs with multiple images, specifications, and variants, track live inventory and low-stock alerts, fulfill customer orders with custom tracking notes, and analyze sales performance through analytics charts.
- **Marketplace Administrators** to govern the entire ecosystem: moderate seller onboarding applications, suspend or activate accounts, oversee catalog visibility and reports, override order statuses, manage product categories, launch promo coupons, and control promotional banners.

---

## 2. Technology Stack

### Frontend (`client/`)
- **React 19** with **TypeScript** & **Vite 6**
- **Tailwind CSS v4** with a custom luxury design system (`#FAF9F6`, `#171717`, `#777777`, `#B89B72`)
- **Redux Toolkit** for centralized state management (Auth, Cart, Wishlist, UI notifications)
- **React Router v7** with declarative layouts and role-based route guards
- **Axios** with HTTP-only cookie credentials and interceptors
- **Recharts** for interactive seller and platform revenue visualizations
- **Lucide React** for icons

### Backend (`server/`)
- **Node.js** & **Express 5**
- **MongoDB** & **Mongoose ODM 8**
- **JWT (JSON Web Tokens)** stored in secure **HTTP-only cookies**
- **bcryptjs** password hashing (salt rounds: 12)
- **Zod** schema validators for inputs and API payloads
- **Multer** & **Cloudinary** for multi-image uploads with local disk fallback
- **Nodemailer** for transactional emails (order confirmations, welcomes)
- **Helmet**, **express-rate-limit**, **CORS**, and query sanitization middleware

### Payment Integration
- **Razorpay Test Integration** (UPI, Credit/Debit Cards, NetBanking) with server-side HMAC-SHA256 signature verification and simulated test gateway modal
- **Cash on Delivery (COD)** with server-side price validation

---

## 3. User Roles & Demo Credentials

VELORA features three role-based tiers with pre-seeded demo accounts:

| Role | Email | Password | Access Privileges |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@velora.shop` | `Admin@12345` | Platform metrics, User oversight, Seller approvals, Catalog moderation, Coupons, Banners |
| **Seller (Atelier)** | `aarav@velora.shop` | `Velora@123` | Storefront management, Catalog CRUD, Order fulfillment, Inventory alerts, Revenue analytics |
| **Seller (Horizon)** | `diya@velora.shop` | `Velora@123` | Storefront management, Catalog CRUD, Order fulfillment, Inventory alerts, Revenue analytics |
| **Customer (Buyer)** | `ananya@example.com` | `Velora@123` | Unified cart, Wishlist, Order placement, Delivery address book, Tracking, Product reviews |
| **Customer (Buyer)** | `vikram@example.com` | `Velora@123` | Unified cart, Wishlist, Order placement, Delivery address book, Tracking, Product reviews |

> *Quick-login buttons on the Sign-In page (`/login`) allow one-click switching between Buyer, Seller, and Admin roles.*

### Active Promo Coupons (Pre-seeded)
- `VELORA10` — 10% off on all eligible items (Max: ₹1,000)
- `WELCOME200` — ₹200 flat discount on orders above ₹1,499
- `ATHOME15` — 15% off on home and acoustic gear
- `STYLE500` — ₹500 off on luxury accessories above ₹3,000

---

## 4. Application Architecture & Pages

### Customer-Facing Pages (20 Pages)
1. **Home Page (`/`)** — Hero showcase, verified curation badges, department cards, featured creations, new arrivals, client testimonials, and newsletter signup.
2. **Shop All Products (`/shop`)** — Server-paginated catalogue with instant side filters (category, brand, price slider, rating, in-stock, featured) and sorting.
3. **Product Categories (`/categories`)** — Visual department index with cover imagery and description.
4. **Product Details (`/product/:slug`)** — Multi-image gallery with thumbnail switcher, specifications table, variant selector, quantity stepper, store card, reviews breakdown, review form, report listing modal, and related products grid.
5. **Search Results (`/search?q=...`)** — Instant keyword search results with facets and empty states.
6. **Shopping Cart (`/cart`)** — Line items with variant labels, live stock checks, coupon code application, free-delivery progress bar towards ₹999, tax breakdown, and checkout prompt.
7. **Wishlist (`/wishlist`)** — Saved pieces with one-click "Move to Cart" and real-time inventory badges.
8. **Checkout (`/checkout`)** — Multi-step address selection or inline address builder, delivery instructions, Razorpay test payment or Cash on Delivery selection.
9. **Payment Success (`/order/success/:orderId`)** — Receipt confirmation with order reference, delivery timeline, and direct navigation links.
10. **Order Tracking (`/order/track/:id`)** — Real-time progress timeline (Pending → Confirmed → Processing → Shipped → Out for Delivery → Delivered) with history logs.
11. **My Orders (`/orders`)** — Customer order history categorized by status tabs with cancelation options for eligible orders.
12. **Customer Profile (`/profile`)** — Account overview, personal contact updates, and security credentials management.
13. **Address Management (`/addresses`)** — Address book with primary default toggles, addition, editing, and removal.
14. **Login (`/login`)** — Sign-in screen featuring one-click demo role credentials.
15. **Registration (`/register`)** — Customer account creation with form validation.
16. **Seller Registration (`/seller/register`)** — Store onboarding application with brand identity, dispatch hub address, and return policy fields.
17. **About Us (`/about`)** — VELORA brand story, artisanal focus, and multi-vendor ethos.
18. **Contact Us (`/contact`)** — Concierge inquiry form saving directly to the admin message inbox.
19. **FAQ (`/faq`)** — Categorized accordion covering payments, shipping, returns, and vendor terms.
20. **404 Not Found (`*`)** — Styled error fallback with return to catalogue links.

### Dashboards
- **Customer Dashboard (`/profile`, `/orders`, `/addresses`)** — Account management.
- **Seller Portal (`/seller/*`)** — Overview metrics, revenue charts, catalog management, product editor with multi-image upload, order fulfillment queue, inventory restock alerts, and reviews.
- **Admin Console (`/admin/*`)** — Marketplace metrics, customer directory, seller verification queue, catalog moderation, order overrides, categories, coupons, banners, and contact inquiries.

---

## 5. Local Setup & Running Instructions

### Prerequisites
- **Node.js** >= 20.0.0
- **npm** >= 10.0.0
- **MongoDB** (Local instance, in-process MongoMemoryServer, or MongoDB Atlas connection string)

### Installation
Clone the repository and install root workspace dependencies:
```bash
git clone <repository_url>
cd mychildproject
npm install
```

### Environment Configuration
The server configuration resides in `server/.env`. A sample configuration is provided in `server/.env.example`:
```env
NODE_ENV=development
PORT=4000
CLIENT_URL=http://localhost:5173
PUBLIC_URL=http://localhost:4000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/velora?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
COOKIE_NAME=velora_token
COOKIE_SECURE=false
ADMIN_EMAIL=admin@velora.shop
ADMIN_PASSWORD=Admin@12345
SEED_PASSWORD=Velora@123
FREE_SHIPPING_THRESHOLD=999
SHIPPING_FEE=79
TAX_RATE=0.05
```

### Database Seeding
Populate the database with demo users, sellers, products, coupons, orders, and reviews:
```bash
npm run seed
```

To wipe the database clean and restart:
```bash
npm run seed:destroy
```

### Running the Application
Run both frontend and backend concurrently in development mode:
```bash
npm run dev
```

Or run each service individually:
```bash
# Terminal 1: Backend API (port 4000)
npm run dev:server

# Terminal 2: Frontend Web App (port 5173)
npm run dev:client
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 6. Testing & Validation

### Backend End-to-End Smoke Test
Run the comprehensive API and database integration test:
```bash
npm run smoke
```
This tests:
1. Health status endpoint
2. Public catalog queries & category retrieval
3. Customer authentication
4. Shopping cart item addition & coupon discount application
5. Wishlist toggle
6. Seller authentication, dashboard metrics, and incoming orders
7. Administrator authentication, platform metrics, user directory, and seller application queues

### Frontend Typechecking & Production Build
```bash
# Typecheck client TypeScript files
npm run typecheck

# Production build of frontend
npm run build
```

---

## 7. REST API Documentation Summary

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Register new customer account | Public |
| **POST** | `/api/auth/login` | Authenticate user and issue HTTP-only cookie | Public |
| **POST** | `/api/auth/logout` | Clear authentication cookie | Public |
| **GET** | `/api/auth/me` | Fetch authenticated profile | Protected |
| **GET** | `/api/products` | Query products with filters, sorting & pagination | Public |
| **GET** | `/api/products/:slug` | Retrieve product details | Public |
| **POST** | `/api/products` | Create new product listing | Seller (Approved) |
| **PATCH** | `/api/products/:id` | Update product listing | Seller / Admin |
| **DELETE** | `/api/products/:id` | Remove product listing | Seller / Admin |
| **GET** | `/api/categories` | List product categories | Public |
| **GET** | `/api/cart` | Retrieve user cart with calculated totals | Public / User |
| **POST** | `/api/cart/items` | Add item to cart | Public / User |
| **POST** | `/api/cart/coupon` | Apply coupon code | Public / User |
| **GET** | `/api/orders` | Customer order history | Protected |
| **POST** | `/api/orders` | Place multi-vendor order | Protected |
| **GET** | `/api/orders/:id/track` | Live order fulfillment timeline | Protected |
| **POST** | `/api/payments/razorpay/:orderId` | Initiate Razorpay order | Protected |
| **POST** | `/api/payments/razorpay/verify` | Verify payment signature | Protected |
| **GET** | `/api/seller/dashboard` | Seller revenue KPIs & series | Seller |
| **PATCH** | `/api/seller/orders/:orderId/items/:itemId` | Update item fulfillment status | Seller |
| **GET** | `/api/admin/dashboard` | Platform metrics & analytics | Admin |
| **PATCH** | `/api/admin/sellers/:id/status` | Approve or reject seller store | Admin |

---

## 8. Deployment Guidelines

### Production Build
1. Build the frontend client bundle:
   ```bash
   npm run build
   ```
   The compiled assets will be output to `client/dist`.
2. When `NODE_ENV=production`, the Express server automatically serves `client/dist` statically on port `4000` (or `process.env.PORT`), resolving all client routing through `index.html`.
3. Start the unified production server:
   ```bash
   npm start
   ```

---

**Developed for Advanced Major Project Submission.**  
*VELORA — Discover More. Shop Smarter.*
