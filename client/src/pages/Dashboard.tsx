import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Copy, QrCode, BarChart2, Trash2, PowerOff, Search, Link as LinkIcon, Plus, CheckCircle2, Folder as FolderIcon, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { QRCodeCanvas } from 'qrcode.react';
import api from '../services/api';

interface Url {
    id: string;
    originalUrl: string;
    shortCode: string;
    clicks: number;
    createdAt: string;
    isDisabled: boolean;
    folderId?: string;
}

interface Folder {
    id: string;
    name: string;
}

interface Tag {
    id: string;
    name: string;
    color: string;
}

export default function Dashboard() {
    const [urls, setUrls] = useState<Url[]>([]);
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);
    const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
    const [newFolderName, setNewFolderName] = useState('');
    const [showBulkUpload, setShowBulkUpload] = useState(false);
    const [bulkUrls, setBulkUrls] = useState('');

    useEffect(() => {
        loadUrls();
        loadMetadata();
    }, []);

    const loadMetadata = async () => {
        try {
            const [foldersRes, tagsRes] = await Promise.all([
                api.get('/meta/folders'),
                api.get('/meta/tags')
            ]);
            setFolders(foldersRes.data);
            setTags(tagsRes.data);
        } catch (err) {
            console.error('Failed to load metadata');
        }
    };

    const handleCreateFolder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newFolderName.trim()) return;
        try {
            const res = await api.post('/meta/folders', { name: newFolderName });
            setFolders([...folders, res.data]);
            setNewFolderName('');
            toast.success('Folder created');
        } catch (e) {
            toast.error('Failed to create folder');
        }
    };

    const handleBulkSubmit = async () => {
        const urlsArray = bulkUrls.split('\n').filter(u => u.trim()).map(u => ({ originalUrl: u.trim() }));
        if (urlsArray.length === 0) return toast.error('Please enter at least one URL');
        
        try {
            await api.post('/url/bulk', { urls: urlsArray });
            toast.success(`Successfully shortened ${urlsArray.length} URLs`);
            setBulkUrls('');
            setShowBulkUpload(false);
            loadUrls();
        } catch (e) {
            toast.error('Failed to bulk process URLs');
        }
    };

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

    const showQR = (code: string) => {
        setQrCode(code);
    };

    const handleCopy = (code: string, id: string) => {
        navigator.clipboard.writeText(getShortUrl(code));
        setCopiedId(id);
        toast.success('Copied to clipboard');
        setTimeout(() => setCopiedId(null), 2000);
    };

    const baseUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api$/, '') : 'http://localhost:5000';
    const getShortUrl = (code: string) => `${baseUrl}/${code}`;

    const filteredUrls = urls.filter(u => {
        const matchesSearch = u.shortCode.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              u.originalUrl.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFolder = selectedFolderId ? u.folderId === selectedFolderId : true;
        return matchesSearch && matchesFolder;
    });

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-8"
        >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                <div>
                    <h1 className="text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400 tracking-tight mb-2">Your Links</h1>
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
                    <button onClick={() => setShowBulkUpload(true)} className="hidden md:flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-2 px-4 rounded-xl transition whitespace-nowrap">
                        <Upload size={18} className="mr-2" /> Bulk
                    </button>
                    <Link to="/" className="hidden md:flex items-center justify-center glow-button px-5 py-2 rounded-xl whitespace-nowrap">
                        <Plus size={18} className="mr-1" /> New Link
                    </Link>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar */}
                <div className="w-full lg:w-64 flex-shrink-0">
                    <div className="glass-premium p-4 mb-6">
                        <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-4 px-2">Folders</h3>
                        <ul className="space-y-1 mb-4">
                            <li>
                                <button 
                                    onClick={() => setSelectedFolderId(null)}
                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedFolderId === null ? 'bg-indigo-500/20 text-indigo-400' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
                                >
                                    <FolderIcon size={16} /> All Links
                                </button>
                            </li>
                            {folders.map(f => (
                                <li key={f.id}>
                                    <button 
                                        onClick={() => setSelectedFolderId(f.id)}
                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedFolderId === f.id ? 'bg-indigo-500/20 text-indigo-400' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
                                    >
                                        <FolderIcon size={16} /> {f.name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                        <form onSubmit={handleCreateFolder} className="px-2">
                            <input 
                                type="text"
                                placeholder="+ New Folder"
                                value={newFolderName}
                                onChange={e => setNewFolderName(e.target.value)}
                                className="w-full bg-transparent border-b border-white/10 py-1 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                            />
                        </form>
                    </div>

                    <div className="glass-premium p-4">
                        <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-4 px-2">Tags</h3>
                        <div className="flex flex-wrap gap-2 px-2">
                            {tags.map(t => (
                                <span key={t.id} className="text-xs font-bold px-2 py-1 rounded-md bg-zinc-800 text-white" style={{ borderLeft: `3px solid ${t.color}` }}>
                                    {t.name}
                                </span>
                            ))}
                            {tags.length === 0 && <span className="text-zinc-600 text-xs font-medium">No tags created</span>}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 min-w-0">
                    <div className="glass-premium overflow-hidden border border-white/5 shadow-2xl">
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
                                                    <button onClick={() => showQR(url.shortCode)} className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 rounded-lg transition-colors" title="QR Code">
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
                                                <Link to="/" className="glow-button py-2.5 px-6 rounded-xl transition-colors">
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
            </div>
            </div>

            {/* Bulk Upload Modal */}
            <AnimatePresence>
                {showBulkUpload && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4" 
                        onClick={() => setShowBulkUpload(false)}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="glass-premium p-8 max-w-xl w-full" 
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold text-white">Bulk Shorten URLs</h3>
                                <button onClick={() => setShowBulkUpload(false)} className="text-zinc-500 hover:text-white"><Trash2 size={20} /></button>
                            </div>
                            <p className="text-zinc-400 text-sm mb-4">Paste one URL per line to shorten multiple links at once.</p>
                            
                            <textarea
                                value={bulkUrls}
                                onChange={e => setBulkUrls(e.target.value)}
                                rows={8}
                                className="w-full bg-zinc-950 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-indigo-500 font-mono text-sm mb-6"
                                placeholder="https://example.com/1&#10;https://example.com/2"
                            ></textarea>
                            
                            <div className="flex gap-3">
                                <button onClick={() => setShowBulkUpload(false)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-3 px-4 rounded-xl transition">
                                    Cancel
                                </button>
                                <button onClick={handleBulkSubmit} className="flex-1 glow-button py-3 px-4 rounded-xl transition inline-flex items-center justify-center">
                                    <Upload size={18} className="mr-2"/> Process Links
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

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
                            className="glass-premium p-8 text-center max-w-sm w-full" 
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="bg-zinc-800 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                                <QrCode size={24} className="text-indigo-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">QR Code Ready</h3>
                            <p className="text-zinc-400 text-sm mb-6">Scan this code to instantly visit your destination.</p>
                            
                            <div className="bg-white p-4 rounded-xl mb-6 flex justify-center">
                                <QRCodeCanvas id="dashboard-qr" value={getShortUrl(qrCode)} size={200} fgColor="#000000" bgColor="#ffffff" level="Q" />
                            </div>
                            
                            <div className="flex gap-3">
                                <button onClick={() => setQrCode(null)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-3 px-4 rounded-xl transition">
                                    Close
                                </button>
                                <button 
                                    onClick={() => {
                                        const canvas = document.getElementById('dashboard-qr') as HTMLCanvasElement;
                                        if (canvas) {
                                            const pngUrl = canvas.toDataURL('image/png');
                                            const downloadLink = document.createElement('a');
                                            downloadLink.href = pngUrl;
                                            downloadLink.download = 'quicklink-qr.png';
                                            downloadLink.click();
                                        }
                                    }}
                                    className="flex-1 glow-button py-3 px-4 rounded-xl transition inline-flex items-center justify-center"
                                >
                                    Download
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
