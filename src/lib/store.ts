import { configureStore } from '@reduxjs/toolkit';
import servicesReducer from './features/services/servicesSlice';
import bookingReducer from './features/booking/bookingSlice';
import userReducer from './features/user/userSlice';
import walkInReducer from './features/walkIn/walkInSlice';

export const makeStore = () => {
  return configureStore({
    reducer: {
      services: servicesReducer,
      booking: bookingReducer,
      user: userReducer,
      walkIn: walkInReducer,
    },
  });
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
