import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { motion } from 'framer-motion';
import { Shield, Lock, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const res = await login(email, password);
        if (res.success) {
            navigate('/dashboard'); // Will divert based on role later or in Dashboard component
        } else {
            setError(res.error);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-royal-gold/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-royal-800/50 rounded-full blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="glass p-8 md:p-12 rounded-2xl w-full max-w-md z-10 border border-royal-gold/20"
            >
                <div className="text-center mb-10">
                    <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                        className="inline-flex items-center justify-center p-3 rounded-full bg-royal-gold/10 mb-4 border border-royal-gold/30"
                    >
                        <Shield className="w-10 h-10 text-royal-gold" />
                    </motion.div>
                    <h1 className="text-3xl font-serif text-royal-gold mb-2">Amount Collector</h1>
                    <p className="text-royal-muted text-sm">Trusted Money Management Platform</p>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="mb-6 p-4 rounded-lg bg-red-900/40 border border-red-500/50 text-red-200 text-sm flex items-center gap-2"
                    >
                        <Shield className="w-4 h-4" />
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-royal-text mb-2">Email Address</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-royal-muted w-5 h-5" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-royal-800/50 border border-royal-700 rounded-lg pl-10 pr-4 py-3 text-royal-text placeholder-royal-muted focus:outline-none focus:border-royal-gold focus:ring-1 focus:ring-royal-gold transition-colors"
                                placeholder="enter@email.com"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-royal-text mb-2">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-royal-muted w-5 h-5" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-royal-800/50 border border-royal-700 rounded-lg pl-10 pr-4 py-3 text-royal-text placeholder-royal-muted focus:outline-none focus:border-royal-gold focus:ring-1 focus:ring-royal-gold transition-colors"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full py-6 text-lg tracking-wide"
                        isLoading={loading}
                    >
                        Access Portal
                    </Button>
                </form>

                <div className="mt-8 text-center text-sm text-royal-muted">
                    <p>Restricted Access - Authorized Personnel Only</p>
                </div>
            </motion.div>
        </div>
    );
}
