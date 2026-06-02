import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import dbConnect from "@/lib/db";
import { ContactMessage } from "@/models/Portfolio";

const AUTH_COOKIE_NAME = "auth_token";
const SESSION_VALUE = "authenticated_jahnvi_session_token";

// Helper to check authentication
async function verifySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME);
  return token && token.value === SESSION_VALUE;
}

// GET all contact messages (Admin only)
export async function GET() {
  try {
    const isAuthenticated = await verifySession();
    if (!isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const messages = await ContactMessage.find().sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error("GET Contact messages error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE a contact message (Admin only)
export async function DELETE(request) {
  try {
    const isAuthenticated = await verifySession();
    if (!isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Message ID is required" }, { status: 400 });
    }

    await ContactMessage.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Message deleted successfully."
    });
  } catch (error) {
    console.error("DELETE Contact message error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

// PATCH a contact message (mark as read/unread - Admin only)
export async function PATCH(request) {
  try {
    const isAuthenticated = await verifySession();
    if (!isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { id, read } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Message ID is required" }, { status: 400 });
    }

    const updated = await ContactMessage.findByIdAndUpdate(
      id,
      { read },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      data: updated
    });
  } catch (error) {
    console.error("PATCH Contact message error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { name, email, organization, inquiryType, subject, message } = body;

    // Server-side validation
    if (!name || !email || !inquiryType || !subject || !message) {
      return NextResponse.json(
        { success: false, error: "Please fill in all required fields." },
        { status: 400 }
      );
    }

    // Email regex check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    // Save to MongoDB database
    const contactMsg = await ContactMessage.create({
      name: name.trim(),
      email: email.trim(),
      organization: organization ? organization.trim() : "",
      inquiryType,
      subject: subject.trim(),
      message: message.trim(),
      read: false
    });

    return NextResponse.json({
      success: true,
      message: "Your inquiry has been successfully transmitted.",
      data: { id: contactMsg._id }
    });
  } catch (error) {
    console.error("Contact Form API Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process inquiry. Please try again later." },
      { status: 500 }
    );
  }
}
