import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CartContext = createContext(null);

const STORAGE_KEY = 'cart_items';

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCart(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(loadCart);

  // Persist to localStorage on every change
  useEffect(() => {
    saveCart(cartItems);
  }, [cartItems]);

  const addToCart = useCallback((part, quantity = 1) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === part.id);
      if (existing) {
        return prev.map(item =>
          item.id === part.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, {
        id: part.id,
        name: part.name,
        brand: part.brand,
        price: parseFloat(part.price),
        image: part.image,
        sku: part.sku,
        is_accessory: part.is_accessory,
        installation_available: part.installation_available,
        stock_quantity: part.stock_quantity,
        quantity
      }];
    });
  }, []);

  const removeFromCart = useCallback((partId) => {
    setCartItems(prev => prev.filter(item => item.id !== partId));
  }, []);

  const updateQuantity = useCallback((partId, newQty) => {
    if (newQty < 1) return;
    setCartItems(prev =>
      prev.map(item =>
        item.id === partId
          ? { ...item, quantity: Math.min(newQty, item.stock_quantity || 99) }
          : item
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Items that support workshop installation
  const installableItems = cartItems.filter(item => item.installation_available);
  // Items that are self-install only
  const selfInstallItems = cartItems.filter(item => !item.installation_available);

  const value = {
    cartItems,
    cartCount,
    subtotal,
    installableItems,
    selfInstallItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return ctx;
}

export default CartContext;
