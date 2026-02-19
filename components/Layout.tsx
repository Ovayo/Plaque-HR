
import React from 'react';
import { View } from '../types';
import { 
  LayoutDashboard, 
  Clock, 
  CreditCard, 
  Users, 
  CalendarDays,
  BarChart3,
  Bell,
  Search,
  LogOut,
  Shield
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeView: View;
  onViewChange: (view: View) => void;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, onViewChange, onLogout }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'attendance', label: 'Attendance', icon: Clock },
    { id: 'payroll', label: 'Payroll', icon: CreditCard },
    { id: 'leave', label: 'Leave Mgmt', icon: CalendarDays },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'employees', label: 'Employees', icon: Users },
  ] as const;

  return (
    <div className="flex h-screen bg-[#f1f5f9] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-[#0f172a] border-r border-slate-800 flex flex-col shadow-2xl z-20">
        <div className="p-10 border-b border-white/5">
          <div className="flex items-center gap-4 group cursor-pointer" onClick={() => onViewChange('dashboard')}>
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 transform group-hover:rotate-12 transition-transform duration-300">
              <span className="text-white font-black text-2xl tracking-tighter">P</span>
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tighter">PAKQUE</h1>
              <p className="text-[9px] text-blue-400 font-bold uppercase tracking-widest leading-none mt-1">HR & LABOUR</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-1.5 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                activeView === item.id
                  ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/50 scale-[1.02]'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon size={20} strokeWidth={activeView === item.id ? 2.5 : 2} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-white/5 bg-black/20">
          <div 
            onClick={onLogout}
            className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl cursor-pointer transition-all duration-300 group"
          >
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-bold uppercase tracking-widest">Logout</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-10 z-10 shadow-sm">
          <div className="relative w-[450px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search personnel, records, data..."
              className="w-full pl-12 pr-6 py-2.5 bg-slate-100/50 border border-slate-200/50 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
            />
          </div>

          <div className="flex items-center gap-6">
            <button className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-2xl relative transition-all active:scale-95">
              <Bell size={22} />
              <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-slate-200 mx-1"></div>
            <div className="flex items-center gap-4 group cursor-pointer">
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">Admin Portal</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Strategic Director</p>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 border-2 border-white shadow-lg flex items-center justify-center text-white font-black text-xs group-hover:scale-110 transition-transform">AD</div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 bg-[#f8fafc] custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
