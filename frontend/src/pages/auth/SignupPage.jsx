import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { motion } from 'framer-motion';
import { User, Lock, Mail, ArrowRight, CheckCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../lib/api';

export default function SignupPage() {
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        confirm_password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (formData.password !== formData.confirm_password) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        try {
            // Using UserRole.USER (which is "USER" string) by default for public signup
                const payload = {
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password
    };


                await api.post('/auth/register', payload);

    setLoading(false);   // 👈 ADD THIS LINE

    // On success, redirect to login
    navigate('/user/login', { state: { message: "Account created successfully! Please login." } });
            } catch (err) {
            console.error("Signup failed", err);
            const errorDetail = err.response?.data?.detail;
            if (Array.isArray(errorDetail)) {
                setError(errorDetail[0]?.msg || "Validation error");
            } else {
                setError(errorDetail || "Registration failed. Please try again.");
            }
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-royal-900">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-royal-gold/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-royal-800/50 rounded-full blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="glass p-8 md:p-12 rounded-2xl w-full max-w-md z-10 border border-royal-gold/20"
            >
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-serif text-royal-gold mb-2">Create Account</h1>
                    <p className="text-royal-muted text-sm">Join Royal Amount Collector today</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-lg bg-red-900/40 border border-red-500/50 text-red-200 text-sm flex items-center gap-2">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-royal-text mb-2">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-royal-muted w-5 h-5" />
                            <input
                                type="text"
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleChange}
                                className="w-full bg-royal-800/50 border border-royal-700 rounded-lg pl-10 pr-4 py-3 text-royal-text placeholder-royal-muted focus:outline-none focus:border-royal-gold focus:ring-1 focus:ring-royal-gold transition-colors"
                                placeholder="John Doe"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-royal-text mb-2">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-royal-muted w-5 h-5" />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
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
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full bg-royal-800/50 border border-royal-700 rounded-lg pl-10 pr-4 py-3 text-royal-text placeholder-royal-muted focus:outline-none focus:border-royal-gold focus:ring-1 focus:ring-royal-gold transition-colors"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-royal-text mb-2">Confirm Password</label>
                        <div className="relative">
                            <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-royal-muted w-5 h-5" />
                            <input
                                type="password"
                                name="confirm_password"
                                value={formData.confirm_password}
                                onChange={handleChange}
                                className="w-full bg-royal-800/50 border border-royal-700 rounded-lg pl-10 pr-4 py-3 text-royal-text placeholder-royal-muted focus:outline-none focus:border-royal-gold focus:ring-1 focus:ring-royal-gold transition-colors"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full py-6 text-lg tracking-wide mt-4"
                        isLoading={loading}
                    >
                        Create Account
                    </Button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-royal-muted text-sm">
                        Already have an account?{' '}
                        <Link to="/user/login" className="text-royal-gold hover:text-royal-gold/80 font-medium inline-flex items-center gap-1 transition-colors">
                            Sign in <ArrowRight className="w-3 h-3" />
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
