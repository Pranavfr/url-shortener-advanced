import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { ArrowLeft, Globe, Monitor, BarChart2, MousePointerClick, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import api from '../services/api';

export default function Analytics() {
    const { id } = useParams();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await api.get(`/analytics/${id}`);
                setData(res.data);
            } catch (err) {
                console.error('Failed to load analytics', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, [id]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-32 text-zinc-400">
            <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
            Loading analytics data...
        </div>
    );
    
    if (!data) return (
        <div className="text-center py-20">
            <div className="bg-red-500/10 text-red-400 p-6 rounded-2xl inline-block border border-red-500/20">
                Failed to load analytics. The link might have been deleted.
            </div>
        </div>
    );

    const { url, totalClicks, logs } = data;

    // Process chart data (clicks by date)
    const clicksByDate: Record<string, number> = {};
    logs.forEach((log: any) => {
        const date = format(new Date(log.timestamp), 'MMM dd');
        clicksByDate[date] = (clicksByDate[date] || 0) + 1;
    });
    
    const chartData = Object.entries(clicksByDate).map(([date, clicks]) => ({ date, clicks }));

    // Device counts
    const desktopClicks = logs.filter((l: any) => l.device === 'Desktop').length;
    const mobileClicks = logs.filter((l: any) => l.device === 'Mobile').length;
    const baseUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api$/, '') : 'http://localhost:5000';

    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };
    
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <motion.div 
            initial="hidden"
            animate="show"
            variants={containerVariants}
            className="py-8"
        >
            <motion.div variants={itemVariants} className="mb-8">
                <Link to="/dashboard" className="inline-flex items-center text-zinc-400 hover:text-white mb-6 transition bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/5 text-sm font-medium">
                    <ArrowLeft size={16} className="mr-2" /> Back to Dashboard
                </Link>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">Analytics</h1>
                        <div className="flex items-center gap-3">
                            <span className="text-zinc-500 font-medium hidden sm:inline">Tracking:</span>
                            <a href={`${baseUrl}/${url.shortCode}`} target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-300 font-semibold bg-indigo-500/10 px-3 py-1 rounded-md transition border border-indigo-500/20 truncate max-w-[200px] sm:max-w-md">
                                {baseUrl.replace(/^https?:\/\//, '')}/{url.shortCode}
                            </a>
                        </div>
                    </div>
                    <div className="bg-zinc-900 border border-white/10 px-6 py-4 rounded-2xl flex items-center shadow-2xl">
                        <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center mr-4 text-indigo-400 border border-indigo-500/20">
                            <MousePointerClick size={24} />
                        </div>
                        <div>
                            <div className="text-zinc-400 text-sm font-medium uppercase tracking-wider mb-1">Total Clicks</div>
                            <div className="text-4xl font-black text-white leading-none">{totalClicks.toLocaleString()}</div>
                        </div>
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Chart spanning 2 cols */}
                <motion.div variants={itemVariants} className="glass-panel p-6 lg:col-span-2 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none -mt-32 -mr-32"></div>
                    
                    <h3 className="text-xl font-bold mb-6 flex items-center text-white">
                        <BarChart2 size={20} className="mr-2 text-indigo-400" /> Activity Over Time
                    </h3>
                    <div className="h-72 w-full">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                    <XAxis 
                                        dataKey="date" 
                                        stroke="#71717a" 
                                        tick={{fill: '#a1a1aa', fontSize: 12}} 
                                        tickLine={false}
                                        axisLine={false}
                                        dy={10}
                                    />
                                    <YAxis 
                                        stroke="#71717a" 
                                        allowDecimals={false} 
                                        tick={{fill: '#a1a1aa', fontSize: 12}}
                                        tickLine={false}
                                        axisLine={false}
                                        dx={-10}
                                    />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', color: '#fff', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                                        itemStyle={{ color: '#818cf8', fontWeight: 'bold' }}
                                        cursor={{ stroke: '#3f3f46', strokeWidth: 1, strokeDasharray: '5 5' }}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="clicks" 
                                        stroke="#818cf8" 
                                        strokeWidth={3} 
                                        fillOpacity={1} 
                                        fill="url(#colorClicks)" 
                                        activeDot={{ r: 6, fill: '#818cf8', stroke: '#fff', strokeWidth: 2 }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-zinc-500">
                                <BarChart2 size={48} className="mb-4 opacity-20" />
                                No click data available yet.
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Breakdown col */}
                <motion.div variants={itemVariants} className="space-y-6">
                    <div className="glass-panel p-6 shadow-2xl h-full relative overflow-hidden">
                        <div className="absolute bottom-0 right-0 w-48 h-48 bg-purple-500/10 blur-3xl rounded-full pointer-events-none -mb-24 -mr-24"></div>
                        
                        <h3 className="text-lg font-bold mb-6 text-white flex items-center">
                            <Monitor size={18} className="mr-2 text-purple-400" /> Device Breakdown
                        </h3>
                        
                        <div className="space-y-8">
                            <div>
                                <div className="flex justify-between items-end mb-2">
                                    <div className="flex items-center text-zinc-300 font-medium">
                                        Desktop
                                    </div>
                                    <div className="text-right">
                                        <span className="font-bold text-white text-lg">{desktopClicks}</span>
                                        <span className="text-zinc-500 text-xs ml-2">{totalClicks > 0 ? Math.round((desktopClicks/totalClicks)*100) : 0}%</span>
                                    </div>
                                </div>
                                <div className="w-full bg-zinc-800 rounded-full h-2.5 overflow-hidden border border-white/5">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${totalClicks > 0 ? (desktopClicks/totalClicks)*100 : 0}%` }}
                                        transition={{ duration: 1, delay: 0.5 }}
                                        className="bg-indigo-500 h-full rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <div className="flex justify-between items-end mb-2">
                                    <div className="flex items-center text-zinc-300 font-medium">
                                        Mobile
                                    </div>
                                    <div className="text-right">
                                        <span className="font-bold text-white text-lg">{mobileClicks}</span>
                                        <span className="text-zinc-500 text-xs ml-2">{totalClicks > 0 ? Math.round((mobileClicks/totalClicks)*100) : 0}%</span>
                                    </div>
                                </div>
                                <div className="w-full bg-zinc-800 rounded-full h-2.5 overflow-hidden border border-white/5">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${totalClicks > 0 ? (mobileClicks/totalClicks)*100 : 0}%` }}
                                        transition={{ duration: 1, delay: 0.7 }}
                                        className="bg-purple-500 h-full rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            <motion.div variants={itemVariants} className="glass-panel overflow-hidden border border-white/5 shadow-2xl">
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-zinc-900/50">
                    <h3 className="text-lg font-bold text-white flex items-center">
                        <Clock size={18} className="mr-2 text-indigo-400" /> Recent Click Log
                    </h3>
                    <span className="text-xs font-medium text-zinc-500 bg-white/5 px-2 py-1 rounded-md border border-white/5">Showing last 10 clicks</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-zinc-900/30 border-b border-white/5">
                                <th className="p-5 text-xs text-zinc-500 font-bold uppercase tracking-wider">Time</th>
                                <th className="p-5 text-xs text-zinc-500 font-bold uppercase tracking-wider hidden sm:table-cell">IP Address</th>
                                <th className="p-5 text-xs text-zinc-500 font-bold uppercase tracking-wider">Browser</th>
                                <th className="p-5 text-xs text-zinc-500 font-bold uppercase tracking-wider hidden md:table-cell">Referrer</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.slice(0, 10).map((log: any, i: number) => (
                                <motion.tr 
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 + (i * 0.05) }}
                                    key={i} 
                                    className="border-b border-white/5 hover:bg-zinc-800/30 transition-colors"
                                >
                                    <td className="p-5 text-zinc-300 text-sm font-medium">{format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm')}</td>
                                    <td className="p-5 text-zinc-500 text-sm font-mono hidden sm:table-cell">{log.ip || 'Unknown'}</td>
                                    <td className="p-5 text-zinc-300 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Globe size={14} className="text-indigo-400" /> 
                                            {log.browser}
                                        </div>
                                    </td>
                                    <td className="p-5 text-zinc-400 text-sm truncate max-w-xs hidden md:table-cell">{log.referrer || 'Direct'}</td>
                                </motion.tr>
                            ))}
                            {logs.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-12 text-center text-zinc-500">
                                        <div className="flex flex-col items-center">
                                            <MousePointerClick size={32} className="mb-3 opacity-20" />
                                            No clicks recorded yet. Share your link to get started!
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </motion.div>
    );
}
