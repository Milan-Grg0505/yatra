import { createSlice } from '@reduxjs/toolkit';
import {
  fetchTravelPackagesThunk,
  fetchTravelPackageByIdThunk,
  fetchTravelDestinationsThunk,
  fetchTravelRecommendationsThunk,
  bookTravelThunk,
  fetchMyTravelBookingsThunk,
  createTravelPackageThunk,
  deleteTravelPackageThunk,
} from '../thunks/travelThunks';
import type { TravelPackage, TravelBooking } from '@/types';

interface TravelState {
  packages: TravelPackage[];
  currentPackage: TravelPackage | null;
  destinations: Array<{ _id: string; name: string; image?: string; count: number }>;
  recommendations: TravelPackage[];
  myBookings: TravelBooking[];
  currentBooking: TravelBooking | null;
  loading: boolean;
  error: string | null;
}

const initialState: TravelState = {
  packages: [],
  currentPackage: null,
  destinations: [],
  recommendations: [],
  myBookings: [],
  currentBooking: null,
  loading: false,
  error: null,
};

const travelSlice = createSlice({
  name: 'travel',
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchTravelPackagesThunk.pending, (s) => {
      s.loading = true;
    })
      .addCase(fetchTravelPackagesThunk.fulfilled, (s, a) => {
        s.loading = false;
        s.packages = a.payload;
      })
      .addCase(fetchTravelPackageByIdThunk.fulfilled, (s, a) => {
        s.currentPackage = a.payload;
      })
      .addCase(fetchTravelDestinationsThunk.fulfilled, (s, a) => {
        s.destinations = a.payload;
      })
      .addCase(fetchTravelRecommendationsThunk.fulfilled, (s, a) => {
        s.recommendations = a.payload;
      })
      .addCase(bookTravelThunk.fulfilled, (s, a) => {
        s.currentBooking = a.payload as TravelBooking;
        s.myBookings.unshift(a.payload as TravelBooking);
      })
      .addCase(fetchMyTravelBookingsThunk.fulfilled, (s, a) => {
        s.myBookings = a.payload;
      })
      .addCase(createTravelPackageThunk.fulfilled, (s, a) => {
        s.packages.unshift(a.payload as TravelPackage);
      })
      .addCase(deleteTravelPackageThunk.fulfilled, (s, a) => {
        s.packages = s.packages.filter((p) => p.id !== a.payload);
      });
  },
});

export const selectTravel = (state: { travel: TravelState }) => state.travel;
export default travelSlice.reducer;
