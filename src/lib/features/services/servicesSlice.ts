import { createSlice } from '@reduxjs/toolkit';

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  icon: string; // Icon name from lucide-react
}

interface ServicesState {
  items: Service[];
}

const initialState: ServicesState = {
  items: [
    {
      id: '1',
      name: 'Classic Haircut',
      description: 'A traditional cut that never goes out of style. Includes wash and style.',
      price: 25,
      duration: 30,
      icon: 'Scissors',
    },
    {
      id: '2',
      name: 'Beard Trim & Shape',
      description: 'Expert beard grooming and shaping to suit your face.',
      price: 15,
      duration: 20,
      icon: 'UserRound',
    },
    {
      id: '3',
      name: 'The Full Package',
      description: 'Premium haircut, beard trim, and a hot towel shave.',
      price: 50,
      duration: 60,
      icon: 'Crown',
    },
    {
      id: '4',
      name: 'Hot Towel Shave',
      description: 'Traditional straight-razor shave with soothing hot towels.',
      price: 30,
      duration: 40,
      icon: 'Flame',
    },
  ],
};

export const servicesSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {},
});

export default servicesSlice.reducer;
