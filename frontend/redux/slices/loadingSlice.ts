// src/redux/loadingSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const loadingSlice = createSlice({
  name: 'loading',
  initialState: {
    isLoading: false,
  },
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setLoading } = loadingSlice.actions;
export default loadingSlice.reducer;
