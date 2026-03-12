import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCategories, getMenuItems, getItemModifiers, submitOrder } from '../services/api';
import { useCart } from '../context/CartContext';
import { ArrowLeft, Plus, Trash2, ChevronRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const OrderPage = () => {
    const { tableId } = useParams();
    const navigate = useNavigate();
    const { cart, addToCart, removeFromCart, cartTotal, currentTable, clearCart } = useCart();
    
    const [categories, setCategories] = useState([]);
    const [activeCategory, setActiveCategory] = useState(null);
    const [items, setItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null); // For modifier modal
    const [itemModifiers, setItemModifiers] = useState([]);
    const [selectedModifiers, setSelectedModifiers] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const loadCategories = async () => {
            const data = await getCategories();
            setCategories(data);
            if (data.length > 0) setActiveCategory(data[0].id);
        };
        loadCategories();
    }, []);

    useEffect(() => {
        if (activeCategory) {
            const loadItems = async () => {
                const data = await getMenuItems(activeCategory);
                setItems(data);
            };
            loadItems();
        }
    }, [activeCategory]);

    const handleItemClick = async (item) => {
        const modifiers = await getItemModifiers(item.id);
        if (modifiers.length > 0) {
            setSelectedItem(item);
            setItemModifiers(modifiers);
            setSelectedModifiers([]);
        } else {
            addToCart(item);
        }
    };

    const toggleModifier = (option) => {
        setSelectedModifiers(prev => {
            const exists = prev.find(o => o.id === option.id);
            if (exists) return prev.filter(o => o.id !== option.id);
            return [...prev, option];
        });
    };

    const confirmModifiers = () => {
        addToCart(selectedItem, selectedModifiers);
        setSelectedItem(null);
    };

    const handleSendToKitchen = async () => {
        if (cart.length === 0) return;
        
        setIsSubmitting(true);
        try {
            const user = JSON.parse(localStorage.getItem('riva_user') || '{}');
            await submitOrder({
                tableId: currentTable?.id,
                waiterId: user.id,
                items: cart,
                totalAmount: cartTotal
            });
            
            clearCart();
            alert('Ordine inviato con successo!');
            navigate('/tables');
        } catch (err) {
            console.error(err);
            alert('Errore durante l\'invio dell\'ordine');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="h-screen flex flex-col bg-gray-50">
            {/* Header */}
            <header className="bg-[var(--color-riva-dark)] text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/tables')} className="p-2 hover:bg-white/10 rounded-full">
                        <ArrowLeft />
                    </button>
                    <h1 className="text-xl font-serif">Tavolo {currentTable?.table_number || '...'}</h1>
                </div>
                <div className="text-[var(--color-riva-gold)] font-bold text-xl">
                    Total: €{cartTotal.toFixed(2)}
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Categories Sidebar */}
                <div className="w-48 bg-white border-r border-gray-200 overflow-y-auto">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`w-full p-6 text-left font-bold transition-all ${activeCategory === cat.id ? 'bg-[var(--color-riva-bordeaux)] text-white shadow-lg' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* Items Grid */}
                <div className="flex-1 p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto content-start">
                    {items.map(item => (
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            key={item.id}
                            onClick={() => handleItemClick(item)}
                            className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 text-left flex flex-col h-40 hover:shadow-md transition"
                        >
                            <span className="font-bold text-lg mb-2 line-clamp-2">{item.name}</span>
                            <p className="text-sm text-gray-500 mb-auto line-clamp-2">{item.description}</p>
                            <div className="flex justify-between items-center mt-2">
                                <span className="text-[var(--color-riva-bordeaux)] font-bold">€{parseFloat(item.base_price).toFixed(2)}</span>
                                <Plus className="w-5 h-5 text-gray-400" />
                            </div>
                        </motion.button>
                    ))}
                </div>

                {/* Right Sidebar - Cart */}
                <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="font-bold text-lg">Ordine Corrente</h2>
                        <span className="bg-gray-100 px-2 py-1 rounded text-sm text-gray-500">{cart.length} piatti</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        <AnimatePresence>
                            {cart.map((item) => (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    key={item.cartId}
                                    className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex flex-col gap-1"
                                >
                                    <div className="flex justify-between items-start">
                                        <span className="font-bold">{item.name}</span>
                                        <button onClick={() => removeFromCart(item.cartId)} className="text-red-400 p-1">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="text-xs text-gray-400 italic">
                                        {item.selectedModifiers.map(m => m.name).join(', ')}
                                    </div>
                                    <div className="text-right font-bold text-sm">
                                        €{(parseFloat(item.base_price) + item.selectedModifiers.reduce((a, b) => a + parseFloat(b.price || 0), 0)).toFixed(2)}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {cart.length === 0 && (
                            <div className="h-full flex items-center justify-center text-gray-300 italic">
                                Nessun piatto selezionato
                            </div>
                        )}
                    </div>
                    <div className="p-4 border-t border-gray-200 space-y-4">
                        <button 
                            onClick={handleSendToKitchen}
                            disabled={cart.length === 0 || isSubmitting}
                            className="flex-1 py-4 bg-[var(--color-riva-gold)] text-black rounded-2xl font-bold uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed hover:scale-[1.02] transition-transform active:scale-95 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : 'Invia in Cucina'}
                        </button>
                        
                        {/* If we had a persistent orderId, we'd show the checkout button */}
                        <button 
                            onClick={() => {
                                // For MVP, we'll assume there's one active order per table session
                                // Ideally we'd fetch this from the table status
                                alert('Per questo MVP, usa il link diretto /checkout/<orderId> o implementa il recupero orderId dalla tabella');
                            }}
                            className="w-full py-4 bg-[var(--color-riva-bordeaux)] text-white rounded-2xl font-bold disabled:opacity-50 hover:opacity-90 transition shadow-lg flex items-center justify-center gap-2"
                        >
                            <CreditCard className="w-5 h-5" />
                            <span>Vai al Pagamento</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Modifiers Modal */}
            <AnimatePresence>
                {selectedItem && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setSelectedItem(null)}
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
                        >
                            <div className="p-6 bg-[var(--color-riva-dark)] text-white">
                                <h3 className="text-2xl font-serif">{selectedItem.name}</h3>
                                <p className="opacity-70">Personalizza il piatto</p>
                            </div>
                            <div className="p-6 space-y-8 max-h-[60vh] overflow-y-auto">
                                {itemModifiers.map(group => (
                                    <div key={group.group_id}>
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="font-bold text-lg uppercase tracking-wider text-gray-500">{group.group_name}</h4>
                                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                                {group.min_selection > 0 ? 'Obbligatorio' : 'Opzionale'}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            {group.options.map(opt => {
                                                const isSelected = selectedModifiers.find(o => o.id === opt.id);
                                                return (
                                                    <button
                                                        key={opt.id}
                                                        onClick={() => toggleModifier(opt)}
                                                        className={`p-4 rounded-xl border-2 transition flex justify-between items-center ${isSelected ? 'border-[var(--color-riva-bordeaux)] bg-[var(--color-riva-bordeaux)]/5 text-[var(--color-riva-bordeaux)]' : 'border-gray-100 text-gray-600 hover:border-gray-200'}`}
                                                    >
                                                        <div className="flex flex-col text-left">
                                                            <span className="font-bold">{opt.name}</span>
                                                            {opt.price > 0 && <span className="text-sm opacity-60">+€{parseFloat(opt.price).toFixed(2)}</span>}
                                                        </div>
                                                        {isSelected && <Check className="w-5 h-5" />}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-6 border-t border-gray-100 flex gap-4">
                                <button onClick={() => setSelectedItem(null)} className="flex-1 py-4 font-bold text-gray-500 hover:bg-gray-50 rounded-xl transition">
                                    Annulla
                                </button>
                                <button onClick={confirmModifiers} className="flex-[2] py-4 bg-[var(--color-riva-gold)] text-[var(--color-riva-dark)] font-ebold rounded-xl shadow-lg hover:opacity-90 transition">
                                    Aggiungi (€{ (parseFloat(selectedItem.base_price) + selectedModifiers.reduce((a,b) => a + parseFloat(b.price || 0), 0)).toFixed(2) })
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default OrderPage;
