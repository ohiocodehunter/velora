import React, { useEffect, useState } from 'react';
import { adminService } from '@/services/admin.service';
import type { User, PaginationMeta } from '@/types';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import Pagination from '@/components/ui/Pagination';
import { formatDate } from '@/utils/format';
import { useAppDispatch } from '@/hooks/store';
import { addToast } from '@/store/slices/uiSlice';
import { Users, Search, ShieldAlert, CheckCircle2, XCircle } from 'lucide-react';
import { getErrorMessage } from '@/services/api';

export const AdminUsersPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [users, setUsers] = useState<User[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, [page, roleFilter, searchQuery]);

  async function loadUsers() {
    try {
      setIsLoading(true);
      const res = await adminService.getUsers({
        page,
        limit: 12,
        role: roleFilter === 'all' ? undefined : roleFilter,
        q: searchQuery.trim() || undefined,
      });
      setUsers(res.users);
      setMeta(res.meta);
    } catch {
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }

  const handleToggleActive = async (user: User) => {
    try {
      const nextActive = !user.isActive;
      const updated = await adminService.updateUser(user._id, { isActive: nextActive });
      setUsers(users.map((u) => (u._id === updated._id ? updated : u)));
      dispatch(
        addToast({
          type: 'success',
          message: `User "${user.name}" is now ${nextActive ? 'Active' : 'Suspended'}`,
        }),
      );
    } catch (err) {
      dispatch(addToast({ type: 'error', message: getErrorMessage(err, 'Failed to update user status') }));
    }
  };

  const handleChangeRole = async (user: User, newRole: string) => {
    try {
      const updated = await adminService.updateUser(user._id, { role: newRole });
      setUsers(users.map((u) => (u._id === updated._id ? updated : u)));
      dispatch(
        addToast({
          type: 'success',
          message: `Updated role for "${user.name}" to ${newRole}`,
        }),
      );
    } catch (err) {
      dispatch(addToast({ type: 'error', message: getErrorMessage(err, 'Failed to change role') }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line">
        <div>
          <h1 className="text-xl font-normal text-ink">User Directory & Permissions</h1>
          <p className="text-xs text-muted mt-0.5">
            Manage buyer, seller, and administrator accounts
          </p>
        </div>
      </div>

      {/* Search and Role Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name or email..."
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-line bg-surface text-xs text-ink placeholder:text-muted"
          />
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted pointer-events-none" />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
          className="h-10 px-3 rounded-xl border border-line bg-surface text-xs text-ink"
        >
          <option value="all">All Roles</option>
          <option value="customer">Customers</option>
          <option value="seller">Sellers</option>
          <option value="admin">Administrators</option>
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 rounded-2xl" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <EmptyState
          icon={<Users className="h-8 w-8" />}
          title="No users found"
          description="Try broadening your search query or role filter."
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-canvas border-b border-line text-[11px] font-semibold text-muted uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Registered</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-canvas/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {u.avatar?.url ? (
                          <img
                            src={u.avatar.url}
                            alt={u.name}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-accent text-surface text-xs font-semibold flex items-center justify-center uppercase shrink-0">
                            {u.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-ink">{u.name}</p>
                          <p className="text-[11px] text-muted">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleChangeRole(u, e.target.value)}
                        className="h-7 px-2 rounded-lg border border-line bg-surface text-xs text-ink font-medium capitalize"
                      >
                        <option value="customer">Customer</option>
                        <option value="seller">Seller</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>

                    <td className="py-3 px-4 text-muted">{formatDate(u.createdAt)}</td>

                    <td className="py-3 px-4">
                      {u.isActive ? (
                        <span className="px-2 py-0.5 rounded-md bg-[#EEF3F0] text-success border border-[#D6E4DC] text-[10px] font-semibold uppercase">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-danger/10 text-danger border border-danger/20 text-[10px] font-semibold uppercase">
                          Suspended
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(u)}
                        className={`h-7 text-xs ${
                          u.isActive
                            ? 'text-danger hover:bg-danger/5 hover:border-danger'
                            : 'text-success hover:bg-success/5 hover:border-success'
                        }`}
                      >
                        {u.isActive ? 'Suspend' : 'Activate'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {meta && meta.pages > 1 && (
            <div className="p-4 border-t border-line">
              <Pagination
                currentPage={meta.page}
                totalPages={meta.pages}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
