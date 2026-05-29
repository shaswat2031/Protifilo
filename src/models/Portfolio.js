import mongoose from "mongoose";

// --- PROFILE MODEL ---
const ProfileSchema = new mongoose.Schema({
  name: { type: String, default: "Jahnvi" },
  title: { type: String, default: "Researcher & Writer" },
  tagline: { type: String, default: "Exploring Political Ecology, Green Governance & Sustainable Development" },
  bioIntro: { type: String, default: "" },
  bioSecondary: { type: String, default: "" },
  avatarUrl: { type: String, default: "" },
  contact: {
    email: { type: String, default: "jahnvi.ecology@gmail.com" },
    phone: { type: String, default: "" },
    location: { type: String, default: "Jaipur, Rajasthan, India" },
    linkedin: { type: String, default: "" },
    github: { type: String, default: "" },
    orcid: { type: String, default: "" },
    googleScholar: { type: String, default: "" },
    researchGate: { type: String, default: "" }
  }
}, { timestamps: true });

// --- ACADEMIC MILESTONE MODEL ---
const AcademicMilestoneSchema = new mongoose.Schema({
  title: { type: String, required: true },
  institution: { type: String, required: true },
  period: { type: String, required: true },
  grade: { type: String },
  details: { type: String },
  isHighlight: { type: Boolean, default: false },
  order: { type: Number, default: 0 }
}, { timestamps: true });

// --- RESEARCH INTEREST MODEL ---
const ResearchInterestSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  iconName: { type: String, default: "Leaf" },
  order: { type: Number, default: 0 }
}, { timestamps: true });

// --- RESEARCH PAPER MODEL ---
const ResearchPaperSchema = new mongoose.Schema({
  title: { type: String, required: true },
  authors: { type: String, default: "Jahnvi" },
  venue: { type: String, required: true },
  date: { type: String, required: true },
  type: { type: String, enum: ["published", "presented"], required: true },
  award: { type: String },
  paperUrl: { type: String },
  pdfUrl: { type: String },
  abstract: { type: String },
  description: { type: String },
  images: [{ type: String }], // references to AssetImage keys/ids
  order: { type: Number, default: 0 },
  showOnHome: { type: Boolean, default: true }
}, { timestamps: true });

// --- VISTA (PRESTIGIOUS EVENT) MODEL ---
const VistaSchema = new mongoose.Schema({
  title: { type: String, required: true },
  organization: { type: String, default: "" },
  date: { type: String, required: true },
  description: { type: String, required: true },
  images: [{ type: String }], // references to AssetImage keys/ids
  order: { type: Number, default: 0 },
  showOnHome: { type: Boolean, default: true }
}, { timestamps: true });

// --- BLOG MODEL ---
const BlogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true },
  content: { type: String, required: true },
  coverImage: { type: String }, // references to AssetImage key/id
  tags: [{ type: String }],
  readTime: { type: String, default: "5 min read" },
  date: { type: String, required: true }
}, { timestamps: true });

// --- CERTIFICATE MODEL ---
const CertificateSchema = new mongoose.Schema({
  title: { type: String, required: true },
  issuer: { type: String, required: true },
  date: { type: String, required: true },
  verificationUrl: { type: String },
  image: { type: String }, // references to AssetImage key/id
  order: { type: Number, default: 0 }
}, { timestamps: true });

// --- ASSET IMAGE MODEL ---
const AssetImageSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, index: true },
  data: { type: String, required: true }, // Base64 encoded string
  contentType: { type: String, default: "image/jpeg" }
}, { timestamps: true });

// --- CONTACT MESSAGE MODEL ---
const ContactMessageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  organization: { type: String },
  inquiryType: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false }
}, { timestamps: true });


// Export Mongoose models safely (checking if they are already compiled during Next.js serverless HMR reloads)
export const Profile = mongoose.models.Profile || mongoose.model("Profile", ProfileSchema);
export const AcademicMilestone = mongoose.models.AcademicMilestone || mongoose.model("AcademicMilestone", AcademicMilestoneSchema);
export const ResearchInterest = mongoose.models.ResearchInterest || mongoose.model("ResearchInterest", ResearchInterestSchema);
export const ResearchPaper = mongoose.models.ResearchPaper || mongoose.model("ResearchPaper", ResearchPaperSchema);
export const Vista = mongoose.models.Vista || mongoose.model("Vista", VistaSchema);
export const Blog = mongoose.models.Blog || mongoose.model("Blog", BlogSchema);
export const Certificate = mongoose.models.Certificate || mongoose.model("Certificate", CertificateSchema);
export const AssetImage = mongoose.models.AssetImage || mongoose.model("AssetImage", AssetImageSchema);
export const ContactMessage = mongoose.models.ContactMessage || mongoose.model("ContactMessage", ContactMessageSchema);
