"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Search,
  Leaf,
  X,
  Sparkles,
  Filter
} from "lucide-react";

function VIPCard({ project, idx }) {
  const pastelBgColors = [
    "bg-gradient-to-br from-pastel-purple/15 via-white/50 to-pastel-blue/10 hover:from-pastel-purple/20 hover:to-pastel-blue/15 hover:border-pastel-purple/35",
    "bg-gradient-to-br from-pastel-peach/15 via-white/50 to-pastel-pink/10 hover:from-pastel-peach/20 hover:to-pastel-pink/15 hover:border-pastel-peach/35",
    "bg-gradient-to-br from-pastel-mint/15 via-white/50 to-pastel-blue/10 hover:from-pastel-mint/20 hover:to-pastel-blue/15 hover:border-pastel-mint/35"
  ];
  const bgs = pastelBgColors[idx % pastelBgColors.length];

  return (
    <div
      className={`glassmorphism-premium p-8 rounded-[2rem] border border-charcoal/10 hover:-translate-y-2 hover:shadow-xl transition-all duration-500 flex flex-col justify-between relative overflow-hidden group ${bgs}`}
    >
      {/* Floating background count indicator */}
      <span className="absolute right-6 top-6 font-serif-italic text-5xl text-charcoal/5 font-extrabold select-none pointer-events-none group-hover:scale-110 group-hover:text-charcoal/8 transition-all duration-300">
        {String(idx + 1).padStart(2, '0')}
      </span>

      <div>
        {/* Status Badge & Home Badge */}
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-[9px] font-sans font-bold uppercase tracking-widest text-olive px-3 py-0.5 bg-olive/10 rounded-full border border-olive/15">
            <span className={`w-1.5 h-1.5 rounded-full ${project.status && project.status.toLowerCase().includes("in progress") ? "bg-emerald-500 animate-pulse" : "bg-gold-accent"}`}></span>
            {project.status || "Future Vision"}
          </span>

          {project.showOnHome !== false && (
            <span className="rounded bg-gold-accent/10 border border-gold-accent/25 px-2 py-0.5 text-[9px] font-sans font-bold uppercase tracking-widest text-gold-accent">
              Featured on Home
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-sans font-black text-lg uppercase tracking-tight text-charcoal leading-snug mb-3 group-hover:text-olive transition-colors duration-300">
          {project.title}
        </h3>

        {/* Description */}
        <p className="font-sans text-xs md:text-sm text-charcoal-light leading-relaxed text-justify">
          {project.description}
        </p>
      </div>

      <div className="w-12 h-1 bg-gold-accent/25 mt-6 rounded-full group-hover:w-20 group-hover:bg-gold-accent/40 transition-all duration-300"></div>
    </div>
  );
}

export default function VIPPage() {
  const [vipProjects, setVipProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all"); // 'all' | 'featured' | 'in-progress' | 'proposed'

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/content", { cache: "no-store" });
        const json = await res.json();
        if (json.success) {
          setVipProjects(json.data.vipProjects || []);
        }
      } catch (err) {
        console.error("Failed to fetch VIP projects:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Filter and search logic
  const filteredProjects = vipProjects.filter((project) => {
    const statusLower = (project.status || "").toLowerCase();
    const matchesFilter =
      filterType === "all" ||
      (filterType === "featured" && project.showOnHome !== false) ||
      (filterType === "in-progress" && statusLower.includes("in progress")) ||
      (filterType === "proposed" && statusLower.includes("proposed"));

    const query = searchQuery.toLowerCase().trim();
    if (!query) return matchesFilter;

    const matchesSearch =
      project.title?.toLowerCase().includes(query) ||
      project.status?.toLowerCase().includes(query) ||
      project.description?.toLowerCase().includes(query);

    return matchesFilter && matchesSearch;
  });

  const featuredCount = vipProjects.filter((p) => p.showOnHome !== false).length;
  const inProgressCount = vipProjects.filter((p) => (p.status || "").toLowerCase().includes("in progress")).length;
  const proposedCount = vipProjects.filter((p) => (p.status || "").toLowerCase().includes("proposed")).length;

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center" style={{ backgroundColor: '#FBF5E8' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-16 w-16 animate-spin rounded-full border-4 border-olive/20 border-t-olive">
            <div className="absolute inset-2 rounded-full border-4 border-terra/20 border-t-terra animate-pulse"></div>
          </div>
          <p className="font-serif text-lg tracking-wider text-olive animate-pulse">
            Loading Vision Projects...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen font-sans text-charcoal" style={{ backgroundColor: '#FBF5E8' }}>
      
      {/* Decorative Blur Background Graphics */}
      <div className="absolute -left-32 top-10 w-96 h-96 bg-cream-medium/40 rounded-full blur-3xl z-0 pointer-events-none"></div>
      <div className="absolute -right-32 bottom-10 w-96 h-96 bg-cream-medium/30 rounded-full blur-3xl z-0 pointer-events-none"></div>

      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 bg-[#FBF5E8]/85 backdrop-blur-md border-b border-olive/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-12">
          <a
            href="/"
            className="flex items-center gap-2 text-sm font-semibold text-olive hover:text-olive-dark transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Portfolio
          </a>
          <div className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-olive" />
            <span className="font-serif text-lg font-bold text-charcoal">Jahnvi</span>
          </div>
        </div>
      </header>

      {/* Page Main Content */}
      <main className="relative z-10 mx-auto max-w-7xl px-6 py-16 md:px-12">
        
        {/* Page title and description */}
        <div className="text-center space-y-4 mb-16">
          <span className="font-label-md text-gold-accent uppercase tracking-widest text-xs font-bold block">Future Vistas & Intentions</span>
          <h1 className="font-serif text-4xl font-extrabold tracking-tight text-charcoal md:text-5xl uppercase">
            VIP – [Vision-Innovation-Priorities]
          </h1>
          <p className="text-warm-gray text-lg max-w-2xl mx-auto font-serif-italic">
            Highlighting projects in my vision and aligning my interests and priorities.
          </p>
          <div className="mx-auto h-0.5 w-20 bg-olive rounded-full mt-4"></div>

          {/* Stats Counters */}
          <div className="flex justify-center gap-6 sm:gap-8 pt-6 flex-wrap">
            <div className="text-center min-w-[80px]">
              <span className="block font-serif text-3xl font-bold text-olive">{vipProjects.length}</span>
              <span className="text-xs font-semibold uppercase tracking-widest text-warm-gray">Total Vision</span>
            </div>
            <div className="hidden sm:block h-12 w-px bg-olive/15"></div>
            <div className="text-center min-w-[80px]">
              <span className="block font-serif text-3xl font-bold text-olive">{featuredCount}</span>
              <span className="text-xs font-semibold uppercase tracking-widest text-warm-gray">Featured (Home)</span>
            </div>
            <div className="hidden sm:block h-12 w-px bg-olive/15"></div>
            <div className="text-center min-w-[80px]">
              <span className="block font-serif text-3xl font-bold text-olive">{inProgressCount}</span>
              <span className="text-xs font-semibold uppercase tracking-widest text-warm-gray">In Progress</span>
            </div>
            <div className="hidden sm:block h-12 w-px bg-olive/15"></div>
            <div className="text-center min-w-[80px]">
              <span className="block font-serif text-3xl font-bold text-gold-accent">{proposedCount}</span>
              <span className="text-xs font-semibold uppercase tracking-widest text-warm-gray">Proposed</span>
            </div>
          </div>
        </div>

        {/* Search + Filter Bar Card */}
        <div className="glassmorphism-card rounded-[2rem] p-6 mb-12 space-y-5 bg-white/30 border border-charcoal/10 shadow-sm">
          
          {/* Search box */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-warm-gray-light" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects by title, description, status..."
              className="w-full rounded-xl border border-olive/15 bg-cream-lightest py-3.5 pl-12 pr-12 text-sm text-charcoal placeholder:text-warm-gray-light focus:border-olive/40 focus:outline-none focus:ring-2 focus:ring-olive/10 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-warm-gray hover:text-charcoal transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filter options */}
          <div className="flex justify-center gap-2 flex-wrap items-center">
            <div className="flex items-center gap-1.5 mr-3 text-xs font-semibold text-warm-gray uppercase tracking-wider">
              <Filter className="h-3.5 w-3.5" />
              Filter by:
            </div>
            {[
              { id: "all", label: "All Projects", count: vipProjects.length },
              { id: "featured", label: "Featured (Home)", count: featuredCount },
              { id: "in-progress", label: "In Progress", count: inProgressCount },
              { id: "proposed", label: "Proposed", count: proposedCount },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold tracking-wide transition-all duration-300 ${
                  filterType === tab.id
                    ? "bg-olive text-cream-lightest shadow-lg shadow-olive/15"
                    : "text-warm-gray hover:bg-olive/8 hover:text-charcoal border border-olive/10"
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* Query Results Metadata header */}
        <div className="flex items-center justify-between mb-8">
          <p className="text-sm text-warm-gray">
            Showing <span className="font-bold text-charcoal">{filteredProjects.length}</span> of{" "}
            <span className="font-bold text-charcoal">{vipProjects.length}</span> projects
            {searchQuery && (
              <span>
                {" "}for &ldquo;<span className="text-olive font-semibold">{searchQuery}</span>&rdquo;
              </span>
            )}
          </p>
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(""); setFilterType("all"); }}
              className="text-xs font-semibold text-olive hover:text-olive-dark underline"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Grid of VIP Projects */}
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project, idx) => (
              <VIPCard key={project._id || idx} project={project} idx={idx} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-olive/10 border border-olive/15 text-olive">
              <Sparkles className="h-7 w-7" />
            </div>
            <h3 className="font-serif text-xl font-bold text-charcoal">No vision projects found</h3>
            <p className="text-sm text-warm-gray max-w-md">
              Try adjusting your search query or switching your filters to see more of Jahnvi's VIP initiatives.
            </p>
            <button
              onClick={() => { setSearchQuery(""); setFilterType("all"); }}
              className="mt-2 rounded-lg bg-olive/10 px-4 py-2 text-sm font-semibold text-olive hover:bg-olive/20 transition-all"
            >
              Clear Search and Filters
            </button>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-olive/10 py-8 mt-24" style={{ backgroundColor: 'rgba(243, 234, 219, 0.5)' }}>
        <div className="mx-auto max-w-7xl px-6 md:px-12 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 text-sm font-semibold text-olive hover:text-olive-dark transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Portfolio
          </a>
          <div className="flex items-center gap-2">
            <Leaf className="h-4 w-4 text-olive" />
            <span className="font-serif text-sm font-bold text-charcoal">Jahnvi &copy; 2026</span>
          </div>
        </div>
      </footer>
      
    </div>
  );
}
