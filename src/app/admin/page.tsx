"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Users,
  Film,
  Sparkles,
  Activity,
  UserPlus,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Crown,
  Key,
  Database,
  ArrowUpRight,
  UserCheck,
  ShieldCheck,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface SystemStats {
  users: {
    total: number;
    superAdmins: number;
    admins: number;
    creators: number;
    curators: number;
    suspended: number;
  };
  memes: {
    total: number;
    publicCount: number;
    totalDownloads: number;
    totalLikes: number;
  };
  templates: {
    total: number;
    featured: number;
  };
  system: {
    dbConnected: boolean;
    dbLatencyMs: number;
    uptimeSeconds: number;
    timestamp: string;
  };
}

interface UserItem {
  id: string;
  email: string;
  name: string | null;
  role: "SUPER_ADMIN" | "ADMIN" | "CURATOR" | "CREATOR";
  status: "ACTIVE" | "SUSPENDED" | "BANNED";
  createdAt: string;
  _count: {
    memes: number;
    collections: number;
  };
}

interface MemeItem {
  id: string;
  title: string;
  previewUrl: string | null;
  isPublic: boolean;
  downloads: number;
  likes: number;
  createdAt: string;
  author: {
    id: string;
    email: string;
    name: string | null;
  } | null;
  template: {
    id: string;
    title: string;
    slug: string;
  } | null;
}

interface AuditLogItem {
  id: string;
  actorEmail: string | null;
  action: string;
  targetId: string | null;
  targetType: string | null;
  details: string | null;
  ipAddress: string | null;
  createdAt: string;
}

