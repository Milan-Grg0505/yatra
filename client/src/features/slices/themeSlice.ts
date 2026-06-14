import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

type Theme = 'light' | 'dark';

const stored: Theme | null =
  typeof localStorage !== 'undefined' ? (localStorage.getItem('theme') as Theme | null) : null;
const prefersDark =
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches;

const themeSlice = createSlice({
  name: 'theme',
  initialState: { mode: (stored ?? (prefersDark ? 'dark' : 'light')) as Theme },
  reducers: {
    setTheme(state, action: PayloadAction<Theme>) {
      state.mode = action.payload;
      localStorage.setItem('theme', action.payload);
    },
    toggleTheme(state) {
      state.mode = state.mode === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', state.mode);
    },
  },
});

export const { setTheme, toggleTheme } = themeSlice.actions;
export const selectTheme = (state: { theme: { mode: Theme } }) => state.theme;
export default themeSlice.reducer;
