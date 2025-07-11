"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import Button from "./Button"; // Import the new Button component

const HeroSection: React.FC = () => {
  return (
    <section className="relative w-full text-white min-h-[70vh] md:min-h-[80vh] flex items-center justify-center py-12 md:py-0 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 bg-black/70 ">
        {" "}
        {/* Fallback color while image loads */}
        <Image
          src="/images/hero/hero_1.png"
          alt="Luxury perfume collection background"
          fill
          sizes="(max-width: 768px) 100vw, 100vw"
          quality={85}
          className="object-cover object-[38%_10%] md:object-[50%_10%] transition-opacity duration-500"
          priority
          onError={(e) => {
            console.error("Error loading hero image");
            // Try fallback image if primary fails
            const target = e.target as HTMLImageElement;
            target.src = "/images/hero/hero_1.jpg";
          }}
        />
      </div>
      {/* Gradient Overlay for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-r m-4 from-black/85 to-transparent z-10 "></div>
      {/* Overlay Content Container */}
      <div className="relative z-20 max-w-7xl w-full mx-auto px-12 text-left">
        <div className="space-y-6 md:w-1/2">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium tracking-wide text-[#e6c789]">
            MEET YOUR NEXT OBSESSION
          </h1>
          <p className="text-lg md:text-xl font-light text-[#e6c789]">
            Explore coveted fragrances like Delina, Khamrah & Oud Satin - in 8ml
            portions.
          </p>
          <p className="text-lg md:text-xl font-light text-[#e6c789] mb-8">
            Smell rich. Explore more. No full bottle pressure.
          </p>
          <Link href="/shop">
            <Button>Shop Now</Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
