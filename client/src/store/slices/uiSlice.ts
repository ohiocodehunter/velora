import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

interface UiState {
  toasts: Toast[];
  isMobileMenuOpen: boolean;
  isSearchModalOpen: boolean;
}

const initialState: UiState = {
  toasts: [],
  isMobileMenuOpen: false,
  isSearchModalOpen: false,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    addToast: (state, action: PayloadAction<Omit<Toast, 'id'> & { id?: string }>) => {
      const id = action.payload.id || Math.random().toString(36).substring(2, 9);
      state.toasts.push({
        ...action.payload,
        id,
        duration: action.payload.duration ?? 4000,
      });
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
    toggleMobileMenu: (state) => {
      state.isMobileMenuOpen = !state.isMobileMenuOpen;
    },
    setMobileMenuOpen: (state, action: PayloadAction<boolean>) => {
      state.isMobileMenuOpen = action.payload;
    },
    setSearchModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isSearchModalOpen = action.payload;
    },
  },
});

export const { addToast, removeToast, toggleMobileMenu, setMobileMenuOpen, setSearchModalOpen } =
  uiSlice.actions;

export default uiSlice.reducer;
