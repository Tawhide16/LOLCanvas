import { Metadata } from "next";
import Link from "next/link";
import { Shield, ArrowUpRight, Lock, EyeOff, Server, FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy — LOLCanvas® Archive & Studio",
  description:
    "LOLCanvas Privacy Policy: Learn how our zero-tracking, in-browser canvas editor protects your privacy with local image processing and no forced sign-ups.",
};

export default function PrivacyPage() {
  return (
    <div className="flex flex-col w-full bg-[#FAF9F5] min-h-screen">
      {/* Header Banner */}
      <div className="p-6 sm:p-10 md:p-14 border-b border-black bg-[#FAF9F5]">
        <div className="max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#E6E4DC] border border-black text-[11px] font-mono-code uppercase tracking-wider text-black font-semibold">
            <Shield className="w-3.5 h-3.5 text-[#E11D48]" />
            LEGAL ARCHIVE // DOC 01
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-5xl md:text-6xl tracking-tight uppercase text-black leading-none">
            PRIVACY POLICY.
          </h1>
          <p className="font-body text-base sm:text-lg text-[#555555] leading-relaxed max-w-2xl">
            Effective Date: October 2024. Updated for 2026. We believe meme generation should be private, instantaneous, and free from intrusive tracking or forced account barriers.
          </p>
        </div>
      </div>

      {/* Structured Sections */}
      <div className="max-w-5xl mx-auto w-full p-6 sm:p-10 md:p-14 space-y-12 font-body text-sm text-[#333333]">
        {/* Core Principles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border border-black bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] divide-y md:divide-y-0 md:divide-x divide-black font-mono-code">
          <div className="p-5 space-y-2">
            <Lock className="w-5 h-5 text-black" />
            <h3 className="font-bold text-xs uppercase text-black">Local Client Processing</h3>
            <p className="text-[12px] text-[#666666] leading-normal font-body">
              Your edits, text layers, and images stay in your browser&apos;s memory and HTML5 Canvas. We do not store unpublished memes.
            </p>
          </div>
          <div className="p-5 space-y-2">
            <EyeOff className="w-5 h-5 text-[#E11D48]" />
            <h3 className="font-bold text-xs uppercase text-black">Zero Third-Party Ad Trackers</h3>
            <p className="text-[12px] text-[#666666] leading-normal font-body">
              We do not sell personal data, use cross-site behavioral ad pixels, or profile your meme habits.
            </p>
          </div>
          <div className="p-5 space-y-2">
            <Server className="w-5 h-5 text-black" />
            <h3 className="font-bold text-xs uppercase text-black">No Forced Sign-Up</h3>
            <p className="text-[12px] text-[#666666] leading-normal font-body">
              You can create, edit, customize, and export high-res PNG memes anonymously without creating an account.
            </p>
          </div>
        </div>

        {/* Section 1 */}
        <div className="space-y-3 border-l-2 border-black pl-5">
          <h2 className="font-display font-extrabold text-xl text-black uppercase tracking-tight">
            1. Information We Do (and Do Not) Collect
          </h2>
          <p className="leading-relaxed">
            When you use LOLCanvas without an account, we do not require your name, email, or identity. We only collect standard, anonymous server logs (such as request timestamps and HTTP status codes) required to maintain uptime, prevent DDoS attacks, and deliver fast assets via global CDN.
          </p>
          <p className="leading-relaxed">
            If you optionally choose to sign up or log in as a creator or admin, we store your authenticated email and role strictly to manage your public submissions and moderation access.
          </p>
        </div>

        {/* Section 2 */}
        <div className="space-y-3 border-l-2 border-black pl-5">
          <h2 className="font-display font-extrabold text-xl text-black uppercase tracking-tight">
            2. Local Storage and Client Preferences
          </h2>
          <p className="leading-relaxed">
            LOLCanvas uses browser <code className="bg-[#E6E4DC] px-1.5 py-0.5 font-mono-code text-xs">localStorage</code> solely to save your local UI preferences (such as custom category filters, editor layout states, and draft recovery). This data is stored entirely on your local device and is never transmitted to advertisers.
          </p>
        </div>

        {/* Section 3 */}
        <div className="space-y-3 border-l-2 border-black pl-5">
          <h2 className="font-display font-extrabold text-xl text-black uppercase tracking-tight">
            3. Image Uploads and Community Submissions
          </h2>
          <p className="leading-relaxed">
            When you explicitly choose to upload a template to the Public Commons archive via <Link href="/upload" className="font-bold underline hover:text-[#E11D48]">/upload</Link>, the image is downscaled to optimized web resolutions and reviewed by moderators to ensure safety, copyright compliance, and watermark-free quality.
          </p>
        </div>

        {/* Section 4 */}
        <div className="space-y-3 border-l-2 border-black pl-5">
          <h2 className="font-display font-extrabold text-xl text-black uppercase tracking-tight">
            4. Contact and Inquiries
          </h2>
          <p className="leading-relaxed">
            For privacy inquiries, data deletion requests, or questions regarding our infrastructure, contact our privacy desk at{" "}
            <a href="mailto:privacy@lolcanvas.studio" className="font-mono-code font-bold underline hover:text-[#E11D48]">
              privacy@lolcanvas.studio
            </a>{" "}
            or visit our <Link href="/contact" className="underline font-bold hover:text-[#E11D48]">Contact Desk</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
