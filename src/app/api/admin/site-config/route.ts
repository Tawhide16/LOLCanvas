import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const DEFAULT_SITE_CONFIG = {
  logoUrl: "/logo-icon.png",
  logoText: "LOLCANVAS",
  logoTag: "®",
  developerProfile: {
    name: "Tawhid",
    role: "Lead Full-Stack Software Engineer & Creator",
    avatarUrl: "/developer.jpg",
    githubUrl: "https://github.com/Tawhide16",
    portfolioUrl: "https://my-protfulio-eight.vercel.app/",
    bio: "Passionate full-stack software engineer building fast, responsive, and scalable web applications. Creator and architect of LOLCanvas — engineered from scratch with Next.js 16, React 19, TypeScript, and HTML5 Canvas to give creators an editorial, zero-watermark meme publishing engine.",
    skills: [
      "Next.js 16 / React 19",
      "TypeScript",
      "PostgreSQL & Prisma",
      "HTML5 Canvas 2D Engine",
      "Full-Stack Web Architecture",
      "Tailwind & Modern CSS",
    ],
  },
  aboutContent: {
    charterTag: "STUDIO CHARTER",
    title: "STUDIO MANIFESTO.",
    manifestoHeadline: "SWISS PRECISION FOR DIGITAL MEMES.",
    manifestoDescription:
      "Memes are modern culture. LOLCanvas delivers watermark-free templates rendered through a clean architectural grid, fast in-browser vector stages, and instant PNG exports without forced logos or sign-up paywalls.",
    corePrinciple: "GOOD MEMES AREN'T JUST FUNNY. THEY ARE CULTURE.",
  },
  updatedAt: new Date().toISOString(),
};

// Global memory cache
let inMemoryConfig = { ...DEFAULT_SITE_CONFIG };

export async function GET() {
  try {
    // Read the latest SITE_CONFIG_UPDATE or SITE_LOGO_UPDATE from database
    const latestConfigLog = await prisma.auditLog.findFirst({
      where: { action: { in: ["SITE_CONFIG_UPDATE", "SITE_LOGO_UPDATE"] } },
      orderBy: { createdAt: "desc" },
    });

    if (latestConfigLog && latestConfigLog.details) {
      try {
        const parsed = JSON.parse(latestConfigLog.details);
        const merged = {
          ...DEFAULT_SITE_CONFIG,
          ...inMemoryConfig,
          ...parsed,
          developerProfile: {
            ...DEFAULT_SITE_CONFIG.developerProfile,
            ...(inMemoryConfig.developerProfile || {}),
            ...(parsed.developerProfile || {}),
          },
          aboutContent: {
            ...DEFAULT_SITE_CONFIG.aboutContent,
            ...(inMemoryConfig.aboutContent || {}),
            ...(parsed.aboutContent || {}),
          },
        };
        inMemoryConfig = merged;
        return NextResponse.json({
          success: true,
          data: merged,
        });
      } catch (e) {}
    }

    return NextResponse.json({
      success: true,
      data: inMemoryConfig,
    });
  } catch (error) {
    return NextResponse.json({
      success: true,
      data: inMemoryConfig,
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      logoUrl,
      logoText,
      logoTag,
      developerProfile,
      aboutContent,
      adminEmail,
    } = body;

    // Verify admin privileges
    const isAdmin =
      adminEmail?.toLowerCase() === "admin123@gmail.com" ||
      body.role === "SUPER_ADMIN" ||
      body.role === "ADMIN";

    if (!isAdmin && process.env.NODE_ENV === "production") {
      if (adminEmail?.toLowerCase() !== "admin123@gmail.com") {
        return NextResponse.json(
          { error: "Unauthorized: Super Admin access required." },
          { status: 403 }
        );
      }
    }

    // Merge updates
    const updatedConfig = {
      ...inMemoryConfig,
      ...(logoUrl ? { logoUrl } : {}),
      ...(logoText ? { logoText: logoText.trim().toUpperCase() } : {}),
      ...(logoTag !== undefined ? { logoTag } : {}),
      developerProfile: {
        ...inMemoryConfig.developerProfile,
        ...(developerProfile || {}),
      },
      aboutContent: {
        ...inMemoryConfig.aboutContent,
        ...(aboutContent || {}),
      },
      updatedAt: new Date().toISOString(),
      updatedBy: adminEmail || "admin123@gmail.com",
    };

    inMemoryConfig = updatedConfig;

    // Persist to PostgreSQL AuditLog table so it is globally available to all users & roles
    try {
      await prisma.auditLog.create({
        data: {
          actorEmail: adminEmail || "admin123@gmail.com",
          action: "SITE_CONFIG_UPDATE",
          targetType: "SYSTEM",
          details: JSON.stringify(updatedConfig),
        },
      });
    } catch (dbErr) {
      console.warn("Could not record site config to DB audit log:", dbErr);
    }

    return NextResponse.json({
      success: true,
      message: "Site configuration & about page updated successfully across all roles.",
      data: updatedConfig,
    });
  } catch (err: any) {
    console.error("Site config update error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to update site configuration" },
      { status: 500 }
    );
  }
}
