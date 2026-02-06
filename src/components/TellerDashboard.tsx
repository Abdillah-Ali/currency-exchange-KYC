import { useState, useEffect } from 'react';
import { QueueEntry, Teller } from '@/lib/types';
import { getCurrencyByCode, formatNumber, formatCurrency } from '@/lib/mockData';
import { ExchangeRatesBoard } from '@/components/ExchangeRatesBoard';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Phone,
  AlertTriangle,
  Printer,
  ArrowRightLeft,
  UserCheck,
  Banknote,
  Shield,
  TrendingUp,
  LayoutDashboard,
  ListOrdered,
  History,
  Settings,
  LogOut,
  ChevronRight,
  Search
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

type TabType = 'active' | 'queue' | 'history' | 'rates';

export function TellerDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [currentCustomer, setCurrentCustomer] = useState<QueueEntry | null>(null);
  const [stats, setStats] = useState({ completed: 0, waiting: 0, avgWait: 0 });
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(savedUser));
  }, [navigate]);

  const fetchQueue = async () => {
    try {
      const response = await fetch('/api/queue/list', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        // ... mappedQueue logic ...
        const mappedQueue: QueueEntry[] = data.map((item: any) => ({
          id: item.id.toString(),
          queueNumber: item.ticket_number,
          transactionType: item.service_type,
          currencyCode: item.currency_code,
          amount: parseFloat(item.requested_amount),
          status: item.status,
          customer: {
            fullName: item.full_name,
            phoneNumber: item.phone_number,
            idType: item.id_type,
            idNumber: item.id_number,
          },
          exchangeRate: 1,
          localAmount: 0,
          createdAt: new Date(),
        }));
        setQueue(mappedQueue);
        setStats(prev => ({ ...prev, waiting: mappedQueue.filter(q => q.status === 'waiting').length }));
      }
    } catch (e) {
      console.error('Fetch queue error:', e);
    }
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCallNext = async () => {
    if (currentCustomer) {
      toast.error('Please complete current transaction first');
      return;
    }

    try {
      const response = await fetch('/api/teller/call-next', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ teller_id: user?.id || 1 })
      });

      if (response.ok) {
        const { ticket } = await response.json();
        const currency = getCurrencyByCode(ticket.currency_code);
        const currentRate = ticket.service_type === 'buy' ? currency.buyRate : currency.sellRate;

        const nextCustomer: QueueEntry = {
          id: ticket.id.toString(),
          queueNumber: ticket.ticket_number,
          transactionType: ticket.service_type,
          currencyCode: ticket.currency_code,
          amount: parseFloat(ticket.requested_amount),
          status: 'processing',
          customer: {
            fullName: ticket.full_name || 'Walk-in',
            phoneNumber: ticket.phone_number || '',
            idType: ticket.id_type || 'nida',
            idNumber: ticket.id_number || '',
          },
          exchangeRate: currentRate,
          localAmount: parseFloat(ticket.requested_amount) * currentRate,
          createdAt: new Date(),
          calledAt: new Date(),
        };

        setCurrentCustomer(nextCustomer);
        toast.success(`Calling ${nextCustomer.queueNumber}`);
        setActiveTab('active');
      } else {
        toast.info('No customers in queue');
      }
    } catch (e) {
      toast.error('Connection to server failed');
    }
  };

  const handleComplete = async () => {
    if (!currentCustomer) return;
    try {
      const response = await fetch('/api/teller/transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          queue_id: currentCustomer.id,
          teller_id: user?.id || 1,
          actual_amount: currentCustomer.amount,
          actual_rate: currentCustomer.exchangeRate
        })
      });

      if (response.ok) {
        setCurrentCustomer(null);
        setStats(prev => ({ ...prev, completed: prev.completed + 1 }));
        toast.success('Transaction Completed');
      }
    } catch (e) {
      toast.error('Transaction Failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col transition-all duration-300 ease-in-out">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Banknote className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">SwiftEx</span>
          </div>

          <nav className="space-y-1">
            <SidebarItem
              icon={<LayoutDashboard size={20} />}
              label="Active Terminal"
              active={activeTab === 'active'}
              onClick={() => setActiveTab('active')}
            />
            <SidebarItem
              icon={<ListOrdered size={20} />}
              label="Queue Management"
              active={activeTab === 'queue'}
              onClick={() => setActiveTab('queue')}
              badge={stats.waiting > 0 ? stats.waiting : undefined}
            />
            <SidebarItem
              icon={<History size={20} />}
              label="Order History"
              active={activeTab === 'history'}
              onClick={() => setActiveTab('history')}
            />
            <SidebarItem
              icon={<TrendingUp size={20} />}
              label="Market Rates"
              active={activeTab === 'rates'}
              onClick={() => setActiveTab('rates')}
            />
          </nav>
        </div>

        <div className="mt-auto p-6 space-y-4">
          <div className="bg-slate-800 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              {user?.full_name?.charAt(0) || 'T'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">{user?.full_name || 'Teller'}</p>
              <p className="text-xs text-slate-400">Station {user?.station_number || '01'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-8 shadow-sm">
          <div className="flex items-center gap-4 text-slate-500">
            <span className="text-sm font-medium uppercase tracking-wider">{activeTab} View</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-slate-400" />
              <span className="text-sm font-semibold">{format(new Date(), 'EEEE, do MMM')}</span>
            </div>
            <Badge className="bg-success/10 text-success hover:bg-success/20 border-none px-3 py-1">
              Terminal Active
            </Badge>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
          {activeTab === 'active' && <ActiveView currentCustomer={currentCustomer} onCallNext={handleCallNext} onComplete={handleComplete} stats={stats} />}
          {activeTab === 'queue' && <QueueView queue={queue.filter(q => q.status === 'waiting')} onCallNext={handleCallNext} />}
          {activeTab === 'history' && <HistoryView />}
          {activeTab === 'rates' && <RatesView />}
        </div>
      </main>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick, badge }: any) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${active
        ? 'bg-primary text-white shadow-lg shadow-primary/30'
        : 'hover:bg-slate-800 text-slate-400 hover:text-white'
        }`}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="font-medium">{label}</span>
      </div>
      {badge && (
        <span className={`text-xs px-2 py-0.5 rounded-full ${active ? 'bg-white text-primary' : 'bg-primary text-white'}`}>
          {badge}
        </span>
      )}
    </button>
  );
}

function ActiveView({ currentCustomer, onCallNext, onComplete, stats }: any) {
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Waiting" value={stats.waiting} icon={<Users className="text-blue-500" />} color="blue" />
        <StatCard title="Processed Today" value={stats.completed} icon={<CheckCircle className="text-emerald-500" />} color="emerald" />
        <StatCard title="Avg Time" value="4.2m" icon={<Clock className="text-amber-500" />} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Interaction Area */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-xl border-none overflow-hidden">
            <CardHeader className="bg-white border-b pb-6">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-bold">Transaction Terminal</CardTitle>
                {!currentCustomer && (
                  <Button size="lg" onClick={onCallNext} className="rounded-xl px-8 shadow-lg shadow-primary/20">
                    Call Next Customer
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {currentCustomer ? (
                <div className="divide-y">
                  <div className="p-8 space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-primary/10 rounded-2xl flex flex-col items-center justify-center border-2 border-primary/20">
                          <span className="text-xs font-bold text-primary uppercase">Ticket</span>
                          <span className="text-3xl font-black text-primary">{currentCustomer.queueNumber}</span>
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold">{currentCustomer.customer.fullName}</h3>
                          <p className="text-slate-500 flex items-center gap-2 mt-1">
                            <Phone size={14} /> {currentCustomer.customer.phoneNumber}
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-emerald-50 text-emerald-600 border-none px-4 py-2">
                        <Shield size={14} className="mr-2" /> Verified Profile
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-6 pt-4">
                      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Customer Provides</p>
                        <p className="text-3xl font-black text-slate-800">
                          {getCurrencyByCode(currentCustomer.currencyCode)?.flag} {formatNumber(currentCustomer.amount)}
                          <span className="text-lg font-medium ml-2 text-slate-500">{currentCustomer.currencyCode}</span>
                        </p>
                        <div className="mt-4 flex items-center gap-2 text-slate-500">
                          <Badge variant="outline" className="font-mono">{currentCustomer.customer.idType}: {currentCustomer.customer.idNumber}</Badge>
                        </div>
                      </div>
                      <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
                        <p className="text-xs font-bold text-primary/60 uppercase tracking-widest mb-3">Customer Receives</p>
                        <p className="text-3xl font-black text-primary">
                          {formatCurrency(currentCustomer.localAmount)}
                          <span className="text-lg font-medium ml-2 text-primary/60">TZS</span>
                        </p>
                        <p className="mt-4 text-sm font-medium text-primary/60">
                          Rate: 1 {currentCustomer.currencyCode} = {currentCustomer.exchangeRate} TZS
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-slate-50 flex items-center justify-between">
                    <div className="flex gap-4">
                      <Button variant="ghost" className="text-slate-500 hover:bg-slate-200">
                        <Printer size={18} className="mr-2" /> Receipt
                      </Button>
                      <Button variant="ghost" className="text-amber-600 hover:bg-amber-50">
                        <AlertTriangle size={18} className="mr-2" /> Flag
                      </Button>
                    </div>
                    <div className="flex gap-3">
                      <Button variant="outline" className="border-slate-200">Deny Service</Button>
                      <Button onClick={onComplete} className="bg-emerald-600 hover:bg-emerald-700 px-10 shadow-lg shadow-emerald-200">
                        Complete Transaction
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-20 text-center space-y-4">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                    <LayoutDashboard size={40} className="text-slate-300" />
                  </div>
                  <div className="max-w-xs mx-auto">
                    <p className="text-lg font-bold text-slate-700">Terminal Idle</p>
                    <p className="text-slate-500 text-sm">Waiting for you to initiate the next customer call.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Side Actions/Info */}
        <div className="space-y-6">
          <Card className="shadow-lg border-none">
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <AlertTriangle size={16} className="text-amber-500" /> Compliance Checklist
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <CheckItem label="Physical Identity Verified" checked={true} />
              <CheckItem label="Cash Authenticity Checked" checked={true} />
              <CheckItem label="Source of Funds Declared" checked={false} />
              <CheckItem label="System Risk Assessment" checked={true} />
            </CardContent>
          </Card>

          <Card className="shadow-lg border-none bg-slate-900 text-white">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-slate-400">Quick Tools</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="ghost" className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800">
                <Search size={16} className="mr-2" /> Global ID Search
              </Button>
              <Button variant="ghost" className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800">
                <ArrowRightLeft size={16} className="mr-2" /> Rate Calculator
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function QueueView({ queue, onCallNext }: any) {
  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Waiting Queue</h2>
          <p className="text-slate-500 font-medium">Manage and prioritize customer intake</p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ticket or name..."
              className="pl-10 h-10 w-64 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {queue.map((entry: any, idx: number) => (
          <Card key={entry.id} className={`shadow-sm border-none overflow-hidden transition-all duration-300 ${idx === 0 ? 'ring-2 ring-primary ring-offset-4' : 'hover:scale-[1.01]'}`}>
            <CardContent className="p-0">
              <div className="flex items-center">
                <div className={`w-24 h-24 flex flex-col items-center justify-center ${idx === 0 ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'}`}>
                  <span className="text-xs font-bold uppercase opacity-60">Ticket</span>
                  <span className="text-2xl font-black">{entry.queueNumber}</span>
                </div>
                <div className="p-6 flex-1 grid grid-cols-4 gap-4 items-center bg-white">
                  <div className="col-span-1">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Customer</p>
                    <p className="font-bold text-slate-800 truncate">{entry.customer.fullName}</p>
                  </div>
                  <div className="col-span-1">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Transaction</p>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 uppercase tracking-tighter">{entry.transactionType}</span>
                      <span className="text-lg">{getCurrencyByCode(entry.currencyCode)?.flag}</span>
                      <span className="font-bold text-slate-800">{formatNumber(entry.amount)}</span>
                    </div>
                  </div>
                  <div className="col-span-1">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Expected Wait</p>
                    <div className="flex items-center gap-2 text-slate-600 font-medium">
                      <Clock size={14} /> {idx * 5 + 2}m
                    </div>
                  </div>
                  <div className="col-span-1 flex justify-end">
                    {idx === 0 ? (
                      <Button onClick={onCallNext} className="rounded-xl px-6 shadow-lg shadow-primary/20">Call Now</Button>
                    ) : (
                      <Button variant="ghost" className="text-slate-400 hover:text-slate-600">
                        Details <ChevronRight size={16} />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function RatesView() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ExchangeRatesBoard />
        </div>
        <div className="space-y-6">
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-sm font-bold">Terminal Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Vol today (TZS)</span>
                <span className="font-bold text-slate-800">14.2M</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Active currencies</span>
                <span className="font-bold text-slate-800">8</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function HistoryView() {
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch('/api/teller/history', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.ok) {
          const data = await response.json();
          setHistory(data);
        }
      } catch (e) { console.error(e); }
    };
    fetchHistory();
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-3xl font-black text-slate-800 tracking-tight">Transaction History</h2>
      <Card className="border-none shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase">Reference</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase">Customer</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase">Exchange</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase text-right">TZS Amount</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-mono text-sm text-primary font-bold">{row.transaction_reference}</td>
                  <td className="p-4 font-medium">{row.full_name}</td>
                  <td className="p-4">
                    <span className="capitalize font-bold">{row.type}</span> {row.amount_foreign} {row.currency_code}
                  </td>
                  <td className="p-4 text-right font-black text-slate-700">{formatCurrency(row.amount_local)}</td>
                  <td className="p-4 text-slate-400 text-sm">{format(new Date(row.created_at), 'HH:mm')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function StatCard({ title, value, icon, color }: any) {
  const bgStyles: any = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
  };

  return (
    <Card className="border-none shadow-lg shadow-slate-200/50">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${bgStyles[color]}`}>
            {icon}
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{title}</p>
            <p className="text-3xl font-black text-slate-800">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CheckItem({ label, checked }: any) {
  return (
    <div className="flex items-center justify-between text-sm py-1">
      <span className={checked ? 'text-slate-700' : 'text-slate-400 italic'}>{label}</span>
      {checked ? <CheckCircle size={16} className="text-emerald-500" /> : <div className="w-4 h-4 rounded border-2 border-slate-200" />}
    </div>
  );
}
