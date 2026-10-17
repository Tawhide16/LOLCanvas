import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Global fallback cache in case DB AuditLog is used or memory holds current config
let inMemoryConfig = {
  logoUrl: "/logo-icon.png",
  logoText: "LOLCANVAS",
  logoTag: "®",
  updatedAt: new Date().toISOString(),
};

export async function GET() {
  try {
    // Attempt to read the latest LOGO_CONFIG audit log from database
    const latestConfigLog = await prisma.auditLog.findFirst({
      where: { action: "SITE_LOGO_UPDATE" },
      orderBy: { createdAt: "desc" },
    });

    if (latestConfigLog && latestConfigLog.details) {
      try {
        const parsed = JSON.parse(latestConfigLog.details);
        return NextResponse.json({
          success: true,
          data: {
            ...inMemoryConfig,
            ...parsed,
          },
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
    const { logoUrl, logoText, logoTag, adminEmail } = body;

    // Verify admin
    const isAdmin =
      adminEmail?.toLowerCase() === "admin123@gmail.com" ||
      body.role === "SUPER_ADMIN" ||
      body.role === "ADMIN";

    if (!isAdmin && process.env.NODE_ENV === "production") {
      // In production enforce admin email
      if (adminEmail?.toLowerCase() !== "admin123@gmail.com") {
        return NextResponse.json(
          { error: "Unauthorized: Super Admin access required." },
          { status: 403 }
        );
      }
    }

    const updatedConfig = {
      logoUrl: logoUrl || "/logo-icon.png",
      logoText: (logoText || "LOLCANVAS").trim().toUpperCase(),
      logoTag: logoTag !== undefined ? logoTag : "®",
      updatedAt: new Date().toISOString(),
      updatedBy: adminEmail || "admin123@gmail.com",
    };

    inMemoryConfig = updatedConfig;

    // Persist to AuditLog table so it survives server restarts
    try {
      await prisma.auditLog.create({
        data: {
          actorEmail: adminEmail || "admin123@gmail.com",
          action: "SITE_LOGO_UPDATE",
          targetType: "SYSTEM",
          details: JSON.stringify(updatedConfig),
        },
      });
    } catch (dbErr) {
      console.warn("Could not record site logo to DB audit log:", dbErr);
    }

    return NextResponse.json({
      success: true,
      message: "Site logo updated successfully.",
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
