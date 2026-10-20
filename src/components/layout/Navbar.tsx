"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, Menu, X, Plus, User, Palette, Crown, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import SuperAdminThemeModal from "@/components/common/SuperAdminThemeModal";
import SuperAdminFloatingBar from "@/components/common/SuperAdminFloatingBar";
import MagicSearchDropdown from "./MagicSearchDropdown";
import { useAdminEditMode } from "@/lib/useAdminEditMode";
import { useSiteLogo } from "@/lib/useSiteLogo";
import { useSiteContent } from "@/lib/useSiteContent";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const [mounted, setMounted] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const { isEditMode } = useAdminEditMode();
  const logoConfig = useSiteLogo();
  const { content } = useSiteContent();
  const [showThemeModal, setShowThemeModal] = useState(false);

  useEffect(() => {
    setMounted(true);

    const evaluateAdmin = (email: string | null, role?: string | null) => {
      if (!email) return false;
      if (email.toLowerCase() === "admin123@gmail.com") return true;
      if (role === "SUPER_ADMIN" || role === "ADMIN") return true;
      return false;
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) {
        setUserEmail(session.user.email);
        const role = (session.user.app_metadata?.role || session.user.user_metadata?.role) as string;
        setIsAdmin(evaluateAdmin(session.user.email, role));
      } else if (typeof window !== "undefined") {
        try {
          const local = localStorage.getItem("lolcanvas_user");
          if (local) {
            const parsed = JSON.parse(local);
            setUserEmail(parsed.email || null);
            setIsAdmin(evaluateAdmin(parsed.email, parsed.role));
          }
        } catch (e) {}
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.email) {
        setUserEmail(session.user.email);
        const role = (session.user.app_metadata?.role || session.user.user_metadata?.role) as string;
        setIsAdmin(evaluateAdmin(session.user.email, role));
      } else if (typeof window !== "undefined") {
        const local = localStorage.getItem("lolcanvas_user");
        if (!local) {
          setUserEmail(null);
          setIsAdmin(false);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSearchDropdown(false);
    if (searchQuery.trim()) {
      router.push(`/cards?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/cards");
    }
  };

  const navLinks = [
    { label: content.navItem1Text || "TEMPLATES", href: "/cards" },
    { label: content.navItem2Text || "CATEGORIES", href: "/collection" },
    { label: content.navItem3Text || "CANVAS EDITOR", href: "/edit", isEditor: true },
    { label: content.navItem4Text || "ABOUT", href: "/about" },
    { label: content.navItem5Text || "CONTACT", href: "/contact" },
  ];

  return (
    <nav className="relative z-50 w-full bg-[#FAF9F5] border-b border-black">
      {/* Connected Desktop Navigation Strip */}
      <div className="flex items-stretch divide-x divide-black h-14 md:h-16 select-none">
        {/* Brand */}
        <div className="flex items-center px-4 md:px-6 bg-[#FAF9F5] hover:bg-[#F6F5EE] transition-colors group shrink-0">
          <Link
            href="/"
            className="flex items-center gap-2.5"
          >
            <img
              src={logoConfig.logoUrl}
              alt="LOLCanvas Icon"
              className="w-7 h-7 object-contain transition-transform group-hover:scale-110 duration-200"
            />
            <span className="font-display font-extrabold text-lg md:text-xl tracking-tight text-black uppercase">
              {logoConfig.logoText}
              {logoConfig.logoTag && (
                <span className="text-[11px] align-super font-mono-code font-normal ml-0.5">
                  {logoConfig.logoTag}
                </span>
              )}
            </span>
          </Link>

          {/* Super Admin Quick EDIT THEME Button */}
          {isAdmin && (
            <button
              type="button"
              onClick={() => setShowThemeModal(true)}
              title="SUPER ADMIN: Edit Website Theme, Logo & Inline Mode"
              className={`ml-3 px-2 py-1 border text-[10px] font-mono-code font-bold uppercase flex items-center gap-1.5 transition-all shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] ${
                isEditMode
                  ? "bg-[#DCFCE7] border-[#16A34A] text-[#15803D] hover:bg-[#16A34A] hover:text-white"
                  : "bg-[#FFE4E6] border-[#E11D48] text-[#E11D48] hover:bg-[#E11D48] hover:text-white"
              }`}
            >
              <Palette className="w-3 h-3 text-[#E11D48]" />
              <span>EDIT THEME</span>
              {isEditMode && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse" />
              )}
            </button>
          )}
        </div>

        {/* Live Search with Magic Filter */}
        <div className="relative flex-1 min-w-[150px] md:min-w-[220px] flex items-center bg-[#FAF9F5] px-3 md:px-4 focus-within:bg-white transition-colors">
          <Search className="w-4 h-4 text-[#777777] shrink-0 mr-2.5" />
          <form
            onSubmit={handleSearchSubmit}
            className="flex-1 min-w-0"
          >
            <input
              type="text"
              value={searchQuery}
              onFocus={() => setShowSearchDropdown(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (!showSearchDropdown) setShowSearchDropdown(true);
              }}
              placeholder={content.navSearchPlaceholder || "SEARCH TEMPLATES (MAGIC FILTER)..."}
              aria-label="Search meme templates"
              className="w-full bg-transparent font-mono-code text-[12px] md:text-[13px] text-black placeholder:text-[#999999] focus:outline-none uppercase tracking-wider truncate"
            />
          </form>

          {/* Quick Clear Action */}
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setShowSearchDropdown(true);
              }}
              className="px-1.5 py-0.5 text-[#777777] hover:text-black font-mono-code text-[11px] shrink-0 transition-colors uppercase font-bold"
              title="Clear search"
            >
              ✕
            </button>
          )}

          {/* Magic Search & Suggestions Dropdown */}
          <MagicSearchDropdown
            isOpen={showSearchDropdown}
            onClose={() => setShowSearchDropdown(false)}
            searchQuery={searchQuery}
            onSelectQuery={(q) => {
              setSearchQuery(q);
              setShowSearchDropdown(false);
            }}
          />
        </div>

        {/* Desktop Links with Framer Motion Active Tab indicator and Dynamic Text Size */}
        <div className={`hidden xl:flex items-stretch divide-x divide-black shrink-0 font-mono-code tracking-wider font-medium ${
          content.navbarTextSize === 'xs' ? 'text-[10px]' :
          content.navbarTextSize === 'base' ? 'text-[14px]' : 'text-[12px]'
        }`}>
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
          <span className="hidden sm:inline">{content.navUploadButtonText || "UPLOAD"}</span>
        </Link>

        {/* Super Admin Portal Cell (ONLY VISIBLE WHEN SUPER ADMIN / ADMIN IS LOGGED IN) */}
        {mounted && isAdmin && (
          <Link
            href="/admin"
            className="flex items-center px-3.5 md:px-4 bg-[#FFE4E6] text-[#E11D48] hover:bg-[#E11D48] hover:text-white transition-colors shrink-0 font-mono-code text-[11px] md:text-[12px] font-bold tracking-wider group border-l border-black"
            title="Super Admin Control Center"
          >
            <Crown className="w-3.5 h-3.5 mr-1 text-[#E11D48] group-hover:text-white transition-colors" />
            <span className="hidden sm:inline">{content.navAdminButtonText || "SUPER ADMIN"}</span>
            <span className="sm:hidden">ADMIN</span>
          </Link>
        )}

        {/* User Status Cell (Links to /profile when logged in, or /login when logged out) */}
        <Link
          href={mounted && userEmail ? "/profile" : "/login"}
          suppressHydrationWarning
          className="flex items-center px-4 md:px-5 bg-[#FAF9F5] hover:bg-[#F6F5EE] transition-colors shrink-0 font-mono-code text-[12px] tracking-wider text-black group"
          title={mounted && userEmail ? "View Creator Profile" : "Sign In"}
        >
          {mounted && userEmail ? (
            <span suppressHydrationWarning className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#10B981] shrink-0 animate-pulse"></span>
              <span className="font-bold uppercase truncate max-w-[120px]">
                {userEmail.split("@")[0]}
              </span>
            </span>
          ) : (
            <span className="flex items-center gap-1 font-bold text-black group-hover:text-[#E11D48] transition-colors">
              <User className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{content.headerLoginButtonText || "SIGN IN"}</span>
            </span>
          )}
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
          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-5 py-3 bg-[#FFE4E6] text-[#E11D48] font-bold"
            >
              <span className="flex items-center gap-2">
                <Crown className="w-4 h-4" />
                <span>SUPER ADMIN PORTAL</span>
              </span>
              <span className="text-[11px]">→</span>
            </Link>
          )}
        </motion.div>
      )}

      {/* Super Admin Theme & Website Customizer Modal */}
      <SuperAdminThemeModal
        isOpen={showThemeModal}
        onClose={() => setShowThemeModal(false)}
        currentLogoUrl={logoConfig.logoUrl}
        currentLogoText={logoConfig.logoText}
        currentLogoTag={logoConfig.logoTag}
        adminEmail={userEmail}
      />

      {/* Super Admin Floating Quick Action Bar */}
      <SuperAdminFloatingBar onOpenThemeModal={() => setShowThemeModal(true)} />
    </nav>
  );
}
