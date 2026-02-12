import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import { motion } from 'framer-motion';
import { DollarSign, Briefcase, FileText, Bell, TrendingUp, Users, AlertTriangle, Activity } from 'lucide-react';
import { cn } from '../../lib/utils';
import WorkerDashboard from '../worker/WorkerDashboard';

export default function DashboardHome() {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalCases: 0,
        totalAmount: 0,
        pendingAmount: 0,
        activeAlerts: 0
    });
    const [loading, setLoading] = useState(true);

    if (user?.role === 'TEAM_WORKER') {
        return <WorkerDashboard />;
    }

    // Stats Card Component
    const StatCard = ({ title, value, icon: Icon, color }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-6 rounded-xl flex items-center justify-between"
        >
            <div>
                <h3 className="text-royal-muted text-sm font-medium mb-1">{title}</h3>
                <p className={cn("text-2xl font-bold", color)}>{value}</p>
            </div>
            <div className={cn("p-3 rounded-full opacity-20", color.replace('text-', 'bg-'))}>
                <Icon className={cn("w-6 h-6", color)} />
            </div>
        </motion.div>
    );

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Always fetch from backend unified endpoint
                const reportRes = await api.get('/reports/dashboard');
                const data = reportRes.data;

                setStats({
                    totalCases: data.total_cases,
                    totalAmount: data.total_lent,
                    pendingAmount: data.total_pending,
                    collectedToday: data.collected_today, // Now available from backend
                    activeAlerts: data.active_cases // Or keep as active cases count
                });

                // If we really want alerts count, we can fetch separately or rely on backend
                // For now, let's show Active Cases in one card and Collected Today in another

            } catch (err) {
                console.error("Failed to fetch stats", err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [user]);

    if (loading) return <div className="p-10 text-center text-royal-gold">Loading Royal Dashboard...</div>;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-serif text-royal-gold">
                        Welcome back, {user?.full_name?.split(' ')[0]}
                    </h1>
                    <p className="text-royal-muted mt-1">
                        {user?.role === 'SUPER_ADMIN' ? 'System Overview & Controls' :
                            user?.role === 'VERIFIED_USER' ? 'Financial Portfolio' : 'My Account Status'}
                    </p>
                </div>
                <div className="text-right">
                    <span className="text-xs text-royal-muted block">TRUST SCORE</span>
                    <span className="text-xl font-bold text-green-400">{user?.trust_score || 100}%</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Lent/Borrowed"
                    value={`₹${stats?.totalAmount?.toLocaleString() || 0} `}
                    icon={DollarSign}
                    color="text-royal-gold"
                />
                <StatCard
                    title="Pending Recovery"
                    value={`₹${stats?.pendingAmount?.toLocaleString() || 0} `}
                    icon={Activity}
                    color="text-blue-400"
                />
                <StatCard
                    title="Active Cases"
                    value={stats?.totalCases || 0}
                    icon={Users}
                    color="text-purple-400"
                />
                <StatCard
                    title="Collected Today"
                    value={`₹${stats?.collectedToday?.toLocaleString() || 0}`}
                    icon={TrendingUp}
                    color="text-green-400"
                />
            </div>

            {/* Role Specific Quick Actions or Charts could go here */}
            {user?.role === 'SUPER_ADMIN' && (
                <div className="glass p-8 rounded-xl border border-royal-gold/10">
                    <h3 className="text-lg font-serif text-royal-gold mb-4">Admin Quick Controls</h3>
                    <div className="flex gap-4">
                        <p className="text-sm text-royal-muted">Use the sidebar to manage Users, Cases, and Transactions.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
