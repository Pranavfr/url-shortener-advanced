import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Lock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function Unlock() {
    const { shortCode } = useParams();
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post(`/url/unlock/${shortCode}`, { password });
            toast.success('Unlocked!');
            // Redirect to original URL
            window.location.href = res.data.originalUrl;
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Incorrect password');
            setPassword('');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center py-16 px-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="glass-panel p-8 max-w-md w-full text-center relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-3xl rounded-full pointer-events-none -mt-16 -mr-16"></div>
                
                <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-indigo-400 border border-indigo-500/20">
                    <Lock size={32} />
                </div>
                
                <h1 className="text-2xl font-bold text-white mb-2">Protected Link</h1>
                <p className="text-zinc-400 text-sm mb-8">This link requires a password to view its destination.</p>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex items-center bg-zinc-950 border border-white/10 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all">
                        <input 
                            type="password" 
                            required
                            placeholder="Enter password" 
                            className="flex-1 w-full py-3 px-4 bg-transparent text-white focus:outline-none placeholder-zinc-600 font-medium text-center" 
                            value={password} 
                            onChange={e => setPassword(e.target.value)} 
                        />
                    </div>
                    
                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit" 
                        disabled={loading} 
                        className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-6 rounded-xl transition shadow-[0_0_20px_rgba(99,102,241,0.3)] disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                        {loading ? 'Verifying...' : <>Unlock <ArrowRight size={18} /></>}
                    </motion.button>
                </form>
            </motion.div>
        </div>
    );
}
