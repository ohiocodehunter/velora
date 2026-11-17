import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderService } from '@/services/order.service';
import type { Order } from '@/types';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import { formatCurrency, formatDateTime } from '@/utils/format';
import { CheckCircle2, Package, Truck, ArrowRight, ShieldCheck } from 'lucide-react';

export const PaymentSuccessPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      if (!orderId) return;
      try {
        setIsLoading(true);
        const data = await orderService.getOrder(orderId);
        setOrder(data);
      } catch {
        setOrder(null);
      } finally {
        setIsLoading(false);
      }
    }
    loadOrder();
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="shell py-20 max-w-xl mx-auto space-y-6">
        <Skeleton className="h-16 w-16 rounded-full mx-auto" />
        <Skeleton className="h-8 w-64 mx-auto" />
        <Skeleton className="h-48 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="shell py-16 sm:py-24 max-w-2xl mx-auto text-center space-y-8 animate-rise">
      <div className="h-16 w-16 rounded-full bg-[#EEF3F0] text-success border border-[#D6E4DC] flex items-center justify-center mx-auto shadow-xs">
        <CheckCircle2 className="h-9 w-9" />
      </div>

      <div className="space-y-2">
        <span className="eyebrow">Order Confirmed</span>
        <h1 className="text-3xl sm:text-4xl font-normal text-ink">Thank you for your order</h1>
        <p className="text-xs sm:text-sm text-muted max-w-md mx-auto leading-relaxed">
          Your order has been recorded and transmitted to our verified sellers for preparation.
        </p>
      </div>

      {order && (
        <div className="card p-6 sm:p-8 text-left space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-line">
            <div>
              <p className="text-xs text-muted">Order Reference</p>
              <p className="text-base font-semibold text-ink font-mono mt-0.5">
                {order.orderNumber}
              </p>
            </div>
            <div className="sm:text-right">
              <p className="text-xs text-muted">Date & Time</p>
              <p className="text-xs font-medium text-ink mt-0.5">
                {formatDateTime(order.createdAt)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div>
              <h4 className="font-semibold text-ink uppercase tracking-wider text-[11px] mb-2">
                Shipping To
              </h4>
              <p className="text-muted leading-relaxed">
                {order.shippingAddress.fullName}
                <br />
                {order.shippingAddress.line1}
                {order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ''}
                <br />
                {order.shippingAddress.city}, {order.shippingAddress.state} -{' '}
                {order.shippingAddress.pincode}
                <br />
                Phone: {order.shippingAddress.phone}
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-ink uppercase tracking-wider text-[11px] mb-2">
                Payment Info
              </h4>
              <p className="text-muted leading-relaxed">
                Method:{' '}
                <strong className="text-ink uppercase">{order.payment.method}</strong>
                <br />
                Status:{' '}
                <span className="capitalize text-success font-semibold">
                  {order.payment.status}
                </span>
                <br />
                Grand Total:{' '}
                <strong className="text-ink">{formatCurrency(order.summary.grandTotal)}</strong>
              </p>
            </div>
          </div>

          {/* Purchased Items Preview */}
          <div className="pt-4 border-t border-line space-y-3">
            <h4 className="font-semibold text-ink uppercase tracking-wider text-[11px]">
              Purchased Items ({order.items.length})
            </h4>
            <div className="divide-y divide-line/60">
              {order.items.map((it, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={it.image}
                      alt={it.name}
                      className="h-10 w-10 rounded-lg object-cover bg-canvas shrink-0"
                    />
                    <div>
                      <p className="font-medium text-ink line-clamp-1">{it.name}</p>
                      <p className="text-[11px] text-muted">Qty: {it.quantity}</p>
                    </div>
                  </div>
                  <span className="font-medium text-ink">{formatCurrency(it.lineTotal)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        {orderId && (
          <Link to={`/order/track/${orderId}`}>
            <Button variant="primary" size="lg">
              <Truck className="h-4 w-4 mr-2" /> Track Order Status
            </Button>
          </Link>
        )}
        <Link to="/orders">
          <Button variant="outline" size="lg">
            View All Orders
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
