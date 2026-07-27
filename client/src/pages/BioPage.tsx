import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Share2, Check } from 'lucide-react';

const FloatingShapes = ({ theme }: { theme: string }) => {
    if (theme === 'light' || theme === 'minimal') return null;
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            {[...Array(6)].map((_, i) => (
                <motion.div
                    key={i}
                    className={`absolute rounded-full mix-blend-screen filter blur-[80px] ${i % 2 === 0 ? 'bg-indigo-500' : 'bg-purple-500'}`}
                    style={{
                        width: Math.random() * 400 + 200,
                        height: Math.random() * 400 + 200,
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        opacity: theme === 'glass' ? 0.4 : 0.15
                    }}
                    animate={{
                        x: [0, Math.random() * 200 - 100, 0],
                        y: [0, Math.random() * 200 - 100, 0],
                        scale: [1, 1.2, 0.9, 1],
                    }}
                    transition={{
                        duration: Math.random() * 15 + 15,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />
            ))}
        </div>
    );
};

export default function BioPage() {
    const { username } = useParams<{ username: string }>();
    const [page, setPage] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchPage = async () => {
            try {
                const res = await api.get(`/bio/public/${username}`);
                setPage(res.data);
            } catch (err) {
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        fetchPage();
    }, [username]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-950">
                <motion.div 
                    animate={{ rotate: 360, scale: [1, 1.2, 1] }} 
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full"
                />
            </div>
        );
    }

    if (error || !page) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-white">
                <motion.h1 initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-6xl font-black mb-4">404</motion.h1>
                <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-zinc-400 text-xl">Bio page not found</motion.p>
            </div>
        );
    }

    const { title, description, theme, links } = page;

    let bgClass = "bg-zinc-950";
    let textClass = "text-white";
    let linkClass = "bg-zinc-800 text-white hover:bg-zinc-700 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]";
    let descClass = "text-zinc-400";
    let avatarClass = "bg-gradient-to-tr from-indigo-500 to-purple-500 text-white shadow-[0_0_30px_rgba(99,102,241,0.5)]";

    if (theme === 'light') {
        bgClass = "bg-zinc-50";
        textClass = "text-zinc-900";
        linkClass = "bg-white text-zinc-900 shadow-lg border border-zinc-200 hover:shadow-xl hover:border-indigo-300";
        descClass = "text-zinc-600";
        avatarClass = "bg-gradient-to-tr from-indigo-500 to-blue-500 text-white shadow-xl";
    } else if (theme === 'glass') {
        bgClass = "bg-zinc-950"; // Handled by FloatingShapes
        textClass = "text-white";
        linkClass = "bg-white/10 text-white backdrop-blur-xl border border-white/20 hover:bg-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] hover:shadow-[0_8px_32px_0_rgba(99,102,241,0.5)] hover:border-indigo-400/50";
        descClass = "text-indigo-100/80";
        avatarClass = "bg-white/20 backdrop-blur-xl border border-white/30 text-white shadow-[0_0_40px_rgba(255,255,255,0.2)]";
    } else if (theme === 'minimal') {
        bgClass = "bg-black";
        textClass = "text-white";
        linkClass = "bg-transparent border-2 border-zinc-800 text-white hover:border-white transition-colors";
        descClass = "text-zinc-500";
        avatarClass = "bg-zinc-900 border-2 border-zinc-800 text-white";
    }

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
    };

    return (
        <div className={`min-h-screen w-full flex flex-col items-center py-16 px-4 ${bgClass} relative overflow-hidden`}>
            <FloatingShapes theme={theme} />
            
            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="w-full max-w-lg mx-auto text-center relative z-10"
            >
                <div className="absolute top-0 right-0">
                    <motion.button 
                        whileHover={{ scale: 1.1, rotate: 10 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleShare}
                        className={`p-3 rounded-full backdrop-blur-md transition-colors ${theme === 'light' ? 'bg-zinc-200/50 text-zinc-700 hover:bg-zinc-300' : 'bg-white/10 text-white hover:bg-white/20'}`}
                        title="Share profile"
                    >
                        {copied ? <Check size={20} className="text-emerald-400" /> : <Share2 size={20} />}
                    </motion.button>
                </div>

                <motion.div variants={itemVariants}>
                    <motion.div 
                        whileHover={{ scale: 1.05, rotate: 5 }}
                        whileTap={{ scale: 0.95 }}
                        className={`w-28 h-28 rounded-full mx-auto mb-6 flex items-center justify-center text-5xl font-extrabold cursor-default transition-all ${avatarClass}`}
                    >
                        {title ? title.charAt(0).toUpperCase() : 'U'}
                    </motion.div>
                </motion.div>
                
                <motion.h1 variants={itemVariants} className={`text-3xl sm:text-4xl font-extrabold mb-3 tracking-tight ${textClass}`}>
                    {title}
                </motion.h1>
                
                {description && (
                    <motion.p variants={itemVariants} className={`text-lg mb-10 max-w-sm mx-auto leading-relaxed ${descClass}`}>
                        {description}
                    </motion.p>
                )}

                <div className="space-y-4 w-full">
                    {links.map((link: any, i: number) => {
                        const href = link.url?.startsWith('http') ? link.url : `https://${link.url}`;
                        return (
                            <motion.a 
                                variants={itemVariants}
                                whileHover={{ scale: 1.03, y: -2 }}
                                whileTap={{ scale: 0.97 }}
                                key={link.id || i}
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`block w-full p-4 sm:p-5 rounded-2xl font-bold text-lg sm:text-xl transition-colors flex items-center justify-center relative group ${linkClass}`}
                            >
                                <span className="z-10">{link.title}</span>
                                <ExternalLink size={18} className="absolute right-5 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                            </motion.a>
                        );
                    })}
                </div>
            </motion.div>
            
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
                className="mt-20 relative z-10 pb-8"
            >
                <a href="/" className={`text-sm font-bold opacity-40 hover:opacity-100 transition-opacity flex items-center gap-2 ${textClass}`}>
                    <span className="w-4 h-4 rounded-full bg-indigo-500 inline-block animate-pulse"></span>
                    Powered by QuickLink
                </a>
            </motion.div>
        </div>
    );
}
