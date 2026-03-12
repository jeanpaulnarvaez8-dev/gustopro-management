import React, { useState, useEffect } from 'react';
import { getPendingOrders, updateItemStatus } from '../services/api';
import { socket, connectSocket } from '../services/socket';
import { Clock, CheckCircle, Play, Utensils } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const KDS = () => {
    const [orders, setOrders] = useState([]);
    
    // Load initial orders
    useEffect(() => {
        const fetchOrders = async () => {
            const data = await getPendingOrders();
            setOrders(data);
        };
        fetchOrders();

        // Socket listeners
        connectSocket();
        socket.on('new-order', (payload) => {
            // Re-fetch to get complete aggregated structure from DB
            fetchOrders();
        });

        socket.on('item-status-updated', () => {
            fetchOrders();
        });

        return () => {
            socket.off('new-order');
            socket.off('item-status-updated');
        };
    }, []);

    const handleUpdateStatus = async (itemId, currentStatus) => {
        let nextStatus = 'cooking';
        if (currentStatus === 'cooking') nextStatus = 'served';
        
        try {
            await updateItemStatus(itemId, nextStatus);
            // State will refresh via socket listener
        } catch (err) {
            console.error('Failed to update status', err);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'cooking': return 'bg-orange-500';
            case 'served': return 'bg-green-500';
            default: return 'bg-gray-400';
        }
    };

    return (
        <div className="h-screen bg-neutral-900 text-white flex flex-col overflow-hidden">
            {/* KDS Header */}
            <header className="p-4 bg-black border-b border-white/10 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <Utensils className="text-[var(--color-riva-gold)]" />
                    <h1 className="text-2xl font-serif font-bold uppercase tracking-widest">Kitchen Live Display</h1>
                </div>
                <div className="flex items-center gap-4 text-sm opacity-60">
                    <span className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div> Connected
                    </span>
                    <span>{orders.length} ACTIVE ORDERS</span>
                </div>
            </header>

            {/* Orders Feed */}
            <div className="flex-1 overflow-x-auto p-6 flex gap-6 items-start bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
                <AnimatePresence>
                    {orders.map((order) => (
                        <motion.div
                            key={order.order_id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex-shrink-0 w-80 bg-white text-black rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-full"
                        >
                            {/* Order Header */}
                            <div className="p-4 bg-neutral-100 flex justify-between items-center border-b">
                                <span className="text-2xl font-black italic">TAV. {order.table_number}</span>
                                <div className="flex flex-col items-end">
                                    <span className="text-xs text-gray-400 uppercase">Received</span>
                                    <span className="text-sm font-bold flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>

                            {/* Items List */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {order.items.map((item) => (
                                    <div key={item.id} className="group relative">
                                        <div className="flex justify-between items-start mb-1">
                                            <div className="flex gap-2">
                                                <span className="font-bold text-lg leading-tight">{item.quantity}x</span>
                                                <div className="flex flex-col">
                                                    <span className={`font-bold text-lg leading-tight ${item.status === 'served' ? 'line-through opacity-30' : ''}`}>
                                                        {item.menu_item_name}
                                                    </span>
                                                    {item.modifiers && item.modifiers.map(m => (
                                                        <span key={m.name} className="text-xs bg-red-100 text-red-600 px-1 py-0.5 rounded font-bold uppercase w-fit mt-1">
                                                            + {m.name}
                                                        </span>
                                                    ))}
                                                    {item.notes && (
                                                        <span className="text-xs bg-yellow-100 text-yellow-700 p-1 rounded mt-1 italic border border-yellow-200">
                                                            NOTE: {item.notes}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            <button 
                                                onClick={() => handleUpdateStatus(item.id, item.status)}
                                                className={`p-2 rounded-lg transition-all ${item.status === 'pending' ? 'bg-neutral-100 hover:bg-orange-100 text-orange-600' : item.status === 'cooking' ? 'bg-orange-600 text-white' : 'bg-green-600 text-white'}`}
                                            >
                                                {item.status === 'pending' && <Play size={20} />}
                                                {item.status === 'cooking' && <CheckCircle size={20} />}
                                                {item.status === 'served' && <CheckCircle size={20} className="opacity-50" />}
                                            </button>
                                        </div>
                                        <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                                            <div className={`h-full transition-all duration-500 ${getStatusColor(item.status)}`} style={{ width: item.status === 'pending' ? '0%' : item.status === 'cooking' ? '50%' : '100%' }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Footer Actions */}
                            <div className="p-4 bg-gray-50 border-t flex gap-2">
                                <button className="flex-1 py-2 text-xs font-bold uppercase text-gray-400 border border-gray-200 rounded-lg hover:bg-gray-100 px-2 transition">
                                    Stamp Comanda
                                </button>
                                <button className="flex-[2] py-2 bg-black text-white text-xs font-bold uppercase rounded-lg hover:bg-neutral-800 transition">
                                    Ordine Pronto
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {orders.length === 0 && (
                    <div className="flex-1 h-full flex flex-col items-center justify-center opacity-20">
                        <Utensils size={120} />
                        <span className="text-4xl font-serif mt-4">Kitchen Is Quiet</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default KDS;
