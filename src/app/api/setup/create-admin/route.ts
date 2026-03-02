import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, generateApiKey, createSession } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    console.log("=== Creating admin user ===");
    const { username, password } = await request.json();
    console.log("Username:", username);

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
    console.log("Checking if admin exists...");
    const existingAdmin = await prisma.user.count({
      where: { role: "admin" }
    });
    console.log("Existing admin count:", existingAdmin);

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
    console.log("Hashing password...");
    const hashedPassword = await hashPassword(password);
    console.log("Creating admin user in database...");
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
    // Log more details for debugging
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return NextResponse.json(
      {
        error: "Failed to create admin user",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
