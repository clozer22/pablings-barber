'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { registerUser } from '@/lib/features/user/userSlice';
import { startDraft, completePayment, resetWalkIn } from '@/lib/features/walkIn/walkInSlice';
import Navbar from '@/components/layout/Navbar';
import { QrCode, UserCheck, ArrowRight, Loader2, Scissors, Clock, CheckCircle2, CreditCard, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function Register() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const walkIn = useAppSelector((state) => state.walkIn);
  const services = useAppSelector((state) => state.services.items);
  
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Registration, 2: Service, 3: QR, 4: In-Chair, 5: Checkout
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
  });

  const [selectedServices, setSelectedServices] = useState<any[]>([]);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      dispatch(registerUser(formData));
      setLoading(false);
      setStep(2);
    }, 1000);
  };

  const toggleService = (service: any) => {
    if (selectedServices.find(s => s.id === service.id)) {
      setSelectedServices(selectedServices.filter(s => s.id !== service.id));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  };

  const handleGenerateQR = () => {
    dispatch(startDraft({ name: `${formData.firstName} ${formData.lastName}`, services: selectedServices }));
    setStep(3);
  };

  const handleClaimPoints = () => {
    dispatch(completePayment());
    setStep(5);
  };

  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0) * 50;

  return (
    <main className="min-h-screen pt-24 px-6 pb-12 flex flex-col items-center">
      <Navbar />
      
      <div className="w-full max-w-lg">
        <AnimatePresence mode="wait">
          {/* Step 1: Registration */}
          {step === 1 && (
            <motion.div
              key="step-register"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass p-8 rounded-3xl border border-zinc-800 shadow-2xl"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-zinc-800 rounded-2xl text-amber-500">
                  <QrCode size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">WALK-IN REGISTER</h2>
                  <p className="text-zinc-500 text-sm font-medium uppercase tracking-widest">Digital Entrance</p>
                </div>
              </div>

              <form onSubmit={handleRegister} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase ml-1">First Name</label>
                    <input required type="text" className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-amber-500/50" placeholder="John" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Last Name</label>
                    <input required type="text" className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-amber-500/50" placeholder="Doe" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Phone Number</label>
                  <input required type="tel" className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-amber-500/50" placeholder="+1 (555) 000-0000" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                </div>
                <button disabled={loading} className="w-full py-4 bg-zinc-100 text-zinc-950 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-white transition-colors disabled:opacity-50">
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <>Next: Select Service <ArrowRight size={20} /></>}
                </button>
              </form>
            </motion.div>
          )}

          {/* Step 2: Service Selection */}
          {step === 2 && (
            <motion.div
              key="step-service"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight mb-2 uppercase">Welcome, {formData.firstName}</h2>
                <p className="text-zinc-500 mb-8 font-medium">Select the services you want to avail today.</p>
              </div>
              <div className="grid grid-cols-1 gap-4 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
                {services.map((service) => {
                  const isSelected = selectedServices.find(s => s.id === service.id);
                  return (
                    <button
                      key={service.id}
                      onClick={() => toggleService(service)}
                      className={`glass p-6 rounded-2xl border transition-all flex items-center gap-4 text-left group ${
                        isSelected ? 'border-amber-500 bg-amber-500/10' : 'border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className={`p-3 rounded-xl transition-colors ${
                        isSelected ? 'bg-amber-500 text-zinc-950' : 'bg-zinc-800 text-amber-500 group-hover:bg-amber-500 group-hover:text-zinc-950'
                      }`}>
                        <Scissors size={24} />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold">{service.name}</p>
                        <p className="text-xs text-zinc-500">₱{service.price * 50} • {service.duration} mins</p>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                        isSelected ? 'bg-amber-500 border-amber-500 text-zinc-950' : 'border-zinc-700'
                      }`}>
                        {isSelected && <CheckCircle2 size={16} />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedServices.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="pt-6 border-t border-zinc-800"
                >
                  <div className="flex justify-between items-center mb-6 px-2">
                    <span className="text-zinc-500 font-bold uppercase text-xs">Estimated Total</span>
                    <span className="text-2xl font-black text-white">₱{totalPrice}</span>
                  </div>
                  <button
                    onClick={handleGenerateQR}
                    className="w-full py-4 bg-amber-500 text-zinc-950 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20"
                  >
                    Generate Check-In QR
                    <QrCode size={20} />
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Step 3: Check-In QR */}
          {step === 3 && (
            <motion.div
              key="step-qr"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass p-12 rounded-3xl border border-amber-500/20 text-center shadow-2xl"
            >
              <p className="text-xs font-bold text-amber-500 uppercase tracking-[0.2em] mb-4">Visit-Specific Token</p>
              <h2 className="text-2xl font-bold mb-8 uppercase tracking-tighter">Ready for Scan</h2>
              
              <div className="bg-white p-6 rounded-3xl inline-block mb-8 relative">
                <div className="w-48 h-48 bg-zinc-950 rounded-2xl flex items-center justify-center relative overflow-hidden">
                  {/* Mock QR Code Pattern */}
                  <div className="grid grid-cols-4 gap-2 opacity-20">
                    {[...Array(16)].map((_, i) => (
                      <div key={i} className="w-8 h-8 bg-white rounded-sm" />
                    ))}
                  </div>
                  <QrCode size={100} className="text-white absolute" strokeWidth={1.5} />
                </div>
                <motion.div 
                   animate={{ opacity: [0.3, 1, 0.3] }}
                   transition={{ duration: 2, repeat: Infinity }}
                   className="absolute inset-0 border-4 border-amber-500 rounded-3xl pointer-events-none" 
                />
              </div>

              <div className="p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800 text-left mb-8 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase">Customer</span>
                  <span className="text-xs font-bold">{walkIn.customerName}</span>
                </div>
                <div className="border-t border-zinc-800/50 pt-3">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase block mb-2">Services Locked</span>
                  <div className="space-y-1">
                    {walkIn.selectedServices.map(s => (
                      <div key={s.id} className="flex justify-between text-xs font-medium">
                        <span className="text-zinc-300">• {s.name}</span>
                        <span className="text-amber-500 font-bold">₱{s.price * 50}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <p className="text-zinc-500 text-sm italic mb-6">
                Waiting for receptionist to scan...
              </p>

              <button 
                onClick={() => setStep(4)} 
                className="text-xs text-zinc-600 hover:text-zinc-400 underline uppercase tracking-widest font-bold"
              >
                (Demo: Simulate Scan)
              </button>
            </motion.div>
          )}

          {/* Step 4: In-Chair State */}
          {step === 4 && (
            <motion.div
              key="step-in-chair"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass p-12 rounded-3xl border border-blue-500/20 text-center"
            >
              <div className="w-20 h-20 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Scissors size={40} />
              </div>
              <h2 className="text-3xl font-bold mb-2">SERVICE IN PROGRESS</h2>
              <p className="text-zinc-400 mb-8">
                Your session is active at <span className="text-white font-bold">Seat 1</span> with <span className="text-white font-bold">Barber Mark</span>.
              </p>
              
              <div className="p-6 bg-zinc-900 rounded-2xl border border-zinc-800 inline-block">
                <p className="text-[10px] font-bold text-zinc-500 uppercase mb-2">Live Session Timer</p>
                <div className="flex items-center gap-3 text-4xl font-black text-blue-500 font-mono tracking-tighter">
                  <Clock size={28} />
                  00:12:45
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-zinc-800">
                <p className="text-sm text-zinc-500 mb-4 font-medium uppercase tracking-widest">Scan Checkout QR when finished</p>
                <button 
                  onClick={handleClaimPoints} 
                  className="w-full py-4 bg-amber-500 text-zinc-950 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-amber-400 transition-colors"
                >
                  <Sparkles size={20} />
                  Claim Loyalty Points
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 5: Success / Paid */}
          {step === 5 && (
            <motion.div
              key="step-success"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass p-12 rounded-3xl border border-emerald-500/20 text-center shadow-2xl relative overflow-hidden"
            >
              <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} />
              </div>
              <h2 className="text-3xl font-bold mb-2 uppercase">Revenue Locked</h2>
              <p className="text-zinc-400 mb-8">
                Thank you for visiting Gents' Lounge! Your transaction is complete and verified.
              </p>
              
              <div className="p-6 bg-emerald-500/5 rounded-2xl border border-emerald-500/20 mb-8">
                <p className="text-[10px] font-bold text-emerald-500/60 uppercase mb-1">Loyalty Points Earned</p>
                <p className="text-4xl font-black text-emerald-500 font-mono tracking-tighter">+30 PTS</p>
                <p className="text-xs text-zinc-500 mt-2">New Balance: 120/200</p>
              </div>

              <div className="space-y-3 mb-8">
                <div className="border-b border-zinc-800/50 pb-3">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase block text-left mb-2">Availed Services</span>
                  <div className="space-y-1">
                    {walkIn.selectedServices.map(s => (
                      <div key={s.id} className="flex justify-between text-xs font-medium">
                        <span className="text-zinc-300">{s.name}</span>
                        <span className="text-white">₱{s.price * 50}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-zinc-500 uppercase font-black text-xs">Total Revenue Locked</span>
                  <span className="font-black text-lg text-emerald-500">₱{walkIn.selectedServices.reduce((sum, s) => sum + s.price, 0) * 50}</span>
                </div>
              </div>

              <Link href="/">
                <button 
                  onClick={() => dispatch(resetWalkIn())}
                  className="w-full py-4 bg-zinc-100 text-zinc-950 font-bold rounded-xl hover:bg-white transition-colors"
                >
                  Return Home
                </button>
              </Link>

              <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                className="absolute -bottom-2 -right-2 opacity-10 rotate-12"
              >
                <CheckCircle2 size={200} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
