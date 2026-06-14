import { travelApi } from "@/api/travel.api";
import type { TravelPackage } from "@/types";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const fetchTravelPackagesThunk = createAsyncThunk(
  '/travel/list',
  async (params: Record<string, unknown> | undefined, {
    rejectWithValue,
  }) => {
    try {
      const res = await travelApi.list(params);
      return res.data ?? [];
    } catch (err: any) {
      return rejectWithValue(err.response.data.message ?? 'Something went wrong')
    }
  }
)

export const fetchTravelPackageByIdThunk = createAsyncThunk(
  '/travel/view',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await travelApi.getById(id);
      return res.data as TravelPackage;
    } catch (err: any) {
      return rejectWithValue(err.response.data.message ?? 'Failed to fetch package');
    }
  }
)

export const fetchTravelDestinationsThunk = createAsyncThunk(
  '/travel/destinations',
  async (_, { rejectWithValue }) => {
    try {
      const res = await travelApi.destinations();
      return res.data ?? [];
    } catch (err: any) {
      const message = err?.response?.data?.message ?? err?.message ?? 'Failed to fetch destinations';
      return rejectWithValue(message);
    }
  }
)

export const fetchTravelRecommendationsThunk = createAsyncThunk(
  '/travel/recommendations',
  async (_, { rejectWithValue }) => {
    try {
      const res = await travelApi.recommendations();
      return res.data ?? [];
    } catch (err: any) {
      const message = err?.response?.data?.message ?? err?.message ?? 'Failed to fetch recommendations';
      return rejectWithValue(message);
    }
  }
)

export const bookTravelThunk = createAsyncThunk(
  '/travel/book',
  async (booking: any, { rejectWithValue }) => {
    try {
      const res = await travelApi.book(booking);
      return res.data;
    } catch (err: any) {
      const message = err?.response?.data?.message ?? err?.message ?? 'Failed to book travel';
      return rejectWithValue(message);
    }
  }
)


export const fetchMyTravelBookingsThunk = createAsyncThunk(
  '/travel/my-bookings',
  async (_, { rejectWithValue }) => {
    try {
      const res = await travelApi.myBookings();
      return res.data ?? [];
    } catch (err: any) {
      const message = err?.response?.data?.message ?? err?.message ?? 'Failed to fetch my travel bookings';
      return rejectWithValue(message);
    }
  }
)

export const createTravelPackageThunk = createAsyncThunk(
  '/travel/create',
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const res = await travelApi.create(formData);
      return res.data;
    } catch (err: any) {
      const message = err?.response?.data?.message ?? err?.message ?? 'Failed to create travel package';
      return rejectWithValue(message);
    }
  }
)


export const deleteTravelPackageThunk = createAsyncThunk(
  '/travel/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await travelApi.delete(id);
      return id;
    } catch (err: any) {
      const message = err?.response?.data?.message ?? err?.message ?? 'Failed to delete travel package';
      return rejectWithValue(message);
    }
  }
)

// export const updateTravelPackageThunk = createAsyncThunk(
//   '/travel/update',
//   async (formData: FormData, { rejectWithValue }) => {
//     try {
//       const res = await travelApi.update(formData);
//       return res.data;
//     } catch (err: any) {
//       const message = err?.response?.data?.message ?? err?.message ?? 'Failed to update travel package';
//       return rejectWithValue(message);
//     }
//   }
// )