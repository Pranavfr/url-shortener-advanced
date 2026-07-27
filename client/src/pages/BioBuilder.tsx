import { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Layout, Palette, Link as LinkIcon, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function BioBuilder() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [username, setUsername] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [theme, setTheme] = useState('dark');
    const [links, setLinks] = useState([{ title: '', url: '', icon: '' }]);

    useEffect(() => {
        loadBioPage();
    }, []);

    const loadBioPage = async () => {
        try {
            const res = await api.get('/bio');
            if (res.data) {
                setUsername(res.data.username || '');
                setTitle(res.data.title || '');
                setDescription(res.data.description || '');
                setTheme(res.data.theme || 'dark');
                if (res.data.links && res.data.links.length > 0) {
                    setLinks(res.data.links);
                }
            }
        } catch (err) {
            // Probably doesn't exist yet, that's fine
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.post('/bio', {
                username,
                title,
                description,
                theme,
                links: links.filter(l => l.title && l.url)
            });
            toast.success('Link in Bio page saved!');
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to save page');
        } finally {
            setSaving(false);
        }
    };

    const addLink = () => {
        setLinks([...links, { title: '', url: '', icon: '' }]);
    };

    const removeLink = (index: number) => {
        setLinks(links.filter((_, i) => i !== index));
    };

    const updateLink = (index: number, field: string, value: string) => {
        const newLinks: any = [...links];
        newLinks[index][field] = value;
        setLinks(newLinks);
    };

    if (loading) {
        return <div className="py-20 text-center text-white">Loading builder...</div>;
    }

    const baseUrl = import.meta.env.VITE_FRONTEND_URL || window.location.origin;

    return (
        <div className="py-8">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8"
            >
                <div>
                    <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">Link in Bio Builder</h1>
                    <p className="text-zinc-400 text-lg">Create a beautiful, customizable landing page for all your links.</p>
                </div>
                {username && (
                    <a href={`/bio/${username}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-xl transition shadow-[0_0_15px_rgba(99,102,241,0.4)]">
                        <User size={18} /> View Live Page
                    </a>
                )}
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Builder Form */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                >
                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="glass-premium p-6">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center"><Layout size={18} className="mr-2 text-indigo-400" /> Page Info</h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Username (URL Path)</label>
                                    <div className="flex items-center bg-zinc-950 border border-white/10 rounded-xl overflow-hidden focus-within:ring-2 focus-within:border-indigo-500/50 transition-colors">
                                        <span className="pl-4 pr-2 text-zinc-500 text-sm">{baseUrl.replace(/^https?:\/\//, '')}/bio/</span>
                                        <input type="text" required placeholder="yourname" value={username} onChange={e => setUsername(e.target.value)} className="flex-1 w-full py-3 pr-4 bg-transparent text-white focus:outline-none placeholder-zinc-700 font-medium" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Page Title</label>
                                    <input type="text" required placeholder="My Awesome Links" value={title} onChange={e => setTitle(e.target.value)} className="w-full py-3 px-4 bg-zinc-950 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:border-indigo-500/50 transition-colors placeholder-zinc-700" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Description</label>
                                    <textarea placeholder="Welcome to my world..." value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full py-3 px-4 bg-zinc-950 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:border-indigo-500/50 transition-colors placeholder-zinc-700"></textarea>
                                </div>
                            </div>
                        </div>

                        <div className="glass-premium p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-white flex items-center"><LinkIcon size={18} className="mr-2 text-indigo-400" /> Links</h3>
                                <button type="button" onClick={addLink} className="text-sm font-medium text-indigo-400 hover:text-indigo-300 flex items-center"><Plus size={16} className="mr-1" /> Add Link</button>
                            </div>
                            
                            <div className="space-y-4">
                                <AnimatePresence>
                                    {links.map((link, index) => (
                                        <motion.div 
                                            key={index}
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="bg-zinc-900 border border-white/5 p-4 rounded-xl relative"
                                        >
                                            <button type="button" onClick={() => removeLink(index)} className="absolute top-4 right-4 text-zinc-500 hover:text-red-400 transition-colors"><Trash2 size={18} /></button>
                                            <div className="space-y-3 pr-8">
                                                <input type="text" placeholder="Title (e.g. My Portfolio)" value={link.title} onChange={e => updateLink(index, 'title', e.target.value)} className="w-full py-2 px-3 bg-zinc-950 border border-white/5 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500/50" />
                                                <input type="text" placeholder="URL (e.g. https://example.com or example.com)" value={link.url} onChange={e => updateLink(index, 'url', e.target.value)} className="w-full py-2 px-3 bg-zinc-950 border border-white/5 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500/50" />
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                {links.length === 0 && <p className="text-zinc-500 text-sm text-center py-4">No links added yet.</p>}
                            </div>
                        </div>

                        <div className="glass-premium p-6">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center"><Palette size={18} className="mr-2 text-indigo-400" /> Theme</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {['dark', 'light', 'glass', 'minimal'].map(t => (
                                    <button 
                                        key={t}
                                        type="button"
                                        onClick={() => setTheme(t)}
                                        className={`py-3 rounded-xl border font-semibold capitalize transition ${theme === t ? 'bg-indigo-500 border-indigo-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'bg-zinc-900 border-white/10 text-zinc-400 hover:text-white'}`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={saving}
                            className="w-full glow-button py-4 px-6 rounded-xl transition shadow-[0_0_20px_rgba(255,255,255,0.2)] disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2 text-lg"
                        >
                            {saving ? 'Saving...' : <><Save size={20} /> Save Bio Page</>}
                        </button>
                    </form>
                </motion.div>

                {/* Live Preview */}
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="hidden lg:block relative"
                >
                    <div className="sticky top-32 w-[320px] h-[650px] mx-auto border-[12px] border-zinc-900 rounded-[3rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-zinc-950 ring-1 ring-white/10">
                        {/* Phone Notch */}
                        <div className="absolute top-0 inset-x-0 h-6 bg-zinc-900 w-40 mx-auto rounded-b-xl z-20"></div>
                        
                        {/* Preview Content */}
                        <div className={`w-full h-full p-6 pt-12 overflow-y-auto ${theme === 'light' ? 'bg-zinc-100' : theme === 'glass' ? 'bg-gradient-to-br from-indigo-900 to-purple-900' : 'bg-zinc-950'}`}>
                            <div className="text-center mb-8 mt-4">
                                <div className="w-20 h-20 bg-indigo-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                                    {title ? title.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <h2 className={`text-xl font-bold ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>{title || 'Your Title'}</h2>
                                <p className={`text-sm mt-2 ${theme === 'light' ? 'text-zinc-600' : 'text-zinc-400'}`}>{description || 'Your description goes here...'}</p>
                            </div>
                            
                            <div className="space-y-4">
                                {links.filter(l => l.title || l.url).map((link, i) => (
                                    <div key={i} className={`p-4 rounded-xl text-center font-semibold transition transform hover:scale-105 cursor-pointer ${theme === 'light' ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200' : theme === 'glass' ? 'bg-white/10 text-white backdrop-blur-md border border-white/20' : 'bg-zinc-800 text-white'}`}>
                                        {link.title || 'Link Title'}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
