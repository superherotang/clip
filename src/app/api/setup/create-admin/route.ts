import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, generateApiKey, createSession } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    if (username.length < 3) {
      return NextResponse.json(
        { error: "Username must be at least 3 characters" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Check if admin already exists
    const existingAdmin = await prisma.user.count({
      where: { role: "admin" }
    });

    if (existingAdmin > 0) {
      return NextResponse.json(
        { error: "Admin already exists" },
        { status: 403 }
      );
    }

    // Check if username is taken
    const existingUser = await prisma.user.findUnique({
      where: { username }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 400 }
      );
    }

    // Create admin user
    const hashedPassword = await hashPassword(password);
    const admin = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        apiKey: await generateApiKey(),
        role: "admin",
      }
    });

    // Create session
    const token = await createSession({
      id: admin.id,
      username: admin.username,
      email: "",
      role: admin.role,
    });

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return NextResponse.json({
      success: true,
      user: {
        id: admin.id,
        username: admin.username,
        role: admin.role,
      }
    });
  } catch (error) {
    console.error("Error creating admin:", error);
    return NextResponse.json(
      { error: "Failed to create admin user" },
      { status: 500 }
    );
  }
}
