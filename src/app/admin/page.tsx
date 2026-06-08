'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import {
  TrendingUp,
  DollarSign,
  Users,
  MapPin,
  ClipboardList,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Shield,
  Star,
  Clock,
  Sparkles,
  RefreshCw,
  Bell
} from 'lucide-react';

// Interfaces
interface Transaction {
  id: string;
  customerName: string;
  serviceName: string;
  price: number;
  date: string;
  time: string;
  branch: string;
  paymentType: 'Downpayment' | 'Full';
  status: 'PAID' | 'CHECKOUT' | 'IN_CHAIR' | 'DRAFT';
}

interface Employee {
  id: string;
  name: string;
  specialty: string;
  status: 'Available' | 'Busy' | 'Off-Duty';
  branch: string;
  rating: number;
  avatarColor: string;
}

interface Branch {
  id: string;
  name: string;
  address: string;
  manager: string;
  chairs: number;
  status: 'Open' | 'Closed';
}

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'info' | 'error';
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'sales' | 'transactions' | 'employees' | 'branches'>('sales');
  
  // Filtering & Search states
  const [txSearch, setTxSearch] = useState('');
  const [txStatusFilter, setTxStatusFilter] = useState<string>('ALL');
  const [salesBranchFilter, setSalesBranchFilter] = useState<string>('ALL');
  const [salesPaymentFilter, setSalesPaymentFilter] = useState<string>('ALL');
  
  // Modals
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  
  // Toast notifications
  const [toasts, setToasts] = useState<Toast[]>([]);
  const triggerToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  // Mock State Lists
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: 'TR-1001', customerName: 'John Doe', serviceName: 'The Full Package', price: 2500, date: '2026-06-08', time: '14:00', branch: 'Downtown Main', paymentType: 'Full', status: 'PAID' },
    { id: 'TR-1002', customerName: 'Jane Smith', serviceName: 'Classic Haircut', price: 1250, date: '2026-06-08', time: '15:30', branch: 'Uptown Lounge', paymentType: 'Downpayment', status: 'IN_CHAIR' },
    { id: 'TR-1003', customerName: 'Bob Johnson', serviceName: 'Beard Trim & Shape', price: 750, date: '2026-06-08', time: '16:00', branch: 'Downtown Main', paymentType: 'Full', status: 'CHECKOUT' },
    { id: 'TR-1004', customerName: 'Alice Cooper', serviceName: 'Hot Towel Shave', price: 1500, date: '2026-06-07', time: '11:00', branch: 'Northside Hub', paymentType: 'Full', status: 'PAID' },
    { id: 'TR-1005', customerName: 'Charlie Brown', serviceName: 'Classic Haircut', price: 1250, date: '2026-06-07', time: '18:00', branch: 'Uptown Lounge', paymentType: 'Downpayment', status: 'PAID' },
    { id: 'TR-1006', customerName: 'David Miller', serviceName: 'The Full Package', price: 2500, date: '2026-06-06', time: '13:15', branch: 'Northside Hub', paymentType: 'Full', status: 'PAID' },
    { id: 'TR-1007', customerName: 'Emma Watson', serviceName: 'Beard Trim & Shape', price: 750, date: '2026-06-06', time: '10:45', branch: 'Uptown Lounge', paymentType: 'Full', status: 'PAID' }
  ]);

  const [employees, setEmployees] = useState<Employee[]>([
    { id: 'EMP-01', name: 'Barber Mark', specialty: 'Classic Cuts & Fades', status: 'Available', branch: 'Downtown Main', rating: 4.8, avatarColor: 'from-amber-500 to-amber-700' },
    { id: 'EMP-02', name: 'Barber Alex', specialty: 'Beard Grooming Specialist', status: 'Busy', branch: 'Uptown Lounge', rating: 4.9, avatarColor: 'from-blue-500 to-indigo-700' },
    { id: 'EMP-03', name: 'Barber John', specialty: 'Hair Styling & Dyeing', status: 'Off-Duty', branch: 'Northside Hub', rating: 4.7, avatarColor: 'from-emerald-500 to-teal-700' }
  ]);

  const [branches, setBranches] = useState<Branch[]>([
    { id: 'BR-01', name: 'Downtown Main', address: '123 Heritage Way, Downtown District', manager: 'Marcus Aurelius', chairs: 5, status: 'Open' },
    { id: 'BR-02', name: 'Uptown Lounge', address: '456 Modern Ave, Suite A, Uptown', manager: 'Julius Caesar', chairs: 3, status: 'Open' },
    { id: 'BR-03', name: 'Northside Hub', address: '789 Industrial Rd, North Sector', manager: 'Augustus Octavian', chairs: 4, status: 'Closed' }
  ]);

  // Form states for new inputs
  const [newEmployee, setNewEmployee] = useState({ name: '', specialty: '', branch: 'Downtown Main' });
  const [newBranch, setNewBranch] = useState({ name: '', address: '', manager: '', chairs: 3 });

  // Navigation Items
  const menuItems = [
    { id: 'sales', label: 'Sales & Analytics', icon: TrendingUp },
    { id: 'transactions', label: 'Transactions', icon: ClipboardList },
    { id: 'employees', label: 'Employees', icon: Users },
    { id: 'branches', label: 'Branches', icon: MapPin },
  ];

  // Helper calculations for Overview
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const matchesSearch = tx.customerName.toLowerCase().includes(txSearch.toLowerCase()) ||
                            tx.serviceName.toLowerCase().includes(txSearch.toLowerCase()) ||
                            tx.id.toLowerCase().includes(txSearch.toLowerCase());
      
      const matchesStatus = txStatusFilter === 'ALL' || tx.status === txStatusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [transactions, txSearch, txStatusFilter]);

  // Calculations filtered for Sales Overview specifically
  const salesTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const matchesBranch = salesBranchFilter === 'ALL' || tx.branch === salesBranchFilter;
      const matchesPayment = salesPaymentFilter === 'ALL' || tx.paymentType === salesPaymentFilter;
      return matchesBranch && matchesPayment;
    });
  }, [transactions, salesBranchFilter, salesPaymentFilter]);

  const stats = useMemo(() => {
    const totalSales = salesTransactions
      .filter(tx => tx.status === 'PAID')
      .reduce((sum, tx) => sum + tx.price, 0);

    const totalCount = salesTransactions.length;
    const activeEmpCount = employees.filter(e => e.status === 'Available').length;
    const openBranchesCount = branches.filter(b => b.status === 'Open').length;

    return {
      revenue: totalSales,
      bookingsCount: totalCount,
      activeBarbers: activeEmpCount,
      openBranches: openBranchesCount
    };
  }, [salesTransactions, employees, branches]);

  // Handle transaction actions
  const handleMarkPaid = (id: string) => {
    setTransactions(prev =>
      prev.map(tx => (tx.id === id ? { ...tx, status: 'PAID' } : tx))
    );
    triggerToast(`Transaction ${id} marked as Paid!`, 'success');
  };

  const handleRefund = (id: string) => {
    setTransactions(prev =>
      prev.map(tx => (tx.id === id ? { ...tx, status: 'DRAFT' } : tx))
    );
    triggerToast(`Transaction ${id} refunded / reset to Draft!`, 'info');
  };

  // Handle employee actions
  const handleToggleEmployeeStatus = (id: string) => {
    setEmployees(prev =>
      prev.map(emp => {
        if (emp.id === id) {
          const nextStatusMap: Record<'Available' | 'Busy' | 'Off-Duty', 'Available' | 'Busy' | 'Off-Duty'> = {
            'Available': 'Busy',
            'Busy': 'Off-Duty',
            'Off-Duty': 'Available'
          };
          const nextStatus = nextStatusMap[emp.status];
          triggerToast(`${emp.name} is now ${nextStatus}`, 'info');
          return { ...emp, status: nextStatus };
        }
        return emp;
      })
    );
  };

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmployee.name || !newEmployee.specialty) {
      triggerToast('Please fill in all fields', 'error');
      return;
    }

    const colors = [
      'from-amber-500 to-amber-700',
      'from-blue-500 to-indigo-700',
      'from-emerald-500 to-teal-700',
      'from-rose-500 to-pink-700',
      'from-purple-500 to-violet-700'
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const added: Employee = {
      id: `EMP-0${employees.length + 1}`,
      name: newEmployee.name,
      specialty: newEmployee.specialty,
      status: 'Available',
      branch: newEmployee.branch,
      rating: 5.0,
      avatarColor: randomColor
    };

    setEmployees(prev => [...prev, added]);
    setNewEmployee({ name: '', specialty: '', branch: 'Downtown Main' });
    setIsEmployeeModalOpen(false);
    triggerToast(`Added ${added.name} to roster!`, 'success');
  };

  // Handle branch actions
  const handleToggleBranchStatus = (id: string) => {
    setBranches(prev =>
      prev.map(b => {
        if (b.id === id) {
          const nextStatus = b.status === 'Open' ? 'Closed' : 'Open';
          triggerToast(`${b.name} is now ${nextStatus}`, 'info');
          return { ...b, status: nextStatus };
        }
        return b;
      })
    );
  };

  const handleAddBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranch.name || !newBranch.address || !newBranch.manager) {
      triggerToast('Please fill in all fields', 'error');
      return;
    }

    const added: Branch = {
      id: `BR-0${branches.length + 1}`,
      name: newBranch.name,
      address: newBranch.address,
      manager: newBranch.manager,
      chairs: Number(newBranch.chairs),
      status: 'Open'
    };

    setBranches(prev => [...prev, added]);
    setNewBranch({ name: '', address: '', manager: '', chairs: 3 });
    setIsBranchModalOpen(false);
    triggerToast(`Created branch: ${added.name}`, 'success');
  };

  return (
    <main className="min-h-screen pt-24 pb-12 bg-zinc-950 text-zinc-100 flex flex-col relative overflow-hidden">
      <Navbar />

      {/* Decorative Grid Line */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/5 via-zinc-950/0 to-zinc-950/0 pointer-events-none -z-10" />

      {/* Toasts System */}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className={`pointer-events-auto p-4 rounded-xl border shadow-xl flex items-center gap-3 backdrop-blur-md ${
                t.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                t.type === 'error' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                'bg-zinc-900/90 border-zinc-800 text-amber-500'
              }`}
            >
              <CheckCircle2 size={18} className="shrink-0" />
              <span className="text-sm font-medium">{t.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="max-w-[1400px] w-full mx-auto px-6 flex-1 flex flex-col lg:flex-row gap-8 mt-4">
        
        {/* SIDEBAR NAVIGATION */}
        <aside className="lg:w-80 w-full shrink-0 flex flex-col gap-6">
          <div className="glass p-6 rounded-3xl border border-zinc-800 flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl text-zinc-950">
                <Shield size={24} />
              </div>
              <div>
                <h1 className="font-bold tracking-tight text-zinc-100 text-lg">Admin Center</h1>
                <p className="text-[10px] text-amber-500 font-bold uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Terminal Console
                </p>
              </div>
            </div>

            <div className="h-[1px] bg-zinc-800/60" />

            <nav className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible no-scrollbar pb-2 lg:pb-0">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`w-full py-3 px-4 rounded-xl font-medium text-sm flex items-center gap-3 shrink-0 lg:shrink transition-all duration-200 text-left ${
                      active
                        ? 'bg-amber-500 text-zinc-950 font-bold shadow-lg shadow-amber-500/10'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="h-[1px] bg-zinc-800/60 hidden lg:block" />

            <div className="hidden lg:flex items-center justify-between text-[10px] font-bold text-zinc-500 uppercase">
              <span>Admin Logged In</span>
              <span className="text-emerald-500 font-mono">MJ-ABALLE</span>
            </div>
          </div>

          {/* Quick Stats Block inside Sidebar (Desktop only) */}
          <div className="glass p-6 rounded-3xl border border-zinc-800 hidden lg:flex flex-col gap-4">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <Sparkles size={12} className="text-amber-500" />
              Barber Shop Analytics
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400">Total Barbers</span>
                <span className="font-bold text-zinc-200">{employees.length}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400">Active Outlets</span>
                <span className="font-bold text-zinc-200">{branches.length}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400">Paid Transactions</span>
                <span className="font-bold text-emerald-400">
                  {transactions.filter(t => t.status === 'PAID').length}
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN PANEL CONTENT */}
        <section className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="h-full flex flex-col gap-6"
            >
              {/* Tab Title Block */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-black tracking-tight text-white uppercase">
                    {activeTab === 'sales' && 'Sales & Analytics'}
                    {activeTab === 'transactions' && 'Transactions Audit'}
                    {activeTab === 'employees' && 'Master Roster'}
                    {activeTab === 'branches' && 'Store Branches'}
                  </h2>
                  <p className="text-sm text-zinc-500">
                    {activeTab === 'sales' && 'Monitor revenue metrics, trends, and sales breakdowns.'}
                    {activeTab === 'transactions' && 'Audit client bookings, walk-in register, and statuses.'}
                    {activeTab === 'employees' && 'Manage barber staff, specialties, branches, and availability.'}
                    {activeTab === 'branches' && 'Manage branches, managers, physical chairs, and operations.'}
                  </p>
                </div>

                {/* Tab Header Action Buttons */}
                <div>
                  {activeTab === 'employees' && (
                    <button
                      onClick={() => setIsEmployeeModalOpen(true)}
                      className="px-5 py-2.5 bg-amber-500 text-zinc-950 font-bold rounded-xl flex items-center gap-2 hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/10 text-sm"
                    >
                      <Plus size={16} strokeWidth={2.5} />
                      Add Barber
                    </button>
                  )}
                  {activeTab === 'branches' && (
                    <button
                      onClick={() => setIsBranchModalOpen(true)}
                      className="px-5 py-2.5 bg-amber-500 text-zinc-950 font-bold rounded-xl flex items-center gap-2 hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/10 text-sm"
                    >
                      <Plus size={16} strokeWidth={2.5} />
                      Add Branch
                    </button>
                  )}
                </div>
              </div>

              {/* TAB CONTENT: SALES & ANALYTICS */}
              {activeTab === 'sales' && (
                <div className="space-y-6">
                  {/* Top Filters */}
                  <div className="glass p-4 rounded-2xl border border-zinc-800 flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex flex-wrap gap-3 items-center">
                      <Filter size={16} className="text-amber-500" />
                      <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Filters:</span>
                      
                      <select
                        value={salesBranchFilter}
                        onChange={(e) => setSalesBranchFilter(e.target.value)}
                        className="bg-zinc-900 border border-zinc-800 text-zinc-300 px-3 py-1.5 rounded-lg text-xs font-medium focus:outline-none focus:border-amber-500/50"
                      >
                        <option value="ALL">All Branches</option>
                        <option value="Downtown Main">Downtown Main</option>
                        <option value="Uptown Lounge">Uptown Lounge</option>
                        <option value="Northside Hub">Northside Hub</option>
                      </select>

                      <select
                        value={salesPaymentFilter}
                        onChange={(e) => setSalesPaymentFilter(e.target.value)}
                        className="bg-zinc-900 border border-zinc-800 text-zinc-300 px-3 py-1.5 rounded-lg text-xs font-medium focus:outline-none focus:border-amber-500/50"
                      >
                        <option value="ALL">All Payment Types</option>
                        <option value="Full">Full Amount Only</option>
                        <option value="Downpayment">Downpayments Only</option>
                      </select>
                    </div>

                    <button
                      onClick={() => {
                        setSalesBranchFilter('ALL');
                        setSalesPaymentFilter('ALL');
                        triggerToast('Analytics filters reset', 'info');
                      }}
                      className="text-xs text-zinc-500 hover:text-amber-500 flex items-center gap-1 font-bold uppercase transition-colors"
                    >
                      <RefreshCw size={12} />
                      Reset Filters
                    </button>
                  </div>

                  {/* Highlight Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="glass p-6 rounded-2xl border border-zinc-800 relative overflow-hidden group">
                      <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500 inline-block mb-4">
                        <DollarSign size={24} />
                      </div>
                      <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-1">Total Sales</p>
                      <h4 className="text-3xl font-black text-white">₱{stats.revenue.toLocaleString()}</h4>
                      <p className="text-[10px] text-emerald-500 font-bold mt-2 flex items-center gap-1">
                        <span>+12.4%</span>
                        <span className="text-zinc-500 font-normal">from last week</span>
                      </p>
                      <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors" />
                    </div>

                    <div className="glass p-6 rounded-2xl border border-zinc-800 relative overflow-hidden group">
                      <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 inline-block mb-4">
                        <ClipboardList size={24} />
                      </div>
                      <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-1">Total Bookings</p>
                      <h4 className="text-3xl font-black text-white">{stats.bookingsCount}</h4>
                      <p className="text-[10px] text-blue-400 font-bold mt-2 flex items-center gap-1">
                        <span>+8.2%</span>
                        <span className="text-zinc-500 font-normal">increased traffic</span>
                      </p>
                      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors" />
                    </div>

                    <div className="glass p-6 rounded-2xl border border-zinc-800 relative overflow-hidden group">
                      <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 inline-block mb-4">
                        <Users size={24} />
                      </div>
                      <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-1">Active Barbers</p>
                      <h4 className="text-3xl font-black text-white">{stats.activeBarbers}</h4>
                      <p className="text-[10px] text-zinc-500 font-semibold mt-2">
                        <span>{employees.filter(e => e.status === 'Busy').length} currently working</span>
                      </p>
                      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
                    </div>

                    <div className="glass p-6 rounded-2xl border border-zinc-800 relative overflow-hidden group">
                      <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400 inline-block mb-4">
                        <MapPin size={24} />
                      </div>
                      <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-1">Branches Open</p>
                      <h4 className="text-3xl font-black text-white">{stats.openBranches}</h4>
                      <p className="text-[10px] text-purple-400 font-bold mt-2">
                        <span>{branches.filter(b => b.status === 'Closed').length} closed for repair</span>
                      </p>
                      <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-colors" />
                    </div>
                  </div>

                  {/* Interactive Custom SVG Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* SVG Bar Chart for Monthly Sales */}
                    <div className="glass p-6 rounded-3xl border border-zinc-800 flex flex-col gap-6">
                      <div>
                        <h3 className="text-lg font-bold tracking-tight text-white">Monthly Revenue Breakdown</h3>
                        <p className="text-xs text-zinc-500">Estimates for current fiscal period in PHP (₱)</p>
                      </div>

                      {/* Bar chart visualizer */}
                      <div className="relative h-60 flex items-end justify-between pt-6 px-4">
                        {/* Y Axis Gridlines */}
                        <div className="absolute left-0 right-0 top-6 bottom-0 flex flex-col justify-between pointer-events-none">
                          {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="w-full border-t border-zinc-800/40 relative">
                              <span className="absolute -top-2 left-0 text-[8px] font-mono text-zinc-600">
                                {10000 - i * 2500}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Chart Bars */}
                        {[
                          { month: 'Jan', value: 8500, color: 'from-amber-600 to-amber-400' },
                          { month: 'Feb', value: 7200, color: 'from-amber-600 to-amber-400' },
                          { month: 'Mar', value: 9800, color: 'from-amber-600 to-amber-400' },
                          { month: 'Apr', value: 6500, color: 'from-amber-600 to-amber-400' },
                          { month: 'May', value: 8900, color: 'from-amber-600 to-amber-400' },
                          { month: 'Jun', value: stats.revenue * 0.9 + 4000, color: 'from-amber-500 to-amber-300 animate-pulse' }
                        ].map((item, index) => {
                          const percentage = Math.min((item.value / 10000) * 100, 100);
                          return (
                            <div key={item.month} className="flex flex-col items-center gap-2 flex-1 group z-10">
                              {/* Tooltip on Hover */}
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-950 border border-zinc-800 text-[10px] text-amber-500 font-bold px-2 py-1 rounded-md absolute mb-2 translate-y-[-50px] shadow-xl pointer-events-none">
                                ₱{Math.round(item.value).toLocaleString()}
                              </div>
                              {/* Bar container */}
                              <div className="w-8 sm:w-12 bg-zinc-900 rounded-lg overflow-hidden h-44 flex items-end border border-zinc-800/50">
                                <motion.div
                                  initial={{ height: 0 }}
                                  animate={{ height: `${percentage}%` }}
                                  transition={{ delay: index * 0.1, duration: 0.6 }}
                                  className={`w-full bg-gradient-to-t ${item.color} rounded-t-md`}
                                />
                              </div>
                              <span className="text-xs font-bold text-zinc-500">{item.month}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* SVG Line Chart for Weekly Active Bookings */}
                    <div className="glass p-6 rounded-3xl border border-zinc-800 flex flex-col gap-6">
                      <div>
                        <h3 className="text-lg font-bold tracking-tight text-white">Weekly Traffic Curve</h3>
                        <p className="text-xs text-zinc-500">Frequency profile of client appointments</p>
                      </div>

                      {/* SVG line chart */}
                      <div className="h-60 relative w-full flex flex-col justify-end">
                        {/* Weekly gridline markers */}
                        <div className="absolute left-0 right-0 top-6 bottom-0 flex flex-col justify-between pointer-events-none">
                          {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="w-full border-t border-zinc-800/30" />
                          ))}
                        </div>

                        {/* Interactive SVG Drawing */}
                        <svg className="w-full h-44 overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="gradient-area" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
                              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>

                          {/* Line Path */}
                          <motion.path
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1, ease: 'easeInOut' }}
                            d="M 5 70 Q 20 40 35 60 T 65 30 T 95 10"
                            fill="none"
                            stroke="#f59e0b"
                            strokeWidth="3"
                          />

                          {/* Shaded Area Under Line */}
                          <path
                            d="M 5 70 Q 20 40 35 60 T 65 30 T 95 10 L 95 100 L 5 100 Z"
                            fill="url(#gradient-area)"
                          />

                          {/* Circles/Dots on path */}
                          <circle cx="5" cy="70" r="3" fill="#18181b" stroke="#f59e0b" strokeWidth="2" />
                          <circle cx="20" cy="48" r="3" fill="#18181b" stroke="#f59e0b" strokeWidth="2" />
                          <circle cx="35" cy="60" r="3" fill="#18181b" stroke="#f59e0b" strokeWidth="2" />
                          <circle cx="50" cy="45" r="3" fill="#18181b" stroke="#f59e0b" strokeWidth="2" />
                          <circle cx="65" cy="30" r="3" fill="#18181b" stroke="#f59e0b" strokeWidth="2" />
                          <circle cx="80" cy="20" r="3" fill="#18181b" stroke="#f59e0b" strokeWidth="2" />
                          <circle cx="95" cy="10" r="3" fill="#18181b" stroke="#f59e0b" strokeWidth="2" />
                        </svg>

                        {/* X-axis labels */}
                        <div className="flex justify-between items-center px-2 pt-4 border-t border-zinc-800">
                          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                            <span key={day} className="text-[10px] font-bold text-zinc-500">{day}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB CONTENT: TRANSACTIONS AUDIT */}
              {activeTab === 'transactions' && (
                <div className="space-y-6">
                  {/* Search and Filters */}
                  <div className="glass p-4 rounded-2xl border border-zinc-800 flex flex-col md:flex-row gap-4 items-center justify-between">
                    
                    {/* Search Bar */}
                    <div className="relative w-full md:max-w-xs">
                      <Search size={16} className="text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search customer, ID, service..."
                        value={txSearch}
                        onChange={(e) => setTxSearch(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 pl-10 pr-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500 transition-colors"
                      />
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto no-scrollbar">
                      {['ALL', 'PAID', 'CHECKOUT', 'IN_CHAIR', 'DRAFT'].map((status) => (
                        <button
                          key={status}
                          onClick={() => setTxStatusFilter(status)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider shrink-0 transition-colors ${
                            txStatusFilter === status
                              ? 'bg-amber-500 text-zinc-950'
                              : 'bg-zinc-900/50 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                          }`}
                        >
                          {status === 'IN_CHAIR' ? 'In Chair' : status}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Transactions Table/List */}
                  <div className="glass rounded-3xl border border-zinc-800 overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-zinc-850 bg-zinc-900/30 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                            <th className="py-4 px-6">ID</th>
                            <th className="py-4 px-6">Client</th>
                            <th className="py-4 px-6">Service</th>
                            <th className="py-4 px-6">Branch</th>
                            <th className="py-4 px-6">Date / Time</th>
                            <th className="py-4 px-6">Amount</th>
                            <th className="py-4 px-6 text-center">Type</th>
                            <th className="py-4 px-6">Status</th>
                            <th className="py-4 px-6 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-900/50">
                          <AnimatePresence mode="popLayout">
                            {filteredTransactions.length === 0 ? (
                              <tr>
                                <td colSpan={9} className="py-12 text-center text-zinc-500 text-sm">
                                  No transactions found matching your criteria.
                                </td>
                              </tr>
                            ) : (
                              filteredTransactions.map((tx) => (
                                <motion.tr
                                  key={tx.id}
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  className="text-xs text-zinc-300 hover:bg-zinc-900/20 transition-colors"
                                >
                                  {/* ID */}
                                  <td className="py-4 px-6 font-mono font-bold text-amber-500">
                                    {tx.id}
                                  </td>
                                  
                                  {/* Client */}
                                  <td className="py-4 px-6 font-bold text-zinc-100">
                                    {tx.customerName}
                                  </td>
                                  
                                  {/* Service */}
                                  <td className="py-4 px-6">
                                    <div className="flex items-center gap-1.5">
                                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                      {tx.serviceName}
                                    </div>
                                  </td>
                                  
                                  {/* Branch */}
                                  <td className="py-4 px-6 font-medium text-zinc-400">
                                    {tx.branch}
                                  </td>

                                  {/* Date/Time */}
                                  <td className="py-4 px-6 font-mono text-[11px] text-zinc-500">
                                    {tx.date} <span className="text-zinc-600">@</span> {tx.time}
                                  </td>

                                  {/* Amount */}
                                  <td className="py-4 px-6 font-bold text-zinc-100">
                                    ₱{tx.price.toLocaleString()}
                                  </td>

                                  {/* Payment Type */}
                                  <td className="py-4 px-6 text-center">
                                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${
                                      tx.paymentType === 'Full' 
                                        ? 'bg-emerald-500/10 text-emerald-400' 
                                        : 'bg-blue-500/10 text-blue-400'
                                    }`}>
                                      {tx.paymentType}
                                    </span>
                                  </td>

                                  {/* Status */}
                                  <td className="py-4 px-6">
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase ${
                                      tx.status === 'PAID' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/10' :
                                      tx.status === 'CHECKOUT' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/10' :
                                      tx.status === 'IN_CHAIR' ? 'bg-blue-500/15 text-blue-400 border border-blue-500/10' :
                                      'bg-zinc-800 text-zinc-500 border border-zinc-700/50'
                                    }`}>
                                      <span className={`w-1 h-1 rounded-full ${
                                        tx.status === 'PAID' ? 'bg-emerald-400' :
                                        tx.status === 'CHECKOUT' ? 'bg-amber-400 animate-pulse' :
                                        tx.status === 'IN_CHAIR' ? 'bg-blue-400 animate-pulse' :
                                        'bg-zinc-500'
                                      }`} />
                                      {tx.status === 'IN_CHAIR' ? 'In Chair' : tx.status}
                                    </span>
                                  </td>

                                  {/* Actions */}
                                  <td className="py-4 px-6 text-right whitespace-nowrap">
                                    {tx.status !== 'PAID' ? (
                                      <button
                                        onClick={() => handleMarkPaid(tx.id)}
                                        className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 hover:text-emerald-300 transition-colors"
                                      >
                                        Mark Paid
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => handleRefund(tx.id)}
                                        className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-rose-400 transition-colors"
                                      >
                                        Refund
                                      </button>
                                    )}
                                  </td>
                                </motion.tr>
                              ))
                            )}
                          </AnimatePresence>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB CONTENT: EMPLOYEES */}
              {activeTab === 'employees' && (
                <div className="space-y-6">
                  {/* Grid layout of Barbers */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {employees.map((emp) => (
                      <div
                        key={emp.id}
                        className="glass p-6 rounded-3xl border border-zinc-800 flex flex-col gap-5 relative overflow-hidden group hover:border-amber-500/30 transition-all duration-300"
                      >
                        {/* Status Dot Top Right */}
                        <div className="absolute top-6 right-6">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase ${
                            emp.status === 'Available' ? 'bg-emerald-500/10 text-emerald-400' :
                            emp.status === 'Busy' ? 'bg-amber-500/10 text-amber-400' :
                            'bg-zinc-900 text-zinc-500 border border-zinc-800'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              emp.status === 'Available' ? 'bg-emerald-400' :
                              emp.status === 'Busy' ? 'bg-amber-400' :
                              'bg-zinc-500'
                            }`} />
                            {emp.status}
                          </span>
                        </div>

                        {/* Barber Info Profile */}
                        <div className="flex items-center gap-4">
                          <div className={`w-14 h-14 bg-gradient-to-br ${emp.avatarColor} rounded-2xl flex items-center justify-center font-black text-xl text-zinc-950 shadow-md`}>
                            {emp.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-base tracking-tight">{emp.name}</h3>
                            <p className="text-xs text-zinc-500">{emp.specialty}</p>
                          </div>
                        </div>

                        <div className="h-[1px] bg-zinc-850" />

                        {/* Details */}
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between items-center">
                            <span className="text-zinc-500">Branch Station:</span>
                            <span className="font-semibold text-zinc-300">{emp.branch}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-zinc-500">Performance:</span>
                            <span className="font-bold text-amber-500 flex items-center gap-1">
                              <Star size={12} className="fill-amber-500" />
                              {emp.rating.toFixed(1)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-zinc-500">Employee ID:</span>
                            <span className="font-mono text-[10px] text-zinc-500">{emp.id}</span>
                          </div>
                        </div>

                        {/* Action Toggle Availability */}
                        <button
                          onClick={() => handleToggleEmployeeStatus(emp.id)}
                          className="w-full py-2.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800/60 transition-colors text-zinc-300 hover:text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                        >
                          <RefreshCw size={12} />
                          Toggle Availability
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB CONTENT: BRANCHES */}
              {activeTab === 'branches' && (
                <div className="space-y-6">
                  {/* Branches cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {branches.map((b) => (
                      <div
                        key={b.id}
                        className={`glass p-6 rounded-3xl border transition-all duration-300 flex flex-col justify-between gap-6 relative group ${
                          b.status === 'Open' ? 'border-zinc-800 hover:border-amber-500/30' : 'border-zinc-800 opacity-60'
                        }`}
                      >
                        <div>
                          {/* Title Block */}
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="font-bold text-white text-lg tracking-tight uppercase">{b.name}</h3>
                              <span className="text-[10px] text-zinc-500 font-mono">{b.id}</span>
                            </div>
                            
                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase ${
                              b.status === 'Open' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                            }`}>
                              {b.status}
                            </span>
                          </div>

                          <div className="space-y-3 text-xs border-t border-zinc-850 pt-4">
                            <div className="flex items-start gap-2">
                              <MapPin size={14} className="text-amber-500 shrink-0 mt-0.5" />
                              <span className="text-zinc-400 leading-relaxed">{b.address}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-zinc-500">Manager:</span>
                              <span className="font-semibold text-zinc-300">{b.manager}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-zinc-500">Barber Chairs Available:</span>
                              <span className="font-bold text-zinc-200">{b.chairs} Stations</span>
                            </div>
                          </div>
                        </div>

                        {/* Action Toggle Branch Operation */}
                        <button
                          onClick={() => handleToggleBranchStatus(b.id)}
                          className={`w-full py-2.5 font-bold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 border transition-all ${
                            b.status === 'Open'
                              ? 'bg-zinc-900 border-zinc-800 hover:bg-rose-950/20 hover:border-rose-900/40 text-rose-400'
                              : 'bg-emerald-500 text-zinc-950 border-emerald-500 hover:bg-emerald-400'
                          }`}
                        >
                          {b.status === 'Open' ? 'Force Close Branch' : 'Activate Branch'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </section>
      </div>

      {/* MODALS */}
      {/* 1. Add Employee Modal */}
      <AnimatePresence>
        {isEmployeeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-zinc-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass p-8 rounded-[2rem] border border-zinc-800 max-w-md w-full shadow-2xl relative"
            >
              <button
                onClick={() => setIsEmployeeModalOpen(false)}
                className="absolute top-6 right-6 text-zinc-500 hover:text-zinc-200"
              >
                <XCircle size={24} />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
                  <Users size={20} />
                </div>
                <h3 className="text-xl font-bold tracking-tight text-white">Add Barber to Roster</h3>
              </div>

              <form onSubmit={handleAddEmployee} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
                    Barber Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Barber Luke"
                    value={newEmployee.name}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
                    Specialty
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Modern Fades & Grooming"
                    value={newEmployee.specialty}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, specialty: e.target.value }))}
                    className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
                    Assigned Branch
                  </label>
                  <select
                    value={newEmployee.branch}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, branch: e.target.value }))}
                    className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-amber-500"
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full py-3 bg-amber-500 hover:bg-amber-400 transition-colors text-zinc-950 font-black rounded-xl text-sm uppercase tracking-wider"
                  >
                    Add Barber & Generate Profile
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Add Branch Modal */}
      <AnimatePresence>
        {isBranchModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-zinc-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass p-8 rounded-[2rem] border border-zinc-800 max-w-md w-full shadow-2xl relative"
            >
              <button
                onClick={() => setIsBranchModalOpen(false)}
                className="absolute top-6 right-6 text-zinc-500 hover:text-zinc-200"
              >
                <XCircle size={24} />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
                  <MapPin size={20} />
                </div>
                <h3 className="text-xl font-bold tracking-tight text-white">Create New Branch</h3>
              </div>

              <form onSubmit={handleAddBranch} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
                    Branch Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Westside Parlor"
                    value={newBranch.name}
                    onChange={(e) => setNewBranch(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
                    Branch Address
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 789 Boulevard Rd, West Hub"
                    value={newBranch.address}
                    onChange={(e) => setNewBranch(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
                      Manager Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Nero Claudius"
                      value={newBranch.manager}
                      onChange={(e) => setNewBranch(prev => ({ ...prev, manager: e.target.value }))}
                      className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 px-3 py-2.5 rounded-xl text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
                      No. of Chairs
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={15}
                      value={newBranch.chairs}
                      onChange={(e) => setNewBranch(prev => ({ ...prev, chairs: Number(e.target.value) }))}
                      className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 px-3 py-2.5 rounded-xl text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full py-3 bg-amber-500 hover:bg-amber-400 transition-colors text-zinc-950 font-black rounded-xl text-sm uppercase tracking-wider"
                  >
                    Add Branch & Register Station
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </main>
  );
}
