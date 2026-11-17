import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '@/services/admin.service';
import type { AdminDashboard } from '@/types';
import Skeleton from '@/components/ui/Skeleton';
import { formatCurrency, formatDateTime } from '@/utils/format';
import { ORDER_STATUS_LABEL, ORDER_STATUS_TONE } from '@/utils/constants';
import {
  Users,
  Store,
  Package,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';

export const AdminDashboardPage: React.FC = () => {
  const [data, setData] = useState<AdminDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const dash = await adminService.getDashboard();
        setData(dash);
      } catch {
        setData(null);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
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
        Failed to query admin statistics from database.
      </div>
    );
  }

  const kpis = [
    {
      label: 'Platform Gross Revenue',
      value: formatCurrency(data.revenue),
      subtext: `AOV: ${formatCurrency(data.averageOrderValue)}`,
      icon: <DollarSign className="h-4 w-4 text-accent" />,
    },
    {
      label: 'Total Orders Placed',
      value: data.counts.orders,
      subtext: `Today: ${data.today.orders} orders (${formatCurrency(data.today.revenue)})`,
      icon: <ShoppingBag className="h-4 w-4 text-ink" />,
    },
    {
      label: 'Registered Customers',
      value: data.counts.customers,
      subtext: `+${data.today.customers} joined today`,
      icon: <Users className="h-4 w-4 text-success" />,
    },
    {
      label: 'Verified Sellers',
      value: data.counts.sellers,
      subtext: `${data.counts.pendingSellers} applications awaiting review`,
      icon: <Store className="h-4 w-4 text-accent-strong" />,
    },
  ];

  return (
    <div className="space-y-8 animate-rise">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line">
        <div>
          <h1 className="text-2xl font-normal text-ink">Executive Admin Console</h1>
          <p className="text-xs text-muted mt-0.5">
            Real-time multi-vendor marketplace health, volume, and compliance
          </p>
        </div>
        {data.counts.pendingSellers > 0 && (
          <Link
            to="/admin/sellers"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF3E6] border border-[#EBDCC0] text-[#8a6d3b] text-xs font-semibold"
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>{data.counts.pendingSellers} Seller Application(s) Pending</span>
          </Link>
        )}
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

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Revenue Chart */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-line">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink">
              Platform Sales Series
            </h3>
            <span className="text-xs text-accent font-medium">Revenue (INR)</span>
          </div>

          <div className="h-64 w-full pt-2">
            {data.series && data.series.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.series}>
                  <defs>
                    <linearGradient id="adminRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#171717" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#171717" stopOpacity={0} />
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
                    formatter={(val: any) => [formatCurrency(val), 'Volume']}
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
                    stroke="#171717"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#adminRev)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-muted py-12 text-center">No sales history logged yet.</p>
            )}
          </div>
        </div>

        {/* User Signups Chart */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-line">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink">
              User Registration Velocity
            </h3>
            <span className="text-xs text-muted font-medium">Buyers vs Sellers</span>
          </div>

          <div className="h-64 w-full pt-2">
            {data.signups && data.signups.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.signups}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eae7e1" vertical={false} />
                  <XAxis dataKey="month" stroke="#777777" fontSize={11} tickLine={false} />
                  <YAxis stroke="#777777" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#eae7e1',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="customers" fill="#b89b72" radius={[4, 4, 0, 0]} name="Customers" />
                  <Bar dataKey="sellers" fill="#171717" radius={[4, 4, 0, 0]} name="Sellers" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-muted py-12 text-center">No user signup history logged yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Orders by Status Breakdown & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Status Distribution */}
        <div className="card p-6 space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-ink pb-3 border-b border-line">
            Orders by Fulfillment State
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {data.byStatus.map((st) => (
              <div key={st.status} className="p-3 rounded-xl border border-line bg-canvas flex justify-between items-center text-xs">
                <span className="capitalize text-muted font-medium">
                  {ORDER_STATUS_LABEL[st.status]}
                </span>
                <span className="font-semibold text-ink">{st.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Review of Recent Platform Orders */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-line">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink">
              Recent Marketplace Orders
            </h3>
            <Link to="/admin/orders" className="text-xs text-accent hover:underline">
              View all
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
            <p className="text-xs text-muted py-6 text-center">No orders placed yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
