const mongoose = require("mongoose");
const dns = require("dns");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/jahnvi_portfolio";

const ResearchInterestSchema = new mongoose.Schema({ title: String, description: String, iconName: String });
const ResearchInterest = mongoose.models.ResearchInterest || mongoose.model("ResearchInterest", ResearchInterestSchema);

async function check() {
  await mongoose.connect(MONGODB_URI);
  const interests = await ResearchInterest.find({});
  console.log(JSON.stringify(interests, null, 2));
  await mongoose.disconnect();
}

check().catch(console.error);
