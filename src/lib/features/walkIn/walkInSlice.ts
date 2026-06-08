import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type TransactionStatus = 'IDLE' | 'DRAFT' | 'IN_CHAIR' | 'CHECKOUT' | 'PAID';

interface WalkInState {
  status: TransactionStatus;
  customerName: string | null;
  selectedServices: {
    id: string;
    name: string;
    price: number;
  }[];
  assignedBarber: string | null;
  assignedSeat: string | null;
  startTime: string | null;
  endTime: string | null;
  loyaltyPointsEarned: number;
}

const initialState: WalkInState = {
  status: 'IDLE',
  customerName: null,
  selectedServices: [],
  assignedBarber: null,
  assignedSeat: null,
  startTime: null,
  endTime: null,
  loyaltyPointsEarned: 0,
};

export const walkInSlice = createSlice({
  name: 'walkIn',
  initialState,
  reducers: {
    startDraft: (state, action: PayloadAction<{ name: string; services: { id: string; name: string; price: number }[] }>) => {
      state.customerName = action.payload.name;
      state.selectedServices = action.payload.services;
      state.status = 'DRAFT';
    },
    assignStation: (state, action: PayloadAction<{ barber: string; seat: string }>) => {
      state.assignedBarber = action.payload.barber;
      state.assignedSeat = action.payload.seat;
      state.status = 'IN_CHAIR';
      state.startTime = new Date().toISOString();
    },
    readyForCheckout: (state) => {
      state.status = 'CHECKOUT';
      state.endTime = new Date().toISOString();
    },
    completePayment: (state) => {
      state.status = 'PAID';
      const totalPrice = state.selectedServices.reduce((sum, s) => sum + s.price, 0);
      state.loyaltyPointsEarned = totalPrice * 0.1; // 10% points
    },
    resetWalkIn: () => initialState,
  },
});

export const { startDraft, assignStation, readyForCheckout, completePayment, resetWalkIn } = walkInSlice.actions;
export default walkInSlice.reducer;
