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

async function check() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to DB");
  const ProfileSchema = new mongoose.Schema({ name: String, contact: Object }, { strict: false });
  const Profile = mongoose.models.Profile || mongoose.model("Profile", ProfileSchema);
  const p = await Profile.findOne();
  console.log("Profile Contact Info:", JSON.stringify(p ? p.contact : null, null, 2));
  await mongoose.disconnect();
}

check().catch(console.error);
