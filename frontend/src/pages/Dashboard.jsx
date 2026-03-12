import React from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate();
    
    return (
        <div className="min-h-screen p-8">
            <header className="flex justify-between items-center mb-12">
                <div>
                    <h1 className="text-3xl font-serif text-[var(--color-riva-bordeaux)] mb-2">Riva Beach Admin</h1>
                    <p className="text-gray-600">Overview Ristorante</p>
                </div>
                <button onClick={() => navigate('/tables')} className="px-6 py-2 bg-[var(--color-riva-dark)] text-[var(--color-riva-gold)] rounded-lg font-medium hover:opacity-90 transition">
                    Vai in Sala (POS)
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                    <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Incasso Oggi</span>
                    <span className="text-4xl font-bold text-[var(--color-riva-dark)] mt-2">€4,250</span>
                    <span className="text-sm text-green-600 mt-2 flex items-center">↑ 12% vs Ieri</span>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                    <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Coperti</span>
                    <span className="text-4xl font-bold text-[var(--color-riva-dark)] mt-2">124</span>
                    <span className="text-sm text-gray-400 mt-2">Target: 200</span>
                </div>
                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                    <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Tavoli Aperti</span>
                    <span className="text-4xl font-bold text-[var(--color-riva-bordeaux)] mt-2">18</span>
                    <span className="text-sm text-gray-400 mt-2">Tempo medio: 45m</span>
                </div>
                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-200 bg-red-50 flex flex-col justify-between">
                    <span className="text-sm font-semibold text-red-800 uppercase tracking-wider">Alerts Magazzino</span>
                    <span className="text-4xl font-bold text-red-600 mt-2">3</span>
                    <span className="text-sm text-red-700 mt-2 font-medium">Capocollo, Menta in esaurimento</span>
                </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 min-h-[400px] flex items-center justify-center">
                <p className="text-gray-400 font-medium">Area Grafici ed Integrazione AI in sviluppo (Week 6-7)</p>
            </div>
        </div>
    );
};

export default Dashboard;
