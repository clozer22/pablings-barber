import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface BookingState {
  selectedServiceId: string | null;
  selectedDate: string | null;
  selectedTime: string | null;
  paymentType: 'downpayment' | 'full' | null;
  amountToPay: number;
  isBooked: boolean;
}

const initialState: BookingState = {
  selectedServiceId: null,
  selectedDate: null,
  selectedTime: null,
  paymentType: null,
  amountToPay: 0,
  isBooked: false,
};

export const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    selectService: (state, action: PayloadAction<{ id: string; price: number }>) => {
      state.selectedServiceId = action.payload.id;
      state.isBooked = false;
    },
    selectDateTime: (state, action: PayloadAction<{ date: string; time: string }>) => {
      state.selectedDate = action.payload.date;
      state.selectedTime = action.payload.time;
    },
    setPaymentType: (state, action: PayloadAction<{ type: 'downpayment' | 'full'; amount: number }>) => {
      state.paymentType = action.payload.type;
      state.amountToPay = action.payload.amount;
    },
    completeBooking: (state) => {
      state.isBooked = true;
    },
    resetBooking: () => initialState,
  },
});

export const { selectService, selectDateTime, setPaymentType, completeBooking, resetBooking } = bookingSlice.actions;
export default bookingSlice.reducer;
