import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { generateRoomCode } from "@/lib/room";

// GET /api/rooms - Get all rooms for the current user
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated" },
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
      ...membership.room,
      role: membership.role,
      memberCount: membership.room._count.members,
      clipboardCount: membership.room._count.clipboard,
      _count: undefined, // Remove the _count field
    }));

    return NextResponse.json({ rooms });
  } catch (error) {
    console.error("Get rooms error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/rooms - Create a new room
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { name, description } = await request.json();

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
  } catch (error) {
    console.error("Create room error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
