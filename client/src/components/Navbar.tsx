import { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Link2, LogOut, LayoutDashboard, Home, User, Terminal } from 'lucide-react';
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
            className="sticky top-0 z-50 glass-premium rounded-none border-x-0 border-t-0 mb-8 border-b border-white/5"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center space-x-2">
                        <Link to="/" className="flex items-center space-x-2 group">
                            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.5)] group-hover:shadow-[0_0_25px_rgba(99,102,241,0.7)] transition-all">
                                <Link2 className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400 tracking-tight ml-1">
                                QuickLink
                            </span>
                        </Link>
                    </motion.div>
                    
                    <div className="flex items-center space-x-6">
                        <Link 
                            to="/" 
                            className={`flex items-center gap-2 text-sm font-semibold transition-colors relative ${isActive('/') ? 'text-white' : 'text-zinc-400 hover:text-white'}`}
                        >
                            <Home size={16} /> <span className="hidden sm:inline">Home</span>
                            {isActive('/') && <motion.div layoutId="nav-pill" className="absolute -bottom-7 left-0 right-0 h-1 bg-indigo-500 rounded-t-full shadow-[0_0_10px_rgba(99,102,241,1)]" />}
                        </Link>
                        
                        {user ? (
                            <>
                                <Link 
                                    to="/dashboard" 
                                    className={`flex items-center gap-2 text-sm font-semibold transition-colors relative ${isActive('/dashboard') ? 'text-white' : 'text-zinc-400 hover:text-white'}`}
                                >
                                    <LayoutDashboard size={16} /> <span className="hidden sm:inline">Dashboard</span>
                                    {isActive('/dashboard') && <motion.div layoutId="nav-pill" className="absolute -bottom-7 left-0 right-0 h-1 bg-indigo-500 rounded-t-full shadow-[0_0_10px_rgba(99,102,241,1)]" />}
                                </Link>
                                <Link 
                                    to="/developer" 
                                    className={`flex items-center gap-2 text-sm font-semibold transition-colors relative ${isActive('/developer') ? 'text-white' : 'text-zinc-400 hover:text-white'}`}
                                >
                                    <Terminal size={16} /> <span className="hidden sm:inline">Developer</span>
                                    {isActive('/developer') && <motion.div layoutId="nav-pill" className="absolute -bottom-7 left-0 right-0 h-1 bg-indigo-500 rounded-t-full shadow-[0_0_10px_rgba(99,102,241,1)]" />}
                                </Link>
                                <Link 
                                    to="/bio-builder" 
                                    className={`flex items-center gap-2 text-sm font-semibold transition-colors relative ${isActive('/bio-builder') ? 'text-white' : 'text-zinc-400 hover:text-white'}`}
                                >
                                    <User size={16} /> <span className="hidden sm:inline">Link in Bio</span>
                                    {isActive('/bio-builder') && <motion.div layoutId="nav-pill" className="absolute -bottom-7 left-0 right-0 h-1 bg-indigo-500 rounded-t-full shadow-[0_0_10px_rgba(99,102,241,1)]" />}
                                </Link>
                                <div className="flex items-center space-x-4 ml-4 pl-6 border-l border-white/10">
                                    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md rounded-full border border-white/10 shadow-inner">
                                        <div className="bg-gradient-to-tr from-indigo-500 to-purple-500 p-1 rounded-full"><User size={14} className="text-white"/></div>
                                        <span className="text-white text-sm font-bold pr-1">{user.name}</span>
                                    </div>
                                    <motion.button 
                                        whileHover={{ scale: 1.1, rotate: 90 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={handleLogout} 
                                        className="text-zinc-500 hover:text-red-400 transition-colors p-2 rounded-xl hover:bg-red-400/10" 
                                        title="Logout"
                                    >
                                        <LogOut size={18} />
                                    </motion.button>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center space-x-5 ml-4 pl-6 border-l border-white/10">
                                <Link to="/login" className="text-sm font-semibold text-zinc-300 hover:text-white transition-colors">Sign in</Link>
                                <Link to="/register" className="text-sm px-6 py-2.5 rounded-full glow-button">
                                    Get Started
                                </Link>
                            </div>
                        )}
                        {/* <button onClick={toggleTheme} className="text-zinc-400 hover:text-white transition-colors ml-4 border-l border-white/10 pl-4">
                            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                        </button> */}
                    </div>
                </div>
            </div>
        </motion.nav>
    );
}
