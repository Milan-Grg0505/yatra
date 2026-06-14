import { createSlice } from '@reduxjs/toolkit';
import {
  fetchHotelsThunk,
  fetchHotelByIdThunk,
  searchHotelsThunk,
  fetchRecommendationsThunk,
  fetchDestinationsThunk,
  fetchPendingHotelsThunk,
  fetchMyHotelsThunk,
  createHotelThunk,
  updateHotelThunk,
  deleteHotelThunk,
  updateHotelStatusThunk,
  fetchWishlistThunk,
  toggleWishlistThunk,
} from '../thunks/hotelThunks';
import type { Hotel } from '@/types';

interface HotelState {
  hotels: Hotel[];
  currentHotel: Hotel | null;
  recommendations: Hotel[];
  searchResults: Hotel[];
  destinations: Array<{ _id: string; name: string; image?: string; count: number }>;
  myHotels: Hotel[];
  pendingHotels: Hotel[];
  wishlist: Hotel[];
  loading: boolean;
  error: string | null;
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

const initialState: HotelState = {
  hotels: [],
  currentHotel: null,
  recommendations: [],
  searchResults: [],
  destinations: [],
  myHotels: [],
  pendingHotels: [],
  wishlist: [],
  loading: false,
  error: null,
  pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
};

const hotelSlice = createSlice({
  name: 'hotel',
  initialState,
  reducers: {
    clearCurrentHotel(state) {
      state.currentHotel = null;
    },
    clearSearchResults(state) {
      state.searchResults = [];
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchHotelsThunk.pending, (s) => {
      s.loading = true;
      s.error = null;
    })
      .addCase(fetchHotelsThunk.fulfilled, (s, a) => {
        s.loading = false;
        s.hotels = a.payload.hotels;
        if (a.payload.meta) {
          s.pagination = {
            page: a.payload.meta.page ?? 1,
            limit: a.payload.meta.limit ?? 20,
            total: a.payload.meta.total ?? 0,
            totalPages: a.payload.meta.pages ?? a.payload.meta.totalPages ?? 0,
          };
        }
      })
      .addCase(fetchHotelsThunk.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload as string;
      })

      .addCase(fetchHotelByIdThunk.pending, (s) => {
        s.loading = true;
      })
      .addCase(fetchHotelByIdThunk.fulfilled, (s, a) => {
        s.loading = false;
        s.currentHotel = a.payload;
      })
      .addCase(fetchHotelByIdThunk.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload as string;
      })

      .addCase(searchHotelsThunk.pending, (s) => {
        s.loading = true;
      })
      .addCase(searchHotelsThunk.fulfilled, (s, a) => {
        s.loading = false;
        s.searchResults = a.payload.hotels;
        if (a.payload.meta) {
          s.pagination = {
            page: a.payload.meta.page ?? 1,
            limit: a.payload.meta.limit ?? 20,
            total: a.payload.meta.total ?? 0,
            totalPages: a.payload.meta.pages ?? a.payload.meta.totalPages ?? 0,
          };
        }
      })
      .addCase(searchHotelsThunk.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload as string;
      })

      .addCase(fetchRecommendationsThunk.fulfilled, (s, a) => {
        s.recommendations = a.payload;
      })
      .addCase(fetchDestinationsThunk.fulfilled, (s, a) => {
        s.destinations = a.payload;
      })
      .addCase(fetchPendingHotelsThunk.fulfilled, (s, a) => {
        s.pendingHotels = a.payload;
      })
      .addCase(fetchMyHotelsThunk.fulfilled, (s, a) => {
        s.myHotels = a.payload;
      })

      .addCase(createHotelThunk.fulfilled, (s, a) => {
        s.myHotels.unshift(a.payload);
      })
      .addCase(updateHotelThunk.fulfilled, (s, a) => {
        const idx = s.myHotels.findIndex((h) => h.id === a.payload.id);
        if (idx >= 0) s.myHotels[idx] = a.payload;
        if (s.currentHotel?.id === a.payload.id) s.currentHotel = a.payload;
      })
      .addCase(deleteHotelThunk.fulfilled, (s, a) => {
        s.myHotels = s.myHotels.filter((h) => h.id !== a.payload);
        s.hotels = s.hotels.filter((h) => h.id !== a.payload);
        s.pendingHotels = s.pendingHotels.filter((h) => h.id !== a.payload);
      })
      .addCase(updateHotelStatusThunk.fulfilled, (s, a) => {
        s.pendingHotels = s.pendingHotels.filter((h) => h.id !== a.payload.id);
        const idx = s.hotels.findIndex((h) => h.id === a.payload.id);
        if (idx >= 0) s.hotels[idx] = a.payload;
      })

      .addCase(fetchWishlistThunk.fulfilled, (s, a) => {
        s.wishlist = a.payload;
      })
      .addCase(toggleWishlistThunk.fulfilled, (s, a) => {
        if (a.payload.action === 'remove') {
          s.wishlist = s.wishlist.filter((h) => h.id !== a.payload.hotelId);
        }
      });
  },
});

export const { clearCurrentHotel, clearSearchResults } = hotelSlice.actions;
export const selectHotel = (state: { hotel: HotelState }) => state.hotel;
export default hotelSlice.reducer;
