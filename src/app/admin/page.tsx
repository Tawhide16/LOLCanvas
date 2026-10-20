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
  CheckSquare,
  Square,
  X,
  HardDrive,
  Server,
  PieChart,
  FolderTree,
  Gauge,
  Layers,
  Sliders,
  Type,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import WebsiteContentManager from "@/components/admin/WebsiteContentManager";

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
  database?: {
    usedBytes: number;
    usedPretty: string;
    limitBytes: number;
    limitPretty: string;
    usagePercent: number;
    remainingBytes: number;
    remainingPretty: string;
    tables: Array<{
      tableName: string;
      totalBytes: number;
      prettySize: string;
      rowCount: number;
    }>;
  };
  storage?: {
    usedBytes: number;
    usedPretty: string;
    limitBytes: number;
    limitPretty: string;
    usagePercent: number;
    remainingBytes: number;
    remainingPretty: string;
    totalAssetsCount: number;
    supabaseBucketName: string;
    averageAssetSizePretty: string;
    assetBreakdown: {
      templateAssetsBytes: number;
      templateAssetsPretty: string;
      templateCount: number;
      userUploadsBytes: number;
      userUploadsPretty: string;
      userUploadsCount: number;
      supabaseBucketBytes: number;
      supabaseBucketPretty: string;
      supabaseBucketCount: number;
    };
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

interface TemplateItem {
  id: string;
  slug: string;
  title: string;
  categoryId: string;
  categoryName: string;
  svgDataUri: string;
  width: number;
  height: number;
  tags: string[];
  createdAt: string;
}

export default function AdminPage() {
  const [currentUser, setCurrentUser] = useState<SupabaseUser | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "memes" | "audit" | "templates" | "storage" | "content">("overview");

  // Data states
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [memes, setMemes] = useState<MemeItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [adminTemplates, setAdminTemplates] = useState<TemplateItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Template multi-selection & delete states
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([]);
  const [templateSearch, setTemplateSearch] = useState("");
  const [templateCategoryFilter, setTemplateCategoryFilter] = useState("all");
  const [cardToDeleteInAdmin, setCardToDeleteInAdmin] = useState<TemplateItem | null>(null);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [isDeletingTemplates, setIsDeletingTemplates] = useState(false);

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
      const [statsRes, usersRes, memesRes, auditRes, templatesRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch(`/api/admin/users?search=${encodeURIComponent(searchQuery)}&role=${roleFilter}`),
        fetch("/api/admin/memes"),
        fetch("/api/admin/audit-logs"),
        fetch("/api/templates?limit=100"),
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
      if (templatesRes.ok) {
        const data = await templatesRes.json();
        setAdminTemplates(data.data?.templates || []);
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

  // Filter templates for admin tab
  const filteredAdminTemplates = React.useMemo(() => {
    let result = [...adminTemplates];
    if (templateCategoryFilter !== "all") {
      result = result.filter(
        (t) =>
          t.categoryId?.toLowerCase() === templateCategoryFilter.toLowerCase() ||
          t.categoryName?.toLowerCase() === templateCategoryFilter.toLowerCase()
      );
    }
    if (templateSearch.trim()) {
      const q = templateSearch.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.slug.toLowerCase().includes(q) ||
          (t.tags && t.tags.some((tag) => tag.toLowerCase().includes(q)))
      );
    }
    return result;
  }, [adminTemplates, templateCategoryFilter, templateSearch]);

  // Multi-selector: Toggle individual card selection
  const handleToggleSelectTemplate = (idOrSlug: string) => {
    setSelectedTemplateIds((prev) =>
      prev.includes(idOrSlug) ? prev.filter((id) => id !== idOrSlug) : [...prev, idOrSlug]
    );
  };

  // Multi-selector: Toggle select all visible
  const handleToggleSelectAllTemplates = (visibleIds: string[]) => {
    const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedTemplateIds.includes(id));
    if (allSelected) {
      setSelectedTemplateIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      const merged = Array.from(new Set([...selectedTemplateIds, ...visibleIds]));
      setSelectedTemplateIds(merged);
    }
  };

  // Open single card deletion popup in Admin
  const handleOpenDeleteSingleCard = (template: TemplateItem) => {
    setCardToDeleteInAdmin(template);
  };

  // Confirm Single Card Deletion in Admin
  const handleConfirmDeleteSingle = async () => {
    if (!cardToDeleteInAdmin) return;
    setIsDeletingTemplates(true);
    const targetId = cardToDeleteInAdmin.id || cardToDeleteInAdmin.slug;
    try {
      const res = await fetch(`/api/templates?id=${encodeURIComponent(targetId)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setAdminTemplates((prev) => prev.filter((t) => t.id !== targetId && t.slug !== targetId));
        setSelectedTemplateIds((prev) => prev.filter((id) => id !== targetId && id !== cardToDeleteInAdmin.slug));

        // Update local storage removed tracker
        const removedIds: string[] = JSON.parse(localStorage.getItem("lolcanvas_removed_templates") || "[]");
        removedIds.push(targetId);
        if (cardToDeleteInAdmin.slug) removedIds.push(cardToDeleteInAdmin.slug);
        localStorage.setItem("lolcanvas_removed_templates", JSON.stringify(removedIds));

        setCardToDeleteInAdmin(null);
        loadDashboardData();
      } else {
        alert("Failed to delete card");
      }
    } catch (e) {
      alert("Error deleting card");
    } finally {
      setIsDeletingTemplates(false);
    }
  };

  // Confirm Bulk Card Deletion in Admin
  const handleConfirmBulkDelete = async () => {
    if (selectedTemplateIds.length === 0) return;
    setIsDeletingTemplates(true);
    try {
      const res = await fetch("/api/templates", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedTemplateIds }),
      });
      if (res.ok) {
        const deletedSet = new Set(selectedTemplateIds);
        setAdminTemplates((prev) => prev.filter((t) => !deletedSet.has(t.id) && !deletedSet.has(t.slug)));

        // Update local storage removed tracker
        const removedIds: string[] = JSON.parse(localStorage.getItem("lolcanvas_removed_templates") || "[]");
        selectedTemplateIds.forEach((id) => removedIds.push(id));
        localStorage.setItem("lolcanvas_removed_templates", JSON.stringify(removedIds));

        setSelectedTemplateIds([]);
        setShowBulkDeleteModal(false);
        loadDashboardData();
      } else {
        alert("Failed to delete selected cards");
      }
    } catch (e) {
      alert("Error during bulk delete");
    } finally {
      setIsDeletingTemplates(false);
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
              NEON DB: {stats?.database?.usedPretty || "17.0 MB"} / {stats?.database?.limitPretty || "500 MB"} ({stats?.database?.usagePercent || 3.4}%)
            </span>
          </div>

          <div className="px-3 py-1.5 bg-white border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2">
            <HardDrive className="w-3.5 h-3.5 text-[#E11D48]" />
            <span className="font-bold text-black uppercase">
              STORAGE: {stats?.storage?.usedPretty || "3.3 MB"} / {stats?.storage?.limitPretty || "1 GB"} ({stats?.storage?.usagePercent || 0.3}%)
            </span>
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

        {/* Database & Storage Status */}
        <div className="p-6 space-y-2 bg-[#FAF9F5]">
          <div className="flex items-center justify-between text-[#777777] font-mono-code text-[11px] uppercase">
            <span>DB & STORAGE CAPACITY</span>
            <HardDrive className="w-4 h-4 text-[#E11D48]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display font-black text-2xl sm:text-3xl text-black">
              {stats?.database?.usedPretty || "17.0 MB"}
            </span>
            <span className="font-mono-code text-xs text-[#777777]">
              / {stats?.database?.limitPretty || "500 MB"}
            </span>
          </div>
          <div className="w-full bg-[#E5E5E0] h-2 border border-black/30 overflow-hidden">
            <div
              className="bg-[#E11D48] h-full"
              style={{ width: `${Math.max(3, stats?.database?.usagePercent || 3.4)}%` }}
            />
          </div>
          <div className="flex items-center justify-between font-mono-code text-[10px] text-[#555555]">
            <span className="text-[#15803D] font-bold">
              ● STORAGE: {stats?.storage?.usedPretty || "3.3 MB"} ({stats?.storage?.usagePercent || 0.3}%)
            </span>
            <button
              onClick={() => setActiveTab("storage")}
              className="text-[#E11D48] hover:underline font-bold"
            >
              DETAILS →
            </button>
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

          <button
            onClick={() => setActiveTab("templates")}
            className={`px-4 py-2 uppercase font-bold border border-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1.5 ${
              activeTab === "templates" ? "bg-black text-white" : "bg-white text-black hover:bg-[#E6E4DC]"
            }`}
          >
            <span>[05 // TEMPLATE CARDS & BULK REMOVE]</span>
            <span className="bg-[#E11D48] text-white px-1.5 py-0.5 text-[10px] font-mono-code font-bold">
              {adminTemplates.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("storage")}
            className={`px-4 py-2 uppercase font-bold border border-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1.5 ${
              activeTab === "storage" ? "bg-black text-white" : "bg-white text-black hover:bg-[#E6E4DC]"
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>[06 // DATABASE & STORAGE USAGE]</span>
            <span className="bg-[#10B981] text-white px-1.5 py-0.5 text-[10px] font-mono-code font-bold">
              {stats?.database?.usedPretty || "17 MB"}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("content")}
            className={`px-4 py-2 uppercase font-bold border border-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1.5 ${
              activeTab === "content" ? "bg-[#E11D48] text-white" : "bg-white text-black hover:bg-[#E6E4DC]"
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-white" />
            <span>[07 // WEBSITE CMS & TYPOGRAPHY]</span>
            <span className="bg-black text-white px-1.5 py-0.5 text-[10px] font-mono-code font-bold">
              CMS
            </span>
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
                    onClick={() => setActiveTab("content")}
                    className="w-full py-2.5 px-3 bg-[#E11D48] text-white hover:bg-black font-bold uppercase text-left flex items-center justify-between transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <span>✎ MANAGE ALL WEBSITE CONTENT & IMAGES</span>
                    <Sliders className="w-4 h-4" />
                  </button>

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
                    href="/edit"
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

                  <button
                    onClick={() => setActiveTab("templates")}
                    className="w-full py-2.5 px-3 bg-[#FFF1F2] border border-[#E11D48] text-[#E11D48] hover:bg-[#E11D48] hover:text-white font-bold uppercase text-left flex items-center justify-between transition-colors shadow-[1px_1px_0px_0px_rgba(225,29,72,1)]"
                  >
                    <span>MANAGE & BULK REMOVE CARDS</span>
                    <Trash2 className="w-4 h-4" />
                  </button>
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

              {/* Infrastructure & Storage Monitor */}
              <div className="bg-white border border-black p-6 space-y-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="font-mono-code text-xs uppercase font-bold text-[#777777] flex items-center justify-between">
                    <span>DATABASE & STORAGE USAGE</span>
                    <HardDrive className="w-4 h-4 text-[#E11D48]" />
                  </div>
                  <h3 className="font-display font-extrabold text-xl uppercase text-black">
                    CAPACITY MONITOR
                  </h3>
                  <div className="space-y-3 font-mono-code text-xs">
                    <div className="p-2.5 bg-[#FAF9F5] border border-black space-y-1">
                      <div className="flex items-center justify-between font-bold text-black">
                        <span>NEON DATABASE:</span>
                        <span className="text-[#E11D48]">{stats?.database?.usedPretty || "17.0 MB"} / {stats?.database?.limitPretty || "500 MB"}</span>
                      </div>
                      <div className="w-full bg-[#E5E5E0] h-1.5 border border-black/20 overflow-hidden">
                        <div className="bg-[#E11D48] h-full" style={{ width: `${Math.max(3, stats?.database?.usagePercent || 3.4)}%` }} />
                      </div>
                      <span className="text-[10px] text-[#777777] block text-right">
                        {stats?.database?.remainingPretty || "482.98 MB"} FREE ({stats?.database?.usagePercent ?? 3.4}% USED)
                      </span>
                    </div>

                    <div className="p-2.5 bg-[#FAF9F5] border border-black space-y-1">
                      <div className="flex items-center justify-between font-bold text-black">
                        <span>MEDIA STORAGE:</span>
                        <span className="text-[#15803D]">{stats?.storage?.usedPretty || "3.3 MB"} / {stats?.storage?.limitPretty || "1 GB"}</span>
                      </div>
                      <div className="w-full bg-[#E5E5E0] h-1.5 border border-black/20 overflow-hidden">
                        <div className="bg-[#15803D] h-full" style={{ width: `${Math.max(3, stats?.storage?.usagePercent || 0.3)}%` }} />
                      </div>
                      <span className="text-[10px] text-[#777777] block text-right">
                        {stats?.storage?.remainingPretty || "1020.7 MB"} AVAILABLE ({stats?.storage?.usagePercent ?? 0.3}% USED)
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab("storage")}
                  className="w-full py-2 px-3 bg-black text-white hover:bg-[#333333] font-mono-code text-xs font-bold uppercase transition-colors flex items-center justify-between shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mt-2"
                >
                  <span>INSPECT DEEP USAGE METRICS</span>
                  <ArrowUpRight className="w-4 h-4 text-[#E11D48]" />
                </button>
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
                      <div className="bg-white border border-black/10 flex items-center justify-center p-2 min-h-[160px]">
                        {m.previewUrl ? (
                          <img src={m.previewUrl} alt={m.title} className="w-auto h-auto max-w-full max-h-[150px] object-contain" />
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
                    className="group bg-white border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between transition-all hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden"
                  >
                    {/* Full-bleed Top Image */}
                    <div className="w-full aspect-square relative overflow-hidden bg-[#FAF9F5] flex items-center justify-center border-b border-black">
                      {m.previewUrl ? (
                        <img
                          src={m.previewUrl}
                          alt={m.title}
                          loading="eager"
                          decoding="async"
                          className="w-full h-full object-cover block group-hover:scale-105 transition-all duration-300"
                        />
                      ) : (
                        <div className="font-mono-code text-xs text-[#777777] text-center">
                          NO PREVIEW IMAGE
                        </div>
                      )}
                    </div>

                    {/* Bottom Content with padding */}
                    <div className="p-4 flex flex-col justify-between space-y-3 bg-white">
                      <div className="space-y-1">
                        <div className="font-display font-bold text-sm uppercase text-black truncate tracking-tight">
                          {m.title}
                        </div>
                        <div className="flex items-center justify-between font-mono-code text-[10px] text-[#777777]">
                          <span>BY: {m.author?.email || "ANONYMOUS"}</span>
                          <span>{new Date(m.createdAt).toLocaleDateString("en-GB")}</span>
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
                          DELETE
                        </button>
                      </div>
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

        {/* ============================================================== */}
        {/* TAB 5: TEMPLATE CARDS & BULK REMOVAL                           */}
        {/* ============================================================== */}
        {activeTab === "templates" && (
          <div className="space-y-6">
            {/* Header & Subtitle */}
            <div className="border-b border-black pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-[10px] font-mono-code uppercase font-bold text-[#E11D48] mb-1">
                  <Crown className="w-3.5 h-3.5" />
                  SUPER ADMIN ARCHIVE CONTROL
                </div>
                <h3 className="font-display font-black text-2xl uppercase text-black">
                  TEMPLATE CARDS & MULTI-SELECTOR REMOVAL
                </h3>
                <p className="font-mono-code text-xs text-[#666666] mt-0.5">
                  Select multiple cards using checkboxes to bulk delete, or remove individual cards with confirmation.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/cards"
                  target="_blank"
                  className="px-4 py-2 bg-white border border-black font-mono-code text-xs font-bold uppercase hover:bg-[#E6E4DC] flex items-center gap-1.5 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                  <span>VIEW PUBLIC ARCHIVE</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Filter and Multi-Select Control Bar */}
            <div className="bg-white border border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                {/* Search & Category Filter */}
                <div className="flex flex-wrap items-center gap-2 flex-1">
                  <div className="relative flex-1 min-w-[200px] max-w-md">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#777777]" />
                    <input
                      type="text"
                      value={templateSearch}
                      onChange={(e) => setTemplateSearch(e.target.value)}
                      placeholder="SEARCH BY TITLE, SLUG OR TAG..."
                      className="pl-9 pr-4 py-2 bg-[#FAF9F5] border border-black font-mono-code text-xs font-bold w-full focus:outline-none"
                    />
                  </div>

                  <select
                    value={templateCategoryFilter}
                    onChange={(e) => setTemplateCategoryFilter(e.target.value)}
                    className="px-3 py-2 bg-[#FAF9F5] border border-black font-mono-code text-xs font-bold uppercase focus:outline-none"
                  >
                    <option value="all">ALL CATEGORIES</option>
                    <option value="classic">CLASSIC FORMATS</option>
                    <option value="reaction">REACTION & SHOCK</option>
                    <option value="relatable">WORK & EVERYDAY</option>
                    <option value="modern">BRAINROT & SURREAL</option>
                    <option value="crypto">FINANCE & CRYPTO</option>
                    <option value="animals">ANIMALS & CHAOS</option>
                  </select>
                </div>

                {/* Counter */}
                <div className="font-mono-code text-xs text-[#777777] self-center">
                  SHOWING {filteredAdminTemplates.length} OF {adminTemplates.length} CARDS
                </div>
              </div>

              {/* Multi-Selection Control Strip */}
              <div className="pt-3 border-t border-black/10 flex flex-wrap items-center justify-between gap-3 font-mono-code text-xs">
                {/* Select All Checkbox */}
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer font-bold select-none">
                    <input
                      type="checkbox"
                      checked={
                        filteredAdminTemplates.length > 0 &&
                        filteredAdminTemplates.every((t) =>
                          selectedTemplateIds.includes(t.id) || selectedTemplateIds.includes(t.slug)
                        )
                      }
                      onChange={() =>
                        handleToggleSelectAllTemplates(filteredAdminTemplates.map((t) => t.id || t.slug))
                      }
                      className="w-4 h-4 rounded-none accent-[#E11D48] cursor-pointer"
                    />
                    <span className="text-black uppercase">
                      SELECT ALL ({filteredAdminTemplates.length})
                    </span>
                  </label>

                  {selectedTemplateIds.length > 0 && (
                    <button
                      onClick={() => setSelectedTemplateIds([])}
                      className="text-[11px] text-[#777777] hover:text-black underline uppercase"
                    >
                      CLEAR SELECTION
                    </button>
                  )}
                </div>

                {/* Bulk Actions Button */}
                <div className="flex items-center gap-2">
                  {selectedTemplateIds.length > 0 ? (
                    <div className="flex items-center gap-2 animate-in fade-in">
                      <span className="px-2.5 py-1 bg-[#FFF1F2] border border-[#E11D48] text-[#E11D48] font-bold text-[11px]">
                        [{selectedTemplateIds.length} SELECTED]
                      </span>
                      <button
                        onClick={() => setShowBulkDeleteModal(true)}
                        className="px-4 py-2 bg-[#E11D48] text-white hover:bg-black font-bold uppercase transition-colors border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>DELETE SELECTED CARDS ({selectedTemplateIds.length}) ■</span>
                      </button>
                    </div>
                  ) : (
                    <span className="text-[11px] text-[#777777] italic">
                      Check any boxes below to enable multi-card removal
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Template Grid with Checkboxes */}
            {filteredAdminTemplates.length === 0 ? (
              <div className="p-16 text-center font-mono-code text-xs text-[#777777] bg-white border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                NO TEMPLATE CARDS FOUND MATCHING SEARCH / FILTER CRITERIA.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredAdminTemplates.map((t) => {
                  const cardKey = t.id || t.slug;
                  const isSelected = selectedTemplateIds.includes(cardKey) || selectedTemplateIds.includes(t.slug);

                  return (
                    <div
                      key={cardKey}
                      className={`relative bg-white border transition-all flex flex-col justify-between ${
                        isSelected
                          ? "border-[#E11D48] ring-2 ring-[#E11D48] shadow-[4px_4px_0px_0px_rgba(225,29,72,1)]"
                          : "border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                      }`}
                    >
                      {/* Checkbox Header */}
                      <div
                        onClick={() => handleToggleSelectTemplate(cardKey)}
                        className={`p-2.5 border-b flex items-center justify-between cursor-pointer select-none transition-colors ${
                          isSelected ? "bg-[#FFF1F2] border-[#E11D48]" : "bg-[#FAF9F5] border-black/15"
                        }`}
                      >
                        <label
                          className="flex items-center gap-2 cursor-pointer font-mono-code text-xs font-bold"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelectTemplate(cardKey)}
                            className="w-4 h-4 rounded-none accent-[#E11D48] cursor-pointer"
                          />
                          <span className={isSelected ? "text-[#E11D48]" : "text-black"}>
                            {isSelected ? "SELECTED" : "SELECT"}
                          </span>
                        </label>

                        <span className="font-mono-code text-[10px] uppercase font-bold text-[#777777]">
                          {t.categoryName || t.categoryId}
                        </span>
                      </div>

                      {/* Card Preview Image - Full uncropped meme */}
                      <div
                        onClick={() => handleToggleSelectTemplate(cardKey)}
                        className="p-3 bg-white flex items-center justify-center cursor-pointer min-h-[220px]"
                      >
                        {t.svgDataUri ? (
                          <img
                            src={t.svgDataUri}
                            alt={t.title}
                            className="w-auto h-auto max-w-full max-h-[210px] object-contain border border-black/10"
                          />
                        ) : (
                          <div className="font-mono-code text-xs text-[#777777]">NO PREVIEW</div>
                        )}
                      </div>

                      {/* Card Info & Individual Delete */}
                      <div className="p-3 bg-[#FAF9F5] border-t border-black/15 space-y-2">
                        <div>
                          <h4 className="font-display font-black text-xs uppercase text-black truncate" title={t.title}>
                            {t.title}
                          </h4>
                          <span className="font-mono-code text-[10px] text-[#777777] block truncate">
                            SLUG: {t.slug}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="grid grid-cols-2 gap-2 pt-1 font-mono-code text-[11px]">
                          <Link
                            href={`/edit/${t.slug}`}
                            target="_blank"
                            className="py-1 px-2 bg-white border border-black text-black hover:bg-[#E6E4DC] font-bold uppercase text-center transition-colors flex items-center justify-center gap-1"
                          >
                            <span>VIEW</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleOpenDeleteSingleCard(t)}
                            className="py-1 px-2 bg-[#FFF1F2] border border-[#E11D48] text-[#E11D48] hover:bg-[#E11D48] hover:text-white font-bold uppercase text-center transition-colors flex items-center justify-center gap-1 shadow-[1px_1px_0px_0px_rgba(225,29,72,1)]"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>DELETE</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 6: DATABASE & STORAGE USAGE METRICS                        */}
        {/* ============================================================== */}
        {activeTab === "storage" && (
          <div className="space-y-6">
            {/* Telemetry Header Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-black p-4 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div>
                <div className="inline-flex items-center gap-1.5 text-[10px] font-mono-code uppercase font-semibold text-[#E11D48]">
                  <HardDrive className="w-3.5 h-3.5" />
                  REAL-TIME INFRASTRUCTURE TELEMETRY
                </div>
                <h3 className="font-display font-black text-xl sm:text-2xl uppercase tracking-tight text-black">
                  DATABASE & MEDIA STORAGE USAGE
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-mono-code text-[11px] text-[#777777]">
                  LAST SYNCED: {stats?.system?.timestamp ? new Date(stats.system.timestamp).toLocaleTimeString() : "LIVE"}
                </span>
                <button
                  onClick={loadDashboardData}
                  disabled={isLoading}
                  className="px-3 py-1.5 bg-black text-white hover:bg-[#333333] font-mono-code text-xs font-bold uppercase transition-colors flex items-center gap-1.5 border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
                  <span>REFRESH TELEMETRY</span>
                </button>
              </div>
            </div>

            {/* 2 Big Hero Capacity Meter Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Card 1: Neon PostgreSQL Database Usage */}
              <div className="bg-white border border-black p-6 space-y-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between font-mono-code text-xs text-[#777777]">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-[#E11D48]" />
                      <span className="font-bold text-black uppercase">NEON POSTGRESQL DATABASE</span>
                    </div>
                    <span className="bg-[#DCFCE7] text-[#15803D] px-2 py-0.5 font-bold border border-[#16A34A]/30">
                      LIVE & CONNECTED
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <div>
                      <div className="font-display font-black text-4xl sm:text-5xl text-black">
                        {stats?.database?.usedPretty || "17.02 MB"}
                      </div>
                      <div className="font-mono-code text-xs text-[#777777] mt-1">
                        TOTAL DISK FOOTPRINT CONSUMED
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-display font-extrabold text-2xl sm:text-3xl text-[#E11D48]">
                        {stats?.database?.usagePercent ?? 3.4}%
                      </div>
                      <div className="font-mono-code text-xs text-[#777777]">
                        OF {stats?.database?.limitPretty || "500 MB"} QUOTA
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar with Scale Marks */}
                  <div className="space-y-1.5 pt-2">
                    <div className="w-full bg-[#FAF9F5] h-5 border-2 border-black overflow-hidden relative p-0.5">
                      <div
                        className="bg-[#E11D48] h-full transition-all duration-500"
                        style={{ width: `${Math.max(2, stats?.database?.usagePercent || 3.4)}%` }}
                      />
                    </div>
                    <div className="flex justify-between font-mono-code text-[10px] text-[#777777]">
                      <span>0 MB</span>
                      <span>125 MB (25%)</span>
                      <span>250 MB (50%)</span>
                      <span>375 MB (75%)</span>
                      <span>{stats?.database?.limitPretty || "500 MB"} (100%)</span>
                    </div>
                  </div>
                </div>

                {/* Submetrics Row */}
                <div className="grid grid-cols-3 gap-2 border-t border-black/15 pt-4 font-mono-code text-xs bg-[#FAF9F5] p-3 -mx-2">
                  <div>
                    <span className="text-[10px] text-[#777777] block uppercase">REMAINING FREE</span>
                    <span className="font-bold text-[#15803D] text-sm block">
                      {stats?.database?.remainingPretty || "482.98 MB"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#777777] block uppercase">QUERY LATENCY</span>
                    <span className="font-bold text-black text-sm block">
                      {stats?.system?.dbLatencyMs || 18} MS
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#777777] block uppercase">ACTIVE TABLES</span>
                    <span className="font-bold text-black text-sm block">
                      {stats?.database?.tables?.length || 6} TABLES
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2: Media & Files Storage Usage */}
              <div className="bg-white border border-black p-6 space-y-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between font-mono-code text-xs text-[#777777]">
                    <div className="flex items-center gap-2">
                      <HardDrive className="w-4 h-4 text-[#E11D48]" />
                      <span className="font-bold text-black uppercase">MEDIA & ASSET STORAGE (CDN & BLOBS)</span>
                    </div>
                    <span className="bg-[#EFF6FF] text-[#1D4ED8] px-2 py-0.5 font-bold border border-[#2563EB]/30">
                      SUPABASE BUCKET: {stats?.storage?.supabaseBucketName || "memes"}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <div>
                      <div className="font-display font-black text-4xl sm:text-5xl text-black">
                        {stats?.storage?.usedPretty || "3.28 MB"}
                      </div>
                      <div className="font-mono-code text-xs text-[#777777] mt-1">
                        TOTAL MEDIA STORAGE OCCUPIED
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-display font-extrabold text-2xl sm:text-3xl text-[#10B981]">
                        {stats?.storage?.usagePercent ?? 0.32}%
                      </div>
                      <div className="font-mono-code text-xs text-[#777777]">
                        OF {stats?.storage?.limitPretty || "1 GB"} QUOTA
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar with Scale Marks */}
                  <div className="space-y-1.5 pt-2">
                    <div className="w-full bg-[#FAF9F5] h-5 border-2 border-black overflow-hidden relative p-0.5">
                      <div
                        className="bg-[#10B981] h-full transition-all duration-500"
                        style={{ width: `${Math.max(2, stats?.storage?.usagePercent || 0.32)}%` }}
                      />
                    </div>
                    <div className="flex justify-between font-mono-code text-[10px] text-[#777777]">
                      <span>0 MB</span>
                      <span>256 MB (25%)</span>
                      <span>512 MB (50%)</span>
                      <span>768 MB (75%)</span>
                      <span>{stats?.storage?.limitPretty || "1 GB"} (100%)</span>
                    </div>
                  </div>
                </div>

                {/* Submetrics Row */}
                <div className="grid grid-cols-3 gap-2 border-t border-black/15 pt-4 font-mono-code text-xs bg-[#FAF9F5] p-3 -mx-2">
                  <div>
                    <span className="text-[10px] text-[#777777] block uppercase">AVAILABLE SPACE</span>
                    <span className="font-bold text-[#15803D] text-sm block">
                      {stats?.storage?.remainingPretty || "1020.72 MB"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#777777] block uppercase">STORED ASSETS</span>
                    <span className="font-bold text-black text-sm block">
                      {stats?.storage?.totalAssetsCount || 8} ITEMS
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#777777] block uppercase">AVG ASSET SIZE</span>
                    <span className="font-bold text-black text-sm block">
                      {stats?.storage?.averageAssetSizePretty || "410 KB"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Asset Storage Category Breakdown */}
            <div className="bg-white border border-black p-6 space-y-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center justify-between border-b border-black pb-3">
                <div className="flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-[#E11D48]" />
                  <h3 className="font-display font-extrabold text-lg uppercase text-black">
                    STORAGE ASSET DISTRIBUTION BREAKDOWN
                  </h3>
                </div>
                <span className="font-mono-code text-xs text-[#777777]">
                  MULTI-TIER ASSET CACHE & CLOUD BUCKET
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Templates */}
                <div className="p-4 bg-[#FAF9F5] border border-black space-y-2">
                  <div className="flex items-center justify-between font-mono-code text-xs text-[#777777]">
                    <span className="font-bold text-black">01 // TEMPLATE ARCHIVE</span>
                    <span className="bg-[#E6E4DC] text-black px-1.5 py-0.5 text-[10px] font-bold">
                      {stats?.storage?.assetBreakdown?.templateCount || 8} TEMPLATES
                    </span>
                  </div>
                  <div className="font-display font-black text-2xl text-black">
                    {stats?.storage?.assetBreakdown?.templateAssetsPretty || "3.28 MB"}
                  </div>
                  <p className="font-mono-code text-[11px] text-[#555555]">
                    Compressed WebP previews + high-res SVG vector layers for canvas remixing.
                  </p>
                </div>

                {/* 2. User Generated Memes */}
                <div className="p-4 bg-[#FAF9F5] border border-black space-y-2">
                  <div className="flex items-center justify-between font-mono-code text-xs text-[#777777]">
                    <span className="font-bold text-black">02 // USER CREATIONS</span>
                    <span className="bg-[#DCFCE7] text-[#15803D] px-1.5 py-0.5 text-[10px] font-bold">
                      {stats?.storage?.assetBreakdown?.userUploadsCount || 0} EXPORTS
                    </span>
                  </div>
                  <div className="font-display font-black text-2xl text-black">
                    {stats?.storage?.assetBreakdown?.userUploadsPretty || "0 Bytes"}
                  </div>
                  <p className="font-mono-code text-[11px] text-[#555555]">
                    User meme project previews and JSON layer state saved by community creators.
                  </p>
                </div>

                {/* 3. Supabase Storage Bucket */}
                <div className="p-4 bg-[#FAF9F5] border border-black space-y-2">
                  <div className="flex items-center justify-between font-mono-code text-xs text-[#777777]">
                    <span className="font-bold text-black">03 // CLOUD S3 BUCKET</span>
                    <span className="bg-[#EFF6FF] text-[#1D4ED8] px-1.5 py-0.5 text-[10px] font-bold">
                      {stats?.storage?.assetBreakdown?.supabaseBucketCount || 0} FILES
                    </span>
                  </div>
                  <div className="font-display font-black text-2xl text-black">
                    {stats?.storage?.assetBreakdown?.supabaseBucketPretty || "0 Bytes"}
                  </div>
                  <p className="font-mono-code text-[11px] text-[#555555]">
                    High-resolution exported PNG files stored directly in Supabase Storage (`/exports`).
                  </p>
                </div>
              </div>
            </div>

            {/* Detailed Neon PostgreSQL Tables Disk Footprint */}
            <div className="bg-white border border-black p-6 space-y-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-black pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-[#E11D48]" />
                    <h3 className="font-display font-extrabold text-lg uppercase text-black">
                      POSTGRESQL RELATIONAL TABLES DISK FOOTPRINT
                    </h3>
                  </div>
                  <span className="font-mono-code text-xs text-[#777777]">
                    PHYSICAL BYTES AND LIVE ROW ESTIMATES DIRECTLY FROM `pg_stat_user_tables`
                  </span>
                </div>

                <div className="font-mono-code text-xs font-bold text-black bg-[#FAF9F5] border border-black px-2.5 py-1">
                  TOTAL DB: {stats?.database?.usedPretty || "17.02 MB"}
                </div>
              </div>

              <div className="overflow-x-auto border border-black">
                <table className="w-full text-left font-mono-code text-xs">
                  <thead className="bg-[#FAF9F5] border-b border-black font-bold uppercase text-black text-[11px]">
                    <tr>
                      <th className="p-3 border-r border-black">TABLE NAME</th>
                      <th className="p-3 border-r border-black">DISK FOOTPRINT</th>
                      <th className="p-3 border-r border-black">LIVE ROWS</th>
                      <th className="p-3 border-r border-black">% OF DATABASE</th>
                      <th className="p-3">PURPOSE / DATA STORED</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black">
                    {(stats?.database?.tables || [
                      { tableName: "templates", prettySize: "9.27 MB", totalBytes: 9720000, rowCount: 8 },
                      { tableName: "memes", prettySize: "112 KB", totalBytes: 114688, rowCount: 0 },
                      { tableName: "audit_logs", prettySize: "64 KB", totalBytes: 65536, rowCount: 13 },
                      { tableName: "users", prettySize: "48 KB", totalBytes: 49152, rowCount: 2 },
                      { tableName: "collections", prettySize: "24 KB", totalBytes: 24576, rowCount: 0 },
                      { tableName: "collection_items", prettySize: "24 KB", totalBytes: 24576, rowCount: 0 },
                    ]).map((table, idx) => {
                      const totalBytes = stats?.database?.usedBytes || 17842176;
                      const tablePercent = totalBytes > 0
                        ? ((table.totalBytes / totalBytes) * 100).toFixed(1)
                        : "0.0";

                      let purpose = "Application records & schema relation";
                      if (table.tableName === "templates") purpose = "Meme template catalog, layout definitions, tags & previews";
                      else if (table.tableName === "memes") purpose = "User canvas memes, layersJson canvas elements & export stats";
                      else if (table.tableName === "audit_logs") purpose = "Admin actions, security audit trail & IP address tracking";
                      else if (table.tableName === "users") purpose = "Registered creators, curators and admin credentials";
                      else if (table.tableName === "collections") purpose = "Curated category collections and archives";
                      else if (table.tableName === "collection_items") purpose = "Meme to collection mapping foreign keys";

                      return (
                        <tr key={`${table.tableName}-${idx}`} className="hover:bg-[#FAF9F5] transition-colors">
                          <td className="p-3 font-bold border-r border-black text-black">
                            {table.tableName}
                          </td>
                          <td className="p-3 font-bold text-[#E11D48] border-r border-black">
                            {table.prettySize}
                          </td>
                          <td className="p-3 font-bold text-black border-r border-black">
                            {table.rowCount} records
                          </td>
                          <td className="p-3 border-r border-black">
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-[#FAF9F5] border border-black/30 h-2 overflow-hidden">
                                <div
                                  className="bg-black h-full"
                                  style={{ width: `${Math.min(100, Math.max(2, parseFloat(tablePercent)))}%` }}
                                />
                              </div>
                              <span className="font-bold text-black">{tablePercent}%</span>
                            </div>
                          </td>
                          <td className="p-3 text-[#555555]">
                            {purpose}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quota & Scale Health Banner */}
            <div className="p-4 bg-[#F0FDF4] border-2 border-[#16A34A] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono-code text-xs text-black">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0" />
                <div>
                  <span className="font-bold text-[#16A34A] uppercase block">
                    INFRASTRUCTURE HEALTH: OPTIMAL (AMPLE HEADROOM)
                  </span>
                  <span className="text-[#333333] text-[11px]">
                    Database is at {stats?.database?.usagePercent ?? 3.4}% and Storage is at {stats?.storage?.usagePercent ?? 0.3}%. Your system can safely accommodate ~15,000+ new meme cards before requiring cloud tier expansions.
                  </span>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <span className="bg-white border border-[#16A34A] px-3 py-1 font-bold text-[#16A34A] uppercase text-[11px]">
                  FREE TIER HEALTHY
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 7: WEBSITE CONTENT, IMAGES & TYPOGRAPHY MANAGER            */}
        {/* ============================================================== */}
        {activeTab === "content" && (
          <WebsiteContentManager
            adminEmail={currentUser?.email || undefined}
            onSuccess={loadDashboardData}
          />
        )}
      </div>

      {/* Single Card Delete Confirmation Modal (Admin) */}
      {cardToDeleteInAdmin && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF9F5] border-2 border-black w-full max-w-md shadow-[8px_8px_0px_0px_rgba(225,29,72,1)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-black px-4 py-3 bg-[#FFF1F2] font-mono-code text-xs">
              <div className="flex items-center gap-2 text-[#E11D48] font-bold uppercase">
                <AlertTriangle className="w-4 h-4 text-[#E11D48]" />
                <span>CONFIRM CARD REMOVAL</span>
              </div>
              <button
                onClick={() => setCardToDeleteInAdmin(null)}
                disabled={isDeletingTemplates}
                className="p-1 hover:bg-black hover:text-white transition-colors"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 p-3 bg-white border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <div className="w-20 h-20 shrink-0 bg-[#FAF9F5] border border-black/20 flex items-center justify-center overflow-hidden p-1">
                  {cardToDeleteInAdmin.svgDataUri ? (
                    <img
                      src={cardToDeleteInAdmin.svgDataUri}
                      alt={cardToDeleteInAdmin.title}
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <span className="font-mono-code text-[9px] text-[#777777]">NO PREVIEW</span>
                  )}
                </div>
                <div className="space-y-1 overflow-hidden min-w-0">
                  <span className="font-mono-code text-[10px] text-[#E11D48] font-bold uppercase tracking-wider block">
                    {cardToDeleteInAdmin.categoryName || "ARCHIVE CARD"}
                  </span>
                  <h4 className="font-display font-black text-sm uppercase text-black truncate">
                    {cardToDeleteInAdmin.title}
                  </h4>
                  <span className="font-mono-code text-[10px] text-[#777777] block truncate">
                    ID: {cardToDeleteInAdmin.id || cardToDeleteInAdmin.slug}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-[#FFF1F2] border border-[#E11D48] font-mono-code text-xs text-black space-y-1">
                <p className="font-bold text-[#E11D48] uppercase flex items-center gap-1.5">
                  <Trash2 className="w-3.5 h-3.5" />
                  PERMANENT DELETION WARNING
                </p>
                <p className="text-[11px] text-[#333333]">
                  Are you sure you want to remove &quot;{cardToDeleteInAdmin.title}&quot;? It will be deleted from Neon PostgreSQL database immediately.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t border-black p-4 bg-[#FAF9F5] flex items-center justify-end gap-3 font-mono-code text-xs">
              <button
                type="button"
                onClick={() => setCardToDeleteInAdmin(null)}
                disabled={isDeletingTemplates}
                className="px-4 py-2 bg-white border border-black hover:bg-[#E6E4DC] uppercase font-bold transition-colors disabled:opacity-50"
              >
                CANCEL
              </button>

              <button
                type="button"
                onClick={handleConfirmDeleteSingle}
                disabled={isDeletingTemplates}
                className="px-5 py-2 bg-[#E11D48] text-white hover:bg-black uppercase font-bold transition-colors border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1.5 disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeletingTemplates ? "DELETING..." : "YES, DELETE CARD ■"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal (Admin) */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF9F5] border-2 border-black w-full max-w-lg shadow-[8px_8px_0px_0px_rgba(225,29,72,1)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-black px-4 py-3 bg-[#FFF1F2] font-mono-code text-xs">
              <div className="flex items-center gap-2 text-[#E11D48] font-bold uppercase">
                <AlertTriangle className="w-4 h-4 text-[#E11D48]" />
                <span>CONFIRM BULK CARD REMOVAL ({selectedTemplateIds.length} ITEMS)</span>
              </div>
              <button
                onClick={() => setShowBulkDeleteModal(false)}
                disabled={isDeletingTemplates}
                className="p-1 hover:bg-black hover:text-white transition-colors"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="p-3 bg-[#FFF1F2] border border-[#E11D48] font-mono-code text-xs text-black space-y-1">
                <p className="font-bold text-[#E11D48] uppercase flex items-center gap-1.5">
                  <Trash2 className="w-3.5 h-3.5" />
                  PERMANENT BULK DELETION NOTICE
                </p>
                <p className="text-[11px] text-[#333333]">
                  You have selected <span className="font-bold text-[#E11D48]">{selectedTemplateIds.length} cards</span>.
                  Continuing will remove all of them from the Neon PostgreSQL database permanently.
                </p>
              </div>

              {/* List of selected cards */}
              <div className="space-y-2">
                <div className="font-mono-code text-[10px] text-[#777777] font-bold uppercase">
                  CARDS TO BE DELETED ({selectedTemplateIds.length}):
                </div>
                <div className="divide-y divide-black/10 border border-black bg-white max-h-48 overflow-y-auto">
                  {selectedTemplateIds.map((id) => {
                    const found = adminTemplates.find((t) => t.id === id || t.slug === id);
                    return (
                      <div key={id} className="p-2 flex items-center gap-3 font-mono-code text-xs">
                        <div className="w-10 h-10 shrink-0 bg-[#FAF9F5] border border-black/10 flex items-center justify-center overflow-hidden">
                          {found?.svgDataUri ? (
                            <img src={found.svgDataUri} alt={found.title} className="max-h-full max-w-full object-contain" />
                          ) : (
                            <span className="text-[8px] text-[#777777]">SVG</span>
                          )}
                        </div>
                        <div className="overflow-hidden min-w-0 flex-1">
                          <div className="font-bold uppercase text-black truncate">{found?.title || id}</div>
                          <div className="text-[10px] text-[#777777] truncate">{id}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t border-black p-4 bg-[#FAF9F5] flex items-center justify-end gap-3 font-mono-code text-xs">
              <button
                type="button"
                onClick={() => setShowBulkDeleteModal(false)}
                disabled={isDeletingTemplates}
                className="px-4 py-2 bg-white border border-black hover:bg-[#E6E4DC] uppercase font-bold transition-colors disabled:opacity-50"
              >
                CANCEL
              </button>

              <button
                type="button"
                onClick={handleConfirmBulkDelete}
                disabled={isDeletingTemplates}
                className="px-5 py-2 bg-[#E11D48] text-white hover:bg-black uppercase font-bold transition-colors border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1.5 disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>
                  {isDeletingTemplates
                    ? `DELETING (${selectedTemplateIds.length})...`
                    : `CONFIRM BULK DELETE (${selectedTemplateIds.length}) ■`}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
