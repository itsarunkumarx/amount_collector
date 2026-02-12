import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import {
    LayoutDashboard,
    Calculator,
    Users,
    FileText,
    Bell,
    Settings,
    LogOut,
    Menu,
    X,
    ShieldCheck,
    Shield
} from 'lucide-react';

export default function DashboardLayout() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [isSidebarOpen, setSidebarOpen] = useState(true);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['SUPER_ADMIN', 'ADMIN', 'VERIFIED_USER', 'TEAM_WORKER', 'USER'] },
        { label: 'Cases', icon: FileText, path: '/dashboard/cases', roles: ['SUPER_ADMIN', 'ADMIN', 'VERIFIED_USER', 'TEAM_WORKER'] },
        { label: 'Users', icon: Users, path: '/dashboard/users', roles: ['SUPER_ADMIN', 'ADMIN'] },
        { label: 'Alerts', icon: Bell, path: '/dashboard/alerts', roles: ['SUPER_ADMIN', 'ADMIN', 'VERIFIED_USER', 'TEAM_WORKER'] },
        { label: 'Profile', icon: Settings, path: '/dashboard/profile', roles: ['ALL'] },
        { label: 'Calculator', icon: Calculator, path: '/dashboard/calculator', roles: ['ALL'] },
        { label: 'Transactions', icon: FileText, path: '/dashboard/transactions', roles: ['ALL'] },
        { label: 'Team', icon: Users, path: '/dashboard/workers', roles: ['ADMIN', 'SUPER_ADMIN', 'TEAM_WORKER'] }, // Managers/Workers
    ];

    // For Team Workers, we might want to redirect /dashboard to /dashboard/worker-dashboard
    // But since we use DashboardLayout with <Outlet/>, we can just handle the content.
    // However, DashboardHome is the index route.
    // Ideally, DashboardHome should detect role and show WorkerDashboard if TEAM_WORKER.

    return (
        <div className="min-h-screen bg-royal-900 text-royal-text font-sans selection:bg-royal-gold/30 selection:text-royal-gold">
            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed left-0 top-0 z-40 h-screen w-64 bg-royal-800/80 backdrop-blur-xl border-r border-royal-gold/10 transition-transform duration-300 ease-in-out md:translate-x-0",
                    !isSidebarOpen && "-translate-x-full"
                )}
            >
                <div className="h-full flex flex-col p-4">
                    <div className="flex items-center gap-3 px-2 py-6 border-b border-royal-gold/10 mb-6">
                        <ShieldCheck className="w-8 h-8 text-royal-gold" />
                        <span className="font-serif font-bold text-lg text-royal-gold tracking-wide">ROYAL AC</span>
                    </div>

                    <nav className="flex-1 space-y-2">
                        {menuItems.map((item) => (
                            (item.roles.includes(user?.role) || item.roles.includes('ALL')) && (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
                                        location.pathname === item.path
                                            ? "bg-royal-gold/20 text-royal-gold border border-royal-gold/20 shadow-sm"
                                            : "text-royal-muted hover:bg-royal-700/50 hover:text-royal-text"
                                    )}
                                >
                                    <item.icon className={cn("w-5 h-5", location.pathname === item.path ? "text-royal-gold" : "text-royal-muted group-hover:text-royal-text")} />
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            )
                        ))}
                    </nav>

                    <div className="border-t border-royal-gold/10 pt-4">
                        <div className="flex items-center gap-3 px-4 py-3 mb-2">
                            <div className="w-8 h-8 rounded-full bg-royal-gold text-royal-900 flex items-center justify-center font-bold">
                                {user?.full_name?.charAt(0) || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{user?.full_name}</p>
                                <p className="text-xs text-royal-muted truncate capitalize">{user?.role?.replace('_', ' ')}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className={cn("flex-1 flex flex-col transition-all duration-300", isSidebarOpen ? "md:ml-64" : "ml-0")}>
                <header className="h-16 flex items-center justify-between px-6 glass sticky top-0 z-30">
                    <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 -ml-2 rounded-lg hover:bg-royal-800 text-royal-text md:hidden">
                        <Menu className="w-6 h-6" />
                    </button>
                    <div className="flex-1"></div>
                    {/* Header Actions */}
                    <div className="flex items-center gap-4">
                        <button className="p-2 rounded-full hover:bg-royal-800 relative">
                            <Bell className="w-5 h-5 text-royal-text" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                        </button>
                    </div>
                </header>

                <main className="flex-1 p-6 md:p-8 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
