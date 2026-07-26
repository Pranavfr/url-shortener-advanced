import type { ReactNode } from 'react';
import Navbar from './Navbar';

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072')] bg-cover bg-fixed bg-center">
            <div className="min-h-screen bg-slate-900/80 backdrop-blur-sm">
                <Navbar />
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                    {children}
                </main>
            </div>
        </div>
    );
}
