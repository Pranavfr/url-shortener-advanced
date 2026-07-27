import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';

export default function BioPage() {
    const { username } = useParams<{ username: string }>();
    const [page, setPage] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

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
        return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;
    }

    if (error || !page) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-white">
                <h1 className="text-4xl font-bold mb-4">404</h1>
                <p className="text-zinc-400">Page not found</p>
            </div>
        );
    }

    const { title, description, theme, links } = page;

    let bgClass = "bg-zinc-950";
    let textClass = "text-white";
    let linkClass = "bg-zinc-800 text-white hover:bg-zinc-700";
    let descClass = "text-zinc-400";

    if (theme === 'light') {
        bgClass = "bg-zinc-50";
        textClass = "text-zinc-900";
        linkClass = "bg-white text-zinc-900 shadow-sm border border-zinc-200 hover:shadow-md";
        descClass = "text-zinc-600";
    } else if (theme === 'glass') {
        bgClass = "bg-gradient-to-br from-indigo-900 to-purple-900";
        textClass = "text-white";
        linkClass = "bg-white/10 text-white backdrop-blur-md border border-white/20 hover:bg-white/20 shadow-lg";
        descClass = "text-indigo-200";
    } else if (theme === 'minimal') {
        bgClass = "bg-black";
        textClass = "text-white";
        linkClass = "bg-transparent border-2 border-white text-white hover:bg-white hover:text-black transition-all";
        descClass = "text-zinc-500";
    }

    return (
        <div className={`min-h-screen w-full flex flex-col items-center py-20 px-4 ${bgClass}`}>
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-lg mx-auto text-center"
            >
                <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full mx-auto mb-6 flex items-center justify-center text-white text-4xl font-extrabold shadow-xl">
                    {title ? title.charAt(0).toUpperCase() : 'U'}
                </div>
                
                <h1 className={`text-3xl font-extrabold mb-3 tracking-tight ${textClass}`}>{title}</h1>
                {description && <p className={`text-lg mb-10 max-w-md mx-auto leading-relaxed ${descClass}`}>{description}</p>}

                <div className="space-y-4">
                    {links.map((link: any, i: number) => (
                        <motion.a 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * i }}
                            key={link.id}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`block w-full p-4 rounded-2xl font-bold text-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center relative ${linkClass}`}
                        >
                            <span>{link.title}</span>
                            <ExternalLink size={18} className="absolute right-4 opacity-50" />
                        </motion.a>
                    ))}
                </div>
            </motion.div>
            
            <div className="mt-20">
                <a href="/" className={`text-sm font-bold opacity-50 hover:opacity-100 transition-opacity ${textClass}`}>
                    Powered by QuickLink
                </a>
            </div>
        </div>
    );
}
