"use client";

import React from "react";

interface MemeCardSkeletonProps {
  count?: number;
}

export default function MemeCardSkeleton({ count = 8 }: MemeCardSkeletonProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-l border-t border-black bg-[#FAF9F5]">
      {Array.from({ length: count }).map((_, index) => (
        <article
          key={index}
          className="flex flex-col justify-between bg-white border-r border-b border-black select-none"
        >


          {/* Visual Preview Aspect Square with Shimmer Effect */}
          <div className="w-full aspect-square relative overflow-hidden bg-[#FAF9F5] flex items-center justify-center animate-shimmer border-b border-black/10">
            <div className="w-16 h-16 border border-black/10 flex flex-col items-center justify-center gap-1.5 opacity-40">
              <div className="w-6 h-6 border-2 border-black/30 border-t-black animate-spin" />
              <span className="font-mono-code text-[9px] font-bold text-black/40">LOADING</span>
            </div>
          </div>

          {/* Bottom Title & Actions Skeleton */}
          <div className="p-3 border-t border-black/15 flex flex-col justify-between space-y-2.5 bg-[#FAF9F5]">
            <div className="flex items-center justify-between">
              <div className="h-3.5 w-3/5 bg-black/20 animate-pulse" />
              <div className="h-3 w-8 bg-black/10 animate-pulse shrink-0 ml-2" />
            </div>

            {/* Action Buttons Skeleton */}
            <div className="grid grid-cols-2 gap-2 font-mono-code text-[11px]">
              <div className="h-7 bg-black animate-pulse flex items-center justify-center">
                <span className="text-[10px] text-white/40 font-bold uppercase">...</span>
              </div>
              <div className="h-7 bg-white border border-black animate-pulse flex items-center justify-center">
                <span className="text-[10px] text-black/30 font-bold uppercase">...</span>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

