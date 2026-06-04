export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { AssetImage } from "@/models/Portfolio";

export const dynamic = "force-dynamic";

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

    // Return binary response with correct Content-Type and caching headers.
    // Using must-revalidate + ETag so the browser always picks up new uploads
    // instead of serving stale cached images from a previous upload.
    const etag = `"${img._id?.toString() || img.key}"`;
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": img.contentType || "image/jpeg",
        "Content-Length": buffer.length.toString(),
        "Cache-Control": "public, max-age=3600, must-revalidate",
        "ETag": etag,
      },
    });
  } catch (error) {
    console.error("Error serving image:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
