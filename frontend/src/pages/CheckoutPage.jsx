import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPreConto, processPayment } from '../services/api';
import { Receipt, Users, CreditCard, Banknote, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CheckoutPage = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [splitCount, setSplitCount] = useState(1);
    const [isProcessing, setIsProcessing] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const data = await getPreConto(orderId);
                setOrder(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [orderId]);

    const handlePayment = async (method) => {
        setIsProcessing(true);
        try {
            // Simulate Payment Gateway (Stripe/Nexi/SumUp) latency
            await new Promise(resolve => setTimeout(resolve, 2500));
            
            await processPayment({
                orderId,
                amount: order.total_amount,
                method,
                isSplit: splitCount > 1,
                splitCount
            });
            setSuccess(true);
            setTimeout(() => navigate('/tables'), 2500);
        } catch (err) {
            alert('Errore nel processare il pagamento');
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center bg-black text-white">Caricamento conto...</div>;
    if (!order) return <div className="h-screen flex items-center justify-center bg-black text-white">Ordine non trovato</div>;

    const amountPerPerson = (order.total_amount / splitCount).toFixed(2);

    return (
        <div className="min-h-screen bg-neutral-900 text-white flex flex-col">
            {/* Header */}
            <header className="p-4 bg-black border-b border-white/10 flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition">
                    <ChevronLeft size={24} />
                </button>
                <h1 className="text-xl font-serif font-bold uppercase tracking-widest">Chiusura Conto - Tavolo {order.table_number}</h1>
            </header>

            <main className="flex-1 flex flex-col md:flex-row p-6 gap-6 overflow-hidden">
                {/* Pre-Conto Summary */}
                <div className="flex-1 bg-white text-black rounded-3xl p-8 flex flex-col shadow-2xl">
                    <div className="flex items-center gap-3 mb-8 border-b border-dashed border-gray-300 pb-4 text-gray-400">
                        <Receipt size={24} />
                        <span className="font-bold uppercase tracking-widest text-sm">Pre-Conto Digitale</span>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-4 mb-8">
                        {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-start">
                                <div className="flex flex-col">
                                    <span className="font-bold">{item.quantity}x {item.name}</span>
                                    {item.modifiers && item.modifiers.map((m, midx) => (
                                        <span key={midx} className="text-xs text-gray-500 ml-4">+ {m.name}</span>
                                    ))}
                                </div>
                                <span className="font-mono">€{item.subtotal}</span>
                            </div>
                        ))}
                    </div>

                    <div className="border-t-2 border-dashed border-gray-300 pt-6 space-y-2">
                        <div className="flex justify-between text-gray-500 uppercase text-xs font-bold tracking-widest">
                            <span>Subtotale</span>
                            <span>€{order.total_amount}</span>
                        </div>
                        <div className="flex justify-between text-2xl font-black">
                            <span>TOTALE</span>
                            <span>€{order.total_amount}</span>
                        </div>
                    </div>
                </div>

                {/* Payment Actions */}
                <div className="w-full md:w-96 flex flex-col gap-6">
                    {/* Split Bill UI */}
                    <div className="bg-black/40 border border-white/10 rounded-3xl p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <Users className="text-[var(--color-riva-gold)]" />
                            <h2 className="font-bold uppercase tracking-widest text-sm">Dividi Conto (Alla Romana)</h2>
                        </div>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4">
                                <button 
                                    onClick={() => setSplitCount(Math.max(1, splitCount - 1))}
                                    className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10"
                                >-</button>
                                <span className="text-2xl font-bold">{splitCount}</span>
                                <button 
                                    onClick={() => setSplitCount(splitCount + 1)}
                                    className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10"
                                >+</button>
                            </div>
                            <div className="text-right">
                                <span className="block text-xs uppercase opacity-40">Quota a persona</span>
                                <span className="text-xl font-mono text-[var(--color-riva-gold)]">€{amountPerPerson}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Buttons */}
                    <div className="space-y-3">
                        <button 
                            onClick={() => handlePayment('card')}
                            disabled={isProcessing}
                            className="w-full py-5 bg-white text-black rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-neutral-200 transition-all active:scale-95 disabled:opacity-50"
                        >
                            <CreditCard /> POS / CARTA
                        </button>
                        <button 
                            onClick={() => handlePayment('cash')}
                            disabled={isProcessing}
                            className="w-full py-5 bg-[var(--color-riva-gold)] text-black rounded-2xl font-bold flex items-center justify-center gap-3 hover:brightness-110 transition-all active:scale-95 disabled:opacity-50"
                        >
                            <Banknote /> CONTANTI
                        </button>
                    </div>

                    <div className="text-center opacity-40 text-xs px-4">
                        Premendo un metodo di pagamento, il tavolo verrà liberato e segnato come "Da Pulire".
                    </div>
                </div>
            </main>

            {/* Success Overlay */}
            <AnimatePresence>
                {success && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-50"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="text-green-500 mb-4"
                        >
                            <CheckCircle2 size={120} />
                        </motion.div>
                        <h2 className="text-3xl font-serif font-bold italic mb-2">Conto Pagato!</h2>
                        <p className="text-white/60">Tavolo {order.table_number} è ora libero.</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CheckoutPage;
