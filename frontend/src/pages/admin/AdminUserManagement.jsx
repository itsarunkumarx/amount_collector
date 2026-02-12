import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Shield, Check, X, Search, Lock, Unlock } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

export default function AdminUserManagement() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchUsers = async () => {
        try {
            // This endpoint needs to exist, likely GET /users/
            const res = await api.get('/users/');
            setUsers(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const toggleVerify = async (userId, currentStatus) => {
        if (!window.confirm("Are you sure you want to change verification status?")) return;
        try {
            // Calling the verify endpoint. We only have verify, not unverify, but let's assume update logic covers it or we use raw update
            // The existing endpoint is PUT /users/{id}/verify
            await api.put(`/users/${userId}/verify`);
            fetchUsers();
        } catch (err) {
            alert("Action failed: " + (err.response?.data?.detail || err.message));
        }
    };

    const filteredUsers = users.filter(u =>
        (u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.full_name?.toLowerCase().includes(searchTerm.toLowerCase())) &&
        u.role !== 'TEAM_WORKER'
    );

    if (currentUser?.role !== 'SUPER_ADMIN' && currentUser?.role !== 'ADMIN') {
        return <div className="p-8 text-center text-red-500">Access Restricted</div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-serif text-royal-gold">User Management</h1>
                    <p className="text-royal-muted mt-2">Oversee all platform accounts</p>
                </div>
                <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-royal-muted w-4 h-4" />
                    <input
                        placeholder="Search users..."
                        className="w-full bg-royal-900/50 border border-royal-700 rounded-lg pl-9 pr-4 py-2 text-sm text-royal-text focus:border-royal-gold outline-none"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="glass rounded-xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-royal-800/50 text-royal-gold uppercase text-xs font-bold tracking-wider">
                        <tr>
                            <th className="p-4">User</th>
                            <th className="p-4">Role</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Trust Score</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-royal-gold/10">
                        {filteredUsers.map(u => (
                            <tr key={u.id} className="hover:bg-royal-800/30 transition-colors">
                                <td className="p-4">
                                    <div className="font-bold text-royal-text">{u.full_name || 'Unknown'}</div>
                                    <div className="text-xs text-royal-muted">{u.email}</div>
                                    <div className="text-xs text-royal-muted">{u.phone_number}</div>
                                </td>
                                <td className="p-4">
                                    <span className={cn(
                                        "px-2 py-1 rounded text-xs font-bold border",
                                        u.role.includes('ADMIN') ? "bg-purple-900/40 text-purple-400 border-purple-500/20" :
                                            u.role === 'TEAM_WORKER' ? "bg-blue-900/40 text-blue-400 border-blue-500/20" :
                                                u.role === 'VERIFIED_USER' ? "bg-green-900/40 text-green-400 border-green-500/20" :
                                                    "bg-royal-800 text-royal-muted border-royal-700"
                                    )}>
                                        {u.role}
                                    </span>
                                </td>
                                <td className="p-4">
                                    {u.is_verified ?
                                        <span className="flex items-center gap-1 text-green-400 text-xs"><Check className="w-3 h-3" /> Verified</span> :
                                        <span className="flex items-center gap-1 text-yellow-400 text-xs"><Shield className="w-3 h-3" /> Unverified</span>
                                    }
                                </td>
                                <td className="p-4 font-mono text-royal-text">
                                    {u.trust_score}%
                                </td>
                                <td className="p-4 text-right flex justify-end gap-2">
                                    {!u.is_verified && (
                                        <Button variant="outline" size="sm" onClick={() => toggleVerify(u.id)} className="text-xs h-8">
                                            Verify
                                        </Button>
                                    )}
                                    {/* Placeholder for block/unblock if we had that endpoint */}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
