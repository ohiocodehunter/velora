import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Cart } from '@/types';
import { cartService } from '@/services/cart.service';

interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: CartState = {
  cart: null,
  isLoading: false,
  error: null,
};

export const fetchCart = createAsyncThunk('cart/fetchCart', async (_, { rejectWithValue }) => {
  try {
    return await cartService.getCart();
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch cart');
  }
});

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async (
    payload: { productId: string; quantity: number; variant?: string },
    { rejectWithValue },
  ) => {
    try {
      return await cartService.addItem(payload);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to add item to cart');
    }
  },
);

export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async (payload: { itemId: string; quantity: number }, { rejectWithValue }) => {
    try {
      return await cartService.updateItem(payload.itemId, payload.quantity);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update item quantity');
    }
  },
);

export const removeCartItem = createAsyncThunk(
  'cart/removeCartItem',
  async (itemId: string, { rejectWithValue }) => {
    try {
      return await cartService.removeItem(itemId);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to remove item');
    }
  },
);

export const applyCartCoupon = createAsyncThunk(
  'cart/applyCoupon',
  async (code: string, { rejectWithValue }) => {
    try {
      return await cartService.applyCoupon(code);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Invalid coupon code');
    }
  },
);

export const removeCartCoupon = createAsyncThunk(
  'cart/removeCoupon',
  async (_, { rejectWithValue }) => {
    try {
      return await cartService.removeCoupon();
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to remove coupon');
    }
  },
);

export const clearEntireCart = createAsyncThunk(
  'cart/clearCart',
  async (_, { rejectWithValue }) => {
    try {
      return await cartService.clearCart();
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to clear cart');
    }
  },
);

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    resetCart: (state) => {
      state.cart = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.cart = action.payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.cart = action.payload;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.cart = action.payload;
      })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        state.cart = action.payload;
      })
      .addCase(applyCartCoupon.fulfilled, (state, action) => {
        state.cart = action.payload;
      })
      .addCase(removeCartCoupon.fulfilled, (state, action) => {
        state.cart = action.payload;
      })
      .addCase(clearEntireCart.fulfilled, (state, action) => {
        state.cart = action.payload;
      });
  },
});

export const { resetCart } = cartSlice.actions;
export default cartSlice.reducer;
