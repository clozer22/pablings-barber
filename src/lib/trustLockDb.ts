// Client-side mock database using localStorage to simulate Supabase real-time updates

export interface DbTransaction {
  id: string;
  customerName: string;
  username: string; // bound to user account
  selectedServices: {
    id: string;
    name: string;
    price: number;
  }[];
  assignedBarber: string | null;
  assignedSeat: string | null;
  startTime: string | null;
  endTime: string | null;
  status: 'DRAFT' | 'IN_CHAIR' | 'CHECKOUT' | 'PAID' | 'VOIDED';
  loyaltyPointsEarned: number;
  redeemedPoints: boolean; // Flag if user paid with 200 points
  userRedeemedPoints?: boolean; // Flag if customer opted for points reward check-in
  date: string;
  time: string;
}

export interface DbUser {
  fullName: string;
  phone: string;
  username: string;
  password?: string;
  points: number;
}

// Initial mock users
const DEFAULT_USERS: DbUser[] = [
  { fullName: 'John Doe', phone: '09171111111', username: 'johndoe', password: 'password', points: 110 },
  { fullName: 'Jane Smith', phone: '09172222222', username: 'janesmith', password: 'password', points: 45 },
  { fullName: 'Bob Johnson', phone: '09173333333', username: 'bjohnson', password: 'password', points: 0 },
  { fullName: 'Alice Cooper', phone: '09174444444', username: 'acooper', password: 'password', points: 215 } // starts with 215 points so they can immediately test redemption!
];

// Initial mock data using real menu prices
const DEFAULT_TRANSACTIONS: DbTransaction[] = [
  {
    id: 'TR-1001',
    customerName: 'John Doe',
    username: 'johndoe',
    selectedServices: [
      { id: 's1', name: 'Tabas Pablings (Regular Haircut)', price: 299 },
      { id: 'a1', name: 'Beard Sculpt / Shave', price: 349 }
    ],
    assignedBarber: 'Barber Mark',
    assignedSeat: 'Seat 1',
    startTime: '2026-06-19T14:00:00Z',
    endTime: '2026-06-19T14:45:00Z',
    status: 'PAID',
    loyaltyPointsEarned: 64,
    redeemedPoints: false,
    date: '2026-06-19',
    time: '14:00'
  },
  {
    id: 'TR-1002',
    customerName: 'Jane Smith',
    username: 'janesmith',
    selectedServices: [
      { id: 's2', name: "Women's Cut", price: 399 }
    ],
    assignedBarber: 'Barber Alex',
    assignedSeat: 'Seat 2',
    startTime: '2026-06-19T15:30:00Z',
    endTime: '2026-06-19T16:15:00Z',
    status: 'PAID',
    loyaltyPointsEarned: 39,
    redeemedPoints: false,
    date: '2026-06-19',
    time: '15:30'
  },
  {
    id: 'TR-1003',
    customerName: 'Bob Johnson',
    username: 'bjohnson',
    selectedServices: [
      { id: 'p2', name: '#2 General Pablo Premium', price: 1349 }
    ],
    assignedBarber: 'Barber John',
    assignedSeat: 'Seat 3',
    startTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 mins ago
    endTime: null,
    status: 'IN_CHAIR',
    loyaltyPointsEarned: 0,
    redeemedPoints: false,
    date: '2026-06-19',
    time: '18:30'
  },
  {
    id: 'TR-1004',
    customerName: 'Alice Cooper',
    username: 'acooper',
    selectedServices: [
      { id: 's3', name: 'Pablings Espesyal (Haircut & Shampoo)', price: 399 }
    ],
    assignedBarber: 'Barber Mark',
    assignedSeat: 'Seat 1',
    startTime: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    status: 'CHECKOUT',
    loyaltyPointsEarned: 0,
    redeemedPoints: false,
    date: '2026-06-19',
    time: '18:10'
  }
];

const STORAGE_KEY = 'pablings_trustlock_transactions';
const USERS_STORAGE_KEY = 'pablings_trustlock_users';

const isClient = typeof window !== 'undefined';

// --- Transactions functions ---
export function getTransactions(): DbTransaction[] {
  if (!isClient) return DEFAULT_TRANSACTIONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_TRANSACTIONS));
      return DEFAULT_TRANSACTIONS;
    }
    return JSON.parse(raw);
  } catch (error) {
    console.error('Error reading localStorage transactions', error);
    return DEFAULT_TRANSACTIONS;
  }
}

