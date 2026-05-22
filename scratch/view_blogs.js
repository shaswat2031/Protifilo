const mongoose = require("mongoose");
const MONGODB_URI = "mongodb://127.0.0.1:27017/jahnvi_portfolio";

const BlogSchema = new mongoose.Schema({
  title: String,
  slug: String,
  content: String,
  coverImage: String,
  tags: [String],
  readTime: String,
  date: String
});

const Blog = mongoose.models.Blog || mongoose.model("Blog", BlogSchema);

async function run() {
  await mongoose.connect(MONGODB_URI);
  const blogs = await Blog.find();
  console.log("Found blogs count:", blogs.length);
  for (const b of blogs) {
    console.log("-----------------------------------------");
    console.log("Title:", b.title);
    console.log("Slug:", b.slug);
    console.log("Date:", b.date);
    console.log("Tags:", b.tags);
    console.log("Content length:", b.content?.length);
    console.log("Content start:", b.content?.slice(0, 300));
  }
  await mongoose.disconnect();
}

run();
