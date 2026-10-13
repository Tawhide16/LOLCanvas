"use client";

import React, { useState } from "react";
import { Mail, Send, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "submission",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <div className="flex flex-col w-full bg-[#FAF9F5]">
      {/* Header */}
      <div className="p-6 sm:p-8 border-b border-black bg-[#FAF9F5] flex items-center justify-between">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-[10px] font-mono-code uppercase font-semibold text-[#777777]">
            <Mail className="w-3 h-3 text-black" />
            COMMUNICATION DESK
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-4xl uppercase tracking-tight text-black">
            CONTACT DESK.
          </h1>
        </div>

        <span className="font-mono-code text-xs text-[#555555] hidden sm:inline">
          DESK@LOLCANVAS.STUDIO
        </span>
      </div>

      <div className="p-6 sm:p-10 max-w-xl mx-auto w-full">
        {submitted ? (
          <div className="p-8 text-center space-y-3 bg-white border border-black">
            <CheckCircle2 className="w-8 h-8 text-[#10B981] mx-auto" />
            <h2 className="font-display font-extrabold text-xl uppercase tracking-tight text-black">
              DISPATCH TRANSMITTED
            </h2>
            <p className="font-body text-xs text-[#555555]">
              We will respond to {formData.email} within 24 hours.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                setFormData({ name: "", email: "", department: "submission", message: "" });
              }}
              className="mt-2 px-5 py-2 bg-black text-white font-mono-code text-xs uppercase font-bold"
            >
              SEND ANOTHER
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 sm:p-8 border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono-code text-xs">
              <div className="space-y-1">
                <label className="text-[10px] text-[#777777] uppercase font-bold">
                  NAME
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 bg-[#FAF9F5] border border-black text-xs font-bold uppercase focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-[#777777] uppercase font-bold">
                  EMAIL
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2.5 bg-[#FAF9F5] border border-black text-xs font-bold uppercase focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1 font-mono-code text-xs">
              <label className="text-[10px] text-[#777777] uppercase font-bold">
                DEPARTMENT
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full p-2 bg-[#FAF9F5] border border-black uppercase text-black font-bold focus:outline-none cursor-pointer"
              >
                <option value="submission">TEMPLATE SUBMISSION</option>
                <option value="dmca">TAKEDOWN / DMCA</option>
                <option value="bug">BUG REPORT</option>
                <option value="inquiry">STUDIO INQUIRY</option>
              </select>
            </div>

            <div className="space-y-1 font-mono-code text-xs">
              <label className="text-[10px] text-[#777777] uppercase font-bold">
                MESSAGE
              </label>
              <textarea
                required
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full p-2.5 bg-[#FAF9F5] border border-black text-xs font-bold uppercase focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-black text-white hover:bg-[#333333] font-mono-code text-xs uppercase font-bold tracking-wider transition-all hover:translate-y-[-1px] active:translate-y-[1px] flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              {isSubmitting ? "TRANSMITTING..." : "SEND MESSAGE ■"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
