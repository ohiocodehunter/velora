import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Review from '../models/Review.js';
import Store from '../models/Store.js';
import User from '../models/User.js';
import { round2 } from '../utils/money.js';

const oid = (value) => new mongoose.Types.ObjectId(String(value));

/** Last N calendar months as { key: '2026-11', label: 'Nov 2026', start: Date }. */
export function lastMonths(count = 6) {
  const months = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: d.toLocaleString('en-IN', { month: 'short', year: 'numeric' }),
      start: d,
    });
  }
  return months;
}

function fillSeries(months, rows, extra = {}) {
  const byKey = new Map(rows.map((row) => [row._id, row]));
  return months.map((month) => {
    const row = byKey.get(month.key) || {};
    const entry = { month: month.label, key: month.key };
    for (const [field, fallback] of Object.entries(extra)) {
      entry[field] = round2(row[field] ?? fallback);
    }
    return entry;
  });
}

const sellerItemMatch = (sellerId, extra = {}) => ({
  'items.seller': oid(sellerId),
  'items.status': { $ne: 'cancelled' },
  ...extra,
});

export async function sellerDashboard(sellerId) {
  const months = lastMonths(6);
  const since = months[0].start;

  const [revenueAgg, orderCount, productCount, lowStock, pendingCount, seriesRows, topProducts, recentOrders] =
    await Promise.all([
      Order.aggregate([
        { $unwind: '$items' },
        { $match: sellerItemMatch(sellerId) },
        { $group: { _id: null, revenue: { $sum: '$items.lineTotal' }, units: { $sum: '$items.quantity' } } },
      ]),
      Order.countDocuments({ 'items.seller': oid(sellerId) }),
      Product.countDocuments({ seller: oid(sellerId), status: { $ne: 'archived' } }),
      Product.countDocuments({ seller: oid(sellerId), stock: { $lte: 5 }, status: 'active' }),
      Order.countDocuments({
        'items.seller': oid(sellerId),
        'items.status': { $in: ['confirmed', 'processing'] },
      }),
      Order.aggregate([
        { $unwind: '$items' },
        { $match: sellerItemMatch(sellerId, { createdAt: { $gte: since } }) },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            revenue: { $sum: '$items.lineTotal' },
            units: { $sum: '$items.quantity' },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Order.aggregate([
        { $unwind: '$items' },
        { $match: sellerItemMatch(sellerId) },
        {
          $group: {
            _id: '$items.product',
            name: { $first: '$items.name' },
            image: { $first: '$items.image' },
            revenue: { $sum: '$items.lineTotal' },
            units: { $sum: '$items.quantity' },
          },
        },
        { $sort: { revenue: -1 } },
        { $limit: 5 },
      ]),
      Order.find({ 'items.seller': oid(sellerId) })
        .sort('-createdAt')
        .limit(5)
        .select('orderNumber status summary.grandTotal createdAt user items')
        .populate('user', 'name email'),
    ]);

  const deliveredAgg = await Order.aggregate([
    { $unwind: '$items' },
    { $match: sellerItemMatch(sellerId, { 'items.status': 'delivered' }) },
    { $group: { _id: null, revenue: { $sum: '$items.lineTotal' } } },
  ]);

  const revenue = round2(revenueAgg[0]?.revenue || 0);
  const paidOrders = await Order.distinct('_id', { 'items.seller': oid(sellerId) });

  return {
    revenue,
    deliveredRevenue: round2(deliveredAgg[0]?.revenue || 0),
    unitsSold: revenueAgg[0]?.units || 0,
    orderCount,
    productCount,
    lowStock,
    pendingCount,
    averageOrderValue: paidOrders.length ? round2(revenue / paidOrders.length) : 0,
    series: fillSeries(months, seriesRows, { revenue: 0, units: 0 }),
    topProducts: topProducts.map((item) => ({
      id: String(item._id),
      name: item.name,
      image: item.image,
      revenue: round2(item.revenue),
      units: item.units,
    })),
    recentOrders,
  };
}

export async function sellerAnalytics(sellerId) {
  const months = lastMonths(6);
  const [seriesRows, statusRows, categoryRows, reviewAgg] = await Promise.all([
    Order.aggregate([
      { $unwind: '$items' },
      { $match: sellerItemMatch(sellerId, { createdAt: { $gte: months[0].start } }) },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          revenue: { $sum: '$items.lineTotal' },
          units: { $sum: '$items.quantity' },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Order.aggregate([
      { $unwind: '$items' },
      { $match: sellerItemMatch(sellerId) },
      { $group: { _id: '$items.status', count: { $sum: 1 } } },
    ]),
    Order.aggregate([
      { $unwind: '$items' },
      { $match: sellerItemMatch(sellerId) },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productDoc',
        },
      },
      { $unwind: { path: '$productDoc', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'categories',
          localField: 'productDoc.category',
          foreignField: '_id',
          as: 'categoryDoc',
        },
      },
      { $unwind: { path: '$categoryDoc', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: { $ifNull: ['$categoryDoc.name', 'Other'] },
          revenue: { $sum: '$items.lineTotal' },
          units: { $sum: '$items.quantity' },
        },
      },
      { $sort: { revenue: -1 } },
    ]),
    Review.aggregate([
      { $match: { seller: oid(sellerId), status: 'visible' } },
      { $group: { _id: null, average: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]),
  ]);

  return {
    series: fillSeries(months, seriesRows, { revenue: 0, units: 0 }),
    byStatus: statusRows.map((row) => ({ status: row._id, count: row.count })),
    byCategory: categoryRows.map((row) => ({
      category: row._id,
      revenue: round2(row.revenue),
      units: row.units,
    })),
    ratings: {
      average: round2(reviewAgg[0]?.average || 0),
      count: reviewAgg[0]?.count || 0,
    },
  };
}

export async function adminDashboard() {
  const months = lastMonths(6);
  const since = months[0].start;
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [
    customers,
    sellers,
    pendingSellers,
    products,
    orderCount,
    revenueAgg,
    seriesRows,
    statusRows,
    recentOrders,
    topProducts,
    topStores,
    customersToday,
    ordersToday,
    revenueTodayAgg,
    lowStock,
    reportedReviews,
    pendingApplications,
    signupRows,
  ] = await Promise.all([
    User.countDocuments({ role: 'customer' }),
    User.countDocuments({ role: 'seller' }),
    Store.countDocuments({ status: 'pending' }),
    Product.countDocuments({ status: 'active' }),
    Order.countDocuments({ status: { $ne: 'cancelled' } }),
    Order.aggregate([
      { $unwind: '$items' },
      { $match: { 'items.status': { $ne: 'cancelled' } } },
      { $group: { _id: null, revenue: { $sum: '$items.lineTotal' } } },
    ]),
    Order.aggregate([
      { $unwind: '$items' },
      { $match: { 'items.status': { $ne: 'cancelled' }, createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          revenue: { $sum: '$items.lineTotal' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Order.find()
      .sort('-createdAt')
      .limit(6)
      .select('orderNumber status summary.grandTotal payment.method createdAt user')
      .populate('user', 'name email'),
    Product.find({ status: 'active' })
      .sort('-soldCount')
      .limit(5)
      .select('name slug images soldCount price stock'),
    Store.find({ status: 'approved' })
      .sort('-totalSales')
      .limit(5)
      .select('name slug totalSales logo ratingAverage'),
    User.countDocuments({ role: 'customer', createdAt: { $gte: startOfToday } }),
    Order.countDocuments({ createdAt: { $gte: startOfToday } }),
    Order.aggregate([
      { $unwind: '$items' },
      { $match: { 'items.status': { $ne: 'cancelled' }, createdAt: { $gte: startOfToday } } },
      { $group: { _id: null, revenue: { $sum: '$items.lineTotal' } } },
    ]),
    Product.countDocuments({ stock: { $lte: 5 }, status: 'active' }),
    Review.countDocuments({ status: 'reported' }),
    Store.find({ status: 'pending' })
      .sort('createdAt')
      .limit(5)
      .populate('owner', 'name email createdAt'),
    User.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: {
            month: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            role: '$role',
          },
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  const signups = fillSeries(
    months,
    months.map((month) => ({
      _id: month.key,
      customers: signupRows.find((r) => r._id.month === month.key && r._id.role === 'customer')?.count || 0,
      sellers: signupRows.find((r) => r._id.month === month.key && r._id.role === 'seller')?.count || 0,
    })),
    { customers: 0, sellers: 0 },
  );

  const revenue = round2(revenueAgg[0]?.revenue || 0);

  return {
    counts: {
      customers,
      sellers,
      pendingSellers,
      products,
      orders: orderCount,
      lowStock,
      reportedReviews,
    },
    revenue,
    averageOrderValue: orderCount ? round2(revenue / orderCount) : 0,
    today: {
      customers: customersToday,
      orders: ordersToday,
      revenue: round2(revenueTodayAgg[0]?.revenue || 0),
    },
    series: fillSeries(months, seriesRows, { revenue: 0, orders: 0 }),
    signups,
    byStatus: statusRows.map((row) => ({ status: row._id, count: row.count })),
    recentOrders,
    topProducts,
    topStores,
    pendingApplications,
  };
}

export default { sellerDashboard, sellerAnalytics, adminDashboard, lastMonths };
