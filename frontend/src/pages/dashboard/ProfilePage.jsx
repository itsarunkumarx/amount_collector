import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import { motion } from 'framer-motion';
import { User, Mail, Shield, Award, Phone, X, Save, MapPin, BookOpen } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export default function ProfilePage() {
    const { user, login, refreshUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        full_name: user?.full_name || '',
        phone_number: user?.phone_number || '',
        profile_picture_url: user?.profile_picture_url || '',
        address: user?.address || '',
        bio: user?.bio || ''
    });
    const [stats, setStats] = useState(null);

    const getFullImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        const baseUrl = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1').replace('/api/v1', '');
        return `${baseUrl}${url}`;
    };

    useEffect(() => {
        if (user) {
            setFormData({
                full_name: user.full_name || '',
                phone_number: user.phone_number || '',
                profile_picture_url: user.profile_picture_url || '',
                address: user.address || '',
                bio: user.bio || ''
            });
        }
    }, [user]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/users/me/stats');
                setStats(res.data);
            } catch (err) {
                console.error("Failed to fetch stats", err);
            }
        };
        fetchStats();
    }, []);

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            // Include profile picture in update
            await api.put('/users/me', formData);
            await refreshUser(); // Refresh local user context
            alert("Profile updated successfully!");
            setIsEditing(false);
        } catch (err) {
            alert("Update failed: " + err.response?.data?.detail);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        const uploadData = new FormData();
        uploadData.append('file', file);
        try {
            const res = await api.post('/utils/upload', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFormData(prev => ({ ...prev, profile_picture_url: res.data.url }));
        } catch (err) {
            alert("Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const InfoCard = ({ icon: Icon, label, value }) => (
        <div className="flex items-center gap-4 p-4 rounded-lg bg-royal-800/30 border border-royal-gold/10">
            <div className="p-3 rounded-full bg-royal-gold/10 text-royal-gold">
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <p className="text-xs text-royal-muted uppercase tracking-wider">{label}</p>
                <p className="text-royal-text font-medium">{value || 'Not provided'}</p>
            </div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-8 relative pb-20">
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-3xl font-serif text-royal-gold">My Profile</h1>
                    <p className="text-royal-muted mt-2">Manage your account settings and personal details</p>
                </div>
                <Button onClick={() => setIsEditing(true)} variant="outline" className="border-royal-gold/30 text-royal-gold hover:bg-royal-gold/10">
                    Edit Profile
                </Button>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass p-8 rounded-2xl border border-royal-gold/20"
            >
                <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-8">
                    <div className="relative group">
                        {user?.profile_picture_url ? (
                            <img src={getFullImageUrl(user.profile_picture_url)} alt="Profile" className="w-24 h-24 rounded-full object-cover shadow-xl shadow-royal-gold/20 border-2 border-royal-gold" />
                        ) : (
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-royal-gold to-yellow-600 flex items-center justify-center text-3xl font-bold text-royal-900 shadow-xl shadow-royal-gold/20">
                                {user?.full_name?.charAt(0) || 'U'}
                            </div>
                        )}
                        <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" onClick={() => setIsEditing(true)}>
                            <span className="text-xs text-white">Change</span>
                        </div>
                    </div>

                    <div className="text-center md:text-left flex-1">
                        <h2 className="text-2xl font-bold text-royal-text">{user?.full_name}</h2>
                        <div className="flex items-center justify-center md:justify-start gap-2 mt-2 text-royal-gold/80">
                            <Shield className="w-4 h-4" />
                            <span className="text-sm font-medium tracking-wide">{user?.role?.replace('_', ' ')}</span>
                            <span className="text-royal-muted mx-2">•</span>
                            <span className="text-sm text-royal-muted">Joined {new Date(user?.created_at || Date.now()).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <div className="text-right hidden md:block">
                        <p className="text-xs text-royal-muted mb-1">DATA INTEGRITY</p>
                        <div className="text-2xl font-bold text-green-400">100%</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoCard icon={Mail} label="Email Address" value={user?.email} />
                    <InfoCard icon={Phone} label="Phone Number" value={user?.phone_number} />
                    <InfoCard icon={MapPin} label="Address" value={user?.address} />
                    <InfoCard icon={BookOpen} label="Bio" value={user?.bio} />
                    <InfoCard icon={Award} label="Trust Score" value={`${user?.trust_score || 100}/100`} />
                    <InfoCard icon={User} label="User ID" value={user?.id} />
                </div>
            </motion.div>

            {/* Activity Overview */}
            {stats && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass p-8 rounded-2xl border border-royal-gold/20"
                >
                    <h3 className="text-xl font-serif text-royal-gold mb-6">Activity Overview</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 rounded-xl bg-royal-800/30 border border-royal-gold/10">
                            <p className="text-sm text-royal-muted uppercase tracking-wider mb-2">{stats.label_1}</p>
                            <div className="text-2xl font-bold text-royal-text">
                                {stats.type_1 === 'currency' ? `₹${stats.value_1?.toLocaleString()}` : stats.value_1}
                            </div>
                        </div>
                        <div className="p-6 rounded-xl bg-royal-800/30 border border-royal-gold/10">
                            <p className="text-sm text-royal-muted uppercase tracking-wider mb-2">{stats.label_2}</p>
                            <div className="text-2xl font-bold text-royal-text">
                                {stats.type_2 === 'currency' ? `₹${stats.value_2?.toLocaleString()}` : stats.value_2}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            <div className="glass p-8 rounded-2xl border border-royal-gold/10">
                <h3 className="text-lg font-serif text-royal-gold mb-4">Account Status</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-green-900/20 border border-green-500/20">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-green-200 font-medium">Active Account</span>
                        </div>
                        <span className="text-xs text-green-200/60">Verified</span>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {isEditing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass p-8 rounded-xl w-full max-w-md relative"
                    >
                        <button onClick={() => setIsEditing(false)} className="absolute top-4 right-4 text-royal-muted hover:text-royal-text"><X className="w-5 h-5" /></button>
                        <h2 className="text-2xl font-serif text-royal-gold mb-6">Update Profile</h2>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            {/* Profile Picture Upload */}
                            <div className="flex justify-center mb-6">
                                <label className="relative cursor-pointer group">
                                    {formData.profile_picture_url ? (
                                        <img src={getFullImageUrl(formData.profile_picture_url)} alt="Profile" className="w-24 h-24 rounded-full object-cover border-2 border-royal-gold" />
                                    ) : (
                                        <div className="w-24 h-24 rounded-full bg-royal-800 flex items-center justify-center text-royal-gold border border-royal-gold/30">
                                            <User className="w-8 h-8" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-xs text-white">{uploading ? '...' : 'Upload'}</span>
                                    </div>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                </label>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-royal-text mb-2">Full Name</label>
                                <input
                                    className="w-full p-3 bg-royal-900/50 border border-royal-700 rounded text-royal-text"
                                    value={formData.full_name}
                                    onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-royal-text mb-2">Phone Number</label>
                                <input
                                    className="w-full p-3 bg-royal-900/50 border border-royal-700 rounded text-royal-text"
                                    value={formData.phone_number}
                                    onChange={e => setFormData({ ...formData, phone_number: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-royal-text mb-2">Address</label>
                                <textarea
                                    className="w-full p-3 bg-royal-900/50 border border-royal-700 rounded text-royal-text"
                                    rows="2"
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-royal-text mb-2">Bio</label>
                                <textarea
                                    className="w-full p-3 bg-royal-900/50 border border-royal-700 rounded text-royal-text"
                                    rows="3"
                                    value={formData.bio}
                                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                />
                            </div>
                            <Button type="submit" className="w-full mt-4 flex items-center justify-center gap-2">
                                <Save className="w-4 h-4" /> Save Changes
                            </Button>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
