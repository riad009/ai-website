"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

// Types
export interface CartItem {
    id: string;
    name: string;
    price: string;
    priceNum: number;
    image: string;
    quantity: number;
    badge?: string;
    description?: string;
}

export interface User {
    name: string;
    email: string;
    avatar?: string;
}

interface StoreContextType {
    // Cart
    cart: CartItem[];
    addToCart: (item: Omit<CartItem, "quantity">) => void;
    removeFromCart: (id: string) => void;
    updateQuantity: (id: string, qty: number) => void;
    clearCart: () => void;
    cartTotal: number;
    cartCount: number;

    // Auth
    user: User | null;
    login: (email: string, password: string) => void;
    register: (name: string, email: string, password: string) => void;
    logout: () => void;

    // Modals/Overlays
    cartOpen: boolean;
    setCartOpen: (open: boolean) => void;
    authOpen: boolean;
    setAuthOpen: (open: boolean) => void;
    authTab: "login" | "register";
    setAuthTab: (tab: "login" | "register") => void;
    productDetailOpen: boolean;
    setProductDetailOpen: (open: boolean) => void;
    selectedProduct: CartItem | null;
    setSelectedProduct: (product: CartItem | null) => void;
    checkoutOpen: boolean;
    setCheckoutOpen: (open: boolean) => void;

    // Search
    searchQuery: string;
    setSearchQuery: (q: string) => void;
    selectedCategory: string;
    setSelectedCategory: (cat: string) => void;

    // Wishlist
    wishlist: string[];
    toggleWishlist: (id: string) => void;

    // Orders
    orders: any[];
    placeOrder: () => void;

    // Notifications
    notification: string | null;
    setNotification: (msg: string | null) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function useStore() {
    const ctx = useContext(StoreContext);
    if (!ctx) {
        // Return a no-op version for renderers outside StoreProvider
        return null;
    }
    return ctx;
}

function parsePrice(price: string): number {
    return parseFloat(price.replace(/[^0-9.]/g, "")) || 0;
}

export function StoreProvider({ children }: { children: ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [cartOpen, setCartOpen] = useState(false);
    const [authOpen, setAuthOpen] = useState(false);
    const [authTab, setAuthTab] = useState<"login" | "register">("login");
    const [productDetailOpen, setProductDetailOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<CartItem | null>(null);
    const [checkoutOpen, setCheckoutOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [wishlist, setWishlist] = useState<string[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [notification, setNotification] = useState<string | null>(null);

    const showNotification = useCallback((msg: string) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), 3000);
    }, []);

    const addToCart = useCallback((item: Omit<CartItem, "quantity">) => {
        setCart((prev) => {
            const existing = prev.find((c) => c.id === item.id);
            if (existing) {
                return prev.map((c) => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
            }
            return [...prev, { ...item, priceNum: parsePrice(item.price), quantity: 1 }];
        });
        showNotification(`${item.name} added to cart`);
    }, [showNotification]);

    const removeFromCart = useCallback((id: string) => {
        setCart((prev) => prev.filter((c) => c.id !== id));
    }, []);

    const updateQuantity = useCallback((id: string, qty: number) => {
        if (qty <= 0) {
            setCart((prev) => prev.filter((c) => c.id !== id));
        } else {
            setCart((prev) => prev.map((c) => c.id === id ? { ...c, quantity: qty } : c));
        }
    }, []);

    const clearCart = useCallback(() => setCart([]), []);

    const cartTotal = cart.reduce((sum, item) => sum + item.priceNum * item.quantity, 0);
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    const login = useCallback((email: string, _password: string) => {
        setUser({ name: email.split("@")[0], email });
        setAuthOpen(false);
        showNotification("Welcome back!");
    }, [showNotification]);

    const register = useCallback((name: string, email: string, _password: string) => {
        setUser({ name, email });
        setAuthOpen(false);
        showNotification("Account created successfully!");
    }, [showNotification]);

    const logout = useCallback(() => {
        setUser(null);
        showNotification("Logged out");
    }, [showNotification]);

    const toggleWishlist = useCallback((id: string) => {
        setWishlist((prev) =>
            prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id]
        );
    }, []);

    const placeOrder = useCallback(() => {
        if (cart.length === 0) return;
        const order = {
            id: `ORD-${Date.now().toString(36).toUpperCase()}`,
            items: [...cart],
            total: cartTotal,
            date: new Date().toLocaleDateString(),
            status: "Processing",
        };
        setOrders((prev) => [order, ...prev]);
        clearCart();
        setCheckoutOpen(false);
        showNotification(`Order ${order.id} placed successfully!`);
    }, [cart, cartTotal, clearCart, showNotification]);

    return (
        <StoreContext.Provider value={{
            cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount,
            user, login, register, logout,
            cartOpen, setCartOpen, authOpen, setAuthOpen, authTab, setAuthTab,
            productDetailOpen, setProductDetailOpen, selectedProduct, setSelectedProduct,
            checkoutOpen, setCheckoutOpen,
            searchQuery, setSearchQuery, selectedCategory, setSelectedCategory,
            wishlist, toggleWishlist, orders, placeOrder,
            notification, setNotification,
        }}>
            {children}
        </StoreContext.Provider>
    );
}
