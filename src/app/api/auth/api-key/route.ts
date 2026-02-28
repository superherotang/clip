import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, generateApiKey } from "@/lib/auth";

export async function POST() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Generate new API key
    const newApiKey = await generateApiKey();

    // Update user's API key
    await prisma.user.update({
      where: { id: session.userId },
      data: { apiKey: newApiKey },
    });

    return NextResponse.json({
      apiKey: newApiKey,
      message: "API key regenerated successfully",
    });
  } catch (error) {
    console.error("Regenerate API key error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { apiKey: true },
    });

    return NextResponse.json({ apiKey: user?.apiKey });
  } catch (error) {
    console.error("Get API key error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
