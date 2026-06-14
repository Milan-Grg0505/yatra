import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as Popover from '@radix-ui/react-popover';
import { LuBell, LuCheck } from 'react-icons/lu';
import { Button } from '@/components/atoms';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { selectNotification } from '@/features/slices/notificationSlice';
import {
  fetchNotificationsThunk,
  markAllNotificationsReadThunk,
  markNotificationReadThunk,
} from '@/features/thunks/notificationThunks.ts';
import { timeAgo, cn } from '@/lib/utils';

export function NotificationBell() {
  const dispatch = useAppDispatch();
  const { list, unread } = useAppSelector(selectNotification);

  useEffect(() => {
    dispatch(fetchNotificationsThunk({ limit: 10 }));
    const t = setInterval(() => dispatch(fetchNotificationsThunk({ limit: 10 })), 60_000);
    return () => clearInterval(t);
  }, [dispatch]);

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
          <LuBell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute top-1 right-1 h-4 min-w-[1rem] px-1 rounded-full bg-danger text-white text-[10px] font-bold flex items-center justify-center">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          sideOffset={8}
          align="end"
          className="z-50 w-96 rounded-2xl bg-surface dark:bg-dark-surface border border-border dark:border-dark-border shadow-elevated overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-border dark:border-dark-border">
            <h4 className="font-semibold">Notifications</h4>
            {list.length > 0 && (
              <button
                onClick={() => dispatch(markAllNotificationsReadThunk())}
                className="text-xs text-primary-600 hover:underline flex items-center gap-1"
              >
                <LuCheck className="h-3 w-3" /> Mark all read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {list.length === 0 ? (
              <div className="p-8 text-center text-text-3 text-sm">No notifications yet</div>
            ) : (
              list.map((n) => {
                const content = (
                  <div
                    className={cn(
                      'flex gap-3 p-3 border-b border-border dark:border-dark-border hover:bg-surface-2 dark:hover:bg-dark-surface-2 transition',
                      !n.read && 'bg-primary-50/40 dark:bg-primary-900/10',
                    )}
                  >
                    {!n.read && <span className="mt-2 h-2 w-2 rounded-full bg-primary-500 shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text dark:text-dark-text">{n.title}</p>
                      <p className="text-xs text-text-2 dark:text-dark-text-2 line-clamp-2 mt-0.5">{n.message}</p>
                      <p className="text-[10px] text-text-3 mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                  </div>
                );
                return n.link ? (
                  <Link key={n.id} to={n.link} onClick={() => !n.read && dispatch(markNotificationReadThunk(n.id))}>
                    {content}
                  </Link>
                ) : (
                  <button
                    key={n.id}
                    onClick={() => !n.read && dispatch(markNotificationReadThunk(n.id))}
                    className="w-full text-left"
                  >
                    {content}
                  </button>
                );
              })
            )}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
