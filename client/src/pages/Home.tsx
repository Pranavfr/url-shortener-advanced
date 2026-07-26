import { useState } from 'react';
import { Link2, Zap, Shield, BarChart3 } from 'lucide-react';
import api from '../services/api';

export default function Home() {
    const [originalUrl, setOriginalUrl] = useState('');
    const [customAlias, setCustomAlias] = useState('');
    const [shortUrl, setShortUrl] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setShortUrl('');
        try {
            const res = await api.post('/url', { originalUrl, customAlias: customAlias || undefined });
            setShortUrl(`http://localhost:5000/${res.data.shortCode}`);
        } catch (err: any) {
            setError(typeof err.response?.data?.error === 'string' ? err.response?.data?.error : 'Failed to generate short URL');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
                <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 text-white drop-shadow-md">
                    Shorten Your Links <br className="hidden sm:block" />
                    <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">Fast and Secure</span>
                </h1>
                <p className="text-lg md:text-xl text-slate-300 mb-8">
                    Create shortened URLs with custom aliases, track analytics, and generate QR codes in seconds.
                </p>
            </div>

            <div className="glass p-6 md:p-10 w-full max-w-2xl mb-16 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent"></div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Destination URL</label>
                        <div className="flex shadow-sm rounded-md overflow-hidden">
                            <span className="inline-flex items-center px-4 bg-slate-900 border border-r-0 border-slate-700 text-slate-400 rounded-l-md">
                                <Link2 size={20} />
                            </span>
                            <input type="url" required placeholder="https://example.com/very/long/path" className="flex-1 block w-full px-4 py-3 bg-slate-900/50 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-primary rounded-none rounded-r-md placeholder-slate-500 transition" value={originalUrl} onChange={e => setOriginalUrl(e.target.value)} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Custom Alias (Optional)</label>
                        <input type="text" placeholder="my-custom-link" className="block w-full px-4 py-3 bg-slate-900/50 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-primary rounded-md placeholder-slate-500 transition" value={customAlias} onChange={e => setCustomAlias(e.target.value)} />
                    </div>
                    
                    {error && <div className="text-red-400 text-sm">{error}</div>}
                    
                    <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-primary to-accent hover:from-blue-600 hover:to-purple-600 text-white font-bold py-3 px-4 rounded-md transition duration-300 shadow-lg disabled:opacity-70">
                        {loading ? 'Generating...' : 'Shorten URL'}
                    </button>
                </form>

                {shortUrl && (
                    <div className="mt-8 p-6 bg-slate-900 border border-slate-700 rounded-xl text-center">
                        <p className="text-slate-400 mb-2">Your Short URL:</p>
                        <a href={shortUrl} target="_blank" rel="noopener noreferrer" className="text-2xl font-bold text-primary hover:underline break-all">
                            {shortUrl}
                        </a>
                        <div className="mt-4 flex justify-center">
                            <button onClick={() => navigator.clipboard.writeText(shortUrl)} className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-md transition text-sm">
                                Copy to Clipboard
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
                <div className="glass p-6 text-center hover:-translate-y-1 transition duration-300">
                    <div className="mx-auto bg-primary/20 w-16 h-16 rounded-full flex items-center justify-center mb-4 text-primary">
                        <Zap size={32} />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Lightning Fast</h3>
                    <p className="text-slate-400">Powered by a custom C++ DSA module for instant short code generation.</p>
                </div>
                <div className="glass p-6 text-center hover:-translate-y-1 transition duration-300">
                    <div className="mx-auto bg-accent/20 w-16 h-16 rounded-full flex items-center justify-center mb-4 text-accent">
                        <BarChart3 size={32} />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Detailed Analytics</h3>
                    <p className="text-slate-400">Track clicks, referrers, locations, and device types in real-time.</p>
                </div>
                <div className="glass p-6 text-center hover:-translate-y-1 transition duration-300">
                    <div className="mx-auto bg-emerald-500/20 w-16 h-16 rounded-full flex items-center justify-center mb-4 text-emerald-500">
                        <Shield size={32} />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Secure</h3>
                    <p className="text-slate-400">Protect your links with passwords, set expiry dates, and manage access.</p>
                </div>
            </div>
        </div>
    );
}
