import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Copy, QrCode, BarChart2, Trash2, PowerOff, Search, Link as LinkIcon, Plus, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';

interface Url {
    id: string;
    originalUrl: string;
    shortCode: string;
    clicks: number;
    createdAt: string;
    isDisabled: boolean;
}

export default function Dashboard() {
    const [urls, setUrls] = useState<Url[]>([]);
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    useEffect(() => {
        loadUrls();
    }, []);

    const loadUrls = async () => {
        try {
            const res = await api.get('/url');
            setUrls(res.data);
        } catch (err) {
            toast.error('Failed to load your links');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this URL? This action cannot be undone.')) {
            try {
                await api.delete(`/url/${id}`);
                setUrls(urls.filter(u => u.id !== id));
                toast.success('Link deleted successfully');
            } catch (err) {
                toast.error('Failed to delete link');
            }
        }
    };

    const handleToggleDisable = async (id: string, currentStatus: boolean) => {
        try {
            await api.put(`/url/${id}`, { isDisabled: !currentStatus });
            setUrls(urls.map(u => u.id === id ? { ...u, isDisabled: !currentStatus } : u));
            toast.success(currentStatus ? 'Link enabled' : 'Link disabled');
        } catch (err) {
            toast.error('Failed to update status');
        }
    };

    const showQR = async (id: string) => {
        try {
            const res = await api.get(`/url/qr/${id}`);
            setQrCode(res.data.qrCode);
        } catch (err) {
            toast.error('Failed to load QR code');
        }
    };

    const handleCopy = (code: string, id: string) => {
        navigator.clipboard.writeText(getShortUrl(code));
        setCopiedId(id);
        toast.success('Copied to clipboard');
        setTimeout(() => setCopiedId(null), 2000);
    };

    const baseUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api$/, '') : 'http://localhost:5000';
    const getShortUrl = (code: string) => `${baseUrl}/${code}`;

    const filteredUrls = urls.filter(u => 
        u.shortCode.toLowerCase().includes(searchQuery.toLowerCase()) || 
        u.originalUrl.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-8"
        >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                <div>
                    <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">Your Links</h1>
                    <p className="text-zinc-400 font-medium">Manage, track, and analyze your shortened URLs.</p>
                </div>
                <div className="flex w-full md:w-auto items-center gap-4">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search links..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-zinc-900 border border-white/10 text-white rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-inner"
                        />
                    </div>
                    <Link to="/" className="hidden md:flex items-center justify-center bg-white hover:bg-zinc-200 text-black font-bold py-2 px-4 rounded-xl transition shadow-[0_0_15px_rgba(255,255,255,0.2)] whitespace-nowrap">
                        <Plus size={18} className="mr-1" /> New Link
                    </Link>
                </div>
            </div>

            <div className="glass-panel overflow-hidden border border-white/5 shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-zinc-900/50 border-b border-white/5 text-sm uppercase tracking-wider text-zinc-500 font-semibold">
                                <th className="p-5 w-1/3">Short URL</th>
                                <th className="p-5 hidden lg:table-cell w-1/4">Destination</th>
                                <th className="p-5">Clicks</th>
                                <th className="p-5 hidden md:table-cell">Created</th>
                                <th className="p-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center">
                                        <div className="flex items-center justify-center gap-3 text-zinc-400">
                                            <div className="w-5 h-5 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                                            Loading your links...
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                <AnimatePresence>
                                    {filteredUrls.map((url, index) => (
                                        <motion.tr 
                                            key={url.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className={`border-b border-white/5 hover:bg-zinc-800/30 transition-colors group ${url.isDisabled ? 'opacity-50 grayscale' : ''}`}
                                        >
                                            <td className="p-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-indigo-500/10 p-2 rounded-lg border border-indigo-500/20 text-indigo-400">
                                                        <LinkIcon size={16} />
                                                    </div>
                                                    <div>
                                                        <a href={getShortUrl(url.shortCode)} target="_blank" rel="noreferrer" className="text-zinc-200 font-semibold hover:text-indigo-400 transition-colors">
                                                            {baseUrl.replace(/^https?:\/\//, '')}/{url.shortCode}
                                                        </a>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-5 hidden lg:table-cell">
                                                <div className="max-w-[200px] xl:max-w-xs truncate text-zinc-400 text-sm font-medium" title={url.originalUrl}>
                                                    {url.originalUrl}
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800 border border-white/5 text-sm font-bold text-zinc-300">
                                                    <BarChart2 size={14} className="text-purple-400" />
                                                    {url.clicks.toLocaleString()}
                                                </div>
                                            </td>
                                            <td className="p-5 hidden md:table-cell text-zinc-500 text-sm font-medium">
                                                {format(new Date(url.createdAt), 'MMM d, yyyy')}
                                            </td>
                                            <td className="p-5 text-right">
                                                <div className="flex justify-end items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => handleCopy(url.shortCode, url.id)} className={`p-2 rounded-lg transition-colors ${copiedId === url.id ? 'text-emerald-400 bg-emerald-400/10' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700'}`} title="Copy">
                                                        {copiedId === url.id ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                                                    </button>
                                                    <button onClick={() => showQR(url.id)} className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 rounded-lg transition-colors" title="QR Code">
                                                        <QrCode size={18} />
                                                    </button>
                                                    <Link to={`/analytics/${url.id}`} className="p-2 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-lg transition-colors" title="Analytics">
                                                        <BarChart2 size={18} />
                                                    </Link>
                                                    <div className="w-px h-4 bg-white/10 mx-1"></div>
                                                    <button onClick={() => handleToggleDisable(url.id, url.isDisabled)} className={`p-2 rounded-lg transition-colors ${url.isDisabled ? 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10' : 'text-orange-400 hover:text-orange-300 hover:bg-orange-500/10'}`} title={url.isDisabled ? 'Enable Link' : 'Disable Link'}>
                                                        <PowerOff size={18} />
                                                    </button>
                                                    <button onClick={() => handleDelete(url.id)} className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors" title="Delete">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                                {/* Mobile visible dots could go here, but for now hover state is fine if users touch the row */}
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            )}
                            
                            {!loading && filteredUrls.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-4 text-zinc-500">
                                                <LinkIcon size={32} />
                                            </div>
                                            <h3 className="text-xl font-bold text-white mb-2">No links found</h3>
                                            <p className="text-zinc-400 mb-6">{searchQuery ? "Try adjusting your search terms." : "You haven't created any short links yet."}</p>
                                            {!searchQuery && (
                                                <Link to="/" className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 px-6 rounded-lg transition-colors">
                                                    Create your first link
                                                </Link>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AnimatePresence>
                {qrCode && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4" 
                        onClick={() => setQrCode(null)}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-zinc-900 border border-white/10 p-8 rounded-2xl text-center max-w-sm w-full shadow-2xl" 
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="bg-zinc-800 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                                <QrCode size={24} className="text-indigo-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">QR Code Ready</h3>
                            <p className="text-zinc-400 text-sm mb-6">Scan this code to instantly visit your destination.</p>
                            
                            <div className="bg-white p-4 rounded-xl mb-6">
                                <img src={qrCode} alt="QR Code" className="w-full h-auto" />
                            </div>
                            
                            <div className="flex gap-3">
                                <button onClick={() => setQrCode(null)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-3 px-4 rounded-xl transition">
                                    Close
                                </button>
                                <a href={qrCode} download="qrcode.png" className="flex-1 bg-white hover:bg-zinc-200 text-black font-bold py-3 px-4 rounded-xl transition inline-flex items-center justify-center">
                                    Download
                                </a>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
