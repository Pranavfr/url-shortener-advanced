import { useState, useEffect } from 'react';
import { Terminal, Key, Trash2, Plus, Copy, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function Developer() {
    const [apiKeys, setApiKeys] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [newKeyName, setNewKeyName] = useState('');
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    const fetchApiKeys = async () => {
        try {
            const res = await api.get('/keys');
            setApiKeys(res.data);
        } catch (err) {
            toast.error('Failed to load API keys');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApiKeys();
    }, []);

    const handleCreateKey = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        try {
            const res = await api.post('/keys', { name: newKeyName });
            setApiKeys([...apiKeys, res.data]);
            setNewKeyName('');
            toast.success('API Key generated!');
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to generate key');
        } finally {
            setCreating(false);
        }
    };

    const handleRevokeKey = async (id: string) => {
        if (!window.confirm('Are you sure you want to revoke this key? Any applications using it will immediately lose access.')) return;
        
        try {
            await api.delete(`/keys/${id}`);
            setApiKeys(apiKeys.filter(k => k.id !== id));
            toast.success('API Key revoked');
        } catch (err) {
            toast.error('Failed to revoke key');
        }
    };

    const handleCopy = (key: string) => {
        navigator.clipboard.writeText(key);
        setCopiedKey(key);
        toast.success('Copied to clipboard');
        setTimeout(() => setCopiedKey(null), 2000);
    };

    return (
        <div className="py-8">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">Developer Settings</h1>
                <p className="text-zinc-400 text-lg">Manage your API keys to integrate QuickLink with your applications.</p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Create Key Form */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="lg:col-span-1"
                >
                    <div className="glass-panel p-6 shadow-2xl relative overflow-hidden h-full">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none -mt-16 -mr-16"></div>
                        <h3 className="text-xl font-bold mb-4 flex items-center text-white">
                            <Key size={20} className="mr-2 text-indigo-400" /> Generate New Key
                        </h3>
                        <p className="text-zinc-400 text-sm mb-6">Create a new API key to authenticate requests. Keep this key secret.</p>
                        
                        <form onSubmit={handleCreateKey} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Key Name</label>
                                <input 
                                    type="text" 
                                    required 
                                    placeholder="e.g. Zapier Integration" 
                                    className="w-full py-3 px-4 bg-zinc-950 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500/50 transition-colors placeholder-zinc-700" 
                                    value={newKeyName} 
                                    onChange={e => setNewKeyName(e.target.value)} 
                                />
                            </div>
                            <button 
                                type="submit" 
                                disabled={creating || !newKeyName}
                                className="w-full bg-white hover:bg-zinc-200 text-black font-bold py-3 px-4 rounded-xl transition shadow-[0_0_20px_rgba(255,255,255,0.2)] disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
                            >
                                {creating ? 'Generating...' : <><Plus size={18} /> Generate Key</>}
                            </button>
                        </form>
                    </div>
                </motion.div>

                {/* API Keys List */}
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-2"
                >
                    <div className="glass-panel overflow-hidden border border-white/5 shadow-2xl h-full flex flex-col">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-zinc-900/50">
                            <h3 className="text-lg font-bold text-white flex items-center">
                                <Terminal size={18} className="mr-2 text-indigo-400" /> Active API Keys
                            </h3>
                        </div>
                        
                        <div className="flex-1 overflow-x-auto p-6">
                            {loading ? (
                                <div className="h-full flex items-center justify-center text-zinc-500">Loading keys...</div>
                            ) : apiKeys.length > 0 ? (
                                <div className="space-y-4">
                                    <AnimatePresence>
                                        {apiKeys.map((key) => (
                                            <motion.div 
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                key={key.id}
                                                className="bg-zinc-900 border border-white/5 rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between overflow-hidden"
                                            >
                                                <div className="flex-1 w-full overflow-hidden">
                                                    <div className="font-semibold text-white mb-1">{key.name}</div>
                                                    <div className="flex items-center gap-2 text-xs text-zinc-500 mb-2">
                                                        <span>Created {new Date(key.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 bg-zinc-950 px-3 py-2 rounded-lg border border-white/5 w-full">
                                                        <code className="text-indigo-300 text-sm flex-1 truncate font-mono select-all">
                                                            {key.key}
                                                        </code>
                                                        <button 
                                                            onClick={() => handleCopy(key.key)}
                                                            className="text-zinc-400 hover:text-white transition p-1"
                                                            title="Copy Key"
                                                        >
                                                            {copiedKey === key.key ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Copy size={16} />}
                                                        </button>
                                                    </div>
                                                </div>
                                                
                                                <div className="sm:pl-4 sm:border-l border-white/10 w-full sm:w-auto flex justify-end">
                                                    <button 
                                                        onClick={() => handleRevokeKey(key.id)}
                                                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1"
                                                    >
                                                        <Trash2 size={16} /> Revoke
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-zinc-500 py-12">
                                    <Key size={48} className="mb-4 opacity-20" />
                                    No API keys generated yet.
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
