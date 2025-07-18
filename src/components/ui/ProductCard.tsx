"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/services/product";
import ProductBadge from "./ProductBadge";
import NewArrivalBadge from "./NewArrivalBadge";
import OutOfStockBadge from "./OutOfStockBadge";
import HoverAddToCartButton from "./HoverAddToCartButton";
import { findNotesImageLocally } from "@/utils/helpers";
import { useCart } from "@/context/CartContext";
import { toastService } from "@/services/toast";
import NotifyMeModal from "./NotifyMeModal";
const FALLBACK_NOTE_IMAGE = "/images/scent_notes/default.png";

interface ProductCardProps {
  product: Product;
  priorityLoading?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  priorityLoading = false,
}) => {
  const { addToCart } = useCart();
  const [isMobile, setIsMobile] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  
  // Check if the product is out of stock
  const isOutOfStock = product.inventoryQuantity <= 0;
  
  // Check if product is a new arrival (created within last 14 days)
  const isNewArrival = () => {
    if (!product.shopifyCreatedAt) return false;
    
    const createdDate = new Date(product.shopifyCreatedAt);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate.getTime() - createdDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays <= 30;
  };
  
  // Format concentration from snake_case to proper display format
  const formatConcentration = (concentration?: string | null): string => {
    if (!concentration) return "EAU DE PARFUM";
    
    // Convert snake_case to title case
    return concentration
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Detect mobile view on client side
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768); // 768px is typically where md: breakpoint starts
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);
  // Smart algorithm to select notes for display
  const getDisplayNotes = (product: Product, maxNotes: number = 6) => {
    const allNotes: Array<{ note: any; type: "top" | "middle" | "base" }> = [];

    // Collect all notes with their types
    if (product.topNotes?.length > 0) {
      product.topNotes.forEach((note) => allNotes.push({ note, type: "top" }));
    }
    if (product.middleNotes?.length > 0) {
      product.middleNotes.forEach((note) =>
        allNotes.push({ note, type: "middle" })
      );
    }
    if (product.baseNotes?.length > 0) {
      product.baseNotes.forEach((note) =>
        allNotes.push({ note, type: "base" })
      );
    }

    // If we have fewer notes than maxNotes, return all
    if (allNotes.length <= maxNotes) {
      return allNotes;
    }

    // Smart selection algorithm: ensure we get a good mix from each category
    const selectedNotes: Array<{ note: any; type: "top" | "middle" | "base" }> =
      [];
    const topNotes = allNotes.filter((n) => n.type === "top");
    const middleNotes = allNotes.filter((n) => n.type === "middle");
    const baseNotes = allNotes.filter((n) => n.type === "base");

    // Calculate how many notes to take from each category
    const categoriesWithNotes = [topNotes, middleNotes, baseNotes].filter(
      (arr) => arr.length > 0
    );
    const notesPerCategory = Math.floor(maxNotes / categoriesWithNotes.length);
    let remainingSlots = maxNotes;

    // Take notes from each category proportionally
    if (topNotes.length > 0) {
      const takeFromTop = Math.min(
        notesPerCategory,
        topNotes.length,
        remainingSlots
      );
      const shuffledTop = [...topNotes].sort(() => Math.random() - 0.5);
      selectedNotes.push(...shuffledTop.slice(0, takeFromTop));
      remainingSlots -= takeFromTop;
    }

    if (middleNotes.length > 0 && remainingSlots > 0) {
      const takeFromMiddle = Math.min(
        notesPerCategory,
        middleNotes.length,
        remainingSlots
      );
      const shuffledMiddle = [...middleNotes].sort(() => Math.random() - 0.5);
      selectedNotes.push(...shuffledMiddle.slice(0, takeFromMiddle));
      remainingSlots -= takeFromMiddle;
    }

    if (baseNotes.length > 0 && remainingSlots > 0) {
      const takeFromBase = Math.min(
        notesPerCategory,
        baseNotes.length,
        remainingSlots
      );
      const shuffledBase = [...baseNotes].sort(() => Math.random() - 0.5);
      selectedNotes.push(...shuffledBase.slice(0, takeFromBase));
      remainingSlots -= takeFromBase;
    }

    // Fill remaining slots randomly from any category
    if (remainingSlots > 0) {
      const unusedNotes = allNotes.filter(
        (noteItem) =>
          !selectedNotes.some(
            (selected) => selected.note.id === noteItem.note.id
          )
      );
      const shuffledUnused = [...unusedNotes].sort(() => Math.random() - 0.5);
      selectedNotes.push(...shuffledUnused.slice(0, remainingSlots));
    }

    return selectedNotes;
  };

  const displayNotes = getDisplayNotes(product, 6);

  // Function to handle product click and navigation
  const handleProductClick = (e: React.MouseEvent) => {
    // Don't navigate if the modal is open
    if (isNotifyModalOpen) {
      e.preventDefault();
      return;
    }
    
    // Otherwise, default link behavior will happen
  };

  return (
    <div className="relative w-full"> {/* Wrapper div to position modal */}
      <Link 
        href={`/shop/${product?.slug}`} 
        className="block w-full group" 
        onClick={handleProductClick}
      >
        <div className="bg-[#f8f5f2] relative rounded-lg overflow-hidden p-4 transition-all duration-300 group-hover:shadow-xl pt-10 h-full flex flex-col">
        {/* Product badges/tags */}
        <div className="absolute top-3 left-3">
          {product.type === "premium" ? (
            <ProductBadge type="premium" />
          ) : (
            <ProductBadge type="prime" />
          )}
        </div>
        <div className="absolute top-3 right-3 flex flex-col items-end gap-2">
          {/* If out of stock, only show the out of stock badge */}
          {isOutOfStock ? (
            <OutOfStockBadge />
          ) : (
            /* When in stock, show bestseller badge if applicable */
            product.isBestSeller && <ProductBadge type="bestseller" />
          )}
        </div>

        {/* Product image */}
        <div className="relative h-48 w-full overflow-hidden mt-10 mb-6">
          <Image
            src={product.imageUrls?.[0] || "/images/hero/hero_image.png"}
            alt={product.name}
            fill
            style={{ objectFit: "contain" }}
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={priorityLoading}
          />
          {/* New Arrival Badge - positioned at bottom left */}
          {isNewArrival() && (
            <div className="absolute bottom-4 left-6">
              <NewArrivalBadge />
            </div>
          )}
        </div>

        {/* Product info (visible when not hovering) */}
        <div className="text-center flex-grow">
          <h3 className="text-xl font-serif mb-1">{product.brand?.name}</h3>
          <p className="text-sm text-gray-700 mb-2 line-clamp-2 h-10">
            {product.name}
          </p>
          <p className="text-sm font-medium">
            Our 8ml price:{" "}
            <span className="text-red-800">
              ₦{parseInt(product.nairaPrice).toLocaleString()}
            </span>
          </p>
          
          {/* Mobile-only Add to Cart or Notify Me Button */}
          <div className="mt-4 md:hidden">
            {isOutOfStock ? (
              <button 
                onClick={(e) => {
                  e.preventDefault(); // Stop link navigation
                  e.stopPropagation(); // Stop event bubbling
                  setIsNotifyModalOpen(true);
                }}
                className="bg-gray-700 hover:bg-gray-800 text-white py-2 px-4 rounded-lg text-sm font-medium w-full transition-colors duration-200"
              >
                Notify Me
              </button>
            ) : (
              <button 
                onClick={(e) => {
                  e.preventDefault(); // Stop link navigation
                  e.stopPropagation(); // Stop event bubbling
                  
                  setIsAdding(true);
                  try {
                    addToCart({
                      id: product.id,
                      name: product.name,
                      brand: product.brand?.name || '',
                      price: Number(product.nairaPrice),
                      imageUrl: product.imageUrls?.[0] || "/images/products/fallback.png",
                      productId: product.id,
                      quantity: 1,
                    });
                  } finally {
                    setIsAdding(false);
                  }
                }}
                disabled={isAdding}
                className={`bg-[#a0001e] hover:bg-[#8B0000] text-white py-2 px-4 rounded-lg text-sm font-medium w-full transition-colors duration-200 ${isAdding ? "opacity-75 cursor-not-allowed" : ""}`}
              >
                {isAdding ? "Adding..." : "Add to Cart"}
              </button>
            )}
          </div>
        </div>

        {/* Hover overlay with blur effect - hidden on mobile, visible on hover for desktop */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:flex flex-col justify-between p-6 text-white z-40 rounded-lg">
          <div className="pt-6">
            <h4 className="text-xl font-medium text-center text-white">
              {product.brand?.name}
            </h4>
            {/* Concentration */}
            <div className="mt-2 text-center">
              <p className="text-sm text-gray-200 uppercase">
                {product.name} {formatConcentration(product.concentration) || "EAU DE PARFUM"}
              </p>
            </div>
            {/* Scent Notes */}
            {displayNotes.length > 0 && (
              <div className="mt-6 grid grid-cols-3 gap-x-2 gap-y-3 justify-items-center w-[85%] mx-auto">
                {displayNotes.map((noteItem, index) => (
                  <div
                    key={`${noteItem.type}-${noteItem.note.id}-${index}`}
                    className="flex flex-col gap-1 items-center text-center w-full max-w-[70px]"
                  >
                    <div className="relative w-8 h-8">
                      <Image
                        src={noteItem.note?.iconUrl || FALLBACK_NOTE_IMAGE}
                        alt=""
                        fill
                        className="object-contain"
                      />
                    </div>
                    <p className="text-xs text-gray-200 leading-tight line-clamp-2 break-words">
                      {noteItem.note?.name}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="text-center mt-auto">
            <p className="text-white font-medium mb-1">
              Our 8ml price:{"  "}
              <span className="text-[#8B0000]">
                ₦{parseInt(product.nairaPrice).toLocaleString()}
              </span>
            </p>
            {product.priceFullBottle && (
              <p className="text-sm text-gray-200 mb-3">
                Full Bottle Price:{"  "}
                <span>
                  ${parseInt(product.priceFullBottle).toLocaleString()}
                </span>
              </p>
            )}
            {isOutOfStock ? (
              <button
                onClick={(e) => {
                  e.preventDefault(); // Stop link navigation
                  e.stopPropagation(); // Stop event bubbling
                  
                  // Set a small delay to ensure click event fully propagates
                  setTimeout(() => {
                    setIsNotifyModalOpen(true);
                  }, 10);
                }}
                className="w-full bg-gray-700 hover:bg-gray-800 text-white py-2 rounded-lg transition-colors"
              >
                Notify When Available
              </button>
            ) : (
              <HoverAddToCartButton product={product} />
            )}
          </div>
        </div>
      </div>
      </Link>
      
      {/* Notify Me Modal - moved outside the Link component */}
      {isNotifyModalOpen && (
        <NotifyMeModal
          isOpen={isNotifyModalOpen}
          onClose={() => setIsNotifyModalOpen(false)}
          product={product}
        />
      )}
    </div>
  );
};

export default ProductCard;
