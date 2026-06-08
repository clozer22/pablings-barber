'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Calendar, UserPlus, Scissors } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';

export default function Home() {
  return (
    <main className="relative min-h-screen pt-24 overflow-hidden">
      <Navbar />
      
      {/* Hero Section */}
      <section className="px-6 py-20 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl"
        >
          <h1 className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tighter mb-6 bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent">
            ELEVATE YOUR <br /> STYLE.
          </h1>
          <p className="text-zinc-400 text-lg md:text-xl mb-10 max-w-xl mx-auto">
            Experience the art of premium grooming. Our master barbers combine traditional techniques with modern precision.
          </p>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link href="/book">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-amber-500 text-zinc-950 font-bold rounded-full flex items-center gap-2 hover:bg-amber-400 transition-colors"
              >
                <Calendar size={20} />
                Book Appointment
              </motion.button>
            </Link>
            <Link href="/register">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-zinc-800 text-zinc-100 font-bold rounded-full flex items-center gap-2 border border-zinc-700 hover:bg-zinc-700 transition-colors"
              >
                <UserPlus size={20} />
                Walk-in Register
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-full h-full opacity-20 pointer-events-none">
        <motion.div
          animate={{ 
            rotate: [0, 360],
          }}
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border-[1px] border-amber-500/30"
        />
        <motion.div
          animate={{ 
            rotate: [360, 0],
          }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border-[1px] border-white/10"
        />
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ delay: 1, duration: 2 }}
        className="absolute bottom-0 right-0 p-10 select-none hidden sm:block"
      >
        <Scissors size={400} className="text-zinc-500 -rotate-12" />
      </motion.div>
    </main>
  );
}
