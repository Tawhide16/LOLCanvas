import { Metadata } from "next";
import Link from "next/link";
import { AlertCircle, Mail, FileCheck, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "DMCA Copyright & Takedown Policy — LOLCanvas®",
  description:
    "LOLCanvas DMCA Notice and Takedown Policy. Notice submission process, designated copyright agent information, and counter-notification steps.",
};

export default function DmcaPage() {
  return (
    <div className="flex flex-col w-full bg-[#FAF9F5] min-h-screen">
      {/* Header Banner */}
      <div className="p-6 sm:p-10 md:p-14 border-b border-black bg-[#FAF9F5]">
        <div className="max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#E6E4DC] border border-black text-[11px] font-mono-code uppercase tracking-wider text-black font-semibold">
            <AlertCircle className="w-3.5 h-3.5 text-[#E11D48]" />
            LEGAL ARCHIVE // DOC 03
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-5xl md:text-6xl tracking-tight uppercase text-black leading-none">
            DMCA & TAKEDOWN POLICY.
          </h1>
          <p className="font-body text-base sm:text-lg text-[#555555] leading-relaxed max-w-2xl">
            LOLCanvas respects the intellectual property rights of creators and copyright owners. We respond swiftly to notices of alleged copyright infringement under the Digital Millennium Copyright Act (17 U.S.C. § 512).
          </p>
        </div>
      </div>

      {/* Structured Sections */}
      <div className="max-w-5xl mx-auto w-full p-6 sm:p-10 md:p-14 space-y-10 font-body text-sm text-[#333333]">
        {/* Designated Agent Card */}
        <div className="border border-black bg-white p-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] space-y-3 font-mono-code">
          <div className="text-[10px] text-[#777777] uppercase tracking-wider">
            DESIGNATED COPYRIGHT AGENT
          </div>
          <div className="text-base font-bold text-black font-display uppercase">
            LOLCanvas Legal & Compliance Team
          </div>
          <div className="text-xs text-[#555555] space-y-1 font-body">
            <div>Email: <a href="mailto:legal@lolcanvas.studio" className="font-mono-code text-[#E11D48] font-bold underline">legal@lolcanvas.studio</a> (Subject: &quot;DMCA Takedown Request&quot;)</div>
            <div>Secondary Desk: <a href="mailto:desk@lolcanvas.studio" className="font-mono-code text-black font-semibold underline">desk@lolcanvas.studio</a></div>
            <div>Direct Online Filing: <Link href="/contact" className="font-bold underline text-black hover:text-[#E11D48]">Contact & Report Desk</Link></div>
          </div>
        </div>

        {/* Requirements for a Takedown Notice */}
        <div className="space-y-4 border-l-2 border-black pl-5">
          <h2 className="font-display font-extrabold text-xl text-black uppercase tracking-tight">
            How to File a Copyright Takedown Notice
          </h2>
          <p className="leading-relaxed">
            If you believe that your copyrighted work has been copied in a manner that constitutes copyright infringement and is accessible via LOLCanvas, please send a written notification containing the following details:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-[#444444] pl-2">
            <li>A physical or electronic signature of a person authorized to act on behalf of the owner of the copyright.</li>
            <li>Identification of the copyrighted work claimed to have been infringed (e.g., URL of original work or description).</li>
            <li>Identification of the material on LOLCanvas claimed to be infringing, including the specific URL or template ID (<code className="bg-[#E6E4DC] px-1 py-0.5 font-mono-code text-xs">/cards/[id]</code>).</li>
            <li>Your contact information (name, mailing address, telephone number, and valid email address).</li>
            <li>A statement that you have a good faith belief that use of the material is not authorized by the copyright owner, its agent, or the law.</li>
            <li>A statement made under penalty of perjury that the information in your notification is accurate and that you are authorized to act on behalf of the copyright owner.</li>
          </ol>
        </div>

        {/* Counter-Notification Process */}
        <div className="space-y-4 border-l-2 border-black pl-5">
          <h2 className="font-display font-extrabold text-xl text-black uppercase tracking-tight">
            Counter-Notification Procedure
          </h2>
          <p className="leading-relaxed">
            If material you posted was removed pursuant to a DMCA notice and you believe this was due to mistake, misidentification, or Fair Use (such as transformative parody or satire), you may submit a written counter-notification to our Designated Agent.
          </p>
        </div>

        {/* Repeat Infringer Policy */}
        <div className="space-y-4 border-l-2 border-black pl-5">
          <h2 className="font-display font-extrabold text-xl text-black uppercase tracking-tight">
            Repeat Infringer Termination Policy
          </h2>
          <p className="leading-relaxed">
            LOLCanvas maintains a strict policy to terminate the accounts and ban upload privileges of users who repeatedly post infringing content without valid copyright authorization.
          </p>
        </div>
      </div>
    </div>
  );
}
