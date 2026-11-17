import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { formatCurrency } from '@/utils/format';
import { ShieldCheck, CreditCard, Smartphone, Building, CheckCircle2, AlertCircle } from 'lucide-react';
import type { PaymentOrderResult } from '@/services/order.service';

export interface RazorpayModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentData: PaymentOrderResult | null;
  amount: number;
  onSuccess: (paymentDetails: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) => void;
}

export const RazorpayModal: React.FC<RazorpayModalProps> = ({
  isOpen,
  onClose,
  paymentData,
  amount,
  onSuccess,
}) => {
  const [method, setMethod] = useState<'card' | 'upi' | 'netbanking'>('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('4111 2222 3333 4444');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('888');
  const [upiId, setUpiId] = useState('customer@okhdfcbank');

  if (!isOpen || !paymentData) return null;

  const handleSimulatePayment = async () => {
    setIsProcessing(true);
    // Simulate real gateway delay
    setTimeout(() => {
      setIsProcessing(false);
      if (paymentData.testPayment) {
        onSuccess({
          razorpayOrderId: paymentData.orderId,
          razorpayPaymentId: paymentData.testPayment.paymentId,
          razorpaySignature: paymentData.testPayment.signature,
        });
      } else {
        // Fallback simulated payment ID
        onSuccess({
          razorpayOrderId: paymentData.orderId,
          razorpayPaymentId: `pay_${Math.random().toString(36).substring(2, 12)}`,
          razorpaySignature: 'simulated_test_signature',
        });
      }
    }, 1200);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center justify-between">
          <span>Razorpay Test Gateway</span>
          <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded bg-accent-soft text-accent-strong">
            Sandbox
          </span>
        </div>
      }
      description="Select payment instrument to complete the test transaction"
      maxWidth="md"
    >
      <div className="space-y-5">
        {/* Order amount banner */}
        <div className="p-4 rounded-xl bg-canvas border border-line flex items-center justify-between">
          <div>
            <p className="text-xs text-muted">Payable Amount</p>
            <p className="text-xl font-semibold text-ink">{formatCurrency(amount)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted">Order ID</p>
            <p className="text-xs font-mono text-ink truncate max-w-[140px]">{paymentData.orderId}</p>
          </div>
        </div>

        {/* Payment tabs */}
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setMethod('upi')}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
              method === 'upi'
                ? 'border-ink bg-ink text-surface'
                : 'border-line bg-surface text-ink hover:bg-canvas'
            }`}
          >
            <Smartphone className="h-4 w-4" />
            <span>UPI</span>
          </button>
          <button
            type="button"
            onClick={() => setMethod('card')}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
              method === 'card'
                ? 'border-ink bg-ink text-surface'
                : 'border-line bg-surface text-ink hover:bg-canvas'
            }`}
          >
            <CreditCard className="h-4 w-4" />
            <span>Card</span>
          </button>
          <button
            type="button"
            onClick={() => setMethod('netbanking')}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
              method === 'netbanking'
                ? 'border-ink bg-ink text-surface'
                : 'border-line bg-surface text-ink hover:bg-canvas'
            }`}
          >
            <Building className="h-4 w-4" />
            <span>NetBanking</span>
          </button>
        </div>

        {/* Tab contents */}
        {method === 'upi' && (
          <div className="space-y-3 p-4 rounded-xl border border-line bg-surface">
            <label className="block text-xs font-medium text-ink">Enter VPA / UPI ID</label>
            <input
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="username@upi"
              className="w-full h-10 px-3.5 rounded-lg border border-line text-xs font-mono"
            />
            <p className="text-[11px] text-muted">
              Pre-filled test UPI ID. Accepts any test handle to simulate success.
            </p>
          </div>
        )}

        {method === 'card' && (
          <div className="space-y-3 p-4 rounded-xl border border-line bg-surface">
            <div>
              <label className="block text-xs font-medium text-ink">Card Number</label>
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                className="w-full h-10 px-3.5 rounded-lg border border-line text-xs font-mono mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-ink">Expiry (MM/YY)</label>
                <input
                  type="text"
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-lg border border-line text-xs font-mono mt-1"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-ink">CVV</label>
                <input
                  type="password"
                  maxLength={4}
                  value={cardCvv}
                  onChange={(e) => setCardCvv(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-lg border border-line text-xs font-mono mt-1"
                />
              </div>
            </div>
            <p className="text-[11px] text-muted">Test Visa card simulation. No real money will be charged.</p>
          </div>
        )}

        {method === 'netbanking' && (
          <div className="space-y-3 p-4 rounded-xl border border-line bg-surface">
            <p className="text-xs font-medium text-ink">Popular Banks</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <label className="flex items-center gap-2 p-2 rounded-lg border border-line cursor-pointer hover:bg-canvas">
                <input type="radio" name="bank" defaultChecked className="text-ink" />
                <span>HDFC Bank</span>
              </label>
              <label className="flex items-center gap-2 p-2 rounded-lg border border-line cursor-pointer hover:bg-canvas">
                <input type="radio" name="bank" className="text-ink" />
                <span>ICICI Bank</span>
              </label>
              <label className="flex items-center gap-2 p-2 rounded-lg border border-line cursor-pointer hover:bg-canvas">
                <input type="radio" name="bank" className="text-ink" />
                <span>State Bank of India</span>
              </label>
              <label className="flex items-center gap-2 p-2 rounded-lg border border-line cursor-pointer hover:bg-canvas">
                <input type="radio" name="bank" className="text-ink" />
                <span>Axis Bank</span>
              </label>
            </div>
          </div>
        )}

        {/* Security strip */}
        <div className="flex items-center gap-2 text-[11px] text-muted">
          <ShieldCheck className="h-4 w-4 text-success" />
          <span>Secured by 256-bit encryption. Razorpay Test Environment.</span>
        </div>

        {/* Pay Button */}
        <div className="flex gap-3 pt-2">
          <Button variant="outline" size="md" onClick={onClose} disabled={isProcessing} className="flex-1">
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleSimulatePayment}
            isLoading={isProcessing}
            className="flex-1"
          >
            Pay {formatCurrency(amount)}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default RazorpayModal;
