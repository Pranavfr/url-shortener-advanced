import type { ReactNode } from 'react';
import Navbar from './Navbar';
import { Toaster } from 'react-hot-toast';

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen mesh-bg">
            <div className="min-h-screen">
                <Navbar />
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 pt-8 relative z-10">
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
