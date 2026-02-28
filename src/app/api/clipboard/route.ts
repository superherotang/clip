import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { encrypt, decrypt, encryptObject, decryptObject } from "@/lib/encryption";

// GET /api/clipboard - Get all clipboard items for a room
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const roomId = searchParams.get("roomId");

    if (!roomId) {
      return NextResponse.json(
        { error: "Room ID is required" },
        { status: 400 }
      );
    }

    // Check if user is a member of the room
    const membership = await prisma.roomMember.findUnique({
      where: {
        userId_roomId: {
          userId: session.userId,
          roomId,
        },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Access denied to this room" },
        { status: 403 }
      );
    }

    // Get clipboard items
    const items = await prisma.clipboardItem.findMany({
      where: { roomId },
      include: {
        user: {
          select: { username: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Decrypt content
    const decryptedItems = items.map((item) => ({
      ...item,
      content: item.type === "text" ? decrypt(item.content) : item.content,
      meta: item.meta ? decryptObject<Record<string, unknown>>(item.meta) : null,
    }));

    return NextResponse.json({ items: decryptedItems });
  } catch (error) {
    console.error("Get clipboard error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/clipboard - Create a new clipboard item
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { roomId, type, content, title, category, meta } =
      await request.json();

    if (!roomId || !type || !content) {
      return NextResponse.json(
        { error: "Room ID, type, and content are required" },
        { status: 400 }
      );
    }

    // Check if user is a member of the room
    const membership = await prisma.roomMember.findUnique({
      where: {
        userId_roomId: {
          userId: session.userId,
          roomId,
        },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Access denied to this room" },
        { status: 403 }
      );
    }

    // Encrypt content
    const encryptedContent =
      type === "text" ? encrypt(content) : content; // Files are stored as paths
    const encryptedMeta = meta ? encryptObject(meta) : null;

    // Create clipboard item
    const item = await prisma.clipboardItem.create({
      data: {
        roomId,
        userId: session.userId,
        type,
        content: encryptedContent,
        title,
        category,
        meta: encryptedMeta,
      },
      include: {
        user: {
          select: { username: true },
        },
      },
    });

    return NextResponse.json({
      ...item,
      content: type === "text" ? content : item.content,
      meta: meta || null,
    });
  } catch (error) {
    console.error("Create clipboard error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/clipboard - Delete a clipboard item
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const itemId = searchParams.get("id");

    if (!itemId) {
      return NextResponse.json(
        { error: "Item ID is required" },
        { status: 400 }
      );
    }

    // Get the item
    const item = await prisma.clipboardItem.findUnique({
      where: { id: itemId },
      include: { room: true },
    });

    if (!item) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      );
    }

    // Check if user is a member of the room
    const membership = await prisma.roomMember.findUnique({
      where: {
        userId_roomId: {
          userId: session.userId,
          roomId: item.roomId,
        },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Access denied to this room" },
        { status: 403 }
      );
    }

    // Delete the item
    await prisma.clipboardItem.delete({
      where: { id: itemId },
    });

    return NextResponse.json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("Delete clipboard error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/clipboard - Update a clipboard item
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { id, content, title, category } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Item ID is required" },
        { status: 400 }
      );
    }

    // Get the item
    const item = await prisma.clipboardItem.findUnique({
      where: { id },
    });

    if (!item) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      );
    }

    // Check if user is a member of the room
    const membership = await prisma.roomMember.findUnique({
      where: {
        userId_roomId: {
          userId: session.userId,
          roomId: item.roomId,
        },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Access denied to this room" },
        { status: 403 }
      );
    }

    // Update the item
    const updateData: Record<string, unknown> = {};
    if (content !== undefined) {
      updateData.content = item.type === "text" ? encrypt(content) : content;
    }
    if (title !== undefined) {
      updateData.title = title;
    }
    if (category !== undefined) {
      updateData.category = category;
    }

    const updatedItem = await prisma.clipboardItem.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: { username: true },
        },
      },
    });

    return NextResponse.json({
      ...updatedItem,
      content: item.type === "text" ? (content as string) : updatedItem.content,
    });
  } catch (error) {
    console.error("Update clipboard error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
