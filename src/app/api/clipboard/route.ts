import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { encrypt, decrypt, encryptObject, decryptObject } from "@/lib/encryption";

// POST /api/clipboard - Unified endpoint for all clipboard operations
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
    const { action, roomId, itemId, id, type, content, title, category, meta } = body;

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
        ...item,
        content: item.type === "text" ? decrypt(item.content) : item.content,
        meta: item.meta ? decryptObject<Record<string, unknown>>(item.meta) : null,
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
    }

    // UPDATE item
    if (action === "update") {
      const updateId = id || itemId;
      if (!updateId) {
        return NextResponse.json(
          { error: "Item ID is required" },
          { status: 400 }
        );
      }

      // Get the item
      const item = await prisma.clipboardItem.findUnique({
        where: { id: updateId },
        select: { id: true, roomId: true, type: true },
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
        where: { id: updateId },
        data: updateData,
        select: {
          id: true,
          type: true,
          content: true,
          title: true,
          category: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: { username: true },
          },
        },
      });

      return NextResponse.json({
        ...updatedItem,
        content: item.type === "text" ? content : updatedItem.content,
      });
    }

    // DELETE item
    if (action === "delete") {
      const deleteId = id || itemId;
      console.log("[POST /api/clipboard] Starting delete operation");

      if (!deleteId) {
        console.log("[POST /api/clipboard] No item ID provided");
        return NextResponse.json(
          { error: "Item ID is required" },
          { status: 400 }
        );
      }

      console.log("[POST /api/clipboard] Item ID:", deleteId);
      console.log("[POST /api/clipboard] User ID:", session.userId);

      // Get the item (only select fields we need)
      const item = await prisma.clipboardItem.findUnique({
        where: { id: deleteId },
        select: { id: true, roomId: true },
      });

      if (!item) {
        console.log("[POST /api/clipboard] Item not found:", deleteId);
        return NextResponse.json(
          { error: "Item not found" },
          { status: 404 }
        );
      }

      console.log("[POST /api/clipboard] Item found, room ID:", item.roomId);

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
        console.log("[POST /api/clipboard] User is not a member of room:", item.roomId);
        return NextResponse.json(
          { error: "Access denied to this room" },
          { status: 403 }
        );
      }

      console.log("[POST /api/clipboard] User is member, deleting item");

      // Delete the item with timeout protection
      const deletePromise = prisma.clipboardItem.delete({
        where: { id: deleteId },
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Delete operation timeout")), 10000)
      );

      await Promise.race([deletePromise, timeoutPromise]);

      console.log("[POST /api/clipboard] Item deleted successfully");
      return NextResponse.json({ message: "Item deleted successfully" });
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("[POST /api/clipboard] Error:", error);
    if (error instanceof Error) {
      console.error("[POST /api/clipboard] Error message:", error.message);
      console.error("[POST /api/clipboard] Error stack:", error.stack);
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
