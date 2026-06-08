import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}

interface UserState {
  profile: UserData | null;
  isRegistered: boolean;
}

const initialState: UserState = {
  profile: null,
  isRegistered: false,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    registerUser: (state, action: PayloadAction<UserData>) => {
      state.profile = action.payload;
      state.isRegistered = true;
    },
    clearUser: (state) => {
      state.profile = null;
      state.isRegistered = false;
    },
  },
});

export const { registerUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
