'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { selectService, selectDateTime, setPaymentType, completeBooking } from '@/lib/features/booking/bookingSlice';
import Navbar from '@/components/layout/Navbar';
import * as Icons from 'lucide-react';

export default function Book() {
  const dispatch = useAppDispatch();
  const services = useAppSelector((state) => state.services.items);
  const booking = useAppSelector((state) => state.booking);
  
  const [step, setStep] = useState(1); // 1: Service, 2: Time, 3: Payment, 4: Success

  const handleServiceSelect = (id: string, price: number) => {
    dispatch(selectService({ id, price }));
    setStep(2);
  };

  const handleTimeSelect = (time: string) => {
    dispatch(selectDateTime({ date: '2026-05-20', time }));
    setStep(3);
  };

  const handlePaymentSelect = (type: 'downpayment' | 'full') => {
    const selectedService = services.find(s => s.id === booking.selectedServiceId);
    const price = selectedService?.price || 0;
    const amount = type === 'downpayment' ? price * 0.5 : price;
    
    dispatch(setPaymentType({ type, amount }));
    setStep(4);
    dispatch(completeBooking());
  };

  const times = ['10:00 AM', '11:00 AM', '1:00 PM', '2:30 PM', '4:00 PM', '5:30 PM'];

  return (
    <main className="min-h-screen pt-24 px-6 pb-12 flex flex-col items-center">
      <Navbar />
      
      <div className="w-full max-w-4xl">
        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 mb-8 sm:mb-12">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                step >= i ? 'bg-amber-500 text-zinc-950' : 'bg-zinc-800 text-zinc-500'
              }`}>
                {step > i ? <Icons.Check size={20} /> : i}
              </div>
              {i < 3 && <div className={`w-12 md:w-24 h-0.5 rounded-full ${step > i ? 'bg-amber-500' : 'bg-zinc-800'}`} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6 sm:space-y-8"
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-center tracking-tight">SELECT A SERVICE</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((service) => {
                  const Icon = (Icons as any)[service.icon] || Icons.Scissors;
                  return (
                    <button
                      key={service.id}
                      onClick={() => handleServiceSelect(service.id, service.price)}
                      className="glass p-6 rounded-2xl border border-zinc-800 flex items-center gap-4 text-left hover:border-amber-500/50 transition-all group"
                    >
                      <div className="p-3 bg-zinc-800 rounded-xl text-amber-500 group-hover:bg-amber-500 group-hover:text-zinc-950 transition-colors">
                        <Icon size={24} />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold">{service.name}</p>
                        <p className="text-xs text-zinc-500">${service.price} • {service.duration} mins</p>
                      </div>
                      <Icons.ChevronRight className="text-zinc-700" size={20} />
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6 sm:space-y-8"
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-center tracking-tight">CHOOSE YOUR TIME</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {times.map((time) => (
                  <button
                    key={time}
                    onClick={() => handleTimeSelect(time)}
                    className="glass py-6 rounded-2xl border border-zinc-800 font-bold hover:border-amber-500/50 hover:text-amber-500 transition-all"
                  >
                    {time}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6 sm:space-y-8 max-w-lg mx-auto"
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-center tracking-tight">SECURE YOUR SPOT</h2>
              <div className="space-y-4">
                <button
                  onClick={() => handlePaymentSelect('downpayment')}
                  className="w-full glass p-8 rounded-3xl border border-zinc-800 text-left hover:border-amber-500/50 transition-all group"
                >
                  <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">Recommended</p>
                  <p className="text-xl font-bold mb-2">50% Downpayment</p>
                  <p className="text-zinc-500 text-sm">Pay the rest at the shop after your service.</p>
                </button>
                <button
                  onClick={() => handlePaymentSelect('full')}
                  className="w-full glass p-8 rounded-3xl border border-zinc-800 text-left hover:border-amber-500/50 transition-all"
                >
                  <p className="text-xl font-bold mb-2">Full Payment</p>
                  <p className="text-zinc-500 text-sm">Skip the line and get straight to your style.</p>
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass p-8 sm:p-12 rounded-3xl border border-amber-500/20 text-center max-w-lg mx-auto shadow-2xl relative overflow-hidden"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Icons.CreditCard size={32} className="sm:w-10 sm:h-10" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">BOOKING CONFIRMED!</h2>
              <p className="text-zinc-400 mb-8 text-sm sm:text-base">
                Your payment of <span className="text-white font-bold">${booking.amountToPay}</span> was successful. We'll see you on May 20 at {booking.selectedTime}.
              </p>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm py-3 border-b border-zinc-800">
                  <span className="text-zinc-500 uppercase font-bold">Service</span>
                  <span className="font-bold">{services.find(s => s.id === booking.selectedServiceId)?.name}</span>
                </div>
                <div className="flex justify-between text-sm py-3 border-b border-zinc-800">
                  <span className="text-zinc-500 uppercase font-bold">Booking ID</span>
                  <span className="font-mono text-amber-500 font-bold">GL-88293-X</span>
                </div>
              </div>

              <motion.div
                initial={{ rotate: 10, opacity: 0 }}
                animate={{ rotate: -10, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute top-4 right-4 bg-zinc-800 px-3 py-1 rounded-lg border border-zinc-700"
              >
                <p className="text-[10px] font-bold text-zinc-500 uppercase">Paid</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
