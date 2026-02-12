import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { Check, ShieldAlert } from 'lucide-react';

export default function UsersPage() {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/users/'); // Admin only endpoint
            setUsers(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN') {
            fetchUsers();
        }
    }, [user]);

    const verifyUser = async (id) => {
        if (!window.confirm("Verify this user?")) return;
        try {
            await api.put(`/users/${id}/verify`);
            fetchUsers();
        } catch (err) {
            alert("Failed to verify");
        }
    };

    if (!['SUPER_ADMIN', 'ADMIN'].includes(user?.role)) {
        return <div className="p-10 text-center text-red-400">Access Denied. Admin usage only.</div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-serif text-royal-gold mb-8">User Directory</h1>

            <div className="glass rounded-xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-royal-800/50 text-royal-gold uppercase text-xs font-bold tracking-wider">
                        <tr>
                            <th className="p-4">User</th>
                            <th className="p-4">Role</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Trust Score</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-royal-gold/10">
                        {users.map(u => (
                            <tr key={u.id} className="hover:bg-royal-800/30 transition-colors">
                                <td className="p-4">
                                    <div className="font-bold text-royal-text">{u.full_name}</div>
                                    <div className="text-xs text-royal-muted">{u.email}</div>
                                </td>
                                <td className="p-4 px-2 py-1"><span className="text-xs bg-royal-gold/10 text-royal-gold px-2 py-1 rounded border border-royal-gold/20">{u.role}</span></td>
                                <td className="p-4">
                                    {u.is_verified ? <span className="text-green-400">Verified</span> : <span className="text-yellow-400">Unverified</span>}
                                </td>
                                <td className="p-4 text-royal-text">{u.trust_score}%</td>
                                <td className="p-4">
                                    {!u.is_verified && (
                                        <button onClick={() => verifyUser(u.id)} className="flex items-center gap-1 px-3 py-1 bg-green-900/40 text-green-400 rounded hover:bg-green-900/60 border border-green-500/20 text-xs font-bold">
                                            <Check className="w-3 h-3" /> VERIFY
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
