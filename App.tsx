
import React, { useState, useEffect, useRef } from 'react';
import Layout from './components/Layout';
import ClockingSystem from './components/ClockingSystem';
import StatsCard from './components/StatsCard';
import { Employee, AttendanceRecord, PayrollRecord, View, LeaveRequest, LeaveBalance } from './types';
import { MOCK_EMPLOYEES, DEPARTMENTS } from './constants';
import { 
  Users, 
  Clock, 
  Wallet, 
  Zap, 
  ChevronRight,
  BrainCircuit,
  X,
  ShieldCheck,
  Building2,
  TrendingUp,
  Mail,
  Phone,
  Briefcase,
  Banknote,
  UserCheck,
  UserX,
  Save,
  ChevronDown,
  UserPlus,
  Camera,
  Upload,
  AlertCircle,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2
} from 'lucide-react';
import { getHRInsights } from './services/geminiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const ScreenLoader: React.FC<{ message?: string }> = ({ message = "Syncing Records..." }) => (
  <div className="fixed inset-0 z-[200] bg-[#0f172a] flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
    <div className="absolute top-0 left-0 w-full h-1 lg:h-1.5 overflow-hidden bg-white/5">
      <div className="h-full bg-blue-600 animate-[loading-bar_1.5s_infinite_linear]"></div>
    </div>
    
    <div className="relative mb-8">
      <div className="w-20 h-20 lg:w-24 lg:h-24 bg-blue-600 rounded-[1.5rem] lg:rounded-[2rem] flex items-center justify-center shadow-2xl shadow-blue-500/20 animate-pulse">
        <span className="text-white font-black text-3xl lg:text-4xl tracking-tighter">P</span>
      </div>
      <div className="absolute -inset-4 border-2 border-blue-500/20 rounded-[2rem] lg:rounded-[2.5rem] animate-[ping_2s_infinite]"></div>
    </div>

    <div className="flex flex-col items-center gap-2 text-center">
      <h2 className="text-white font-black text-[10px] lg:text-xs uppercase tracking-[0.3em] lg:tracking-[0.5em] animate-pulse">
        {message}
      </h2>
      <div className="flex gap-1 mt-2">
        <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce"></div>
      </div>
    </div>
    
    <div className="absolute bottom-12 text-slate-600 font-bold text-[8px] lg:text-[9px] uppercase tracking-[0.4em] text-center px-4">
      Pakque Secure Protocol • v4.2.1
    </div>

    <style>{`
      @keyframes loading-bar {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
    `}</style>
  </div>
);

