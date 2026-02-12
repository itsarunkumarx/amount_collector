import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { AlertTriangle, Info, XCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function AlertsPage() {
    const { user } = useAuth();
    const [alerts, setAlerts] = useState([]);

    const fetchAlerts = async () => {
        try {
            const res = await api.get('/alerts/');
            setAlerts(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchAlerts();
    }, []);

    const stopAlert = async (id) => {
        try {
            await api.put(`/alerts/${id}/stop`);
            fetchAlerts();
        } catch (err) {
            alert("Failed to stop alert");
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-serif text-royal-gold mb-8">System Alerts</h1>

            <div className="space-y-4">
                {alerts.map(alert => (
                    <div key={alert.id} className={cn(
                        "p-4 rounded-lg border flex gap-4 items-start",
                        alert.severity === 'CRITICAL' ? "bg-red-900/20 border-red-500/50" :
                            alert.severity === 'WARNING' ? "bg-yellow-900/20 border-yellow-500/50" :
                                "bg-royal-800/40 border-royal-700"
                    )}>
                        <div className="mt-1">
                            {alert.severity === 'CRITICAL' ? <XCircle className="text-red-500" /> :
                                alert.severity === 'WARNING' ? <AlertTriangle className="text-yellow-500" /> :
                                    <Info className="text-blue-400" />}
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-royal-text">{alert.title}</h3>
                            <p className="text-royal-muted text-sm mt-1">{alert.message}</p>
                            <div className="mt-2 text-xs text-royal-muted flex gap-4">
                                <span>{new Date(alert.created_at).toLocaleString()}</span>
                                <span className={cn("font-bold", alert.status === 'PENDING' ? "text-yellow-500" : "text-green-500")}>
                                    {alert.status}
                                </span>
                            </div>
                        </div>
                        {(user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN' || user?.role === 'TEAM_WORKER') && alert.status === 'PENDING' && (
                            <button onClick={() => stopAlert(alert.id)} className="px-3 py-1 bg-red-900/40 text-red-200 text-xs rounded border border-red-500/20 hover:bg-red-900/60">
                                STOP
                            </button>
                        )}
                    </div>
                ))}
                {alerts.length === 0 && (
                    <div className="text-center p-10 text-royal-muted glass rounded-xl">
                        No active alerts in the system.
                    </div>
                )}
            </div>
        </div>
    );
}
