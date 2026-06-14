import { createAsyncThunk } from '@reduxjs/toolkit';
import { notificationApi } from '@/api/notification.api';

export const fetchNotificationsThunk = createAsyncThunk(
  'notification/fetch',
  async (params: { page?: number; limit?: number; unread?: boolean } | undefined, { rejectWithValue }) => {
    try {
      const res = await notificationApi.list(params);
      return { list: res.data ?? [], unread: res.meta?.unread ?? 0 };
    } catch (err: any) {
      return rejectWithValue(err?.message ?? 'Failed');
    }
  },
);

export const markNotificationReadThunk = createAsyncThunk(
  'notification/read',
  async (id: string, { rejectWithValue }) => {
    try {
      await notificationApi.markRead(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err?.message ?? 'Failed');
    }
  },
);

export const markAllNotificationsReadThunk = createAsyncThunk(
  'notification/readAll',
  async (_, { rejectWithValue }) => {
    try {
      await notificationApi.markAllRead();
      return true;
    } catch (err: any) {
      return rejectWithValue(err?.message ?? 'Failed');
    }
  },
);
