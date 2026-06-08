'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { assignStation, readyForCheckout, resetWalkIn } from '@/lib/features/walkIn/walkInSlice';
import Navbar from '@/components/layout/Navbar';
import { Tablet, Scan, User, Scissors, Armchair, CheckCircle2, ChevronRight, QrCode } from 'lucide-react';

export default function StaffTerminal() {
  const dispatch = useAppDispatch();
  const walkIn = useAppSelector((state) => state.walkIn);
  
  const [scanned, setScanned] = useState(false);
  const [selectedBarber, setSelectedBarber] = useState<string | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);

  const barbers = [
    { name: 'Barber Mark', status: 'Available' },
    { name: 'Barber Alex', status: 'Busy' },
    { name: 'Barber John', status: 'Available' },
  ];

  const seats = [
    { id: 'Seat 1', status: 'Vacant' },
    { id: 'Seat 2', status: 'Occupied' },
    { id: 'Seat 3', status: 'Vacant' },
  ];

  const handleConfirmAssignment = () => {
    if (selectedBarber && selectedSeat) {
      dispatch(assignStation({ barber: selectedBarber, seat: selectedSeat }));
    }
  };

  return (
    <main className="min-h-screen pt-24 px-6 pb-12 bg-zinc-900 flex flex-col items-center">
      <Navbar />
      
      <div className="w-full max-w-5xl bg-zinc-950 rounded-[2.5rem] border border-zinc-800 overflow-hidden shadow-2xl flex flex-col md:flex-row h-[700px]">
        {/* Sidebar / Status */}
        <div className="w-full md:w-80 bg-zinc-900/50 p-8 border-r border-zinc-800 flex flex-col">
          <div className="flex items-center gap-3 mb-10">
            <div className="p-2 bg-amber-500 rounded-lg text-zinc-950">
              <Tablet size={20} />
            </div>
            <h2 className="font-bold tracking-tight">STAFF TERMINAL</h2>
          </div>

          <div className="space-y-6 flex-1">
             <div>
               <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Active Sessions</p>
               <div className="space-y-2">
                 <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      <span className="text-sm font-bold">Seat 2</span>
                    </div>
                    <span className="text-[10px] font-mono opacity-60">18:24</span>
                 </div>
               </div>
             </div>
          </div>

          <div className="pt-6 border-t border-zinc-800">
             <div className="flex items-center justify-between text-[10px] font-bold text-zinc-500 uppercase">
               <span>System Status</span>
               <span className="text-emerald-500 flex items-center gap-1">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                 Cloud Online
               </span>
             </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8 md:p-12 overflow-y-auto no-scrollbar">
          <AnimatePresence mode="wait">
            {!scanned && walkIn.status === 'IDLE' ? (
              <motion.div 
                key="idle"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center text-center space-y-6"
              >
                <div className="w-32 h-32 bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-800">
                  <Scan size={48} className="text-zinc-700" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Ready to Scan</h3>
                  <p className="text-zinc-500 text-sm max-w-xs mx-auto">Scan the visit-specific QR code from the customer's device to begin assignment.</p>
                </div>
                <button 
                  onClick={() => setScanned(true)}
                  className="px-8 py-3 bg-zinc-100 text-zinc-950 font-bold rounded-full hover:bg-white transition-all flex items-center gap-2"
                >
                  <Scan size={18} />
                  Simulate Camera Scan
                </button>
              </motion.div>
            ) : walkIn.status === 'DRAFT' || (scanned && walkIn.status === 'IDLE') ? (
              <motion.div 
                key="assignment"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="space-y-10"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold tracking-tight">Assignment Modal</h3>
                    <p className="text-zinc-500 text-sm">Decoded Token: <span className="text-amber-500 font-mono">TK-992831</span></p>
                  </div>
                  <div className="px-4 py-2 bg-zinc-900 rounded-xl border border-zinc-800 text-right">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Services Locked</p>
                    <div className="flex flex-col">
                      {walkIn.selectedServices.map(s => (
                        <span key={s.id} className="text-xs font-bold text-amber-500">{s.name}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   {/* Barber Selection */}
                   <div className="space-y-4">
                     <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                       <User size={14} /> Select Barber
                     </p>
                     <div className="space-y-2">
                       {barbers.map((b) => (
                         <button 
                           key={b.name}
                           onClick={() => setSelectedBarber(b.name)}
                           disabled={b.status === 'Busy'}
                           className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                             selectedBarber === b.name ? 'bg-amber-500 border-amber-500 text-zinc-950' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                           } ${b.status === 'Busy' ? 'opacity-30 cursor-not-allowed' : ''}`}
                         >
                           <span className="font-bold">{b.name}</span>
                           <span className="text-[10px] uppercase font-black">{b.status}</span>
                         </button>
                       ))}
                     </div>
                   </div>

                   {/* Seat Selection */}
                   <div className="space-y-4">
                     <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                       <Armchair size={14} /> Select Seat/Chair
                     </p>
                     <div className="space-y-2">
                       {seats.map((s) => (
                         <button 
                           key={s.id}
                           onClick={() => setSelectedSeat(s.id)}
                           disabled={s.status === 'Occupied'}
                           className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                             selectedSeat === s.id ? 'bg-blue-500 border-blue-500 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                           } ${s.status === 'Occupied' ? 'opacity-30 cursor-not-allowed' : ''}`}
                         >
                           <span className="font-bold">{s.id}</span>
                           <span className="text-[10px] uppercase font-black">{s.status}</span>
                         </button>
                       ))}
                     </div>
                   </div>
                </div>

                <div className="pt-6 border-t border-zinc-900">
                  <button 
                    disabled={!selectedBarber || !selectedSeat}
                    onClick={handleConfirmAssignment}
                    className="w-full py-5 bg-zinc-100 text-zinc-950 font-black rounded-2xl hover:bg-white transition-all disabled:opacity-50 flex items-center justify-center gap-3 uppercase tracking-tighter text-lg"
                  >
                    Confirm Assignment & Lock Database
                    <ChevronRight size={24} />
                  </button>
                </div>
              </motion.div>
            ) : walkIn.status === 'IN_CHAIR' ? (
              <motion.div 
                key="active"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="h-full flex flex-col"
              >
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
                  <div className="w-40 h-40 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/30 relative">
                    <Armchair size={60} className="text-blue-500" />
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 rounded-full bg-blue-500/5" 
                    />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black tracking-tight mb-2 uppercase">Service Active</h3>
                    <p className="text-zinc-500">Customer <span className="text-white font-bold">{walkIn.customerName}</span> is currently in-service.</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                    <div className="p-4 bg-zinc-900 rounded-2xl border border-zinc-800">
                      <p className="text-[10px] font-bold text-zinc-500 uppercase mb-1">Barber</p>
                      <p className="font-bold">{walkIn.assignedBarber}</p>
                    </div>
                    <div className="p-4 bg-zinc-900 rounded-2xl border border-zinc-800">
                      <p className="text-[10px] font-bold text-zinc-500 uppercase mb-1">Station</p>
                      <p className="font-bold">{walkIn.assignedSeat}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-zinc-900">
                  <button 
                    onClick={() => dispatch(readyForCheckout())}
                    className="w-full py-5 bg-emerald-500 text-zinc-950 font-black rounded-2xl hover:bg-emerald-400 transition-all uppercase tracking-tighter text-lg flex items-center justify-center gap-3"
                  >
                    Close Session & Generate Bill
                    <CheckCircle2 size={24} />
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="checkout"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="h-full flex flex-col items-center justify-center text-center space-y-8"
              >
                <div className="p-10 bg-zinc-900 rounded-[3rem] border border-zinc-800 relative shadow-2xl">
                   <p className="text-xs font-black text-emerald-500 uppercase tracking-widest mb-6">Revenue Locked</p>
                   <div className="bg-white p-6 rounded-3xl inline-block mb-6">
                     <QrCode size={180} className="text-zinc-950" strokeWidth={1.5} />
                   </div>
                   <div className="text-left space-y-3 mb-2">
                     <div className="border-b border-zinc-800/50 pb-2">
                       <span className="text-[10px] font-bold text-zinc-500 uppercase">Items</span>
                       <div className="space-y-1">
                         {walkIn.selectedServices.map(s => (
                           <div key={s.id} className="flex justify-between text-[10px]">
                             <span className="text-zinc-400">{s.name}</span>
                             <span className="text-zinc-200">₱{s.price * 50}</span>
                           </div>
                         ))}
                       </div>
                     </div>
                     <div className="flex justify-between text-xs font-bold uppercase pt-1">
                       <span className="text-zinc-500">Total Bill</span>
                       <span className="text-white">₱{walkIn.selectedServices.reduce((sum, s) => sum + s.price, 0) * 50}</span>
                     </div>
                   </div>
                </div>
                <div className="max-w-xs">
                  <h3 className="text-xl font-bold mb-2">Checkout Screen Active</h3>
                  <p className="text-zinc-500 text-sm">Customer is currently scanning the checkout QR to verify the bill and claim points.</p>
                </div>
                <button 
                  onClick={() => { dispatch(resetWalkIn()); setScanned(false); }}
                  className="text-xs text-zinc-600 hover:text-zinc-400 underline uppercase tracking-widest font-bold"
                >
                  (Demo: Finish and Reset Terminal)
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
