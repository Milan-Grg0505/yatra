import { createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from '@/api/auth.api';
import { userApi } from '@/api/user.api';
import type { User, OtpType } from '@/types';

export const loginThunk = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await authApi.login(credentials);
      return res.data!;
    } catch (err: any) {
      return rejectWithValue(err?.message ?? 'Login failed');
    }
  },
);

export const registerThunk = createAsyncThunk(
  'auth/register',
  async (
    data: { name: string; email: string; password: string; phone?: string; role?: 'user' | 'owner' },
    { rejectWithValue },
  ) => {
    try {
      const res = await authApi.register(data);
      return res.data!;
    } catch (err: any) {
      return rejectWithValue(err?.message ?? 'Registration failed');
    }
  },
);

export const verifyAuthThunk = createAsyncThunk(
  'auth/verify',
  async (_, { rejectWithValue }) => {
    try {
      const res = await authApi.verify();
      return res.data!;
    } catch (err: any) {
      return rejectWithValue(err?.message ?? 'Not authenticated');
    }
  },
);

export const logoutThunk = createAsyncThunk('auth/logout', async () => {
  try {
    await authApi.logout();
  } catch {
    /* ignore — we always clear locally */
  }
});

export const sendOtpThunk = createAsyncThunk(
  'auth/sendOtp',
  async (
    data: { email: string; type: OtpType; new_email?: string },
    { rejectWithValue },
  ) => {
    try {
      await authApi.sendOtp(data);
      return data.email;
    } catch (err: any) {
      return rejectWithValue(err?.message ?? 'Failed to send OTP');
    }
  },
);

export const verifyOtpThunk = createAsyncThunk(
  'auth/verifyOtp',
  async (data: { email: string; otp: string; type: OtpType }, { rejectWithValue }) => {
    try {
      await authApi.verifyOtp(data);
      return data.email;
    } catch (err: any) {
      return rejectWithValue(err?.message ?? 'Invalid OTP');
    }
  },
);

export const resetPasswordThunk = createAsyncThunk(
  'auth/resetPassword',
  async (data: { email: string; otp: string; new_password: string }, { rejectWithValue }) => {
    try {
      await authApi.resetPassword(data);
      return true;
    } catch (err: any) {
      return rejectWithValue(err?.message ?? 'Reset failed');
    }
  },
);

export const updateProfileThunk = createAsyncThunk(
  'auth/updateProfile',
  async (data: Record<string, unknown>, { rejectWithValue }) => {
    try {
      const res = await userApi.updatePreferences(data);
      return res.data as User;
    } catch (err: any) {
      return rejectWithValue(err?.message ?? 'Failed to update profile');
    }
  },
);

export const uploadAvatarThunk = createAsyncThunk(
  'auth/uploadAvatar',
  async (file: File, { rejectWithValue }) => {
    try {
      const res = await userApi.uploadAvatar(file);
      return res.data!.image;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Upload failed';
      return rejectWithValue(msg);
    }
  },
);

export const changePasswordThunk = createAsyncThunk(
  'auth/changePassword',
  async (data: { old_password: string; new_password: string }, { rejectWithValue }) => {
    try {
      await userApi.changePassword(data);
      return true;
    } catch (err: any) {
      return rejectWithValue(err?.message ?? 'Failed to change password');
    }
  },
);
