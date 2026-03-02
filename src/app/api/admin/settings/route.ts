import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, getSystemSettings } from "@/lib/auth";

// GET - Fetch current settings (admin only)
export async function GET() {
  try {
    await requireAdmin();

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
  } catch (error: any) {
    if (error.message === "Admin access required") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// PUT - Update settings (admin only)
export async function PUT(request: Request) {
  try {
    await requireAdmin();

    const data = await request.json();
    const {
      allowRegistration,
      siteName,
      siteDescription,
      maxRoomsPerUser,
      maxClipboardItems,
    } = data;

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
  } catch (error: any) {
    if (error.message === "Admin access required") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
