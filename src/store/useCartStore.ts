import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface Ingredient {
    _id: string;
    name: string;
    category?: string;
    unit?: string;
}

export type CartItem = Ingredient & { quantity: number };

interface CartState {
    cart: CartItem[];
    addItem: (item: Ingredient) => void;
    removeItem: (id: string) => void;
    changeQuantity: (id: string, delta: number) => void;
    clearCart: () => void;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            cart: [],
            addItem: (item) => {
                const { cart } = get();
                const existingIndex = cart.findIndex((it) => it._id === item._id);

                if (existingIndex > -1) {
                    const nextCart = [...cart];
                    nextCart[existingIndex].quantity += 1;
                    set({ cart: nextCart });
                } else {
                    set({ cart: [...cart, { ...item, quantity: 1 }] });
                }
            },
            removeItem: (id) => {
                set({ cart: get().cart.filter((item) => item._id !== id) });
            },
            changeQuantity: (id, delta) => {
                const { cart } = get();
                const nextCart = cart
                    .map((item) => {
                        if (item._id === id) {
                            const newQty = item.quantity + delta;
                            return newQty > 0 ? { ...item, quantity: newQty } : item;
                        }
                        return item;
                    });
                // Note: we are NOT removing if qty goes to 0 here, unless desired. 
                // The current logic in ShoppingList screen was max(1, ...). 
                // Let's stick to that for parity, but typically 0 removes it.
                // Let's enforce min 1 for changeQuantity, removeItem handle deletion.

                set({
                    cart: cart.map(item =>
                        item._id === id
                            ? { ...item, quantity: Math.max(1, item.quantity + delta) }
                            : item
                    )
                });
            },
            clearCart: () => set({ cart: [] }),
        }),
        {
            name: "shopping-cart-storage",
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
