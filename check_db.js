const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/jahnvi_portfolio";

// Inline schemas for standalone CommonJS script
const ProfileSchema = new mongoose.Schema({ name: String, avatarUrl: String });
const AcademicMilestoneSchema = new mongoose.Schema({ title: String });
const ResearchInterestSchema = new mongoose.Schema({ title: String });
const ResearchPaperSchema = new mongoose.Schema({ title: String, images: [String] });
const VistaSchema = new mongoose.Schema({ title: String, images: [String] });
const BlogSchema = new mongoose.Schema({ title: String, coverImage: String });
const CertificateSchema = new mongoose.Schema({ title: String, image: String });
const AssetImageSchema = new mongoose.Schema({ key: String });

const Profile = mongoose.models.Profile || mongoose.model("Profile", ProfileSchema);
const AcademicMilestone = mongoose.models.AcademicMilestone || mongoose.model("AcademicMilestone", AcademicMilestoneSchema);
const ResearchInterest = mongoose.models.ResearchInterest || mongoose.model("ResearchInterest", ResearchInterestSchema);
const ResearchPaper = mongoose.models.ResearchPaper || mongoose.model("ResearchPaper", ResearchPaperSchema);
const Vista = mongoose.models.Vista || mongoose.model("Vista", VistaSchema);
const Blog = mongoose.models.Blog || mongoose.model("Blog", BlogSchema);
const Certificate = mongoose.models.Certificate || mongoose.model("Certificate", CertificateSchema);
const AssetImage = mongoose.models.AssetImage || mongoose.model("AssetImage", AssetImageSchema);

async function runCheck() {
  console.log("==========================================");
  console.log("Connecting to database:", MONGODB_URI);
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB!");
  console.log("==========================================\n");

  const counts = {
    Profiles: await Profile.countDocuments(),
    AcademicMilestones: await AcademicMilestone.countDocuments(),
    ResearchInterests: await ResearchInterest.countDocuments(),
    ResearchPapers: await ResearchPaper.countDocuments(),
    Vistas: await Vista.countDocuments(),
    Blogs: await Blog.countDocuments(),
    Certificates: await Certificate.countDocuments(),
    AssetImages: await AssetImage.countDocuments()
  };

  console.log("--- Collection Counts ---");
  for (const [col, count] of Object.entries(counts)) {
    console.log(`${col.padEnd(20)}: ${count}`);
  }
  console.log("-------------------------\n");

  let issuesCount = 0;

  // Verify Images exist in database
  console.log("--- Verifying Referencing Image Keys ---");
  
  // 1. Profile Avatar
  const profile = await Profile.findOne();
  if (profile) {
    if (profile.avatarUrl && profile.avatarUrl.startsWith("/api/images/")) {
      const key = profile.avatarUrl.replace("/api/images/", "");
      const exists = await AssetImage.findOne({ key });
      if (!exists) {
        console.warn(`[WARNING] Profile avatar key "${key}" not found in AssetImages.`);
        issuesCount++;
      } else {
        console.log(`[OK] Profile avatar key "${key}" verified.`);
      }
    }
  }

  // 2. Research Papers Images
  const papers = await ResearchPaper.find();
  for (const paper of papers) {
    if (paper.images && paper.images.length > 0) {
      for (const imgKey of paper.images) {
        const exists = await AssetImage.findOne({ key: imgKey });
        if (!exists) {
          console.warn(`[WARNING] Research Paper "${paper.title}" references image "${imgKey}" which is missing from AssetImages.`);
          issuesCount++;
        } else {
          console.log(`[OK] Paper "${paper.title}" -> image "${imgKey}" verified.`);
        }
      }
    }
  }

  // 3. Vistas Images
  const vistas = await Vista.find();
  for (const vista of vistas) {
    if (vista.images && vista.images.length > 0) {
      for (const imgKey of vista.images) {
        const exists = await AssetImage.findOne({ key: imgKey });
        if (!exists) {
          console.warn(`[WARNING] Vista "${vista.title}" references image "${imgKey}" which is missing from AssetImages.`);
          issuesCount++;
        } else {
          console.log(`[OK] Vista "${vista.title}" -> image "${imgKey}" verified.`);
        }
      }
    }
  }

  // 4. Blogs coverImage
  const blogs = await Blog.find();
  for (const blog of blogs) {
    if (blog.coverImage) {
      const exists = await AssetImage.findOne({ key: blog.coverImage });
      if (!exists) {
        console.warn(`[WARNING] Blog "${blog.title}" references coverImage "${blog.coverImage}" which is missing from AssetImages.`);
        issuesCount++;
      } else {
        console.log(`[OK] Blog "${blog.title}" -> coverImage "${blog.coverImage}" verified.`);
      }
    }
  }

  // 5. Certificates image
  const certificates = await Certificate.find();
  for (const cert of certificates) {
    if (cert.image) {
      const exists = await AssetImage.findOne({ key: cert.image });
      if (!exists) {
        console.warn(`[WARNING] Certificate "${cert.title}" references image "${cert.image}" which is missing from AssetImages.`);
        issuesCount++;
      } else {
        console.log(`[OK] Certificate "${cert.title}" -> image "${cert.image}" verified.`);
      }
    }
  }

  console.log("\n==========================================");
  if (issuesCount === 0) {
    console.log("SUCCESS: Database verification complete. 0 issues found!");
  } else {
    console.warn(`DONE: Database verification complete. Found ${issuesCount} issue(s).`);
  }
  console.log("==========================================");

  await mongoose.disconnect();
}

runCheck().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
