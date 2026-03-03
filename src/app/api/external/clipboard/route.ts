import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateApiKey } from "@/lib/auth";
import { encrypt, decrypt } from "@/lib/encryption";

// Middleware to validate API key from Authorization header
async function validateAuth(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const apiKey = authHeader.substring(7);
  return await validateApiKey(apiKey);
}

// POST /api/external/clipboard - Unified endpoint for all clipboard operations
export async function POST(request: NextRequest) {
  try {
    const session = await validateAuth(request);
    if (!session) {
      return NextResponse.json(
        { error: "Invalid or missing API key" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, roomId, itemId, id, type, content, title, category } = body;

    if (!action) {
      return NextResponse.json(
        { error: "Action is required" },
        { status: 400 }
      );
    }

    // GET items
    if (action === "list") {
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
    }

    // CREATE item
    if (action === "create") {
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
    }

    // DELETE item
    if (action === "delete") {
      const deleteId = id || itemId;
      console.log("[POST /api/external/clipboard] Starting delete operation");

      if (!deleteId) {
        console.log("[POST /api/external/clipboard] No item ID provided");
        return NextResponse.json(
          { error: "Item ID is required" },
          { status: 400 }
        );
      }

      console.log("[POST /api/external/clipboard] Item ID:", deleteId);
      console.log("[POST /api/external/clipboard] User ID:", session.userId);

      // Get the item (only select fields we need)
      const item = await prisma.clipboardItem.findUnique({
        where: { id: deleteId },
        select: { id: true, roomId: true },
      });

      if (!item) {
        console.log("[POST /api/external/clipboard] Item not found:", deleteId);
        return NextResponse.json(
          { error: "Item not found" },
          { status: 404 }
        );
      }

      console.log("[POST /api/external/clipboard] Item found, room ID:", item.roomId);

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
        console.log("[POST /api/external/clipboard] User is not a member of room:", item.roomId);
        return NextResponse.json(
          { error: "Access denied to this room" },
          { status: 403 }
        );
      }

      console.log("[POST /api/external/clipboard] User is member, deleting item");

      // Delete the item with timeout protection
      const deletePromise = prisma.clipboardItem.delete({
        where: { id: deleteId },
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Delete operation timeout")), 10000)
      );

      await Promise.race([deletePromise, timeoutPromise]);

      console.log("[POST /api/external/clipboard] Item deleted successfully");
      return NextResponse.json({ message: "Item deleted successfully" });
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("[POST /api/external/clipboard] Error:", error);
    if (error instanceof Error) {
      console.error("[POST /api/external/clipboard] Error message:", error.message);
      console.error("[POST /api/external/clipboard] Error stack:", error.stack);
    }
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
