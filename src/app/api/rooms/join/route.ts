import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// POST /api/rooms/join - Join a room using room code
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: "Room code is required" },
        { status: 400 }
      );
    }

    // Find room by code
    const room = await prisma.room.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!room) {
      return NextResponse.json(
        { error: "Invalid room code" },
        { status: 404 }
      );
    }

    // Check if already a member
    const existingMembership = await prisma.roomMember.findUnique({
      where: {
        userId_roomId: {
          userId: session.userId,
          roomId: room.id,
        },
      },
    });

    if (existingMembership) {
      return NextResponse.json(
        { error: "You are already a member of this room" },
        { status: 400 }
      );
    }

    // Add user to room
    const membership = await prisma.roomMember.create({
      data: {
        userId: session.userId,
        roomId: room.id,
        role: "member",
      },
    });

    return NextResponse.json({
      message: "Joined room successfully",
      roomId: room.id,
      roomName: room.name,
      membershipId: membership.id,
    });
  } catch (error) {
    console.error("Join room error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
