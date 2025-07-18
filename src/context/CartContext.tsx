"use client";

import React, { createContext, useState, useContext, useEffect } from "react";
import { CartItem } from "@/components/cart/CartOverlay";
import { useAuth } from "./AuthContext";
import cartService, { CartResponseDto, CartItemDto } from "@/services/cart";
import { useToast } from "./ToastContext";

interface CartContextType {
  cartItems: CartItem[] | null;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: string) => void;
  updateItemQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  refreshCart: () => Promise<void>;
  itemCount: number;
  isLoading: boolean;
  cart?: CartResponseDto;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [cartItems, setCartItems] = useState<CartItem[] | null>(null);
  const [cart, setCart] = useState<CartResponseDto | undefined>(undefined);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [guestId, setGuestId] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();
  const { error } = useToast();

  const itemCount = cartItems?.reduce((count, item) => count + item.quantity, 0) || 0;

  // Load guestId from localStorage on mount
  useEffect(() => {
    const storedGuestId = localStorage.getItem("forvrmurr_guest_id");
    if (storedGuestId) {
      setGuestId(storedGuestId);
    }
  }, []);

  // Fetch cart from backend API when auth state or guestId changes
  useEffect(() => {
    const fetchCart = async () => {
      setIsLoading(true);
      try {
        let cartResponse: CartResponseDto;

        if (isAuthenticated) {
          // Fetch authenticated user's cart
          cartResponse = await cartService.getCart();
          setCart(cartResponse);
          // If there was a guest ID, we can clear it now
          if (guestId) {
            localStorage.removeItem("forvrmurr_guest_id");
            setGuestId(null);
          }
        } else if (guestId) {
          // Fetch guest cart using stored guestId
          cartResponse = await cartService.getGuestCart(guestId);
          setCart(cartResponse);
        } else {
          // No auth and no guestId yet, empty cart state
          setCartItems(null);
          setCart(undefined);
          setIsLoading(false);
          return;
        }

        // Map backend cart items to frontend CartItem format
        const mappedItems: CartItem[] = cartResponse.items.map(
          (item: CartItemDto) => ({
            id: item.id,
            name: item.product.name,
            brand: item.product.name.split(" ")[0], // Just a guess, adjust based on your data
            price: parseFloat(item.price),
            imageUrl: item.product.imageUrl || null,
            quantity: item.quantity,
            productId: item.product.id,
          })
        );

        setCartItems(mappedItems);
      } catch (err) {
        console.error("Failed to fetch cart:", err);
        // If API fails, fallback to empty cart
        setCartItems(null);
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch if user is authenticated or we have a guestId
    if (isAuthenticated || guestId) {
      fetchCart();
    } else {
      // No auth and no guestId, start with empty cart
      setCartItems(null);
    }
  }, [isAuthenticated, guestId, user]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen((prev) => !prev);
  
  // Method to explicitly refresh the cart data from the backend
  const refreshCart = async () => {
    setIsLoading(true);
    try {
      let cartResponse: CartResponseDto;

      if (isAuthenticated) {
        // Fetch authenticated user's cart
        cartResponse = await cartService.getCart();
      } else if (guestId) {
        // Fetch guest cart using stored guestId
        cartResponse = await cartService.getGuestCart(guestId);
      } else {
        // No auth and no guestId yet, empty cart state
        setCartItems(null);
        setCart(undefined);
        setIsLoading(false);
        return;
      }
      
      setCart(cartResponse);
      
      // Map backend cart items to frontend CartItem format
      const mappedItems: CartItem[] = cartResponse.items.map(
        (item: CartItemDto) => ({
          id: item.id,
          name: item.product.name,
          brand: item.product.name.split(" ")[0], // Just a guess, adjust based on your data
          price: parseFloat(item.price),
          imageUrl: item.product.imageUrl || null,
          quantity: item.quantity,
          productId: item.product.id,
        })
      );

      setCartItems(mappedItems);
    } catch (err) {
      console.error("Failed to refresh cart:", err);
      // If API fails, keep existing cart state
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async (newItem: CartItem) => {
    setIsLoading(true);
    try {
      // API call to add item to cart - backend will generate a guestId for new guests
      const response = await cartService.addItemToCart(
        {
          productId: newItem.id,
          quantity: newItem.quantity,
        },
        // Only pass guestId if user is not authenticated and we already have a guestId
        !isAuthenticated && guestId ? guestId : undefined
      );

      // Check for guestId in response - the backend provides it for guest users
      if (!isAuthenticated && response.guestId) {
        // Always save the latest guestId from the response
        localStorage.setItem("forvrmurr_guest_id", response.guestId);
        setGuestId(response.guestId);
      }

      setCart(response);

      // Map backend cart items to frontend CartItem format
      const mappedItems: CartItem[] = response.items.map(
        (item: CartItemDto) => ({
          id: item.id,
          name: item.product.name,
          brand: item.product.name.split(" ")[0], // Adjust based on actual data
          price: parseFloat(item.price),
          imageUrl:
            item.product.imageUrl ||
            `/images/products/${item.product.slug}.png`,
          quantity: item.quantity,
          productId: item.product.id,
        })
      );

      setCartItems(mappedItems);

      // Open cart when adding an item
      openCart();
    } catch (err) {
      console.error("Failed to add item to cart:", err);
      try {
        // Retry after clearing tokens as a recovery attempt
        localStorage.removeItem("forvrmurr_access_token");
        localStorage.removeItem("forvrmurr_guest_id");
        
        // API call to add item to cart - backend will generate a guestId for new guests
        const response = await cartService.addItemToCart(
          {
            productId: newItem.id,
            quantity: newItem.quantity,
          },
          undefined // No guestId on retry
        );

        // Check for guestId in response - the backend provides it for guest users
        if (!isAuthenticated && response.guestId) {
          // Always save the latest guestId from the response
          localStorage.setItem("forvrmurr_guest_id", response.guestId);
          setGuestId(response.guestId);
        }

        setCart(response);

        // Map backend cart items to frontend CartItem format
        const mappedItems: CartItem[] = response.items.map(
          (item: CartItemDto) => ({
            id: item.id,
            name: item.product.name,
            brand: item.product.name.split(" ")[0], // Adjust based on actual data
            price: parseFloat(item.price),
            imageUrl:
              item.product.imageUrl ||
              `/images/products/${item.product.slug}.png`,
            quantity: item.quantity,
            productId: item.product.id,
          })
        );

        setCartItems(mappedItems);

        // Open cart when adding an item
        openCart();
      } catch (retryError) {
        console.error("Failed to add item to cart even after retry:", retryError);
        error?.("Could not add item to cart. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (itemId: string) => {
    setIsLoading(true);
    try {
      const response = await cartService.removeItemFromCart(
        itemId,
        !isAuthenticated && guestId ? guestId : undefined
      );

      // Check for updated guestId in response
      if (!isAuthenticated && response.guestId) {
        localStorage.setItem("forvrmurr_guest_id", response.guestId);
        setGuestId(response.guestId);
      }
      
      setCart(response);

      // Map backend cart items to frontend CartItem format
      const mappedItems: CartItem[] = response.items.map(
        (item: CartItemDto) => ({
          id: item.id,
          name: item.product.name,
          brand: item.product.name.split(" ")[0], // Adjust based on actual data
          price: parseFloat(item.price),
          imageUrl:
            item.product.imageUrl ||
            `/images/products/${item.product.slug}.png`,
          quantity: item.quantity,
          productId: item.product.id,
        })
      );

      setCartItems(mappedItems);
    } catch (err) {
      console.error("Failed to remove item from cart:", err);
      error?.("Could not remove item from cart. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateItemQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) return;

    setIsLoading(true);
    try {
      const response = await cartService.updateItemQuantity(
        itemId,
        quantity,
        !isAuthenticated && guestId ? guestId : undefined
      );

      // Check for updated guestId in response
      if (!isAuthenticated && response.guestId) {
        localStorage.setItem("forvrmurr_guest_id", response.guestId);
        setGuestId(response.guestId);
      }
      
      setCart(response);

      // Map backend cart items to frontend CartItem format
      const mappedItems: CartItem[] = response.items.map(
        (item: CartItemDto) => ({
          id: item.id,
          name: item.product.name,
          brand: item.product.name.split(" ")[0], // Adjust based on actual data
          price: parseFloat(item.price),
          imageUrl:
            item.product.imageUrl ||
            `/images/products/${item.product.slug}.png`,
          quantity: item.quantity,
          productId: item.product.id,
        })
      );

      setCartItems(mappedItems);
    } catch (err) {
      console.error("Failed to update item quantity:", err);
      error?.("Could not update quantity. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    setIsLoading(true);
    try {
      const response = await cartService.clearCart(
        !isAuthenticated && guestId ? guestId : undefined
      );

      // Check for updated guestId in response
      if (!isAuthenticated && response.guestId) {
        localStorage.setItem("forvrmurr_guest_id", response.guestId);
        setGuestId(response.guestId);
      }
      
      setCart(response);
      setCartItems(null);
    } catch (err) {
      console.error("Failed to clear cart:", err);
      error?.("Could not clear cart. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isCartOpen,
        openCart,
        closeCart,
        toggleCart,
        addToCart,
        removeFromCart,
        updateItemQuantity,
        clearCart,
        refreshCart,
        itemCount,
        isLoading,
        cart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export default CartContext;
