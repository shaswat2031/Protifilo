const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const dns = require("dns");

// Set Google DNS to bypass SRV query issues
dns.setServers(['8.8.8.8', '8.8.4.4']);

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://jhavani:jhavani@cluster0.0tqeuqa.mongodb.net/?appName=Cluster0";

// Define schemas inline in CommonJS so the seeder can run standalone without ESM transpilation issues
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
    googleScholar: { type: String, default: "" }
  }
});

const AcademicMilestoneSchema = new mongoose.Schema({
  title: { type: String, required: true },
  institution: { type: String, required: true },
  period: { type: String, required: true },
  grade: { type: String },
  details: { type: String },
  isHighlight: { type: Boolean, default: false },
  order: { type: Number, default: 0 }
});

const ResearchInterestSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  iconName: { type: String, default: "Leaf" },
  order: { type: Number, default: 0 }
});

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
  images: [{ type: String }],
  order: { type: Number, default: 0 }
});

const VistaSchema = new mongoose.Schema({
  title: { type: String, required: true },
  organization: { type: String, default: "" },
  date: { type: String, required: true },
  description: { type: String, required: true },
  images: [{ type: String }],
  order: { type: Number, default: 0 }
});

const BlogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true },
  content: { type: String, required: true },
  coverImage: { type: String },
  tags: [{ type: String }],
  readTime: { type: String, default: "5 min read" },
  date: { type: String, required: true }
});

const CertificateSchema = new mongoose.Schema({
  title: { type: String, required: true },
  issuer: { type: String, required: true },
  date: { type: String, required: true },
  verificationUrl: { type: String },
  image: { type: String },
  order: { type: Number, default: 0 }
});

const AssetImageSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  data: { type: String, required: true },
  contentType: { type: String, default: "image/jpeg" }
});

const Profile = mongoose.models.Profile || mongoose.model("Profile", ProfileSchema);
const AcademicMilestone = mongoose.models.AcademicMilestone || mongoose.model("AcademicMilestone", AcademicMilestoneSchema);
const ResearchInterest = mongoose.models.ResearchInterest || mongoose.model("ResearchInterest", ResearchInterestSchema);
const ResearchPaper = mongoose.models.ResearchPaper || mongoose.model("ResearchPaper", ResearchPaperSchema);
const Vista = mongoose.models.Vista || mongoose.model("Vista", VistaSchema);
const Blog = mongoose.models.Blog || mongoose.model("Blog", BlogSchema);
const Certificate = mongoose.models.Certificate || mongoose.model("Certificate", CertificateSchema);
const AssetImage = mongoose.models.AssetImage || mongoose.model("AssetImage", AssetImageSchema);

