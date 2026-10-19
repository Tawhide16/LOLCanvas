import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const DEFAULT_SITE_CONFIG = {
  // Brand & Logo
  logoUrl: "/logo-icon.png",
  logoText: "LOLCANVAS",
  logoTag: "®",

  // Top Bar & Navbar
  topBarTitle: "LOLCANVAS® ARCHIVE",
  topBarBadge: "100% WATERMARK-FREE",
  topBarEmail: "DESK@LOLCANVAS.STUDIO",

  // Home Hero Banner
  heroBadge: "OPEN MEME ARCHIVE & CANVAS ENGINE",
  heroTitle1: "MEMES THAT",
  heroTitle2: "MAKE NOISE.",
  heroSubtitle:
    "Editorial, watermark-free template archive and in-browser canvas editor. Clean PNG exports without forced stamps.",
  heroMetric1Label: "TEMPLATES",
  heroMetric1Value: "26+",
  heroMetric2Label: "WATERMARKS",
  heroMetric2Value: "0%",
  heroMetric3Label: "TAXONOMIES",
  heroMetric3Value: "08",
  heroMetric4Label: "EXPORT",
  heroMetric4Value: "LOCAL",
  manifestoTag: "STUDIO MANIFESTO",
  manifestoQuote: "GOOD MEMES AREN’T JUST FUNNY. THEY ARE CULTURE.",

  // Submission Callout Strip
  submissionBadge: "PUBLIC COMMONS",
  submissionTitle: "SUBMIT TO THE ARCHIVE.",
  submissionSubtitle:
    "Join verified creators uploading watermark-free formats. Every contribution is reviewed, standardized, and made available freely.",

  // Categories Page (/collection)
  collectionTag: "CATEGORIES (01–08)",
  collectionTitle: "CATEGORY INDEX.",
  collectionSubtitle:
    "Explore curated meme taxonomy archives with real-time community uploaded card references and suggestions ready for the canvas editor.",

  // Catalog / Cards Page (/cards)
  catalogTag: "TEMPLATE REPOSITORY",
  catalogTitle: "ARCHIVE CATALOG.",
  catalogSubtitle: "100% UNMARKED ASSETS",

  // Contact Page (/contact)
  contactTag: "COMMUNICATION DESK",
  contactTitle: "CONTACT DESK.",
  contactSubtitle:
    "Report bugs, request features, submit templates, or reach the engineering team.",
  contactEmail: "DESK@LOLCANVAS.STUDIO",
  bugsEmail: "BUGS@LOLCANVAS.STUDIO",

  // Footer
  footerDescription:
    "Editorial, watermark-free meme template archive and in-browser canvas editor.",
  footerCopyright: "© 2026 LOLCANVAS ARCHIVE PROJECT",
  footerStatus: "OPERATIONAL",

  // Developer Profile & About
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
      ...customContent
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
      ...customContent,
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
      message: "Site configuration and website text content updated successfully across all roles.",
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
