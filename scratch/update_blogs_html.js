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

// --- BLOG 1: Subsea Cables ---
const subseaHtml = `<h1>Subsea Cables &amp; Cyber Colonization: The Ecological Impact of the Internet</h1>

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

// --- BLOG 2: Sarva Saha ---
const sarvaSahaHtml = `<h1>Sarva Saha: The Sanskrit Path to Sustainability</h1>

<p>In a world dictated by carbon tallies and regulatory thresholds, we often lose sight of the philosophical roots that sustain our relationship with the Earth. In ancient Sanskrit, there lies a term of exquisite resonance: <strong>"Sarva Saha"</strong> (सर्वसहा). Literal translations denote it as <em>"that which bears all,"</em> an address frequently directed toward Mother Earth (Bhumi). But as a philosophical lens, <strong>Sarva Saha</strong> offers a much richer paradigm — it is the call for a harmonious coexistence, a mutual stewardship between humanity and its natural boundaries.</p>

<h2>Redefining Our Ecological Boundaries</h2>

<p>Modern green policies frequently frame environmentalism in transactional terms:</p>

<ul>
  <li>Net-zero carbon trades</li>
  <li>Biodiversity offset credits</li>
  <li>Resource quota allocations</li>
</ul>

<p>While these metrics are vital administrative machinery, they view nature as an external inventory. In contrast, <strong>Sarva Saha</strong> demands that we recognize ourselves as threads woven <em>into</em> the ecosystem, not landlords managing it.</p>

<blockquote style="border-left: 4px solid #89502e; padding: 16px 24px; margin: 24px 0; background: rgba(137,80,46,0.04); border-radius: 0 12px 12px 0; font-style: italic; color: #434840;">
  "We do not inherit the earth from our ancestors; we borrow it from our children." — Ancient Wisdom
</blockquote>

<h2>Policy Solutions Inspired by Heritage</h2>

<p>Applying Sarva Saha to contemporary green governance means structural adjustments:</p>

<ol>
  <li><strong>Biophilic Urbanism</strong>: Building cities that actively support local flora and fauna migrations, rather than sealing off artificial 'green zones'.</li>
  <li><strong>Circular Resource Cycles</strong>: Translating the age-old Indian households' intrinsic habit of repurposing into industrial-grade circular economy regulations.</li>
  <li><strong>Eco-Centric Jurisprudence</strong>: Giving legal standing to natural water bodies and biomes, recognizing their inherent right to exist in healthy equilibrium.</li>
</ol>

<p>As researchers and policy writers, our duty is to elevate sustainability from a set of technical obligations into an active, lived heritage. Only then can we trigger the realistic transformations our planet so urgently requires.</p>`;

async function run() {
  await mongoose.connect(MONGODB_URI);
  
  // Update Subsea Cables blog
  const r1 = await Blog.updateOne(
    { slug: "subsea-cables-cyber-colonization-hidden-footprint" },
    { $set: { content: subseaHtml } }
  );
  console.log("Subsea blog update:", r1.modifiedCount === 1 ? "✓ Success" : "✗ Not found/modified");

  // Update Sarva Saha blog
  const r2 = await Blog.updateOne(
    { slug: "sarva-saha-philosophy-eco-harmonious-coexistence" },
    { $set: { content: sarvaSahaHtml } }
  );
  console.log("Sarva Saha blog update:", r2.modifiedCount === 1 ? "✓ Success" : "✗ Not found/modified");

  await mongoose.disconnect();
  console.log("\nAll blogs updated with rich HTML content!");
}

run().catch(console.error);
