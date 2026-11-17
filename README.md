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
