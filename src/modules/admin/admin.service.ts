import { prisma } from "@/lib/prisma";
import { Role } from "../auth/auth.rbac";

function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export interface DatabaseMetrics {
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
}

export interface StorageMetrics {
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
}

export interface SystemStats {
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
  database: DatabaseMetrics;
  storage: StorageMetrics;
}

/**
 * Get comprehensive monitoring, analytics, database & storage stats
 */
export async function getSystemStats(): Promise<SystemStats> {
  const startTime = performance.now();
  let dbConnected = true;
  let dbLatencyMs = 0;

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbLatencyMs = Math.round(performance.now() - startTime);
  } catch (err) {
    dbConnected = false;
  }

  // 1. Neon PostgreSQL Database Size & Table Metrics
  let dbSizeBytes = 0;
  let tableSizes: Array<{ tableName: string; totalBytes: number; prettySize: string; rowCount: number }> = [];
  try {
    const dbSizeRes = await prisma.$queryRawUnsafe<Array<{ size_bytes: bigint }>>(`
      SELECT pg_database_size(current_database()) as size_bytes
    `);
    dbSizeBytes = Number(dbSizeRes[0]?.size_bytes || 0);

    const tableRes = await prisma.$queryRawUnsafe<Array<{ table_name: string; total_bytes: bigint; row_estimate: bigint }>>(`
      SELECT
        relname as table_name,
        pg_total_relation_size(relid) as total_bytes,
        n_live_tup as row_estimate
      FROM pg_catalog.pg_stat_user_tables
      WHERE schemaname = 'public'
      ORDER BY pg_total_relation_size(relid) DESC
    `);
    tableSizes = tableRes.map((t) => ({
      tableName: t.table_name,
      totalBytes: Number(t.total_bytes),
      prettySize: formatBytes(Number(t.total_bytes)),
      rowCount: Math.max(0, Number(t.row_estimate)),
    }));
  } catch (err) {
    console.warn("Could not query DB size metrics:", err);
  }

  // 2. Storage Metrics (Assets in DB & Supabase Storage)
  let templateAssetsBytes = 0;
  let templateCount = 0;
  let userUploadsBytes = 0;
  let userUploadsCount = 0;
  let supabaseBucketBytes = 0;
  let supabaseBucketCount = 0;

  try {
    const templateBytesRes = await prisma.$queryRawUnsafe<Array<{ total_bytes: bigint; count: bigint }>>(`
      SELECT
        COALESCE(SUM(LENGTH("svgDataUri") + LENGTH(COALESCE("defaultBottomText", ''))), 0) as total_bytes,
        COUNT(*) as count
      FROM templates
    `);
    templateAssetsBytes = Number(templateBytesRes[0]?.total_bytes || 0);
    templateCount = Number(templateBytesRes[0]?.count || 0);

    const memeBytesRes = await prisma.$queryRawUnsafe<Array<{ total_bytes: bigint; count: bigint }>>(`
      SELECT
        COALESCE(SUM(LENGTH(COALESCE("previewUrl", ''))), 0) as total_bytes,
        COUNT(*) as count
      FROM memes
    `);
    userUploadsBytes = Number(memeBytesRes[0]?.total_bytes || 0);
    userUploadsCount = Number(memeBytesRes[0]?.count || 0);

    // Supabase bucket storage
    try {
      const { supabase } = await import("@/lib/supabase");
      const { data: files } = await supabase.storage.from("memes").list("exports", { limit: 100 });
      if (files && files.length > 0) {
        supabaseBucketCount = files.length;
        supabaseBucketBytes = files.reduce((acc: number, f: any) => acc + (f.metadata?.size || 0), 0);
      }
    } catch (sbErr) {}
  } catch (err) {
    console.warn("Could not query storage metrics:", err);
  }

  const dbLimitBytes = 500 * 1024 * 1024; // 500 MB (Neon Postgres Free Tier)
  const dbRemainingBytes = Math.max(0, dbLimitBytes - dbSizeBytes);
  const dbUsagePercent = Math.min(100, parseFloat(((dbSizeBytes / dbLimitBytes) * 100).toFixed(2)));

  const totalStorageUsedBytes = templateAssetsBytes + userUploadsBytes + supabaseBucketBytes;
  const storageLimitBytes = 1024 * 1024 * 1024; // 1 GB (Supabase Storage Free Tier)
  const storageRemainingBytes = Math.max(0, storageLimitBytes - totalStorageUsedBytes);
  const storageUsagePercent = Math.min(100, parseFloat(((totalStorageUsedBytes / storageLimitBytes) * 100).toFixed(2)));
  const totalAssetsCount = templateCount + userUploadsCount + supabaseBucketCount;
  const averageAssetSize = totalAssetsCount > 0 ? totalStorageUsedBytes / totalAssetsCount : 0;

  const [
    totalUsers,
    superAdmins,
    admins,
    creators,
    curators,
    suspendedUsers,
    totalMemes,
    publicMemes,
    memeAggregates,
    totalTemplates,
    featuredTemplates,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "SUPER_ADMIN" } }),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.user.count({ where: { role: "CREATOR" } }),
    prisma.user.count({ where: { role: "CURATOR" } }),
    prisma.user.count({ where: { status: "SUSPENDED" } }),
    prisma.meme.count(),
    prisma.meme.count({ where: { isPublic: true } }),
    prisma.meme.aggregate({
      _sum: {
        downloads: true,
        likes: true,
      },
    }),
    prisma.template.count(),
    prisma.template.count({ where: { isFeatured: true } }),
  ]);

  return {
    users: {
      total: totalUsers,
      superAdmins,
      admins,
      creators,
      curators,
      suspended: suspendedUsers,
    },
    memes: {
      total: totalMemes,
      publicCount: publicMemes,
      totalDownloads: memeAggregates._sum.downloads || 0,
      totalLikes: memeAggregates._sum.likes || 0,
    },
    templates: {
      total: totalTemplates,
      featured: featuredTemplates,
    },
    system: {
      dbConnected,
      dbLatencyMs,
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    },
    database: {
      usedBytes: dbSizeBytes,
      usedPretty: formatBytes(dbSizeBytes),
      limitBytes: dbLimitBytes,
      limitPretty: formatBytes(dbLimitBytes),
      usagePercent: dbUsagePercent,
      remainingBytes: dbRemainingBytes,
      remainingPretty: formatBytes(dbRemainingBytes),
      tables: tableSizes,
    },
    storage: {
      usedBytes: totalStorageUsedBytes,
      usedPretty: formatBytes(totalStorageUsedBytes),
      limitBytes: storageLimitBytes,
      limitPretty: formatBytes(storageLimitBytes),
      usagePercent: storageUsagePercent,
      remainingBytes: storageRemainingBytes,
      remainingPretty: formatBytes(storageRemainingBytes),
      totalAssetsCount,
      supabaseBucketName: "memes",
      averageAssetSizePretty: formatBytes(averageAssetSize),
      assetBreakdown: {
        templateAssetsBytes,
        templateAssetsPretty: formatBytes(templateAssetsBytes),
        templateCount,
        userUploadsBytes,
        userUploadsPretty: formatBytes(userUploadsBytes),
        userUploadsCount,
        supabaseBucketBytes,
        supabaseBucketPretty: formatBytes(supabaseBucketBytes),
        supabaseBucketCount,
      },
    },
  };
}