export function saveTransactions(transactions: DbTransaction[]) {
  if (!isClient) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    window.dispatchEvent(new Event('storage'));
  } catch (error) {
    console.error('Error saving localStorage transactions', error);
  }
}

export function addTransaction(tx: Omit<DbTransaction, 'id' | 'date' | 'time' | 'startTime' | 'endTime' | 'assignedBarber' | 'assignedSeat' | 'loyaltyPointsEarned' | 'redeemedPoints'> & { redeemedPoints?: boolean }): DbTransaction {
  const transactions = getTransactions();
  const nextId = `TR-${1001 + transactions.length}`;
  const now = new Date();
  
  const newTx: DbTransaction = {
    ...tx,
    id: nextId,
    assignedBarber: null,
    assignedSeat: null,
    startTime: null,
    endTime: null,
    loyaltyPointsEarned: 0,
    redeemedPoints: tx.redeemedPoints || false,
    userRedeemedPoints: tx.redeemedPoints || false,
    date: now.toISOString().split('T')[0],
    time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
  };

  transactions.push(newTx);
  saveTransactions(transactions);
  return newTx;
}

export function updateTransaction(id: string, updates: Partial<DbTransaction>): DbTransaction | null {
  const transactions = getTransactions();
  let updatedTx: DbTransaction | null = null;

  const nextTransactions = transactions.map(tx => {
    if (tx.id === id) {
      updatedTx = { ...tx, ...updates };
      
      // Auto-credit loyalty points to the customer when session is marked PAID
      if (updates.status === 'PAID' && tx.status !== 'PAID') {
        const isRedeemed = updates.redeemedPoints !== undefined ? updates.redeemedPoints : tx.redeemedPoints;
        
        let price = 0;
        if (isRedeemed) {
          // If points are redeemed, the first selected service (always the haircut/package) is free (₱0)
          // We only calculate points on the remaining paid services (add-ons)
          const paidServices = tx.selectedServices.slice(1);
          price = paidServices.reduce((sum, s) => sum + s.price, 0);
          
          // Deduct 200 points from user
          incrementUserPoints(tx.username, -200);
        } else {
          price = tx.selectedServices.reduce((sum, s) => sum + s.price, 0);
        }
        
        const pointsEarned = Math.round(price * 0.1);
        updatedTx.loyaltyPointsEarned = pointsEarned;
        
        // Add points to user account (for the paid portion)
        incrementUserPoints(tx.username, pointsEarned);
      }
      
      return updatedTx;
    }
    return tx;
  });

  if (updatedTx) {
    saveTransactions(nextTransactions);
  }
  return updatedTx;
}

export function getActiveUserTransaction(username: string): DbTransaction | null {
  const transactions = getTransactions();
  const userTxs = transactions.filter(tx => tx.username === username);
  if (userTxs.length === 0) return null;
  const activeTx = userTxs.find(tx => tx.status !== 'PAID' && tx.status !== 'VOIDED');
  if (activeTx) return activeTx;
  return userTxs[userTxs.length - 1]; // fallback to last completed
}

// --- Users functions ---
export function getUsers(): DbUser[] {
  if (!isClient) return DEFAULT_USERS;
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    return JSON.parse(raw);
  } catch (error) {
    console.error('Error reading localStorage users', error);
    return DEFAULT_USERS;
  }
}

export function saveUsers(users: DbUser[]) {
  if (!isClient) return;
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    window.dispatchEvent(new Event('storage'));
  } catch (error) {
    console.error('Error saving localStorage users', error);
  }
}

export function getUser(username: string): DbUser | null {
  const users = getUsers();
  return users.find(u => u.username === username) || null;
}

export function registerUser(user: DbUser): DbUser | null {
  const users = getUsers();
  if (users.some(u => u.username === user.username)) {
    return null; // Username already taken
  }
  users.push(user);
  saveUsers(users);
  return user;
}

export function incrementUserPoints(username: string, points: number) {
  const users = getUsers();
  const updatedUsers = users.map(u => {
    if (u.username === username) {
      return { ...u, points: Math.max(0, u.points + points) };
    }
    return u;
  });
  saveUsers(updatedUsers);
}

// Clean databases
export function resetDatabase() {
  if (!isClient) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_TRANSACTIONS));
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
  window.dispatchEvent(new Event('storage'));
}
