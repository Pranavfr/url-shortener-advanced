import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Link2, LogOut, LayoutDashboard, Home, User } from 'lucide-react';

export default function Navbar() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="sticky top-0 z-50 glass rounded-none border-x-0 border-t-0 mb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-2">
                        <Link2 className="h-8 w-8 text-primary" />
                        <Link to="/" className="text-xl font-bold text-white tracking-wider">QuickLink</Link>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                        <Link to="/" className="text-slate-300 hover:text-white transition flex items-center gap-1">
                            <Home size={18} /> <span className="hidden sm:inline">Home</span>
                        </Link>
                        
                        {user ? (
                            <>
                                <Link to="/dashboard" className="text-slate-300 hover:text-white transition flex items-center gap-1">
                                    <LayoutDashboard size={18} /> <span className="hidden sm:inline">Dashboard</span>
                                </Link>
                                <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-slate-600">
                                    <span className="text-slate-300 flex items-center gap-1"><User size={18} />{user.name}</span>
                                    <button onClick={handleLogout} className="text-red-400 hover:text-red-300 transition p-1" title="Logout">
                                        <LogOut size={18} />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-slate-300 hover:text-white transition">Login</Link>
                                <Link to="/register" className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-md transition font-medium">Get Started</Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
