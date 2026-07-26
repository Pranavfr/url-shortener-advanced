import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowLeft, Globe, Monitor, Smartphone } from 'lucide-react';
import { format } from 'date-fns';
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

    if (loading) return <div className="text-center py-20 text-slate-300">Loading analytics...</div>;
    if (!data) return <div className="text-center py-20 text-red-400">Failed to load analytics.</div>;

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

    return (
        <div className="py-8">
            <Link to="/dashboard" className="inline-flex items-center text-slate-400 hover:text-white mb-6 transition">
                <ArrowLeft size={16} className="mr-2" /> Back to Dashboard
            </Link>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Analytics</h1>
                    <a href={`http://localhost:5000/${url.shortCode}`} target="_blank" rel="noreferrer" className="text-primary hover:underline mt-1 block">
                        http://localhost:5000/{url.shortCode}
                    </a>
                </div>
                <div className="bg-slate-800/80 border border-slate-700 px-6 py-4 rounded-xl flex items-center shadow-lg">
                    <div className="text-slate-400 mr-4">Total Clicks</div>
                    <div className="text-4xl font-black text-white">{totalClicks}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Chart spanning 2 cols */}
                <div className="glass p-6 lg:col-span-2">
                    <h3 className="text-xl font-bold mb-6 flex items-center text-slate-200">
                        <BarChart2 size={20} className="mr-2 text-primary" /> Clicks Over Time
                    </h3>
                    <div className="h-72">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                    <XAxis dataKey="date" stroke="#94a3b8" />
                                    <YAxis stroke="#94a3b8" allowDecimals={false} />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', borderRadius: '8px' }}
                                        itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                                    />
                                    <Line type="monotone" dataKey="clicks" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#8b5cf6' }} activeDot={{ r: 8 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-500">No click data available yet.</div>
                        )}
                    </div>
                </div>

                {/* Breakdown col */}
                <div className="space-y-6">
                    <div className="glass p-6">
                        <h3 className="text-lg font-bold mb-4 border-b border-slate-700 pb-2 text-slate-200">Device Breakdown</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center text-slate-300"><Monitor size={18} className="mr-2 text-blue-400" /> Desktop</div>
                                <span className="font-bold">{desktopClicks}</span>
                            </div>
                            <div className="w-full bg-slate-700 rounded-full h-2">
                                <div className="bg-blue-400 h-2 rounded-full" style={{ width: `${totalClicks > 0 ? (desktopClicks/totalClicks)*100 : 0}%` }}></div>
                            </div>
                            
                            <div className="flex justify-between items-center pt-2">
                                <div className="flex items-center text-slate-300"><Smartphone size={18} className="mr-2 text-emerald-400" /> Mobile</div>
                                <span className="font-bold">{mobileClicks}</span>
                            </div>
                            <div className="w-full bg-slate-700 rounded-full h-2">
                                <div className="bg-emerald-400 h-2 rounded-full" style={{ width: `${totalClicks > 0 ? (mobileClicks/totalClicks)*100 : 0}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="glass overflow-hidden">
                <div className="p-4 border-b border-slate-700">
                    <h3 className="text-lg font-bold text-slate-200">Recent Click Log</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-800/50">
                                <th className="p-4 text-sm text-slate-400 font-semibold">Time</th>
                                <th className="p-4 text-sm text-slate-400 font-semibold">IP Address</th>
                                <th className="p-4 text-sm text-slate-400 font-semibold">Browser</th>
                                <th className="p-4 text-sm text-slate-400 font-semibold">Referrer</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.slice(0, 10).map((log: any, i: number) => (
                                <tr key={i} className="border-b border-slate-700/50 hover:bg-slate-800/30">
                                    <td className="p-4 text-slate-300 text-sm">{format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm:ss')}</td>
                                    <td className="p-4 text-slate-400 text-sm font-mono">{log.ip || 'Unknown'}</td>
                                    <td className="p-4 text-slate-300 text-sm flex items-center">
                                        <Globe size={14} className="mr-2 text-slate-400" /> {log.browser}
                                    </td>
                                    <td className="p-4 text-slate-400 text-sm truncate max-w-xs">{log.referrer || 'Direct'}</td>
                                </tr>
                            ))}
                            {logs.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-6 text-center text-slate-500">No clicks recorded.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// Needed to avoid missing icon import error
import { BarChart2 } from 'lucide-react';
