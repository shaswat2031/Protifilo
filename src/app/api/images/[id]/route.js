import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { AssetImage } from "@/models/Portfolio";

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id) {
      return new NextResponse("Image key is required", { status: 400 });
    }

    // Query by key (e.g., "1.png", "10.jpeg")
    const img = await AssetImage.findOne({ key: id });

    if (!img) {
      return new NextResponse("Image not found", { status: 404 });
    }

    // Decode Base64 data to Binary Buffer
    const buffer = Buffer.from(img.data, "base64");

    // Return binary response with correct Content-Type and browser caching headers
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": img.contentType || "image/jpeg",
        "Content-Length": buffer.length.toString(),
        "Cache-Control": "public, max-age=31536000, immutable", // Cache for 1 year
      },
    });
  } catch (error) {
    console.error("Error serving image:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
