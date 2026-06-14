import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { LuBadgeCheck, LuShieldCheck, LuShield, LuUsers, LuBuilding2, LuCircleX } from 'react-icons/lu';
import { Avatar, Badge, Button } from '@/components/atoms';
import { type Column } from '@/components/molecules/DataTable';
import { ConfirmModal } from '@/components/molecules/ConfirmModal';
import { ResourceManager } from '@/components/organisms/ResourceManager';
import { UserForm } from '@/components/forms';
import { userApi } from '@/api/user.api';
import { cn, formatDate } from '@/lib/utils';
import type { User } from '@/types';

type RoleTab = 'all' | 'user' | 'owner' | 'admin';

const TABS: { key: RoleTab; label: string; icon: React.ReactNode }[] = [
  { key: 'all', label: 'All', icon: <LuUsers className="h-4 w-4" /> },
  { key: 'user', label: 'Users', icon: <LuUsers className="h-4 w-4" /> },
  { key: 'owner', label: 'Owners', icon: <LuBuilding2 className="h-4 w-4" /> },
  { key: 'admin', label: 'Admins', icon: <LuShield className="h-4 w-4" /> },
];

export function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<RoleTab>('all');
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [pendingRejectId, setPendingRejectId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ user: User; type: 'verify' | 'approve' | 'reject' } | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const r = await userApi.listAll();
      setUsers(r.data ?? []);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const counts = useMemo(
    () => ({
      all: users.length,
      user: users.filter((u) => u.role === 'user').length,
      owner: users.filter((u) => u.role === 'owner').length,
      admin: users.filter((u) => u.role === 'admin').length,
    }),
    [users],
  );

  const filtered = useMemo(
    () => (tab === 'all' ? users : users.filter((u) => u.role === tab)),
    [users, tab],
  );

  /** Verify email — sets is_email_verified=true. */
  const verifyEmail = async (u: User) => {
    setPendingId(u.id);
    try {
      await userApi.adminUpdate(u.id, { is_email_verified: true } as any);
      toast.success(`${u.name} email verified`);
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, is_email_verified: true } : x)));
    } catch (e: any) {
      toast.error(e?.message ?? 'Could not verify user');
    } finally {
      setPendingId(null);
    }
  };

  /** Approve owner — sets is_approved=true. */
  const approveOwner = async (u: User) => {
    setPendingId(u.id);
    try {
      await userApi.adminUpdate(u.id, { is_approved: true } as any);
      toast.success(`${u.name} approved as owner`);
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, is_approved: true } : x)));
    } catch (e: any) {
      toast.error(e?.message ?? 'Could not approve owner');
    } finally {
      setPendingId(null);
    }
  };

  /** Reject owner — sets is_approved=false. */
  const rejectOwner = async (u: User) => {
    setPendingRejectId(u.id);
    try {
      await userApi.adminUpdate(u.id, { is_approved: false } as any);
      toast.success(`${u.name} rejected`);
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, is_approved: false } : x)));
    } catch (e: any) {
      toast.error(e?.message ?? 'Could not reject owner');
    } finally {
      setPendingRejectId(null);
    }
  };

  const isOwnerTab = tab === 'owner';

  const columns: Column<User>[] = [
    {
      key: 'name',
      header: 'User',
      sortable: true,
      render: (u) => (
        <div className="flex items-center gap-2">
          <Avatar src={u.image} name={u.name} size="sm" />
          <div className="min-w-0">
            <p className="font-medium flex items-center gap-1 truncate">
              {u.name}
              {u.is_email_verified && <LuBadgeCheck className="h-3.5 w-3.5 text-primary-600 shrink-0" />}
            </p>
            <p className="text-xs text-text-3 truncate">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (u) => (
        <Badge
          variant={u.role === 'admin' ? 'danger' : u.role === 'owner' ? 'primary' : 'default'}
          className="capitalize"
        >
          {u.role}
        </Badge>
      ),
    },
    ...(isOwnerTab
      ? [
        {
          key: 'is_approved',
          header: 'Approval',
          render: (u: User) => {
            if (u.is_approved === true)
              return <Badge variant="success"><LuBadgeCheck className="h-3 w-3" /> Approved</Badge>;
            if (u.is_approved === false)
              return <Badge variant="danger"><LuCircleX className="h-3 w-3" /> Rejected</Badge>;
            return (
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  loading={pendingId === u.id}
                  onClick={() => setConfirmAction({ user: u, type: 'approve' })}
                >
                  <LuShieldCheck className="h-3.5 w-3.5" /> Approve
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  loading={pendingRejectId === u.id}
                  onClick={() => setConfirmAction({ user: u, type: 'reject' })}
                  className="text-danger"
                >
                  <LuCircleX className="h-3.5 w-3.5" /> Reject
                </Button>
              </div>
            );
          },
        } as Column<User>,
        {
          key: 'is_email_verified',
          header: 'Email',
          render: (u: User) =>
            u.is_email_verified ? (
              <Badge variant="success"><LuBadgeCheck className="h-3 w-3" /> Verified</Badge>
            ) : (
              <Button
                size="sm"
                variant="outline"
                loading={pendingId === u.id}
                onClick={() => setConfirmAction({ user: u, type: 'verify' })}
              >
                <LuShieldCheck className="h-3.5 w-3.5" /> Verify
              </Button>
            ),
        } as Column<User>,
      ]
      : [
        {
          key: 'is_email_verified',
          header: 'Verified',
          render: (u: User) =>
            u.is_email_verified ? (
              <Badge variant="success">
                <LuBadgeCheck className="h-3 w-3" /> Verified
              </Badge>
            ) : (
              <Button
                size="sm"
                variant="outline"
                loading={pendingId === u.id}
                onClick={() => setConfirmAction({ user: u, type: 'verify' })}
              >
                <LuShieldCheck className="h-3.5 w-3.5" /> Verify
              </Button>
            ),
        } as Column<User>,
      ]),
    {
      key: 'createdAt',
      header: 'Joined',
      sortable: true,
      render: (u) => formatDate((u as any).created_at ?? (u as any).createdAt ?? ''),
    },
  ];

  return (
    <div>
      {/* ----- Role tabs ----- */}
      <div className="flex flex-wrap gap-1 p-1 mb-5 rounded-xl bg-surface-2 dark:bg-dark-surface-2 w-fit">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition',
              tab === t.key
                ? 'bg-surface dark:bg-dark-surface text-primary-600 shadow-sm'
                : 'text-text-2 dark:text-dark-text-2 hover:text-text dark:hover:text-dark-text',
            )}
          >
            {t.icon} {t.label}
            <span
              className={cn(
                'ml-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs',
                tab === t.key
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                  : 'bg-surface dark:bg-dark-surface text-text-3',
              )}
            >
              {counts[t.key]}
            </span>
          </button>
        ))}
      </div>

      <ResourceManager<User>
        title={
          tab === 'owner' ? 'Property owners'
            : tab === 'admin' ? 'Administrators'
              : tab === 'user' ? 'Travelers'
                : 'All users'
        }
        subtitle={
          tab === 'owner'
            ? 'Approve owners so they can register their property.'
            : 'Manage roles and account verification.'
        }
        entityName="user"
        data={filtered}
        columns={columns}
        loading={loading}
        searchKey="name"
        modalSize="md"
        getId={(u) => u.id}
        getLabel={(u) => u.name}
        onRefresh={load}
        onDelete={async (u) => {
          try {
            await userApi.adminDelete(u.id);
            setUsers((prev) => prev.filter((user) => user.id !== u.id));
            toast.success('User deleted');
          } catch (error: any) {
            toast.error(error?.message ?? 'Failed to delete user');
          }
        }}
        renderForm={({ editing, onDone }) => <UserForm editing={editing} onDone={onDone} />}
      />

      <ConfirmModal
        open={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={async () => {
          if (!confirmAction) return;
          const { user, type } = confirmAction;
          if (type === 'verify') await verifyEmail(user);
          else if (type === 'approve') await approveOwner(user);
          else if (type === 'reject') await rejectOwner(user);
          setConfirmAction(null);
        }}
        title={
          confirmAction?.type === 'approve' ? 'Approve owner?'
            : confirmAction?.type === 'reject' ? 'Reject owner?'
              : 'Verify user?'
        }
        message={
          confirmAction ? (
            <>
              {confirmAction.type === 'approve'
                ? `Approve "${confirmAction.user.name}" as a property owner?`
                : confirmAction.type === 'reject'
                  ? `Reject "${confirmAction.user.name}"? They won't be able to access the owner dashboard.`
                  : `Mark "${confirmAction.user.name}" as verified?`}
            </>
          ) : undefined
        }
        confirmText={
          confirmAction?.type === 'approve' ? 'Approve'
            : confirmAction?.type === 'reject' ? 'Reject'
              : 'Verify'
        }
        confirmVariant={confirmAction?.type === 'approve' ? 'primary' : 'danger'}
        icon={
          confirmAction?.type === 'approve'
            ? <LuShieldCheck className="h-7 w-7" />
            : <LuCircleX className="h-7 w-7" />
        }
      />
    </div>
  );
}
