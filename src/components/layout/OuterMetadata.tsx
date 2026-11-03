"use client";

import Link from "next/link";
import { useSiteContent } from "@/lib/useSiteContent";
import SuperAdminInlineEdit from "@/components/common/SuperAdminInlineEdit";

interface OuterMetadataProps {
  position: "top" | "bottom";
}

export default function OuterMetadata({ position }: OuterMetadataProps) {
  const { content } = useSiteContent();

  if (position === "top") {
    return (
      <header className="w-full bg-[#E6E4DC] border-b border-black px-4 py-1.5 flex items-center justify-between text-[11px] font-mono-code uppercase tracking-wider text-black">
        <div className="flex items-center gap-2 font-bold">
          <span className="w-2 h-2 bg-black inline-block"></span>
          <span>LOLCANVAS® ARCHIVE</span>
        </div>

        <div className="flex items-center gap-4 text-[#555555]">
          <SuperAdminInlineEdit
            field="topBarBadge"
            label="Top Bar Badge"
            value={content.topBarBadge}
          >
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-[#E11D48] animate-pulse"></span>
              <span className="text-black font-semibold">{content.topBarBadge}</span>
            </span>
          </SuperAdminInlineEdit>

          <span className="hidden sm:inline text-black/20">|</span>

          <SuperAdminInlineEdit
            field="topBarEmail"
            label="Top Bar Contact Email"
            value={content.topBarEmail}
          >
            <Link
              href="/contact"
              className="hidden sm:inline text-black hover:underline font-bold"
            >
              {content.topBarEmail}
            </Link>
          </SuperAdminInlineEdit>
        </div>
      </header>
    );
  }

  return (
    <footer className="w-full bg-[#E6E4DC] border-t border-black px-4 py-1.5 flex items-center justify-between text-[11px] font-mono-code uppercase tracking-wider text-[#666666]">
      <div>LOLCANVAS.STUDIO // {content.footerStatus}</div>
      <div className="text-black font-semibold">CLIENT-SIDE ENGINE</div>
    </footer>
  );
}
