import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, getSystemSettings } from "@/lib/auth";

// POST - Unified endpoint for settings operations (admin only)
export async function POST(request: Request) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { action, allowRegistration, siteName, siteDescription, maxRoomsPerUser, maxClipboardItems } = body;

    if (!action) {
      return NextResponse.json(
        { error: "Action is required" },
        { status: 400 }
      );
    }

    // GET settings
    if (action === "get") {
      const settings = await prisma.systemSettings.findUnique({
        where: { id: "site" }
      });

      if (!settings) {
        // Create default settings
        const defaultSettings = await prisma.systemSettings.create({
          data: { id: "site" }
        });
        return NextResponse.json(defaultSettings);
      }

      return NextResponse.json(settings);
    }

    // UPDATE settings
    if (action === "update") {
      // Validate input
      if (typeof allowRegistration !== "boolean") {
        return NextResponse.json(
          { error: "allowRegistration must be a boolean" },
          { status: 400 }
        );
      }

      if (typeof siteName !== "string" || siteName.length === 0) {
        return NextResponse.json(
          { error: "siteName is required" },
          { status: 400 }
        );
      }

      if (typeof maxRoomsPerUser !== "number" || maxRoomsPerUser < 1) {
        return NextResponse.json(
          { error: "maxRoomsPerUser must be a positive number" },
          { status: 400 }
        );
      }

      if (typeof maxClipboardItems !== "number" || maxClipboardItems < 1) {
        return NextResponse.json(
          { error: "maxClipboardItems must be a positive number" },
          { status: 400 }
        );
      }

      // Update settings
      const settings = await prisma.systemSettings.update({
        where: { id: "site" },
        data: {
          allowRegistration,
          siteName,
          siteDescription: siteDescription || null,
          maxRoomsPerUser,
          maxClipboardItems,
        }
      });

      return NextResponse.json(settings);
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (error: any) {
    if (error.message === "Admin access required") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }
    console.error("Settings API error:", error);
    return NextResponse.json(
      { error: "Failed to process settings request" },
      { status: 500 }
    );
  }
}
