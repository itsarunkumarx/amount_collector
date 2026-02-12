import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Briefcase, CheckCircle, Clock, MapPin, Phone, ArrowRight, DollarSign, Calendar } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export default function WorkerDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [cases, setCases] = useState([]);
    const [stats, setStats] = useState({ todayCollected: 0, pendingCount: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch cases assigned to this worker
                const casesRes = await api.get('/cases/');
                setCases(casesRes.data);

                // Fetch stats from backend
                const statsRes = await api.get('/users/me/stats');
                // The endpoint now returns generic label/value structure
                setStats({
                    todayCollected: statsRes.data.value_1 || 0,
                    pendingCount: statsRes.data.value_2 || 0
                });

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleCollect = (caseId) => {
        navigate(`/dashboard/collect/${caseId}`);
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-serif text-royal-gold">Welcome, {user?.full_name?.split(' ')[0]}</h1>
                <p className="text-royal-muted mt-2">Here are your assigned collections for today.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="glass p-6 rounded-xl border border-royal-gold/10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-green-500/10 text-green-400">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-royal-muted uppercase tracking-wider">Collected Today</p>
                            <p className="text-2xl font-bold text-royal-text">₹{stats.todayCollected.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
                <div className="glass p-6 rounded-xl border border-royal-gold/10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-yellow-500/10 text-yellow-400">
                            <Briefcase className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-royal-muted uppercase tracking-wider">Pending Tasks</p>
                            <p className="text-2xl font-bold text-royal-text">{stats.pendingCount}</p>
                        </div>
                    </div>
                </div>
            </div>

            <h2 className="text-xl font-serif text-royal-text mb-4">Assigned Collections</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {cases.filter(c => c.status === 'ACTIVE').map(c => (
                    <div key={c.id} className="glass p-6 rounded-xl border border-royal-gold/10 hover:border-royal-gold/30 transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-royal-text">{c.borrower_name}</h3>
                                <div className="flex items-center gap-2 text-sm text-royal-muted mt-1">
                                    <Phone className="w-3 h-3" /> {c.borrower_phone}
                                </div>
                            </div>
                            <span className="px-2 py-1 bg-yellow-900/40 text-yellow-400 text-xs rounded border border-yellow-500/20 font-bold">
                                DUE: ₹{c.amount_pending.toLocaleString()}
                            </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-royal-muted mb-6 bg-royal-800/30 p-2 rounded">
                            <Calendar className="w-3 h-3 text-royal-gold" />
                            <span>Due Date: {c.due_date ? new Date(c.due_date).toLocaleDateString() : 'Not Set'}</span>
                        </div>

                        <Button onClick={() => handleCollect(c.id)} className="w-full justify-between group-hover:bg-royal-gold group-hover:text-royal-900">
                            Collect Payment <ArrowRight className="w-4 h-4" />
                        </Button>
                    </div>
                ))}

                {cases.filter(c => c.status === 'ACTIVE').length === 0 && (
                    <div className="col-span-full text-center py-12 text-royal-muted bg-royal-800/20 rounded-xl border border-dashed border-royal-700">
                        <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500/50" />
                        <p>All caught up! No active collections pending.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
