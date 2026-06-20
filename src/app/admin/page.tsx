'use client';

import { useState, useEffect, useMemo } from 'react';
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
  AlertTriangle,
  Download,
  Crown
} from 'lucide-react';
import { getTransactions, updateTransaction, resetDatabase, DbTransaction, getEmployees, addEmployee, updateEmployee, DbEmployee } from '@/lib/trustLockDb';

// DbEmployee imported from trustLockDb

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
  
  // Modals
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  
  // Date filter state
  const [txDateFilter, setTxDateFilter] = useState('');
  const [exporting, setExporting] = useState(false);
  
  // Real-time local transactions queue
  const [transactions, setTransactions] = useState<DbTransaction[]>([]);

  // Toast notifications
  const [toasts, setToasts] = useState<Toast[]>([]);
  const triggerToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  // Poll transactions and employees from localStorage
  useEffect(() => {
    setTransactions(getTransactions());
    setEmployees(getEmployees());
    const interval = setInterval(() => {
      setTransactions(getTransactions());
      setEmployees(getEmployees());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Barbers Roster loaded from Db
  const [employees, setEmployees] = useState<DbEmployee[]>([]);

  // Hardcoded Branches Configuration
  const [branches, setBranches] = useState<Branch[]>([
    { id: 'BR-01', name: 'Downtown Main', address: '123 Heritage Way, Downtown District', manager: 'Marcus Aurelius', chairs: 5, status: 'Open' },
    { id: 'BR-02', name: 'Uptown Lounge', address: '456 Modern Ave, Suite A, Uptown', manager: 'Julius Caesar', chairs: 3, status: 'Open' },
    { id: 'BR-03', name: 'Northside Hub', address: '789 Industrial Rd, North Sector', manager: 'Augustus Octavian', chairs: 4, status: 'Closed' }
  ]);

  // Form states for adding items
  const [newEmployee, setNewEmployee] = useState({ name: '', username: '', password: '', specialty: '', branch: 'Downtown Main' });
  const [newBranch, setNewBranch] = useState({ name: '', address: '', manager: '', chairs: 3 });

  // Navigation Items
  const menuItems = [
    { id: 'sales', label: 'Sales & Analytics', icon: TrendingUp },
    { id: 'transactions', label: 'Transactions Audit', icon: ClipboardList },
    { id: 'employees', label: 'Employees Roster', icon: Users },
    { id: 'branches', label: 'Store Branches', icon: MapPin },
  ];

  const getTxTotalPrice = (tx: DbTransaction) => {
    if (tx.redeemedPoints) {
      return tx.selectedServices.reduce((sum, s, idx) => {
        if (idx === 0) return sum;
        return sum + s.price;
      }, 0);
    }
    return tx.selectedServices.reduce((sum, s) => sum + s.price, 0);
  };

  // Helper calculations for filtering transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const matchesSearch = tx.customerName.toLowerCase().includes(txSearch.toLowerCase()) ||
                            tx.id.toLowerCase().includes(txSearch.toLowerCase()) ||
                            tx.selectedServices.some(s => s.name.toLowerCase().includes(txSearch.toLowerCase()));
      
      const matchesStatus = txStatusFilter === 'ALL' || tx.status === txStatusFilter;
      const matchesDate = !txDateFilter || tx.date === txDateFilter;
      
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [transactions, txSearch, txStatusFilter, txDateFilter]);

  // Export handlers
  const handleExportCSV = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      
      const headers = ['Transaction ID', 'Client Name', 'Username', 'Services', 'Amount', 'Date', 'Time', 'Status'];
      const rows = filteredTransactions.map(tx => [
        tx.id,
        tx.customerName,
        tx.username,
        `"${tx.selectedServices.map(s => s.name).join(' + ')}"`,
        getTxTotalPrice(tx),
        tx.date,
        tx.time,
        tx.status
      ]);
      
      const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Pablings_Audit_Report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      triggerToast('Excel/CSV Report downloaded!', 'success');
    }, 1200);
  };

  const handleExportPDF = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      
      const printContent = `
        <html>
          <head>
            <title>Pablings Barbershop - Audit Report</title>
            <style>
              body { font-family: sans-serif; padding: 40px; color: #18181b; background-color: #ffffff; }
              h1 { border-bottom: 2px solid #f59e0b; padding-bottom: 10px; font-weight: 900; letter-spacing: -0.05em; }
              .meta { font-size: 12px; color: #71717a; margin-bottom: 30px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #e4e4e7; padding: 12px; text-align: left; font-size: 13px; }
              th { background-color: #f4f4f5; font-weight: bold; color: #27272a; text-transform: uppercase; font-size: 11px; letter-spacing: 0.05em; }
              tr:nth-child(even) { background-color: #fafafa; }
              .total { font-weight: bold; font-size: 16px; border-top: 2px solid #f59e0b; text-align: right; padding-top: 15px; margin-top: 20px; }
            </style>
          </head>
          <body>
            <h1>PABLINGS AUDIT REPORT</h1>
            <div class="meta">
              <p>Generated: ${new Date().toLocaleString()}</p>
              <p>Total Records: ${filteredTransactions.length}</p>
            </div>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Client</th>
                  <th>Grooming Services</th>
                  <th>Date & Time</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${filteredTransactions.map(tx => `
                  <tr>
                    <td style="font-family: monospace; font-weight: bold; color: #d97706;">${tx.id}</td>
                    <td><strong>${tx.customerName}</strong><br/>@${tx.username}</td>
                    <td>${tx.selectedServices.map(s => s.name).join(', ')}</td>
                    <td>${tx.date} ${tx.time}</td>
                    <td><span style="font-weight: bold; color: ${
                      tx.status === 'PAID' ? '#10b981' : 
                      tx.status === 'VOIDED' ? '#ef4444' : 
                      tx.status === 'IN_CHAIR' ? '#3b82f6' : 
                      tx.status === 'WAITING' ? '#8b5cf6' : 
                      '#f59e0b'
                    };">${tx.status}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div class="total">
              Gross Total: ₱${filteredTransactions.reduce((sum, tx) => sum + getTxTotalPrice(tx), 0)}
            </div>
          </body>
        </html>
      `;
      
      const win = window.open("", "_blank");
      if (win) {
        win.document.write(printContent);
        win.document.close();
        win.print();
      }
      triggerToast('PDF Audit Report sent to printer!', 'success');
    }, 1200);
  };

  // Filter transactions specifically for Sales Analytics
  const salesTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const matchesBranch = salesBranchFilter === 'ALL' || tx.assignedSeat?.startsWith(salesBranchFilter) || tx.selectedServices.length > 0; // standard fallback
      return matchesBranch;
    });
  }, [transactions, salesBranchFilter]);

  // Derive stats dynamically
  const stats = useMemo(() => {
    const totalSales = transactions
      .filter(tx => tx.status === 'PAID')
      .reduce((sum, tx) => sum + getTxTotalPrice(tx), 0);

    const totalBookings = transactions.length;
    const activeBarbers = employees.filter(e => e.status === 'Available').length;
    const openBranches = branches.filter(b => b.status === 'Open').length;

    return {
      revenue: totalSales,
      bookingsCount: totalBookings,
      activeBarbers,
      openBranches
    };
  }, [transactions, employees, branches]);

  // Actions
  const handleMarkPaid = (id: string) => {
    updateTransaction(id, { 
      status: 'PAID'
    });
    triggerToast(`Transaction ${id} marked as Paid!`, 'success');
  };

  const handleVoidSession = (id: string) => {
    updateTransaction(id, { status: 'VOIDED' });
    triggerToast(`Transaction ${id} flagged as Cancelled/Voided!`, 'error');
  };

  const handleToggleEmployeeStatus = (id: string) => {
    const emp = employees.find(e => e.id === id);
    if (!emp) return;

    const nextStatusMap: Record<'Available' | 'Busy' | 'Off-Duty', 'Available' | 'Busy' | 'Off-Duty'> = {
      'Available': 'Busy',
      'Busy': 'Off-Duty',
      'Off-Duty': 'Available'
    };
    const nextStatus = nextStatusMap[emp.status];
    updateEmployee(id, { status: nextStatus });
    setEmployees(getEmployees());
    triggerToast(`${emp.name} is now ${nextStatus}`, 'info');
  };

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmployee.name || !newEmployee.username || !newEmployee.specialty) {
      triggerToast('Please fill in all fields', 'error');
      return;
    }

    // Validate username ends with @barber
    let finalUsername = newEmployee.username.trim().toLowerCase();
    if (!finalUsername.endsWith('@barber')) {
      finalUsername += '@barber';
    }

    // Ensure uniqueness
    if (employees.some(e => e.username === finalUsername)) {
      triggerToast('Username is already taken by another barber', 'error');
      return;
    }

    const added = addEmployee({
      name: newEmployee.name,
      username: finalUsername,
      password: newEmployee.password || 'password',
      specialty: newEmployee.specialty,
      status: 'Available',
      branch: newEmployee.branch
    });

    setEmployees(getEmployees());
    setNewEmployee({ name: '', username: '', password: '', specialty: '', branch: 'Downtown Main' });
    setIsEmployeeModalOpen(false);
    triggerToast(`Added ${added.name} to roster!`, 'success');
  };

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

  const handleResetDemoDb = () => {
    if (confirm('Are you sure you want to reset all transactions, accounts, and point histories to the default demo state? This will also sign out active client sessions.')) {
      resetDatabase();
      localStorage.removeItem('pablings_current_user');
      setTransactions(getTransactions());
      triggerToast('Demo database reset successfully!', 'info');
    }
  };

  return (
    <main className="min-h-screen pt-24 pb-12 bg-zinc-950 text-zinc-100 flex flex-col relative overflow-hidden">
      <Navbar />

      {/* Background Decor */}
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
        
        {/* SIDEBAR */}
        <aside className="lg:w-80 w-full shrink-0 flex flex-col gap-6">
          <div className="glass p-6 rounded-3xl border border-zinc-800 flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl text-zinc-950">
                <Shield size={24} />
              </div>
              <div>
                <h1 className="font-bold tracking-tight text-zinc-100 text-lg">Owner Dashboard</h1>
                <p className="text-[10px] text-amber-500 font-bold uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Trust-Lock Audit Console
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
              <span>Security Hash</span>
              <span className="text-emerald-500 font-mono font-bold">LOCKED-PABLINGS</span>
            </div>

            <div className="h-[1px] bg-zinc-800/60 hidden lg:block" />

            <button
              onClick={handleResetDemoDb}
              className="w-full py-2.5 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-zinc-950 border border-rose-500/25 hover:border-rose-500 transition-all rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw size={12} />
              Reset Demo Database
            </button>
          </div>

          {/* Quick Metrics (Desktop only) */}
          <div className="glass p-6 rounded-3xl border border-zinc-800 hidden lg:flex flex-col gap-4">
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <Sparkles size={12} className="text-amber-500" />
              Anti-Fraud Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-500">Unverified Drafts</span>
                <span className="font-bold text-amber-500">
                  {transactions.filter(t => t.status === 'DRAFT').length} Sessions
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-500">In-Chair Active</span>
                <span className="font-bold text-blue-400">
                  {transactions.filter(t => t.status === 'IN_CHAIR').length} Chairs
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-500">Waiting Queue</span>
                <span className="font-bold text-purple-400">
                  {transactions.filter(t => t.status === 'WAITING').length} Clients
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-500">Voided / Cancelled</span>
                <span className="font-bold text-rose-500">
                  {transactions.filter(t => t.status === 'VOIDED').length} Sessions
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
              transition={{ duration: 0.2 }}
              className="h-full flex flex-col gap-6"
            >
              
              {/* Tab Title Area */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-black tracking-tight text-white uppercase">
                    {activeTab === 'sales' && 'Sales & Analytics'}
                    {activeTab === 'transactions' && 'Trust-Lock Audit Log'}
                    {activeTab === 'employees' && 'Barber Roster'}
                    {activeTab === 'branches' && 'Store Outlets'}
                  </h2>
                  <p className="text-xs text-zinc-500">
                    {activeTab === 'sales' && 'Real-time sales summaries and queue metrics.'}
                    {activeTab === 'transactions' && 'Digital audits of active, completed, and voided sessions.'}
                    {activeTab === 'employees' && 'Manage barber details, schedules, and active stations.'}
                    {activeTab === 'branches' && 'Configure and monitor shop branches and operational statuses.'}
                  </p>
                </div>

                {/* Header Action Button */}
                <div>
                  {activeTab === 'employees' && (
                    <button
                      onClick={() => setIsEmployeeModalOpen(true)}
                      className="px-5 py-2.5 bg-amber-500 text-zinc-950 font-bold rounded-xl flex items-center gap-2 hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/10 text-xs uppercase"
                    >
                      <Plus size={14} strokeWidth={3} />
                      Add Barber
                    </button>
                  )}
                  {activeTab === 'branches' && (
                    <button
                      onClick={() => setIsBranchModalOpen(true)}
                      className="px-5 py-2.5 bg-amber-500 text-zinc-950 font-bold rounded-xl flex items-center gap-2 hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/10 text-xs uppercase"
                    >
                      <Plus size={14} strokeWidth={3} />
                      Add Branch
                    </button>
                  )}
                </div>
              </div>

              {/* TAB CONTENT: SALES & ANALYTICS */}
              {activeTab === 'sales' && (
                <div className="space-y-6">
                  
                  {/* Branch selector */}
                  <div className="glass p-4 rounded-2xl border border-zinc-800 flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Filter size={16} className="text-amber-500" />
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Active Branch:</span>
                      <select
                        value={salesBranchFilter}
                        onChange={(e) => setSalesBranchFilter(e.target.value)}
                        className="bg-zinc-900 border border-zinc-800 text-zinc-300 px-3 py-1.5 rounded-lg text-xs font-semibold focus:outline-none focus:border-amber-500/50"
                      >
                        <option value="ALL">All Outlets</option>
                        <option value="Downtown Main">Downtown Main</option>
                        <option value="Uptown Lounge">Uptown Lounge</option>
                        <option value="Northside Hub">Northside Hub</option>
                      </select>
                    </div>
                  </div>

                  {/* Highlights Summary Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    
                    <div className="glass p-6 rounded-2xl border border-zinc-800 relative overflow-hidden group">
                      <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500 inline-block mb-4">
                        <DollarSign size={24} />
                      </div>
                      <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Gross Revenue</p>
                      <h4 className="text-3xl font-black text-white font-mono">₱{stats.revenue.toLocaleString()}</h4>
                      <p className="text-[10px] text-emerald-400 font-bold mt-2">
                        +14.6% <span className="text-zinc-500 font-normal">from last week</span>
                      </p>
                    </div>

                    <div className="glass p-6 rounded-2xl border border-zinc-800 relative overflow-hidden group">
                      <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 inline-block mb-4">
                        <ClipboardList size={24} />
                      </div>
                      <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Total Bookings</p>
                      <h4 className="text-3xl font-black text-white font-mono">{stats.bookingsCount}</h4>
                      <p className="text-[10px] text-blue-400 font-bold mt-2">
                        +{transactions.filter(t => t.status === 'DRAFT').length} pending check-in
                      </p>
                    </div>

                    <div className="glass p-6 rounded-2xl border border-zinc-800 relative overflow-hidden group">
                      <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 inline-block mb-4">
                        <Users size={24} />
                      </div>
                      <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Active Barbers</p>
                      <h4 className="text-3xl font-black text-white font-mono">{stats.activeBarbers}</h4>
                      <p className="text-[10px] text-zinc-500 font-semibold mt-2">
                        {employees.filter(e => e.status === 'Busy').length} styling clients right now
                      </p>
                    </div>

                    <div className="glass p-6 rounded-2xl border border-zinc-800 relative overflow-hidden group">
                      <div className="p-3 bg-rose-500/10 rounded-xl text-rose-400 inline-block mb-4">
                        <AlertTriangle size={24} />
                      </div>
                      <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Voided Sessions</p>
                      <h4 className="text-3xl font-black text-rose-500 font-mono">
                        {transactions.filter(t => t.status === 'VOIDED').length}
                      </h4>
                      <p className="text-[10px] text-zinc-500 font-semibold mt-2">
                        Locked and archived in logs
                      </p>
                    </div>

                  </div>

                  {/* SVG Line and Bar Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* SVG Bar Chart monthly revenue */}
                    <div className="glass p-6 rounded-3xl border border-zinc-800 flex flex-col gap-6">
                      <div>
                        <h3 className="text-base font-bold tracking-tight text-white uppercase">Monthly Revenue Breakdown</h3>
                        <p className="text-xs text-zinc-500">Estimates for current fiscal period in PHP (₱)</p>
                      </div>

                      <div className="relative h-60 flex items-end justify-between pt-6 px-4">
                        <div className="absolute left-0 right-0 top-6 bottom-0 flex flex-col justify-between pointer-events-none">
                          {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="w-full border-t border-zinc-800/30 relative">
                              <span className="absolute -top-2 left-0 text-[8px] font-mono text-zinc-600">
                                {10000 - i * 2500}
                              </span>
                            </div>
                          ))}
                        </div>

                        {[
                          { month: 'Jan', value: 8500 },
                          { month: 'Feb', value: 7200 },
                          { month: 'Mar', value: 9800 },
                          { month: 'Apr', value: 6500 },
                          { month: 'May', value: 8900 },
                          { month: 'Jun', value: Math.max(stats.revenue, 4500) }
                        ].map((item, index) => {
                          const percentage = Math.min((item.value / 10000) * 100, 100);
                          return (
                            <div key={item.month} className="flex flex-col items-center gap-2 flex-1 group z-10">
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-950 border border-zinc-800 text-[9px] text-amber-500 font-bold px-2 py-1 rounded-md absolute mb-2 translate-y-[-50px] shadow-xl pointer-events-none font-mono">
                                ₱{Math.round(item.value).toLocaleString()}
                              </div>
                              <div className="w-8 sm:w-12 bg-zinc-900 rounded-lg overflow-hidden h-44 flex items-end border border-zinc-800/40">
                                <motion.div
                                  initial={{ height: 0 }}
                                  animate={{ height: `${percentage}%` }}
                                  transition={{ delay: index * 0.05, duration: 0.5 }}
                                  className={`w-full bg-gradient-to-t from-amber-600 to-amber-400 rounded-t-md`}
                                />
                              </div>
                              <span className="text-[10px] font-bold text-zinc-500">{item.month}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* SVG Line Chart weekly traffic */}
                    <div className="glass p-6 rounded-3xl border border-zinc-800 flex flex-col gap-6">
                      <div>
                        <h3 className="text-base font-bold tracking-tight text-white uppercase">Weekly Traffic Curve</h3>
                        <p className="text-xs text-zinc-500">Frequency profile of client appointments</p>
                      </div>

                      <div className="h-60 relative w-full flex flex-col justify-end">
                        <div className="absolute left-0 right-0 top-6 bottom-0 flex flex-col justify-between pointer-events-none">
                          {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="w-full border-t border-zinc-800/30" />
                          ))}
                        </div>

                        <svg className="w-full h-44 overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="gradient-area-2" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
                              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>
                          
                          <motion.path
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.8 }}
                            d="M 5 70 Q 20 40 35 60 T 65 30 T 95 10"
                            fill="none"
                            stroke="#f59e0b"
                            strokeWidth="3"
                          />
                          <path
                            d="M 5 70 Q 20 40 35 60 T 65 30 T 95 10 L 95 100 L 5 100 Z"
                            fill="url(#gradient-area-2)"
                          />
                          <circle cx="5" cy="70" r="2.5" fill="#18181b" stroke="#f59e0b" strokeWidth="2" />
                          <circle cx="20" cy="48" r="2.5" fill="#18181b" stroke="#f59e0b" strokeWidth="2" />
                          <circle cx="35" cy="60" r="2.5" fill="#18181b" stroke="#f59e0b" strokeWidth="2" />
                          <circle cx="50" cy="45" r="2.5" fill="#18181b" stroke="#f59e0b" strokeWidth="2" />
                          <circle cx="65" cy="30" r="2.5" fill="#18181b" stroke="#f59e0b" strokeWidth="2" />
                          <circle cx="80" cy="20" r="2.5" fill="#18181b" stroke="#f59e0b" strokeWidth="2" />
                          <circle cx="95" cy="10" r="2.5" fill="#18181b" stroke="#f59e0b" strokeWidth="2" />
                        </svg>

                        <div className="flex justify-between items-center px-2 pt-4 border-t border-zinc-800">
                          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                            <span key={day} className="text-[9px] font-bold text-zinc-500">{day}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* TAB CONTENT: TRUST-LOCK AUDIT LOG */}
              {activeTab === 'transactions' && (
                <div className="space-y-6">
                  
                  {/* Search and status filters */}
                  <div className="flex flex-col gap-4">
                    <div className="glass p-4 rounded-2xl border border-zinc-800 flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
                      {/* Left side: Search & Date Filters */}
                      <div className="flex flex-col sm:flex-row gap-3 flex-1">
                        <div className="relative flex-1">
                          <Search size={16} className="text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            placeholder="Search client, ID, service..."
                            value={txSearch}
                            onChange={(e) => setTxSearch(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 pl-10 pr-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500 transition-colors"
                          />
                        </div>
                        <div className="relative">
                          <input
                            type="date"
                            value={txDateFilter}
                            onChange={(e) => setTxDateFilter(e.target.value)}
                            className="w-full sm:w-auto bg-zinc-900 border border-zinc-800 text-zinc-300 px-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500 transition-colors cursor-pointer"
                          />
                          {txDateFilter && (
                            <button
                              onClick={() => setTxDateFilter('')}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500 hover:text-amber-500 font-bold"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Right side: Export buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleExportCSV}
                          disabled={exporting}
                          className="flex-1 sm:flex-none px-4 py-2.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-200 hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                        >
                          <Download size={14} />
                          Excel/CSV
                        </button>
                        <button
                          onClick={handleExportPDF}
                          disabled={exporting}
                          className="flex-1 sm:flex-none px-4 py-2.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-200 hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                        >
                          <Download size={14} />
                          PDF
                        </button>
                      </div>
                    </div>

                    {/* Status tabs row */}
                    <div className="glass p-2.5 rounded-xl border border-zinc-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                      {['ALL', 'PAID', 'CHECKOUT', 'IN_CHAIR', 'WAITING', 'DRAFT', 'VOIDED'].map((status) => (
                        <button
                          key={status}
                          onClick={() => setTxStatusFilter(status)}
                          className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider shrink-0 transition-colors ${
                            txStatusFilter === status
                              ? 'bg-amber-500 text-zinc-950'
                              : 'bg-zinc-900/50 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                          }`}
                        >
                          {status === 'IN_CHAIR' ? 'In Chair' : status === 'VOIDED' ? 'Cancelled/Voided' : status === 'WAITING' ? 'Waiting' : status}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Audit Logs Table */}
                  <div className="glass rounded-3xl border border-zinc-800 overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-zinc-850 bg-zinc-900/30 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                            <th className="py-4 px-6">ID</th>
                            <th className="py-4 px-6">Client Profile</th>
                            <th className="py-4 px-6">Locked Services</th>
                            <th className="py-4 px-6">Station / Barber</th>
                            <th className="py-4 px-6">Amount</th>
                            <th className="py-4 px-6">Status</th>
                            <th className="py-4 px-6 text-right">Auditor Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-900/50">
                          <AnimatePresence mode="popLayout">
                            {filteredTransactions.length === 0 ? (
                              <tr>
                                <td colSpan={7} className="py-12 text-center text-zinc-500 text-xs">
                                  No transactions recorded in the audit ledger.
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
                                  <td className="py-4 px-6">
                                    <p className="font-bold text-zinc-100">{tx.customerName}</p>
                                    <p className="text-[9px] text-zinc-500 font-mono mt-0.5">@{tx.username}</p>
                                  </td>
                                  
                                  {/* Services */}
                                  <td className="py-4 px-6">
                                    <p className="font-bold text-zinc-200">
                                      {tx.selectedServices.map(s => s.name).join(' + ')}
                                    </p>
                                    <p className="text-[9px] text-zinc-500 mt-0.5">{tx.date} @ {tx.time}</p>
                                  </td>

                                  {/* Barber / Station */}
                                  <td className="py-4 px-6 font-medium text-zinc-400">
                                    {tx.assignedSeat ? (
                                      <span>{tx.assignedSeat} • {tx.assignedBarber}</span>
                                    ) : (
                                      <span className="text-zinc-600 italic">Unassigned</span>
                                    )}
                                  </td>

                                  {/* Amount */}
                                  <td className="py-4 px-6 font-mono text-zinc-100">
                                    <div className="flex flex-col">
                                      <span className="font-bold">₱{getTxTotalPrice(tx)}</span>
                                      {tx.redeemedPoints && (
                                        <span className="text-[8px] text-amber-500 font-black uppercase tracking-wider flex items-center gap-0.5 mt-1 shrink-0">
                                          <Crown size={8} className="animate-pulse" /> 200 PTS REDEEMED
                                        </span>
                                      )}
                                    </div>
                                  </td>

                                  {/* Status */}
                                  <td className="py-4 px-6">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase ${
                                      tx.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                      tx.status === 'CHECKOUT' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                      tx.status === 'IN_CHAIR' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                      tx.status === 'WAITING' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                                      tx.status === 'VOIDED' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse' :
                                      'bg-zinc-900 text-zinc-500 border border-zinc-800'
                                    }`}>
                                      <span className={`w-1.5 h-1.5 rounded-full ${
                                        tx.status === 'PAID' ? 'bg-emerald-400' :
                                        tx.status === 'CHECKOUT' ? 'bg-amber-400' :
                                        tx.status === 'IN_CHAIR' ? 'bg-blue-400' :
                                        tx.status === 'WAITING' ? 'bg-purple-400' :
                                        tx.status === 'VOIDED' ? 'bg-rose-400' :
                                        'bg-zinc-500'
                                      }`} />
                                      {tx.status === 'IN_CHAIR' ? 'In Chair' : tx.status === 'VOIDED' ? 'Cancelled' : tx.status === 'WAITING' ? 'Waiting' : tx.status}
                                    </span>
                                  </td>

                                  {/* Actions */}
                                  <td className="py-4 px-6 text-right whitespace-nowrap">
                                    {tx.status === 'CHECKOUT' && (
                                      <button
                                        onClick={() => handleMarkPaid(tx.id)}
                                        className="text-[9px] font-black uppercase tracking-widest text-emerald-400 hover:text-emerald-300 transition-colors"
                                      >
                                        Force Post Paid
                                      </button>
                                    )}
                                    {tx.status === 'IN_CHAIR' && (
                                      <button
                                        onClick={() => handleVoidSession(tx.id)}
                                        className="text-[9px] font-black uppercase tracking-widest text-rose-400 hover:text-rose-300 transition-colors"
                                      >
                                        Void Session
                                      </button>
                                    )}
                                    {(tx.status === 'PAID' || tx.status === 'DRAFT' || tx.status === 'WAITING') && (
                                      <span className="text-[9px] font-bold text-zinc-600 uppercase">Audit Locked</span>
                                    )}
                                    {tx.status === 'VOIDED' && (
                                      <span className="text-[9px] font-bold text-rose-500 uppercase flex items-center justify-end gap-1">
                                        <AlertTriangle size={10} /> Fraud Alert
                                      </span>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {employees.map((emp) => (
                      <div
                        key={emp.id}
                        className="glass p-6 rounded-3xl border border-zinc-800 flex flex-col gap-5 relative overflow-hidden group hover:border-amber-500/30 transition-all duration-300"
                      >
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

                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between items-center">
                            <span className="text-zinc-500">Branch Station:</span>
                            <span className="font-semibold text-zinc-300">{emp.branch}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-zinc-500">Performance Rating:</span>
                            <span className="font-bold text-amber-500 flex items-center gap-1">
                              <Star size={12} className="fill-amber-500" />
                              {emp.rating.toFixed(1)}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleToggleEmployeeStatus(emp.id)}
                          className="w-full py-2.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800/60 transition-colors text-zinc-300 hover:text-white font-bold rounded-xl text-[10px] uppercase tracking-wider flex items-center justify-center gap-2"
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {branches.map((b) => (
                      <div
                        key={b.id}
                        className={`glass p-6 rounded-3xl border transition-all duration-300 flex flex-col justify-between gap-6 relative group ${
                          b.status === 'Open' ? 'border-zinc-800 hover:border-amber-500/30' : 'border-zinc-800 opacity-60'
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="font-bold text-white text-lg tracking-tight uppercase">{b.name}</h3>
                              <span className="text-[9px] text-zinc-500 font-mono">{b.id}</span>
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
                              <span className="text-zinc-500">Outlet Manager:</span>
                              <span className="font-semibold text-zinc-300">{b.manager}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-zinc-500">Active Stations:</span>
                              <span className="font-bold text-zinc-200">{b.chairs} Chairs</span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleToggleBranchStatus(b.id)}
                          className={`w-full py-2.5 font-bold rounded-xl text-[10px] uppercase tracking-wider flex items-center justify-center gap-2 border transition-all ${
                            b.status === 'Open'
                              ? 'bg-zinc-900 border-zinc-800 hover:bg-rose-950/20 hover:border-rose-900/40 text-rose-400'
                              : 'bg-emerald-500 text-zinc-950 border-emerald-500 hover:bg-emerald-400'
                          }`}
                        >
                          {b.status === 'Open' ? 'Force Close Outlet' : 'Activate Outlet'}
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-zinc-950/85 backdrop-blur-sm">
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
                <h3 className="text-xl font-bold tracking-tight text-white uppercase">Add Barber to Roster</h3>
              </div>

              <form onSubmit={handleAddEmployee} className="space-y-4">
                <div>
                  <label className="block text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
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
                  <label className="block text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
                    Username / ID (e.g., mark@barber)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. luke@barber"
                    value={newEmployee.username}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, username: e.target.value.toLowerCase() }))}
                    className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
                    Login Password
                  </label>
                  <input
                    type="password"
                    placeholder="Defaults to 'password'"
                    value={newEmployee.password || ''}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
                    Specialty
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Modern Fades & Creative Styling"
                    value={newEmployee.specialty}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, specialty: e.target.value }))}
                    className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
                    Assigned Outlet
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
                    className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 transition-colors text-zinc-950 font-black rounded-xl text-xs uppercase tracking-wider"
                  >
                    Register Barber & Generate Profile
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-zinc-950/85 backdrop-blur-sm">
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
                <h3 className="text-xl font-bold tracking-tight text-white uppercase">Register New Branch</h3>
              </div>

              <form onSubmit={handleAddBranch} className="space-y-4">
                <div>
                  <label className="block text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
                    Branch Outlet Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Westside Lounge"
                    value={newBranch.name}
                    onChange={(e) => setNewBranch(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
                    Address Location
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
                    <label className="block text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
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
                    <label className="block text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
                      No. of Active Chairs
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
                    className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 transition-colors text-zinc-950 font-black rounded-xl text-xs uppercase tracking-wider"
                  >
                    Add Outlet & Launch Stations
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
