"use client";

import React, { useState } from "react";
import { Mail, Send, CheckCircle2, Bug, ArrowRight } from "lucide-react";
import { useSiteContent } from "@/lib/useSiteContent";
import SuperAdminInlineEdit from "@/components/common/SuperAdminInlineEdit";

export default function ContactPage() {
  const { content } = useSiteContent();
  const [activeTab, setActiveTab] = useState<"contact" | "bug">("contact");

  // General Contact State
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "General Inquiry",
    message: "",
  });

  // Bug Report State
  const [bugForm, setBugForm] = useState({
    name: "",
    email: "",
    location: "Canvas Editor (/edit)",
    severity: "Medium",
    description: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<"contact" | "bug" | null>(null);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted("contact");
    }, 600);
  };

  const handleBugSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted("bug");
    }, 600);
  };

  return (
    <div className="flex flex-col w-full bg-[#FAF9F5] min-h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="p-6 sm:p-8 border-b border-black bg-[#FAF9F5] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-[10px] font-mono-code uppercase font-semibold text-[#777777]">
            <Mail className="w-3 h-3 text-black" />
            COMMUNICATION DESK
          </div>
          <SuperAdminInlineEdit
            field="contactTitle"
            label="Contact Page Title"
            value={content.contactTitle}
            asBlock
          >
            <h1 className="font-display font-extrabold text-2xl sm:text-4xl uppercase tracking-tight text-black">
              {content.contactTitle}
            </h1>
          </SuperAdminInlineEdit>

          <SuperAdminInlineEdit
            field="contactSubtitle"
            label="Contact Page Subtitle"
            value={content.contactSubtitle}
            multiline
            asBlock
          >
            <p className="font-body text-xs text-[#666666]">
              {content.contactSubtitle}
            </p>
          </SuperAdminInlineEdit>
        </div>

        {/* Professional Two-Tab Switcher */}
        <div className="flex items-center border border-black bg-white divide-x divide-black font-mono-code text-xs font-bold uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <button
            type="button"
            onClick={() => {
              setActiveTab("contact");
              setSubmitted(null);
            }}
            className={`px-4 py-2 flex items-center gap-1.5 transition-colors ${
              activeTab === "contact"
                ? "bg-black text-white"
                : "bg-white text-black hover:bg-[#FAF9F5]"
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>CONTACT US</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("bug");
              setSubmitted(null);
            }}
            className={`px-4 py-2 flex items-center gap-1.5 transition-colors ${
              activeTab === "bug"
                ? "bg-[#E11D48] text-white"
                : "bg-white text-black hover:bg-[#FFF1F2] hover:text-[#E11D48]"
            }`}
          >
            <Bug className="w-3.5 h-3.5" />
            <span>REPORT A BUG</span>
          </button>
        </div>
      </div>

      <div className="p-6 sm:p-12 max-w-xl mx-auto w-full">
        {submitted ? (
          <div className="p-8 sm:p-10 text-center space-y-4 bg-white border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <CheckCircle2
              className={`w-10 h-10 mx-auto ${
                submitted === "bug" ? "text-[#E11D48]" : "text-[#10B981]"
              }`}
            />
            <div className="space-y-1">
              <h2 className="font-display font-extrabold text-xl sm:text-2xl uppercase tracking-tight text-black">
                {submitted === "bug" ? "BUG REPORT TRANSMITTED" : "MESSAGE SENT"}
              </h2>
              <p className="font-body text-xs text-[#555555]">
                {submitted === "bug"
                  ? "Our engineering team has received your bug report and will review it promptly."
                  : "Thank you for reaching out. We will get back to your email within 24 hours."}
              </p>
            </div>
            <button
              onClick={() => setSubmitted(null)}
              className="px-5 py-2.5 bg-black text-white font-mono-code text-xs uppercase font-bold hover:bg-[#333333] transition-colors"
            >
              SEND ANOTHER
            </button>
          </div>
        ) : activeTab === "contact" ? (
          /* TAB 1: SIMPLE CLEAN CONTACT FORM */
          <form
            onSubmit={handleContactSubmit}
            className="space-y-4 bg-white p-6 sm:p-8 border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono-code text-xs">
              <div className="space-y-1">
                <label className="text-[10px] text-[#777777] uppercase font-bold">
                  NAME *
                </label>
                <input
                  type="text"
                  required
                  value={contactForm.name}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, name: e.target.value })
                  }
                  placeholder="YOUR NAME"
                  className="w-full p-2.5 bg-[#FAF9F5] border border-black text-xs font-bold uppercase text-black focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-[#777777] uppercase font-bold">
                  EMAIL *
                </label>
                <input
                  type="email"
                  required
                  value={contactForm.email}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, email: e.target.value })
                  }
                  placeholder="NAME@EXAMPLE.COM"
                  className="w-full p-2.5 bg-[#FAF9F5] border border-black text-xs font-bold uppercase text-black focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1 font-mono-code text-xs">
              <label className="text-[10px] text-[#777777] uppercase font-bold">
                SUBJECT
              </label>
              <select
                value={contactForm.subject}
                onChange={(e) =>
                  setContactForm({ ...contactForm, subject: e.target.value })
                }
                className="w-full p-2 bg-[#FAF9F5] border border-black uppercase text-black font-bold focus:outline-none cursor-pointer"
              >
                <option value="General Inquiry">GENERAL INQUIRY</option>
                <option value="Template Submission">TEMPLATE SUBMISSION</option>
                <option value="Studio Partnership">STUDIO PARTNERSHIP</option>
                <option value="DMCA / Copyright">DMCA / COPYRIGHT NOTICE</option>
              </select>
            </div>

            <div className="space-y-1 font-mono-code text-xs">
              <label className="text-[10px] text-[#777777] uppercase font-bold">
                MESSAGE *
              </label>
              <textarea
                required
                rows={4}
                value={contactForm.message}
                onChange={(e) =>
                  setContactForm({ ...contactForm, message: e.target.value })
                }
                placeholder="HOW CAN WE HELP YOU?"
                className="w-full p-2.5 bg-[#FAF9F5] border border-black text-xs font-bold uppercase text-black focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-black text-white hover:bg-[#222222] font-mono-code text-xs uppercase font-bold tracking-wider transition-all hover:translate-y-[-1px] active:translate-y-[1px] flex items-center justify-center gap-2 border border-black"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "SENDING..." : "SEND MESSAGE ■"}</span>
            </button>
          </form>
        ) : (
          /* TAB 2: CLEAN BUG REPORT FORM */
          <form
            onSubmit={handleBugSubmit}
            className="space-y-4 bg-white p-6 sm:p-8 border-2 border-[#E11D48] shadow-[4px_4px_0px_0px_rgba(225,29,72,0.3)]"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono-code text-xs">
              <div className="space-y-1">
                <label className="text-[10px] text-[#777777] uppercase font-bold">
                  NAME *
                </label>
                <input
                  type="text"
                  required
                  value={bugForm.name}
                  onChange={(e) =>
                    setBugForm({ ...bugForm, name: e.target.value })
                  }
                  placeholder="YOUR NAME"
                  className="w-full p-2.5 bg-[#FAF9F5] border border-black text-xs font-bold uppercase text-black focus:outline-none focus:border-[#E11D48]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-[#777777] uppercase font-bold">
                  EMAIL *
                </label>
                <input
                  type="email"
                  required
                  value={bugForm.email}
                  onChange={(e) =>
                    setBugForm({ ...bugForm, email: e.target.value })
                  }
                  placeholder="NAME@EXAMPLE.COM"
                  className="w-full p-2.5 bg-[#FAF9F5] border border-black text-xs font-bold uppercase text-black focus:outline-none focus:border-[#E11D48]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono-code text-xs">
              <div className="space-y-1">
                <label className="text-[10px] text-[#777777] uppercase font-bold">
                  WHERE IS THE BUG?
                </label>
                <select
                  value={bugForm.location}
                  onChange={(e) =>
                    setBugForm({ ...bugForm, location: e.target.value })
                  }
                  className="w-full p-2 bg-[#FAF9F5] border border-black uppercase text-black font-bold focus:outline-none cursor-pointer"
                >
                  <option value="Canvas Editor (/edit)">CANVAS EDITOR (/edit)</option>
                  <option value="Image Upload (/upload)">IMAGE UPLOAD (/upload)</option>
                  <option value="Archive Catalog (/cards)">ARCHIVE CATALOG (/cards)</option>
                  <option value="Download / Export PNG">DOWNLOAD / EXPORT PNG</option>
                  <option value="Categories Index (/collection)">CATEGORIES (/collection)</option>
                  <option value="Other / Layout">OTHER / LAYOUT</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-[#777777] uppercase font-bold">
                  SEVERITY
                </label>
                <select
                  value={bugForm.severity}
                  onChange={(e) =>
                    setBugForm({ ...bugForm, severity: e.target.value })
                  }
                  className="w-full p-2 bg-[#FAF9F5] border border-black uppercase text-black font-bold focus:outline-none cursor-pointer"
                >
                  <option value="Low">LOW (VISUAL GLITCH)</option>
                  <option value="Medium">MEDIUM (FEATURE BROKEN)</option>
                  <option value="Critical">CRITICAL (CANNOT WORK)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1 font-mono-code text-xs">
              <label className="text-[10px] text-[#777777] uppercase font-bold">
                WHAT HAPPENED? *
              </label>
              <textarea
                required
                rows={4}
                value={bugForm.description}
                onChange={(e) =>
                  setBugForm({ ...bugForm, description: e.target.value })
                }
                placeholder="DESCRIBE WHAT WENT WRONG OR HOW TO REPRODUCE..."
                className="w-full p-2.5 bg-[#FAF9F5] border border-black text-xs font-bold uppercase text-black focus:outline-none focus:border-[#E11D48]"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-[#E11D48] text-white hover:bg-[#BE123C] font-mono-code text-xs uppercase font-bold tracking-wider transition-all hover:translate-y-[-1px] active:translate-y-[1px] flex items-center justify-center gap-2 border border-black"
            >
              <Bug className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "TRANSMITTING..." : "SUBMIT BUG REPORT ■"}</span>
            </button>
          </form>
        )}

        {/* Clean footer contact link */}
        <div className="text-center pt-4 font-mono-code text-[11px] text-[#777777]">
          DIRECT DISPATCH:{" "}
          <SuperAdminInlineEdit
            field={activeTab === "bug" ? "bugsEmail" : "contactEmail"}
            label={activeTab === "bug" ? "Bug Report Email" : "General Contact Email"}
            value={activeTab === "bug" ? content.bugsEmail : content.contactEmail}
          >
            <span className="text-black font-bold">
              {activeTab === "bug" ? content.bugsEmail : content.contactEmail}
            </span>
          </SuperAdminInlineEdit>
        </div>
      </div>
    </div>
  );
}