async function seed() {
  console.log("Connecting to database:", MONGODB_URI);
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB!");

  // 1. Clean existing records
  console.log("Cleaning collections...");
  await Profile.deleteMany({});
  await AcademicMilestone.deleteMany({});
  await ResearchInterest.deleteMany({});
  await ResearchPaper.deleteMany({});
  await Vista.deleteMany({});
  await Blog.deleteMany({});
  await Certificate.deleteMany({});
  await AssetImage.deleteMany({});
  console.log("Collections cleared successfully.");

  // 2. Load and Base64-encode all images from 'images' folder
  const imagesDir = path.join(__dirname, "images");
  if (fs.existsSync(imagesDir)) {
    console.log("Reading images directory:", imagesDir);
    const files = fs.readdirSync(imagesDir);
    
    for (const file of files) {
      const filePath = path.join(imagesDir, file);
      const ext = path.extname(file).toLowerCase();
      
      // Seed only image files
      if ([".png", ".jpg", ".jpeg", ".webp", ".gif"].includes(ext)) {
        console.log(`Processing file: ${file}`);
        const fileBuffer = fs.readFileSync(filePath);
        const base64Data = fileBuffer.toString("base64");
        
        let contentType = "image/jpeg";
        if (ext === ".png") contentType = "image/png";
        else if (ext === ".webp") contentType = "image/webp";
        else if (ext === ".gif") contentType = "image/gif";
        
        await AssetImage.create({
          key: file,
          data: base64Data,
          contentType,
        });
      }
    }
    console.log("Successfully seeded images into MongoDB.");
  } else {
    console.warn("Images directory not found at:", imagesDir);
  }

  // 3. Seed Profile
  console.log("Seeding Profile...");
  const bioIntro = "I read in a book two years back that there are two worlds: one is a world shaped by mind-set of the masses symbolic of the ordinary lives of more than 80% of the population and the other world shaped by thinkers, leaving a legacy of intellectual heritage. I decided to be in the latter. With that approach, I started my research journey—where ideas and reflecting on problems were the fuel for igniting changes. It began with my first year of pursuing Masters in Political Science and I found my interests growing in contributing to the formulation of policy solutions for climate crisis.";
  
  const bioSecondary = "My roots lie in a family of Business minds and Entrepreneurs; I am the first generation Post-graduate, first in my family to earn a Master's degree. It felt like a call to stewardship, heavy yet honourable. My journey into the world of visionaries ignited my intellectual energy and the inherent sustainability of India shaped my horizons. So far, I am playing my part to construct a change academically that could trigger transformations if aligned with our policies on sustainability or “Sarva Saha” in Sanskrit which means a harmonious coexistence between man and its nature.";

  const profile = await Profile.create({
    name: "Jahnvi",
    title: "Rarefied Researcher, Starling Student & Wending Writer",
    tagline: "Exploring Political Ecology, Green Governance & Sustainable Development • 'Sarva Saha'",
    bioIntro,
    bioSecondary,
    avatarUrl: "/api/images/17.jpeg", // Default avatar to one of the seeded photos
    contact: {
      email: "jahnvi.ecology@gmail.com",
      phone: "+91 98765 43210",
      location: "Jaipur, Rajasthan, India",
      linkedin: "https://linkedin.com/in/jahnvi-researcher",
      github: "https://github.com/jahnvi-ecology",
      orcid: "https://orcid.org/0000-0002-XXXX-XXXX",
      googleScholar: "https://scholar.google.com/citations?user=jahnvi"
    }
  });

  // 4. Seed Academic Milestones
  console.log("Seeding Academic Background...");
  await AcademicMilestone.create([
    {
      title: "Schooling (10th Grade)",
      institution: "St. Paul Sr. Sec School, Barmer, Rajasthan",
      period: "Completed",
      details: "Schooling completed in Barmer, Rajasthan. Early cognitive exposure sowed seeds of deep curiosity.",
      order: 1
    },
    {
      title: "Schooling (12th Grade - Humanities)",
      institution: "St. Mary's Sr. Sec. School, Jaipur, Rajasthan",
      period: "Completed 2021",
      grade: "First Position (School Topper)",
      details: "Relocating to Jaipur marked a pivotal juncture; widened mental horizons and enriched learning avenues.",
      order: 2
    },
    {
      title: "Graduation (BA in Political Science, History & Economics)",
      institution: "IIS University, Jaipur, Rajasthan",
      period: "2021 - 2024",
      details: "Completed graduation with a multi-disciplinary focus in Political Science, History, and Economics.",
      order: 3
    },
    {
      title: "Post-Graduation (MA in Political Science)",
      institution: "IIS University, Jaipur, Rajasthan",
      period: "2024 - 2026",
      details: "Scholarly focus in political ecology, green governance, and sustainable development. Graduated with honors.",
      order: 4
    },
    {
      title: "UGC NET & JRF Qualification",
      institution: "University Grants Commission / National Testing Agency (NTA)",
      period: "Qualified in 2026",
      grade: "First Attempt",
      details: "Qualified the UGC NET exam (National Eligibility Test) with JRF (Junior Research Fellowship) in Political Science in first attempt.",
      isHighlight: true,
      order: 5
    }
  ]);

  // 5. Seed Research Interests
  console.log("Seeding Research Interests...");
  await ResearchInterest.create([
    {
      title: "Political Ecology",
      description: "Investigating how political, economic, and social systems shape ecological outcomes and policy structures.",
      iconName: "Globe",
      order: 1
    },
    {
      title: "Green Governance",
      description: "Exploring institutional mechanisms, political stewardship, and administrative strategies to implement ecological targets.",
      iconName: "ShieldCheck",
      order: 2
    },
    {
      title: "Sustainable Development ('Sarva Saha')",
      description: "Pioneering the concept of harmonious coexistence between human actions, economic growth, and the biosphere.",
      iconName: "Leaf",
      order: 3
    }
  ]);

  // 6. Seed Research Papers
  console.log("Seeding Research Papers...");
  await ResearchPaper.create([
    // Published
    {
      title: "Arteries of Internet: Analysing the Assassins of Earth and Cable Colonialism",
      authors: "Jahnvi",
      venue: "Published in the 11th CEO Congress at Portugal, ISBN: 978-625-95577-6-2 (pg 278-287)",
      date: "June 2025",
      type: "published",
      paperUrl: "https://www.ceocongress.org/files/E-Book/11.%20CEO%20Proceedings%20E-Book.pdf?_t=1751319473",
      pdfUrl: "https://drive.google.com/file/d/1tyFyygTZiVlbs01VVK17oDIV3afQ2bGZ/view?usp=drivesdk",
      abstract: "This paper analyzes the physical infrastructure of the internet—subsea telecommunication cables—and its profound ecological footprint. Deemed the 'arteries of the internet,' these subsea lines impact seabed environments, introducing physical hazards and thermal variations. By tracing the historical mapping of maritime routes, the paper unpacks 'cable colonialism' and details solutions for reconciling ecological sustainability with global telecommunications expansion.",
      description: "Major academic publication addressing the unseen ecological weight of subsea data transfer systems.",
      images: ["10.png", "11.png"],
      order: 1
    },
    {
      title: "Digital Planet vs. Decarbonised Planet: Decoding Digital Pollution and Developing Dehumanization",
      authors: "Jahnvi",
      venue: "Published in the Academic Journal, ISSN: 3048-8785 Vol. 2, Issue 1 (pp. 216–224)",
      date: "2025",
      type: "published",
      paperUrl: "https://drive.google.com/file/d/1vJNA8LDARtEm4o57yQrqCJc3CA6Lk1-Z/view?usp=drivesdk",
      pdfUrl: "https://drive.google.com/file/d/1tNy6R8RJHo7Pc16pJU0S8OrtLX0KX8zM/view?usp=drivesdk",
      abstract: "Examining the dichotomy between rapid digitalization and global climate goals, this study decodes digital pollution—ranging from high-power servers and digital streams to electronic wastes. It analyzes the risk of 'developing dehumanization' as digital automation overrides human environmental sensitivity and outlines frameworks to align technological growth with absolute decarbonization metrics.",
      description: "Critical review of technological acceleration versus biosphere capacities.",
      images: ["image.png"],
      order: 2
    },
    // Presented
    {
      title: "Sahara Seeding: Cause of Celebration or Stress?",
      venue: "Presented at the International conference on 'Environmental Synergies: Bridging gaps for a greener future', SS Jain Subodh College, Jaipur",
      date: "24-25 January, 2025",
      type: "presented",
      award: "Best Paper Presenter Award",
      description: "Evaluated desert greening projects in the Sahara, balancing positive carbon absorption potentials against structural stress on indigenous biomes and water resources.",
      images: ["1.png", "2.png"],
      order: 3
    },
    {
      title: "Identity Politics—An Exigency for Assamese Women",
      venue: "Presented at the ICSSR sponsored National seminar on 'Understanding India's North-east: ethnicity, identity, Language and Issues of conflict'",
      date: "2025",
      type: "presented",
      description: "Unravelled intersections of ethnic borders, local governance, and representational demands of Assamese women.",
      images: ["3.png", "4.png"],
      order: 4
    },
    {
      title: "Suns on Earth: Development or Danger and the Role of Fintech in Fusion",
      venue: "Presented at the International Conference on Dynamics of Sustainability Management through Digitalization [DSMD25], Organised by Jaipur School of Business and Economics, JECRC University, Jaipur",
      date: "4-5 April, 2025",
      type: "presented",
      description: "Detailed the political economy of nuclear fusion ('suns on Earth') and evaluated digital fintech mechanisms for accelerating investment in green energy transitions.",
      images: ["5.jpeg", "6.jpeg"],
      order: 5
    },
    {
      title: "Arctic Alienation: An Abandoned Admonition",
      venue: "Presented at the 12th GoGreen Summit, Corus Hotel, Kuala Lumpur, Malaysia",
      date: "22-23 May, 2025",
      type: "presented",
      description: "Presented research highlighting political delays in responding to polar ice reductions and Arctic ecosystem changes, framed as a neglected global ecological warning.",
      images: ["7.jpeg", "8.jpeg", "9.jpeg"],
      order: 6
    },
    {
      title: "Arteries of Internet: Analysing the Assassins of Earth and Cable Colonialism (Conference)",
      venue: "Presented at the 11th CEO Congress, Lisbon, Portugal",
      date: "13-15 June, 2025",
      type: "presented",
      description: "Delivered interactive presentation on subsea data infrastructure's environmental hazards to international experts in Portugal.",
      images: ["10.png", "11.png"],
      order: 7
    },
    {
      title: "Swords, Scripts and Strategies in Statecraft: Mapping Kautilya & Sardar Patel's Unification Tactics",
      venue: "Presented at the ICSSR Sponsored National seminar on Sardar Vallabhbhai Patel, Pondicherry University",
      date: "21-22 August 2025",
      type: "presented",
      description: "Synthesized classical strategies of Kautilya's Arthashastra with Sardar Patel's post-independence diplomacy to construct an integrated statecraft paradigm.",
      images: ["12.jpeg"],
      order: 8
    },
    {
      title: "Evolution of India’s Loktantra: From Matdaan to Manthan",
      venue: "Presented at the Political Science Conclave organized by University of Delhi, India International Centre, New Delhi",
      date: "11-12 March 2026",
      type: "presented",
      description: "Analyzed shifts in democratic consciousness from simple voting processes ('Matdaan') to deep deliberation and dialogue ('Manthan').",
      images: ["13.jpeg", "14.jpeg", "15.jpeg"],
      order: 9
    }
  ]);

  // 7. Seed Vistas (Prestigious Events)
  console.log("Seeding Intellectual Vistas...");
  await Vista.create([
    {
      title: "SAGARMANTHAN – THE GLOBAL OCEANS DIALOGUE 2025",
      organization: "Observer Research Foundation [ORF] & Ministry of Ports, Shipping and Waterways",
      date: "2025 @ Mumbai, India",
      description: "Participated in the premier Global Ocean Dialogue, where the ancient Indian concept of ocean churning ('Samudramanthan') was reimagined to solve modern maritime challenges. Explored issues ranging from ship-building and green ports to decarbonization, blue skills, coastal community welfare, critical minerals, and digital supply chains. The dialogue served as a vital forum for voicing the emerging economies' path to green growth.",
      images: ["16.jpeg"],
      order: 1
    },
    {
      title: "World Sustainable Development Summit (WSDS) 2026",
      organization: "The Energy and Resources Institute [TERI@50]",
      date: "25-27 February 2026 @ Taj Palace, New Delhi",
      description: "Attended the Silver Jubilee edition of WSDS. Gained critical perspectives on community-led coral reef restoration in Tamil Nadu, the green hydrogen revolution in Indian household kitchens, and global carbon reduction pathways. Formed connections with environmental policymakers and innovators committing to sustainable green transitions.",
      images: ["17.jpeg"],
      order: 2
    },
    {
      title: "Raisina Dialogue 2026",
      organization: "Observer Research Foundation [ORF] & Ministry of External Affairs",
      date: "6-7 March 2026 @ Taj Palace, New Delhi",
      description: "Attended the spotlight session with Dr. S. Jaishankar (Minister of External Affairs) on multi-polarity, and sessions with Chief Minister Chandrababu Naidu (introducing Amaravati as the Quantum Creator City) and Piyush Goyal (outlining India's 2047 roadmap). Re-conceptualized the role of states in global supply chains under the civilizational framework of 'Samskara'.",
      images: ["18.jpeg", "19.jpeg"],
      order: 3
    },
    {
      title: "Youth Development Forum (YDF) 2026",
      organization: "Centre for Global Dialogue and Leadership",
      date: "7-10 May 2026 @ Berlin, Germany",
      description: "Represented India at this prestigious European summit in Berlin. Learned from green policies, local biodiversity protection practices (such as individual tree coding), and historical transformations in Germany. Explored cultural landmarks including Museum Island, Sanssouci Palace, Reichstag, and the Holocaust Memorial, forming connections with youth leaders from 50+ nations.",
      images: ["20.jpeg", "21.jpeg", "22.jpeg", "23.jpeg", "24.jpeg", "25.jpeg"],
      order: 4
    }
  ]);

  // 8. Seed Blogs
  console.log("Seeding Blogs...");
  await Blog.create([
    {
      title: "Sarva Saha: The Philosophy of Eco-Harmonious Coexistence",
      slug: "sarva-saha-philosophy-eco-harmonious-coexistence",
      content: `# Sarva Saha: The Sanskrit Path to Sustainability

In a world dictated by carbon tallies and regulatory thresholds, we often lose sight of the philosophical roots that sustain our relationship with the Earth. In ancient Sanskrit, there lies a term of exquisite resonance: **"Sarva Saha"** (सर्वसहा). 

Literal translations denote it as *“that which bears all,”* an address frequently directed toward Mother Earth (Bhumi). But as a philosophical lens, **Sarva Saha** offers a much richer paradigm—it is the call for a harmonious coexistence, a mutual stewardship between humanity and its natural boundaries.

## Redefining Our Ecological Boundaries

Modern green policies frequently frame environmentalism in transactional terms:
- Net-zero carbon trades
- Biodiversity offset credits
- Resource quota allocations

While these metrics are vital administrative machinery, they view nature as an external inventory. In contrast, **Sarva Saha** demands that we recognize ourselves as threads woven *into* the ecosystem, not landlords managing it. 

> "We do not inherit the earth from our ancestors; we borrow it from our children." — Ancient Wisdom

## Policy Solutions Inspired by Heritage

Applying Sarva Saha to contemporary green governance means structural adjustments:
1. **Biophilic Urbanism**: Building cities that actively support local flora and fauna migrations, rather than sealing off artificial 'green zones'.
2. **Circular Resource Cycles**: Translating the age-old Indian households' intrinsic habit of repurposing into industrial-grade circular economy regulations.
3. **Eco-Centric Jurisprudence**: Giving legal standing to natural water bodies and biomes, recognizing their inherent right to exist in healthy equilibrium.

As researchers and policy writers, our duty is to elevate sustainability from a set of technical obligations into an active, lived heritage. Only then can we trigger the realistic transformations our planet so urgently requires.`,
      coverImage: "17.jpeg",
      tags: ["Sustainability", "Eco-Philosophy", "Policy"],
      readTime: "4 min read",
      date: "May 15, 2026"
    },
    {
      title: "Subsea Cables & Cyber Colonization: The Hidden Heavy Footprint of Digital Streams",
      slug: "subsea-cables-cyber-colonization-hidden-footprint",
      content: `# Subsea Cables & Cyber Colonization: The Ecological Impact of the Internet

When we stream high-definition movies, execute cloud operations, or send instant messages, we imagine these processes floating effortlessly through the "cloud." The terminology is deceptively light. 

In reality, the internet is anchored to the planet by millions of miles of heavy, fiber-optic **subsea telecommunication cables** lying on the seabed.

## The Physical Weight of the Digital World

Over **99% of international data traffic** is routed through subsea cables. These lines represent the physical "arteries of the internet," and their installation comes with severe, underexposed ecological tipping points:
- **Habitat Alteration**: Cable plow installations disrupt benthic organisms and underwater flora.
- **Thermal Footprints**: Subsea power transfer components emit micro-heat waves that alter local deep-sea biomes.
- **Cable Colonialism**: Tracing the marine lanes of these cables reveals they map directly onto historic colonial mercantile trade routes, concentrating digital bandwidth controls in global-north hubs while leaving coastal ecosystems in transit zones vulnerable.

## Breaking the Cycle of Digital Pollution

To reconcile global digitalization with ecological boundaries, policy frameworks must adapt:
- **Mandatory Subsea Environmental Impact Assessments (EIAs)**: Telecommunication conglomerates must be bound to strict benthic conservation regulations.
- **Subsidized Sustainable Cable Designs**: Encouraging low-heat, non-leaching sheathing alternatives.
- **Digital Minimalism**: Reducing redundant data storage and optimizing local networks to minimize the reliance on trans-oceanic pathways.

We must acknowledge that every click, search, and byte has an ecological cost. By decoding digital pollution, we can start engineering a truly decarbonized, rather than just digitalized, planet.`,
      coverImage: "10.png",
      tags: ["Digital Pollution", "Political Ecology", "Technology"],
      readTime: "6 min read",
      date: "April 28, 2026"
    }
  ]);

  // 9. Seed Certificates
  console.log("Seeding Certificates...");
  await Certificate.create([
    {
      title: "Junior Research Fellowship (JRF) in Political Science",
      issuer: "University Grants Commission (UGC) & National Testing Agency (NTA)",
      date: "2026",
      verificationUrl: "https://ugcnet.nta.nic.in",
      image: "11.png",
      order: 1
    },
    {
      title: "National Eligibility Test (NET) for Assistant Professor",
      issuer: "University Grants Commission (UGC)",
      date: "2026",
      verificationUrl: "https://ugcnet.nta.nic.in",
      image: "10.png",
      order: 2
    }
  ]);

  console.log("Database seeding completed successfully!");
  await mongoose.disconnect();
  console.log("Disconnected from database. Seeder finished.");
}

seed().catch((err) => {
  console.error("Seeding failed with error:", err);
  process.exit(1);
});
