import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const [currentTable, setCurrentTable] = useState(null);

    const addToCart = (item, modifiers = []) => {
        setCart(prev => [...prev, { 
            ...item, 
            cartId: Math.random().toString(36).substr(2, 9),
            selectedModifiers: modifiers 
        }]);
    };

    const removeFromCart = (cartId) => {
        setCart(prev => prev.filter(item => item.cartId !== cartId));
    };

    const clearCart = () => {
        setCart([]);
        setCurrentTable(null);
    };

    const cartTotal = cart.reduce((total, item) => {
        const modifiersTotal = item.selectedModifiers.reduce((acc, mod) => acc + parseFloat(mod.price || 0), 0);
        return total + parseFloat(item.base_price) + modifiersTotal;
    }, 0);

    return (
        <CartContext.Provider value={{ 
            cart, 
            addToCart, 
            removeFromCart, 
            clearCart, 
            cartTotal,
            currentTable,
            setCurrentTable
        }}>
            {children}
        </CartContext.Provider>
    );
};
