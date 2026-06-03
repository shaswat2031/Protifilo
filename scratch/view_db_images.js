const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const dns = require("dns");

dns.setServers(['8.8.8.8', '8.8.4.4']);

const envPath = path.join(__dirname, "../.env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const parts = line.split("=");
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join("=").trim();
      if (key && val && !process.env[key]) {
        process.env[key] = val;
      }
    }
  });
}

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/jahnvi_portfolio";

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to DB");

  // Profile
  const Profile = mongoose.models.Profile || mongoose.model("Profile", new mongoose.Schema({}, { strict: false }));
  const p = await Profile.findOne();
  console.log("--- Profile Details ---");
  if (p) {
    console.log("name:", p.name);
    console.log("avatarUrl:", p.avatarUrl);
    console.log("corePhilosophy.philosophyImage:", p.corePhilosophy?.philosophyImage);
  } else {
    console.log("No profile found.");
  }

  // Research Papers
  const ResearchPaper = mongoose.models.ResearchPaper || mongoose.model("ResearchPaper", new mongoose.Schema({}, { strict: false }));
  const papers = await ResearchPaper.find();
  console.log("\n--- Research Papers Images ---");
  papers.forEach(paper => {
    console.log(`Paper: "${paper.title}" -> images:`, paper.images);
  });

  // Vistas
  const Vista = mongoose.models.Vista || mongoose.model("Vista", new mongoose.Schema({}, { strict: false }));
  const vistas = await Vista.find();
  console.log("\n--- Vistas Images ---");
  vistas.forEach(v => {
    console.log(`Vista: "${v.title}" -> images:`, v.images);
  });

  // Blogs
  const Blog = mongoose.models.Blog || mongoose.model("Blog", new mongoose.Schema({}, { strict: false }));
  const blogs = await Blog.find();
  console.log("\n--- Blogs Cover Images ---");
  blogs.forEach(b => {
    console.log(`Blog: "${b.title}" -> coverImage:`, b.coverImage);
  });

  // Certificates
  const Certificate = mongoose.models.Certificate || mongoose.model("Certificate", new mongoose.Schema({}, { strict: false }));
  const certs = await Certificate.find();
  console.log("\n--- Certificates Images ---");
  certs.forEach(c => {
    console.log(`Certificate: "${c.title}" -> image:`, c.image);
  });

  await mongoose.disconnect();
}

run().catch(console.error);