const App: React.FC = () => {
  // Auth State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Main App State
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [isScreenLoading, setIsScreenLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [payroll, setPayroll] = useState<PayrollRecord[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [activeClockIn, setActiveClockIn] = useState<string | null>(null);
  const [aiInsight, setAiInsight] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Modals / Selection
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [newEmployee, setNewEmployee] = useState<Employee | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Utility to format currency consistently as ZAR
  const formatZAR = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  useEffect(() => {
    // Check Auth session
    const authSession = localStorage.getItem('pakque_auth');
    if (authSession === 'true') {
      setIsLoggedIn(true);
    }
    setAuthLoading(false);

    const savedEmp = localStorage.getItem('pakque_employees');
    const savedAtt = localStorage.getItem('pakque_attendance');
    const savedPay = localStorage.getItem('pakque_payroll');
    const savedLeave = localStorage.getItem('pakque_leave');
    const savedBalances = localStorage.getItem('pakque_balances');
    
    if (savedEmp) setEmployees(JSON.parse(savedEmp));
    if (savedAtt) setAttendance(JSON.parse(savedAtt));
    if (savedPay) setPayroll(JSON.parse(savedPay));
    if (savedLeave) setLeaveRequests(JSON.parse(savedLeave));
    
    if (savedBalances) {
      setLeaveBalances(JSON.parse(savedBalances));
    } else {
      const initialBalances = MOCK_EMPLOYEES.map(e => ({
        employeeId: e.id,
        vacation: 15,
        sick: 10,
        personal: 5
      }));
      setLeaveBalances(initialBalances);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      localStorage.setItem('pakque_employees', JSON.stringify(employees));
      localStorage.setItem('pakque_attendance', JSON.stringify(attendance));
      localStorage.setItem('pakque_payroll', JSON.stringify(payroll));
      localStorage.setItem('pakque_leave', JSON.stringify(leaveRequests));
      localStorage.setItem('pakque_balances', JSON.stringify(leaveBalances));
    }
  }, [employees, attendance, payroll, leaveRequests, leaveBalances, isLoggedIn]);

  const handleViewChange = (newView: View) => {
    if (newView === activeView) return;
    setIsScreenLoading(true);
    setTimeout(() => {
      setActiveView(newView);
      setIsScreenLoading(false);
    }, 850);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    if (loginEmail === 'admin@pakque.hr' && loginPassword === 'password') {
      setIsScreenLoading(true);
      setTimeout(() => {
        setIsLoggedIn(true);
        localStorage.setItem('pakque_auth', 'true');
        setIsScreenLoading(false);
      }, 1200);
    } else if (loginEmail && loginPassword.length >= 6) {
      setIsScreenLoading(true);
      setTimeout(() => {
        setIsLoggedIn(true);
        localStorage.setItem('pakque_auth', 'true');
        setIsScreenLoading(false);
      }, 1200);
    } else {
      setLoginError('Invalid credentials. Access Denied.');
    }
  };

  const handleLogout = () => {
    setIsScreenLoading(true);
    setTimeout(() => {
      setIsLoggedIn(false);
      localStorage.removeItem('pakque_auth');
      setLoginEmail('');
      setLoginPassword('');
      setIsScreenLoading(false);
    }, 1000);
  };

  const handleClockIn = (location?: { lat: number; lng: number }) => {
    const startTime = new Date().toISOString();
    setIsClockedIn(true);
    setActiveClockIn(startTime);
    setAttendance(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      employeeId: 'EMP001',
      date: new Date().toLocaleDateString(),
      clockIn: startTime,
      location,
      status: 'present'
    }]);
  };

  const handleClockOut = () => {
    const endTime = new Date().toISOString();
    setIsClockedIn(false);
    const start = activeClockIn ? new Date(activeClockIn) : new Date();
    setAttendance(prev => prev.map(rec => rec.clockIn === activeClockIn ? { ...rec, clockOut: endTime } : rec));
    
    const hours = (new Date(endTime).getTime() - start.getTime()) / (1000 * 60 * 60);
    const emp = employees.find(e => e.id === 'EMP001') || employees[0];
    const gross = hours * emp.hourlyRate;
    
    setPayroll(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      employeeId: emp.id,
      department: emp.department,
      month: new Date().toLocaleString('default', { month: 'long' }),
      year: new Date().getFullYear(),
      grossPay: gross,
      deductions: gross * 0.18,
      netPay: gross * 0.82,
      status: 'pending',
      hoursWorked: hours
    }]);
    setActiveClockIn(null);
  };

  const openEmployeeDetail = (emp: Employee) => {
    setSelectedEmployee(emp);
    setIsDetailModalOpen(true);
  };

  const openEmployeeEdit = (emp: Employee) => {
    setEditingEmployee({ ...emp });
    setIsEditModalOpen(true);
  };

  const handleUpdateEmployee = () => {
    if (!editingEmployee) return;
    setEmployees(prev => prev.map(e => e.id === editingEmployee.id ? editingEmployee : e));
    setSelectedEmployee(editingEmployee);
    setIsEditModalOpen(false);
  };

  const handleAddEmployee = () => {
    if (!newEmployee || !newEmployee.name || !newEmployee.email) return;
    setEmployees(prev => [...prev, newEmployee]);
    setIsAddModalOpen(false);
    setNewEmployee(null);
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>, isEditing: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (isEditing && editingEmployee) {
        setEditingEmployee({ ...editingEmployee, avatar: base64String });
      } else if (!isEditing && newEmployee) {
        setNewEmployee({ ...newEmployee, avatar: base64String });
      }
    };
    reader.readAsDataURL(file);
  };

  const renderLogin = () => (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0f172a] p-4 lg:p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[400px] lg:w-[800px] h-[400px] lg:h-[800px] bg-blue-600/10 rounded-full -mr-48 -mt-48 blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-[300px] lg:w-[600px] h-[300px] lg:h-[600px] bg-emerald-600/5 rounded-full -ml-24 -mb-24 blur-3xl"></div>
      
      <div className="w-full max-w-lg z-10 animate-in fade-in zoom-in duration-700">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] lg:rounded-[3rem] p-8 lg:p-12 shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600"></div>
          
          <div className="flex flex-col items-center mb-8 lg:mb-12">
            <div className="w-16 h-16 lg:w-20 lg:h-20 bg-blue-600 rounded-[1.5rem] lg:rounded-[2rem] flex items-center justify-center shadow-2xl shadow-blue-500/40 mb-4 lg:mb-6 transform hover:rotate-6 transition-transform">
              <span className="text-white font-black text-3xl lg:text-4xl tracking-tighter">P</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tighter uppercase mb-2">PAKQUE</h1>
            <p className="text-[10px] text-blue-400 font-bold uppercase tracking-[0.2em] flex items-center gap-2">
              <ShieldCheck size={12} /> Strategic Resource Portal
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 lg:space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Authorized Email</label>
              <div className="relative group">
                <Mail size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="email" 
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="admin@pakque.hr"
                  className="w-full bg-white/5 border-2 border-white/5 rounded-xl lg:rounded-2xl px-12 lg:px-14 py-4 lg:py-5 text-sm lg:text-base text-white font-bold outline-none focus:border-blue-600 focus:bg-white/10 transition-all placeholder:text-slate-600"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Encrypted Password</label>
              <div className="relative group">
                <Lock size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border-2 border-white/5 rounded-xl lg:rounded-2xl px-12 lg:px-14 py-4 lg:py-5 text-sm lg:text-base text-white font-bold outline-none focus:border-blue-600 focus:bg-white/10 transition-all placeholder:text-slate-600"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {loginError && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 lg:p-4 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-3">
                <AlertCircle size={14} /> {loginError}
              </div>
            )}

            <button 
              type="submit"
              className="w-full bg-blue-600 text-white py-4 lg:py-6 rounded-xl lg:rounded-2xl font-black text-[10px] lg:text-xs uppercase tracking-[0.3em] shadow-2xl shadow-blue-500/30 hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group mt-2"
            >
              Authorize Access <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-8 lg:mt-12 pt-6 lg:pt-8 border-t border-white/5 flex flex-col items-center gap-4">
             <p className="text-[9px] lg:text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed text-center max-w-xs">
               Secured by Pakque Protocols. Unauthorized access attempt is logged.
             </p>
          </div>
        </div>
        
        <p className="text-center text-slate-600 font-bold text-[8px] lg:text-[10px] uppercase tracking-[0.4em] mt-6 lg:mt-8">
          © {new Date().getFullYear()} Pakque Strategic Partners
        </p>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="space-y-6 lg:space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-2xl lg:text-4xl font-black text-slate-900 tracking-tighter uppercase leading-tight">Strategic Command</h2>
          <p className="text-slate-500 mt-1 lg:mt-2 font-medium text-xs lg:text-sm flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-500" /> Pakque HR Partner monitoring active.
          </p>
        </div>
        <button 
          onClick={async () => { 
            setIsAnalyzing(true); 
            setAiInsight(await getHRInsights(employees, attendance, payroll)); 
            setIsAnalyzing(false); 
          }}
          className="w-full sm:w-auto bg-[#0f172a] text-white px-6 lg:px-8 py-3 lg:py-4 rounded-xl lg:rounded-2xl flex items-center justify-center gap-3 hover:bg-black font-black text-[10px] lg:text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95 group"
        >
          {isAnalyzing ? <Zap size={16} className="animate-pulse text-blue-400" /> : <BrainCircuit size={16} className="text-blue-400 group-hover:rotate-12 transition-transform" />}
          AI Workforce Audit
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
        <StatsCard label="Active Assets" value={employees.filter(e => e.isActive).length} trend="+2 growth" trendUp icon={Users} color="bg-blue-600" />
        <StatsCard label="Labour Pulse" value="Healthy" trend="Risk: Low" trendUp={false} icon={TrendingUp} color="bg-indigo-700" />
        <StatsCard label="Monthly Payout" value={formatZAR(payroll.reduce((a,c) => a+c.netPay, 0))} trend="Target: -R2k" trendUp icon={Wallet} color="bg-emerald-600" />
        <StatsCard label="Uptime Sync" value="100%" trend="Real-time" trendUp icon={Zap} color="bg-amber-500" />
      </div>

      {aiInsight && (
        <div className="bg-[#0f172a] text-white p-6 lg:p-10 rounded-[1.5rem] lg:rounded-[2.5rem] shadow-2xl relative overflow-hidden border border-white/5">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
          <BrainCircuit className="absolute -right-8 -bottom-8 lg:-right-12 lg:-bottom-12 w-48 h-48 lg:w-64 lg:h-64 opacity-[0.03] rotate-12" />
          <h3 className="text-base lg:text-xl font-black mb-4 lg:mb-6 flex items-center gap-3 tracking-tighter uppercase">
            <Zap size={20} className="text-blue-400 fill-blue-400" /> Pakque Strategic Insight
          </h3>
          <p className="text-slate-300 leading-relaxed whitespace-pre-wrap font-medium opacity-90 text-sm lg:text-lg italic relative z-10">
            "{aiInsight}"
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 bg-white p-6 lg:p-10 rounded-[1.5rem] lg:rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
          <h3 className="font-black text-slate-400 text-[9px] lg:text-[10px] uppercase tracking-[0.4em] mb-6 lg:mb-12">Resource Allocation</h3>
          <div className="h-64 lg:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DEPARTMENTS.slice(0, 4).map(d => ({ name: d, amount: payroll.filter(p => p.department === d).reduce((a,c) => a+c.netPay, 0) }))}>
                <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 900, fill: '#64748b'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9, fill: '#94a3b8'}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}} 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}} 
                  formatter={(value: number) => [formatZAR(value), 'Allocation']}
                />
                <Bar dataKey="amount" radius={[8, 8, 0, 0]} barSize={40}>
                   {DEPARTMENTS.slice(0, 4).map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={['#2563eb', '#4f46e5', '#059669', '#d97706'][index % 4]} />
                   ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 lg:p-10 rounded-[1.5rem] lg:rounded-[2.5rem] border border-slate-200 shadow-sm">
          <h3 className="font-black text-slate-400 text-[9px] lg:text-[10px] uppercase tracking-[0.4em] mb-6 lg:mb-12">Personnel Queue</h3>
          <div className="space-y-6 lg:space-y-8">
            {employees.slice(0, 5).map(emp => (
              <div key={emp.id} className="flex items-center justify-between group cursor-pointer" onClick={() => openEmployeeDetail(emp)}>
                <div className="flex items-center gap-4 lg:gap-5">
                  <div className="relative shrink-0">
                    <img src={emp.avatar || 'https://via.placeholder.com/100?text=NA'} className="w-10 h-10 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl object-cover border-2 border-slate-50 shadow-md group-hover:border-blue-500 transition-all" />
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${emp.isActive ? 'bg-emerald-500' : 'bg-slate-300'} border-2 border-white rounded-full`}></div>
                  </div>
                  <div>
                    <p className="text-xs lg:text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">{emp.name}</p>
                    <p className="text-[9px] lg:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{emp.department}</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAddEmployeeModal = () => {
    if (!newEmployee) return null;
    const e = newEmployee;

    return (
      <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-[120] flex items-center justify-center p-2 sm:p-4">
        <div className="bg-white w-full max-w-4xl rounded-[2rem] lg:rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-300">
          <div className="p-6 lg:p-10 flex justify-between items-center border-b border-slate-100 shrink-0">
            <div>
              <h3 className="text-xl lg:text-3xl font-black text-slate-900 tracking-tighter uppercase leading-tight">Register New Asset</h3>
              <p className="text-emerald-600 font-bold text-[9px] lg:text-xs uppercase tracking-widest mt-1 flex items-center gap-2">
                <UserPlus size={12} /> Onboarding Protocol
              </p>
            </div>
            <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-900 transition-colors p-2 rounded-full hover:bg-slate-100">
              <X size={24} className="lg:hidden" /><X size={32} className="hidden lg:block" />
            </button>
          </div>

          <div className="p-6 lg:p-10 overflow-y-auto flex-1 custom-scrollbar">
            <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
              <div className="flex flex-col items-center gap-6 shrink-0 md:w-48">
                <h4 className="text-[10px] lg:text-[11px] font-black text-slate-900 uppercase tracking-[0.3em] self-start border-l-4 border-emerald-600 pl-4 mb-2">Visual Bio</h4>
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                   <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-[2rem] lg:rounded-[2.5rem] bg-slate-100 border-4 border-white shadow-2xl overflow-hidden flex items-center justify-center group-hover:opacity-90 transition-all">
                      {e.avatar ? <img src={e.avatar} className="w-full h-full object-cover" /> : <Users size={32} className="text-slate-300 lg:scale-150" />}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Upload className="text-white" size={24} />
                      </div>
                   </div>
                   <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(ev) => handleAvatarFileChange(ev, false)} />
                </div>
                
                <div className="w-full space-y-4">
                  <button onClick={() => fileInputRef.current?.click()} className="w-full bg-slate-100 text-slate-700 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-200 transition-all">
                    <Camera size={14} /> Upload Portrait
                  </button>

                  <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-100">
                    <label className="text-[9px] font-black uppercase text-slate-500 mb-2 block text-center">Status</label>
                    <div className="flex gap-2">
                      <button onClick={() => setNewEmployee({...e, isActive: true})} className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${e.isActive ? 'bg-emerald-600 text-white' : 'bg-white text-slate-400'}`}>Active</button>
                      <button onClick={() => setNewEmployee({...e, isActive: false})} className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${!e.isActive ? 'bg-slate-400 text-white' : 'bg-white text-slate-400'}`}>Off</button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 pb-8">
                <div className="space-y-6">
                  <h4 className="text-[10px] lg:text-[11px] font-black text-slate-900 uppercase tracking-[0.3em] mb-4 border-l-4 border-emerald-600 pl-4">Asset Identity</h4>
                  <div className="space-y-4 lg:space-y-5">
                    <div>
                      <label className="text-[10px] lg:text-[11px] font-black uppercase text-slate-700 ml-1 mb-1 lg:mb-2 block">Full Legal Name</label>
                      <input type="text" placeholder="Johnathan Smith" value={e.name} onChange={(ev) => setNewEmployee({...e, name: ev.target.value})} className="w-full bg-slate-50 border-2 border-slate-200 px-4 lg:px-6 py-3 lg:py-4 rounded-xl lg:rounded-2xl text-sm lg:text-base font-bold text-slate-900 outline-none transition-all shadow-sm focus:border-emerald-600 focus:bg-white" />
                    </div>
                    <div>
                      <label className="text-[10px] lg:text-[11px] font-black uppercase text-slate-700 ml-1 mb-1 lg:mb-2 block">Assigned Role</label>
                      <input type="text" placeholder="Project Director" value={e.role} onChange={(ev) => setNewEmployee({...e, role: ev.target.value})} className="w-full bg-slate-50 border-2 border-slate-200 px-4 lg:px-6 py-3 lg:py-4 rounded-xl lg:rounded-2xl text-sm lg:text-base font-bold text-slate-900 outline-none transition-all shadow-sm focus:border-emerald-600 focus:bg-white" />
                    </div>
                    <div className="grid grid-cols-2 gap-3 lg:gap-4">
                      <div>
                        <label className="text-[10px] lg:text-[11px] font-black uppercase text-slate-700 ml-1 mb-1 lg:mb-2 block">Rate (ZAR)</label>
                        <div className="relative">
                          <span className="absolute left-3 lg:left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">R</span>
                          <input type="number" value={e.hourlyRate} onChange={(ev) => setNewEmployee({...e, hourlyRate: Number(ev.target.value)})} className="w-full bg-slate-50 border-2 border-slate-200 pl-8 lg:pl-10 pr-4 lg:pr-6 py-3 lg:py-4 rounded-xl lg:rounded-2xl text-sm lg:text-base font-bold text-slate-900 outline-none shadow-sm focus:border-emerald-600 focus:bg-white" />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] lg:text-[11px] font-black uppercase text-slate-700 ml-1 mb-1 lg:mb-2 block">Unit</label>
                        <div className="relative">
                          <select value={e.department} onChange={(ev) => setNewEmployee({...e, department: ev.target.value})} className="w-full bg-slate-50 border-2 border-slate-200 px-4 lg:px-6 py-3 lg:py-4 rounded-xl lg:rounded-2xl text-xs lg:text-base font-bold text-slate-900 appearance-none shadow-sm cursor-pointer outline-none focus:border-emerald-600 focus:bg-white">
                            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                          <ChevronDown size={16} className="absolute right-3 lg:right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h4 className="text-[10px] lg:text-[11px] font-black text-slate-900 uppercase tracking-[0.3em] mb-4 border-l-4 border-emerald-600 pl-4">Relay Protocols</h4>
                  <div className="space-y-4 lg:space-y-5">
                    <div>
                      <label className="text-[10px] lg:text-[11px] font-black uppercase text-slate-700 ml-1 mb-1 lg:mb-2 block">Email Address</label>
                      <input type="email" placeholder="name@pakque.hr" value={e.email} onChange={(ev) => setNewEmployee({...e, email: ev.target.value})} className="w-full bg-slate-50 border-2 border-slate-200 px-4 lg:px-6 py-3 lg:py-4 rounded-xl lg:rounded-2xl text-sm lg:text-base font-bold text-slate-900 outline-none shadow-sm focus:border-emerald-600 focus:bg-white" />
                    </div>
                    <div>
                      <label className="text-[10px] lg:text-[11px] font-black uppercase text-slate-700 ml-1 mb-1 lg:mb-2 block">Contact Phone</label>
                      <input type="text" placeholder="+27 00 000-0000" value={e.phone} onChange={(ev) => setNewEmployee({...e, phone: ev.target.value})} className="w-full bg-slate-50 border-2 border-slate-200 px-4 lg:px-6 py-3 lg:py-4 rounded-xl lg:rounded-2xl text-sm lg:text-base font-bold text-slate-900 outline-none shadow-sm focus:border-emerald-600 focus:bg-white" />
                    </div>
                    <div className="bg-emerald-50/50 p-4 lg:p-6 rounded-2xl lg:rounded-3xl border-2 border-emerald-100 space-y-4">
                      <p className="text-[10px] lg:text-[11px] font-black uppercase text-emerald-700 tracking-widest flex items-center gap-2">
                        <ShieldCheck size={12} /> Emergency Liaison
                      </p>
                      <div className="space-y-3">
                        <input placeholder="Contact Name" value={e.emergencyContact.name} onChange={(ev) => setNewEmployee({...e, emergencyContact: {...e.emergencyContact, name: ev.target.value}})} className="w-full bg-white border-2 border-emerald-100 px-4 py-2 lg:py-3 rounded-xl text-xs lg:text-sm font-bold text-slate-900 outline-none focus:border-emerald-500" />
                        <input placeholder="Phone Protocol" value={e.emergencyContact.phone} onChange={(ev) => setNewEmployee({...e, emergencyContact: {...e.emergencyContact, phone: ev.target.value}})} className="w-full bg-white border-2 border-emerald-100 px-4 py-2 lg:py-3 rounded-xl text-xs lg:text-sm font-bold text-slate-900 outline-none focus:border-emerald-500" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 lg:p-10 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-3 lg:gap-4 shrink-0">
            <button onClick={handleAddEmployee} disabled={!e.name || !e.email} className="flex-1 bg-emerald-600 text-white py-4 lg:py-5 rounded-xl lg:rounded-2xl font-black text-[11px] lg:text-sm uppercase tracking-[0.2em] shadow-xl hover:bg-emerald-700 disabled:opacity-50 transition-all flex items-center justify-center gap-3 active:scale-[0.98]">
              <UserPlus size={18} /> Create Asset
            </button>
            <button onClick={() => setIsAddModalOpen(false)} className="px-8 lg:px-10 bg-white border-2 border-slate-200 text-slate-600 py-4 lg:py-5 rounded-xl lg:rounded-2xl font-black text-[11px] lg:text-sm uppercase tracking-[0.2em] hover:bg-slate-100 transition-all active:scale-[0.98]">
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderEditEmployeeModal = () => {
    if (!editingEmployee) return null;
    const e = editingEmployee;

    return (
      <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-[120] flex items-center justify-center p-2 sm:p-4">
        <div className="bg-white w-full max-w-4xl rounded-[2rem] lg:rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-300">
          <div className="p-6 lg:p-10 flex justify-between items-center border-b border-slate-100 shrink-0">
            <div>
              <h3 className="text-xl lg:text-3xl font-black text-slate-900 tracking-tighter uppercase leading-tight">Edit Asset Record</h3>
              <p className="text-blue-600 font-bold text-[9px] lg:text-xs uppercase tracking-widest mt-1 flex items-center gap-2">
                <ShieldCheck size={12} /> Secure Modification
              </p>
            </div>
            <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-900 transition-colors p-2 rounded-full hover:bg-slate-100">
              <X size={24} className="lg:hidden" /><X size={32} className="hidden lg:block" />
            </button>
          </div>

          <div className="p-6 lg:p-10 overflow-y-auto flex-1 custom-scrollbar">
             <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
              <div className="flex flex-col items-center gap-6 shrink-0 md:w-48">
                <h4 className="text-[10px] lg:text-[11px] font-black text-slate-900 uppercase tracking-[0.3em] self-start border-l-4 border-blue-600 pl-4 mb-2">Visual Bio</h4>
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                   <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-[2rem] lg:rounded-[2.5rem] bg-slate-100 border-4 border-white shadow-2xl overflow-hidden flex items-center justify-center group-hover:opacity-90 transition-all">
                      {e.avatar ? <img src={e.avatar} className="w-full h-full object-cover" /> : <Users size={32} className="text-slate-300 lg:scale-150" />}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Upload className="text-white" size={24} />
                      </div>
                   </div>
                   <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(ev) => handleAvatarFileChange(ev, true)} />
                </div>
                <div className="w-full space-y-4">
                  <button onClick={() => fileInputRef.current?.click()} className="w-full bg-slate-100 text-slate-700 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-200 transition-all">
                    <Camera size={14} /> Update Portrait
                  </button>
                  <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-100">
                    <label className="text-[9px] font-black uppercase text-slate-500 mb-2 block text-center">Employment</label>
                    <div className="flex gap-2">
                      <button onClick={() => setEditingEmployee({...e, isActive: true})} className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${e.isActive ? 'bg-blue-600 text-white' : 'bg-white text-slate-400'}`}>Active</button>
                      <button onClick={() => setEditingEmployee({...e, isActive: false})} className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${!e.isActive ? 'bg-slate-400 text-white' : 'bg-white text-slate-400'}`}>Off</button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 pb-8">
                <div className="space-y-6">
                  <h4 className="text-[10px] lg:text-[11px] font-black text-slate-900 uppercase tracking-[0.3em] mb-4 border-l-4 border-blue-600 pl-4">Identity Matrix</h4>
                  <div className="space-y-4 lg:space-y-5">
                    <div>
                      <label className="text-[10px] lg:text-[11px] font-black uppercase text-slate-700 ml-1 mb-1 block">Full Legal Name</label>
                      <input type="text" value={e.name} onChange={(ev) => setEditingEmployee({...e, name: ev.target.value})} className="w-full bg-slate-50 border-2 border-slate-200 px-4 lg:px-6 py-3 lg:py-4 rounded-xl lg:rounded-2xl text-sm lg:text-base font-bold text-slate-900 outline-none transition-all shadow-sm focus:border-blue-600 focus:bg-white" />
                    </div>
                    <div>
                      <label className="text-[10px] lg:text-[11px] font-black uppercase text-slate-700 ml-1 mb-1 block">Strategic Role</label>
                      <input type="text" value={e.role} onChange={(ev) => setEditingEmployee({...e, role: ev.target.value})} className="w-full bg-slate-50 border-2 border-slate-200 px-4 lg:px-6 py-3 lg:py-4 rounded-xl lg:rounded-2xl text-sm lg:text-base font-bold text-slate-900 outline-none transition-all shadow-sm focus:border-blue-600 focus:bg-white" />
                    </div>
                    <div className="grid grid-cols-2 gap-3 lg:gap-4">
                      <div>
                        <label className="text-[10px] lg:text-[11px] font-black uppercase text-slate-700 ml-1 mb-1 block">Rate (ZAR)</label>
                        <div className="relative">
                          <span className="absolute left-3 lg:left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">R</span>
                          <input type="number" value={e.hourlyRate} onChange={(ev) => setEditingEmployee({...e, hourlyRate: Number(ev.target.value)})} className="w-full bg-slate-50 border-2 border-slate-200 pl-8 lg:pl-10 pr-4 lg:pr-6 py-3 lg:py-4 rounded-xl lg:rounded-2xl text-sm lg:text-base font-bold text-slate-900 outline-none focus:border-blue-600" />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] lg:text-[11px] font-black uppercase text-slate-700 ml-1 mb-1 block">Department</label>
                        <div className="relative">
                          <select value={e.department} onChange={(ev) => setEditingEmployee({...e, department: ev.target.value})} className="w-full bg-slate-50 border-2 border-slate-200 px-4 lg:px-6 py-3 lg:py-4 rounded-xl lg:rounded-2xl text-xs lg:text-base font-bold text-slate-900 appearance-none focus:border-blue-600">
                            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h4 className="text-[10px] lg:text-[11px] font-black text-slate-900 uppercase tracking-[0.3em] mb-4 border-l-4 border-blue-600 pl-4">Relay Protocols</h4>
                  <div className="space-y-4 lg:space-y-5">
                    <div>
                      <label className="text-[10px] lg:text-[11px] font-black uppercase text-slate-700 ml-1 mb-1 block">Email Address</label>
                      <input type="email" value={e.email} onChange={(ev) => setEditingEmployee({...e, email: ev.target.value})} className="w-full bg-slate-50 border-2 border-slate-200 px-4 lg:px-6 py-3 lg:py-4 rounded-xl lg:rounded-2xl text-sm lg:text-base font-bold text-slate-900 outline-none focus:border-blue-600" />
                    </div>
                    <div>
                      <label className="text-[10px] lg:text-[11px] font-black uppercase text-slate-700 ml-1 mb-1 block">Phone Number</label>
                      <input type="text" value={e.phone} onChange={(ev) => setEditingEmployee({...e, phone: ev.target.value})} className="w-full bg-slate-50 border-2 border-slate-200 px-4 lg:px-6 py-3 lg:py-4 rounded-xl lg:rounded-2xl text-sm lg:text-base font-bold text-slate-900 outline-none focus:border-blue-600" />
                    </div>
                    <div className="bg-blue-50/50 p-4 lg:p-6 rounded-2xl lg:rounded-3xl border-2 border-blue-100 space-y-4">
                      <p className="text-[10px] lg:text-[11px] font-black uppercase text-blue-700 tracking-widest flex items-center gap-2">
                        <AlertCircle size={12} /> Emergency Contact
                      </p>
                      <div className="space-y-3">
                        <input placeholder="Contact Name" value={e.emergencyContact.name} onChange={(ev) => setEditingEmployee({...e, emergencyContact: {...e.emergencyContact, name: ev.target.value}})} className="w-full bg-white border-2 border-blue-100 px-4 py-2 lg:py-3 rounded-xl text-xs lg:text-sm font-bold text-slate-900 focus:border-blue-500 outline-none" />
                        <input placeholder="Phone Protocol" value={e.emergencyContact.phone} onChange={(ev) => setEditingEmployee({...e, emergencyContact: {...e.emergencyContact, phone: ev.target.value}})} className="w-full bg-white border-2 border-blue-100 px-4 py-2 lg:py-3 rounded-xl text-xs lg:text-sm font-bold text-slate-900 focus:border-blue-500 outline-none" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 lg:p-10 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-3 lg:gap-4 shrink-0">
            <button onClick={handleUpdateEmployee} className="flex-1 bg-[#0f172a] text-white py-4 lg:py-5 rounded-xl lg:rounded-2xl font-black text-[11px] lg:text-sm uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3 active:scale-[0.98]">
              <Save size={18} /> Commit to Vault
            </button>
            <button onClick={() => setIsEditModalOpen(false)} className="px-8 lg:px-10 bg-white border-2 border-slate-200 text-slate-600 py-4 lg:py-5 rounded-xl lg:rounded-2xl font-black text-[11px] lg:text-sm uppercase tracking-[0.2em] hover:bg-slate-100 transition-all active:scale-[0.98]">
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderEmployeeDetailModal = () => {
    if (!selectedEmployee) return null;
    const emp = selectedEmployee;

    return (
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[110] flex items-center justify-center p-2 sm:p-4">
        <div className="bg-white w-full max-w-3xl rounded-[2rem] lg:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-300 relative">
          <button onClick={() => setIsDetailModalOpen(false)} className="absolute top-4 lg:top-8 right-4 lg:right-8 text-slate-400 hover:text-slate-900 transition-colors p-2 rounded-full hover:bg-slate-100 z-20">
            <X size={24} className="lg:hidden" /><X size={32} className="hidden lg:block" />
          </button>

          <div className="p-6 lg:p-12 border-b border-slate-100 flex flex-col md:flex-row items-center gap-6 lg:gap-10 shrink-0">
            <div className="relative shrink-0">
              <img src={emp.avatar || 'https://via.placeholder.com/100?text=NA'} className="w-24 h-24 lg:w-40 lg:h-40 rounded-[1.5rem] lg:rounded-[2.5rem] object-cover border-4 border-white shadow-2xl" />
              <div className={`absolute -bottom-2 -right-2 lg:-bottom-3 lg:-right-3 ${emp.isActive ? 'bg-emerald-500' : 'bg-slate-400'} text-white px-3 lg:px-5 py-1.5 lg:py-2 rounded-xl lg:rounded-2xl text-[8px] lg:text-[10px] font-black uppercase tracking-widest shadow-xl border-2 lg:border-4 border-white`}>
                {emp.isActive ? 'Active' : 'Offline'}
              </div>
            </div>
            <div className="text-center md:text-left flex-1">
              <div className="flex flex-col md:flex-row items-center gap-2 lg:gap-4">
                <h3 className="text-2xl lg:text-4xl font-black text-slate-900 tracking-tighter leading-tight">{emp.name}</h3>
                <span className="text-blue-600 bg-blue-50 px-3 py-1 rounded-lg text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em]">{emp.id}</span>
              </div>
              <p className="text-sm lg:text-lg font-bold text-slate-500 mt-1 lg:mt-2">{emp.role} • <span className="text-blue-600">{emp.department}</span></p>
              <div className="flex flex-wrap justify-center md:justify-start gap-3 lg:gap-4 mt-4 lg:mt-6">
                <button onClick={() => openEmployeeEdit(emp)} className="flex items-center gap-2 bg-[#0f172a] text-white px-5 lg:px-6 py-2.5 lg:py-3 rounded-xl font-black text-[9px] lg:text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-lg">Edit Record</button>
                <button className="flex items-center gap-2 border-2 border-slate-200 text-slate-600 px-5 lg:px-6 py-2.5 lg:py-3 rounded-xl font-black text-[9px] lg:text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all">Analytics</button>
              </div>
            </div>
          </div>

          <div className="p-6 lg:p-12 grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 overflow-y-auto flex-1 custom-scrollbar">
            <div className="space-y-6 lg:space-y-8">
              <div>
                <h4 className="text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Core Identification</h4>
                <div className="space-y-3 lg:space-y-4">
                  <div className="flex items-center gap-4 text-slate-800 font-bold"><Mail size={16} className="text-blue-600" /><span className="text-xs lg:text-sm truncate">{emp.email}</span></div>
                  <div className="flex items-center gap-4 text-slate-800 font-bold"><Phone size={16} className="text-blue-600" /><span className="text-xs lg:text-sm">{emp.phone}</span></div>
                  <div className="flex items-center gap-4 text-slate-800 font-bold"><Clock size={16} className="text-blue-600" /><span className="text-xs lg:text-sm italic">Joined {new Date(emp.hireDate).toLocaleDateString()}</span></div>
                </div>
              </div>

              <div className="bg-slate-50 p-5 lg:p-6 rounded-2xl lg:rounded-3xl border-2 border-slate-100">
                <h4 className="text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 lg:mb-4">Capital Allocation</h4>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 lg:w-10 lg:h-10 bg-emerald-100 text-emerald-600 rounded-lg lg:rounded-xl flex items-center justify-center"><Banknote size={18} /></div>
                    <span className="text-xl lg:text-2xl font-black text-slate-900">{formatZAR(emp.hourlyRate)}</span>
                  </div>
                  <span className="text-[8px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest">Hourly Rate</span>
                </div>
              </div>
            </div>

            <div className="space-y-6 lg:space-y-8 pb-4">
              <div className="bg-blue-600 p-6 lg:p-8 rounded-[1.5rem] lg:rounded-[2.5rem] shadow-xl text-white relative overflow-hidden">
                <ShieldCheck size={80} className="absolute -right-6 -bottom-6 opacity-10 rotate-12" />
                <h4 className="text-[9px] lg:text-[10px] font-black text-white/60 uppercase tracking-[0.3em] mb-4 lg:mb-6">Emergency Relay</h4>
                <div className="space-y-3 lg:space-y-4 relative z-10">
                  <div><p className="text-[8px] lg:text-[10px] font-black uppercase tracking-widest text-white/50 mb-0.5 lg:mb-1">Contact Name</p><p className="text-base lg:text-lg font-black">{emp.emergencyContact.name}</p></div>
                  <div><p className="text-[8px] lg:text-[10px] font-black uppercase tracking-widest text-white/50 mb-0.5 lg:mb-1">Phone Protocol</p><p className="text-base lg:text-lg font-black">{emp.emergencyContact.phone}</p></div>
                  <div><p className="text-[8px] lg:text-[10px] font-black uppercase tracking-widest text-white/50 mb-0.5 lg:mb-1">Relationship</p><span className="inline-block px-2 lg:px-3 py-1 bg-white/10 rounded-lg text-[8px] lg:text-[10px] font-black uppercase tracking-widest mt-1">{emp.emergencyContact.relationship}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (authLoading) return <ScreenLoader message="Authenticating Vault..." />;
  
  return (
    <>
      {isScreenLoading && <ScreenLoader message={activeView === 'dashboard' ? 'Syncing Center...' : 'Initializing...'} />}
      
      {!isLoggedIn ? renderLogin() : (
        <Layout activeView={activeView} onViewChange={handleViewChange} onLogout={handleLogout}>
          {activeView === 'dashboard' && renderDashboard()}
          {activeView === 'attendance' && (
            <div className="max-w-2xl mx-auto space-y-6 lg:space-y-10 animate-in slide-in-from-bottom-8 duration-700">
              <ClockingSystem isClockedIn={isClockedIn} startTime={activeClockIn || undefined} onClockIn={handleClockIn} onClockOut={handleClockOut} />
              <div className="bg-white rounded-[1.5rem] lg:rounded-[2.5rem] border border-slate-200 shadow-sm p-6 lg:p-10 overflow-hidden">
                <h3 className="font-black text-slate-900 mb-6 lg:mb-8 flex items-center gap-3 text-lg lg:text-xl tracking-tight"><Clock size={20} className="text-blue-600" /> Logged Sessions</h3>
                <div className="space-y-3 lg:space-y-4">
                  {attendance.length > 0 ? (
                    attendance.slice(-5).reverse().map(a => (
                      <div key={a.id} className="flex justify-between items-center p-4 lg:p-6 bg-slate-50 rounded-xl lg:rounded-[1.5rem] border border-slate-100">
                        <span className="font-black text-slate-900 text-[10px] lg:text-xs uppercase tracking-widest">{a.date}</span>
                        <div className="flex gap-6 lg:gap-12">
                          <div className="flex flex-col text-right"><span className="text-[8px] lg:text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Start</span><span className="text-xs lg:text-sm font-black text-slate-900">{new Date(a.clockIn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></div>
                          <div className="flex flex-col text-right min-w-[60px]"><span className="text-[8px] lg:text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Finish</span><span className="text-xs lg:text-sm font-black text-slate-900">{a.clockOut ? new Date(a.clockOut).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : <span className="text-blue-600 animate-pulse">LIVE</span>}</span></div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-20 text-center opacity-30 font-black text-[10px] uppercase tracking-widest italic">No active sessions logged for current cycle.</div>
                  )}
                </div>
              </div>
            </div>
          )}
          {activeView === 'employees' && (
            <div className="space-y-6 lg:space-y-10 animate-in slide-in-from-left-4 lg:slide-in-from-left-8 duration-700">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-0.5 lg:space-y-1">
                  <h2 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tighter uppercase leading-tight">Resource Directory</h2>
                  <p className="text-slate-500 font-medium text-xs lg:text-sm">Managing {employees.length} active and historic units.</p>
                </div>
                <button 
                  onClick={() => {
                    setNewEmployee({
                      id: `EMP${String(employees.length + 1).padStart(3, '0')}`,
                      name: '', email: '', phone: '', role: '', department: DEPARTMENTS[0],
                      hireDate: new Date().toISOString().split('T')[0],
                      emergencyContact: { name: '', phone: '', relationship: 'Other' },
                      hourlyRate: 0, avatar: '', isActive: true
                    });
                    setIsAddModalOpen(true);
                  }}
                  className="w-full sm:w-auto bg-blue-600 text-white px-6 lg:px-8 py-3 lg:py-4 rounded-xl lg:rounded-2xl font-black text-[10px] lg:text-xs uppercase tracking-widest shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3"
                >
                  <UserPlus size={16} /> Register Asset
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 pb-8">
                {employees.map(emp => (
                  <div key={emp.id} onClick={() => openEmployeeDetail(emp)} className={`bg-white p-6 lg:p-8 rounded-[1.5rem] lg:rounded-[2.5rem] border-2 ${emp.isActive ? 'border-slate-100' : 'border-slate-50 opacity-80'} shadow-sm hover:shadow-xl hover:border-blue-200 transition-all cursor-pointer flex gap-5 lg:gap-8 group relative overflow-hidden`}>
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${emp.isActive ? 'bg-blue-600' : 'bg-slate-300'}`}></div>
                    <div className="relative shrink-0">
                      <img src={emp.avatar || 'https://via.placeholder.com/100?text=NA'} className={`w-16 h-16 lg:w-28 lg:h-28 rounded-xl lg:rounded-[2rem] object-cover shadow-xl border-2 border-white transition-transform duration-500 ${!emp.isActive && 'grayscale'}`} />
                      <div className={`absolute -bottom-1 -right-1 p-1 lg:p-1.5 rounded-lg lg:rounded-xl border-2 lg:border-4 border-white shadow-lg ${emp.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`}>
                        {emp.isActive ? <UserCheck size={12} className="text-white" /> : <UserX size={12} className="text-white" />}
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col justify-center min-w-0">
                      <div className="flex justify-between items-start mb-1 lg:mb-2">
                        <div className="min-w-0">
                          <h4 className="text-base lg:text-2xl font-black text-slate-900 tracking-tighter truncate group-hover:text-blue-600 transition-colors leading-tight">{emp.name}</h4>
                          <div className="flex items-center gap-2 mt-1.5 lg:mt-3">
                            <span className={`px-2 py-0.5 lg:px-3 lg:py-1 rounded-lg text-[8px] lg:text-[10px] font-black uppercase tracking-wider ${emp.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>{emp.isActive ? 'Active' : 'Off'}</span>
                            <span className="bg-blue-50 text-blue-600 px-2 py-0.5 lg:px-3 lg:py-1 rounded-lg text-[8px] lg:text-[10px] font-black uppercase tracking-wider">{emp.id}</span>
                          </div>
                        </div>
                        <div className="hidden sm:block text-right">
                          <p className="text-xs font-black text-slate-900">{formatZAR(emp.hourlyRate)}</p>
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Per Hour</p>
                        </div>
                      </div>
                      <div className="space-y-1.5 mt-2 lg:mt-4">
                        <div className="flex items-center gap-2 text-slate-700"><Briefcase size={12} className="text-blue-500" /><p className="text-[10px] lg:text-sm font-black uppercase truncate">{emp.role}</p></div>
                        <div className="flex items-center gap-2 text-slate-500"><Building2 size={12} className="text-slate-400" /><p className="text-[9px] lg:text-xs font-bold uppercase truncate">{emp.department}</p></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {(activeView === 'payroll' || activeView === 'leave' || activeView === 'reports') && (
            <div className="flex items-center justify-center py-24 lg:py-40 flex-col text-slate-400 animate-pulse text-center px-4">
               <AlertCircle size={48} className="mb-4 lg:mb-6 opacity-20 lg:size-64" />
               <p className="text-[10px] lg:text-sm font-black uppercase tracking-[0.2em] lg:tracking-widest opacity-40 leading-relaxed">System Node Initializing...<br/>Strategic Data Mapping in Progress</p>
            </div>
          )}

          {isDetailModalOpen && renderEmployeeDetailModal()}
          {isEditModalOpen && renderEditEmployeeModal()}
          {isAddModalOpen && renderAddEmployeeModal()}
        </Layout>
      )}
    </>
  );
};

export default App;
