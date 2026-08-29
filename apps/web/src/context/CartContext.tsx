import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  type: string;
  details?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  cartItemsCount: number;
  totalCart: number;
  cartExpanded: boolean;
  setCartExpanded: (expanded: boolean) => void;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartExpanded, setCartExpanded] = useState(false);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(
        item => item.product.id === product.id
      );

      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item
        );
      }

      return [
        ...prev,
        {
          product,
          quantity: 1,
        },
      ];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev =>
      prev.filter(item => item.product.id !== productId)
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartItemsCount = cart.reduce(
    (acc, item) => acc + item.quantity,
    0
  );

  const totalCart = cart.reduce(
    (acc, item) =>
      acc + item.product.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        cartItemsCount,
        totalCart,
        cartExpanded,
        setCartExpanded,
        addToCart,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart debe utilizarse dentro de CartProvider"
    );
  }

  return context;
}
