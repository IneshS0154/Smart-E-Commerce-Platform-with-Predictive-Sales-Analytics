import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import cartAPI from '../api/cartAPI';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(null);
    const [cartCount, setCartCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const fetchCart = useCallback(async () => {
        try {
            const data = await cartAPI.getCart();
            setCart(data);
            const count = data?.cartItems?.length || 0;
            setCartCount(count);
        } catch (error) {
            console.error('Error fetching cart:', error);
        }
    }, []);

    const addToCart = useCallback(async (productId, size, quantity = 1) => {
        setLoading(true);
        try {
            const data = await cartAPI.addToCart(productId, size, quantity);
            setCart(data);
            const count = data?.cartItems?.length || 0;
            setCartCount(count);
            return { success: true };
        } catch (error) {
            console.error('Error adding to cart:', error);
            return { success: false, error: error.response?.data?.message || 'Failed to add to cart' };
        } finally {
            setLoading(false);
        }
    }, []);

    const updateCartItem = useCallback(async (cartItemId, quantity) => {
        try {
            const data = await cartAPI.updateCartItem(cartItemId, quantity);
            setCart(data);
            const count = data?.cartItems?.length || 0;
            setCartCount(count);
        } catch (error) {
            console.error('Error updating cart:', error);
        }
    }, []);

    const removeCartItem = useCallback(async (cartItemId) => {
        try {
            const data = await cartAPI.removeCartItem(cartItemId);
            setCart(data);
            const count = data?.cartItems?.length || 0;
            setCartCount(count);
        } catch (error) {
            console.error('Error removing from cart:', error);
        }
    }, []);

    const clearCart = useCallback(async () => {
        try {
            await cartAPI.clearCart();
            setCart(null);
            setCartCount(0);
        } catch (error) {
            console.error('Error clearing cart:', error);
        }
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('customerToken');
        if (token) {
            fetchCart();
        }
    }, [fetchCart]);

    return (
        <CartContext.Provider value={{
            cart,
            cartCount,
            loading,
            fetchCart,
            addToCart,
            updateCartItem,
            removeCartItem,
            clearCart
        }}>
            {children}
        </CartContext.Provider>
    );
};

export default CartContext;
