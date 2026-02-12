import { useNavigate } from 'react-router-dom';
import { ArrowRight, Shield, TrendingUp, Users, Zap } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-royal-900 text-royal-text font-sans">
            {/* Navbar */}
            <nav className="border-b border-royal-gold/10 glass sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Shield className="w-8 h-8 text-royal-gold" />
                        <span className="text-2xl font-serif text-royal-gold tracking-wide">ROYAL AC</span>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={() => navigate('/login')} className="px-6 py-2 text-royal-gold hover:text-white transition-colors font-medium">
                            Login
                        </button>
                        <Button onClick={() => navigate('/signup')} className="px-6 py-2 shadow-lg shadow-royal-gold/20">
                            Get Started
                        </Button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="relative py-32 px-6 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-royal-gold/10 rounded-full blur-[120px] pointer-events-none" />

                <div className="max-w-5xl mx-auto text-center relative z-10">
                    <div className="inline-block px-4 py-1.5 rounded-full border border-royal-gold/30 bg-royal-gold/5 text-royal-gold text-sm font-bold tracking-wider mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        THE GOLD STANDARD IN COLLECTION
                    </div>
                    <h1 className="text-5xl md:text-7xl font-serif text-transparent bg-clip-text bg-gradient-to-b from-royal-gold via-yellow-200 to-royal-gold mb-8 leading-tight animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        Master Your Collections <br /> With Royal Authority
                    </h1>
                    <p className="text-xl text-royal-muted max-w-2xl mx-auto mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
                        The ultimate platform for lenders and collection agencies.
                        Track dues, manage field workers, and automate recovery with
                        enterprise-grade precision and elegance.
                    </p>

                    <div className="flex flex-col md:flex-row gap-6 justify-center animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-300">
                        <Button onClick={() => navigate('/signup')} className="h-14 px-8 text-lg shadow-xl shadow-royal-gold/20 hover:scale-105 transition-transform">
                            Start Free Trial <Zap className="w-5 h-5 ml-2 fill-current" />
                        </Button>
                        <button onClick={() => navigate('/login')} className="h-14 px-8 rounded-lg border border-royal-700 hover:border-royal-gold text-royal-text font-bold transition-all hover:bg-royal-800/50">
                            Existing User Login
                        </button>
                    </div>
                </div>
            </header>

            {/* Features Grid */}
            <section className="py-24 px-6 bg-royal-950/50">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="glass p-8 rounded-2xl border border-royal-700 hover:border-royal-gold/50 transition-colors group">
                            <div className="w-14 h-14 rounded-2xl bg-royal-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <TrendingUp className="w-7 h-7 text-green-400" />
                            </div>
                            <h3 className="text-xl font-bold text-royal-text mb-3">Smart Analytics</h3>
                            <p className="text-royal-muted leading-relaxed">
                                Real-time dashboards showing collected amounts, pending recoveries, and worker performance at a glance.
                            </p>
                        </div>
                        <div className="glass p-8 rounded-2xl border border-royal-700 hover:border-royal-gold/50 transition-colors group">
                            <div className="w-14 h-14 rounded-2xl bg-royal-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <Users className="w-7 h-7 text-blue-400" />
                            </div>
                            <h3 className="text-xl font-bold text-royal-text mb-3">Team Management</h3>
                            <p className="text-royal-muted leading-relaxed">
                                Assign cases to field workers, track their live location, and monitor collection efficiency seamlessly.
                            </p>
                        </div>
                        <div className="glass p-8 rounded-2xl border border-royal-700 hover:border-royal-gold/50 transition-colors group">
                            <div className="w-14 h-14 rounded-2xl bg-royal-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <Shield className="w-7 h-7 text-purple-400" />
                            </div>
                            <h3 className="text-xl font-bold text-royal-text mb-3">Secure Ledger</h3>
                            <p className="text-royal-muted leading-relaxed">
                                Tamper-proof transaction logs with PDF exports, ensuring every penny is accounted for with military-grade security.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 px-6">
                <div className="max-w-5xl mx-auto glass rounded-[3rem] p-12 md:p-24 text-center border border-royal-gold/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-royal-gold/10 rounded-full blur-[80px]" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px]" />

                    <h2 className="text-4xl md:text-5xl font-serif text-royal-gold mb-6 relative z-10">Ready to command your finances?</h2>
                    <p className="text-xl text-royal-muted mb-10 max-w-2xl mx-auto relative z-10">
                        Join elite lenders and agencies who trust Royal AC for their daily operations.
                    </p>
                    <Button onClick={() => navigate('/signup')} className="h-16 px-10 text-xl shadow-2xl relative z-10">
                        Get Started Now <ArrowRight className="w-6 h-6 ml-2" />
                    </Button>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-royal-gold/10 text-center text-royal-muted text-sm">
                <p>&copy; 2024 Royal Amount Collector. All rights reserved.</p>
            </footer>
        </div>
    );
}
