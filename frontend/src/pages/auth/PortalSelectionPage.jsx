import { motion } from 'framer-motion';
import { Shield, Users, User, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PortalSelectionPage() {
    const portals = [
        {
            title: "Member Login",
            description: "Access your personal dashboard and cases.",
            icon: User,
            path: "/user/login",
            color: "text-royal-gold",
            border: "border-royal-gold/30",
            bg: "bg-royal-gold/10"
        },
        {
            title: "Team Portal",
            description: "Authorized workspace for team members.",
            icon: Users,
            path: "/team/login",
            color: "text-blue-400",
            border: "border-blue-400/30",
            bg: "bg-blue-400/10"
        },
        {
            title: "Admin Console",
            description: "System administration and management.",
            icon: Shield,
            path: "/admin/login",
            color: "text-red-400",
            border: "border-red-400/30",
            bg: "bg-red-400/10"
        }
    ];

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-royal-950">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[20%] w-[40%] h-[40%] bg-royal-gold/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[20%] w-[40%] h-[40%] bg-royal-800/20 rounded-full blur-[120px]" />
            </div>

            <div className="w-full max-w-5xl z-10 px-6">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-4xl md:text-5xl font-serif text-royal-gold mb-4">Royal Amount Collector</h1>
                        <p className="text-royal-muted text-lg max-w-2xl mx-auto">Select your access portal to continue to the secure environment.</p>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {portals.map((portal, index) => (
                        <Link key={index} to={portal.path}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className={`glass h-full p-8 rounded-2xl border ${portal.border} hover:scale-[1.02] transition-transform duration-300 group cursor-pointer relative overflow-hidden`}
                            >
                                <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity`}>
                                    <portal.icon className="w-24 h-24" />
                                </div>

                                <div className={`inline-flex items-center justify-center p-4 rounded-xl ${portal.bg} mb-6`}>
                                    <portal.icon className={`w-8 h-8 ${portal.color}`} />
                                </div>

                                <h3 className={`text-xl font-serif mb-3 ${portal.color}`}>{portal.title}</h3>
                                <p className="text-royal-muted text-sm mb-8 leading-relaxed">
                                    {portal.description}
                                </p>

                                <div className="flex items-center gap-2 text-sm font-medium text-royal-text group-hover:gap-3 transition-all">
                                    Enter Portal <ArrowRight className="w-4 h-4" />
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-16 text-center"
                >
                    <p className="text-royal-muted/50 text-xs tracking-widest uppercase">
                        Secure Access • Encrypted Connection • Authorized Only
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
