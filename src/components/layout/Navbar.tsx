"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, Menu, X, Plus, User, Palette } from "lucide-react";
import { motion } from "framer-motion";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/cards?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/cards");
    }
  };

  const navLinks = [
    { label: "TEMPLATES", href: "/cards" },
    { label: "CATEGORIES", href: "/collection" },
    { label: "CANVAS EDITOR", href: "/edit/drake-hotline", isEditor: true },
    { label: "ABOUT", href: "/about" },
    { label: "CONTACT", href: "/contact" },
  ];

  return (
    <nav className="w-full bg-[#FAF9F5] border-b border-black">
      {/* Connected Desktop Navigation Strip */}
      <div className="flex items-stretch divide-x divide-black h-14 md:h-16 overflow-x-auto select-none">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center px-4 md:px-6 bg-[#FAF9F5] hover:bg-[#F6F5EE] transition-colors group shrink-0"
        >
          <div className="flex items-center gap-2.5">
            <img
              src="/logo-icon.png"
              alt="LOLCanvas Icon"
              className="w-7 h-7 object-contain transition-transform group-hover:scale-110 duration-200"
            />
            <span className="font-display font-extrabold text-lg md:text-xl tracking-tight text-black">
              LOLCANVAS<span className="text-[11px] align-super font-mono-code font-normal">®</span>
            </span>
          </div>
        </Link>

        {/* Live Search */}
        <form
          onSubmit={handleSearchSubmit}
          className="flex-1 min-w-[180px] flex items-center bg-[#FAF9F5] px-3 md:px-4 relative focus-within:bg-white transition-colors"
        >
          <Search className="w-4 h-4 text-[#777777] shrink-0 mr-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="SEARCH TEMPLATES..."
            aria-label="Search meme templates"
            className="w-full bg-transparent font-mono-code text-[12px] md:text-[13px] text-black placeholder:text-[#999999] focus:outline-none uppercase tracking-wider"
          />
        </form>

        {/* Desktop Links with Framer Motion Active Tab indicator */}
        <div className="hidden xl:flex items-stretch divide-x divide-black shrink-0 font-mono-code text-[12px] tracking-wider font-medium">
          {navLinks.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href.includes("/edit") && pathname.startsWith("/edit"));
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`relative flex items-center px-4 transition-colors ${
                  isActive
                    ? "bg-black text-white font-bold"
                    : "bg-[#FAF9F5] hover:bg-[#F6F5EE] text-black"
                }`}
              >
                {item.isEditor && <Palette className="w-3.5 h-3.5 mr-1.5" />}
                <span>{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="navbar-active-indicator"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-[#E11D48]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Upload Cell */}
        <Link
          href="/upload"
          className="flex items-center px-4 md:px-5 bg-[#FAF9F5] hover:bg-black hover:text-white transition-colors shrink-0 font-mono-code text-[12px] font-bold tracking-wider group"
        >
          <Plus className="w-4 h-4 mr-1 text-[#E11D48] group-hover:text-white transition-colors" />
          <span className="hidden sm:inline">+ UPLOAD</span>
          <span className="sm:hidden">+</span>
        </Link>

        {/* Login Cell */}
        <Link
          href="/login"
          className="flex items-center px-4 md:px-5 bg-[#FAF9F5] hover:bg-[#F6F5EE] transition-colors shrink-0 font-mono-code text-[12px] tracking-wider text-black"
        >
          <User className="w-3.5 h-3.5 mr-1.5 text-[#555555]" />
          <span className="hidden sm:inline">LOGIN</span>
        </Link>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="xl:hidden flex items-center justify-center px-4 bg-[#FAF9F5] hover:bg-[#F6F5EE] text-black shrink-0 focus:outline-none"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="xl:hidden border-t border-black bg-[#FAF9F5] divide-y divide-black font-mono-code text-[13px] tracking-wider overflow-hidden"
        >
          {navLinks.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-5 py-3 hover:bg-[#F6F5EE] text-black"
            >
              <span>{item.label}</span>
              <span className="text-[11px] text-[#888888]">→</span>
            </Link>
          ))}
        </motion.div>
      )}
    </nav>
  );
}
