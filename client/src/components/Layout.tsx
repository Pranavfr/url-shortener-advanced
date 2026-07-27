import type { ReactNode } from 'react';
import Navbar from './Navbar';
import { Toaster } from 'react-hot-toast';
import { useLocation } from 'react-router-dom';

export default function Layout({ children }: { children: ReactNode }) {
    const location = useLocation();
    const hideNavbar = location.pathname.startsWith('/unlock') || location.pathname.startsWith('/bio/');

    return (
        <div className="min-h-screen mesh-bg">
            <div className="min-h-screen">
                {!hideNavbar && <Navbar />}
                <main className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 ${hideNavbar ? '' : 'pt-8'} relative z-10`}>
                    {children}
                </main>
            </div>
            <Toaster 
                position="bottom-right"
                toastOptions={{
                    style: {
                        background: '#18181b',
                        color: '#fff',
                        border: '1px solid #27272a',
                    },
                    success: {
                        iconTheme: { primary: '#10b981', secondary: '#fff' },
                    }
                }}
            />
        </div>
    );
}
