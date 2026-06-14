import { createSlice } from '@reduxjs/toolkit';
import {
  fetchNotificationsThunk,
  markNotificationReadThunk,
  markAllNotificationsReadThunk,
} from '../thunks/notificationThunks.ts';
import type { AppNotification } from '@/types';

interface NotificationState {
  list: AppNotification[];
  unread: number;
  loading: boolean;
}

const initialState: NotificationState = { list: [], unread: 0, loading: false };

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchNotificationsThunk.pending, (s) => {
      s.loading = true;
    })
      .addCase(fetchNotificationsThunk.fulfilled, (s, a) => {
        s.loading = false;
        s.list = a.payload.list;
        s.unread = a.payload.unread;
      })
      .addCase(markNotificationReadThunk.fulfilled, (s, a) => {
        const n = s.list.find((x) => x.id === a.payload);
        if (n && !n.read) {
          n.read = true;
          s.unread = Math.max(0, s.unread - 1);
        }
      })
      .addCase(markAllNotificationsReadThunk.fulfilled, (s) => {
        s.list.forEach((n) => (n.read = true));
        s.unread = 0;
      });
  },
});

export const selectNotification = (state: { notification: NotificationState }) => state.notification;
export default notificationSlice.reducer;
