import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
  LuMenu,
  LuX,
  LuUser,
  LuHeart,
  LuTicket,
  LuStar,
  LuLogOut,
  LuLayoutDashboard,
  LuSparkles,
  LuPlane,
} from 'react-icons/lu';
import { Avatar, Button, Logo, ThemeToggle } from '@/components/atoms';
import { NotificationBell } from '@/components/molecules';
import { ROUTES } from '@/lib/constant';
import { useAppDispatch, useAuth } from '@/hooks';
import { logoutThunk } from '@/features/thunks/authThunks';
import { useAppSelector } from '@/hooks';
import { selectUi, toggleMobileNav, closeMobileNav } from '@/features/slices/uiSlice';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { selectAuth } from '@/features/slices/authSlice';

export function MainLayout() {
  const { user, isAuthenticated, isOwner, isAdmin } = useAuth();
  const { mobileNavOpen } = useAppSelector(selectUi);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(logoutThunk());
    toast.success('Logged out successfully');
    navigate(ROUTES.HOME);
  };
  console.log(useAuth());

  const navLinks = [
    { to: ROUTES.HOME, label: 'Home' },
    { to: ROUTES.ABOUT, label: 'About Us' },
    { to: ROUTES.HOTELS, label: 'Hotels' },
    { to: ROUTES.BLOGS, label: 'Blogs' },
    { to: ROUTES.TRAVEL_PACKAGES, label: 'Travel' },
    { to: ROUTES.CHAT, label: 'AI Assistant', icon: <LuSparkles className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-surface dark:bg-dark-surface">
      {/* Top Nav */}
      <header className="sticky top-0 z-40 bg-surface/90 dark:bg-dark-surface/90 backdrop-blur-lg border-b border-border dark:border-dark-border">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to={ROUTES.HOME} className="flex items-center">
            <Logo />
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === ROUTES.HOME}
                className={({ isActive }) =>
                  cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium inline-flex items-center gap-1.5 transition',
                    isActive
                      ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                      : 'text-text-2 dark:text-dark-text-2 hover:text-text dark:hover:text-dark-text hover:bg-surface-2 dark:hover:bg-dark-surface-2',
                  )
                }
              >
                {l.icon}
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <ThemeToggle />
            {isAuthenticated && <NotificationBell />}


            {isAuthenticated && user ? (
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button className="flex items-center gap-2 rounded-full hover:bg-surface-2 dark:hover:bg-dark-surface-2 p-1 transition">
                    <Avatar src={user.image} name={user.name} size="sm" />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    align="end"
                    sideOffset={8}
                    className="z-50 min-w-[240px] rounded-xl bg-surface dark:bg-dark-surface border border-border dark:border-dark-border shadow-elevated p-1.5 animate-fade-in"
                  >
                    <div className="px-3 py-2.5 border-b border-border dark:border-dark-border mb-1">
                      <p className="font-medium text-sm">{user.name}</p>
                      <p className="text-xs text-text-3 truncate">{user.email}</p>
                    </div>

                    {isAdmin && (
                      <MenuLink to={ROUTES.ADMIN.DASHBOARD} icon={<LuLayoutDashboard />}>
                        Admin Dashboard
                      </MenuLink>
                    )}
                    {isOwner && (
                      <MenuLink to={ROUTES.OWNER.DASHBOARD} icon={<LuLayoutDashboard />}>
                        Owner Dashboard
                      </MenuLink>
                    )}

                    <MenuLink to={ROUTES.PROFILE} icon={<LuUser />}>Profile</MenuLink>
                    <MenuLink to={ROUTES.MY_BOOKINGS} icon={<LuTicket />}>My Bookings</MenuLink>
                    <MenuLink to={ROUTES.MY_REVIEWS} icon={<LuStar />}>My Reviews</MenuLink>
                    <MenuLink to={ROUTES.WISHLIST} icon={<LuHeart />}>Wishlist</MenuLink>

                    <DropdownMenu.Separator className="my-1 h-px bg-border dark:bg-dark-border" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-danger hover:bg-danger/10 transition"
                    >
                      <LuLogOut className="h-4 w-4" /> Logout
                    </button>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            ) : (
              <div className="hidden md:flex items-center gap-2 ml-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link to={ROUTES.LOGIN}>Sign in</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to={ROUTES.REGISTER}>Sign up</Link>
                </Button>
              </div>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => dispatch(toggleMobileNav())}
            >
              {mobileNavOpen ? <LuX className="h-5 w-5" /> : <LuMenu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileNavOpen && (
          <nav className="md:hidden border-t border-border dark:border-dark-border bg-surface dark:bg-dark-surface animate-fade-in">
            <div className="max-w-7xl mx-auto px-4 py-3 space-y-1">
              {navLinks.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.to === ROUTES.HOME}
                  onClick={() => dispatch(closeMobileNav())}
                  className={({ isActive }) =>
                    cn(
                      'block px-3 py-2 rounded-lg text-sm font-medium',
                      isActive
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600'
                        : 'text-text dark:text-dark-text',
                    )
                  }
                >
                  {l.label}
                </NavLink>
              ))}
              {!isAuthenticated && (
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border dark:border-dark-border">
                  <Button variant="outline" asChild>
                    <Link to={ROUTES.LOGIN} onClick={() => dispatch(closeMobileNav())}>Sign in</Link>
                  </Button>
                  <Button asChild>
                    <Link to={ROUTES.REGISTER} onClick={() => dispatch(closeMobileNav())}>Sign up</Link>
                  </Button>
                </div>
              )}
            </div>
          </nav>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="mt-auto bg-surface-2 dark:bg-dark-surface-2 border-t border-border dark:border-dark-border">
        <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
          <div className="col-span-2 md:col-span-1">
            <Logo />
            <p className="mt-3 text-text-2 dark:text-dark-text-2 max-w-xs">
              Hotels, homestays, and curated travel experiences across Nepal.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Explore</h4>
            <ul className="space-y-2 text-text-2 dark:text-dark-text-2">
              <li><Link to={ROUTES.HOTELS} className="hover:text-primary-600">All hotels</Link></li>
              <li><Link to={ROUTES.TRAVEL_PACKAGES} className="hover:text-primary-600">Travel packages</Link></li>
              <li><Link to={ROUTES.CHAT} className="hover:text-primary-600">AI Assistant</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">For Hosts</h4>
            <ul className="space-y-2 text-text-2 dark:text-dark-text-2">
              <li><Link to={`${ROUTES.REGISTER}?role=owner`} className="hover:text-primary-600">List your property</Link></li>
              <li><Link to={ROUTES.LOGIN} className="hover:text-primary-600">Owner login</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Support</h4>
            <ul className="space-y-2 text-text-2 dark:text-dark-text-2">
              <li><a className="hover:text-primary-600">Help center</a></li>
              <li><a className="hover:text-primary-600">Contact</a></li>
              <li><a className="hover:text-primary-600">Privacy</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border dark:border-dark-border">
          <div className="max-w-7xl mx-auto px-4 py-4 text-xs text-text-3 flex items-center justify-between">
            <span>© {new Date().getFullYear()} Yatra · Made with <LuPlane className="inline h-3 w-3 -mt-0.5" /> in Nepal</span>
            <span>v1.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function MenuLink({ to, icon, children }: { to: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <DropdownMenu.Item asChild>
      <Link
        to={to}
        className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-surface-2 dark:hover:bg-dark-surface-2 transition outline-none cursor-pointer"
      >
        <span className="h-4 w-4 text-text-2">{icon}</span>
        {children}
      </Link>
    </DropdownMenu.Item>
  );
}
