import { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Link2, LogOut, LayoutDashboard, Home, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Navbar() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const isActive = (path: string) => location.pathname === path;

    return (
        <motion.nav 
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="sticky top-0 z-50 glass rounded-none border-x-0 border-t-0 mb-8"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center space-x-2">
                        <Link to="/" className="flex items-center space-x-2 group">
                            <div className="bg-zinc-800 p-2 rounded-xl shadow-inner group-hover:bg-zinc-700 transition">
                                <Link2 className="h-6 w-6 text-indigo-400 group-hover:text-indigo-300" />
                            </div>
                            <span className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-zinc-400 tracking-tight">
                                QuickLink
                            </span>
                        </Link>
                    </motion.div>
                    
                    <div className="flex items-center space-x-6">
                        <Link 
                            to="/" 
                            className={`flex items-center gap-2 text-sm font-medium transition-colors ${isActive('/') ? 'text-indigo-400' : 'text-zinc-400 hover:text-zinc-100'}`}
                        >
                            <Home size={16} /> <span className="hidden sm:inline">Home</span>
                        </Link>
                        
                        {user ? (
                            <>
                                <Link 
                                    to="/dashboard" 
                                    className={`flex items-center gap-2 text-sm font-medium transition-colors ${isActive('/dashboard') ? 'text-indigo-400' : 'text-zinc-400 hover:text-zinc-100'}`}
                                >
                                    <LayoutDashboard size={16} /> <span className="hidden sm:inline">Dashboard</span>
                                </Link>
                                <div className="flex items-center space-x-4 ml-2 pl-6 border-l border-white/10">
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
                                        <div className="bg-indigo-500/20 p-1 rounded-full"><User size={14} className="text-indigo-400"/></div>
                                        <span className="text-zinc-200 text-sm font-medium pr-1">{user.name}</span>
                                    </div>
                                    <motion.button 
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleLogout} 
                                        className="text-zinc-400 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-400/10" 
                                        title="Logout"
                                    >
                                        <LogOut size={18} />
                                    </motion.button>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center space-x-4 ml-2 pl-6 border-l border-white/10">
                                <Link to="/login" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">Sign in</Link>
                                <Link to="/register" className="text-sm font-medium bg-white text-black hover:bg-zinc-200 px-4 py-2 rounded-full transition shadow-lg shadow-white/10">
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.nav>
    );
}
