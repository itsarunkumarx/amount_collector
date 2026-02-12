import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, DollarSign, Calendar } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export default function CalculatorPage() {
    const [amount, setAmount] = useState(1000);
    const [rate, setRate] = useState(5);
    const [months, setMonths] = useState(12);

    const monthlyInterest = (amount * (rate / 100)) / 12;
    const totalInterest = monthlyInterest * months;
    const totalRepayment = parseFloat(amount) + totalInterest;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="mb-8">
                <h1 className="text-3xl font-serif text-royal-gold">Interest Calculator</h1>
                <p className="text-royal-muted mt-2">Estimate repayments and interest accrual</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Inputs */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass p-8 rounded-2xl border border-royal-gold/20"
                >
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-royal-text mb-2">Loan Amount (₹)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-royal-muted w-5 h-5" />
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full p-3 pl-10 bg-royal-900/50 border border-royal-700 rounded text-royal-text focus:border-royal-gold focus:outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-royal-text mb-2">Interest Rate (% per year)</label>
                            <input
                                type="range"
                                min="1"
                                max="50"
                                value={rate}
                                onChange={(e) => setRate(e.target.value)}
                                className="w-full h-2 bg-royal-800 rounded-lg appearance-none cursor-pointer accent-royal-gold"
                            />
                            <div className="text-right text-royal-gold font-bold mt-1">{rate}%</div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-royal-text mb-2">Duration (Months)</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-royal-muted w-5 h-5" />
                                <input
                                    type="number"
                                    value={months}
                                    onChange={(e) => setMonths(e.target.value)}
                                    className="w-full p-3 pl-10 bg-royal-900/50 border border-royal-700 rounded text-royal-text focus:border-royal-gold focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Results */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass p-8 rounded-2xl border border-royal-gold/20 flex flex-col justify-center relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-32 bg-royal-gold/5 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

                    <h3 className="text-lg font-serif text-royal-muted mb-6">Estimated Repayment</h3>

                    <div className="space-y-6 relative z-10">
                        <div className="flex justify-between items-center pb-4 border-b border-royal-gold/10">
                            <span className="text-royal-text">Principal Amount</span>
                            <span className="font-bold text-royal-text">₹{parseFloat(amount).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center pb-4 border-b border-royal-gold/10">
                            <span className="text-royal-text">Total Interest</span>
                            <span className="font-bold text-royal-gold">+ ₹{totalInterest.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2">
                            <span className="text-lg font-medium text-white">Total Payable</span>
                            <span className="text-3xl font-serif font-bold text-royal-gold">₹{totalRepayment.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="mt-8 p-4 bg-royal-800/40 rounded-lg text-center">
                        <p className="text-sm text-royal-muted mb-1">Monthly Installment</p>
                        <p className="text-xl font-bold text-white">₹{(totalRepayment / months).toFixed(2)}</p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
