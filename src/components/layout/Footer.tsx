"use client";

import Link from "next/link";
import { useSiteContent } from "@/lib/useSiteContent";
import { useSiteLogo } from "@/lib/useSiteLogo";
import SuperAdminInlineEdit from "@/components/common/SuperAdminInlineEdit";

export default function Footer() {
  const { content } = useSiteContent();
  const siteLogo = useSiteLogo();

  return (
    <footer className="w-full bg-[#000000] text-white border-t border-black">
      {/* 4 Clean Columns */}
      <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-[#222222] border-b border-[#222222]">
        {/* Col 1 */}
        <div className="p-6 space-y-3">
          <div className="flex items-center gap-2">
            <img
              src={siteLogo.logoUrl}
              alt="LOLCanvas Icon"
              className="w-6 h-6 object-contain bg-white rounded-xs p-0.5"
            />
            <span className="font-display font-extrabold text-base tracking-tight text-white uppercase">
              {siteLogo.logoText}
              {siteLogo.logoTag && (
                <span className="text-[10px] align-super font-mono-code font-normal ml-0.5">
                  {siteLogo.logoTag}
                </span>
              )}
            </span>
          </div>
          <SuperAdminInlineEdit
            field="footerDescription"
            label="Footer Description"
            value={content.footerDescription}
            multiline
            asBlock
          >
            <p className="font-body text-[11px] text-[#888888] leading-relaxed">
              {content.footerDescription}
            </p>
          </SuperAdminInlineEdit>
        </div>

        {/* Col 2 */}
        <div className="p-6 space-y-3 font-mono-code text-xs">
          <div className="text-[10px] text-[#666666] uppercase tracking-wider">
            ARCHIVE
          </div>
          <ul className="space-y-2 text-[#CCCCCC]">
            <li>
              <Link href="/cards" className="hover:text-white hover:underline block">
                ALL TEMPLATES
              </Link>
            </li>
            <li>
              <Link href="/collection" className="hover:text-white hover:underline block">
                CATEGORIES (01–08)
              </Link>
            </li>
            <li>
              <Link href="/cards?sort=trending" className="hover:text-white hover:underline block">
                TRENDING DISPATCH
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3 */}
        <div className="p-6 space-y-3 font-mono-code text-xs">
          <div className="text-[10px] text-[#666666] uppercase tracking-wider">
            CANVAS
          </div>
          <ul className="space-y-2 text-[#CCCCCC]">
            <li>
              <Link href="/editor" className="hover:text-white hover:underline block">
                OPEN EDITOR
              </Link>
            </li>
            <li>
              <Link href="/upload" className="hover:text-white hover:underline block">
                SUBMIT TEMPLATE
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-white hover:underline block">
                WATERMARK CHARTER
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 4 */}
        <div className="p-6 space-y-3 font-mono-code text-xs">
          <div className="text-[10px] text-[#666666] uppercase tracking-wider">
            STUDIO
          </div>
          <ul className="space-y-2 text-[#CCCCCC]">
            <li>
              <Link href="/about" className="hover:text-white hover:underline block">
                MANIFESTO
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-white hover:underline block">
                CONTACT DESK
              </Link>
            </li>
            <li>
              <Link href="/login" className="hover:text-white hover:underline block">
                CREATOR PORTAL
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Clean Bottom Strip */}
      <div className="px-6 py-3 flex items-center justify-between text-[11px] font-mono-code text-[#777777]">
        <SuperAdminInlineEdit
          field="footerCopyright"
          label="Footer Copyright"
          value={content.footerCopyright}
        >
          <div>{content.footerCopyright}</div>
        </SuperAdminInlineEdit>

        <SuperAdminInlineEdit
          field="footerStatus"
          label="System Status Text"
          value={content.footerStatus}
        >
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#10B981]"></span>
            <span className="text-white">STATUS: {content.footerStatus}</span>
          </div>
        </SuperAdminInlineEdit>
      </div>
    </footer>
  );
}
