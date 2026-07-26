import { useState } from 'react';
import { Link2, Zap, Shield, BarChart3, ChevronRight, Copy, CheckCircle2, Settings2, Lock, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';
import api from '../services/api';

export default function Home() {
    const [originalUrl, setOriginalUrl] = useState('');
    const [customAlias, setCustomAlias] = useState('');
    const [password, setPassword] = useState('');
    const [expiresAt, setExpiresAt] = useState('');
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [shortUrl, setShortUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setShortUrl('');
        try {
            const payload: any = { originalUrl };
            if (customAlias) payload.customAlias = customAlias;
            if (password) payload.password = password;
            if (expiresAt) payload.expiresAt = expiresAt;

            const res = await api.post('/url', payload);
            const baseUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api$/, '') : 'http://localhost:5000';
            setShortUrl(`${baseUrl}/${res.data.shortCode}`);
            toast.success('Link shortened successfully!');
        } catch (err: any) {
            toast.error(typeof err.response?.data?.error === 'string' ? err.response?.data?.error : 'Failed to generate short URL');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(shortUrl);
        setCopied(true);
        toast.success('Copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
    };

    const containerVariants: any = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants: any = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
    };

    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
            
            {/* Background animated blobs */}
            <div className="absolute top-20 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl opacity-50 animate-pulse pointer-events-none"></div>
            <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl opacity-50 animate-pulse pointer-events-none" style={{ animationDelay: '2s' }}></div>

            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="text-center max-w-4xl mx-auto mb-16 relative z-10"
            >
                <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-zinc-300 mb-8 backdrop-blur-md">
                    <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                    </span>
                    QuickLink v2.0 is now live
                </motion.div>
                
                <motion.h1 variants={itemVariants} className="text-6xl md:text-7xl font-extrabold tracking-tighter mb-6 text-white drop-shadow-2xl leading-tight">
                    Shorten links like <br className="hidden md:block" />
                    <span className="text-gradient">never before.</span>
                </motion.h1>
                <motion.p variants={itemVariants} className="text-lg md:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto font-medium">
                    A beautiful, lightning-fast URL shortener powered by custom C++ Data Structures. Track clicks, generate QR codes, and manage your links in style.
                </motion.p>
            </motion.div>

            <motion.div 
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.3 }}
                className="glass-panel p-2 w-full max-w-3xl mb-24 relative z-10 shadow-2xl shadow-indigo-500/10"
            >
                <div className="bg-zinc-900/80 rounded-lg p-6 md:p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <div className="flex items-center bg-zinc-950 border border-white/10 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/50 focus-within:border-indigo-500/50 transition-all shadow-inner">
                                <span className="pl-4 pr-3 text-zinc-500">
                                    <Link2 size={20} />
                                </span>
                                <input 
                                    type="url" 
                                    required 
                                    placeholder="https://your-very-long-url-goes-here.com" 
                                    className="flex-1 w-full py-4 bg-transparent text-white focus:outline-none placeholder-zinc-600 font-medium" 
                                    value={originalUrl} 
                                    onChange={e => setOriginalUrl(e.target.value)} 
                                />
                            </div>
                        </div>
                        
                        <div className="flex flex-col md:flex-row gap-4 items-center">
                            <div className="w-full md:w-2/3 flex items-center bg-zinc-950 border border-white/10 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all">
                                <span className="pl-4 pr-2 text-zinc-500 font-medium text-sm">
                                    quicklink.com/
                                </span>
                                <input 
                                    type="text" 
                                    placeholder="custom-alias" 
                                    className="flex-1 w-full py-3 bg-transparent text-white focus:outline-none placeholder-zinc-700 text-sm font-medium" 
                                    value={customAlias} 
                                    onChange={e => setCustomAlias(e.target.value)} 
                                />
                            </div>
                            
                            <motion.button 
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit" 
                                disabled={loading} 
                                className="w-full md:w-1/3 bg-white hover:bg-zinc-200 text-black font-bold py-3 px-6 rounded-xl transition shadow-[0_0_20px_rgba(255,255,255,0.3)] disabled:opacity-70 disabled:shadow-none flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                                        Shortening
                                    </span>
                                ) : (
                                    <>Shorten <ChevronRight size={18} /></>
                                )}
                            </motion.button>
                        </div>
                        
                        <div>
                            <button 
                                type="button" 
                                onClick={() => setShowAdvanced(!showAdvanced)}
                                className="flex items-center gap-2 text-zinc-400 hover:text-white text-sm font-medium transition"
                            >
                                <Settings2 size={16} /> 
                                {showAdvanced ? 'Hide Advanced Options' : 'Advanced Options (Password, Expiry)'}
                            </button>
                            
                            <AnimatePresence>
                                {showAdvanced && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden mt-4 space-y-4"
                                    >
                                        <div className="flex flex-col md:flex-row gap-4">
                                            <div className="w-full md:w-1/2 flex items-center bg-zinc-950 border border-white/10 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all">
                                                <span className="pl-4 pr-3 text-zinc-500">
                                                    <Lock size={18} />
                                                </span>
                                                <input 
                                                    type="password" 
                                                    placeholder="Set a password (optional)" 
                                                    className="flex-1 w-full py-3 bg-transparent text-white focus:outline-none placeholder-zinc-700 text-sm font-medium" 
                                                    value={password} 
                                                    onChange={e => setPassword(e.target.value)} 
                                                />
                                            </div>
                                            <div className="w-full md:w-1/2 flex items-center bg-zinc-950 border border-white/10 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all">
                                                <span className="pl-4 pr-3 text-zinc-500">
                                                    <Clock size={18} />
                                                </span>
                                                <input 
                                                    type="datetime-local" 
                                                    className="flex-1 w-full py-3 pr-4 bg-transparent text-white focus:outline-none placeholder-zinc-700 text-sm font-medium [color-scheme:dark]" 
                                                    value={expiresAt} 
                                                    onChange={e => setExpiresAt(e.target.value)} 
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </form>

                    <AnimatePresence>
                        {shortUrl && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                animate={{ opacity: 1, height: 'auto', marginTop: 32 }}
                                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="p-6 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_0_30px_rgba(99,102,241,0.15)]">
                                    <div className="flex-1 w-full text-center md:text-left">
                                        <p className="text-xs text-indigo-300 font-semibold uppercase tracking-wider mb-2">Your new link is ready</p>
                                        <a href={shortUrl} target="_blank" rel="noopener noreferrer" className="text-2xl font-bold text-white hover:text-indigo-400 transition truncate block mb-4">
                                            {shortUrl}
                                        </a>
                                        <div className="flex justify-center md:justify-start gap-3">
                                            <motion.button 
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={handleCopy} 
                                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${copied ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white text-black hover:bg-zinc-200'}`}
                                            >
                                                {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                                                {copied ? 'Copied' : 'Copy'}
                                            </motion.button>
                                            <a 
                                                href={`/dashboard`}
                                                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition bg-white/10 hover:bg-white/20 text-white"
                                            >
                                                <BarChart3 size={18} /> Stats
                                            </a>
                                        </div>
                                    </div>
                                    <div className="bg-white p-3 rounded-xl flex-shrink-0">
                                        <QRCodeSVG value={shortUrl} size={100} fgColor="#000000" bgColor="#ffffff" level="Q" />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            <motion.div 
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-100px" }}
                variants={containerVariants}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl relative z-10"
            >
                <motion.div variants={itemVariants} className="glass-panel p-8 group hover:-translate-y-2 transition duration-500">
                    <div className="bg-indigo-500/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-indigo-400 border border-indigo-500/20 group-hover:scale-110 transition duration-300">
                        <Zap size={28} />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-white">Lightning Fast</h3>
                    <p className="text-zinc-400 font-medium text-sm leading-relaxed">Powered by a custom C++ DSA module, generating zero-collision Base62 hashes instantly.</p>
                </motion.div>
                
                <motion.div variants={itemVariants} className="glass-panel p-8 group hover:-translate-y-2 transition duration-500">
                    <div className="bg-purple-500/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-purple-400 border border-purple-500/20 group-hover:scale-110 transition duration-300">
                        <BarChart3 size={28} />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-white">Advanced Analytics</h3>
                    <p className="text-zinc-400 font-medium text-sm leading-relaxed">Track every click in real-time. View beautiful charts for devices, referrers, and locations.</p>
                </motion.div>
                
                <motion.div variants={itemVariants} className="glass-panel p-8 group hover:-translate-y-2 transition duration-500">
                    <div className="bg-emerald-500/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition duration-300">
                        <Shield size={28} />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-white">Enterprise Security</h3>
                    <p className="text-zinc-400 font-medium text-sm leading-relaxed">Password protect sensitive links, set expiration dates, and manage your data with ease.</p>
                </motion.div>
            </motion.div>
        </div>
    );
}
