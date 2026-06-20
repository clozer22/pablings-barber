'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSelector } from '@/lib/hooks';
import Navbar from '@/components/layout/Navbar';
import { 
  Scissors, 
  User, 
  Crown, 
  Sparkles, 
  Smile, 
  Gem, 
  UserRound, 
  Hand, 
  Footprints,
  Layers,
  Droplet,
  Flame,
  Wind,
  Clock,
  CheckCircle2,
  Tag
} from 'lucide-react';

export default function Services() {
  const services = useAppSelector((state) => state.services.items);
  const products = useAppSelector((state) => state.services.products || []);

  const [activeMainTab, setActiveMainTab] = useState<'services' | 'products'>('services');
  const [activeCategory, setActiveCategory] = useState<'services' | 'creative' | 'packages' | 'addons'>('services');

  // Map icon names to vector components
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Scissors': return <Scissors size={24} />;
      case 'User': return <User size={24} />;
      case 'ShowerHead': return <Sparkles size={24} />; // fallback
      case 'Sparkles': return <Sparkles size={24} />;
      case 'Smile': return <Smile size={24} />;
      case 'Gem': return <Gem size={24} />;
      case 'Crown': return <Crown size={24} />;
      case 'UserRound': return <UserRound size={24} />;
      case 'Hand': return <Hand size={24} />;
      case 'Footprints': return <Footprints size={24} />;
      case 'Layers': return <Layers size={24} />;
      case 'Droplet': return <Droplet size={24} />;
      case 'Flame': return <Flame size={24} />;
      case 'Wind': return <Wind size={24} />;
      default: return <Scissors size={24} />;
    }
  };

  const categorizedServices = services.filter(s => s.category === activeCategory);

  return (
    <main className="min-h-screen pt-24 px-6 pb-12 bg-zinc-950 text-zinc-100 relative overflow-hidden">
      <Navbar />

      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/5 via-zinc-950/0 to-zinc-950/0 pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header Block */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <span className="px-3.5 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/25 rounded-full font-bold uppercase tracking-widest text-[10px]">
            Pablings Est. 2019
          </span>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter mt-4 mb-2 uppercase">Menu & Catalog</h2>
          <p className="text-zinc-500 text-sm max-w-md mx-auto leading-relaxed">
            Browse our complete line of premium barbering services, creative cuts, packages, and specialized hair styling products.
          </p>
        </motion.div>

        {/* Main Tab Switcher (Services vs Products) */}
        <div className="flex justify-center mb-8">
          <div className="bg-zinc-900/50 p-1.5 rounded-2xl border border-zinc-800 flex max-w-md w-full">
            <button
              onClick={() => setActiveMainTab('services')}
              className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${
                activeMainTab === 'services'
                  ? 'bg-amber-500 text-zinc-950 font-bold shadow-lg shadow-amber-500/10'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Services Menu
            </button>
            <button
              onClick={() => setActiveMainTab('products')}
              className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${
                activeMainTab === 'products'
                  ? 'bg-amber-500 text-zinc-950 font-bold shadow-lg shadow-amber-500/10'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Styling Products
            </button>
          </div>
        </div>

        {/* Services Render */}
        <AnimatePresence mode="wait">
          {activeMainTab === 'services' ? (
            <motion.div
              key="services-menu"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              {/* Category tabs */}
              <div className="flex bg-zinc-900/30 p-1.5 rounded-2xl border border-zinc-850 overflow-x-auto gap-1.5 no-scrollbar max-w-2xl mx-auto">
                {(['services', 'creative', 'packages', 'addons'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-center shrink-0 transition-all ${
                      activeCategory === cat
                        ? 'bg-zinc-900 border border-zinc-800 text-amber-500 font-bold'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {cat === 'services' && 'Classic Cuts'}
                    {cat === 'creative' && 'Creative Cuts'}
                    {cat === 'packages' && 'Premium Packages'}
                    {cat === 'addons' && 'Add-Ons & Spa'}
                  </button>
                ))}
              </div>

              {/* Grid List */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
                {categorizedServices.map((service, index) => (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -4, transition: { duration: 0.15 } }}
                    className="glass p-6 rounded-3xl flex flex-col sm:flex-row items-start gap-4 sm:gap-6 border border-zinc-850 transition-all hover:border-amber-500/30 relative overflow-hidden group"
                  >
                    <div className="p-3.5 bg-amber-500/10 rounded-2xl text-amber-500 shrink-0">
                      {getIcon(service.icon)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-4 mb-2">
                        <h3 className="text-lg font-black tracking-tight text-white uppercase truncate">{service.name}</h3>
                        <span className="text-amber-500 font-mono font-bold text-base shrink-0">₱{service.price}</span>
                      </div>
                      <p className="text-zinc-400 text-xs mb-4 leading-relaxed">
                        {service.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold text-zinc-500 mt-auto">
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {service.duration} mins
                        </span>
                        <span className="flex items-center gap-1 uppercase tracking-wider text-emerald-400">
                          <CheckCircle2 size={12} />
                          Trust-Lock Verified
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            // Products Render (requested products list)
            <motion.div
              key="products-menu"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4"
            >
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -4, transition: { duration: 0.15 } }}
                  className="glass p-6 rounded-3xl flex flex-col justify-between border border-zinc-850 hover:border-amber-500/30 transition-all duration-300 relative group overflow-hidden"
                >
                  <div>
                    {/* Vector Icon representation */}
                    <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 text-amber-500 rounded-xl flex items-center justify-center mb-5 group-hover:bg-amber-500 group-hover:text-zinc-950 transition-colors">
                      {getIcon(product.icon)}
                    </div>

                    <div className="flex justify-between items-start gap-4 mb-2">
                      <h3 className="font-black text-white text-base tracking-tight uppercase leading-snug">{product.name}</h3>
                      <span className="text-amber-500 font-mono font-bold text-sm shrink-0">₱{product.price}</span>
                    </div>

                    <p className="text-zinc-400 text-xs leading-relaxed mb-6">
                      {product.description}
                    </p>
                  </div>

                  <div className="border-t border-zinc-850 pt-4 flex justify-between items-center text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                    <span className="flex items-center gap-1">
                      <Tag size={12} className="text-amber-500" />
                      In Stock
                    </span>
                    <span className="text-zinc-400 font-mono">{product.id.toUpperCase()}</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </main>
  );
}
