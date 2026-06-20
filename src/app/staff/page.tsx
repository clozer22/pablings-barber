'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import { 
  Tablet, 
  User, 
  Scissors, 
  Armchair, 
  CheckCircle2, 
  ChevronRight, 
  QrCode, 
  Clock, 
  AlertCircle, 
  Trash2,
  RefreshCw,
  Play,
  Crown
} from 'lucide-react';
import { getTransactions, updateTransaction, DbTransaction, getUser } from '@/lib/trustLockDb';

export default function StaffTerminal() {
  const [transactions, setTransactions] = useState<DbTransaction[]>([]);
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);
  
  // Selection states for assignment
  const [selectedBarber, setSelectedBarber] = useState<string | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);

  // Poll transactions from localStorage database every 1 second
  useEffect(() => {
    setTransactions(getTransactions());
    const interval = setInterval(() => {
      const txs = getTransactions();
      setTransactions(txs);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Synchronize selection states when selected transaction changes
  useEffect(() => {
    const tx = transactions.find(t => t.id === selectedTxId);
    if (tx) {
      setSelectedBarber(tx.preferredBarber);
    } else {
      setSelectedBarber(null);
    }
    setSelectedSeat(null);
  }, [selectedTxId]);

  const barbers = [
    { name: 'Barber Mark', status: 'Available' },
    { name: 'Barber Alex', status: 'Available' },
    { name: 'Barber John', status: 'Available' },
  ];

  const seats = [
    { id: 'Seat 1', status: 'Vacant' },
    { id: 'Seat 2', status: 'Vacant' },
    { id: 'Seat 3', status: 'Vacant' },
  ];

  // Derive active seats and busy barbers from current active sessions
  const activeSessions = transactions.filter(t => t.status === 'IN_CHAIR');
  const activeCheckouts = transactions.filter(t => t.status === 'CHECKOUT');
  const pendingDrafts = transactions.filter(t => t.status === 'DRAFT');

  const waitingQueue = transactions
    .filter(t => t.status === 'WAITING')
    .sort((a, b) => a.id.localeCompare(b.id));

  const getWaitingPosition = (tx: DbTransaction) => {
    const sameBarberWaiting = transactions
      .filter(t => t.status === 'WAITING' && t.preferredBarber === tx.preferredBarber)
      .sort((a, b) => a.id.localeCompare(b.id));
    const idx = sameBarberWaiting.findIndex(t => t.id === tx.id);
    return idx >= 0 ? idx + 1 : 0;
  };

  const handlePlaceInWaitingList = () => {
    if (selectedTxId) {
      updateTransaction(selectedTxId, {
        status: 'WAITING',
        preferredBarber: selectedBarber || (selectedTx ? selectedTx.preferredBarber : null)
      });
      setSelectedBarber(null);
      setSelectedSeat(null);
      setSelectedTxId(null);
    }
  };

  const busyBarbers = activeSessions.map(s => s.assignedBarber);
  const occupiedSeats = activeSessions.map(s => s.assignedSeat);

  const currentBarbers = barbers.map(b => ({
    ...b,
    status: busyBarbers.includes(b.name) ? 'Busy' : 'Available'
  }));

  const currentSeats = seats.map(s => ({
    ...s,
    status: occupiedSeats.includes(s.id) ? 'Occupied' : 'Vacant'
  }));

  // Find currently selected transaction details
  const selectedTx = transactions.find(t => t.id === selectedTxId) || null;
  const clientUser = selectedTx ? getUser(selectedTx.username) : null;
  const clientPoints = clientUser ? clientUser.points : 0;
  const hasEnoughPoints = clientPoints >= 200;

  // Confirm assignment and transition to IN_CHAIR
  const handleConfirmAssignment = () => {
    if (selectedTxId && selectedBarber && selectedSeat) {
      updateTransaction(selectedTxId, {
        status: 'IN_CHAIR',
        assignedBarber: selectedBarber,
        assignedSeat: selectedSeat,
        startTime: new Date().toISOString()
      });
      setSelectedBarber(null);
      setSelectedSeat(null);
    }
  };

  // Close session and transition to CHECKOUT
  const handleCloseSession = (id: string) => {
    updateTransaction(id, {
      status: 'CHECKOUT',
      endTime: new Date().toISOString()
    });
  };

  // Settle payment and transition to PAID (Locks loyalty points)
  const handleConfirmPayment = (id: string) => {
    updateTransaction(id, {
      status: 'PAID'
    });
    setSelectedTxId(null);
  };

  // Void/Cancel active or draft session (Anti-Fraud: Permanently recorded as voided)
  const handleVoidSession = (id: string) => {
    updateTransaction(id, {
      status: 'VOIDED',
      endTime: new Date().toISOString()
    });
    setSelectedTxId(null);
  };

  const getTxTotalPrice = (tx: DbTransaction) => {
    if (tx.redeemedPoints) {
      return tx.selectedServices.reduce((sum, s, idx) => {
        if (idx === 0) return sum;
        return sum + s.price;
      }, 0);
    }
    return tx.selectedServices.reduce((sum, s) => sum + s.price, 0);
  };

  return (
    <main className="min-h-screen pt-24 px-6 pb-12 bg-zinc-900 flex flex-col items-center">
      <Navbar />
      
      <div className="w-full max-w-6xl bg-zinc-950 rounded-[2.5rem] border border-zinc-800 overflow-hidden shadow-2xl flex flex-col md:flex-row md:h-[720px] h-auto min-h-[500px]">
        
        {/* SIDEBAR: QUEUE MONITOR */}
        <div className="w-full md:w-80 bg-zinc-950 p-6 border-b md:border-b-0 md:border-r border-zinc-800 flex flex-col justify-between shrink-0">
          <div className="space-y-6 overflow-y-auto no-scrollbar flex-1">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500 rounded-lg text-zinc-950">
                <Tablet size={20} />
              </div>
              <h2 className="font-bold tracking-tight text-white text-sm uppercase">Reception Console</h2>
            </div>

            <div className="h-[1px] bg-zinc-800/60" />

            {/* Section A: Incoming Check-Ins (DRAFT) */}
            <div>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Incoming Check-Ins ({pendingDrafts.length})
              </p>
              {pendingDrafts.length === 0 ? (
                <p className="text-[10px] text-zinc-600 italic">No incoming check-ins...</p>
              ) : (
                <div className="space-y-2">
                  {pendingDrafts.map((tx) => (
                    <button
                      key={tx.id}
                      onClick={() => setSelectedTxId(tx.id)}
                      className={`w-full p-3 rounded-xl border text-left flex justify-between items-center transition-all ${
                        selectedTxId === tx.id 
                          ? 'bg-amber-500/10 border-amber-500 text-amber-500' 
                          : 'bg-zinc-900/40 border-zinc-850 text-zinc-400 hover:border-zinc-800'
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{tx.customerName}</p>
                        <p className="text-[9px] font-mono mt-0.5 truncate">{tx.selectedServices.map(s => s.name).join(', ')}</p>
                      </div>
                      <span className="text-[9px] font-bold font-mono shrink-0 ml-2">₱{getTxTotalPrice(tx)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Section A.5: Waiting Queue (WAITING) */}
            <div>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                Waiting Queue ({waitingQueue.length})
              </p>
              {waitingQueue.length === 0 ? (
                <p className="text-[10px] text-zinc-600 italic">No clients waiting...</p>
              ) : (
                <div className="space-y-2">
                  {waitingQueue.map((tx) => {
                    const pos = getWaitingPosition(tx);
                    return (
                      <button
                        key={tx.id}
                        onClick={() => setSelectedTxId(tx.id)}
                        className={`w-full p-3 rounded-xl border text-left flex justify-between items-center transition-all ${
                          selectedTxId === tx.id 
                            ? 'bg-purple-500/10 border-purple-500 text-purple-400' 
                            : 'bg-zinc-900/40 border-zinc-850 text-zinc-400 hover:border-zinc-800'
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">{tx.customerName}</p>
                          <p className="text-[9px] font-semibold text-zinc-500 mt-0.5">
                            {tx.preferredBarber || 'Any Barber'} • Queue #{pos}
                          </p>
                        </div>
                        <span className="text-[9px] font-bold font-mono text-purple-400 shrink-0 ml-2">₱{getTxTotalPrice(tx)}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Section B: Active Services (IN_CHAIR) */}
            <div>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                Active Sessions ({activeSessions.length})
              </p>
              {activeSessions.length === 0 ? (
                <p className="text-[10px] text-zinc-600 italic">No active chairs...</p>
              ) : (
                <div className="space-y-2">
                  {activeSessions.map((tx) => (
                    <button
                      key={tx.id}
                      onClick={() => setSelectedTxId(tx.id)}
                      className={`w-full p-3 rounded-xl border text-left flex justify-between items-center transition-all ${
                        selectedTxId === tx.id 
                          ? 'bg-blue-500/10 border-blue-500 text-blue-400' 
                          : 'bg-zinc-900/40 border-zinc-850 text-zinc-400 hover:border-zinc-800'
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{tx.customerName}</p>
                        <p className="text-[9px] font-semibold text-zinc-500 mt-0.5">{tx.assignedSeat} • {tx.assignedBarber}</p>
                      </div>
                      <span className="text-[9px] font-mono font-bold text-blue-400 shrink-0">₱{getTxTotalPrice(tx)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Section C: Settle/Checkout (CHECKOUT) */}
            <div>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Pending Checkout ({activeCheckouts.length})
              </p>
              {activeCheckouts.length === 0 ? (
                <p className="text-[10px] text-zinc-600 italic">No transactions at counter...</p>
              ) : (
                <div className="space-y-2">
                  {activeCheckouts.map((tx) => (
                    <button
                      key={tx.id}
                      onClick={() => setSelectedTxId(tx.id)}
                      className={`w-full p-3 rounded-xl border text-left flex justify-between items-center transition-all ${
                        selectedTxId === tx.id 
                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' 
                          : 'bg-zinc-900/40 border-zinc-850 text-zinc-400 hover:border-zinc-800'
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{tx.customerName}</p>
                        <p className="text-[9px] text-zinc-500 font-mono mt-0.5">Ready to pay</p>
                      </div>
                      <span className="text-[9px] font-mono font-bold text-emerald-400 shrink-0">₱{getTxTotalPrice(tx)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>

          <div className="pt-4 border-t border-zinc-850 flex items-center justify-between text-[9px] font-bold text-zinc-500 uppercase">
            <span>Terminal Gateway</span>
            <span className="text-emerald-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Online
            </span>
          </div>
        </div>

        {/* MAIN PANEL CONTENT */}
        <div className="flex-1 p-8 md:p-10 overflow-y-auto no-scrollbar bg-zinc-950 flex flex-col justify-between">
          <AnimatePresence mode="wait">
            {!selectedTx ? (
              // Idle Screen
              <motion.div 
                key="idle"
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center text-center space-y-4"
              >
                <div className="w-24 h-24 bg-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-850 text-zinc-700">
                  <Tablet size={36} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white uppercase tracking-tight">Select Queue Session</h3>
                  <p className="text-zinc-500 text-xs max-w-xs mx-auto mt-1">
                    Select a client check-in registration or active chair from the sidebar to manage assignments and checkout settlements.
                  </p>
                </div>
              </motion.div>
            ) : (selectedTx.status === 'DRAFT' || selectedTx.status === 'WAITING') ? (
              // Step 1: Assign Station Modal
              <motion.div 
                key="assignment"
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="text-xl font-black text-white tracking-tight uppercase flex items-center gap-2">
                      {selectedTx.status === 'WAITING' ? 'Assign Chair for Waiting Client' : 'Assign Barber & Chair'}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-zinc-500 text-xs">Token: <span className="text-amber-500 font-mono font-bold">{selectedTx.id}</span></p>
                      {selectedTx.redeemedPoints && (
                        <span className="text-[8px] font-black text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg uppercase tracking-wider flex items-center gap-1">
                          <Crown size={8} className="animate-pulse" /> Reward Redemption
                        </span>
                      )}
                    </div>
                    {selectedTx.preferredBarber && (
                      <span className="text-[9px] font-black text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-lg uppercase tracking-wider flex items-center gap-1.5 mt-1.5 w-fit">
                        <Armchair size={8} /> {selectedTx.status === 'WAITING' ? 'Waiting for:' : 'Preferred Barber:'} {selectedTx.preferredBarber}
                      </span>
                    )}
                  </div>
                  
                  {/* Service Lock Metadata Info */}
                  <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-xl text-right">
                    <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Locked pricing & items</p>
                    <div className="space-y-1">
                      {selectedTx.selectedServices.map((s, idx) => {
                        const isDiscounted = selectedTx.redeemedPoints && idx === 0;
                        return (
                          <div key={s.id} className="text-xs font-bold text-amber-500">
                            {s.name}{" "}
                            <span className="font-mono text-xs ml-1">
                              {isDiscounted ? (
                                <>
                                  <span className="line-through text-zinc-500 mr-1">₱{s.price}</span>
                                  <span className="text-amber-400 font-black">₱0</span>
                                </>
                              ) : (
                                <span className="text-zinc-500 text-[10px] font-normal">₱{s.price}</span>
                              )}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Barber Selection */}
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                      <User size={12} /> Select Barber
                    </p>
                    <div className="space-y-2">
                      {currentBarbers.map((b) => {
                        const isBusy = b.status === 'Busy';
                        const selected = selectedBarber === b.name;
                        return (
                          <button 
                            key={b.name}
                            onClick={() => setSelectedBarber(b.name)}
                            disabled={isBusy}
                            className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                              selected 
                                ? 'bg-amber-500 text-zinc-950 border-amber-500 font-bold' 
                                : 'bg-zinc-900 border-zinc-850 text-zinc-400 hover:border-zinc-800'
                            } ${isBusy ? 'opacity-30 cursor-not-allowed' : ''}`}
                          >
                            <span className="text-xs font-bold">{b.name}</span>
                            <span className="text-[9px] font-black uppercase">{b.status}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Seat Selection */}
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Armchair size={12} /> Select Chair/Seat
                    </p>
                    <div className="space-y-2">
                      {currentSeats.map((s) => {
                        const isOccupied = s.status === 'Occupied';
                        const selected = selectedSeat === s.id;
                        return (
                          <button 
                            key={s.id}
                            onClick={() => setSelectedSeat(s.id)}
                            disabled={isOccupied}
                            className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                              selected 
                                ? 'bg-blue-500 text-white border-blue-500 font-bold' 
                                : 'bg-zinc-900 border-zinc-850 text-zinc-400 hover:border-zinc-800'
                            } ${isOccupied ? 'opacity-30 cursor-not-allowed' : ''}`}
                          >
                            <span className="text-xs font-bold">{s.id}</span>
                            <span className="text-[9px] font-black uppercase">{s.status}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-zinc-900 flex gap-4">
                  <button
                    onClick={() => handleVoidSession(selectedTxId!)}
                    className="px-4 py-3 bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-rose-400 hover:border-rose-950 transition-all rounded-xl text-xs uppercase font-bold flex items-center gap-1.5 shrink-0"
                  >
                    <Trash2 size={14} />
                    Void Check-In
                  </button>

                  {selectedTx.status === 'DRAFT' && (
                    <button
                      onClick={handlePlaceInWaitingList}
                      className="px-5 py-3.5 bg-purple-900/30 border border-purple-800 hover:bg-purple-900/50 text-purple-300 transition-all rounded-xl text-xs uppercase font-black flex items-center gap-1.5"
                    >
                      <Armchair size={14} />
                      Place in Waiting List
                    </button>
                  )}

                  <button 
                    disabled={!selectedBarber || !selectedSeat}
                    onClick={handleConfirmAssignment}
                    className="flex-1 py-3.5 bg-zinc-100 text-zinc-950 font-black rounded-xl hover:bg-white transition-all disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-tight text-sm"
                  >
                    {selectedTx.status === 'WAITING' ? 'Move to Chair' : 'Confirm Assignment & Lock Status'}
                    <ChevronRight size={18} />
                  </button>
                </div>
              </motion.div>
            ) : selectedTx.status === 'IN_CHAIR' ? (
              // Step 2: Active Service Monitor
              <motion.div 
                key="active"
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col justify-between"
              >
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                  <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/30 relative">
                    <Armchair size={36} className="text-blue-500" />
                    <motion.div 
                      animate={{ scale: [1, 1.25, 1] }} 
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 rounded-full bg-blue-500/5" 
                    />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black tracking-tight text-white uppercase mb-1">Service Active</h3>
                    <p className="text-zinc-500 text-xs">
                      Customer <span className="text-white font-bold">{selectedTx.customerName}</span> is currently getting styled.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                    <div className="p-3 bg-zinc-900 border border-zinc-850 rounded-xl">
                      <p className="text-[8px] font-bold text-zinc-500 uppercase mb-1">Assigned Barber</p>
                      <p className="font-bold text-white text-xs">{selectedTx.assignedBarber}</p>
                    </div>
                    <div className="p-3 bg-zinc-900 border border-zinc-850 rounded-xl">
                      <p className="text-[8px] font-bold text-zinc-500 uppercase mb-1">Assigned Station</p>
                      <p className="font-bold text-white text-xs">{selectedTx.assignedSeat}</p>
                    </div>
                  </div>

                  <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-850 flex items-center gap-2">
                    <Clock size={16} className="text-blue-400" />
                    <span className="text-xs text-zinc-400 font-medium">Session started: {new Date(selectedTx.startTime!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-zinc-900 flex gap-4">
                  <button
                    onClick={() => handleVoidSession(selectedTxId!)}
                    className="px-4 py-3.5 bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-rose-400 hover:border-rose-950 transition-all rounded-xl text-xs uppercase font-bold flex items-center gap-1.5"
                  >
                    <Trash2 size={14} />
                    Force Void Chair
                  </button>
                  
                  <button 
                    onClick={() => handleCloseSession(selectedTxId!)}
                    className="flex-1 py-3.5 bg-emerald-500 text-zinc-950 font-black rounded-xl hover:bg-emerald-400 transition-all uppercase tracking-tight text-sm flex items-center justify-center gap-2"
                  >
                    Close Session & Generate Bill
                    <CheckCircle2 size={18} />
                  </button>
                </div>
              </motion.div>
            ) : (
              // Step 3: Checkout Screen (CHECKOUT)
              <motion.div 
                key="checkout"
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col justify-between"
              >
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                  <div className="p-8 bg-zinc-900 border border-zinc-850 rounded-[2.5rem] relative shadow-xl max-w-sm w-full">
                     <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-4">Locked Revenue Portal</p>
                     
                     <div className="bg-white p-4 rounded-2xl inline-block mb-4">
                       <QrCode size={130} className="text-zinc-950" strokeWidth={1.5} />
                     </div>

                     <div className="text-left space-y-3 mb-2 border-t border-zinc-850 pt-3">
                        <div>
                          <span className="text-[9px] font-bold text-zinc-500 uppercase">Grooming Items</span>
                          <div className="space-y-1.5 mt-1">
                            {selectedTx.selectedServices.map((s, idx) => {
                              const isDiscounted = selectedTx.redeemedPoints && idx === 0;
                              return (
                                <div key={s.id} className="flex justify-between text-xs font-semibold">
                                  <span className="text-zinc-400 flex items-center gap-1">
                                    {s.name}
                                    {isDiscounted && (
                                      <span className="text-[8px] bg-amber-500/20 text-amber-300 px-1 py-0.25 rounded font-black uppercase tracking-wider">
                                        Free
                                      </span>
                                    )}
                                  </span>
                                  <span className="text-zinc-200 font-mono">
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

                        {/* Point Reward Toggle for Receptionist */}
                        {(hasEnoughPoints || selectedTx.redeemedPoints) ? (
                          <div className="p-2.5 bg-amber-500/5 border border-amber-500/25 rounded-xl flex items-center justify-between text-[11px] text-zinc-350">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <Crown size={12} className="text-amber-500 animate-pulse shrink-0" />
                              <div className="min-w-0">
                                <span className="font-bold text-white block">Redeem 200 PTS Reward</span>
                                <span className="text-[9px] text-zinc-500 block truncate">
                                  {selectedTx.userRedeemedPoints 
                                    ? "Locked by client on check-in" 
                                    : `Balance: ${clientPoints} PTS`}
                                </span>
                              </div>
                            </div>
                            <label className={`relative inline-flex items-center select-none shrink-0 ${
                              selectedTx.userRedeemedPoints ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                            }`}>
                              <input
                                type="checkbox"
                                checked={selectedTx.redeemedPoints}
                                disabled={selectedTx.userRedeemedPoints}
                                onChange={(e) => {
                                  updateTransaction(selectedTx.id, { redeemedPoints: e.target.checked });
                                  setTransactions(getTransactions()); // update state snappy
                                }}
                                className="sr-only peer"
                              />
                              <div className="w-8 h-4.5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-500 after:border-zinc-400 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-amber-500 peer-checked:after:bg-zinc-950 peer-checked:after:border-amber-500" />
                            </label>
                          </div>
                        ) : (
                          <div className="p-2.5 bg-zinc-900 border border-zinc-850 rounded-xl text-[10px] text-zinc-500 flex items-center gap-1.5">
                            <Crown size={12} className="text-zinc-650 shrink-0" />
                            <span>Client balance ({clientPoints} PTS) insufficient for reward.</span>
                          </div>
                        )}
                        
                        <div className="flex justify-between text-xs font-black uppercase pt-2 border-t border-zinc-850/60">
                          <span className="text-zinc-500">Gross Total</span>
                          <span className="text-white font-mono">₱{getTxTotalPrice(selectedTx)}</span>
                        </div>
                      </div>
                  </div>
                  
                  <div className="max-w-xs">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Checkout Ledger Active</h3>
                    <p className="text-zinc-500 text-[10px] leading-relaxed mt-1">
                      Client is paying externally. Settle manually and click complete below to record revenue and release loyalty points.
                    </p>
                  </div>
                </div>

                <div className="pt-6 border-t border-zinc-900 flex gap-4">
                  <button
                    onClick={() => handleVoidSession(selectedTxId!)}
                    className="px-4 py-3.5 bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-rose-400 hover:border-rose-950 transition-all rounded-xl text-xs uppercase font-bold flex items-center gap-1.5"
                  >
                    <Trash2 size={14} />
                    Void / Refund
                  </button>
                  <button 
                    onClick={() => handleConfirmPayment(selectedTxId!)}
                    className="flex-1 py-3.5 bg-emerald-500 text-zinc-950 font-black rounded-xl hover:bg-emerald-400 transition-all uppercase tracking-tight text-sm flex items-center justify-center gap-2"
                  >
                    Confirm Payment & Post Session
                    <CheckCircle2 size={18} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
