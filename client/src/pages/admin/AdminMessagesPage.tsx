import React, { useEffect, useState } from 'react';
import { adminService } from '@/services/admin.service';
import type { PaginationMeta } from '@/types';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import Pagination from '@/components/ui/Pagination';
import { formatDate, formatDateTime } from '@/utils/format';
import { useAppDispatch } from '@/hooks/store';
import { addToast } from '@/store/slices/uiSlice';
import { Mail, CheckCircle2, Clock } from 'lucide-react';
import { getErrorMessage } from '@/services/api';

export const AdminMessagesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [messages, setMessages] = useState<any[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMessages();
  }, [page]);

  async function loadMessages() {
    try {
      setIsLoading(true);
      const res = await adminService.getMessages({ page, limit: 10 });
      setMessages(res.messages);
      setMeta(res.meta);
    } catch {
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  }

  const handleToggleResolved = async (msg: any) => {
    try {
      const nextResolved = !msg.isResolved;
      const updated = await adminService.updateMessage(msg._id, { isResolved: nextResolved });
      setMessages(messages.map((m) => (m._id === updated._id ? updated : m)));
      dispatch(
        addToast({
          type: 'success',
          message: `Inquiry marked as ${nextResolved ? 'Resolved' : 'Open'}`,
        }),
      );
    } catch (err) {
      dispatch(addToast({ type: 'error', message: getErrorMessage(err, 'Failed to update message') }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-line">
        <h1 className="text-xl font-normal text-ink">Customer & Vendor Inquiries</h1>
        <p className="text-xs text-muted mt-0.5">
          Messages submitted through the platform contact and concierge desk
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : messages.length === 0 ? (
        <EmptyState
          icon={<Mail className="h-8 w-8" />}
          title="Inbox is clear"
          description="Inquiries submitted via the Contact Us form will appear here."
        />
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg._id} className="card p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-line">
                <div>
                  <h3 className="font-semibold text-ink text-sm">{msg.subject}</h3>
                  <p className="text-xs text-muted mt-0.5">
                    From: <strong className="text-ink">{msg.name}</strong> ({msg.email})
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted">{formatDateTime(msg.createdAt)}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase border ${
                      msg.isResolved
                        ? 'bg-[#EEF3F0] text-success border-[#D6E4DC]'
                        : 'bg-[#FAF3E6] text-[#8a6d3b] border-[#EBDCC0]'
                    }`}
                  >
                    {msg.isResolved ? 'Resolved' : 'Pending'}
                  </span>
                </div>
              </div>

              <p className="text-xs text-ink/80 leading-relaxed whitespace-pre-line">{msg.message}</p>

              <div className="pt-2 border-t border-line/60 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleResolved(msg)}
                  className="h-7 text-xs"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                  {msg.isResolved ? 'Re-open Inquiry' : 'Mark as Resolved'}
                </Button>
              </div>
            </div>
          ))}

          {meta && meta.pages > 1 && (
            <Pagination
              currentPage={meta.page}
              totalPages={meta.pages}
              onPageChange={setPage}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default AdminMessagesPage;
