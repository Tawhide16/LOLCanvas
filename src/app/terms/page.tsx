import { Metadata } from "next";
import Link from "next/link";
import { Scale, AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service — LOLCanvas® Archive & Studio",
  description:
    "LOLCanvas Terms of Service: Guidelines for acceptable use, community contributions, parody fair use, and content moderation.",
};

export default function TermsPage() {
  return (
    <div className="flex flex-col w-full bg-[#FAF9F5] min-h-screen">
      {/* Header Banner */}
      <div className="p-6 sm:p-10 md:p-14 border-b border-black bg-[#FAF9F5]">
        <div className="max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#E6E4DC] border border-black text-[11px] font-mono-code uppercase tracking-wider text-black font-semibold">
            <Scale className="w-3.5 h-3.5 text-black" />
            LEGAL ARCHIVE // DOC 02
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-5xl md:text-6xl tracking-tight uppercase text-black leading-none">
            TERMS OF SERVICE.
          </h1>
          <p className="font-body text-base sm:text-lg text-[#555555] leading-relaxed max-w-2xl">
            Welcome to LOLCanvas. By accessing or using our editor, website, or community archive, you agree to comply with these terms.
          </p>
        </div>
      </div>

      {/* Structured Sections */}
      <div className="max-w-5xl mx-auto w-full p-6 sm:p-10 md:p-14 space-y-12 font-body text-sm text-[#333333]">
        {/* Acceptable Use Notice Box */}
        <div className="p-5 border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono-code font-bold uppercase text-[#E11D48]">
            <ShieldAlert className="w-4 h-4" />
            COMMUNITY SAFETY & ZERO-TOLERANCE RULES
          </div>
          <p className="text-sm leading-relaxed">
            LOLCanvas is an open creative sandbox. We strictly prohibit any content that promotes hate speech, violence, illegal activity, harassment, non-consensual personal imagery, or copyright infringement. Submissions violating these rules will be removed immediately, and offending users will be permanently banned.
          </p>
        </div>

        {/* Section 1 */}
        <div className="space-y-3 border-l-2 border-black pl-5">
          <h2 className="font-display font-extrabold text-xl text-black uppercase tracking-tight">
            1. Parody, Satire & Fair Use Disclaimers
          </h2>
          <p className="leading-relaxed">
            Many templates indexed in LOLCanvas derive from popular cultural moments, internet memes, television, film, or public discussions. These formats are curated solely for the purposes of social commentary, parody, criticism, education, and artistic transformation under applicable Fair Use doctrines.
          </p>
          <p className="leading-relaxed">
            LOLCanvas does not claim ownership over underlying third-party intellectual property or copyright in referenced cultural screenshots. All user-generated edits and typography additions are the sole responsibility of the respective creator.
          </p>
        </div>

        {/* Section 2 */}
        <div className="space-y-3 border-l-2 border-black pl-5">
          <h2 className="font-display font-extrabold text-xl text-black uppercase tracking-tight">
            2. Content Moderation & Political / Satire Guidelines
          </h2>
          <p className="leading-relaxed">
            The &quot;Political & Satire&quot; (Category 08) archive hosts public discourse and satire. However, satire must not be used to spread malicious defamation, incite harm, or impersonate official election bodies. Every community upload submitted to the public archive is subject to human administrative review before being canonized.
          </p>
          <p className="leading-relaxed">
            If you encounter any template or card that breaches community standards, you can instantly file a report through our{" "}
            <Link href="/contact" className="font-bold underline hover:text-[#E11D48]">
              Contact & Moderation Desk
            </Link>{" "}
            or email{" "}
            <a href="mailto:desk@lolcanvas.studio" className="font-mono-code font-bold underline hover:text-[#E11D48]">
              desk@lolcanvas.studio
            </a>
            .
          </p>
        </div>

        {/* Section 3 */}
        <div className="space-y-3 border-l-2 border-black pl-5">
          <h2 className="font-display font-extrabold text-xl text-black uppercase tracking-tight">
            3. In-Browser Canvas & Local Export License
          </h2>
          <p className="leading-relaxed">
            When you export a PNG or SVG meme created inside our editor, LOLCanvas grants you a worldwide, royalty-free, non-exclusive license to share, distribute, or print your creative output without forced watermarks or attribution requirements.
          </p>
        </div>

        {/* Section 4 */}
        <div className="space-y-3 border-l-2 border-black pl-5">
          <h2 className="font-display font-extrabold text-xl text-black uppercase tracking-tight">
            4. Limitation of Liability
          </h2>
          <p className="leading-relaxed">
            The software, tools, and services are provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without warranties of any kind. LOLCanvas and its maintainers shall not be liable for any indirect, incidental, or consequential damages resulting from user uploads or use of the editor.
          </p>
        </div>
      </div>
    </div>
  );
}
