"use client";

import React from "react";
import Image from "next/image";
import { CartItem } from "@/components/cart/CartOverlay";
import { CartResponseDto } from "@/services/cart";
import { TaxConfiguration } from "@/services/tax";

interface CheckoutSummaryProps {
  cartItems: CartItem[] | null;
  subtotal: number;
  shippingCost: number;
  total: number;
  cart?: CartResponseDto;
  taxConfig?: TaxConfiguration;
  taxAmount?: number;
}

const CheckoutSummary: React.FC<CheckoutSummaryProps> = ({
  cartItems,
  subtotal,
  shippingCost,
  total,
  cart,
  taxConfig,
  taxAmount,
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow sticky top-8">
      <h2 className="text-xl font-serif mb-6">Your Order</h2>

      {/* Cart Items */}
      <div className="space-y-4 mb-6">
        {cartItems !== null &&
          cartItems.map((item) => (
            <div key={item.id} className="flex gap-4">
              <div className="h-20 w-20 relative bg-gray-50 rounded-md overflow-hidden flex-shrink-0">
                <Image
                  src={item.imageUrl || "/images/hero/hero_image.png"}
                  alt={item.name}
                  fill
                  className="object-contain"
                  sizes="80px"
                />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{item.brand}</p>
                <p className="text-sm text-gray-700">{item.name}</p>
                <div className="flex justify-between mt-1">
                  <p className="text-sm text-gray-600">
                    {item.quantity} × ₦{Number(item.price).toLocaleString()}
                  </p>
                  <p className="font-medium">
                    ₦{(Number(item.price) * item.quantity).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Order Summary */}
      <div className="border-t border-gray-200 pt-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span>₦{subtotal.toLocaleString()}</span>
        </div>

         {/* Discount */}
         {cart &&
          cart.appliedDiscounts
            .filter((item) => item.title != "FM-FREESHIPPING")
            .map((discount, index) => (
              <div className="flex justify-between text-sm" key={index}>
                <div className="">
                  <span className="text-gray-600">Discount</span>
                </div>
                <span>({`₦${discount.amountDeducted.toLocaleString()}`})</span>
              </div>
            ))}
            
        {/* Shipping cost with subtle indicator */}
        <div className="flex justify-between text-sm items-center">
          <span className="text-gray-600">Shipping</span>
          {cart?.hasFreeShipping ? (
            <div className="flex items-center">
              <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-sm bg-gradient-to-r from-amber-50 to-red-50 text-[#a0001e] border border-amber-100">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                Free Shipping Applied
              </span>
            </div>
          ) : (
            <span className="font-medium">
              ₦{shippingCost.toLocaleString()}
            </span>
          )}
        </div>
       
        {/* Tax */}
        {taxConfig && taxAmount !== undefined && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              Tax ({parseFloat(taxConfig.rate) * 100}%)
            </span>
            <span>₦{taxAmount.toLocaleString()}</span>
          </div>
        )}
        {/* Total */}
        <div className="border-t border-gray-200 pt-3 flex justify-between font-medium text-base">
          <span>Total</span>
          <span className="text-[#a0001e]">₦{total.toLocaleString()}</span>
        </div>
      </div>

      {/* Secure payment note */}
      <div className="mt-6 text-center">
        <div className="flex justify-center items-center gap-2 text-sm text-gray-600 mb-2">
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <span>Secure payment</span>
        </div>
        <p className="text-xs text-gray-500">
          All data is encrypted. Your card number is never stored on our
          servers.
        </p>
      </div>
    </div>
  );
};

export default CheckoutSummary;
