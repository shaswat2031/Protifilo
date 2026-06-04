"use client";

import { useState, useEffect } from "react";
import {
  BookOpen,
  Award,
  ArrowLeft,
  Search,
  ExternalLink,
  FileText,
  FileDown,
  Leaf,
  ChevronLeft,
  ChevronRight,
  X,
  Filter,
} from "lucide-react";

export default function PapersPage() {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paperFilter, setPaperFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedPaper, setExpandedPaper] = useState(null);
  const [activePaper, setActivePaper] = useState(null);
  const [slideIndex, setSlideIndex] = useState(0);

  // Lightbox state
  const [activeVista, setActiveVista] = useState(null);
  const [vistaImageIndex, setVistaImageIndex] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/content", { cache: "no-store" });
        const json = await res.json();
        if (json.success) {
          setPapers(json.data.papers || []);
        }
      } catch (err) {
        console.error("Failed to fetch papers:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Filter + Search logic
  const filteredPapers = papers.filter((paper) => {
    const matchesFilter = paperFilter === "all" || paper.type === paperFilter;
    const query = searchQuery.toLowerCase().trim();
    if (!query) return matchesFilter;

    const matchesSearch =
      paper.title?.toLowerCase().includes(query) ||
      paper.venue?.toLowerCase().includes(query) ||
      paper.description?.toLowerCase().includes(query) ||
      paper.abstract?.toLowerCase().includes(query) ||
      paper.date?.toLowerCase().includes(query) ||
      paper.award?.toLowerCase().includes(query);

    return matchesFilter && matchesSearch;
  });

  const publishedCount = papers.filter((p) => p.type === "published").length;
  const presentedCount = papers.filter((p) => p.type === "presented").length;

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center" style={{ backgroundColor: '#FBF5E8' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-16 w-16 animate-spin rounded-full border-4 border-olive/20 border-t-olive">
            <div className="absolute inset-2 rounded-full border-4 border-terra/20 border-t-terra animate-pulse"></div>
          </div>
          <p className="font-serif text-lg tracking-wider text-olive animate-pulse">
            Loading Research Papers...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen font-sans text-charcoal" style={{ backgroundColor: '#FBF5E8' }}>

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 glassmorphism">
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

      {/* Page Content */}
      <main className="mx-auto max-w-[1600px] px-6 py-12 md:px-12">

        {/* Page Header */}
        <div className="text-center space-y-4 mb-12">
          <h1 className="font-serif text-4xl font-extrabold tracking-tight text-charcoal md:text-5xl">
            Research Papers & Conferences
          </h1>
          <p className="text-warm-gray text-lg max-w-2xl mx-auto">
            Exploring publications and award-winning presentations across environmental governance, political ecology, and sustainable development.
          </p>
          <div className="mx-auto h-0.5 w-20 bg-olive rounded-full"></div>

          {/* Stats summary */}
          <div className="flex justify-center gap-8 pt-4">
            <div className="text-center">
              <span className="block font-serif text-3xl font-bold text-olive">{papers.length}</span>
              <span className="text-xs font-semibold uppercase tracking-widest text-warm-gray">Total Papers</span>
            </div>
            <div className="h-12 w-px bg-olive/15"></div>
            <div className="text-center">
              <span className="block font-serif text-3xl font-bold text-olive">{publishedCount}</span>
              <span className="text-xs font-semibold uppercase tracking-widest text-warm-gray">Published</span>
            </div>
            <div className="h-12 w-px bg-olive/15"></div>
            <div className="text-center">
              <span className="block font-serif text-3xl font-bold text-terra">{presentedCount}</span>
              <span className="text-xs font-semibold uppercase tracking-widest text-warm-gray">Presented</span>
            </div>
          </div>
        </div>

        {/* Search + Filter Bar */}
        <div className="glassmorphism-card rounded-2xl p-6 mb-10 space-y-5">
          
          {/* Search Input */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-warm-gray-light" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, venue, keyword, or year..."
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

          {/* Filter Tabs */}
          <div className="flex justify-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 mr-3 text-xs font-semibold text-warm-gray uppercase tracking-wider">
              <Filter className="h-3.5 w-3.5" />
              Filter:
            </div>
            {[
              { id: "all", label: "All Papers", count: papers.length },
              { id: "published", label: "Published Articles", count: publishedCount },
              { id: "presented", label: "Presented / Conferences", count: presentedCount },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setPaperFilter(tab.id);
                  setExpandedPaper(null);
                }}
                className={`rounded-lg px-4 py-2 text-sm font-semibold tracking-wide transition-all duration-300 ${
                  paperFilter === tab.id
                    ? "bg-olive text-cream-lightest shadow-lg shadow-olive/15"
                    : "text-warm-gray hover:bg-olive/8 hover:text-charcoal border border-olive/10"
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-warm-gray">
            Showing <span className="font-bold text-charcoal">{filteredPapers.length}</span> of{" "}
            <span className="font-bold text-charcoal">{papers.length}</span> papers
            {searchQuery && (
              <span>
                {" "}for &ldquo;<span className="text-olive font-semibold">{searchQuery}</span>&rdquo;
              </span>
            )}
          </p>
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(""); setPaperFilter("all"); }}
              className="text-xs font-semibold text-olive hover:text-olive-dark underline"
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* Papers Grid */}
        {filteredPapers.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {filteredPapers.map((paper, idx) => (
              <div
                key={paper._id || idx}
                className={`glassmorphism-card p-3 sm:p-6 rounded-xl flex flex-col justify-between h-full relative ${
                  paper.award ? "border-terra/20 bg-terra-glow" : ""
                }`}
              >
                {/* Card Header */}
                <div className="space-y-3 sm:space-y-4">
                  {paper.images && paper.images.length > 0 && (
                    <div 
                      onClick={() => {
                        if (paper.type === 'published') {
                          const url = paper.paperUrl || paper.pdfUrl;
                          if (url) window.open(url, '_blank', 'noopener,noreferrer');
                        } else {
                          setActiveVista({
                            title: paper.title,
                            description: paper.venue,
                            images: paper.images,
                          });
                          setVistaImageIndex(0);
                        }
                      }}
                      className="w-full h-20 sm:h-40 rounded-lg overflow-hidden relative group/img cursor-pointer border border-olive/10 shadow-sm bg-cream-medium"
                    >
                      <img 
                        alt={paper.title} 
                        src={`/api/images/${paper.images[0]}`} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-105"
                      />
                      <div className="absolute inset-0 bg-charcoal/20 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <span className="bg-cream-lightest/95 text-charcoal font-sans font-bold text-[8px] sm:text-[10px] uppercase tracking-widest px-2 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-md flex items-center gap-1 backdrop-blur-xs transform translate-y-1 group-hover/img:translate-y-0 transition-all duration-300">
                          {paper.type === 'published' ? 'Read' : 'Slides'}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[10px] sm:text-xs">
                    <span
                      className={`rounded-md px-1.5 py-0.5 sm:px-2.5 sm:py-1 text-[8px] sm:text-2xs font-bold uppercase tracking-wider ${
                        paper.type === "published"
                          ? "bg-olive/10 border border-olive/20 text-olive"
                          : "bg-terra/10 border border-terra/20 text-terra"
                      }`}
                    >
                      {paper.type}
                    </span>
                    <span className="text-[10px] sm:text-xs font-bold text-warm-gray">{paper.date}</span>
                  </div>

                  {paper.award && (
                    <div className="inline-flex items-center gap-0.5 sm:gap-1 rounded bg-terra/10 border border-terra/25 px-1.5 py-0.5 text-[8px] sm:text-2xs font-bold text-terra uppercase">
                      <Award className="h-2.5 w-2.5 sm:h-3 sm:w-3 animate-pulse" />
                      <span className="truncate">{paper.award}</span>
                    </div>
                  )}

                  <h3 className="font-serif text-xs sm:text-lg font-bold leading-snug text-charcoal hover:text-olive transition-colors">
                    {paper.title}
                  </h3>

                  <div className="text-[10px] sm:text-xs font-semibold text-warm-gray">
                    Venue: <span className="text-charcoal-light italic">{paper.venue}</span>
                  </div>

                  {/* Paper Abstract / Description with conditional 'Read More' */}
                  <p className={`text-[10px] sm:text-xs text-warm-gray leading-relaxed font-light ${
                    (paper.abstract || paper.description || '').length > 160 ? 'line-clamp-4 mb-2' : ''
                  }`}>
                    {paper.abstract || paper.description}
                  </p>
                  {(paper.abstract || paper.description || '').length > 160 && (
                    <button 
                      onClick={() => { setActivePaper(paper); setSlideIndex(0); }}
                      className="text-[10px] sm:text-xs font-semibold text-olive hover:text-olive-dark flex items-center gap-1 mt-1 cursor-pointer focus:outline-none"
                    >
                      <FileText className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      Read More
                    </button>
                  )}

                  {/* Conference Image Grid */}
                  {paper.images && paper.images.length > 0 && (
                    <div className="mt-3 sm:mt-4 space-y-1.5 sm:space-y-2">
                      <span className="text-[8px] sm:text-2xs font-extrabold uppercase tracking-wider text-warm-gray block">
                        Conference Slides / Captures:
                      </span>
                      <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                        {paper.images.map((imgName, imgIdx) => (
                          <div
                            key={imgIdx}
                            onClick={() => {
                              setActiveVista({
                                title: paper.title,
                                description: paper.venue,
                                images: paper.images,
                              });
                              setVistaImageIndex(imgIdx);
                            }}
                            className="relative h-10 sm:h-20 overflow-hidden rounded-lg border border-olive/10 bg-cream-medium cursor-pointer hover:border-olive/30 hover:scale-[1.02] transition-all"
                          >
                            <img
                              src={`/api/images/${imgName}`}
                              alt="Conference evidence"
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Action footer links */}
                <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-olive/8 flex flex-wrap items-center gap-2 sm:gap-4">
                  {paper.paperUrl && (
                    <a
                      href={paper.paperUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] sm:text-xs font-semibold text-warm-gray hover:text-olive flex items-center gap-0.5 sm:gap-1"
                    >
                      Source
                      <ExternalLink className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    </a>
                  )}
                  {paper.pdfUrl && (
                    <a
                      href={paper.pdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] sm:text-xs font-semibold text-warm-gray hover:text-olive flex items-center gap-0.5 sm:gap-1"
                    >
                      PDF
                      <FileDown className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-olive/10 border border-olive/15 text-olive">
              <Search className="h-7 w-7" />
            </div>
            <h3 className="font-serif text-xl font-bold text-charcoal">No papers found</h3>
            <p className="text-sm text-warm-gray max-w-md">
              No research papers match your current search or filter criteria. Try adjusting your search terms or clearing the filters.
            </p>
            <button
              onClick={() => { setSearchQuery(""); setPaperFilter("all"); }}
              className="mt-2 rounded-lg bg-olive/10 px-4 py-2 text-sm font-semibold text-olive hover:bg-olive/20 transition-all"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-olive/10 py-8 mt-12" style={{ backgroundColor: 'rgba(243, 234, 219, 0.5)' }}>
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

      {/* MULTI-PHOTO GALLERY LIGHTBOX MODAL */}
      {activeVista && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/90 backdrop-blur-sm select-text">
          <button
            onClick={() => setActiveVista(null)}
            className="absolute top-6 right-6 z-55 rounded-lg bg-cream-medium/80 border border-olive/15 p-2 text-warm-gray hover:text-charcoal transition-colors cursor-pointer"
          >
            <X className="h-6 w-6" />
          </button>

          {activeVista.images && activeVista.images.length > 1 && (
            <button
              onClick={() =>
                setVistaImageIndex(
                  (vistaImageIndex - 1 + activeVista.images.length) %
                    activeVista.images.length
                )
              }
              className="absolute left-6 z-55 rounded-full bg-cream-medium/80 p-3 text-warm-gray hover:text-charcoal transition-colors border border-olive/10 cursor-pointer"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          <div className="max-w-4xl max-h-[85vh] w-full px-6 flex flex-col items-center justify-center gap-6">
            <div className="relative max-h-[70vh] flex items-center justify-center bg-cream-lightest/90 border border-olive/10 rounded-xl p-2 select-none">
              {activeVista.images && activeVista.images.length > 0 && (
                <img
                  src={`/api/images/${activeVista.images[vistaImageIndex]}`}
                  alt="Lightbox Preview"
                  className="max-h-[65vh] max-w-full object-contain rounded-lg"
                />
              )}
            </div>
            <div className="w-full text-center space-y-2 max-w-2xl bg-cream-light/95 backdrop-blur border border-olive/15 p-4 rounded-xl shadow-2xl">
              <h3 className="font-serif text-lg font-bold text-charcoal line-clamp-1">
                {activeVista.title}
              </h3>
              <p className="text-xs text-charcoal-light leading-relaxed font-light line-clamp-3">
                {activeVista.description}
              </p>
              {activeVista.images && activeVista.images.length > 1 && (
                <span className="text-2xs font-extrabold uppercase tracking-widest text-olive">
                  Capture {vistaImageIndex + 1} of {activeVista.images.length}
                </span>
              )}
            </div>
          </div>

          {activeVista.images && activeVista.images.length > 1 && (
            <button
              onClick={() =>
                setVistaImageIndex(
                  (vistaImageIndex + 1) % activeVista.images.length
                )
              }
              className="absolute right-6 z-55 rounded-full bg-cream-medium/80 p-3 text-warm-gray hover:text-charcoal transition-colors border border-olive/10 cursor-pointer"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}
        </div>
      )}

      {/* RESEARCH PAPER DETAILS MODAL */}
      {activePaper && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm transition-all" onClick={() => setActivePaper(null)}>
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-cream-lightest rounded-2xl border border-olive/15 text-charcoal shadow-2xl p-8 md:p-12 m-4 animate-scale-up select-text" onClick={(e) => e.stopPropagation()}>
            
            {/* Header / Title */}
            <div className="w-full flex justify-between items-start border-b pb-6 mb-6 border-olive/10">
              <div className="space-y-2 pr-6">
                <span className={`rounded-md px-2.5 py-1 text-2xs font-bold uppercase tracking-wider ${
                  activePaper.type === "published"
                    ? "bg-olive/10 border border-olive/20 text-olive"
                    : "bg-terra/10 border border-terra/20 text-terra"
                }`}>
                  {activePaper.type} • {activePaper.date}
                </span>
                <h2 className="font-serif text-2xl md:text-3xl text-charcoal font-bold leading-tight mt-1">{activePaper.title}</h2>
                <div className="text-xs font-semibold text-warm-gray">
                  Venue: <span className="text-charcoal-light italic">{activePaper.venue}</span>
                </div>
                {activePaper.award && (
                  <div className="inline-flex items-center gap-1 rounded bg-terra/10 border border-terra/25 px-2 py-0.5 text-2xs font-bold text-terra uppercase mt-1">
                    <Award className="h-3 w-3" />
                    {activePaper.award}
                  </div>
                )}
              </div>
              <button 
                onClick={() => setActivePaper(null)}
                className="flex items-center justify-center w-10 h-10 bg-cream-medium/50 hover:bg-cream-medium text-charcoal rounded-full transition-all cursor-pointer shrink-0 border border-olive/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Slides / Media Carousel inside modal if slides are present! */}
            {activePaper.images && activePaper.images.length > 0 && (
              <div className="mb-8 space-y-3">
                <h4 className="text-xs font-semibold text-charcoal uppercase tracking-widest">Presentation Slides & Media</h4>
                <div className="relative w-full aspect-[16/10] bg-cream-medium/40 rounded-xl overflow-hidden border border-olive/10 flex items-center justify-center">
                  <img 
                    alt={`Slide preview`} 
                    className="max-w-full max-h-full object-contain" 
                    src={`/api/images/${activePaper.images[slideIndex < activePaper.images.length ? slideIndex : 0]}`} 
                  />
                  {activePaper.images.length > 1 && (
                    <>
                      <button 
                        onClick={() => setSlideIndex((prev) => (prev - 1 + activePaper.images.length) % activePaper.images.length)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-cream-lightest/80 hover:bg-cream-lightest text-charcoal flex items-center justify-center transition-all shadow-md z-20 cursor-pointer border border-olive/5"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => setSlideIndex((prev) => (prev + 1) % activePaper.images.length)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-cream-lightest/80 hover:bg-cream-lightest text-charcoal flex items-center justify-center transition-all shadow-md z-20 cursor-pointer border border-olive/5"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
                {/* Carousel thumbnails */}
                {activePaper.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1 justify-start">
                    {activePaper.images.map((img, i) => (
                      <div 
                        key={i} 
                        onClick={() => setSlideIndex(i)}
                        className={`w-16 aspect-[16/10] rounded-lg overflow-hidden cursor-pointer transition-all border-2 shrink-0 ${
                          (slideIndex < activePaper.images.length ? slideIndex : 0) === i 
                            ? 'border-olive scale-102 opacity-100 shadow-sm' 
                            : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" src={`/api/images/${img}`} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Abstract/Description content */}
            <div className="space-y-4">
              <h4 className="text-xs font-semibold text-charcoal uppercase tracking-widest">Research Abstract</h4>
              <p className="font-sans text-sm text-charcoal-light leading-relaxed whitespace-pre-line select-text">
                {activePaper.abstract || activePaper.description}
              </p>
            </div>

            {/* Footer / Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mt-8 pt-6 border-t border-olive/10">
              <div className="flex flex-wrap gap-4 w-full sm:w-auto">
                {activePaper.paperUrl && (
                  <a 
                    href={activePaper.paperUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-sans text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer text-cream-lightest bg-olive hover:bg-olive-dark shadow-sm"
                  >
                    Source Link
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
                {activePaper.pdfUrl && (
                  <a 
                    href={activePaper.pdfUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-sans text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer text-cream-lightest bg-terra hover:bg-amber-800 shadow-sm"
                  >
                    PDF Document
                    <FileDown className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
              <button 
                onClick={() => setActivePaper(null)}
                className="w-full sm:w-auto px-6 py-2.5 bg-cream-medium/50 hover:bg-cream-medium text-charcoal border border-olive/10 rounded-lg font-sans text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Close Window
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
