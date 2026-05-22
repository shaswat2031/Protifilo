import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import dbConnect from "@/lib/db";
import { AssetImage } from "@/models/Portfolio";

const AUTH_COOKIE_NAME = "auth_token";
const SESSION_VALUE = "authenticated_jahnvi_session_token";

// Middleware to verify session
async function verifySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME);
  return token && token.value === SESSION_VALUE;
}

export async function POST(request) {
  try {
    // 1. Guard check
    const isAuthenticated = await verifySession();
    if (!isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // 2. Parse form data
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // 3. Read buffer and convert to Base64
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Data = buffer.toString("base64");
    const contentType = file.type || "image/jpeg";

    // 4. Generate unique key
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, "_").toLowerCase();
    const key = `upload_${Date.now()}_${cleanFileName}`;

    // 5. Save to MongoDB
    const newAsset = new AssetImage({
      key,
      data: base64Data,
      contentType,
    });
    await newAsset.save();

    // 6. Return response with Served Path
    return NextResponse.json({
      success: true,
      key,
      url: `/api/images/${key}`,
    });
  } catch (error) {
    console.error("Upload API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
