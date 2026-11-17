import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Product } from '@/types';
import { wishlistService } from '@/services/wishlist.service';

interface WishlistState {
  items: Product[];
  productIds: string[];
  isLoading: boolean;
  error: string | null;
}

const initialState: WishlistState = {
  items: [],
  productIds: [],
  isLoading: false,
  error: null,
};

export const fetchWishlist = createAsyncThunk(
  'wishlist/fetchWishlist',
  async (_, { rejectWithValue }) => {
    try {
      const items = await wishlistService.getWishlist();
      return items;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load wishlist');
    }
  },
);

export const toggleWishlistItem = createAsyncThunk(
  'wishlist/toggleWishlistItem',
  async (productId: string, { rejectWithValue }) => {
    try {
      const data = await wishlistService.toggleWishlist(productId);
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update wishlist');
    }
  },
);

export const removeWishlistItem = createAsyncThunk(
  'wishlist/removeWishlistItem',
  async (productId: string, { rejectWithValue }) => {
    try {
      await wishlistService.removeFromWishlist(productId);
      return productId;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to remove from wishlist');
    }
  },
);

export const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.items = action.payload;
        state.productIds = action.payload.map((p) => p._id);
        state.isLoading = false;
        state.error = null;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(toggleWishlistItem.fulfilled, (state, action) => {
        state.items = action.payload.products;
        state.productIds = action.payload.products.map((p) => p._id);
      })
      .addCase(removeWishlistItem.fulfilled, (state, action) => {
        state.items = state.items.filter((p) => p._id !== action.payload);
        state.productIds = state.productIds.filter((id) => id !== action.payload);
      });
  },
});

export default wishlistSlice.reducer;