/**
 * Retrieve all users with search and filter
 */
export async function getAllUsers(filter?: { search?: string; role?: string }) {
  const where: any = {};

  if (filter?.search) {
    where.OR = [
      { email: { contains: filter.search, mode: "insensitive" } },
      { name: { contains: filter.search, mode: "insensitive" } },
    ];
  }

  if (filter?.role && filter.role !== "ALL") {
    where.role = filter.role;
  }

  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      avatarUrl: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          memes: true,
          collections: true,
        },
      },
    },
  });

  return users;
}

/**
 * Create a new user or Admin directly
 */
export async function createUserOrAdmin(data: {
  email: string;
  name?: string;
  role: Role;
  actorEmail?: string;
  actorId?: string;
}) {
  const existing = await prisma.user.findUnique({
    where: { email: data.email.toLowerCase().trim() },
  });

  if (existing) {
    throw new Error("A user with this email already exists");
  }

  const user = await prisma.user.create({
    data: {
      email: data.email.toLowerCase().trim(),
      name: data.name || data.email.split("@")[0],
      role: data.role,
      status: "ACTIVE",
    },
  });

  // Log audit action
  await logAuditAction({
    actorId: data.actorId,
    actorEmail: data.actorEmail || "SUPER_ADMIN",
    action: "CREATE_USER",
    targetId: user.id,
    targetType: "USER",
    details: `Created new user ${user.email} with role ${user.role}`,
  });

  return user;
}

