import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateApiKey } from "@/lib/auth";

// Middleware to validate API key from Authorization header
async function validateAuth(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const apiKey = authHeader.substring(7);
  return await validateApiKey(apiKey);
}

// GET /api/external/rooms - Get all rooms for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const session = await validateAuth(request);
    if (!session) {
      return NextResponse.json(
        { error: "Invalid or missing API key" },
        { status: 401 }
      );
    }

    // Get all rooms where user is a member
    const memberships = await prisma.roomMember.findMany({
      where: { userId: session.userId },
      include: {
        room: {
          include: {
            owner: {
              select: { username: true },
            },
            _count: {
              select: {
                members: true,
                clipboard: true,
              },
            },
          },
        },
      },
    });

    const rooms = memberships.map((membership) => ({
      id: membership.room.id,
      name: membership.room.name,
      description: membership.room.description,
      code: membership.room.code,
      role: membership.role,
      memberCount: membership.room._count.members,
      clipboardCount: membership.room._count.clipboard,
      createdAt: membership.room.createdAt,
      updatedAt: membership.room.updatedAt,
    }));

    return NextResponse.json({ rooms });
  } catch (error) {
    console.error("External API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
