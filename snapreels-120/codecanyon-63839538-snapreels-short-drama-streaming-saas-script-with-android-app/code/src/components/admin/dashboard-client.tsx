'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { DateRange } from 'react-day-picker';
import { format } from 'date-fns';

import type { AdminDashboardData } from '@/lib/types';
import { DateRangePicker } from '@/components/admin/date-range-picker';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Users, DollarSign, Clapperboard, ListVideo, Activity, TrendingUp, Server, ShieldCheck, 
  BarChart3, Settings2, GripHorizontal, Check, Eye, PlaySquare, ArrowUpRight, Zap, Coins, Clock, Heart, Ban
} from 'lucide-react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, Legend, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';

interface DashboardClientProps {
  initialData: AdminDashboardData;
  dateRange: { from: Date; to: Date };
}

const WIDGETS = [
  { id: 'total_revenue', title: 'Total Revenue', category: 'metrics' },
  { id: 'new_users', title: 'New Users', category: 'metrics' },
  { id: 'total_users', title: 'Total Users', category: 'metrics' },
  { id: 'total_series', title: 'Total Series', category: 'metrics' },
  { id: 'total_episodes', title: 'Total Episodes', category: 'metrics' },
  { id: 'total_views', title: 'Total Views', category: 'metrics' },
  { id: 'active_buyers', title: 'Active Buyers', category: 'metrics' },
  { id: 'arpu', title: 'ARPU', category: 'metrics' },
  { id: 'engagement_rate', title: 'Engagement Rate', category: 'metrics' },
  // 10 NEW METRICS & LISTS
  { id: 'total_purchases', title: 'Total Purchases', category: 'metrics' },
  { id: 'total_coin_spends', title: 'Total Coin Spends', category: 'metrics' },
  { id: 'average_purchase_value', title: 'Avg Purchase Value', category: 'metrics' },
  { id: 'total_watch_records', title: 'Watch Records', category: 'metrics' },
  { id: 'admin_count', title: 'Admin Users', category: 'metrics' },
  { id: 'banned_users_count', title: 'Banned Users', category: 'metrics' },
  
  { id: 'revenue_chart', title: 'Revenue Chart', category: 'charts' },
  { id: 'registration_chart', title: 'Registration Chart', category: 'charts' },
  { id: 'top_series_views', title: 'Top Series (Views)', category: 'tables' },
  { id: 'top_favorited_series', title: 'Top Favorited Series', category: 'tables' },
  { id: 'top_genres_views', title: 'Top Genres (Views)', category: 'charts' }, // Pie Chart
  { id: 'top_coin_packs', title: 'Top Coin Packs', category: 'charts' }, // Pie Chart

  { id: 'recent_purchases', title: 'Recent Purchases', category: 'lists' },
  { id: 'recent_users', title: 'Recent Users', category: 'lists' },
  { id: 'latest_episodes', title: 'Latest Episodes', category: 'lists' },
  { id: 'recent_series', title: 'Recent Series', category: 'lists' },

  { id: 'system_health', title: 'System Health', category: 'status' },
  { id: 'genre_distribution', title: 'Genre Distribution', category: 'charts' },
  { id: 'user_vip_breakdown', title: 'User Accounts (VIP vs Free)', category: 'charts' },
  { id: 'coin_economy', title: 'Coin Economy', category: 'charts' },
  { id: 'watch_time_trends', title: 'Watch Time Trends', category: 'charts' },
] as const;

const DEFAULT_WIDGETS = [
    'total_revenue', 'new_users', 'total_users', 'total_views', 'total_purchases',
    'revenue_chart', 'system_health', 'top_series_views', 'coin_economy', 'latest_episodes'
];

