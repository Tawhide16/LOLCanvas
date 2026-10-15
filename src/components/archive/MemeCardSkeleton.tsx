"use client";

import React from "react";

interface MemeCardSkeletonProps {
  count?: number;
}

export default function MemeCardSkeleton({ count = 8 }: MemeCardSkeletonProps) {
  return (
    <div className="p-4 sm:p-6 lg:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 bg-[#FAF9F5]">
      {Array.from({ length: count }).map((_, index) => (
        <article
          key={index}
          className="bg-white border border-black p-4 space-y-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between select-none"
        >
          <div className="space-y-3">
            <div className="aspect-square bg-[#FAF9F5] border border-black/15 p-2 flex items-center justify-center animate-shimmer">
              <div className="w-8 h-8 border-2 border-black/20 border-t-black animate-spin" />
            </div>
            <div className="space-y-1.5">
              <div className="h-4 w-3/4 bg-black/15 animate-pulse" />
              <div className="h-3 w-1/2 bg-black/10 animate-pulse" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-black/10 font-mono-code text-[11px]">
            <div className="h-7 bg-black animate-pulse" />
            <div className="h-7 bg-white border border-black animate-pulse" />
          </div>
        </article>
      ))}
    </div>
  );
}
