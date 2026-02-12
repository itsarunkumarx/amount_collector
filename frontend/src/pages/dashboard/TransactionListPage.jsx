import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { ArrowUpRight, ArrowDownLeft, Filter, Search, Calendar, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

export default function TransactionListPage() {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState('ALL'); // ALL, PAYMENT, DISBURSEMENT
    const [searchTerm, setSearchTerm] = useState('');

    const fetchTransactions = async () => {
        try {
            const res = await api.get('/transactions/');
            setTransactions(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const handleRevert = async (id) => {
        if (!window.confirm("Are you sure you want to revert this transaction? The amount will be added back to the pending balance.")) return;
        try {
            await api.delete(`/transactions/${id}`);
            alert("Transaction reverted successfully");
            fetchTransactions();
        } catch (err) {
            alert("Revert failed: " + (err.response?.data?.detail || err.message));
        }
    };

    const filteredTransactions = transactions.filter(t => {
        const matchesType = filterType === 'ALL' || t.transaction_type === filterType;
        const matchesSearch = t.id.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesType && matchesSearch;
    });

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-serif text-royal-gold">Transaction History</h1>
                    <p className="text-royal-muted mt-2">Track all flow of funds</p>
                </div>

                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-royal-muted w-4 h-4" />
                        <input
                            placeholder="Search Transaction ID..."
                            className="bg-royal-900/50 border border-royal-700 rounded-lg pl-9 pr-4 py-2 text-sm text-royal-text focus:border-royal-gold outline-none"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="bg-royal-900/50 border border-royal-700 rounded-lg px-4 py-2 text-sm text-royal-text focus:border-royal-gold outline-none"
                        value={filterType}
                        onChange={e => setFilterType(e.target.value)}
                    >
                        <option value="ALL">All Types</option>
                        <option value="PAYMENT">Collections (In)</option>
                        <option value="DISBURSEMENT">Disbursements (Out)</option>
                    </select>
                    <button onClick={async () => {
                        try {
                            const res = await api.get('/reports/export', { responseType: 'blob' });
                            const url = window.URL.createObjectURL(new Blob([res.data]));
                            const link = document.createElement('a');
                            link.href = url;
                            link.setAttribute('download', `Statement_${new Date().toISOString().split('T')[0]}.pdf`);
                            document.body.appendChild(link);
                            link.click();
                        } catch (err) {
                            alert("Failed to download statement");
                        }
                    }} className="bg-royal-gold text-royal-900 px-4 py-2 rounded-lg text-sm font-bold hover:bg-yellow-600 transition-colors flex items-center gap-2">
                        <ArrowDownLeft className="w-4 h-4 rotate-180" /> Export PDF
                    </button>
                </div>
            </div>

            <div className="glass rounded-xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-royal-800/50 text-royal-gold uppercase text-xs font-bold tracking-wider">
                        <tr>
                            <th className="p-4">Type</th>
                            <th className="p-4">Amount</th>
                            <th className="p-4">Mode</th>
                            <th className="p-4">Date</th>
                            <th className="p-4">Performed By</th>
                            <th className="p-4">Status</th>
                            {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && <th className="p-4">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-royal-gold/10">
                        {filteredTransactions.map(t => (
                            <tr key={t.id} className="hover:bg-royal-800/30 transition-colors">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "p-2 rounded-full",
                                            t.transaction_type === 'PAYMENT' ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                                        )}>
                                            {t.transaction_type === 'PAYMENT' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                                        </div>
                                        <span className="font-medium text-royal-text">{t.transaction_type}</span>
                                    </div>
                                </td>
                                <td className={cn(
                                    "p-4 font-mono font-bold",
                                    t.transaction_type === 'PAYMENT' ? "text-green-400" : "text-red-400"
                                )}>
                                    {t.transaction_type === 'PAYMENT' ? '+' : '-'} ₹{t.amount.toLocaleString()}
                                </td>
                                <td className="p-4 text-sm text-royal-muted">
                                    {t.payment_mode || 'CASH'}
                                </td>
                                <td className="p-4 text-sm text-royal-muted font-mono">
                                    {new Date(t.created_at).toLocaleString()}
                                </td>
                                <td className="p-4 text-sm text-royal-text">
                                    {t.performed_by_name || 'System'}
                                </td>
                                <td className="p-4">
                                    {t.is_verified_by_admin ?
                                        <span className="text-xs text-green-400 border border-green-500/20 px-2 py-1 rounded bg-green-900/20">Verified</span>
                                        :
                                        <span className="text-xs text-yellow-400 border border-yellow-500/20 px-2 py-1 rounded bg-yellow-900/20">Pending</span>
                                    }
                                </td>
                                {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
                                    <td className="p-4">
                                        <button
                                            onClick={() => handleRevert(t.id)}
                                            className="p-1 rounded bg-red-900/40 text-red-400 hover:bg-red-900/60 border border-red-500/20 transition-colors"
                                            title="Revert Transaction"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                        {filteredTransactions.length === 0 && (
                            <tr><td colSpan="7" className="p-8 text-center text-royal-muted">No transactions found matching your criteria.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
