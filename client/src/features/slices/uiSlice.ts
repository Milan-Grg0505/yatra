import { createSlice } from '@reduxjs/toolkit';

interface UiState {
  sidebarCollapsed: boolean;
  mobileNavOpen: boolean;
  notificationPanelOpen: boolean;
}

const initialState: UiState = {
  sidebarCollapsed: false,
  mobileNavOpen: false,
  notificationPanelOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar(s) {
      s.sidebarCollapsed = !s.sidebarCollapsed;
    },
    toggleMobileNav(s) {
      s.mobileNavOpen = !s.mobileNavOpen;
    },
    closeMobileNav(s) {
      s.mobileNavOpen = false;
    },
    toggleNotificationPanel(s) {
      s.notificationPanelOpen = !s.notificationPanelOpen;
    },
    closeNotificationPanel(s) {
      s.notificationPanelOpen = false;
    },
  },
});

export const {
  toggleSidebar,
  toggleMobileNav,
  closeMobileNav,
  toggleNotificationPanel,
  closeNotificationPanel,
} = uiSlice.actions;
export const selectUi = (state: { ui: UiState }) => state.ui;
export default uiSlice.reducer;
