import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { ContactMessage } from "@/models/Portfolio";

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
