import React from 'react';
import Sidebar from './Sidebar';

interface AppLayoutProps {
    children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
    return (
        <div className="min-h-screen flex bg-white">
            {/* Sidebar - Fixed width on Desktop */}
            <Sidebar />

            {/* Main Content Area */}
            <main className="flex-1 ml-64 min-h-screen flex flex-col relative">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0 overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                </div>

                {/* Main scrollable section */}
                <div className="flex-1 relative z-10 p-8 overflow-y-auto max-h-screen">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </div>

                {/* Minimal Footer */}
                <footer className="relative z-10 px-8 py-4 border-t-2 border-gray-100 flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <span>© {new Date().getFullYear()} LingoPitch Command</span>
                    <div className="flex gap-4">
                        <span className="hover:text-black cursor-pointer transition-colors">Internal Ops</span>
                        <span className="hover:text-black cursor-pointer transition-colors">Support Channel</span>
                    </div>
                </footer>
            </main>
        </div>
    );
}
