"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/services/product";
import ProductBadge from "./ProductBadge";
import HoverAddToCartButton from "./HoverAddToCartButton";
import { findNotesImageLocally } from "@/utils/helpers";
const FALLBACK_NOTE_IMAGE = "/images/scent_notes/default.png";

interface ProductCardProps {
  product: Product;
  priorityLoading?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  priorityLoading = false,
}) => {
  return (
    <Link href={`/shop/${product?.slug}`} className="block w-full group">
      <div className="bg-[#f8f5f2] relative rounded-lg overflow-hidden p-4 transition-all duration-300 group-hover:shadow-xl pt-10 h-full">
        {/* Product badges/tags */}
        <div className="absolute top-3 left-3">
          {product.type === "premium" ? (
            <ProductBadge type="premium" />
          ) : (
            <ProductBadge type="prime" />
          )}
        </div>
        <div className="absolute top-3 right-3">
          {product.isBestSeller && <ProductBadge type="bestseller" />}
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
        </div>

        {/* Product info (visible when not hovering) */}
        <div className="text-center">
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
        </div>

        {/* Hover overlay with blur effect */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-6 text-white z-40 rounded-lg">
          <div className="pt-8">
            <h4 className="text-lg font-medium text-center text-white">
              {product.brand?.name}
            </h4>
            {/* Concentration */}
            <div className="mt-3 text-center">
              <p className="text-sm text-gray-200 uppercase">
                {product.name} {product.concentration || "EAU DE PARFUM"}
              </p>
            </div>
            {/* Scent Notes */}
            {(product.topNotes?.length > 0 ||
              product.middleNotes?.length > 0 ||
              product.baseNotes?.length > 0) && (
              <div className="mt-4 flex flex-wrap text-nowrap justify-center items-start space-x-3">
                {product.topNotes.slice(0, 2).map((note) => (
                  <div
                    key={`top-${note.id}`}
                    className="flex flex-col gap-1 items-center text-center"
                  >
                    <div className="relative w-8 h-8 ">
                      <Image
                        src={
                          findNotesImageLocally(note.name) ||
                          FALLBACK_NOTE_IMAGE
                        }
                        alt={note.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <p className="text-xs ">{note?.name}</p>
                  </div>
                ))}
                {product.middleNotes.slice(0, 2).map((note) => (
                  <div
                    key={`mid-${note.id}`}
                    className="flex flex-col gap-1 items-center text-center"
                  >
                    <div className="relative w-8 h-8 ">
                      <Image
                        src={
                          findNotesImageLocally(note.name) ||
                          FALLBACK_NOTE_IMAGE
                        }
                        alt={note.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <p className="text-xs text-gray-300">{note?.name}</p>
                  </div>
                ))}
                {product.baseNotes.slice(0, 1).map((note) => (
                  <div
                    key={`mid-${note.id}`}
                    className="flex flex-col gap-1 items-center text-center"
                  >
                    <div className="relative w-8 h-8">
                      <Image
                        src={
                          findNotesImageLocally(note.name) ||
                          FALLBACK_NOTE_IMAGE
                        }
                        alt={note.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <p className="text-xs text-gray-300">{note?.name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="text-center mt-auto">
            <p className="text-white text-xl font-medium mb-1">
              Our 8ml price:{"  "}
              <span className="text-[#8B0000]">
                ₦{parseInt(product.nairaPrice).toLocaleString()}
              </span>
            </p>
            {product.priceFullBottle && (
              <p className="text-sm text-gray-300 mb-3">
                Full Bottle Price{"  "}
                <span className="text-white">
                  ${parseInt(product.priceFullBottle).toLocaleString()}
                </span>
              </p>
            )}
            <HoverAddToCartButton product={product} />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
