import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import dbConnect from "@/lib/db";
import {
  Profile,
  AcademicMilestone,
  ResearchInterest,
  ResearchPaper,
  Vista,
  Blog,
  Certificate
} from "@/models/Portfolio";

const AUTH_COOKIE_NAME = "auth_token";
const SESSION_VALUE = "authenticated_jahnvi_session_token";

// Helper to check authentication
async function verifySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME);
  return token && token.value === SESSION_VALUE;
}

// GET all portfolio data
export async function GET() {
  try {
    await dbConnect();

    // Fetch all records, sorted where applicable
    let profile = await Profile.findOne();
    if (!profile) {
      // Create a default profile document if empty
      profile = await Profile.create({
        name: "Jahnvi",
        title: "Researcher & Writer",
        tagline: "Exploring Political Ecology, Green Governance & Sustainable Development"
      });
    }

    const academicBackground = await AcademicMilestone.find().sort({ order: 1 });
    const researchInterests = await ResearchInterest.find().sort({ order: 1 });
    const papers = await ResearchPaper.find().sort({ order: 1 });
    const vistas = await Vista.find().sort({ order: 1 });
    const blogs = await Blog.find().sort({ date: -1 });
    const certificates = await Certificate.find().sort({ order: 1 });

    return NextResponse.json({
      success: true,
      data: {
        profile,
        academicBackground,
        researchInterests,
        papers,
        vistas,
        blogs,
        certificates
      }
    });
  } catch (error) {
    console.error("GET Content API error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

// POST updates (guarded CRUD)
export async function POST(request) {
  try {
    // 1. Guard check
    const isAuthenticated = await verifySession();
    if (!isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = await request.json();
    const { action, payload } = body;

    if (!action || !payload) {
      return NextResponse.json({ error: "Action and payload are required" }, { status: 400 });
    }

    switch (action) {
      // --- PROFILE ACTIONS ---
      case "update_profile": {
        let profile = await Profile.findOne();
        if (!profile) {
          profile = new Profile(payload);
        } else {
          Object.assign(profile, payload);
        }
        await profile.save();
        return NextResponse.json({ success: true, data: profile });
      }

      // --- ACADEMIC TIMELINE ACTIONS ---
      case "save_milestone": {
        let milestone;
        if (payload._id) {
          milestone = await AcademicMilestone.findByIdAndUpdate(payload._id, payload, { new: true });
        } else {
          milestone = new AcademicMilestone(payload);
          await milestone.save();
        }
        return NextResponse.json({ success: true, data: milestone });
      }
      case "delete_milestone": {
        await AcademicMilestone.findByIdAndDelete(payload.id);
        return NextResponse.json({ success: true, message: "Milestone deleted" });
      }

      // --- RESEARCH INTERESTS ACTIONS ---
      case "save_interest": {
        let interest;
        if (payload._id) {
          interest = await ResearchInterest.findByIdAndUpdate(payload._id, payload, { new: true });
        } else {
          interest = new ResearchInterest(payload);
          await interest.save();
        }
        return NextResponse.json({ success: true, data: interest });
      }
      case "delete_interest": {
        await ResearchInterest.findByIdAndDelete(payload.id);
        return NextResponse.json({ success: true, message: "Interest deleted" });
      }

      // --- RESEARCH PAPERS ACTIONS ---
      case "save_paper": {
        let paper;
        if (payload._id) {
          paper = await ResearchPaper.findByIdAndUpdate(payload._id, payload, { new: true });
        } else {
          paper = new ResearchPaper(payload);
          await paper.save();
        }
        return NextResponse.json({ success: true, data: paper });
      }
      case "delete_paper": {
        await ResearchPaper.findByIdAndDelete(payload.id);
        return NextResponse.json({ success: true, message: "Paper deleted" });
      }

      // --- INTELLECTUAL VISTAS ACTIONS ---
      case "save_vista": {
        let vista;
        if (payload._id) {
          vista = await Vista.findByIdAndUpdate(payload._id, payload, { new: true });
        } else {
          vista = new Vista(payload);
          await vista.save();
        }
        return NextResponse.json({ success: true, data: vista });
      }
      case "delete_vista": {
        await Vista.findByIdAndDelete(payload.id);
        return NextResponse.json({ success: true, message: "Vista event deleted" });
      }

      // --- BLOG ACTIONS ---
      case "save_blog": {
        let blog;
        if (payload._id) {
          blog = await Blog.findByIdAndUpdate(payload._id, payload, { new: true });
        } else {
          // Generate a simple unique slug if missing
          if (!payload.slug) {
            payload.slug = payload.title
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/(^-|-$)/g, "");
          }
          blog = new Blog(payload);
          await blog.save();
        }
        return NextResponse.json({ success: true, data: blog });
      }
      case "delete_blog": {
        await Blog.findByIdAndDelete(payload.id);
        return NextResponse.json({ success: true, message: "Blog deleted" });
      }

      // --- CERTIFICATES ACTIONS ---
      case "save_certificate": {
        let certificate;
        if (payload._id) {
          certificate = await Certificate.findByIdAndUpdate(payload._id, payload, { new: true });
        } else {
          certificate = new Certificate(payload);
          await certificate.save();
        }
        return NextResponse.json({ success: true, data: certificate });
      }
      case "delete_certificate": {
        await Certificate.findByIdAndDelete(payload.id);
        return NextResponse.json({ success: true, message: "Certificate deleted" });
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (error) {
    console.error("POST Content API error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
