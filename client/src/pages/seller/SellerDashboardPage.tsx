import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { sellerService } from '@/services/seller.service';
import type { SellerDashboard } from '@/types';
import Skeleton from '@/components/ui/Skeleton';
import Button from '@/components/ui/Button';
import { formatCurrency, formatDateTime } from '@/utils/format';
import { ORDER_STATUS_LABEL, ORDER_STATUS_TONE } from '@/utils/constants';
import {
  TrendingUp,
  Package,
  ShoppingBag,
  AlertTriangle,
  ArrowRight,
  Boxes,
  DollarSign,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export const SellerDashboardPage: React.FC = () => {
  const [data, setData] = useState<SellerDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setIsLoading(true);
        const dash = await sellerService.getDashboard();
        setData(dash);
      } catch {
        setData(null);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="card p-10 text-center text-xs text-muted">
        Unable to load seller dashboard metrics. Please verify store registration status.
      </div>
    );
  }

  const kpis = [
    {
      label: 'Gross Marketplace Sales',
      value: formatCurrency(data.revenue),
      subtext: `Delivered: ${formatCurrency(data.deliveredRevenue)}`,
      icon: <DollarSign className="h-4 w-4 text-accent" />,
    },
    {
      label: 'Total Orders',
      value: data.orderCount,
      subtext: `${data.pendingCount} orders pending fulfillment`,
      icon: <ShoppingBag className="h-4 w-4 text-ink" />,
    },
    {
      label: 'Units Dispatched',
      value: data.unitsSold,
      subtext: `AOV: ${formatCurrency(data.averageOrderValue)}`,
      icon: <TrendingUp className="h-4 w-4 text-success" />,
    },
    {
      label: 'Active Listings',
      value: data.productCount,
      subtext: `${data.lowStock} items low in stock`,
      icon: <Boxes className="h-4 w-4 text-[#8a6d3b]" />,
    },
  ];

  return (
    <div className="space-y-8 animate-rise">
      {/* Top Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line">
        <div>
          <h1 className="text-2xl font-normal text-ink">
            {data.store?.name || 'Seller Dashboard'}
          </h1>
          <p className="text-xs text-muted mt-0.5">Real-time store performance, revenue and fulfillment</p>
        </div>
        <Link to="/seller/products/new">
          <Button variant="primary" size="sm">
            <Package className="h-3.5 w-3.5 mr-1.5" /> Add New Product
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="card p-5 space-y-2">
            <div className="flex items-center justify-between text-xs text-muted">
              <span>{kpi.label}</span>
              {kpi.icon}
            </div>
            <p className="text-xl sm:text-2xl font-semibold text-ink">{kpi.value}</p>
            <p className="text-[11px] text-muted">{kpi.subtext}</p>
          </div>
        ))}
      </div>

      {/* Revenue Trend Chart */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-line">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-ink">
              Revenue Analytics
            </h3>
            <p className="text-xs text-muted mt-0.5">Monthly gross sales volume</p>
          </div>
          <span className="text-xs font-semibold text-accent">Actual Database Query Data</span>
        </div>

        <div className="h-72 w-full pt-2">
          {data.series && data.series.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.series}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#b89b72" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#b89b72" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#eae7e1" vertical={false} />
                <XAxis dataKey="month" stroke="#777777" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#777777"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val}`}
                />
                <Tooltip
                  formatter={(val: any) => [formatCurrency(val), 'Revenue']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#eae7e1',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#b89b72"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-muted">
              Sales series will plot as orders arrive.
            </div>
          )}
        </div>
      </div>

      {/* Tables: Top Products & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Selling Products */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-line">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink">
              Top Performing Products
            </h3>
            <Link to="/seller/products" className="text-xs text-accent hover:underline">
              View all
            </Link>
          </div>

          {data.topProducts && data.topProducts.length > 0 ? (
            <div className="divide-y divide-line/60">
              {data.topProducts.map((p) => (
                <div key={p.id} className="py-2.5 flex items-center justify-between text-xs gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="h-10 w-10 rounded-lg object-cover bg-canvas shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-medium text-ink truncate">{p.name}</p>
                      <p className="text-[11px] text-muted">{p.units} units sold</p>
                    </div>
                  </div>
                  <span className="font-semibold text-ink shrink-0">
                    {formatCurrency(p.revenue)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted py-6 text-center">No sales data recorded yet.</p>
          )}
        </div>

        {/* Recent Incoming Orders */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-line">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink">
              Recent Incoming Orders
            </h3>
            <Link to="/seller/orders" className="text-xs text-accent hover:underline">
              Manage Orders
            </Link>
          </div>

          {data.recentOrders && data.recentOrders.length > 0 ? (
            <div className="divide-y divide-line/60">
              {data.recentOrders.map((ord) => (
                <div key={ord._id} className="py-2.5 flex items-center justify-between text-xs gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-ink">{ord.orderNumber}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded border font-medium ${
                          ORDER_STATUS_TONE[ord.status]
                        }`}
                      >
                        {ORDER_STATUS_LABEL[ord.status]}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted mt-0.5">
                      {ord.shippingAddress?.fullName} • {formatDateTime(ord.createdAt)}
                    </p>
                  </div>
                  <span className="font-semibold text-ink">
                    {formatCurrency(ord.summary?.grandTotal)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted py-6 text-center">No orders received yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerDashboardPage;
