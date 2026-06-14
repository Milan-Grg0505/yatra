import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
import { useEffect, useState } from 'react';
import type { AppDispatch, RootState } from '@/features/store';
import { selectAuth } from '@/features/slices/authSlice';


export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

/** Returns auth state + helpful booleans. */
export function useAuth() {
  const auth = useAppSelector(selectAuth);
  return {
    ...auth,
    isAuthenticated: !!auth.user,
    isAdmin: auth.user?.role === 'admin',
    isOwner: auth.user?.role === 'owner',
    isUser: auth.user?.role === 'user',
  };
}

/** Debounce any changing value (great for search inputs). */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

/** Run an effect on mount only. */
export function useMount(fn: () => void) {
  useEffect(() => {
    fn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
