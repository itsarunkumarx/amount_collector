import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import QRCode from 'react-qr-code';
import { ArrowLeft, User, Phone, DollarSign, Smartphone, CreditCard } from 'lucide-react';
import api from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';

// Icons mock for now - in real app, use SVG assets or Lucide fallbacks
const PaymentMethod = ({ icon: Icon, label, selected, onClick, color }) => (
    <button
        type="button"
        onClick={onClick}
        className={cn(
            "flex flex-col items-center justify-center p-4 rounded-xl border transition-all relative overflow-hidden group",
            selected
                ? "bg-royal-gold/10 border-royal-gold"
                : "bg-royal-900/40 border-royal-700 hover:border-royal-gold/50"
        )}
    >
        <div className={cn("p-3 rounded-full mb-2 bg-opacity-20 transition-transform group-hover:scale-110", color.replace('text-', 'bg-'))}>
            <Icon className={cn("w-6 h-6", color)} />
        </div>
        <span className={cn("text-xs font-bold uppercase tracking-wider", selected ? "text-royal-gold" : "text-royal-muted")}>
            {label}
        </span>
        {selected && <div className="absolute inset-0 bg-royal-gold/5 border-2 border-royal-gold rounded-xl pointer-events-none" />}
    </button>
);

export default function CollectionPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [caseData, setCaseData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        amount: '',
        payment_mode: 'CASH',
        notes: '',
        proof_url: ''
    });
    const [uploading, setUploading] = useState(false);
    const [showQR, setShowQR] = useState(false);

    useEffect(() => {
        const fetchCase = async () => {
            try {
                const res = await api.get(`/cases/${id}`);
                setCaseData(res.data);
            } catch (err) {
                console.error(err);
                alert("Case not found");
                navigate('/dashboard');
            } finally {
                setLoading(false);
            }
        };
        fetchCase();
    }, [id, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/transactions/', {
                case_id: id,
                amount: parseFloat(formData.amount),
                transaction_type: 'PAYMENT',
                payment_mode: formData.payment_mode,
                notes: formData.notes,
                proof_url: formData.proof_url
            });
            alert("Collection recorded successfully!");
            navigate('/dashboard');
        } catch (err) {
            alert("Failed to record collection: " + (err.response?.data?.detail || err.message));
        }
    };

    if (loading) return <div className="p-8 text-royal-gold">Loading...</div>;

    // Helper to generate UPI Link
    // Format: upi://pay?pa=address&pn=name&am=amount&cu=INR
    // Replace with actual VPA in production
    const upiLink = `upi://pay?pa=collection@royalac&pn=RoyalCollection&am=${formData.amount || 0}&cu=INR`;

    return (
        <div className="max-w-2xl mx-auto pb-20">
            <button onClick={() => navigate('/dashboard')} className="flex items-center text-royal-muted hover:text-royal-gold mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column: Form */}
                <div className="space-y-6">
                    <div className="glass p-6 rounded-2xl border border-royal-gold/20">
                        <h1 className="text-xl font-serif text-royal-gold mb-1">Record Collection</h1>
                        <p className="text-royal-muted text-sm mb-4">Select method & enter amount</p>

                        <div className="bg-royal-800/30 p-4 rounded-lg mb-6 border border-royal-gold/10">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-royal-muted text-xs uppercase tracking-wider">Borrower</span>
                                <span className="text-royal-text font-bold text-sm text-right">{caseData.borrower_name}</span>
                            </div>
                            <div className="flex justify-between items-center text-lg">
                                <span className="text-royal-muted text-xs uppercase tracking-wider">Due Amount</span>
                                <span className="text-red-400 font-mono font-bold">₹{caseData.amount_pending.toLocaleString()}</span>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-royal-muted uppercase tracking-wider mb-3">Payment Amount</label>
                                <div className="relative mb-3">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-royal-muted font-serif text-xl">₹</span>
                                    <input
                                        type="number"
                                        className="w-full p-4 pl-10 bg-royal-900/50 border border-royal-700 rounded-xl text-royal-text focus:border-royal-gold focus:outline-none text-2xl font-bold font-mono placeholder-royal-800"
                                        placeholder="0"
                                        value={formData.amount}
                                        onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                        required
                                    />
                                </div>
                                {/* Quick Chips */}
                                <div className="flex gap-2">
                                    <button type="button" onClick={() => setFormData({ ...formData, amount: caseData.amount_pending })} className="px-3 py-1 bg-royal-800/50 hover:bg-royal-gold/20 text-royal-gold text-xs rounded border border-royal-gold/30 transition-colors">
                                        Full Due
                                    </button>
                                    <button type="button" onClick={() => setFormData({ ...formData, amount: Math.floor(caseData.amount_pending / 2) })} className="px-3 py-1 bg-royal-800/50 hover:bg-royal-gold/20 text-royal-gold text-xs rounded border border-royal-gold/30 transition-colors">
                                        50%
                                    </button>
                                    <button type="button" onClick={() => setFormData({ ...formData, amount: 500 })} className="px-3 py-1 bg-royal-800/50 hover:bg-royal-gold/20 text-royal-gold text-xs rounded border border-royal-gold/30 transition-colors">
                                        ₹500
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-royal-muted uppercase tracking-wider mb-3">Select Method</label>
                                <div className="grid grid-cols-3 gap-3">
                                    <PaymentMethod
                                        icon={DollarSign} label="Cash" color="text-green-400"
                                        selected={formData.payment_mode === 'CASH'}
                                        onClick={() => { setFormData({ ...formData, payment_mode: 'CASH' }); setShowQR(false); }}
                                    />
                                    <PaymentMethod
                                        icon={Smartphone} label="UPI / GPay" color="text-blue-400"
                                        selected={formData.payment_mode === 'UPI'}
                                        onClick={() => { setFormData({ ...formData, payment_mode: 'UPI' }); setShowQR(true); }}
                                    />
                                    <PaymentMethod
                                        icon={CreditCard} label="Card / Other" color="text-purple-400"
                                        selected={formData.payment_mode === 'OTHER'}
                                        onClick={() => { setFormData({ ...formData, payment_mode: 'OTHER' }); setShowQR(false); }}
                                    />
                                </div>
                            </div>

                            {/* Details & Submit */}
                            <div className="pt-4 border-t border-royal-gold/10">
                                <Button type="submit" className="w-full py-4 text-lg font-bold shadow-lg shadow-royal-gold/20">
                                    Confirm Collection
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Right Column: Dynamic Content (QR or Summary) */}
                <div className="space-y-6">
                    {/* QR Code Section - Only show if UPI is selected and amount > 0 */}
                    {showQR && formData.amount > 0 ? (
                        <div className="glass p-8 rounded-2xl border border-royal-gold/20 flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-bottom-4">
                            <h3 className="text-royal-gold font-serif text-xl mb-6">Scan to Pay</h3>
                            <div className="bg-white p-4 rounded-xl shadow-2xl shadow-royal-gold/20 mb-6">
                                <QRCode value={upiLink} size={200} />
                            </div>
                            <p className="text-royal-text font-mono font-bold text-lg mb-1">₹{formData.amount}</p>
                            <p className="text-royal-muted text-sm">Scanning this will auto-fill the amount</p>

                            <div className="flex gap-4 mt-8 w-full">
                                <div className="flex-1 p-3 rounded-lg bg-royal-900/50 border border-royal-700 flex flex-col items-center">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" className="h-6 w-6 invert opacity-50 mb-2" alt="GPay" />
                                    <span className="text-[10px] text-royal-muted">GPay</span>
                                </div>
                                <div className="flex-1 p-3 rounded-lg bg-royal-900/50 border border-royal-700 flex flex-col items-center">
                                    <span className="h-6 w-6 rounded-full border-2 border-purple-500/50 flex items-center justify-center text-xs font-bold text-purple-400 mb-2">Ph</span>
                                    <span className="text-[10px] text-royal-muted">PhonePe</span>
                                </div>
                                <div className="flex-1 p-3 rounded-lg bg-royal-900/50 border border-royal-700 flex flex-col items-center">
                                    <span className="h-6 w-6 rounded-full border-2 border-blue-400/50 flex items-center justify-center text-xs font-bold text-blue-400 mb-2">Py</span>
                                    <span className="text-[10px] text-royal-muted">Paytm</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="glass p-8 rounded-2xl border border-royal-gold/10 flex flex-col items-center justify-center text-center h-full min-h-[400px] opacity-50">
                            <div className="w-20 h-20 rounded-full bg-royal-800/50 flex items-center justify-center mb-4">
                                <DollarSign className="w-10 h-10 text-royal-muted" />
                            </div>
                            <p className="text-royal-muted">Select 'UPI / GPay' and enter an amount to generate a dynamic payment QR code.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
