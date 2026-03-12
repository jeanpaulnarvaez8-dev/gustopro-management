import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Users, LogOut, Wifi, WifiOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { socket, connectSocket, disconnectSocket } from '../services/socket';
import { getZones, getTables } from '../services/api';
import { useCart } from '../context/CartContext';

// Mock data per l'MVP Frontend
const MOCK_ZONES = [
    { id: 'z1', name: 'Terrazza Panoramica' },
    { id: 'z2', name: 'Sala Cristallo' }
];

const MOCK_TABLES = [
    { id: 't1', zone_id: 'z1', number: '101', status: 'free', seats: 4, x: 10, y: 10 },
    { id: 't2', zone_id: 'z1', number: '102', status: 'occupied', seats: 2, orderValue: 45.50, timeOpen: '45m', x: 30, y: 10 },
    { id: 't3', zone_id: 'z1', number: '103', status: 'ready', seats: 6, orderValue: 120.00, timeOpen: '1h 10m', x: 50, y: 30 },
    { id: 't4', zone_id: 'z2', number: '201', status: 'free', seats: 4, x: 20, y: 60 },
    { id: 't5', zone_id: 'z2', number: '202', status: 'dirty', seats: 8, x: 60, y: 60 },
];

const STATUS_COLORS = {
    free: 'bg-emerald-100 border-emerald-300 text-emerald-800',
    occupied: 'bg-red-100 border-red-300 text-red-800',     // In attesa / consumazione in corso
    ready: 'bg-amber-100 border-amber-300 text-amber-800',  // Conto richiesto o cibo pronto
    dirty: 'bg-gray-200 border-gray-400 text-gray-700'
};

const TableMap = () => {
    const navigate = useNavigate();
    const [activeZone, setActiveZone] = useState(null);
    const [zones, setZones] = useState([]);
    const [tables, setTables] = useState([]);
    const [isConnected, setIsConnected] = useState(socket.connected);
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('riva_user') || '{}'));
    const { setCurrentTable } = useCart();

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const z = await getZones();
                const t = await getTables();
                setZones(z);
                setTables(t);
                if (z.length > 0) setActiveZone(z[0].id);
            } catch (err) {
                console.error("Error fetching map data", err);
            }
        };

        fetchData();
        connectSocket();
        
        const onConnect = () => setIsConnected(true);
        const onDisconnect = () => setIsConnected(false);

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            // Optionally disconnectSocket() if we only want connection while actively in the POS
        };
    }, []);

    const handleTableClick = (tableId) => {
        const table = tables.find(t => t.id === tableId);
        setCurrentTable(table);
        navigate(`/order/${tableId}`);
    };

    return (
        <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
            {/* POS Header */}
            <header className="bg-[var(--color-riva-dark)] text-[var(--color-riva-gold)] p-4 flex justify-between items-center shadow-md z-10">
                <div className="flex items-center gap-6">
                    <h1 className="text-2xl font-serif font-bold tracking-wider">RIVA POS</h1>
                    <div className="flex gap-2 bg-white/10 p-1 rounded-lg">
                        {zones.map(zone => (
                            <button 
                                key={zone.id}
                                onClick={() => setActiveZone(zone.id)}
                                className={`px-4 py-2 rounded-md font-medium transition-all duration-200 ${activeZone === zone.id ? 'bg-[var(--color-riva-gold)] text-[var(--color-riva-dark)] shadow-sm' : 'text-white/80 hover:bg-white/20'}`}
                            >
                                {zone.name}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${isConnected ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                        {isConnected ? <Wifi className="w-4 h-4 text-emerald-500" /> : <WifiOff className="w-4 h-4 text-red-500" />}
                        <span className={`text-sm font-medium ${isConnected ? 'text-emerald-400' : 'text-red-400'}`}>
                            {isConnected ? 'Online Sync' : 'Offline Mode'}
                        </span>
                    </div>
                    <div className="text-right">
                        <p className="text-sm opacity-80 uppercase tracking-widest font-semibold flex items-center justify-end gap-2">
                             Cameriere <LogOut className="w-4 h-4 ml-2 cursor-pointer hover:text-white" onClick={() => { localStorage.clear(); navigate('/login'); }} />
                        </p>
                        <p className="font-bold">{user.name || 'Utente'}</p>
                    </div>
                </div>
            </header>

            {/* Interactive Canvas Area */}
            <main className="flex-1 relative p-8">
                {/* Background Pattern for grid reference */}
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, #ddd 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
                
                <div className="relative w-full h-full bg-white/50 backdrop-blur-sm shadow-inner rounded-3xl border-4 border-white/80 overflow-hidden">
                     {tables.filter(t => t.zone_id === activeZone).map(table => (
                        <motion.div
                            key={table.id}
                            drag
                            dragMomentum={false}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleTableClick(table.id)}
                            className={`absolute w-32 h-32 rounded-2xl border-2 flex flex-col items-center justify-center p-2 shadow-sm cursor-pointer ${STATUS_COLORS[table.status]}`}
                            style={{ left: `${table.x}%`, top: `${table.y}%` }}
                        >
                            <span className="text-3xl font-bold mt-2">{table.number}</span>
                            <div className="flex items-center gap-1 text-xs font-semibold opacity-70 mt-1">
                                <Users className="w-3 h-3" /> {table.seats}
                            </div>
                            
                            {/* Table Status Details (Only show if occupied or ready) */}
                            {(table.status === 'occupied' || table.status === 'ready') && (
                                <div className="mt-auto w-full flex justify-between items-end text-xs font-bold opacity-90">
                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {table.timeOpen}</span>
                                    <span>€{table.orderValue.toFixed(2)}</span>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            </main>

            {/* POS Footer / Quick Actions */}
            <footer className="bg-white border-t border-gray-200 p-4 flex gap-4 overflow-x-auto shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
                <button onClick={() => navigate('/dashboard')} className="flex-shrink-0 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition">
                    Admin Dashboard
                </button>
                <div className="w-px bg-gray-300 mx-2"></div>
                <button className="flex-shrink-0 px-8 py-3 bg-[var(--color-riva-bordeaux)] text-white rounded-xl font-bold shadow-md hover:opacity-90 transition">
                    + Nuovo Asporto
                </button>
                <button className="flex-shrink-0 px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-md hover:bg-emerald-700 transition">
                    Storico Scontrini
                </button>
            </footer>
        </div>
    );
};

export default TableMap;
