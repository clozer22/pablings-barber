'use client';
import { motion } from 'framer-motion';
import { useAppSelector } from '@/lib/hooks';
import Navbar from '@/components/layout/Navbar';
import * as Icons from 'lucide-react';

export default function Services() {
  const services = useAppSelector((state) => state.services.items);

  return (
    <main className="min-h-screen pt-24 px-6 pb-12">
      <Navbar />
      
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-12"
        >
          <h2 className="text-4xl font-bold tracking-tighter mb-4">OUR SERVICES</h2>
          <div className="h-1 w-20 bg-amber-500 rounded-full" />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {services.map((service, index) => {
            // Dynamically get the icon component
            const IconComponent = (Icons as any)[service.icon] || Icons.Scissors;
            
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="glass p-6 sm:p-8 rounded-2xl flex flex-col sm:flex-row items-start gap-4 sm:gap-6 border border-zinc-800 transition-all hover:border-amber-500/50"
              >
                <div className="p-4 bg-amber-500/10 rounded-xl text-amber-500 shrink-0">
                  <IconComponent size={32} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xl font-bold tracking-tight">{service.name}</h3>
                    <span className="text-amber-500 font-mono font-bold">${service.price}</span>
                  </div>
                  <p className="text-zinc-400 text-sm mb-4 leading-relaxed">
                    {service.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-zinc-500 mt-auto">
                    <span className="flex items-center gap-1">
                      <Icons.Clock size={14} />
                      {service.duration} mins
                    </span>
                    <span className="flex items-center gap-1 uppercase tracking-wider">
                      <Icons.CheckCircle2 size={14} className="text-emerald-500" />
                      Premium Products
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
