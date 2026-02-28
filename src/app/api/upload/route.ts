import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const roomId = formData.get("roomId") as string;
    const type = formData.get("type") as "image" | "file";

    if (!file) {
      return NextResponse.json(
        { error: "File is required" },
        { status: 400 }
      );
    }

    if (!roomId) {
      return NextResponse.json(
        { error: "Room ID is required" },
        { status: 400 }
      );
    }

    if (!type || (type !== "image" && type !== "file")) {
      return NextResponse.json(
        { error: "Type must be 'image' or 'file'" },
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

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "public", "uploads", roomId);
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const fileExtension = file.name.split(".").pop() || "";
    const filename = `${uuidv4()}.${fileExtension}`;
    const filepath = join(uploadsDir, filename);

    // Convert file to buffer and write to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Create clipboard item
    const filePath = `/uploads/${roomId}/${filename}`;
    const item = await prisma.clipboardItem.create({
      data: {
        roomId,
        userId: session.userId,
        type,
        content: filePath,
        title: file.name,
        meta: JSON.stringify({
          originalName: file.name,
          mimeType: file.type,
          size: file.size,
        }),
      },
      include: {
        user: {
          select: { username: true },
        },
      },
    });

    return NextResponse.json({
      ...item,
      meta: {
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
