import Link from "next/link";
import { ArrowRight, UploadCloud } from "lucide-react";

export default function SubmissionCallout() {
  return (
    <section className="w-full bg-black text-white border-b border-black">
      <div className="p-8 sm:p-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 text-[10px] font-mono-code uppercase tracking-wider text-[#E11D48] font-bold">
            <span className="w-1.5 h-1.5 bg-[#E11D48] animate-pulse"></span>
            OPEN COMMONS INGESTION
          </div>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl uppercase tracking-tight text-white">
            SUBMIT TO THE COMMONS.
          </h2>
          <p className="font-body text-xs sm:text-sm text-[#AAAAAA]">
            Contribute clean, uncaptioned meme templates. Published watermark-free for creators worldwide.
          </p>
        </div>

        <Link
          href="/upload"
          className="shrink-0 inline-flex items-center gap-2 px-6 py-3.5 bg-white text-black hover:bg-[#E6E4DC] font-mono-code text-xs uppercase tracking-wider font-extrabold transition-all hover:translate-y-[-1px] active:translate-y-[1px] shadow-[3px_3px_0px_0px_rgba(225,29,72,1)]"
        >
          <UploadCloud className="w-4 h-4 text-[#E11D48]" />
          SUBMIT TEMPLATE
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </section>
  );
}
