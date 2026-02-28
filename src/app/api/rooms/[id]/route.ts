import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/rooms/[id] - Get room details
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Get room
    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        owner: {
          select: { username: true },
        },
        members: {
          include: {
            user: {
              select: { username: true },
            },
          },
        },
        _count: {
          select: {
            clipboard: true,
          },
        },
      },
    });

    if (!room) {
      return NextResponse.json(
        { error: "Room not found" },
        { status: 404 }
      );
    }

    // Check if user is a member
    const membership = await prisma.roomMember.findUnique({
      where: {
        userId_roomId: {
          userId: session.userId,
          roomId: id,
        },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Access denied to this room" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      ...room,
      role: membership.role,
      memberCount: room.members.length,
      clipboardCount: room._count.clipboard,
      _count: undefined,
    });
  } catch (error) {
    console.error("Get room error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/rooms/[id] - Delete a room
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Get room
    const room = await prisma.room.findUnique({
      where: { id },
    });

    if (!room) {
      return NextResponse.json(
        { error: "Room not found" },
        { status: 404 }
      );
    }

    // Check if user is the owner
    if (room.ownerId !== session.userId) {
      return NextResponse.json(
        { error: "Only the room owner can delete this room" },
        { status: 403 }
      );
    }

    // Delete room
    await prisma.room.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Room deleted successfully" });
  } catch (error) {
    console.error("Delete room error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/rooms/[id] - Leave a room
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const { action } = await request.json();

    if (action === "leave") {
      // Get room
      const room = await prisma.room.findUnique({
        where: { id },
      });

      if (!room) {
        return NextResponse.json(
          { error: "Room not found" },
          { status: 404 }
        );
      }

      // Check if user is the owner
      if (room.ownerId === session.userId) {
        return NextResponse.json(
          { error: "Room owner cannot leave. Delete the room instead." },
          { status: 400 }
        );
      }

      // Leave room
      await prisma.roomMember.delete({
        where: {
          userId_roomId: {
            userId: session.userId,
            roomId: id,
          },
        },
      });

      return NextResponse.json({ message: "Left room successfully" });
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Leave room error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
