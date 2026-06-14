import { hotelApi, type HotelSearchParams } from "@/api/hotel.api";
import { userApi } from "@/api/user.api";
import type { Hotel, PaginationMeta } from "@/types";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const fetchHotelsThunk = createAsyncThunk(
  'hotel/fetchAll',
  async ({ page = 1, limit = 20 }: { page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      const res = await hotelApi.list(page, limit);
      return { hotels: res.data ?? [], meta: res.meta };
    } catch (err: any) {
      return rejectWithValue(err?.message ?? 'Failed to load hotels');
    }
  },
);

export const fetchHotelByIdThunk = createAsyncThunk(
  'hotel/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await hotelApi.getById(id);
      return res.data as Hotel;
    } catch (err: any) {
      return rejectWithValue(err?.message ?? 'Hotel not found');
    }
  },
);

export const searchHotelsThunk = createAsyncThunk(
  'hotel/search',
  async (params: HotelSearchParams, { rejectWithValue }) => {
    try {
      const res = await hotelApi.search(params)
      return { hotels: res.data ?? [], meta: res.meta as PaginationMeta | undefined }
    } catch (err: any) {
      return rejectWithValue(err?.message ?? 'Failed to load hotels');
    }
  }
);


export const fetchPendingHotelsThunk = createAsyncThunk(
  'hotel/fetchPending',
  async (_, { rejectWithValue }) => {
    try {
      const res = await hotelApi.pending()
      return res?.data ?? [];
    } catch (err: any) {
      return rejectWithValue(err?.message ?? 'Failed to load pending hotels');
    }
  }
);

export const fetchMyHotelsThunk = createAsyncThunk(
  'hotel/fetchMy',
  async (_, { rejectWithValue }) => {
    try {
      const res = await hotelApi.my()
      return res?.data ?? [];
    } catch (err: any) {
      return rejectWithValue(err?.message ?? 'Failed to load my hotels');
    }
  }
);


// ---------------------------------------------------------------------------
// Create / Update / Delete  /
// ---------------------------------------------------------------------------

export const createHotelThunk = createAsyncThunk(
  'hotel/create',
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const res = await hotelApi.create(formData)
      return res?.data as Hotel;
    } catch (err: any) {
      return rejectWithValue(err?.message ?? 'Failed to create hotel');
    }
  }
);

export const updateHotelThunk = createAsyncThunk(
  'hotel/update',
  async ({
    id,
    formData
  }: {
    id: string,
    formData: FormData
  },
    { rejectWithValue }) => {
    try {
      const res = await hotelApi.update(id, formData);
      return res?.data as Hotel;
    } catch (err: any) {
      return rejectWithValue(err?.message ?? 'Failed to update hotel');
    }
  }
);

export const deleteHotelThunk = createAsyncThunk(
  'hotel/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await hotelApi.delete(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err?.message ?? 'Failed to delete hotel');
    }
  }
);

export const updateHotelStatusThunk = createAsyncThunk(
  'hotel/updateStatus',
  async ({ id, status }: { id: string, status: 'approved' | 'pending' | 'rejected' }, { rejectWithValue }) => {
    try {
      const res = await hotelApi.updateStatus(id, status);
      return res?.data as Hotel;
    } catch (err: any) {
      return rejectWithValue(err?.message ?? 'Failed to update hotel status');
    }
  }
);


export const pricePredictThunk = createAsyncThunk(
  'hotel/pricePredict',
  async (data: { roomId: string, checkIn: string, checkOut: string }, { rejectWithValue }) => {
    try {
      const res = await hotelApi.pricePredict(data);
      return res?.data;
    } catch (err: any) {
      return rejectWithValue(err?.message ?? 'Failed to predict price');
    }
  }
);


export const fetchDestinationsThunk = createAsyncThunk(
  'hotel/fetchDestinations',
  async (_, { rejectWithValue }) => {
    try {
      const res = await hotelApi.destinations()
      return res?.data ?? [];
    } catch (err: any) {
      return rejectWithValue(err?.message ?? 'Failed to load destinations');
    }
  }
);

export const fetchRecommendationsThunk = createAsyncThunk(
  'hotel/fetchRecommendations',
  async (_, { rejectWithValue }) => {
    try {
      const res = await hotelApi.recommendations()
      return res?.data ?? [];
    } catch (err: any) {
      return rejectWithValue(err?.message ?? 'Failed to load recommendations');
    }
  }
);


/* ---- Wishlist (lives on user.api but managed in hotel slice for UI cohesion) ---- */
export const fetchWishlistThunk = createAsyncThunk('hotel/wishlist', async (_, { rejectWithValue }) => {
  try {
    const res = await userApi.getWishlist();
    return res.data ?? [];
  } catch (err: any) {
    return rejectWithValue(err?.message ?? 'Failed');
  }
});

export const toggleWishlistThunk = createAsyncThunk(
  'hotel/toggleWishlist',
  async ({ hotelId, action }: { hotelId: string; action: 'add' | 'remove' }, { rejectWithValue }) => {
    try {
      if (action === 'add') await userApi.addWishlist(hotelId);
      else await userApi.removeWishlist(hotelId);
      return { hotelId, action };
    } catch (err: any) {
      return rejectWithValue(err?.message ?? 'Failed');
    }
  },
);