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

const htmlContent = `<h1>Subsea Cables & Cyber Colonization: The Ecological Impact of the Internet</h1>
<p>When we stream high-definition movies, execute cloud operations, or send instant messages, we imagine these processes floating effortlessly through the "cloud." The terminology is deceptively light. In reality, the internet is anchored to the planet by millions of miles of heavy, fiber-optic <strong>subsea telecommunication cables</strong> lying on the seabed.</p>

<h2>The Physical Weight of the Digital World</h2>
<p>Over <strong>99% of international data traffic</strong> is routed through subsea cables. These lines represent the physical "arteries of the internet," and their installation comes with severe, underexposed ecological tipping points:</p>
<ul>
  <li><strong>Habitat Alteration</strong>: Cable plow installations disrupt benthic organisms and underwater flora.</li>
  <li><strong>Thermal Footprints</strong>: Subsea power transfer components emit micro-heat waves that alter local deep-sea biomes.</li>
  <li><strong>Cable Colonialism</strong>: Tracing the marine lanes of these cables reveals they map directly onto historic colonial mercantile trade routes, concentrating digital bandwidth controls in global-north hubs while leaving coastal ecosystems in transit zones vulnerable.</li>
</ul>

<h2>Breaking the Cycle of Digital Pollution</h2>
<p>To reconcile global digitalization with ecological boundaries, policy frameworks must adapt:</p>
<ul>
  <li><strong>Mandatory Subsea Environmental Impact Assessments (EIAs)</strong>: Telecommunication conglomerates must be bound to strict benthic conservation regulations.</li>
  <li><strong>Subsidized Sustainable Cable Designs</strong>: Encouraging low-heat, non-leaching sheathing alternatives.</li>
  <li><strong>Digital Minimalism</strong>: Reducing redundant data storage and optimizing local networks to minimize the reliance on trans-oceanic pathways.</li>
</ul>

<p>We must acknowledge that every click, search, and byte has an ecological cost. By decoding digital pollution, we can start engineering a truly decarbonized, rather than just digitalized, planet.</p>`;

async function run() {
  await mongoose.connect(MONGODB_URI);
  
  const result = await Blog.updateOne(
    { slug: "subsea-cables-cyber-colonization-hidden-footprint" },
    { $set: { content: htmlContent } }
  );
  
  console.log("Database update result:", result);
  
  // Verify updated blog
  const updatedBlog = await Blog.findOne({ slug: "subsea-cables-cyber-colonization-hidden-footprint" });
  if (updatedBlog) {
    console.log("Updated Blog title:", updatedBlog.title);
    console.log("Updated Blog content start:", updatedBlog.content.slice(0, 300));
  } else {
    console.error("Could not find the updated blog post!");
  }
  
  await mongoose.disconnect();
}

run().catch(console.error);
