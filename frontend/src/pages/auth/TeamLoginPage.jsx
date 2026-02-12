import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Users, Lock } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export default function TeamLoginPage() {
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
            if (res.role === 'TEAM_WORKER' || res.role === 'ADMIN' || res.role === 'SUPER_ADMIN') {
                navigate('/dashboard');
            } else {
                await logout();
                setError("Access Denied: Team Members Only");
                setLoading(false);
            }
        } else {
            setError(res.error);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative bg-slate-900 text-white">
            <div className="absolute top-6 left-6 z-20">
                <Link to="/login" className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors text-sm font-medium">
                    ← Change Portal
                </Link>
            </div>

            <div className="bg-slate-800 p-8 md:p-12 rounded-2xl w-full max-w-md z-10 border border-slate-700 shadow-xl">
                <div className="text-left mb-10">
                    <div className="flex items-center gap-3 mb-2">
                        <Users className="w-8 h-8 text-yellow-500" />
                        <h1 className="text-2xl font-serif text-white">Team Portal</h1>
                    </div>
                    <p className="text-slate-400 text-sm ml-11">Workforce Access Point</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded bg-red-900/50 text-red-200 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Work Email</label>
                        <div className="relative">
                            <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-yellow-500 transition-all"
                                placeholder="worker@team.com"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-yellow-500 transition-all"
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
                        Login to Workspace
                    </Button>
                </form>
            </div>
        </div>
    );
}
