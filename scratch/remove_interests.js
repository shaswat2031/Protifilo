const mongoose = require("mongoose");
const dns = require("dns");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/jahnvi_portfolio";

const ResearchInterestSchema = new mongoose.Schema({ title: String, description: String, iconName: String });
const ResearchInterest = mongoose.models.ResearchInterest || mongoose.model("ResearchInterest", ResearchInterestSchema);

async function removeInterests() {
  console.log("Connecting to database...");
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB!");

  console.log("Removing research interests...");
  const result = await ResearchInterest.deleteMany({});
  console.log(`Successfully removed research interests. Deleted count: ${result.deletedCount}`);

  await mongoose.disconnect();
  console.log("Disconnected from MongoDB.");
}

removeInterests().catch(console.error);
