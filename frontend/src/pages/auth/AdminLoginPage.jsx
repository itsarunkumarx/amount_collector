import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { motion } from 'framer-motion';
import { Shield, Lock, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, logout } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const res = await login(email, password);
        if (res.success) {
            if (res.role === 'ADMIN' || res.role === 'SUPER_ADMIN') {
                navigate('/dashboard');
            } else {
                await logout();
                setError("Access Denied: Authorized Admin Personnel Only");
                setLoading(false);
            }
        } else {
            setError(res.error);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-royal-950">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-royal-gold/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-royal-gold/10 rounded-full blur-[100px]" />
            </div>

            <div className="absolute top-6 left-6 z-20">
                <button onClick={() => navigate('/login')} className="flex items-center gap-2 text-royal-gold/70 hover:text-royal-gold transition-colors text-sm font-medium uppercase tracking-widest">
                    ← Portal
                </button>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="glass p-8 md:p-12 rounded-2xl w-full max-w-md z-10 border border-royal-gold/40 shadow-2xl shadow-royal-gold/10"
            >
                <div className="text-center mb-10">
                    <motion.div
                        initial={{ rotate: -180, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        transition={{ duration: 0.8 }}
                        className="inline-flex items-center justify-center p-4 rounded-full bg-royal-gold/20 mb-4 border border-royal-gold/50"
                    >
                        <Shield className="w-12 h-12 text-royal-gold" />
                    </motion.div>
                    <h1 className="text-3xl font-serif text-royal-gold mb-2 tracking-widest uppercase">Admin Portal</h1>
                    <p className="text-royal-muted text-xs tracking-widest uppercase">Restricted Access</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-lg bg-red-900/60 border border-red-500 text-red-100 text-sm flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-royal-gold/80 mb-2 uppercase tracking-wide">Administrator ID</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-royal-gold/50 w-5 h-5" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-black/40 border border-royal-gold/30 rounded-lg pl-10 pr-4 py-3 text-royal-gold placeholder-royal-gold/20 focus:outline-none focus:border-royal-gold focus:ring-1 focus:ring-royal-gold transition-colors"
                                placeholder="admin@system.com"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-royal-gold/80 mb-2 uppercase tracking-wide">Secure Key</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-royal-gold/50 w-5 h-5" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black/40 border border-royal-gold/30 rounded-lg pl-10 pr-4 py-3 text-royal-gold placeholder-royal-gold/20 focus:outline-none focus:border-royal-gold focus:ring-1 focus:ring-royal-gold transition-colors"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full py-6 text-lg tracking-widest uppercase bg-royal-gold hover:bg-royal-gold/90 text-black font-bold"
                        isLoading={loading}
                    >
                        Authenticate
                    </Button>
                </form>
            </motion.div>
        </div>
    );
}
