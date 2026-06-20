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
  status: 'DRAFT' | 'WAITING' | 'IN_CHAIR' | 'CHECKOUT' | 'PAID' | 'VOIDED';
  preferredBarber: string | null; // Selected preferred barber
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
    preferredBarber: 'Barber Mark',
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
    preferredBarber: 'Barber Alex',
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
    preferredBarber: 'Barber John',
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
    preferredBarber: 'Barber Mark',
    loyaltyPointsEarned: 0,
    redeemedPoints: false,
    date: '2026-06-19',
    time: '18:10'
  },
  {
    id: 'TR-1005',
    customerName: 'Jane Smith',
    username: 'janesmith',
    selectedServices: [
      { id: 's2', name: "Women's Cut", price: 399 },
      { id: 'a4', name: 'Shampoo & Blow Dry', price: 199 }
    ],
    assignedBarber: 'Barber Mark',
    assignedSeat: 'Seat 1',
    startTime: new Date().toISOString(),
    endTime: new Date().toISOString(),
    status: 'PAID',
    preferredBarber: 'Barber Mark',
    loyaltyPointsEarned: 60,
    redeemedPoints: false,
    date: new Date().toLocaleDateString('en-CA'),
    time: '12:30'
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
    const list = JSON.parse(raw) as DbTransaction[];
    // Auto-migrate: if the demo user hasn't got the new fake transaction TR-1005, append it!
    if (!list.some(t => t.id === 'TR-1005')) {
      const updated = [...list, ...DEFAULT_TRANSACTIONS.filter(d => d.id === 'TR-1005')];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    }
    return list;
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

export function addTransaction(tx: Omit<DbTransaction, 'id' | 'date' | 'time' | 'startTime' | 'endTime' | 'assignedBarber' | 'assignedSeat' | 'loyaltyPointsEarned' | 'redeemedPoints' | 'userRedeemedPoints'> & { redeemedPoints?: boolean }): DbTransaction {
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

export interface DbEmployee {
  id: string;
  name: string;
  username: string; // unique identifier (e.g. mark@barber)
  password?: string;
  specialty: string;
  status: 'Available' | 'Busy' | 'Off-Duty';
  branch: string;
  rating: number;
  avatarColor: string;
}

const DEFAULT_EMPLOYEES: DbEmployee[] = [
  { id: 'EMP-01', name: 'Barber Mark', username: 'mark@barber', password: 'password', specialty: 'Classic Cuts & Fades', status: 'Available', branch: 'Downtown Main', rating: 4.8, avatarColor: 'from-amber-500 to-amber-700' },
  { id: 'EMP-02', name: 'Barber Alex', username: 'alex@barber', password: 'password', specialty: 'Beard Grooming Specialist', status: 'Busy', branch: 'Uptown Lounge', rating: 4.9, avatarColor: 'from-blue-500 to-indigo-700' },
  { id: 'EMP-03', name: 'Barber John', username: 'john@barber', password: 'password', specialty: 'Hair Styling & Dyeing', status: 'Off-Duty', branch: 'Northside Hub', rating: 4.7, avatarColor: 'from-emerald-500 to-teal-700' }
];

const EMPLOYEES_STORAGE_KEY = 'pablings_trustlock_employees';

export function getEmployees(): DbEmployee[] {
  if (!isClient) return DEFAULT_EMPLOYEES;
  try {
    const raw = localStorage.getItem(EMPLOYEES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(EMPLOYEES_STORAGE_KEY, JSON.stringify(DEFAULT_EMPLOYEES));
      return DEFAULT_EMPLOYEES;
    }
    return JSON.parse(raw);
  } catch (error) {
    console.error('Error reading localStorage employees', error);
    return DEFAULT_EMPLOYEES;
  }
}

export function saveEmployees(employees: DbEmployee[]) {
  if (!isClient) return;
  try {
    localStorage.setItem(EMPLOYEES_STORAGE_KEY, JSON.stringify(employees));
    window.dispatchEvent(new Event('storage'));
  } catch (error) {
    console.error('Error saving localStorage employees', error);
  }
}

export function getEmployee(username: string): DbEmployee | null {
  const employees = getEmployees();
  return employees.find(e => e.username === username.toLowerCase()) || null;
}

export function addEmployee(emp: Omit<DbEmployee, 'id' | 'rating' | 'avatarColor'>): DbEmployee {
  const employees = getEmployees();
  const nextId = `EMP-0${employees.length + 1}`;
  
  const colors = [
    'from-amber-500 to-amber-700',
    'from-blue-500 to-indigo-700',
    'from-emerald-500 to-teal-700',
    'from-rose-500 to-pink-700',
    'from-purple-500 to-violet-700'
  ];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];

  const newEmp: DbEmployee = {
    ...emp,
    id: nextId,
    username: emp.username.toLowerCase(),
    password: emp.password || 'password',
    rating: 5.0,
    avatarColor: randomColor
  };

  employees.push(newEmp);
  saveEmployees(employees);
  return newEmp;
}

export function updateEmployee(id: string, updates: Partial<DbEmployee>): DbEmployee | null {
  const employees = getEmployees();
  let updatedEmp: DbEmployee | null = null;

  const nextEmployees = employees.map(emp => {
    if (emp.id === id) {
      updatedEmp = { ...emp, ...updates };
      return updatedEmp;
    }
    return emp;
  });

  if (updatedEmp) {
    saveEmployees(nextEmployees);
  }
  return updatedEmp;
}

// Clean databases
export function resetDatabase() {
  if (!isClient) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_TRANSACTIONS));
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
  localStorage.setItem(EMPLOYEES_STORAGE_KEY, JSON.stringify(DEFAULT_EMPLOYEES));
  window.dispatchEvent(new Event('storage'));
}
