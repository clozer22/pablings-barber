'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import { 
  QrCode, 
  ArrowRight, 
  Loader2, 
  Scissors, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  User, 
  Lock, 
  Phone, 
  Crown, 
  LogOut,
  Info,
  ChevronRight,
  ClipboardList,
  AlertCircle
} from 'lucide-react';
import { useAppSelector } from '@/lib/hooks';
import { 
  getUser, 
  registerUser, 
  getUsers, 
  addTransaction, 
  getActiveUserTransaction, 
  getTransactions, 
  DbUser, 
  DbTransaction 
} from '@/lib/trustLockDb';

export default function Profile() {
  const services = useAppSelector((state) => state.services.items);
  
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<DbUser | null>(null);
  
  // Login / Register state
  const [isLogin, setIsLogin] = useState(true);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [fullNameInput, setFullNameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Queue booking flow
  const [isBookingFlowActive, setIsBookingFlowActive] = useState(false);
  const [selectedServices, setSelectedServices] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<'services' | 'creative' | 'packages' | 'addons'>('services');
  const [redeemedPoints, setRedeemedPoints] = useState(false);
  const [mobileTab, setMobileTab] = useState<'queue' | 'history'>('queue');

  const showPointsToggle = useMemo(() => {
    const hasEnoughPoints = currentUser && currentUser.points >= 200;
    const hasEligibleService = selectedServices.some(s => s.category === 'services' || s.category === 'creative' || s.category === 'packages');
    return !!(hasEnoughPoints && hasEligibleService);
  }, [currentUser, selectedServices]);

  // Reset toggle if services change and it becomes unavailable
  useEffect(() => {
    if (!showPointsToggle) {
      setRedeemedPoints(false);
    }
  }, [showPointsToggle]);

  // Real-time active transaction & history
  const [activeTx, setActiveTx] = useState<DbTransaction | null>(null);
  const [userHistory, setUserHistory] = useState<DbTransaction[]>([]);

  // Initialize and check session
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const checkSession = () => {
      const loggedInUsername = localStorage.getItem('pablings_current_user');
      if (loggedInUsername) {
        const user = getUser(loggedInUsername);
        if (user) {
          setCurrentUser(user);
          // Load active transactions & history
          const active = getActiveUserTransaction(loggedInUsername);
          setActiveTx(active);
          
          const history = getTransactions().filter(t => t.username === loggedInUsername && (t.status === 'PAID' || t.status === 'VOIDED'));
          setUserHistory(history);
        } else {
          localStorage.removeItem('pablings_current_user');
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
    };

    checkSession();

    // Listen for storage events (updates from staff payout confirming payment)
    const handleStorage = () => {
      checkSession();
    };
    window.addEventListener('storage', handleStorage);
    
    // Poll the db every 1s for real-time queue transitions
    const interval = setInterval(checkSession, 1000);

    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, [isLogin]);

  // Auth: Handle registration
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!fullNameInput || !phoneInput || !usernameInput || !passwordInput) {
      setAuthError('Please fill in all fields.');
      return;
    }
    
    setLoading(true);
    setTimeout(() => {
      const result = registerUser({
        fullName: fullNameInput,
        phone: phoneInput,
        username: usernameInput,
        password: passwordInput,
        points: 0
      });

      setLoading(false);
      if (result) {
        localStorage.setItem('pablings_current_user', result.username);
        window.dispatchEvent(new Event('storage'));
      } else {
        setAuthError('Username is already taken.');
      }
    }, 1000);
  };

  // Auth: Handle Sign In
  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!usernameInput || !passwordInput) {
      setAuthError('Please enter credentials.');
      return;
    }
    
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const user = getUser(usernameInput);
      if (user && user.password === passwordInput) {
        localStorage.setItem('pablings_current_user', user.username);
        window.dispatchEvent(new Event('storage'));
      } else {
        setAuthError('Invalid username or password.');
      }
    }, 800);
  };

  // Auth: Log Out
  const handleLogout = () => {
    localStorage.removeItem('pablings_current_user');
    setCurrentUser(null);
    setActiveTx(null);
    setUserHistory([]);
    setIsBookingFlowActive(false);
    setSelectedServices([]);
    setUsernameInput('');
    setPasswordInput('');
    window.dispatchEvent(new Event('storage'));
  };

  // Booking: toggle services select
  const toggleService = (service: any) => {
    if (selectedServices.find(s => s.id === service.id)) {
      setSelectedServices(selectedServices.filter(s => s.id !== service.id));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  };

  // Booking: generate Check-In QR
  const sortedSelectedServices = useMemo(() => {
    return [...selectedServices].sort((a, b) => {
      const pA = a.category === 'services' || a.category === 'creative' ? 1 : a.category === 'packages' ? 2 : 3;
      const pB = b.category === 'services' || b.category === 'creative' ? 1 : b.category === 'packages' ? 2 : 3;
      return pA - pB;
    });
  }, [selectedServices]);

  const handleGenerateQR = () => {
    if (!currentUser) return;
    
    const createdTx = addTransaction({
      customerName: currentUser.fullName,
      username: currentUser.username,
      selectedServices: sortedSelectedServices.map(s => ({
        id: s.id,
        name: s.name,
        price: s.price
      })),
      status: 'DRAFT',
      redeemedPoints: redeemedPoints && showPointsToggle
    });

    setActiveTx(createdTx);
    setSelectedServices([]);
    setIsBookingFlowActive(false);
    setRedeemedPoints(false);
  };

  // Calculations for loyalty milestone
  const pointsPercentage = useMemo(() => {
    if (!currentUser) return 0;
    const milestone = 200;
    return Math.min((currentUser.points / milestone) * 100, 100);
  }, [currentUser]);

  const categorizedItems = services.filter(s => s.category === activeCategory);
  
  const totalPrice = useMemo(() => {
    if (redeemedPoints && showPointsToggle) {
      return sortedSelectedServices.reduce((sum, s, idx) => {
        if (idx === 0) return sum; // first item is free
        return sum + s.price;
      }, 0);
    }
    return selectedServices.reduce((sum, s) => sum + s.price, 0);
  }, [selectedServices, sortedSelectedServices, redeemedPoints, showPointsToggle]);

  // SVG parameters for circular points progress ring
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (pointsPercentage / 100) * circumference;

  return (
    <main className="min-h-screen pt-20 sm:pt-24 px-4 sm:px-6 pb-8 sm:pb-12 bg-zinc-950 text-zinc-100 flex flex-col items-center relative overflow-hidden">
      <Navbar />

      {/* Background Decor */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/5 via-zinc-950/0 to-zinc-950/0 pointer-events-none -z-10" />

      <div className="w-full max-w-4xl relative z-10 flex flex-col gap-8">
        
        <AnimatePresence mode="wait">
          {!currentUser ? (
            
            // AUTHENTICATION CARDS (LOGGED OUT)
            <motion.div
              key={isLogin ? 'login-card' : 'register-card'}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-md w-full mx-auto glass p-8 rounded-[2rem] border border-zinc-800 shadow-2xl mt-6"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl text-zinc-950">
                  <QrCode size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase text-white tracking-tight">
                    {isLogin ? 'Client Portal Sign In' : 'Create Account'}
                  </h2>
                  <p className="text-amber-500 text-[10px] font-bold uppercase tracking-widest">
                    Pablings Trust-Lock Digital Gateway
                  </p>
                </div>
              </div>

              {authError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs flex items-center gap-2 mb-4">
                  <AlertCircle size={14} />
                  <span>{authError}</span>
                </div>
              )}

              {isLogin ? (
                // Sign In Form
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Username</label>
                    <div className="relative">
                      <User size={16} className="text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input required type="text" className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-11 pr-4 py-2.5 text-sm text-zinc-200 outline-none focus:border-amber-500/50" placeholder="juan_dc" value={usernameInput} onChange={(e) => setUsernameInput(e.target.value.toLowerCase())} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Password</label>
                    <div className="relative">
                      <Lock size={16} className="text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input required type="password" className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-11 pr-4 py-2.5 text-sm text-zinc-200 outline-none focus:border-amber-500/50" placeholder="••••••••" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} />
                    </div>
                  </div>

                  <button disabled={loading} className="w-full py-3.5 bg-amber-500 text-zinc-950 font-black rounded-xl flex items-center justify-center gap-2 hover:bg-amber-400 transition-colors disabled:opacity-50 mt-6 text-xs uppercase tracking-wider">
                    {loading ? <Loader2 className="animate-spin" size={16} /> : <>Sign In <ArrowRight size={14} /></>}
                  </button>

                  <div className="text-center mt-6">
                    <button type="button" onClick={() => { setIsLogin(false); setAuthError(''); }} className="text-xs text-zinc-500 hover:text-amber-500 font-medium">
                      First time walk-in? Register profile here
                    </button>
                  </div>
                </form>
              ) : (
                // Register Form
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Full Name</label>
                    <div className="relative">
                      <User size={16} className="text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input required type="text" className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-11 pr-4 py-2.5 text-sm text-zinc-200 outline-none focus:border-amber-500/50" placeholder="Juan Dela Cruz" value={fullNameInput} onChange={(e) => setFullNameInput(e.target.value)} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Mobile Number</label>
                    <div className="relative">
                      <Phone size={16} className="text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input required type="tel" className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-11 pr-4 py-2.5 text-sm text-zinc-200 outline-none focus:border-amber-500/50" placeholder="0917XXXXXXX" value={phoneInput} onChange={(e) => setPhoneInput(e.target.value)} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Username</label>
                      <input required type="text" className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-200 outline-none focus:border-amber-500/50" placeholder="juan_dc" value={usernameInput} onChange={(e) => setUsernameInput(e.target.value.toLowerCase())} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Password</label>
                      <input required type="password" className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-200 outline-none focus:border-amber-500/50" placeholder="••••••••" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} />
                    </div>
                  </div>

                  <button disabled={loading} className="w-full py-3.5 bg-zinc-100 text-zinc-950 font-black rounded-xl flex items-center justify-center gap-2 hover:bg-white transition-colors disabled:opacity-50 mt-6 text-xs uppercase tracking-wider">
                    {loading ? <Loader2 className="animate-spin" size={16} /> : <>Register Account <ArrowRight size={14} /></>}
                  </button>

                  <div className="text-center mt-6">
                    <button type="button" onClick={() => { setIsLogin(true); setAuthError(''); }} className="text-xs text-zinc-500 hover:text-amber-500 font-medium">
                      Already have an account? Sign in
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          ) : (
            // PROFILE DASHBOARD (LOGGED IN)
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col gap-6"
            >
              {/* Mobile Tab Toggle */}
              <div className="flex lg:hidden bg-zinc-900/80 p-1 rounded-2xl border border-zinc-800/80 w-full shrink-0">
                <button
                  onClick={() => setMobileTab('queue')}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider text-center transition-all ${
                    mobileTab === 'queue'
                      ? 'bg-amber-500 text-zinc-950 font-black shadow-lg shadow-amber-500/10'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Queue & Booking
                </button>
                <button
                  onClick={() => setMobileTab('history')}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider text-center transition-all ${
                    mobileTab === 'history'
                      ? 'bg-amber-500 text-zinc-950 font-black shadow-lg shadow-amber-500/10'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Visit History ({userHistory.length})
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                
                {/* LEFT & CENTER BLOCKS: USER CARD & BOOKING */}
                <div className={`lg:col-span-2 flex flex-col gap-6 ${mobileTab === 'queue' ? 'flex' : 'hidden lg:flex'}`}>
                  
                  {/* Profile Card & Loyalty Points */}
                  <div className="glass p-5 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-zinc-800 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6">
                    
                    {/* User info */}
                    <div className="space-y-4 text-center sm:text-left">
                      <div className="flex items-center gap-3 justify-center sm:justify-start">
                        <div className="w-12 h-12 bg-amber-500 text-zinc-950 rounded-2xl flex items-center justify-center font-black text-xl">
                          {currentUser.fullName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h2 className="text-xl font-black text-white tracking-tight uppercase leading-none">
                            {currentUser.fullName}
                          </h2>
                          <span className="text-[10px] text-zinc-500 font-mono">@{currentUser.username}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-1 text-xs">
                        <p className="text-zinc-400">Mobile: <span className="text-zinc-200 font-semibold">{currentUser.phone}</span></p>
                        <p className="text-zinc-500 flex items-center gap-1.5 justify-center sm:justify-start">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Audit Ledger Verified
                        </p>
                      </div>

                      <button 
                        onClick={handleLogout}
                        className="px-4 py-2 bg-zinc-900 border border-zinc-800 hover:border-rose-950 text-zinc-400 hover:text-rose-400 transition-all rounded-xl text-[10px] uppercase font-bold flex items-center gap-1.5 mx-auto sm:mx-0"
                      >
                        <LogOut size={12} />
                        Sign Out
                      </button>
                    </div>

                    {/* Circular Points Progress Ring */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 bg-zinc-900/40 p-4 sm:p-5 rounded-3xl border border-zinc-800/40 w-full sm:w-auto text-center sm:text-left shrink-0">
                      <div className="relative w-28 h-28 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle
                            cx="56"
                            cy="56"
                            r={radius}
                            className="text-zinc-800"
                            strokeWidth="8"
                            stroke="currentColor"
                            fill="transparent"
                          />
                          <motion.circle
                            cx="56"
                            cy="56"
                            r={radius}
                            className="text-amber-500"
                            strokeWidth="8"
                            strokeDasharray={circumference}
                            animate={{ strokeDashoffset }}
                            transition={{ duration: 0.8 }}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                          />
                        </svg>
                        <div className="absolute text-center">
                          <span className="text-xl font-black text-white font-mono">{currentUser.points}</span>
                          <span className="text-[8px] font-bold text-zinc-500 uppercase block tracking-wider mt-0.5">PTS</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Milestone Goal</p>
                        <h4 className="text-sm font-black text-white font-mono">{currentUser.points} / 200 PTS</h4>
                        <p className="text-[9px] text-zinc-500 max-w-[120px] sm:max-w-[140px] leading-snug mx-auto sm:mx-0">
                          Earn 200 PTS to claim a **FREE Haircut** reward!
                        </p>
                      </div>
                    </div>

                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
                  </div>

                {currentUser.points >= 200 && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass px-5 py-4 rounded-[1.5rem] border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between bg-gradient-to-r from-amber-500/10 via-yellow-600/5 to-amber-500/10 text-amber-400 gap-4 shadow-lg shadow-amber-500/5"
                  >
                    <div className="flex items-center gap-3 text-center sm:text-left">
                      <div className="p-2.5 bg-amber-500 text-zinc-950 rounded-xl shrink-0">
                        <Crown size={18} />
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-white">Free Haircut Available!</h4>
                        <p className="text-[10px] text-zinc-400">You have accumulated 200+ points. Redeem it on your next visit.</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black bg-amber-500/20 border border-amber-500/30 text-amber-300 px-3 py-1 rounded-xl uppercase font-mono tracking-wider shrink-0">
                      {currentUser.points} PTS READY
                    </span>
                  </motion.div>
                )}

                {/* Audit Campaign Notice */}
                <div className="glass px-5 py-3 rounded-2xl border border-amber-500/10 flex items-start gap-3 bg-amber-500/5">
                  <Info size={16} className="text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-zinc-400 leading-relaxed">
                    <span className="text-amber-500 font-bold uppercase">Auditor Campaign Slogan:</span>{" "}
                    Make sure to refresh this page at the counter after payment to verify your points. <strong>No points logged means your haircut is free!</strong>
                  </p>
                </div>

                {/* QUEUE TIMELINE & DETAILS OR BOOKING INLINE FORM */}
                <AnimatePresence mode="wait">
                  {activeTx && (activeTx.status === 'DRAFT' || activeTx.status === 'IN_CHAIR' || activeTx.status === 'CHECKOUT') ? (
                    
                    // LIVE QUEUE TRACKER
                    <motion.div
                      key="live-queue"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      className={`glass p-6 sm:p-8 rounded-[2.5rem] border relative overflow-hidden ${
                        activeTx.status === 'IN_CHAIR' ? 'border-blue-500/20' :
                        activeTx.status === 'CHECKOUT' ? 'border-emerald-500/20 bg-emerald-500/5 animate-pulse' :
                        'border-amber-500/20'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-6">
                        <span className={`w-2 h-2 rounded-full ${
                          activeTx.status === 'IN_CHAIR' ? 'bg-blue-400 animate-pulse' :
                          activeTx.status === 'CHECKOUT' ? 'bg-emerald-400 animate-pulse' :
                          'bg-amber-400 animate-pulse'
                        }`} />
                        <h3 className="font-bold text-white text-sm uppercase tracking-wider">
                          {activeTx.status === 'DRAFT' && 'Queue Status: Pending Assignment'}
                          {activeTx.status === 'IN_CHAIR' && 'Queue Status: Active in Chair'}
                          {activeTx.status === 'CHECKOUT' && 'Queue Status: Checkout Settle'}
                        </h3>
                      </div>

                      {/* Display visit specific QR or active status screen */}
                      <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                        {activeTx.status === 'DRAFT' ? (
                          <>
                            <div className="bg-white p-4 rounded-2xl shrink-0">
                              <QrCode size={110} className="text-zinc-950" strokeWidth={1.5} />
                            </div>
                            <div className="space-y-3 flex-1 w-full">
                              <p className="text-xs text-zinc-400 leading-relaxed">
                                Present this **Check-In QR** token to the receptionist. They will scan this to assign your Barber and Chair.
                              </p>
                              <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl text-left">
                                <div className="flex justify-between items-center mb-1.5">
                                  <span className="text-[8px] font-bold text-zinc-500 uppercase block">Selections Locked</span>
                                  {activeTx.redeemedPoints && (
                                    <span className="text-[8px] font-black text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg uppercase tracking-wider">
                                      200 PTS REDEEMED
                                    </span>
                                  )}
                                </div>
                                <div className="space-y-1">
                                  {activeTx.selectedServices.map((s, idx) => {
                                    const isDiscounted = activeTx.redeemedPoints && idx === 0;
                                    return (
                                      <div key={s.id} className="flex justify-between text-xs font-semibold text-amber-500">
                                        <span>• {s.name} {isDiscounted && <span className="text-[8px] bg-amber-500/20 text-amber-300 px-1 py-0.25 rounded font-black uppercase tracking-wider ml-1">FREE</span>}</span>
                                        <span className="font-mono">
                                          {isDiscounted ? (
                                            <>
                                              <span className="line-through text-zinc-500 mr-1.5">₱{s.price}</span>
                                              <span>₱0</span>
                                            </>
                                          ) : (
                                            `₱${s.price}`
                                          )}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          </>
                        ) : activeTx.status === 'IN_CHAIR' ? (
                          <>
                            <div className="w-20 h-20 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center shrink-0">
                              <Scissors size={32} />
                            </div>
                            <div className="space-y-3 flex-1 w-full">
                              <p className="text-xs text-zinc-300">
                                You are currently seated at <strong className="text-white">{activeTx.assignedSeat}</strong> under Master Barber <strong className="text-white">{activeTx.assignedBarber}</strong>.
                              </p>
                              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl inline-flex items-center gap-2 mx-auto md:mx-0">
                                <Clock size={14} className="text-blue-400" />
                                <span className="text-xs font-mono font-bold text-blue-400">Duration: 00:15:32</span>
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center shrink-0 animate-bounce">
                              <CheckCircle2 size={32} />
                            </div>
                            <div className="space-y-3 flex-1 w-full">
                              <p className="text-xs text-zinc-200 font-bold">
                                Settle payment (₱{getTxTotalPrice(activeTx)}) at the front desk.
                              </p>
                              <p className="text-[10px] text-zinc-400 leading-relaxed">
                                Settle using cash or GCash. The receptionist will confirm and post your points. Refresh this page to check points update!
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </motion.div>
                  ) : (
                    
                    // BOOKING / SERVICE SELECTION AREA
                    <motion.div
                      key="booking-flow"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass p-6 sm:p-8 rounded-[2.5rem] border border-zinc-800 flex flex-col gap-6"
                    >
                      {!isBookingFlowActive ? (
                        <div className="py-6 text-center space-y-4">
                          <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 text-amber-500 rounded-2xl flex items-center justify-center mx-auto">
                            <Sparkles size={28} />
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-base uppercase">Book a Walk-In Visit</h3>
                            <p className="text-zinc-500 text-xs mt-1">Select services from our unalterable menu to generate your check-in queue ticket.</p>
                          </div>
                          <button
                            onClick={() => setIsBookingFlowActive(true)}
                            className="px-6 py-3 bg-amber-500 text-zinc-950 font-black rounded-xl hover:bg-amber-400 transition-colors uppercase tracking-wider text-xs inline-flex items-center gap-1.5"
                          >
                            Select Services & Check-In
                            <ChevronRight size={14} strokeWidth={3} />
                          </button>
                        </div>
                      ) : (
                        // Selection flow
                        <div className="space-y-6">
                          <div className="flex justify-between items-center">
                            <h3 className="font-bold text-white text-sm uppercase">Choose Grooming Services</h3>
                            <button
                              onClick={() => { setIsBookingFlowActive(false); setSelectedServices([]); }}
                              className="text-xs text-zinc-500 hover:text-zinc-300 font-bold"
                            >
                              Cancel
                            </button>
                          </div>

                          <div className="flex bg-zinc-900/60 p-1 rounded-xl border border-zinc-850 overflow-x-auto no-scrollbar gap-1">
                            {(['services', 'creative', 'packages', 'addons'] as const).map((cat) => (
                              <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`flex-1 py-1.5 px-3 rounded-lg text-[9px] font-black uppercase tracking-wider text-center shrink-0 transition-all ${
                                  activeCategory === cat
                                    ? 'bg-amber-500 text-zinc-950 font-bold'
                                    : 'text-zinc-400 hover:text-zinc-200'
                                }`}
                              >
                                {cat === 'services' && 'Classic Cuts'}
                                {cat === 'creative' && 'Creative Cuts'}
                                {cat === 'packages' && 'Packages'}
                                {cat === 'addons' && 'Add-Ons'}
                              </button>
                            ))}
                          </div>

                          <div className="grid grid-cols-1 gap-2.5 max-h-[250px] overflow-y-auto pr-1 no-scrollbar">
                            {categorizedItems.map((service) => {
                              const isSelected = selectedServices.find(s => s.id === service.id);
                              return (
                                <button
                                  key={service.id}
                                  onClick={() => toggleService(service)}
                                  className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                                    isSelected ? 'bg-amber-500/10 border-amber-500/40 text-amber-500' : 'bg-zinc-900/40 border-zinc-850 text-zinc-400 hover:border-zinc-800'
                                  }`}
                                >
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-white truncate">{service.name}</p>
                                    <p className="text-[9px] text-zinc-500 mt-0.5 font-mono">₱{service.price} • {service.duration} mins</p>
                                  </div>
                                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                    isSelected ? 'bg-amber-500 border-amber-500 text-zinc-950' : 'border-zinc-700'
                                  }`}>
                                    {isSelected && <CheckCircle2 size={10} strokeWidth={4} />}
                                  </div>
                                </button>
                              );
                            })}
                          </div>

                          {selectedServices.length > 0 && (
                            <div className="space-y-4 pt-4 border-t border-zinc-900">
                              {/* Use Points Toggle */}
                              {showPointsToggle && (
                                <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-2">
                                    <Crown size={14} className="text-amber-500 animate-pulse" />
                                    <div>
                                      <span className="font-bold text-white block">Redeem 200 PTS Reward</span>
                                      <span className="text-[9px] text-zinc-400">
                                        Discount "{sortedSelectedServices[0]?.name}" (₱{sortedSelectedServices[0]?.price}) to ₱0
                                      </span>
                                    </div>
                                  </div>
                                  <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
                                    <input
                                      type="checkbox"
                                      checked={redeemedPoints}
                                      onChange={(e) => setRedeemedPoints(e.target.checked)}
                                      className="sr-only peer"
                                    />
                                    <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-500 after:border-zinc-450 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500 peer-checked:after:bg-zinc-950 peer-checked:after:border-amber-500" />
                                  </label>
                                </div>
                              )}

                              <div className="flex justify-between items-center gap-4">
                                <div>
                                  <span className="text-[8px] font-bold text-zinc-500 uppercase block tracking-wider">Estimated Total</span>
                                  <span className="font-mono font-black text-white text-base">₱{totalPrice}</span>
                                </div>
                                <button
                                  onClick={handleGenerateQR}
                                  className="px-6 py-2.5 bg-amber-500 text-zinc-950 font-black rounded-xl hover:bg-amber-400 transition-colors uppercase tracking-wider text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/10"
                                >
                                  Generate check-in QR
                                  <QrCode size={14} />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* RIGHT BLOCK: VISIT TRANSACTION HISTORY */}
              <div className={`glass p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-zinc-800 flex flex-col gap-6 lg:h-[500px] overflow-y-auto no-scrollbar ${
                mobileTab === 'history' ? 'flex' : 'hidden lg:flex'
              }`}>
                <div>
                  <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
                    <ClipboardList size={16} className="text-amber-500" />
                    Visit History
                  </h3>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Audit log of your past completed grooming visits.</p>
                </div>

                <div className="h-[1px] bg-zinc-800/60" />

                {userHistory.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-12 text-zinc-600 text-xs italic">
                    No visit history logged yet...
                  </div>
                ) : (
                  <div className="space-y-3">
                    {userHistory.map((tx) => (
                      <div key={tx.id} className="p-3 bg-zinc-900/40 border border-zinc-850 rounded-xl space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-[10px] font-bold text-amber-500">{tx.id}</span>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                            tx.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                          }`}>
                            {tx.status === 'PAID' ? 'Paid' : 'Voided'}
                          </span>
                        </div>

                        <div className="border-t border-zinc-850 pt-2 space-y-1">
                          <p className="font-bold text-white">{tx.selectedServices.map(s => s.name).join(' + ')}</p>
                          <p className="text-[10px] text-zinc-500">{tx.date} @ {tx.time} with {tx.assignedBarber}</p>
                        </div>

                        <div className="border-t border-zinc-850 pt-2 flex justify-between items-center text-[10px]">
                          <span className="text-zinc-500">Loyalty Earned:</span>
                          <span className="font-mono font-bold text-emerald-400">+{tx.loyaltyPointsEarned} PTS</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div> {/* Closing grid div */}
          </motion.div>
          )}
        </AnimatePresence>

      </div>
    </main>
  );
}

// Inline helper
function getTxTotalPrice(tx: DbTransaction) {
  return tx.selectedServices.reduce((sum, s) => sum + s.price, 0);
}
