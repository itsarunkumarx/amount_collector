import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { UserPlus, Briefcase, Phone, Mail, X, Pencil, Trash2 } from 'lucide-react';

export default function WorkerManagementPage() {
    const { user } = useAuth();
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        confirm_password: '',
        phone_number: ''
    });

    const fetchWorkers = async () => {
        try {
            const res = await api.get('/users/workers');
            setWorkers(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWorkers();
    }, []);

    const [editingId, setEditingId] = useState(null);

    const handleCreate = async (e) => {
        e.preventDefault();

        if (!editingId && formData.password !== formData.confirm_password) {
            alert("Passwords do not match");
            return;
        }

        try {
            if (editingId) {
                // Update existing worker
                const updateData = {
                    full_name: formData.full_name,
                    email: formData.email,
                    phone_number: formData.phone_number
                };
                if (formData.password) updateData.password = formData.password;

                await api.put(`/users/${editingId}`, updateData);
                alert("Worker updated successfully!");
            } else {
                // Create new worker
                await api.post('/auth/register', {
                    email: formData.email,
                    password: formData.password,
                    full_name: formData.full_name,
                    phone_number: formData.phone_number,
                    role: 'TEAM_WORKER'
                });
                alert("Worker created successfully!");
            }
            setShowCreateModal(false);
            setEditingId(null);
            fetchWorkers(); // Refresh list
            setFormData({ full_name: '', email: '', password: '', confirm_password: '', phone_number: '' });
        } catch (err) {
            alert("Operation failed: " + (err.response?.data?.detail || err.message));
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this worker? This action cannot be undone.")) return;
        try {
            await api.delete(`/users/${id}`);
            alert("Worker deleted successfully");
            fetchWorkers();
        } catch (err) {
            alert("Delete failed: " + (err.response?.data?.detail || err.message));
        }
    };

    const openEditModal = (worker) => {
        setFormData({
            full_name: worker.full_name,
            email: worker.email,
            phone_number: worker.phone_number || '',
            password: '',
            confirm_password: ''
        });
        setEditingId(worker.id);
        setShowCreateModal(true);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-serif text-royal-gold">Worker Management</h1>
                    <p className="text-royal-muted mt-2">Manage your collection team</p>
                </div>
                {(user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN') && (
                    <Button onClick={() => {
                        setEditingId(null);
                        setFormData({ full_name: '', email: '', password: '', confirm_password: '', phone_number: '' });
                        setShowCreateModal(true);
                    }}>
                        <UserPlus className="w-4 h-4 mr-2" /> Add New Worker
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {workers.map(worker => (
                    <div key={worker.id} className="glass p-6 rounded-xl border border-royal-gold/10 hover:border-royal-gold/30 transition-colors group relative">
                        {(user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN') && (
                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => openEditModal(worker)} className="p-2 rounded-full bg-royal-800 text-royal-gold hover:bg-royal-gold hover:text-royal-900 transition-colors" title="Edit">
                                    <Pencil className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDelete(worker.id)} className="p-2 rounded-full bg-royal-800 text-red-400 hover:bg-red-500 hover:text-white transition-colors" title="Delete">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-royal-gold/10 flex items-center justify-center text-royal-gold font-bold text-xl group-hover:bg-royal-gold group-hover:text-royal-900 transition-colors">
                                {worker.full_name.charAt(0)}
                            </div>
                            <div>
                                <h3 className="font-bold text-royal-text">{worker.full_name}</h3>
                                <div className="flex items-center gap-1 text-xs text-green-400">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-400" /> Active
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 text-sm">
                            <div className="flex items-center gap-3 text-royal-muted">
                                <Mail className="w-4 h-4" />
                                <span>{worker.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-royal-muted">
                                <Phone className="w-4 h-4" />
                                <span>{worker.phone_number || "No phone"}</span>
                            </div>
                            <div className="flex items-center gap-3 text-royal-muted">
                                <Briefcase className="w-4 h-4" />
                                <span>TRUST SCORE: {worker.trust_score}%</span>
                            </div>
                        </div>
                    </div>
                ))}

                {workers.length === 0 && !loading && (
                    <div className="col-span-full text-center py-12 text-royal-muted bg-royal-800/20 rounded-xl border border-dashed border-royal-700">
                        <UserPlus className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>No workers found. Create one to get started.</p>
                    </div>
                )}
            </div>

            {/* Create Worker Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                    <div className="glass p-8 rounded-xl w-full max-w-lg relative bg-royal-900/90">
                        <button onClick={() => setShowCreateModal(false)} className="absolute top-4 right-4 text-royal-muted hover:text-royal-text"><X /></button>
                        <h2 className="text-2xl font-serif text-royal-gold mb-6">{editingId ? 'Edit Worker' : 'Register New Worker'}</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <input className="w-full p-3 bg-royal-900/50 border border-royal-700 rounded text-royal-text" placeholder="Full Name" value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} required />
                            <input className="w-full p-3 bg-royal-900/50 border border-royal-700 rounded text-royal-text" placeholder="Email Address" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
                            <input className="w-full p-3 bg-royal-900/50 border border-royal-700 rounded text-royal-text" placeholder="Phone Number" value={formData.phone_number} onChange={e => setFormData({ ...formData, phone_number: e.target.value })} />

                            <div className="border-t border-royal-700 my-4 pt-4">
                                <p className="text-xs text-royal-muted mb-2">{editingId ? 'Leave blank to keep current password' : 'Set Password'}</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <input className="w-full p-3 bg-royal-900/50 border border-royal-700 rounded text-royal-text" placeholder="Password" type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required={!editingId} />
                                    <input className="w-full p-3 bg-royal-900/50 border border-royal-700 rounded text-royal-text" placeholder="Confirm Password" type="password" value={formData.confirm_password} onChange={e => setFormData({ ...formData, confirm_password: e.target.value })} required={!editingId} />
                                </div>
                            </div>

                            <Button type="submit" className="w-full mt-4">{editingId ? 'Save Changes' : 'Create Worker Account'}</Button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
