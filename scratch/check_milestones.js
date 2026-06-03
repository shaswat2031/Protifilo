const mongoose = require("mongoose");
const dns = require("dns");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/jahnvi_portfolio";

const AcademicMilestoneSchema = new mongoose.Schema({
  title: String,
  institution: String,
  period: String,
  grade: String,
  details: String,
  isHighlight: Boolean,
  order: Number
});

const AcademicMilestone = mongoose.models.AcademicMilestone || mongoose.model("AcademicMilestone", AcademicMilestoneSchema);

async function check() {
  await mongoose.connect(MONGODB_URI);
  const milestones = await AcademicMilestone.find({}).sort({ order: 1 });
  console.log(JSON.stringify(milestones, null, 2));
  await mongoose.disconnect();
}

check().catch(console.error);
