"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Search,
  Leaf,
  ChevronLeft,
  ChevronRight,
  X,
  Globe,
  Calendar,
  MapPin,
  Building,
  Filter
} from "lucide-react";

// Sub-component for individual Vistas to support carousels nicely in the page list
function VistaCard({ vista, idx }) {
  const [currentImgIdx, setCurrentImgIdx] = useState(0);
  const images = vista.images || [];

  const nextImg = (e) => {
    e.stopPropagation();
    setCurrentImgIdx((prev) => (prev + 1) % images.length);
  };

  const prevImg = (e) => {
    e.stopPropagation();
    setCurrentImgIdx((prev) => (prev - 1 + images.length) % images.length);
  };

  const isEven = idx % 2 === 0;

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center p-8 md:p-12 rounded-[2.5rem] border border-charcoal/10 bg-white/40 backdrop-blur-md shadow-sm hover:shadow-md transition-all duration-300 ${isEven ? "" : "lg:flex-row-reverse"}`}>
      {/* Vista Image / Carousel */}
      <div className={`relative rounded-[2rem] overflow-hidden h-[350px] md:h-[400px] shadow-md border border-charcoal/5 group ${!isEven ? "lg:order-2" : ""}`}>
        {images.length > 0 ? (
          <>
            <img 
              alt={vista.title} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103" 
              src={`/api/images/${images[currentImgIdx]}`} 
            />
            {images.length > 1 && (
              <>
                <button 
                  onClick={prevImg}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-cream-lightest/90 hover:bg-cream-lightest text-charcoal flex items-center justify-center transition-all shadow-sm z-20 cursor-pointer border border-charcoal/5"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button 
                  onClick={nextImg}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-cream-lightest/90 hover:bg-cream-lightest text-charcoal flex items-center justify-center transition-all shadow-sm z-20 cursor-pointer border border-charcoal/5"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                {/* Dots */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20 bg-charcoal/80 px-2.5 py-1 rounded-full backdrop-blur-xs">
                  {images.map((_, i) => (
                    <span 
                      key={i} 
                      onClick={(e) => { e.stopPropagation(); setCurrentImgIdx(i); }}
                      className={`w-1.5 h-1.5 rounded-full cursor-pointer transition-all ${i === currentImgIdx ? "bg-cream-medium scale-125" : "bg-[#FFFDF9]/40"}`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full bg-cream-medium/40 flex items-center justify-center">
            <Globe className="text-warm-gray-light h-12 w-12 animate-pulse" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-charcoal/10 to-transparent"></div>
        <div className="absolute bottom-6 left-6 text-cream-lightest pr-6 z-10">
          <p className="font-sans font-bold text-[10px] uppercase tracking-widest text-cream-medium mb-1">{vista.date}</p>
          <h4 className="font-sans font-black text-lg leading-tight uppercase flex items-center gap-1.5">
            <Building className="h-3.5 w-3.5 shrink-0 text-gold-accent" />
            {vista.organization}
          </h4>
        </div>
      </div>

      {/* Vista Text Description */}
      <div className={`space-y-4 ${!isEven ? "lg:order-1 lg:pr-8 lg:text-right" : "lg:pl-8"}`}>
        <div className={`flex items-center gap-2 ${!isEven ? "lg:justify-end" : ""}`}>
          <span className="text-gold-accent font-serif-italic text-5xl opacity-40 block">{String(idx + 1).padStart(2, '0')}</span>
          {vista.showOnHome !== false && (
            <span className="rounded bg-gold-accent/10 border border-gold-accent/25 px-2 py-0.5 text-3xs font-extrabold uppercase tracking-widest text-gold-accent">Featured Top 3</span>
          )}
        </div>
        <h3 className="font-sans font-black text-2xl md:text-3xl text-charcoal uppercase leading-tight">{vista.title}</h3>
        <p className="font-sans text-charcoal-light leading-relaxed text-base md:text-lg text-justify">{vista.description}</p>
      </div>
    </div>
  );
}

export default function VistasPage() {
  const [vistas, setVistas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all"); // 'all' | 'featured' | 'others'

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/content");
        const json = await res.json();
        if (json.success) {
          setVistas(json.data.vistas || []);
        }
      } catch (err) {
        console.error("Failed to fetch vistas:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Search and filter logic
  const filteredVistas = vistas.filter((vista) => {
    const matchesFilter =
      filterType === "all" ||
      (filterType === "featured" && vista.showOnHome !== false) ||
      (filterType === "others" && vista.showOnHome === false);

    const query = searchQuery.toLowerCase().trim();
    if (!query) return matchesFilter;

    const matchesSearch =
      vista.title?.toLowerCase().includes(query) ||
      vista.organization?.toLowerCase().includes(query) ||
      vista.description?.toLowerCase().includes(query) ||
      vista.date?.toLowerCase().includes(query);

    return matchesFilter && matchesSearch;
  });

  const featuredCount = vistas.filter((v) => v.showOnHome !== false).length;
  const othersCount = vistas.filter((v) => v.showOnHome === false).length;

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center" style={{ backgroundColor: '#FBF5E8' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-16 w-16 animate-spin rounded-full border-4 border-olive/20 border-t-olive">
            <div className="absolute inset-2 rounded-full border-4 border-terra/20 border-t-terra animate-pulse"></div>
          </div>
          <p className="font-serif text-lg tracking-wider text-olive animate-pulse">
            Loading Intellectual Vistas...
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
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-4 md:px-12">
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
      <main className="relative z-10 mx-auto max-w-[1600px] px-6 py-16 md:px-12">
        
        {/* Page title and description */}
        <div className="text-center space-y-4 mb-16">
          <span className="font-label-md text-gold-accent uppercase tracking-widest text-xs font-bold block">Exploring the Summits</span>
          <h1 className="font-serif text-4xl font-extrabold tracking-tight text-charcoal md:text-5xl uppercase">
            Intellectual Vistas
          </h1>
          <p className="text-warm-gray text-lg max-w-2xl mx-auto font-serif-italic">
            Keynotes, global ocean dialogues, sustainable development summits, and youth leadership in ecological discourses.
          </p>
          <div className="mx-auto h-0.5 w-20 bg-olive rounded-full mt-4"></div>

          {/* Stats Counters */}
          <div className="flex justify-center gap-8 pt-6">
            <div className="text-center">
              <span className="block font-serif text-3xl font-bold text-olive">{vistas.length}</span>
              <span className="text-xs font-semibold uppercase tracking-widest text-warm-gray">Total Dialogues</span>
            </div>
            <div className="h-12 w-px bg-olive/15"></div>
            <div className="text-center">
              <span className="block font-serif text-3xl font-bold text-olive">{featuredCount}</span>
              <span className="text-xs font-semibold uppercase tracking-widest text-warm-gray">Featured (Home)</span>
            </div>
            <div className="h-12 w-px bg-olive/15"></div>
            <div className="text-center">
              <span className="block font-serif text-3xl font-bold text-terra">{othersCount}</span>
              <span className="text-xs font-semibold uppercase tracking-widest text-warm-gray">Other Summits</span>
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
              placeholder="Search summits by title, organization, narrative details..."
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
              { id: "all", label: "All Summits", count: vistas.length },
              { id: "featured", label: "Featured Top 3", count: featuredCount },
              { id: "others", label: "More Dialogues", count: othersCount },
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
            Showing <span className="font-bold text-charcoal">{filteredVistas.length}</span> of{" "}
            <span className="font-bold text-charcoal">{vistas.length}</span> summits
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

        {/* Vistas Alternating List Grid */}
        {filteredVistas.length > 0 ? (
          <div className="space-y-16">
            {filteredVistas.map((vista, idx) => (
              <VistaCard key={vista._id || idx} vista={vista} idx={idx} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-olive/10 border border-olive/15 text-olive">
              <Globe className="h-7 w-7" />
            </div>
            <h3 className="font-serif text-xl font-bold text-charcoal">No summits found</h3>
            <p className="text-sm text-warm-gray max-w-md">
              Try adjusting your search query or switching your filters to see more of Jahnvi's intellectual vistas.
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
        <div className="mx-auto max-w-[1600px] px-6 md:px-12 flex items-center justify-between">
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