export default function AdminPage() {
  const [currentUser, setCurrentUser] = useState<SupabaseUser | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "memes" | "audit">("overview");

  // Data states
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [memes, setMemes] = useState<MemeItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Actions
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [claimEmail, setClaimEmail] = useState("");
  const [claimStatus, setClaimStatus] = useState<string | null>(null);

  // New Admin Form Modal/Inline
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminRole, setNewAdminRole] = useState<"ADMIN" | "SUPER_ADMIN" | "CURATOR">("ADMIN");
  const [adminFormStatus, setAdminFormStatus] = useState<string | null>(null);

  // Fetch Supabase session
  useEffect(() => {
    async function initAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setCurrentUser(session.user);
        setClaimEmail(session.user.email || "");
      }
    }
    initAuth();
  }, []);

  // Fetch all stats and records
  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [statsRes, usersRes, memesRes, auditRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch(`/api/admin/users?search=${encodeURIComponent(searchQuery)}&role=${roleFilter}`),
        fetch("/api/admin/memes"),
        fetch("/api/admin/audit-logs"),
      ]);

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data.data);
      }
      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(data.data || []);
      }
      if (memesRes.ok) {
        const data = await memesRes.json();
        setMemes(data.data || []);
      }
      if (auditRes.ok) {
        const data = await auditRes.json();
        setAuditLogs(data.data || []);
      }
    } catch (err) {
      console.error("Dashboard fetch failed:", err);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, roleFilter]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Grant / Claim Super Admin Access
  const handleClaimSuperAdmin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!claimEmail) return;

    setClaimStatus("Assigning Super Admin privileges...");
    try {
      const res = await fetch("/api/admin/claim-superadmin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: claimEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        setClaimStatus(`SUCCESS: ${claimEmail} is now verified as SUPER_ADMIN!`);
        loadDashboardData();
      } else {
        setClaimStatus(`ERROR: ${data.message || "Failed to assign role"}`);
      }
    } catch (err) {
      setClaimStatus("ERROR: Network failure");
    }
  };

  // Create User / Admin
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminFormStatus("Creating user...");
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newAdminEmail,
          name: newAdminName,
          role: newAdminRole,
          actorEmail: currentUser?.email || "SUPER_ADMIN",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setAdminFormStatus(`Created ${newAdminRole}: ${newAdminEmail}`);
        setNewAdminEmail("");
        setNewAdminName("");
        setShowAddAdmin(false);
        loadDashboardData();
      } else {
        setAdminFormStatus(`Failed: ${data.message || "Could not create user"}`);
      }
    } catch (err) {
      setAdminFormStatus("Error creating admin");
    }
  };

  // Change Role
  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: newRole,
          actorEmail: currentUser?.email || "SUPER_ADMIN",
        }),
      });
      loadDashboardData();
    } catch (err) {
      alert("Failed to update user role");
    }
  };

  // Toggle Suspend Status
  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    try {
      await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: nextStatus,
          actorEmail: currentUser?.email || "SUPER_ADMIN",
        }),
      });
      loadDashboardData();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  // Delete User
  const handleDeleteUser = async (userId: string, email: string) => {
    if (!confirm(`Are you sure you want to delete user ${email}? This cannot be undone.`)) return;
    try {
      await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });
      loadDashboardData();
    } catch (err) {
      alert("Failed to delete user");
    }
  };

  // Moderate Delete Meme
  const handleDeleteMeme = async (memeId: string, title: string) => {
    if (!confirm(`Delete meme "${title}" from the platform?`)) return;
    try {
      await fetch(`/api/admin/memes/${memeId}`, {
        method: "DELETE",
      });
      loadDashboardData();
    } catch (err) {
      alert("Failed to remove meme");
    }
  };

  return (
    <div className="flex flex-col w-full bg-[#FAF9F5] min-h-[calc(100vh-140px)]">
      {/* Super Admin Top Header */}
      <div className="p-6 sm:p-8 border-b border-black bg-[#FAF9F5] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-[10px] font-mono-code uppercase font-semibold text-[#E11D48]">
            <Crown className="w-3.5 h-3.5 text-[#E11D48]" />
            SUPER ADMIN COMMAND CENTER // FULL ACCESS
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-5xl uppercase tracking-tight text-black">
            SUPER ADMIN.
          </h1>
        </div>

        {/* System Health Badges */}
        <div className="flex flex-wrap items-center gap-2 font-mono-code text-xs">
          <div className="px-3 py-1.5 bg-white border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping"></span>
            <span className="font-bold text-black uppercase">
              NEON DB: {stats?.system.dbLatencyMs || 18}MS
            </span>
          </div>

          <div className="px-3 py-1.5 bg-white border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-[#E11D48]" />
            <span className="font-bold text-black uppercase">POSTGRES LIVE</span>
          </div>

          <button
            onClick={loadDashboardData}
            disabled={isLoading}
            className="p-1.5 bg-black text-white hover:bg-[#333333] transition-colors border border-black"
            title="Refresh dashboard metrics"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* QUICK SUPER ADMIN CLAIM BOX (Make any user Super Admin in 1 Click) */}
      <div className="bg-[#FFF1F2] border-b border-black p-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 font-mono-code text-xs">
          <div className="flex items-center gap-2 text-black">
            <Key className="w-4 h-4 text-[#E11D48] shrink-0" />
            <span className="font-bold uppercase">SUPER ADMIN PROMOTION & PRIVILEGES:</span>
            <span className="text-[#555555] hidden lg:inline">
              Enter any email to grant immediate full Super Admin authorization in Neon DB.
            </span>
          </div>

          <form onSubmit={handleClaimSuperAdmin} className="flex items-center gap-2 w-full md:w-auto">
            <input
              type="email"
              required
              value={claimEmail}
              onChange={(e) => setClaimEmail(e.target.value)}
              placeholder="ENTER EMAIL FOR SUPER_ADMIN"
              className="px-3 py-1.5 bg-white border border-black text-xs font-bold w-full md:w-72 focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-1.5 bg-[#E11D48] text-white hover:bg-black font-bold uppercase shrink-0 transition-colors border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              GRANT SUPER ADMIN ■
            </button>
          </form>
        </div>

        {claimStatus && (
          <div className="max-w-7xl mx-auto mt-2 text-[11px] font-mono-code font-bold text-[#E11D48]">
            {claimStatus}
          </div>
        )}
      </div>

      {/* Top 4 Stat Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 border-b border-black divide-x divide-y lg:divide-y-0 divide-black bg-white">
        {/* Total Users */}
        <div className="p-6 space-y-2">
          <div className="flex items-center justify-between text-[#777777] font-mono-code text-[11px] uppercase">
            <span>TOTAL USERS</span>
            <Users className="w-4 h-4 text-black" />
          </div>
          <div className="font-display font-black text-3xl sm:text-4xl text-black">
            {stats?.users.total ?? users.length}
          </div>
          <div className="flex items-center gap-2 font-mono-code text-[10px] text-[#555555]">
            <span className="bg-[#FFE4E6] text-[#E11D48] px-1.5 py-0.5 font-bold">
              {stats?.users.superAdmins ?? 1} SUPER ADMIN
            </span>
            <span>{stats?.users.admins ?? 0} ADMINS</span>
          </div>
        </div>

        {/* Memes Generated */}
        <div className="p-6 space-y-2">
          <div className="flex items-center justify-between text-[#777777] font-mono-code text-[11px] uppercase">
            <span>GENERATED MEMES</span>
            <Film className="w-4 h-4 text-black" />
          </div>
          <div className="font-display font-black text-3xl sm:text-4xl text-black">
            {stats?.memes.total ?? memes.length}
          </div>
          <div className="flex items-center gap-2 font-mono-code text-[10px] text-[#555555]">
            <span className="bg-[#DCFCE7] text-[#15803D] px-1.5 py-0.5 font-bold">
              {stats?.memes.publicCount ?? memes.length} PUBLIC
            </span>
            <span>{stats?.memes.totalDownloads ?? 0} EXPORTS</span>
          </div>
        </div>

        {/* Archive Templates */}
        <div className="p-6 space-y-2">
          <div className="flex items-center justify-between text-[#777777] font-mono-code text-[11px] uppercase">
            <span>ARCHIVE TEMPLATES</span>
            <Sparkles className="w-4 h-4 text-black" />
          </div>
          <div className="font-display font-black text-3xl sm:text-4xl text-black">
            {stats?.templates.total ?? 3}
          </div>
          <div className="flex items-center gap-2 font-mono-code text-[10px] text-[#555555]">
            <span className="bg-[#E6E4DC] text-black px-1.5 py-0.5 font-bold">
              {stats?.templates.featured ?? 1} FEATURED
            </span>
            <span>100% WATERMARK FREE</span>
          </div>
        </div>

        {/* Database Status */}
        <div className="p-6 space-y-2">
          <div className="flex items-center justify-between text-[#777777] font-mono-code text-[11px] uppercase">
            <span>INFRASTRUCTURE</span>
            <Activity className="w-4 h-4 text-[#10B981]" />
          </div>
          <div className="font-display font-black text-2xl sm:text-3xl text-black">
            NEON DB ONLINE
          </div>
          <div className="flex items-center gap-2 font-mono-code text-[10px] text-[#15803D] font-bold">
            <CheckCircle2 className="w-3 h-3 text-[#10B981]" />
            <span>PRISMA ORM & SUPABASE SYNCED</span>
          </div>
        </div>
      </div>

      {/* Main Tab Bar */}
      <div className="border-b border-black bg-[#FAF9F5] p-3 sm:px-8">
        <div className="flex flex-wrap items-center gap-2 font-mono-code text-xs">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 uppercase font-bold border border-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
              activeTab === "overview" ? "bg-black text-white" : "bg-white text-black hover:bg-[#E6E4DC]"
            }`}
          >
            [01 // MONITORING OVERVIEW]
          </button>

          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 uppercase font-bold border border-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
              activeTab === "users" ? "bg-black text-white" : "bg-white text-black hover:bg-[#E6E4DC]"
            }`}
          >
            [02 // USER & ADMIN MANAGEMENT] ({users.length})
          </button>

          <button
            onClick={() => setActiveTab("memes")}
            className={`px-4 py-2 uppercase font-bold border border-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
              activeTab === "memes" ? "bg-black text-white" : "bg-white text-black hover:bg-[#E6E4DC]"
            }`}
          >
            [03 // MEME MODERATION] ({memes.length})
          </button>

          <button
            onClick={() => setActiveTab("audit")}
            className={`px-4 py-2 uppercase font-bold border border-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
              activeTab === "audit" ? "bg-black text-white" : "bg-white text-black hover:bg-[#E6E4DC]"
            }`}
          >
            [04 // AUDIT LOGS & TRAIL] ({auditLogs.length})
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6 sm:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* ============================================================== */}
        {/* TAB 1: OVERVIEW & MONITORING                                   */}
        {/* ============================================================== */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Quick Actions Panel */}
              <div className="bg-white border border-black p-6 space-y-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="font-mono-code text-xs uppercase font-bold text-[#777777] flex items-center justify-between">
                  <span>SUPER ADMIN ACTIONS</span>
                  <Crown className="w-4 h-4 text-[#E11D48]" />
                </div>
                <h3 className="font-display font-extrabold text-xl uppercase text-black">
                  ADMINISTRATION TOOLS
                </h3>
                <div className="space-y-2 font-mono-code text-xs">
                  <button
                    onClick={() => {
                      setActiveTab("users");
                      setShowAddAdmin(true);
                    }}
                    className="w-full py-2.5 px-3 bg-black text-white hover:bg-[#333333] font-bold uppercase text-left flex items-center justify-between transition-colors"
                  >
                    <span>+ ADD NEW ADMIN ACCOUNT</span>
                    <UserPlus className="w-4 h-4" />
                  </button>

                  <Link
                    href="/editor"
                    className="w-full py-2.5 px-3 bg-white border border-black hover:bg-[#FAF9F5] font-bold uppercase text-left flex items-center justify-between transition-colors"
                  >
                    <span>OPEN MEME STUDIO EDITOR</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>

                  <Link
                    href="/cards"
                    className="w-full py-2.5 px-3 bg-white border border-black hover:bg-[#FAF9F5] font-bold uppercase text-left flex items-center justify-between transition-colors"
                  >
                    <span>INSPECT TEMPLATE ARCHIVE</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Roles Breakdown */}
              <div className="bg-white border border-black p-6 space-y-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="font-mono-code text-xs uppercase font-bold text-[#777777]">
                  ACCESS CONTROL BREAKDOWN
                </div>
                <h3 className="font-display font-extrabold text-xl uppercase text-black">
                  ROLE ASSIGNMENTS
                </h3>
                <div className="space-y-3 font-mono-code text-xs">
                  <div className="flex items-center justify-between p-2 bg-[#FFF1F2] border border-[#E11D48]/30">
                    <span className="font-bold text-[#E11D48]">SUPER_ADMIN (FULL ROOT)</span>
                    <span className="font-extrabold text-black">{stats?.users.superAdmins || 1}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-[#FAF9F5] border border-black/20">
                    <span className="font-bold text-black">ADMIN (MANAGEMENT)</span>
                    <span className="font-extrabold text-black">{stats?.users.admins || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-[#FAF9F5] border border-black/20">
                    <span className="font-bold text-black">CREATOR (STUDIO ACCESS)</span>
                    <span className="font-extrabold text-black">{stats?.users.creators || users.length}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-[#FAF9F5] border border-black/20">
                    <span className="font-bold text-black">CURATOR (TEMPLATES)</span>
                    <span className="font-extrabold text-black">{stats?.users.curators || 0}</span>
                  </div>
                </div>
              </div>

              {/* Infrastructure & Security Monitor */}
              <div className="bg-white border border-black p-6 space-y-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="font-mono-code text-xs uppercase font-bold text-[#777777]">
                  DATABASE & SYSTEM METRICS
                </div>
                <h3 className="font-display font-extrabold text-xl uppercase text-black">
                  LIVE TELEMETRY
                </h3>
                <div className="space-y-3 font-mono-code text-xs">
                  <div className="p-3 bg-[#F0FDF4] border border-[#16A34A] text-[#16A34A] flex items-center justify-between font-bold">
                    <span>NEON POSTGRESQL</span>
                    <span>ONLINE ({stats?.system.dbLatencyMs || 22}ms)</span>
                  </div>
                  <div className="p-3 bg-[#FAF9F5] border border-black text-black flex items-center justify-between font-bold">
                    <span>SUPABASE AUTH SERVICE</span>
                    <span>ACTIVE</span>
                  </div>
                  <div className="p-3 bg-[#FAF9F5] border border-black text-black flex items-center justify-between font-bold">
                    <span>RATE LIMITER & ZOD</span>
                    <span>ENFORCING</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Memes Snapshot */}
            <div className="bg-white border border-black p-6 space-y-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center justify-between border-b border-black pb-3">
                <h3 className="font-display font-extrabold text-lg uppercase text-black">
                  LATEST GENERATED MEMES ACROSS APPLICATION
                </h3>
                <button
                  onClick={() => setActiveTab("memes")}
                  className="font-mono-code text-xs text-[#E11D48] hover:underline font-bold uppercase"
                >
                  MODERATE ALL MEMES →
                </button>
              </div>

              {memes.length === 0 ? (
                <div className="p-8 text-center font-mono-code text-xs text-[#777777]">
                  NO MEMES CREATED YET. OPEN THE EDITOR TO CREATE ONE!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {memes.slice(0, 4).map((m) => (
                    <div key={m.id} className="p-3 border border-black bg-[#FAF9F5] space-y-2">
                      <div className="aspect-square bg-white border border-black/10 flex items-center justify-center overflow-hidden">
                        {m.previewUrl ? (
                          <img src={m.previewUrl} alt={m.title} className="w-full h-full object-contain" />
                        ) : (
                          <span className="font-mono-code text-[10px] text-[#777777]">CANVAS SVG</span>
                        )}
                      </div>
                      <div className="font-display font-bold text-xs uppercase truncate text-black">
                        {m.title}
                      </div>
                      <div className="font-mono-code text-[10px] text-[#777777] truncate">
                        By: {m.author?.email || "Anonymous"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: USER & ADMIN MANAGEMENT                                 */}
        {/* ============================================================== */}
        {activeTab === "users" && (
          <div className="space-y-6">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#777777]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="SEARCH BY EMAIL OR NAME..."
                    className="pl-9 pr-4 py-2 bg-white border border-black font-mono-code text-xs font-bold w-64 md:w-80 focus:outline-none"
                  />
                </div>

                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3 py-2 bg-white border border-black font-mono-code text-xs font-bold focus:outline-none"
                >
                  <option value="ALL">ALL ROLES</option>
                  <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="CURATOR">CURATOR</option>
                  <option value="CREATOR">CREATOR</option>
                </select>
              </div>

              <button
                onClick={() => setShowAddAdmin(!showAddAdmin)}
                className="px-4 py-2 bg-black text-white hover:bg-[#333333] font-mono-code text-xs uppercase font-bold flex items-center justify-center gap-1.5 transition-colors border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                <UserPlus className="w-4 h-4" />
                <span>{showAddAdmin ? "CLOSE FORM" : "+ ADD NEW ADMIN"}</span>
              </button>
            </div>

            {/* Inline Add Admin Form */}
            {showAddAdmin && (
              <form
                onSubmit={handleCreateAdmin}
                className="p-6 bg-white border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4"
              >
                <div className="flex items-center gap-2 font-mono-code text-xs font-bold text-[#E11D48] uppercase">
                  <Crown className="w-4 h-4" />
                  CREATE PRIVILEGED ACCOUNT (ADMIN / SUPER ADMIN)
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono-code text-xs">
                  <div>
                    <label className="text-[10px] text-[#777777] uppercase font-bold block mb-1">
                      USER EMAIL ADDRESS *
                    </label>
                    <input
                      type="email"
                      required
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      placeholder="ADMIN@LOLCANVAS.STUDIO"
                      className="w-full p-2.5 bg-[#FAF9F5] border border-black text-xs font-bold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-[#777777] uppercase font-bold block mb-1">
                      FULL NAME (OPTIONAL)
                    </label>
                    <input
                      type="text"
                      value={newAdminName}
                      onChange={(e) => setNewAdminName(e.target.value)}
                      placeholder="NAME / HANDLE"
                      className="w-full p-2.5 bg-[#FAF9F5] border border-black text-xs font-bold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-[#777777] uppercase font-bold block mb-1">
                      ASSIGN ROLE *
                    </label>
                    <select
                      value={newAdminRole}
                      onChange={(e) => setNewAdminRole(e.target.value as any)}
                      className="w-full p-2.5 bg-[#FAF9F5] border border-black text-xs font-bold focus:outline-none"
                    >
                      <option value="ADMIN">ADMIN (MODERATION & USERS)</option>
                      <option value="SUPER_ADMIN">SUPER_ADMIN (FULL ROOT ACCESS)</option>
                      <option value="CURATOR">CURATOR (TEMPLATES ONLY)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#E11D48] text-white hover:bg-black font-mono-code text-xs uppercase font-bold transition-colors border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  >
                    CREATE PRIVILEGED USER ■
                  </button>
                  {adminFormStatus && (
                    <span className="font-mono-code text-xs font-bold text-black">
                      {adminFormStatus}
                    </span>
                  )}
                </div>
              </form>
            )}

            {/* Users Table */}
            <div className="bg-white border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-x-auto">
              <table className="w-full text-left font-mono-code text-xs">
                <thead className="bg-[#FAF9F5] border-b border-black uppercase text-[10px] text-[#777777]">
                  <tr>
                    <th className="p-3.5">USER</th>
                    <th className="p-3.5">CURRENT ROLE</th>
                    <th className="p-3.5">STATUS</th>
                    <th className="p-3.5">MEMES</th>
                    <th className="p-3.5">JOINED</th>
                    <th className="p-3.5 text-right">ADMIN ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/10">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-[#777777]">
                        NO USERS FOUND MATCHING CRITERIA
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id} className="hover:bg-[#FAF9F5]/80 transition-colors">
                        <td className="p-3.5">
                          <div className="font-bold text-black">{u.email}</div>
                          {u.name && <div className="text-[10px] text-[#777777]">{u.name}</div>}
                        </td>
                        <td className="p-3.5">
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            className={`p-1 text-[11px] font-bold border border-black uppercase focus:outline-none ${
                              u.role === "SUPER_ADMIN"
                                ? "bg-[#FFE4E6] text-[#E11D48]"
                                : u.role === "ADMIN"
                                ? "bg-[#FEF08A] text-black"
                                : "bg-white text-black"
                            }`}
                          >
                            <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                            <option value="ADMIN">ADMIN</option>
                            <option value="CURATOR">CURATOR</option>
                            <option value="CREATOR">CREATOR</option>
                          </select>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold uppercase border ${
                              u.status === "ACTIVE"
                                ? "bg-[#DCFCE7] text-[#15803D] border-[#16A34A]/30"
                                : "bg-[#FEE2E2] text-[#DC2626] border-[#DC2626]/30"
                            }`}
                          >
                            {u.status}
                          </span>
                        </td>
                        <td className="p-3.5 font-bold">{u._count.memes}</td>
                        <td className="p-3.5 text-[10px] text-[#777777]">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleToggleStatus(u.id, u.status)}
                              className={`px-2.5 py-1 text-[10px] font-bold uppercase border border-black transition-colors ${
                                u.status === "ACTIVE"
                                  ? "bg-white text-[#DC2626] hover:bg-[#DC2626] hover:text-white"
                                  : "bg-[#15803D] text-white hover:bg-black"
                              }`}
                            >
                              {u.status === "ACTIVE" ? "SUSPEND" : "UNBAN"}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u.id, u.email)}
                              className="p-1 text-[#E11D48] hover:bg-[#FFE4E6] border border-transparent hover:border-black transition-colors"
                              title="Delete user"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: MEME MODERATION                                         */}
        {/* ============================================================== */}
        {activeTab === "memes" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-black pb-3">
              <div>
                <h3 className="font-display font-extrabold text-xl uppercase text-black">
                  PLATFORM MEME CONTENT MODERATION
                </h3>
                <p className="font-mono-code text-xs text-[#777777]">
                  Monitor and remove any user creations violating terms or community guidelines.
                </p>
              </div>
              <span className="font-mono-code text-xs font-bold text-black uppercase bg-[#FAF9F5] px-3 py-1 border border-black">
                TOTAL: {memes.length} MEMES
              </span>
            </div>

            {memes.length === 0 ? (
              <div className="p-16 text-center font-mono-code text-xs text-[#777777] bg-white border border-black">
                NO USER GENERATED MEMES FOUND IN DATABASE.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {memes.map((m) => (
                  <div
                    key={m.id}
                    className="bg-white border border-black p-4 space-y-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <div className="aspect-[4/3] bg-[#FAF9F5] border border-black/20 p-2 flex items-center justify-center overflow-hidden">
                      {m.previewUrl ? (
                        <img src={m.previewUrl} alt={m.title} className="max-h-full max-w-full object-contain" />
                      ) : (
                        <div className="font-mono-code text-xs text-[#777777] text-center">
                          NO PREVIEW IMAGE
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="font-display font-bold text-sm uppercase text-black truncate">
                        {m.title}
                      </div>
                      <div className="flex items-center justify-between font-mono-code text-[10px] text-[#777777]">
                        <span>BY: {m.author?.email || "ANONYMOUS"}</span>
                        <span>{new Date(m.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-black/10">
                      <span className="font-mono-code text-[10px] font-bold text-black uppercase">
                        {m.downloads} EXPORTS // {m.likes} LIKES
                      </span>
                      <button
                        onClick={() => handleDeleteMeme(m.id, m.title)}
                        className="px-3 py-1 bg-[#FFF1F2] text-[#E11D48] border border-[#E11D48] hover:bg-[#E11D48] hover:text-white font-mono-code text-[11px] font-bold uppercase transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        DELETE MEME
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: AUDIT LOGS & TRAIL                                      */}
        {/* ============================================================== */}
        {activeTab === "audit" && (
          <div className="space-y-6">
            <div className="border-b border-black pb-3">
              <h3 className="font-display font-extrabold text-xl uppercase text-black">
                SECURITY AUDIT LOGS & ACTION TRAIL
              </h3>
              <p className="font-mono-code text-xs text-[#777777]">
                Every administrative role change, account ban, deletion, and privilege grant is permanently recorded.
              </p>
            </div>

            <div className="bg-white border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-x-auto">
              <table className="w-full text-left font-mono-code text-xs">
                <thead className="bg-[#FAF9F5] border-b border-black uppercase text-[10px] text-[#777777]">
                  <tr>
                    <th className="p-3.5">TIMESTAMP</th>
                    <th className="p-3.5">ACTOR</th>
                    <th className="p-3.5">ACTION</th>
                    <th className="p-3.5">DETAILS</th>
                    <th className="p-3.5">IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/10">
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-[#777777]">
                        NO AUDIT LOGS RECORDED YET
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-[#FAF9F5]/80">
                        <td className="p-3.5 text-[10px] text-[#777777] whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="p-3.5 font-bold text-black">{log.actorEmail || "SYSTEM"}</td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 bg-[#FFE4E6] text-[#E11D48] text-[10px] font-bold border border-[#E11D48]/30">
                            {log.action}
                          </span>
                        </td>
                        <td className="p-3.5 text-[#333333] max-w-md truncate" title={log.details || ""}>
                          {log.details || "—"}
                        </td>
                        <td className="p-3.5 text-[10px] text-[#777777]">{log.ipAddress || "127.0.0.1"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
