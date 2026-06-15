import { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import {
  LuLayoutDashboard,
  LuHotel,
  LuTicket,
  LuStar,
  LuPlane,
  LuUsers,
  LuBuilding,
  LuMapPin,
  LuFileText,
  LuTags,
  LuSettings,
  LuLogOut,
  LuMenu,
  LuChartBar,
  LuChevronLeft,
  LuCamera,
} from 'react-icons/lu';
import { Avatar, Button, Logo, ThemeToggle } from '@/components/atoms';
import { ConfirmModal, NotificationBell } from '@/components/molecules';
import { ROUTES } from '@/lib/constant';
import { useAuth, useAppDispatch, useAppSelector } from '@/hooks';
import { logoutThunk } from '@/features/thunks/authThunks';
import { selectUi, toggleSidebar } from '@/features/slices/uiSlice';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { hotelApi } from '@/api/hotel.api';

interface DashboardLayoutProps {
  variant: 'owner' | 'admin';
}

export function DashboardLayout({ variant }: DashboardLayoutProps) {
  const { user, isOwner, isAuthenticated } = useAuth();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { sidebarCollapsed } = useAppSelector(selectUi);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [hasHotels, setHasHotels] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isOwner) return;
    hotelApi.my().then((res) => setHasHotels((res.data ?? []).length > 0)).catch(() => setHasHotels(false));
  }, [isOwner]);

  const handleLogout = async () => {
    setLogoutConfirmOpen(false);
    await dispatch(logoutThunk());
    toast.success('Logged out');
    navigate(ROUTES.HOME);
  };

  const ownerNav = [
    { to: ROUTES.OWNER.DASHBOARD, icon: LuLayoutDashboard, label: 'Dashboard' },
    { to: ROUTES.OWNER.HOTELS, icon: LuHotel, label: 'My Hotels' },
    { to: ROUTES.OWNER.BOOKINGS, icon: LuTicket, label: 'Bookings' },
    { to: ROUTES.OWNER.REVIEWS, icon: LuStar, label: 'Reviews' },
    { to: ROUTES.OWNER.ANALYTICS, icon: LuChartBar, label: 'Analytics' },
  ];

  const adminNav = [
    { to: ROUTES.ADMIN.DASHBOARD, icon: LuLayoutDashboard, label: 'Dashboard' },
    { to: ROUTES.ADMIN.USERS, icon: LuUsers, label: 'Users' },
    { to: ROUTES.ADMIN.HOTELS, icon: LuHotel, label: 'Hotels' },
    { to: ROUTES.ADMIN.HEROES, icon: LuCamera, label: 'Heroes' },
    { to: ROUTES.ADMIN.APPROVE_HOTELS, icon: LuBuilding, label: 'Approve Hotels' },
    { to: ROUTES.ADMIN.BOOKINGS, icon: LuTicket, label: 'Bookings' },
    { to: ROUTES.ADMIN.REVIEWS, icon: LuStar, label: 'Reviews' },
    { to: ROUTES.ADMIN.TRAVEL_PACKAGES, icon: LuPlane, label: 'Travel Packages' },
    { to: ROUTES.ADMIN.CITIES, icon: LuMapPin, label: 'Cities' },
    { to: ROUTES.ADMIN.BLOGS, icon: LuFileText, label: 'Blogs' },
    { to: ROUTES.ADMIN.COUPONS, icon: LuTags, label: 'Coupons' },
    { to: ROUTES.ADMIN.SETTINGS, icon: LuSettings, label: 'Settings' },
  ];

  const nav = variant === 'admin' ? adminNav : ownerNav;

  return (
    <div className="min-h-screen flex bg-surface-2 dark:bg-dark-surface">
      <aside
        className={cn(
          'shrink-0 sticky top-0 h-screen border-r border-border dark:border-dark-border bg-surface dark:bg-dark-surface flex flex-col transition-[width] duration-200',
          sidebarCollapsed ? 'w-16' : 'w-64',
        )}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-border dark:border-dark-border">
          {!sidebarCollapsed ? (
            <Link to={ROUTES.HOME}>
              <Logo size="sm" />
            </Link>
          ) : (
            <Link to={ROUTES.HOME}>
              <Logo size="sm" withText={false} />
            </Link>
          )}
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="p-1.5 rounded-lg hover:bg-surface-2 dark:hover:bg-dark-surface-2 text-text-2"
          >
            <LuChevronLeft className={cn('h-4 w-4 transition', sidebarCollapsed && 'rotate-180')} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition',
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                    : 'text-text-2 dark:text-dark-text-2 hover:bg-surface-2 dark:hover:bg-dark-surface-2 hover:text-text dark:hover:text-dark-text',
                )
              }
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="p-2 border-t border-border dark:border-dark-border">
          <button
            onClick={() => setLogoutConfirmOpen(true)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-danger hover:bg-danger/10 transition',
              sidebarCollapsed && 'justify-center',
            )}
          >
            <LuLogOut className="h-5 w-5" />
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 h-16 bg-surface/90 dark:bg-dark-surface/90 backdrop-blur border-b border-border dark:border-dark-border flex items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => dispatch(toggleSidebar())}>
              <LuMenu className="h-5 w-5" />
            </Button>
            <h1 className="font-semibold capitalize hidden sm:block">{variant} Console</h1>
          </div>
          <div className="flex items-center gap-1">

            {isAuthenticated && isOwner && user?.is_email_verified && hasHotels === false && (
              <Button asChild variant="outline" size="sm">
                <Link to={ROUTES.OWNER.REGISTER_PROPERTY}>Register Property</Link>
              </Button>
            )}

            <ThemeToggle />
            <NotificationBell />
            <div className="flex items-center gap-2 ml-2">
              <Avatar src={user?.image} name={user?.name ?? ''} size="sm" />
              <div className="hidden sm:block">
                <p className="text-sm font-medium leading-none">{user?.name}</p>
                <p className="text-xs text-text-3">{user?.email}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>

      <ConfirmModal
        open={logoutConfirmOpen}
        onClose={() => setLogoutConfirmOpen(false)}
        onConfirm={handleLogout}
        title="Logout?"
        message="Are you sure you want to log out?"
        confirmText="Logout"
        confirmVariant="danger"
        icon={<LuLogOut className="h-7 w-7" />}
      />
    </div>
  );
}
