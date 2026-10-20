"use client";

import Link from "next/link";
import { ArrowRight, UploadCloud } from "lucide-react";
import { useSiteContent } from "@/lib/useSiteContent";
import SuperAdminInlineEdit from "@/components/common/SuperAdminInlineEdit";

export default function SubmissionCallout() {
  const { content } = useSiteContent();

  const getTitleClass = (size?: string) => {
    switch (size) {
      case "xl": return "text-xl sm:text-2xl";
      case "2xl": return "text-2xl sm:text-3xl";
      case "4xl": return "text-3xl sm:text-4xl md:text-5xl";
      case "3xl":
      default: return "text-2xl sm:text-3xl md:text-4xl";
    }
  };

  const getSubtitleClass = (size?: string) => {
    switch (size) {
      case "xs": return "text-[11px] sm:text-xs";
      case "base": return "text-sm sm:text-base";
      case "sm":
      default: return "text-xs sm:text-sm";
    }
  };

  return (
    <section className="w-full bg-black text-white border-b border-black relative overflow-hidden">
      <div className="p-8 sm:p-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
        <div className="space-y-2 max-w-xl">
          <SuperAdminInlineEdit
            field="submissionBadge"
            label="Commons Callout Badge"
            value={content.submissionBadge}
          >
            <div className="inline-flex items-center gap-2 text-[10px] font-mono-code uppercase tracking-wider text-[#E11D48] font-bold">
              <span className="w-1.5 h-1.5 bg-[#E11D48] animate-pulse"></span>
              {content.submissionBadge}
            </div>
          </SuperAdminInlineEdit>

          <SuperAdminInlineEdit
            field="submissionTitle"
            label="Commons Callout Headline"
            value={content.submissionTitle}
            asBlock
          >
            <h2 className={`font-display font-extrabold uppercase tracking-tight text-white ${getTitleClass(content.submissionTitleSize)}`}>
              {content.submissionTitle}
            </h2>
          </SuperAdminInlineEdit>

          <SuperAdminInlineEdit
            field="submissionSubtitle"
            label="Commons Callout Subtitle"
            value={content.submissionSubtitle}
            multiline
            asBlock
          >
            <p className={`font-body text-[#AAAAAA] ${getSubtitleClass(content.submissionSubtitleSize)}`}>
              {content.submissionSubtitle}
            </p>
          </SuperAdminInlineEdit>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          {content.submissionImageUrl && (
            <SuperAdminInlineEdit
              field="submissionImageUrl"
              label="Commons Banner Image URL"
              value={content.submissionImageUrl}
            >
              <img
                src={content.submissionImageUrl}
                alt="Commons Accent"
                className="w-16 h-16 object-cover border border-white/30 hidden md:block"
              />
            </SuperAdminInlineEdit>
          )}

          <SuperAdminInlineEdit
            field="submissionButtonText"
            label="Commons Callout Button Text"
            value={content.submissionButtonText || "SUBMIT TEMPLATE"}
          >
            <Link
              href="/upload"
              className="shrink-0 inline-flex items-center gap-2 px-6 py-3.5 bg-white text-black hover:bg-[#E6E4DC] font-mono-code text-xs uppercase tracking-wider font-extrabold transition-all hover:translate-y-[-1px] active:translate-y-[1px] shadow-[3px_3px_0px_0px_rgba(225,29,72,1)]"
            >
              <UploadCloud className="w-4 h-4 text-[#E11D48]" />
              {content.submissionButtonText || "SUBMIT TEMPLATE"}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </SuperAdminInlineEdit>
        </div>
      </div>
    </section>
  );
}
