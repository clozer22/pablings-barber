import { createSlice } from '@reduxjs/toolkit';

export interface Service {
  id: string;
  name: string;
  category: 'services' | 'creative' | 'packages' | 'addons';
  description: string;
  price: number;
  duration: number;
  icon: string; // Icon name from lucide-react
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string; // Icon name from lucide-react
}

interface ServicesState {
  items: Service[];
  products: Product[];
}

const initialState: ServicesState = {
  items: [
    // Standard Services
    {
      id: 's1',
      name: 'Tabas Pablings (Regular Haircut)',
      category: 'services',
      description: 'A traditional clean cut tailored to your style. Includes simple wash and dry.',
      price: 299,
      duration: 30,
      icon: 'Scissors',
    },
    {
      id: 's2',
      name: "Women's Cut",
      category: 'services',
      description: 'Expert styling and haircutting for women. Includes shampoo and blow-dry.',
      price: 399,
      duration: 45,
      icon: 'User',
    },
    {
      id: 's3',
      name: 'Pablings Espesyal (Haircut & Shampoo)',
      category: 'services',
      description: 'Classic Pablings cut combined with refreshing scalp massage and shampoo wash.',
      price: 399,
      duration: 40,
      icon: 'ShowerHead',
    },
    {
      id: 's4',
      name: 'Ginoong Pabian #1 (Haircut & Shave)',
      category: 'services',
      description: 'Complete grooming combo featuring our signature haircut and standard shave.',
      price: 499,
      duration: 50,
      icon: 'Sparkles',
    },
    {
      id: 's5',
      name: 'Ginoong Pabian #2 (Haircut & Massage)',
      category: 'services',
      description: 'Relaxing combo of signature haircut with a refreshing 15-min half body massage.',
      price: 549,
      duration: 50,
      icon: 'Smile',
    },
    {
      id: 's6',
      name: 'Pablito Gwapito (Haircut & Charcoal)',
      category: 'services',
      description: 'Premium haircut paired with a deep-cleansing black charcoal facial mask.',
      price: 699,
      duration: 60,
      icon: 'Gem',
    },
    // Creative Cuts
    {
      id: 'c1',
      name: 'Curtain Cut',
      category: 'creative',
      description: 'Trendy middle-part or side-part curtains tailored for modern aesthetic hair flows.',
      price: 399,
      duration: 40,
      icon: 'Scissors',
    },
    {
      id: 'c2',
      name: 'Wolf Cut',
      category: 'creative',
      description: 'Textured layered cut blending shags and mullets for a messy, stylish volume.',
      price: 399,
      duration: 45,
      icon: 'Scissors',
    },
    {
      id: 'c3',
      name: 'Pompadour / Longtrim',
      category: 'creative',
      description: 'Classic high-volume pompadour look or styled long trim for gentlemen.',
      price: 399,
      duration: 40,
      icon: 'Scissors',
    },
    {
      id: 'c4',
      name: 'Edgar Cut',
      category: 'creative',
      description: 'Sharp straight-line forehead fringe fade popular in modern street style.',
      price: 399,
      duration: 35,
      icon: 'Scissors',
    },
    {
      id: 'c5',
      name: 'Mullet',
      category: 'creative',
      description: 'Business in the front, party in the back. Classic mullet with sharp side fades.',
      price: 399,
      duration: 40,
      icon: 'Scissors',
    },
    // General Pablo Services
    {
      id: 'p1',
      name: '#1 General Pablo Premium',
      category: 'packages',
      description: 'Ultimate transformation package: Haircut, shampoo, and basic hair dye/color cover.',
      price: 1349,
      duration: 90,
      icon: 'Crown',
    },
    {
      id: 'p2',
      name: '#2 General Pablo Premium',
      category: 'packages',
      description: 'Relaxation package: Haircut, shampoo, premium hair treatment, and half body massage.',
      price: 1349,
      duration: 85,
      icon: 'Crown',
    },
    {
      id: 'p3',
      name: '#3 General Pablo Premium',
      category: 'packages',
      description: 'Full pamper package: Haircut, shampoo, shave, charcoal mask, and half body massage.',
      price: 1349,
      duration: 100,
      icon: 'Crown',
    },
    // Add-Ons & Nails
    {
      id: 'a1',
      name: 'Beard Sculpt / Shave',
      category: 'addons',
      description: 'Expert beard shaping and shaving using premium straight razors and oils.',
      price: 349,
      duration: 25,
      icon: 'UserRound',
    },
    {
      id: 'a2',
      name: 'Charcoal Mask Facial',
      category: 'addons',
      description: 'Deep pore cleansing and blackhead removal using a peel-off charcoal mask.',
      price: 549,
      duration: 20,
      icon: 'Sparkles',
    },
    {
      id: 'a3',
      name: 'Eyebrow Threading',
      category: 'addons',
      description: 'Clean eyebrow shaping using traditional hair-threading techniques.',
      price: 249,
      duration: 15,
      icon: 'Scissors',
    },
    {
      id: 'a4',
      name: 'Hand & Foot Nails Cleaning',
      category: 'addons',
      description: 'Full manicure and pedicure grooming package for clean, healthy nails.',
      price: 450,
      duration: 40,
      icon: 'Hand',
    },
    {
      id: 'a5',
      name: 'Foot Spa Package',
      category: 'addons',
      description: 'Relaxing foot scrub, hot towel wrap, combined with full manicure and pedicure.',
      price: 750,
      duration: 60,
      icon: 'Footprints',
    },
  ],
  products: [
    {
      id: 'pr1',
      name: 'Pablings Classic Pomades',
      description: 'Strong hold, high-shine water-based pomade. Perfect for classic pompadours.',
      price: 370,
      icon: 'Layers',
    },
    {
      id: 'pr2',
      name: 'Hair Grower (Minoxidil 5%)',
      description: 'Clinically proven hair regrowth treatment. Helps fill patches and strengthen roots.',
      price: 670,
      icon: 'Droplet',
    },
    {
      id: 'pr3',
      name: 'Booster Serum',
      description: 'Stimulating scalp serum that accelerates hair density and health.',
      price: 470,
      icon: 'Flame',
    },
    {
      id: 'pr4',
      name: 'Gugo Shampoo (Organic)',
      description: 'Traditional organic Gugo bark shampoo. Thickens hair and prevents hair fall.',
      price: 219,
      icon: 'Soap',
    },
    {
      id: 'pr5',
      name: 'Volumizing Cream',
      description: 'Lightweight styling cream for natural texture and flexible medium hold.',
      price: 450,
      icon: 'Smile',
    },
    {
      id: 'pr6',
      name: 'Sea Salt Spray',
      description: 'Adds instant volume, texture, and matte finish for casual, beachy styles.',
      price: 450,
      icon: 'Wind',
    },
    {
      id: 'pr7',
      name: 'Texture Powder',
      description: 'Gravity-defying matte dust for volume, texturizing, and high control hold.',
      price: 250,
      icon: 'Sparkles',
    },
  ],
};

export const servicesSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {},
});

export default servicesSlice.reducer;
