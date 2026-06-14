import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import hotelReducer from './slices/hotelSlice';
// import bookingReducer from './slices/bookingSlice';
// import reviewReducer from './slices/reviewSlice';
import travelReducer from './slices/travelSlice';
import notificationReducer from './slices/notificationSlice';
// import aiReducer from './slices/aiSlice';
import themeReducer from './slices/themeSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    hotel: hotelReducer,
    // booking: bookingReducer,
    // review: reviewReducer,
    travel: travelReducer,
    notification: notificationReducer,
    // ai: aiReducer,
    theme: themeReducer,
    ui: uiReducer,
  },
  middleware: (getDefault) =>
    getDefault({
      serializableCheck: {
        // FormData and Date should be allowed in thunks
        ignoredActionPaths: ['payload.formData'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
