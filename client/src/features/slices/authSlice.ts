import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import {
  loginThunk,
  registerThunk,
  verifyAuthThunk,
  logoutThunk,
  updateProfileThunk,
  uploadAvatarThunk,
} from '@/features/thunks/authThunks';
import type { User } from '@/types';

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
  otpEmail: string | null;
}

const initialState: AuthState = {
  user: null,
  token: typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null,
  refreshToken: typeof localStorage !== 'undefined' ? localStorage.getItem('refreshToken') : null,
  loading: false,
  error: null,
  otpEmail: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken(state, action: PayloadAction<string>) {
      state.token = action.payload;
      localStorage.setItem('token', action.payload);
    },
    setCredentials(state, action: PayloadAction<{ user: User; token: string; refresh_token: string }>) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refresh_token;
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('refreshToken', action.payload.refresh_token);
    },
    clearAuth(state) {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    },
    clearAuthError(state) {
      state.error = null;
    },
    setOtpEmail(state, action: PayloadAction<string | null>) {
      state.otpEmail = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(loginThunk.fulfilled, (s, a) => {
        s.loading = false;
        s.user = a.payload.user;
        s.token = a.payload.token;
        s.refreshToken = a.payload.refresh_token;
        localStorage.setItem('token', a.payload.token);
        localStorage.setItem('refreshToken', a.payload.refresh_token);
      })
      .addCase(loginThunk.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload as string;
      })

      .addCase(registerThunk.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(registerThunk.fulfilled, (s) => {
        s.loading = false;
      })
      .addCase(registerThunk.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload as string;
      })

      .addCase(verifyAuthThunk.fulfilled, (s, a) => {
        s.user = a.payload.user;
      })
      .addCase(verifyAuthThunk.rejected, (s) => {
        s.user = null;
        s.token = null;
        s.refreshToken = null;
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      })

      .addCase(logoutThunk.fulfilled, (s) => {
        s.user = null;
        s.token = null;
        s.refreshToken = null;
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      })

      .addCase(updateProfileThunk.fulfilled, (s, a) => {
        if (a.payload) s.user = a.payload;
      })

      .addCase(uploadAvatarThunk.fulfilled, (s, a) => {
        if (s.user) s.user.image = a.payload;
      });
  },
});
// ✅ Add isAuthenticated selector
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  !!state.auth.token && !!state.auth.user;

export const { setToken, setCredentials, clearAuth, clearAuthError, setOtpEmail } = authSlice.actions;
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export default authSlice.reducer;