/**
 * Change a user's role (Super Admin only can assign Admin or Super Admin)
 */
export async function updateUserRole(params: {
  targetUserId: string;
  newRole: Role;
  actorId?: string;
  actorEmail?: string;
}) {
  const user = await prisma.user.findUnique({
    where: { id: params.targetUserId },
  });

  if (!user) {
    throw new Error("Target user not found");
  }

  const updated = await prisma.user.update({
    where: { id: params.targetUserId },
    data: { role: params.newRole },
  });

  await logAuditAction({
    actorId: params.actorId,
    actorEmail: params.actorEmail || "SUPER_ADMIN",
    action: "ROLE_CHANGE",
    targetId: user.id,
    targetType: "USER",
    details: `Changed role of ${user.email} from ${user.role} to ${params.newRole}`,
  });

  return updated;
}

/**
 * Toggle user status (ACTIVE / SUSPENDED)
 */
export async function updateUserStatus(params: {
  targetUserId: string;
  status: "ACTIVE" | "SUSPENDED";
  actorId?: string;
  actorEmail?: string;
}) {
  const user = await prisma.user.findUnique({
    where: { id: params.targetUserId },
  });

  if (!user) {
    throw new Error("Target user not found");
  }

  const updated = await prisma.user.update({
    where: { id: params.targetUserId },
    data: { status: params.status },
  });

  await logAuditAction({
    actorId: params.actorId,
    actorEmail: params.actorEmail || "SUPER_ADMIN",
    action: params.status === "SUSPENDED" ? "USER_SUSPENDED" : "USER_ACTIVATED",
    targetId: user.id,
    targetType: "USER",
    details: `Updated status of ${user.email} to ${params.status}`,
  });

  return updated;
}

/**
 * Delete a user
 */
export async function deleteUserByAdmin(params: {
  targetUserId: string;
  actorId?: string;
  actorEmail?: string;
}) {
  const user = await prisma.user.findUnique({
    where: { id: params.targetUserId },
  });

  if (!user) {
    throw new Error("Target user not found");
  }

  await prisma.user.delete({
    where: { id: params.targetUserId },
  });

  await logAuditAction({
    actorId: params.actorId,
    actorEmail: params.actorEmail || "SUPER_ADMIN",
    action: "USER_DELETED",
    targetId: params.targetUserId,
    targetType: "USER",
    details: `Permanently deleted user account ${user.email}`,
  });

  return { success: true, deletedEmail: user.email };
}

/**
 * Get all memes for moderation
 */
export async function getAllMemesForAdmin(limit = 50) {
  return await prisma.meme.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      author: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
      template: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
    },
  });
}

/**
 * Delete a meme (moderation action)
 */
export async function deleteMemeByAdmin(params: {
  memeId: string;
  actorId?: string;
  actorEmail?: string;
}) {
  const meme = await prisma.meme.findUnique({
    where: { id: params.memeId },
  });

  if (!meme) {
    throw new Error("Meme not found");
  }

  await prisma.meme.delete({
    where: { id: params.memeId },
  });

  await logAuditAction({
    actorId: params.actorId,
    actorEmail: params.actorEmail || "SUPER_ADMIN",
    action: "MEME_MODERATED_DELETE",
    targetId: params.memeId,
    targetType: "MEME",
    details: `Deleted meme "${meme.title}" (ID: ${meme.id}) by author ID ${meme.authorId}`,
  });

  return { success: true };
}

/**
 * Get recent audit logs
 */
export async function getAuditLogs(limit = 30) {
  return await prisma.auditLog.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Log an action into the audit trail
 */
export async function logAuditAction(params: {
  actorId?: string;
  actorEmail?: string;
  action: string;
  targetId?: string;
  targetType?: string;
  details?: string;
  ipAddress?: string;
}) {
  try {
    return await prisma.auditLog.create({
      data: {
        actorId: params.actorId,
        actorEmail: params.actorEmail || "SUPER_ADMIN",
        action: params.action,
        targetId: params.targetId,
        targetType: params.targetType,
        details: params.details,
        ipAddress: params.ipAddress || "127.0.0.1",
      },
    });
  } catch (err) {
    console.error("Failed to write audit log:", err);
  }
}
