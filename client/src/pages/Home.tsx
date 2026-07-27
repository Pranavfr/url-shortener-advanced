import { useState } from 'react';
import { Link2, Zap, Shield, BarChart3, ChevronRight, Copy, CheckCircle2, Settings2, Lock, Clock, Tags, QrCode } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { QRCodeCanvas } from 'qrcode.react';
import api from '../services/api';

export default function Home() {
    const [originalUrl, setOriginalUrl] = useState('');
    const [customAlias, setCustomAlias] = useState('');
    const [password, setPassword] = useState('');
    const [expiresAt, setExpiresAt] = useState('');
    const [utmSource, setUtmSource] = useState('');
    const [utmMedium, setUtmMedium] = useState('');
    const [utmCampaign, setUtmCampaign] = useState('');
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [showUtm, setShowUtm] = useState(false);
    const [shortUrl, setShortUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setShortUrl('');
        try {
            let finalUrl = originalUrl;
            
            // Build UTM query string
            if (utmSource || utmMedium || utmCampaign) {
                try {
                    const urlObj = new URL(originalUrl);
                    if (utmSource) urlObj.searchParams.set('utm_source', utmSource);
                    if (utmMedium) urlObj.searchParams.set('utm_medium', utmMedium);
                    if (utmCampaign) urlObj.searchParams.set('utm_campaign', utmCampaign);
                    finalUrl = urlObj.toString();
                } catch(e) {
                    toast.error('Invalid URL for UTM parameters');
                    setLoading(false);
                    return;
                }
            }

            const payload: any = { originalUrl: finalUrl };
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
        hidden: { opacity: 0, y: 30 },
        show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } }
    };

    return (
        <div className="flex flex-col items-center justify-center py-20 px-4 sm:px-6 lg:px-8 overflow-hidden relative">
            
            {/* Ultra-premium animated backgrounds */}
            <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] opacity-70 animate-blob pointer-events-none mix-blend-screen"></div>
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] opacity-70 animate-blob pointer-events-none mix-blend-screen" style={{ animationDelay: '2s' }}></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-pink-600/5 rounded-full blur-[150px] opacity-50 animate-blob pointer-events-none mix-blend-screen" style={{ animationDelay: '4s' }}></div>

            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="text-center max-w-5xl mx-auto mb-20 relative z-10"
            >
                <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm font-semibold text-zinc-300 mb-8 backdrop-blur-xl shadow-[0_0_20px_rgba(255,255,255,0.05)]">
                    <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                    </span>
                    QuickLink v3.0 Premium is live
                </motion.div>
                
                <motion.h1 variants={itemVariants} className="text-6xl md:text-8xl font-black tracking-tighter mb-6 text-white drop-shadow-2xl leading-[1.1]">
                    Shorten links like <br className="hidden md:block" />
                    <span className="text-gradient-animated">never before.</span>
                </motion.h1>
                <motion.p variants={itemVariants} className="text-lg md:text-2xl text-zinc-400 mb-12 max-w-3xl mx-auto font-medium leading-relaxed">
                    A beautiful, lightning-fast URL shortener powered by custom C++ Data Structures. Track clicks, generate QR codes, and manage your links in style.
                </motion.p>
            </motion.div>

            <motion.div 
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.3 }}
                className="glass-premium p-1.5 w-full max-w-4xl mb-32 relative z-10"
            >
                <div className="bg-zinc-950/90 rounded-xl p-6 md:p-10 shadow-inner">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <div className="flex items-center bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden focus-within:ring-4 focus-within:ring-indigo-500/20 focus-within:border-indigo-500/50 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]">
                                <span className="pl-5 pr-3 text-zinc-500">
                                    <Link2 size={24} />
                                </span>
                                <input 
                                    type="url" 
                                    required 
                                    placeholder="https://your-very-long-url-goes-here.com" 
                                    className="flex-1 w-full py-5 bg-transparent text-white focus:outline-none placeholder-zinc-600 font-semibold text-lg" 
                                    value={originalUrl} 
                                    onChange={e => setOriginalUrl(e.target.value)} 
                                />
                            </div>
                        </div>
                        
                        <div className="flex flex-col md:flex-row gap-4 items-center">
                            <div className="w-full md:w-2/3 flex items-center bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden focus-within:ring-4 focus-within:ring-indigo-500/20 focus-within:border-indigo-500/50 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]">
                                <span className="pl-5 pr-2 text-zinc-500 font-semibold text-base">
                                    quicklink.com/
                                </span>
                                <input 
                                    type="text" 
                                    placeholder="custom-alias" 
                                    className="flex-1 w-full py-4 bg-transparent text-white focus:outline-none placeholder-zinc-700 text-base font-semibold" 
                                    value={customAlias} 
                                    onChange={e => setCustomAlias(e.target.value)} 
                                />
                            </div>
                            
                            <motion.button 
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit" 
                                disabled={loading} 
                                className="w-full md:w-1/3 glow-button py-4 rounded-2xl text-lg flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                                        Shortening
                                    </span>
                                ) : (
                                    <>Shorten Now <ChevronRight size={20} strokeWidth={3} /></>
                                )}
                            </motion.button>
                        </div>
                        
                        <div>
                            <button 
                                type="button" 
                                onClick={() => setShowAdvanced(!showAdvanced)}
                                className="flex items-center gap-2 text-zinc-400 hover:text-white text-sm font-semibold transition"
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
                                            <div className="w-full md:w-1/2 flex items-center bg-zinc-900 border border-white/10 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all">
                                                <span className="pl-4 pr-3 text-zinc-500">
                                                    <Lock size={18} />
                                                </span>
                                                <input 
                                                    type="password" 
                                                    placeholder="Set a password (optional)" 
                                                    className="flex-1 w-full py-3 bg-transparent text-white focus:outline-none placeholder-zinc-600 text-sm font-medium" 
                                                    value={password} 
                                                    onChange={e => setPassword(e.target.value)} 
                                                />
                                            </div>
                                            <div className="w-full md:w-1/2 flex items-center bg-zinc-900 border border-white/10 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all">
                                                <span className="pl-4 pr-3 text-zinc-500">
                                                    <Clock size={18} />
                                                </span>
                                                <input 
                                                    type="datetime-local" 
                                                    className="flex-1 w-full py-3 pr-4 bg-transparent text-white focus:outline-none placeholder-zinc-600 text-sm font-medium [color-scheme:dark]" 
                                                    value={expiresAt} 
                                                    onChange={e => setExpiresAt(e.target.value)} 
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div>
                            <button 
                                type="button" 
                                onClick={() => setShowUtm(!showUtm)}
                                className="flex items-center gap-2 text-zinc-400 hover:text-white text-sm font-semibold transition"
                            >
                                <Tags size={16} /> 
                                {showUtm ? 'Hide UTM Builder' : 'UTM Campaign Builder'}
                            </button>
                            
                            <AnimatePresence>
                                {showUtm && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden mt-4 space-y-4"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="flex items-center bg-zinc-900 border border-white/10 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all">
                                                <input 
                                                    type="text" 
                                                    placeholder="utm_source (e.g. google)" 
                                                    className="flex-1 w-full py-3 px-4 bg-transparent text-white focus:outline-none placeholder-zinc-600 text-sm font-medium" 
                                                    value={utmSource} 
                                                    onChange={e => setUtmSource(e.target.value)} 
                                                />
                                            </div>
                                            <div className="flex items-center bg-zinc-900 border border-white/10 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all">
                                                <input 
                                                    type="text" 
                                                    placeholder="utm_medium (e.g. cpc)" 
                                                    className="flex-1 w-full py-3 px-4 bg-transparent text-white focus:outline-none placeholder-zinc-600 text-sm font-medium" 
                                                    value={utmMedium} 
                                                    onChange={e => setUtmMedium(e.target.value)} 
                                                />
                                            </div>
                                            <div className="flex items-center bg-zinc-900 border border-white/10 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all">
                                                <input 
                                                    type="text" 
                                                    placeholder="utm_campaign (e.g. summer_sale)" 
                                                    className="flex-1 w-full py-3 px-4 bg-transparent text-white focus:outline-none placeholder-zinc-600 text-sm font-medium" 
                                                    value={utmCampaign} 
                                                    onChange={e => setUtmCampaign(e.target.value)} 
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
                                <div className="p-8 bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-8 shadow-[0_0_40px_rgba(99,102,241,0.2)]">
                                    <div className="flex-1 w-full text-center md:text-left">
                                        <p className="text-sm text-indigo-300 font-bold uppercase tracking-widest mb-3">Your new link is ready</p>
                                        <a href={shortUrl} target="_blank" rel="noopener noreferrer" className="text-3xl font-black text-white hover:text-indigo-400 transition truncate block mb-6">
                                            {shortUrl}
                                        </a>
                                        <div className="flex justify-center md:justify-start gap-4">
                                            <motion.button 
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={handleCopy} 
                                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition ${copied ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white text-black hover:bg-zinc-200 shadow-lg'}`}
                                            >
                                                {copied ? <CheckCircle2 size={20} /> : <Copy size={20} />}
                                                {copied ? 'Copied' : 'Copy'}
                                            </motion.button>
                                            <motion.button 
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => {
                                                    const canvas = document.getElementById('qr-canvas') as HTMLCanvasElement;
                                                    if (canvas) {
                                                        const pngUrl = canvas.toDataURL('image/png');
                                                        const downloadLink = document.createElement('a');
                                                        downloadLink.href = pngUrl;
                                                        downloadLink.download = 'quicklink-qr.png';
                                                        downloadLink.click();
                                                        toast.success('QR Code downloaded');
                                                    }
                                                }}
                                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition bg-white/10 hover:bg-white/20 text-white backdrop-blur-md"
                                            >
                                                <QrCode size={20} /> Save QR
                                            </motion.button>
                                            <motion.a 
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                href={`/dashboard`}
                                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                                            >
                                                <BarChart3 size={20} /> Stats
                                            </motion.a>
                                        </div>
                                    </div>
                                    <div className="bg-white p-4 rounded-2xl flex-shrink-0 shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-300">
                                        <QRCodeCanvas id="qr-canvas" value={shortUrl} size={130} fgColor="#000000" bgColor="#ffffff" level="Q" />
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
                className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl relative z-10"
            >
                <motion.div variants={itemVariants} className="glass-panel p-10 group hover:-translate-y-3 transition-all duration-500 cursor-default">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 text-white shadow-[0_0_20px_rgba(99,102,241,0.5)] group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(99,102,241,0.8)] transition-all duration-300">
                        <Zap size={32} />
                    </div>
                    <h3 className="text-2xl font-black mb-4 text-white">Lightning Fast</h3>
                    <p className="text-zinc-400 font-medium text-base leading-relaxed">Powered by a custom C++ DSA module, generating zero-collision Base62 hashes instantly.</p>
                </motion.div>
                
                <motion.div variants={itemVariants} className="glass-panel p-10 group hover:-translate-y-3 transition-all duration-500 cursor-default">
                    <div className="bg-gradient-to-br from-purple-500 to-pink-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 text-white shadow-[0_0_20px_rgba(168,85,247,0.5)] group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(168,85,247,0.8)] transition-all duration-300">
                        <BarChart3 size={32} />
                    </div>
                    <h3 className="text-2xl font-black mb-4 text-white">Advanced Analytics</h3>
                    <p className="text-zinc-400 font-medium text-base leading-relaxed">Track every click in real-time. View beautiful charts for devices, referrers, and locations.</p>
                </motion.div>
                
                <motion.div variants={itemVariants} className="glass-panel p-10 group hover:-translate-y-3 transition-all duration-500 cursor-default">
                    <div className="bg-gradient-to-br from-emerald-400 to-cyan-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 text-white shadow-[0_0_20px_rgba(52,211,153,0.5)] group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(52,211,153,0.8)] transition-all duration-300">
                        <Shield size={32} />
                    </div>
                    <h3 className="text-2xl font-black mb-4 text-white">Enterprise Security</h3>
                    <p className="text-zinc-400 font-medium text-base leading-relaxed">Password protect sensitive links, set expiration dates, and manage your data with ease.</p>
                </motion.div>
            </motion.div>
        </div>
    );
}
