import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Copy, QrCode, BarChart2, Trash2, PowerOff } from 'lucide-react';
import { format } from 'date-fns';
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
    const { user } = useContext(AuthContext);
    const [urls, setUrls] = useState<Url[]>([]);
    const [qrCode, setQrCode] = useState<string | null>(null);

    useEffect(() => {
        loadUrls();
    }, []);

    const loadUrls = async () => {
        try {
            const res = await api.get('/url');
            setUrls(res.data);
        } catch (err) {
            console.error('Failed to load URLs', err);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this URL?')) {
            try {
                await api.delete(`/url/${id}`);
                setUrls(urls.filter(u => u.id !== id));
            } catch (err) {
                console.error('Failed to delete', err);
            }
        }
    };

    const handleToggleDisable = async (id: string, currentStatus: boolean) => {
        try {
            await api.put(`/url/${id}`, { isDisabled: !currentStatus });
            setUrls(urls.map(u => u.id === id ? { ...u, isDisabled: !currentStatus } : u));
        } catch (err) {
            console.error('Failed to update status', err);
        }
    };

    const showQR = async (id: string) => {
        try {
            const res = await api.get(`/url/qr/${id}`);
            setQrCode(res.data.qrCode);
        } catch (err) {
            console.error('Failed to get QR code', err);
        }
    };

    const baseUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api$/, '') : 'http://localhost:5000';
    const getShortUrl = (code: string) => `${baseUrl}/${code}`;

    return (
        <div className="py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                    <p className="text-slate-400 mt-1">Welcome back, {user?.name}</p>
                </div>
            </div>

            <div className="glass overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-800/80 border-b border-slate-700">
                                <th className="p-4 text-slate-300 font-semibold">Short URL</th>
                                <th className="p-4 text-slate-300 font-semibold hidden sm:table-cell">Original URL</th>
                                <th className="p-4 text-slate-300 font-semibold">Clicks</th>
                                <th className="p-4 text-slate-300 font-semibold hidden md:table-cell">Created</th>
                                <th className="p-4 text-slate-300 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {urls.map((url) => (
                                <tr key={url.id} className={`border-b border-slate-700/50 hover:bg-slate-800/40 transition ${url.isDisabled ? 'opacity-50' : ''}`}>
                                    <td className="p-4">
                                        <a href={getShortUrl(url.shortCode)} target="_blank" rel="noreferrer" className="text-primary hover:underline font-medium">
                                            {url.shortCode}
                                        </a>
                                    </td>
                                    <td className="p-4 hidden sm:table-cell max-w-xs truncate" title={url.originalUrl}>
                                        <span className="text-slate-400 text-sm">{url.originalUrl}</span>
                                    </td>
                                    <td className="p-4">
                                        <span className="bg-slate-700 text-slate-200 py-1 px-3 rounded-full text-xs font-bold">
                                            {url.clicks}
                                        </span>
                                    </td>
                                    <td className="p-4 hidden md:table-cell text-slate-400 text-sm">
                                        {format(new Date(url.createdAt), 'MMM d, yyyy')}
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end space-x-2">
                                            <button onClick={() => navigator.clipboard.writeText(getShortUrl(url.shortCode))} className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition" title="Copy">
                                                <Copy size={16} />
                                            </button>
                                            <button onClick={() => showQR(url.id)} className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition" title="QR Code">
                                                <QrCode size={16} />
                                            </button>
                                            <Link to={`/analytics/${url.id}`} className="p-2 text-blue-400 hover:text-blue-300 bg-slate-800 hover:bg-slate-700 rounded transition" title="Analytics">
                                                <BarChart2 size={16} />
                                            </Link>
                                            <button onClick={() => handleToggleDisable(url.id, url.isDisabled)} className={`p-2 ${url.isDisabled ? 'text-emerald-400 hover:text-emerald-300' : 'text-orange-400 hover:text-orange-300'} bg-slate-800 hover:bg-slate-700 rounded transition`} title={url.isDisabled ? 'Enable' : 'Disable'}>
                                                <PowerOff size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(url.id)} className="p-2 text-red-400 hover:text-red-300 bg-slate-800 hover:bg-slate-700 rounded transition" title="Delete">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {urls.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-400">
                                        No URLs created yet. Go to Home to shorten your first link!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {qrCode && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setQrCode(null)}>
                    <div className="bg-white p-6 rounded-xl text-center max-w-sm w-full" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-slate-900 mb-4">QR Code</h3>
                        <img src={qrCode} alt="QR Code" className="w-full h-auto mb-4 border border-slate-200 rounded" />
                        <a href={qrCode} download="qrcode.png" className="block w-full bg-primary hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition mb-2">
                            Download
                        </a>
                        <button onClick={() => setQrCode(null)} className="block w-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold py-2 px-4 rounded transition">
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
