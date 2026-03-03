import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { generateRoomCode } from "@/lib/room";

// POST /api/rooms - Unified endpoint for all room operations
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, name, description } = body;

    if (!action) {
      return NextResponse.json(
        { error: "Action is required" },
        { status: 400 }
      );
    }

    // LIST rooms
    if (action === "list") {
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
        ...membership.room,
        role: membership.role,
        memberCount: membership.room._count.members,
        clipboardCount: membership.room._count.clipboard,
        _count: undefined, // Remove the _count field
      }));

      return NextResponse.json({ rooms });
    }

    // CREATE room
    if (action === "create") {
      if (!name) {
        return NextResponse.json(
          { error: "Room name is required" },
          { status: 400 }
        );
      }

      // Generate unique room code
      let roomCode = generateRoomCode();
      let existingRoom = await prisma.room.findUnique({
        where: { code: roomCode },
      });

      while (existingRoom) {
        roomCode = generateRoomCode();
        existingRoom = await prisma.room.findUnique({
          where: { code: roomCode },
        });
      }

      // Create room
      const room = await prisma.room.create({
        data: {
          name,
          description,
          code: roomCode,
          ownerId: session.userId,
          members: {
            create: {
              userId: session.userId,
              role: "owner",
            },
          },
        },
        include: {
          owner: {
            select: { username: true },
          },
        },
      });

      return NextResponse.json({
        ...room,
        role: "owner",
        memberCount: 1,
        clipboardCount: 0,
      });
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Room API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