export function DashboardClient({ initialData, dateRange }: DashboardClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  const [activeWidgets, setActiveWidgets] = useState<string[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('snapreels_admin_widgets');
    if (saved) {
      try {
        setActiveWidgets(JSON.parse(saved));
      } catch (e) {
        setActiveWidgets(DEFAULT_WIDGETS);
      }
    } else {
      setActiveWidgets(DEFAULT_WIDGETS);
    }
    setIsMounted(true);
  }, []);

  const toggleWidget = (id: string) => {
    let newWidgets = [...activeWidgets];
    if (newWidgets.includes(id)) {
      newWidgets = newWidgets.filter(w => w !== id);
    } else {
      newWidgets.push(id);
    }
    setActiveWidgets(newWidgets);
    localStorage.setItem('snapreels_admin_widgets', JSON.stringify(newWidgets));
  };

  const handleSetDate = (newDate: DateRange | undefined) => {
    const params = new URLSearchParams();
    if (newDate?.from) {
      params.set('from', newDate.from.toISOString().split('T')[0]);
    }
    if (newDate?.to) {
      params.set('to', newDate.to.toISOString().split('T')[0]);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  if (!isMounted) return null; // Avoid hydration mismatch

  const d = initialData;

  const COLORS = ['#3b82f6', '#f857a6', '#f59e0b', '#10b981', '#8b5cf6'];

  const WidgetRenderer = ({ id }: { id: string }) => {
    switch (id) {
      case 'total_revenue':
        return (
          <Card className="bg-primary/10 border-primary/20 shadow-lg shadow-primary/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[10px] font-black tracking-tighter text-primary">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black">${d.totalRevenue.toFixed(2)}</div>
            </CardContent>
          </Card>
        );
      case 'new_users':
        return (
          <Card className="bg-card/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[10px] font-black tracking-tighter text-muted-foreground">New Registrations</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black">+{d.newUsersCount}</div>
            </CardContent>
          </Card>
        );
      case 'total_users':
        return (
          <Card className="bg-card/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[10px] font-black tracking-tighter text-muted-foreground">Total Users</CardTitle>
              <Users className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black">{d.totalUsersCount}</div>
            </CardContent>
          </Card>
        );
      case 'total_series':
        return (
          <Card className="bg-card/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[10px] font-black tracking-tighter text-muted-foreground">Total Series</CardTitle>
              <Clapperboard className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black">{d.totalSeriesCount}</div>
            </CardContent>
          </Card>
        );
      case 'total_episodes':
        return (
          <Card className="bg-card/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[10px] font-black tracking-tighter text-muted-foreground">Total Episodes</CardTitle>
              <ListVideo className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black">{d.totalEpisodesCount}</div>
            </CardContent>
          </Card>
        );
      case 'total_views':
        return (
          <Card className="bg-card/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[10px] font-black tracking-tighter text-muted-foreground">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-pink-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black">{d.totalViews}</div>
            </CardContent>
          </Card>
        );
      case 'active_buyers':
        return (
          <Card className="bg-card/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[10px] font-black tracking-tighter text-muted-foreground">Active Buyers</CardTitle>
              <Coins className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black">{d.activeSubscriptions}</div>
            </CardContent>
          </Card>
        );
      case 'arpu':
        return (
          <Card className="bg-card/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[10px] font-black tracking-tighter text-muted-foreground">ARPU</CardTitle>
              <ArrowUpRight className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black">${d.arpu.toFixed(2)}</div>
            </CardContent>
          </Card>
        );
      case 'engagement_rate':
        return (
          <Card className="bg-card/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[10px] font-black tracking-tighter text-muted-foreground">Engagement Rate</CardTitle>
              <Zap className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black">{d.engagementRate.toFixed(1)}%</div>
            </CardContent>
          </Card>
        );
      case 'total_purchases':
        return (
          <Card className="bg-card/50 border-white/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[10px] font-black tracking-tighter text-muted-foreground">Total Purchases</CardTitle>
              <DollarSign className="h-4 w-4 text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black">{d.totalPurchasesCount}</div>
            </CardContent>
          </Card>
        );
      case 'total_coin_spends':
        return (
          <Card className="bg-card/50 border-white/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[10px] font-black tracking-tighter text-muted-foreground">Coin Transactions</CardTitle>
              <Coins className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black">{d.totalCoinSpendCount}</div>
            </CardContent>
          </Card>
        );
      case 'average_purchase_value':
        return (
          <Card className="bg-card/50 border-white/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[10px] font-black tracking-tighter text-muted-foreground">Avg Purchase</CardTitle>
              <DollarSign className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black">${d.averagePurchaseValue.toFixed(2)}</div>
            </CardContent>
          </Card>
        );
      case 'total_watch_records':
        return (
          <Card className="bg-card/50 border-white/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[10px] font-black tracking-tighter text-muted-foreground">Watch Records</CardTitle>
              <Clock className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black">{d.totalWatchHistoryRecords}</div>
            </CardContent>
          </Card>
        );
      case 'admin_count':
        return (
          <Card className="bg-card/50 border-white/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[10px] font-black tracking-tighter text-muted-foreground">Administrators</CardTitle>
              <ShieldCheck className="h-4 w-4 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black">{d.adminCount}</div>
            </CardContent>
          </Card>
        );
      case 'banned_users_count':
        return (
          <Card className="bg-card/50 border-white/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[10px] font-black tracking-tighter text-muted-foreground">Banned Users</CardTitle>
              <Ban className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black">{d.bannedUsersCount}</div>
            </CardContent>
          </Card>
        );
      case 'revenue_chart':
        return (
          <Card className="col-span-full lg:col-span-2 bg-card/30 border-white/5 backdrop-blur-md">
            <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /> Revenue Chart</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={d.dailyStats}>
                        <defs>
                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis dataKey="date" stroke="#ffffff40" fontSize={10} axisLine={false} tickLine={false} />
                        <YAxis stroke="#ffffff40" fontSize={10} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#ffffff10' }} />
                        <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
          </Card>
        );
      case 'registration_chart':
        return (
          <Card className="col-span-full lg:col-span-2 bg-card/30 border-white/5 backdrop-blur-md">
            <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-2"><Users className="h-4 w-4 text-pink-500" /> Registrations Chart</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={d.dailyStats}>
                        <defs>
                            <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f857a6" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#f857a6" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis dataKey="date" stroke="#ffffff40" fontSize={10} axisLine={false} tickLine={false} />
                        <YAxis stroke="#ffffff40" fontSize={10} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#ffffff10' }} />
                        <Area type="monotone" dataKey="registrations" stroke="#f857a6" strokeWidth={3} fillOpacity={1} fill="url(#colorReg)" />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
          </Card>
        );
      case 'system_health':
        return (
          <Card className="bg-card/50 border-white/5">
            <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-2"><Server className="h-4 w-4 text-green-500" /> System Health</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {d.systemHealth.map((h, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/5">
                        <div className="flex items-center gap-3">
                            <div className={`h-2 w-2 rounded-full ${h.status === 'operational' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                            <span className="text-xs font-bold">{h.name}</span>
                        </div>
                        <Badge variant="outline" className={`text-[10px] ${h.status === 'operational' ? 'text-green-500 border-green-500/20' : 'text-red-500 border-red-500/20'}`}>
                            {h.status.toUpperCase()}
                        </Badge>
                    </div>
                ))}
            </CardContent>
          </Card>
        );
      case 'top_series_views':
        return (
          <Card className="col-span-full lg:col-span-2 bg-card/50 border-white/5">
            <CardHeader><CardTitle className="text-sm font-bold flex items-center gap-2"><PlaySquare className="h-4 w-4 text-orange-500" /> Top Series (Views)</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-white/5">
                    <TableHead className="text-[10px] font-black">Rank</TableHead>
                    <TableHead className="text-[10px] font-black">Title</TableHead>
                    <TableHead className="text-right text-[10px] font-black">Views</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {d.topPerformingSeries.map((s, i) => (
                    <TableRow key={s.id} className="border-white/5 hover:bg-white/5">
                      <TableCell className="font-black text-muted-foreground/50">#{i + 1}</TableCell>
                      <TableCell className="font-bold text-white">{s.title}</TableCell>
                      <TableCell className="text-right"><Badge variant="secondary" className="bg-orange-500/10 text-orange-400">{s.views.toLocaleString()}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );
      case 'genre_distribution':
        const hasGenreData = d.genreDistribution.length > 0;
        return (
          <Card className="bg-card/50 border-white/5">
            <CardHeader><CardTitle className="text-sm font-bold flex items-center gap-2"><PieChart className="h-4 w-4 text-purple-500" /> Genre Distribution</CardTitle></CardHeader>
            <CardContent className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie 
                            data={hasGenreData ? d.genreDistribution : [{name: 'No Data', value: 1}]} 
                            cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value"
                        >
                            {hasGenreData ? d.genreDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />) : <Cell fill="#333333" />}
                        </Pie>
                        {hasGenreData && <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#ffffff10' }} />}
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
          </Card>
        );
      case 'user_vip_breakdown':
        return (
          <Card className="bg-card/50 border-white/5">
            <CardHeader><CardTitle className="text-sm font-bold flex items-center gap-2"><Activity className="h-4 w-4 text-cyan-500" /> Users (VIP vs Free)</CardTitle></CardHeader>
            <CardContent className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={d.platformBreakdown}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis dataKey="name" stroke="#ffffff40" fontSize={10} />
                        <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#ffffff10' }} />
                        <Bar dataKey="value" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
          </Card>
        );
      case 'coin_economy':
        const hasCoinData = d.coinEconomy.circulating > 0 || d.coinEconomy.spent > 0;
        return (
          <Card className="bg-card/50 border-white/5">
            <CardHeader><CardTitle className="text-sm font-bold flex items-center gap-2"><Coins className="h-4 w-4 text-yellow-500" /> Coin Economy</CardTitle></CardHeader>
            <CardContent className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie 
                            data={hasCoinData ? [{name: 'Circulating', value: d.coinEconomy.circulating}, {name: 'Spent', value: d.coinEconomy.spent}] : [{name: 'No Activity', value: 1}]} 
                            cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value"
                        >
                            {hasCoinData ? (
                                <>
                                    <Cell fill="#eab308" />
                                    <Cell fill="#ef4444" />
                                </>
                            ) : (
                                <Cell fill="#333333" />
                            )}
                        </Pie>
                        {hasCoinData && <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#ffffff10' }} />}
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
          </Card>
        );
      case 'watch_time_trends':
        return (
          <Card className="col-span-full lg:col-span-2 bg-card/30 border-white/5 backdrop-blur-md">
            <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-2"><Clock className="h-4 w-4 text-indigo-500" /> Watch Time (Hours)</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={d.watchTimeStats}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis dataKey="date" stroke="#ffffff40" fontSize={10} axisLine={false} tickLine={false} />
                        <YAxis stroke="#ffffff40" fontSize={10} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#ffffff10' }} />
                        <Line type="monotone" dataKey="hours" stroke="#6366f1" strokeWidth={3} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
          </Card>
        );
      case 'top_favorited_series':
        return (
          <Card className="col-span-full lg:col-span-2 bg-card/50 border-white/5">
            <CardHeader><CardTitle className="text-sm font-bold flex items-center gap-2"><Heart className="h-4 w-4 text-rose-500" /> Top Favorited Series</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-white/5">
                    <TableHead className="text-[10px] font-black">Title</TableHead>
                    <TableHead className="text-right text-[10px] font-black">Favorites</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {d.topFavoritedSeries.map((s) => (
                    <TableRow key={s.id} className="border-white/5 hover:bg-white/5">
                      <TableCell className="font-bold text-white line-clamp-1">{s.title}</TableCell>
                      <TableCell className="text-right"><Badge variant="secondary" className="bg-rose-500/10 text-rose-400">{s.favoritesCount}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );
      case 'recent_purchases':
        return (
          <Card className="bg-card/50 border-white/5">
            <CardHeader><CardTitle className="text-sm font-bold">Recent Purchases</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                {d.recentPurchases.map((p, i) => (
                    <div key={i} className="flex flex-col border-b border-white/5 pb-2">
                        <span className="text-sm font-bold">{p.userEmail}</span>
                        <div className="flex justify-between items-center mt-1">
                            <span className="text-xs text-muted-foreground">{p.packName}</span>
                            <span className="text-xs text-green-500 font-bold">+${p.price}</span>
                        </div>
                    </div>
                ))}
            </CardContent>
          </Card>
        );
      case 'recent_users':
        return (
          <Card className="bg-card/50 border-white/5">
            <CardHeader><CardTitle className="text-sm font-bold">Recent Users</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                {d.recentUsers.map((u, i) => (
                    <div key={i} className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-sm font-bold">{u.displayName || u.email || 'Anonymous'}</span>
                        <Badge variant="outline" className="text-[10px]">New</Badge>
                    </div>
                ))}
            </CardContent>
          </Card>
        );
      case 'latest_episodes':
        return (
          <Card className="bg-card/50 border-white/5">
            <CardHeader><CardTitle className="text-sm font-bold">Latest Episodes</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                {d.latestEpisodes.map((e, i) => (
                    <div key={i} className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-sm font-bold line-clamp-1">{e.title}</span>
                        <Badge variant="secondary" className="text-[10px]">New</Badge>
                    </div>
                ))}
            </CardContent>
          </Card>
        );
      case 'recent_series':
        return (
          <Card className="bg-card/50 border-white/5">
            <CardHeader><CardTitle className="text-sm font-bold">Recent Series</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                {d.recentSeries.map((s, i) => (
                    <div key={i} className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-sm font-bold line-clamp-1">{s.title}</span>
                        <Badge variant="outline" className="text-[10px] text-orange-500 border-orange-500/20">{s.views} Views</Badge>
                    </div>
                ))}
            </CardContent>
          </Card>
        );
      case 'top_genres_views':
        const hasTopGenresData = d.topGenresByViews.length > 0;
        return (
          <Card className="bg-card/50 border-white/5">
            <CardHeader><CardTitle className="text-sm font-bold flex items-center gap-2"><PieChart className="h-4 w-4 text-pink-500" /> Genres by Views</CardTitle></CardHeader>
            <CardContent className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie 
                            data={hasTopGenresData ? d.topGenresByViews : [{name: 'No Data', value: 1}]} 
                            cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value"
                        >
                            {hasTopGenresData ? d.topGenresByViews.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />) : <Cell fill="#333333" />}
                        </Pie>
                        {hasTopGenresData && <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#ffffff10' }} />}
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
          </Card>
        );
      case 'top_coin_packs':
        const hasPacksData = d.topCoinPacks.length > 0;
        return (
          <Card className="bg-card/50 border-white/5">
            <CardHeader><CardTitle className="text-sm font-bold flex items-center gap-2"><PieChart className="h-4 w-4 text-green-500" /> Top Coin Packs</CardTitle></CardHeader>
            <CardContent className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie 
                            data={hasPacksData ? d.topCoinPacks : [{name: 'No Data', value: 1}]} 
                            cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value"
                        >
                            {hasPacksData ? d.topCoinPacks.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />) : <Cell fill="#333333" />}
                        </Pie>
                        {hasPacksData && <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#ffffff10' }} />}
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white italic flex items-center gap-3">
            Dashboard
            <Badge variant="secondary" className="text-primary bg-primary/10 border-none rounded-sm">V2.0</Badge>
          </h1>
          <p className="text-muted-foreground text-sm font-bold tracking-widest mt-1">
            Engine Statistics & Telemetry
          </p>
        </div>
        <div className="flex items-center gap-3">
          <DateRangePicker date={dateRange} setDate={handleSetDate} />
          <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="border-white/10 hover:bg-white/5">
                    <Settings2 className="h-4 w-4" />
                </Button>
            </SheetTrigger>
            <SheetContent className="bg-[#0a0a0a] border-white/10 overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Widget Library</SheetTitle>
                    <SheetDescription>Customize your dashboard view by toggling widgets.</SheetDescription>
                </SheetHeader>
                <div className="mt-8 space-y-6">
                    {['metrics', 'charts', 'tables', 'lists', 'status'].map(category => (
                        <div key={category} className="space-y-3">
                            <h3 className="text-xs font-black uppercase text-muted-foreground tracking-widest">{category}</h3>
                            <div className="space-y-2">
                                {WIDGETS.filter(w => w.category === category).map(widget => (
                                    <div key={widget.id} className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-white/5">
                                        <span className="text-sm font-bold">{widget.title}</span>
                                        <Switch 
                                            checked={activeWidgets.includes(widget.id)}
                                            onCheckedChange={() => toggleWidget(widget.id)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Metrics Grid */}
      {activeWidgets.filter(id => WIDGETS.find(w => w.id === id)?.category === 'metrics').length > 0 && (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {WIDGETS.filter(w => activeWidgets.includes(w.id) && w.category === 'metrics').map(w => (
            <WidgetRenderer key={w.id} id={w.id} />
          ))}
        </div>
      )}

      {/* Main & Side Columns Layout (Optimized to avoid gaps) */}
      {activeWidgets.filter(id => WIDGETS.find(w => w.id === id)?.category !== 'metrics').length > 0 && (
        <div className="flex flex-col xl:flex-row gap-4 mt-6 items-start">
          
          {/* Main Column (2/3 width) - Charts & Tables */}
          <div className="flex flex-col gap-4 w-full xl:w-2/3">
            {WIDGETS.filter(w => activeWidgets.includes(w.id) && ['revenue_chart', 'registration_chart', 'watch_time_trends', 'top_series_views', 'top_favorited_series', 'user_vip_breakdown'].includes(w.id)).map(w => (
               <WidgetRenderer key={w.id} id={w.id} />
            ))}
          </div>

          {/* Side Column (1/3 width) - Pie Charts, Lists, Status */}
          <div className="flex flex-col gap-4 w-full xl:w-1/3">
            {WIDGETS.filter(w => activeWidgets.includes(w.id) && !['revenue_chart', 'registration_chart', 'watch_time_trends', 'top_series_views', 'top_favorited_series', 'user_vip_breakdown'].includes(w.id) && w.category !== 'metrics').map(w => (
               <WidgetRenderer key={w.id} id={w.id} />
            ))}
          </div>

        </div>
      )}

      {activeWidgets.length === 0 && (
        <div className="col-span-full p-20 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-xl">
            <Settings2 className="h-10 w-10 text-muted-foreground mb-4 opacity-50" />
            <p className="text-muted-foreground font-bold">No widgets active. Open the settings panel to add widgets.</p>
        </div>
      )}
    </div>
  );
}
