"use client";

import React from "react";
import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showSubtitle?: boolean;
  href?: string;
  className?: string;
}

export function LexVaultMark({ size = 36, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`drop-shadow-[0_2px_10px_rgba(201,162,75,0.25)] ${className}`}
    >
      <defs>
        {/* Gold Luxury Gradients */}
        <linearGradient id="lexGoldGrad" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F5E6B3" />
          <stop offset="35%" stopColor="#C9A24B" />
          <stop offset="70%" stopColor="#9C7726" />
          <stop offset="100%" stopColor="#D8B558" />
        </linearGradient>

        <linearGradient id="shieldFill" x1="24" y1="2" x2="24" y2="46" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1E232E" />
          <stop offset="100%" stopColor="#0E1117" />
        </linearGradient>

        <linearGradient id="pillarGrad" x1="24" y1="12" x2="24" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#C9A24B" stopOpacity="0.8" />
        </linearGradient>

        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Outer Shield Boundary */}
      <path
        d="M24 3L8 9V21C8 31.8 14.8 41.7 24 45C33.2 41.7 40 31.8 40 21V9L24 3Z"
        fill="url(#shieldFill)"
        stroke="url(#lexGoldGrad)"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />

      {/* Inner Vault Bevel Line */}
      <path
        d="M24 6.5L11 11.5V20.5C11 29.5 16.5 37.8 24 41C31.5 37.8 37 29.5 37 20.5V11.5L24 6.5Z"
        stroke="url(#lexGoldGrad)"
        strokeWidth="0.8"
        strokeOpacity="0.45"
        strokeDasharray="2 1.5"
      />

      {/* Central Scales of Justice Crossbeam */}
      <path
        d="M15 17.5H33"
        stroke="url(#lexGoldGrad)"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      {/* Central Ashoka / Legal Pillar */}
      <path
        d="M24 13V35"
        stroke="url(#pillarGrad)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      {/* Pillar Base */}
      <path
        d="M20 35H28"
        stroke="url(#lexGoldGrad)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M18.5 37.5H29.5"
        stroke="url(#lexGoldGrad)"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeOpacity="0.8"
      />

      {/* Left Scale Pan & Strings */}
      <path d="M16.5 18L13.5 24H19.5L16.5 18Z" fill="url(#shieldFill)" stroke="url(#lexGoldGrad)" strokeWidth="1.2" />
      <path d="M12.5 24C12.5 26.2 14.3 27.5 16.5 27.5C18.7 27.5 20.5 26.2 20.5 24H12.5Z" fill="url(#lexGoldGrad)" fillOpacity="0.35" stroke="url(#lexGoldGrad)" strokeWidth="1" />

      {/* Right Scale Pan & Strings */}
      <path d="M31.5 18L28.5 24H34.5L31.5 18Z" fill="url(#shieldFill)" stroke="url(#lexGoldGrad)" strokeWidth="1.2" />
      <path d="M27.5 24C27.5 26.2 29.3 27.5 31.5 27.5C33.7 27.5 35.5 26.2 35.5 24H27.5Z" fill="url(#lexGoldGrad)" fillOpacity="0.35" stroke="url(#lexGoldGrad)" strokeWidth="1" />

      {/* Central Vault Keyhole / Dharma Chakra Hub */}
      <circle cx="24" cy="23" r="3.2" fill="#0E1117" stroke="url(#lexGoldGrad)" strokeWidth="1.4" />
      <circle cx="24" cy="23" r="1.2" fill="#F5E6B3" />

      {/* Top Finial Sparkle */}
      <circle cx="24" cy="12.5" r="1.5" fill="#FFFFFF" filter="url(#glow)" />
    </svg>
  );
}

export default function Logo({
  size = "md",
  showSubtitle = true,
  href = "/",
  className = "",
}: LogoProps) {
  const markSize = size === "sm" ? 28 : size === "lg" ? 48 : 36;
  const titleSize = size === "sm" ? "text-sm" : size === "lg" ? "text-2xl" : "text-base";
  const badgeSize = size === "sm" ? "text-[9px] px-1 py-0.2" : size === "lg" ? "text-xs px-2 py-0.5" : "text-[10px] px-1.5 py-0.5";

  const content = (
    <div className={`flex items-center gap-2.5 group select-none ${className}`}>
      {/* Icon Mark with subtle glow hover */}
      <div className="relative transition-transform duration-300 group-hover:scale-105">
        <LexVaultMark size={markSize} />
      </div>

      {/* Brand Text */}
      <div>
        <div className="flex items-center gap-1.5">
          <div className="flex items-baseline font-serif">
            <span className={`font-extrabold tracking-tight text-content-primary ${titleSize}`}>
              Lex
            </span>
            <span
              className={`font-sans font-black tracking-tight bg-gradient-to-r from-[#F5E6B3] via-[#C9A24B] to-[#D8B558] bg-clip-text text-transparent ${titleSize}`}
            >
              Vault
            </span>
          </div>

          <span
            className={`uppercase font-mono font-bold tracking-wider rounded bg-accent/20 text-accent border border-accent/40 shadow-sm flex items-center gap-1 ${badgeSize}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span>AI</span>
          </span>
        </div>

        {showSubtitle && (
          <p className="text-[10px] font-sans tracking-wide text-content-secondary hidden sm:block">
            Indian Institutional Legal Intelligence
          </p>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex">
        {content}
      </Link>
    );
  }

  return content;
}
