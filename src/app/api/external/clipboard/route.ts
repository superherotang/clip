import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateApiKey } from "@/lib/auth";
import { encrypt, decrypt, encryptObject, decryptObject } from "@/lib/encryption";

// Middleware to validate API key from Authorization header
async function validateAuth(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const apiKey = authHeader.substring(7);
  return await validateApiKey(apiKey);
}

// GET /api/external/clipboard - Get clipboard items
export async function GET(request: NextRequest) {
  try {
    const session = await validateAuth(request);
    if (!session) {
      return NextResponse.json(
        { error: "Invalid or missing API key" },
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
      id: item.id,
      type: item.type,
      content: item.type === "text" ? decrypt(item.content) : item.content,
      title: item.title,
      category: item.category,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      createdBy: item.user.username,
    }));

    return NextResponse.json({ items: decryptedItems });
  } catch (error) {
    console.error("External API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/external/clipboard - Create clipboard item
export async function POST(request: NextRequest) {
  try {
    const session = await validateAuth(request);
    if (!session) {
      return NextResponse.json(
        { error: "Invalid or missing API key" },
        { status: 401 }
      );
    }

    const { roomId, type, content, title, category } = await request.json();

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
    const encryptedContent = type === "text" ? encrypt(content) : content;

    // Create clipboard item
    const item = await prisma.clipboardItem.create({
      data: {
        roomId,
        userId: session.userId,
        type,
        content: encryptedContent,
        title,
        category,
      },
    });

    return NextResponse.json({
      id: item.id,
      type: item.type,
      content: type === "text" ? content : item.content,
      title: item.title,
      category: item.category,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    });
  } catch (error) {
    console.error("External API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/external/clipboard - Delete clipboard item
export async function DELETE(request: NextRequest) {
  try {
    const session = await validateAuth(request);
    if (!session) {
      return NextResponse.json(
        { error: "Invalid or missing API key" },
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
    console.error("External API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
