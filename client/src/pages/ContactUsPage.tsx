import React, { useState } from 'react';
import { miscService } from '@/services/misc.service';
import { useAppDispatch } from '@/hooks/store';
import { addToast } from '@/store/slices/uiSlice';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';
import { getErrorMessage } from '@/services/api';

export const ContactUsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await miscService.sendContactMessage({
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
      });
      dispatch(
        addToast({
          type: 'success',
          message: res.message || 'Your inquiry has been received. Our concierge will reply shortly.',
        }),
      );
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err) {
      dispatch(addToast({ type: 'error', message: getErrorMessage(err, 'Failed to send message') }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="shell py-10 sm:py-16 space-y-12">
      <Breadcrumbs items={[{ label: 'Contact Us' }]} />

      <div className="max-w-2xl space-y-3">
        <span className="eyebrow">Concierge & Inquiries</span>
        <h1 className="text-3xl sm:text-4xl font-normal text-ink">Get in touch with VELORA</h1>
        <p className="text-xs sm:text-sm text-muted leading-relaxed">
          Whether you have an inquiry regarding a bespoke order, wish to inquire about vendor
          onboarding, or need assistance with a delivery, our concierge desk is at your service.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Contact Form */}
        <div className="lg:col-span-7">
          <div className="card p-6 sm:p-8 space-y-6">
            <h2 className="text-base font-semibold text-ink uppercase tracking-wider text-xs">
              Send a Direct Message
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Your Name"
                  required
                  placeholder="e.g. Vikramaditya Roy"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <Input
                  label="Email Address"
                  type="email"
                  required
                  placeholder="you@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <Input
                label="Subject"
                required
                placeholder="e.g. Order Tracking #VEL-2026-9812, Vendor Collaboration"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />

              <Textarea
                label="Message Details"
                required
                rows={5}
                placeholder="How may our customer concierge assist you today?..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />

              <Button type="submit" variant="primary" size="md" isLoading={isSubmitting}>
                <Send className="h-3.5 w-3.5 mr-1.5" /> Send Message
              </Button>
            </form>
          </div>
        </div>

        {/* Contact Details & Info */}
        <div className="lg:col-span-5 space-y-6">
          <div className="card p-6 sm:p-8 space-y-6 bg-canvas border-line">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink">
              Headquarters & Support
            </h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-ink">VELORA Marketplace Ltd.</p>
                  <p className="text-muted mt-0.5 leading-relaxed">
                    Level 8, The Heritage Pavilions, Bandra Kurla Complex (BKC),
                    <br />
                    Mumbai, Maharashtra — 400051, India
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-ink">Electronic Inquiries</p>
                  <p className="text-muted mt-0.5">concierge@velora.shop</p>
                  <p className="text-muted">sellers@velora.shop (Vendor desk)</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-ink">Operating Hours</p>
                  <p className="text-muted mt-0.5">Monday to Saturday: 09:30 AM – 07:00 PM IST</p>
                  <p className="text-muted">Sunday: Urgent order dispatches only</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUsPage;
