import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    Swords,
    Settings,
    LogOut,
    Zap,
    Globe2,
    Phone,
    TrendingUp,
    BookOpen,
    Sparkles,
    BarChart3
} from 'lucide-react';

export default function Sidebar() {
    const { profile, signOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const callLabMenuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: BarChart3, path: '/dashboard' },
        { id: 'analyze', label: 'New Analysis', icon: Sparkles, path: '/analyze' },
        { id: 'arena', label: 'Roleplay', icon: Swords, path: '/arena', badge: 'WIP' },
    ];

    const resourcesMenuItems = [
        { id: 'team', label: 'Team', icon: Globe2, path: '/team', managerOnly: true },
        { id: 'call-history', label: 'Call History', icon: Phone, path: '/call-history' },
        { id: 'progress', label: 'My Progress', icon: TrendingUp, path: '/progress' },
        { id: 'playbooks', label: 'Playbooks', icon: BookOpen, path: '/playbooks', managerOnly: true },
        { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/analytics', managerOnly: true },
    ];

    const handleLogout = async () => {
        try {
            await signOut();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <div className="h-screen w-64 bg-white border-r-8 border-black flex flex-col fixed left-0 top-0 z-50">
            {/* Logo Section */}
            <div className="p-6 border-b-4 border-black bg-white flex items-center gap-3">
                <div className="w-10 h-10 bg-black flex items-center justify-center border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                    <Zap className="text-white w-6 h-6 fill-white" />
                </div>
                <span className="text-xl font-black uppercase tracking-tighter">LingoPitch</span>
            </div>

            {/* Navigation Section */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {/* Call Lab Section */}
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 px-2">Call Lab</p>
                {callLabMenuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.id}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-black text-sm uppercase tracking-wide group relative ${isActive
                                ? 'bg-black text-white shadow-none translate-x-1 translate-y-1'
                                : 'bg-white text-black hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                                }`}
                        >
                            <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'group-hover:text-black'}`} />
                            {item.label}
                            {item.badge && (
                                <span className="ml-auto px-2 py-0.5 text-[8px] font-black bg-blue-400 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                    {item.badge}
                                </span>
                            )}
                        </Link>
                    );
                })}

                {/* Resources Section */}
                <div className="pt-8 mb-4 px-2">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Resources</p>
                </div>
                {resourcesMenuItems
                    .filter(item => !item.managerOnly || profile?.role === 'sales_manager' || profile?.role === 'manager')
                    .map((item) => {
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.id}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-black text-sm uppercase tracking-wide group ${isActive
                                    ? 'bg-black text-white shadow-none translate-x-1 translate-y-1'
                                    : 'bg-white text-black hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                                    }`}
                            >
                                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'group-hover:text-black'}`} />
                                {item.label}
                            </Link>
                        );
                    })}

                {/* Settings */}
                <div className="pt-6">
                    <Link
                        to="/settings"
                        className={`flex items-center gap-3 px-4 py-3 border-4 border-black bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all font-black text-sm uppercase tracking-wide`}
                    >
                        <Settings className="w-5 h-5" />
                        Settings
                    </Link>
                </div>
            </nav>

            {/* User Profile & Logout */}
            <div className="p-4 border-t-8 border-black bg-gray-50 mt-auto">
                <div className="bg-white border-4 border-black p-3 mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 border-2 border-black bg-orange-200 flex items-center justify-center shrink-0">
                        <User className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-black uppercase truncate leading-none mb-1">
                            {profile?.full_name || 'Agent'}
                        </p>
                        <div className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse border-2 border-black" />
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter truncate">
                                {profile?.role === 'sales_manager' || profile?.role === 'manager' ? 'Mission Command' : 'Active Field Rep'}
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 border-4 border-black bg-red-500 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all font-black text-xs uppercase tracking-widest"
                >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                </button>

                <div className="mt-4 flex justify-between items-center px-2 opacity-40">
                    <Globe2 className="w-4 h-4" />
                    <span className="text-[10px] font-black tracking-tighter">v2.5.0-ALPHA</span>
                </div>
            </div>
        </div>
    );
}

// Small helper since I missed it in Sidebar
function User({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="square"
            strokeLinejoin="inherit"
            className={className}
        >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    );
}
