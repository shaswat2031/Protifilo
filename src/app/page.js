"use client";

import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

// Custom Markdown rendering function with 0 dependencies
function renderTableBlock(rows, key) {
  const cleanRows = rows.map(r => {
    return r.split("|")
      .map(cell => cell.trim())
      .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
  });

  const headers = cleanRows[0];
  const bodyRows = cleanRows.slice(1).filter(row => !row.every(cell => cell.startsWith("---")));

  return (
    <div key={key} className="overflow-x-auto my-8 rounded-2xl border border-outline-variant/30 shadow-sm bg-white/50 backdrop-blur-md">
      <table className="min-w-full divide-y divide-outline-variant/30 text-left text-sm text-charcoal">
        <thead className="bg-primary/5 text-primary uppercase font-label-md tracking-wider text-xs">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="px-6 py-4 font-bold border-b border-outline-variant/30">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/20">
          {bodyRows.map((row, rowIdx) => (
            <tr key={rowIdx} className="hover:bg-primary/5 transition-colors duration-150">
              {row.map((cell, cellIdx) => (
                <td key={cellIdx} className="px-6 py-4 font-body-md text-on-surface-variant">{parseInlineFormatting(cell)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function renderMarkdown(content) {
  if (!content) return null;
  const lines = content.split("\n");
  const elements = [];

  let inTable = false;
  let tableRows = [];

  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx];
    const trimmed = line.trim();

    // Check if table row
    if (trimmed.startsWith("|")) {
      inTable = true;
      tableRows.push(trimmed);
      continue;
    } else if (inTable) {
      elements.push(renderTableBlock(tableRows, `table-${idx}`));
      tableRows = [];
      inTable = false;
    }

    if (trimmed.startsWith("# ")) {
      elements.push(<h1 key={idx} className="font-display-lg text-3xl md:text-5xl text-primary font-bold mt-8 mb-4 border-b pb-2">{trimmed.slice(2)}</h1>);
    } else if (trimmed.startsWith("## ")) {
      elements.push(<h2 key={idx} className="font-headline-md text-2xl md:text-3xl text-secondary font-semibold mt-8 mb-4">{trimmed.slice(3)}</h2>);
    } else if (trimmed.startsWith("### ")) {
      elements.push(<h3 key={idx} className="font-headline-md text-xl md:text-2xl text-on-surface font-medium mt-6 mb-3">{trimmed.slice(4)}</h3>);
    } else if (trimmed.startsWith("> ")) {
      elements.push(
        <blockquote key={idx} className="relative pl-6 border-l-4 border-secondary italic text-on-surface-variant py-4 my-6 bg-secondary/5 rounded-r-xl">
          <p className="font-body-lg text-lg">{trimmed.slice(2).replace(/\*\*/g, "")}</p>
        </blockquote>
      );
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      elements.push(
        <li key={idx} className="font-body-md text-lg text-on-surface-variant list-disc ml-8 my-2">
          {parseInlineFormatting(trimmed.slice(2))}
        </li>
      );
    } else if (trimmed.startsWith("1. ") || trimmed.startsWith("2. ") || trimmed.startsWith("3. ")) {
      elements.push(
        <li key={idx} className="font-body-md text-lg text-on-surface-variant list-decimal ml-8 my-2">
          {parseInlineFormatting(trimmed.slice(3))}
        </li>
      );
    } else if (trimmed === "") {
      elements.push(<div key={idx} className="h-4" />);
    } else {
      elements.push(
        <p key={idx} className="font-body-md text-lg text-on-surface-variant leading-relaxed my-4">
          {parseInlineFormatting(trimmed)}
        </p>
      );
    }
  }

  // If table remains at the end
  if (inTable && tableRows.length > 0) {
    elements.push(renderTableBlock(tableRows, "table-end"));
  }

  return elements;
}

function parseInlineFormatting(text) {
  if (!text) return "";
  const tokens = text.split(/(\[.*?\]\(.*?\))|(\*\*.*?\*\*)/g);

  return tokens.map((token, idx) => {
    if (!token) return null;

    // Link token
    if (token.startsWith("[") && token.includes("](")) {
      const match = token.match(/\[(.*?)\]\((.*?)\)/);
      if (match) {
        const linkText = match[1];
        const linkUrl = match[2];
        return (
          <a key={idx} href={linkUrl} target="_blank" rel="noopener noreferrer" className="text-secondary hover:text-primary underline font-semibold transition-colors duration-300">
            {linkText}
          </a>
        );
      }
    }

    // Bold token
    if (token.startsWith("**") && token.endsWith("**")) {
      return <strong key={idx} className="font-bold text-primary">{token.slice(2, -2)}</strong>;
    }

    // Italic token sub-parsing
    const subParts = token.split(/(\*.*?\*)/g);
    return subParts.map((subPart, j) => {
      if (subPart.startsWith("*") && subPart.endsWith("*")) {
        return <em key={j} className="italic text-secondary">{subPart.slice(1, -1)}</em>;
      }
      return subPart;
    });
  });
}

// Sub-component for individual Vistas to support carousels nicely
function VistaItem({ vista, idx }) {
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
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center vista-overlap-item ${isEven ? "" : "lg:flex-row-reverse"}`}>
      {/* Vista Image / Carousel */}
      <div className={`relative rounded-[2.5rem] overflow-hidden h-[400px] md:h-[450px] shadow-lg border border-charcoal/10 group ${!isEven ? "lg:order-2" : ""}`}>
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
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#FFFDF9]/80 hover:bg-[#FFFDF9] text-charcoal flex items-center justify-center transition-all shadow-md backdrop-blur-xs z-20 cursor-pointer border border-charcoal/5"
                >
                  <span className="material-symbols-outlined text-lg">chevron_left</span>
                </button>
                <button
                  onClick={nextImg}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#FFFDF9]/80 hover:bg-[#FFFDF9] text-charcoal flex items-center justify-center transition-all shadow-md backdrop-blur-xs z-20 cursor-pointer border border-charcoal/5"
                >
                  <span className="material-symbols-outlined text-lg">chevron_right</span>
                </button>
                {/* Dots */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 z-20 bg-charcoal/80 px-3 py-1.5 rounded-full backdrop-blur-xs">
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
          <div className="w-full h-full bg-[#FDF9F0] flex items-center justify-center">
            <span className="material-symbols-outlined text-warm-gray-light text-5xl">image</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/65 via-charcoal/10 to-transparent"></div>
        <div className="absolute bottom-8 left-8 text-[#FFFDF9] pr-8 z-10">
          <p className="font-sans font-bold text-[10px] uppercase tracking-widest text-cream-medium mb-1">{vista.date}</p>
          <h4 className="font-sans-ultra-bold text-xl md:text-2xl leading-tight uppercase">{vista.organization}</h4>
        </div>
      </div>

      {/* Vista Text Description */}
      <div className={`space-y-4 ${!isEven ? "lg:order-1 lg:pr-8 lg:text-right" : "lg:pl-8"}`}>
        <span className="text-gold-accent font-serif-italic text-6xl opacity-30 block">{String(idx + 1).padStart(2, '0')}</span>
        <h3 className="font-sans-ultra-bold text-2xl md:text-3xl text-charcoal uppercase leading-tight">{vista.title}</h3>
        <p className="font-sans text-charcoal-light leading-relaxed text-base md:text-lg">{vista.description}</p>
      </div>
    </div>
  );
}

const quotes = [
  {
    word: "Sarva Saha",
    lang: "संस्कृत:",
    text: "A harmonious, organic equilibrium and co-existence between humanity, green policies, and our biospheric boundaries."
  },
  {
    word: "Samskara",
    lang: "संस्कृत:",
    text: "Sowing ethical values in the strategies of states and supply chains, elevating India's role from balancing agent to global builder."
  },
  {
    word: "Manthan",
    lang: "संस्कृत:",
    text: "The democratic churning of ideas—evolving our loktantra from simple voting (matdaan) to deep deliberation (manthan)."
  },
  {
    word: "Sutradhar",
    lang: "संस्कृत:",
    text: "The thread-bearer of intellectual heritage, bridging academic ideas with actionable transformations for sustainable green governance."
  }
];

export default function Home() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // New premium interactive states
  const [activeBlog, setActiveBlog] = useState(null);
  const [activePaper, setActivePaper] = useState(null);
  const [activePaperSlides, setActivePaperSlides] = useState(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const [activeCertificate, setActiveCertificate] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeQuoteIdx, setActiveQuoteIdx] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  // Elite device-adaptive Typewriter State Machine (Type forward -> Rest -> Backspace snappy -> Pause gap -> Rotate)
  useEffect(() => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    const currentText = quotes[activeQuoteIdx].text;

    // Configurable timing profiles based on device capacity
    const typeSpeed = isMobile ? 30 : 18;
    const eraseSpeed = isMobile ? 18 : 10; // Snappier backspace speed
    const charsPerTick = isMobile ? 2 : 1;
    const readDuration = 3000; // 3 seconds reading static time
    const gapDuration = 1000; // 1-second transitional silence gap

    let mode = "typing"; // typing, resting, erasing, paused
    let charIndex = 0;
    let timer = null;

    const runLoop = () => {
      if (mode === "typing") {
        setIsTyping(true);
        if (charIndex < currentText.length) {
          charIndex += charsPerTick;
          setDisplayedText(currentText.substring(0, charIndex));
          timer = setTimeout(runLoop, typeSpeed);
        } else {
          // Finish typing -> enter rest state
          setIsTyping(false);
          mode = "resting";
          timer = setTimeout(runLoop, readDuration);
        }
      } else if (mode === "resting") {
        // Finish resting -> start backspacing/erasing
        setIsTyping(true);
        mode = "erasing";
        timer = setTimeout(runLoop, eraseSpeed);
      } else if (mode === "erasing") {
        setIsTyping(true);
        if (charIndex > 0) {
          charIndex -= charsPerTick;
          if (charIndex < 0) charIndex = 0;
          setDisplayedText(currentText.substring(0, charIndex));
          timer = setTimeout(runLoop, eraseSpeed);
        } else {
          // Finish erasing -> enter transitional gap
          setIsTyping(false);
          mode = "paused";
          timer = setTimeout(runLoop, gapDuration);
        }
      } else if (mode === "paused") {
        // Increment index - triggers useEffect cleanup and restarts cycle
        setActiveQuoteIdx((prev) => (prev + 1) % quotes.length);
      }
    };

    // Kick off the loop
    timer = setTimeout(runLoop, 200);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [activeQuoteIdx]);

  // References for light effect
  const containerRef = useRef();
  const lightEffectRef = useRef();

  // Fetch portfolio data from MongoDB API
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/content");
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        }
      } catch (err) {
        console.error("Failed to fetch content:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Mouse follower effect (completely disabled on mobile/touch screens to maximize scroll performance)
  useEffect(() => {
    const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
    if (isTouchDevice) return;

    const handleMouseMove = (e) => {
      if (lightEffectRef.current) {
        lightEffectRef.current.style.setProperty('--x', e.clientX + 'px');
        lightEffectRef.current.style.setProperty('--y', e.clientY + 'px');
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useGSAP(() => {
    // Fade and slide up the background text "Hey, there"
    gsap.fromTo(".hero-bg-text",
      { y: 60, opacity: 0 },
      { y: 0, opacity: 0.12, duration: 1.6, ease: "power4.out" }
    );

    // Zoom-in / Scale-up the portrait
    gsap.fromTo("#portrait-wrapper",
      { scale: 0.92, opacity: 0 },
      { scale: 1, opacity: 1, duration: 1.5, ease: "power3.out", delay: 0.15 }
    );

    // Parallax scroll effect on portrait
    gsap.to("#hero-image", {
      yPercent: 12,
      ease: "none",
      scrollTrigger: {
        trigger: "#portrait-wrapper",
        start: "top center",
        end: "bottom top",
        scrub: true
      }
    });

    // Fade and slide left the left badge
    gsap.fromTo(".hero-badge-left",
      { x: -40, opacity: 0 },
      { x: 0, opacity: 1, duration: 1.2, ease: "power3.out", delay: 0.5 }
    );

    // Fade and slide right the right description
    gsap.fromTo(".hero-desc-right",
      { x: 40, opacity: 0 },
      { x: 0, opacity: 1, duration: 1.2, ease: "power3.out", delay: 0.5 }
    );

    // Slide up bottom titles sequentially
    gsap.fromTo(".hero-bottom-title",
      { y: 60, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.4, ease: "power4.out", stagger: 0.18, delay: 0.3 }
    );

    // Advanced: Fade and translate hero elements on scroll to prevent messy overlaps under the sticky navbar
    gsap.to([".hero-bottom-title", ".hero-bg-text", ".hero-desc-right", ".hero-badge-left", "#portrait-wrapper"], {
      opacity: 0,
      y: -60,
      ease: "power1.inOut",
      scrollTrigger: {
        trigger: "#intro",
        start: "top top",
        end: "bottom 55%",
        scrub: true
      }
    });

    // Generic Parallax for BG elements
    document.querySelectorAll('.parallax-bg').forEach(el => {
      const speed = el.getAttribute('data-speed');
      gsap.to(el, {
        y: -100 * speed,
        scrollTrigger: {
          trigger: el,
          scrub: 1
        }
      });
    });

    // Timeline Items Animation (Optimized: pure vertical movement on mobile to prevent paint reflow lag)
    gsap.utils.toArray('.timeline-item').forEach((item, i) => {
      const isMobile = window.innerWidth < 768;
      gsap.fromTo(item,
        {
          x: isMobile ? 0 : (i % 2 === 0 ? -60 : 60),
          y: isMobile ? 30 : 0,
          opacity: 0
        },
        {
          x: 0,
          y: 0,
          opacity: 1,
          duration: isMobile ? 0.8 : 1.2,
          ease: isMobile ? "power2.out" : "power4.out",
          scrollTrigger: {
            trigger: item,
            start: "top 90%",
            toggleActions: "play none none none"
          }
        }
      );
    });

    // Section Headers
    gsap.utils.toArray('h2').forEach(heading => {
      gsap.fromTo(heading,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          scrollTrigger: {
            trigger: heading,
            start: "top 90%"
          }
        }
      );
    });

    // Research Paper Cards Fade In
    gsap.fromTo(".paper-card-item",
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        stagger: 0.2,
        duration: 1,
        scrollTrigger: {
          trigger: ".paper-card-item",
          start: "top 85%"
        }
      }
    );

    // Vistas Journey Masonry Feel Reveal
    gsap.utils.toArray('.vista-overlap-item').forEach((item, i) => {
      gsap.fromTo(item,
        { y: 100, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.5,
          ease: "expo.out",
          scrollTrigger: {
            trigger: item,
            start: "top 80%"
          }
        }
      );
    });

    // Blog Cards
    gsap.fromTo(".blog-card",
      { scale: 0.95, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        stagger: 0.3,
        duration: 1.2,
        scrollTrigger: {
          trigger: ".blog-card",
          start: "top 85%"
        }
      }
    );

    // Navbar Scroll Effect
    const nav = document.querySelector('nav');
    if (nav) {
      ScrollTrigger.create({
        start: "top -50",
        onUpdate: (self) => {
          if (self.direction === 1 && self.scroll() > 50) {
            nav.classList.add('py-2.5', 'bg-white/80', 'shadow-md');
            nav.classList.remove('py-3.5', 'bg-white/50', 'shadow-[0_8px_32px_rgba(0,0,0,0.04)]');
          } else if (self.scroll() < 50) {
            nav.classList.add('py-3.5', 'bg-white/50', 'shadow-[0_8px_32px_rgba(0,0,0,0.04)]');
            nav.classList.remove('py-2.5', 'bg-white/80', 'shadow-md');
          }
        }
      });
    }
  }, { scope: containerRef, dependencies: [loading] });

  // Helper for Interest Icons
  function getInterestIcon(iconName) {
    switch (iconName?.toLowerCase()) {
      case "globe": return "public";
      case "shieldcheck": return "gavel";
      case "leaf": return "eco";
      default: return "eco";
    }
  }

  // Dynamic mapping logic
  const profile = data?.profile || {};
  const researchInterests = data?.researchInterests || [];
  const timelineEvents = data?.academicBackground || [];
  const researchPapers = data?.papers || [];
  const intellectualVistas = data?.vistas || [];
  const featuredVistas = intellectualVistas.filter(v => v.showOnHome !== false).slice(0, 3);
  const blogs = data?.blogs || [];
  const certificates = data?.certificates || [];

  return (
    <main ref={containerRef} className="relative">
      <div id="light-effect" ref={lightEffectRef}></div>

      {/* TopNavBar */}
      <div className="fixed top-0 left-0 w-full z-[60] pt-4 md:pt-6 px-4 md:px-8 pointer-events-none flex justify-center">
        <nav className={`pointer-events-auto w-full max-w-7xl bg-white/50 backdrop-blur-2xl border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.04)] px-6 py-3.5 transition-all duration-500 hover:bg-white/60 hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] ${isMobileMenuOpen ? 'rounded-[2rem]' : 'rounded-full'}`}>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between w-full">
              <a href="#intro" className="font-serif-italic text-2xl font-bold tracking-tight text-charcoal flex items-center gap-3 group">
                <span className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#ffe4e6] to-[#e0f2fe] flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300 border border-white">
                  <span className="font-sans font-bold text-sm text-charcoal">J</span>
                </span>
                <span>Jahnvi.</span>
              </a>

              <div className="hidden md:flex items-center bg-charcoal/5 rounded-full p-1 border border-charcoal/5">
                <a className="px-4 py-1.5 rounded-full font-sans font-medium text-xs tracking-wide text-charcoal hover:bg-white hover:shadow-sm transition-all duration-300" href="#intro">Home</a>
                <a className="px-4 py-1.5 rounded-full font-sans font-medium text-xs tracking-wide text-charcoal hover:bg-white hover:shadow-sm transition-all duration-300" href="#research">Philosophy</a>
                <a className="px-4 py-1.5 rounded-full font-sans font-medium text-xs tracking-wide text-charcoal hover:bg-white hover:shadow-sm transition-all duration-300" href="#research-papers">Publications</a>
                <a className="px-4 py-1.5 rounded-full font-sans font-medium text-xs tracking-wide text-charcoal hover:bg-white hover:shadow-sm transition-all duration-300" href="#background">Journey</a>
                <a className="px-4 py-1.5 rounded-full font-sans font-medium text-xs tracking-wide text-charcoal hover:bg-white hover:shadow-sm transition-all duration-300" href="#vistas">Vistas</a>
                <a className="px-4 py-1.5 rounded-full font-sans font-medium text-xs tracking-wide text-charcoal hover:bg-white hover:shadow-sm transition-all duration-300" href="#blogs">Blogs</a>
              </div>

              <a href="/contact" className="hidden md:inline-block px-6 py-2.5 bg-gradient-to-r from-charcoal to-charcoal-light text-white rounded-full font-sans font-semibold text-xs tracking-wider uppercase hover:shadow-[0_0_20px_rgba(27,28,28,0.2)] hover:scale-105 transition-all duration-300">
                Contact
              </a>

              <div className="md:hidden flex items-center">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="material-symbols-outlined text-charcoal cursor-pointer p-2 bg-charcoal/5 rounded-full hover:bg-charcoal/10 transition-colors pointer-events-auto flex items-center justify-center"
                >
                  {isMobileMenuOpen ? 'close' : 'menu'}
                </button>
              </div>
            </div>

            {/* Mobile Navigation Drawer */}
            {isMobileMenuOpen && (
              <div className="md:hidden w-full flex flex-col gap-2 pt-2 border-t border-charcoal/5 animate-scale-up">
                <a
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-2.5 rounded-2xl font-sans font-medium text-base text-charcoal hover:bg-charcoal/5 transition-all text-center"
                  href="#intro"
                >
                  Home
                </a>
                <a
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-2.5 rounded-2xl font-sans font-medium text-base text-charcoal hover:bg-charcoal/5 transition-all text-center"
                  href="#research"
                >
                  Philosophy
                </a>
                <a
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-2.5 rounded-2xl font-sans font-medium text-base text-charcoal hover:bg-charcoal/5 transition-all text-center"
                  href="#research-papers"
                >
                  Publications
                </a>
                <a
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-2.5 rounded-2xl font-sans font-medium text-base text-charcoal hover:bg-charcoal/5 transition-all text-center"
                  href="#background"
                >
                  Journey
                </a>
                <a
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-2.5 rounded-2xl font-sans font-medium text-base text-charcoal hover:bg-charcoal/5 transition-all text-center"
                  href="#vistas"
                >
                  Vistas
                </a>
                <a
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-2.5 rounded-2xl font-sans font-medium text-base text-charcoal hover:bg-charcoal/5 transition-all text-center"
                  href="#blogs"
                >
                  Blogs
                </a>
                <a
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="mt-2 px-6 py-3 bg-gradient-to-r from-charcoal to-charcoal-light text-white rounded-full font-sans font-semibold text-sm tracking-wider uppercase text-center hover:shadow-md transition-all flex items-center justify-center gap-2"
                  href="/contact"
                >
                  Contact
                </a>
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-[100svh] md:min-h-screen flex flex-col justify-between pt-12 md:pt-28 pb-8 md:pb-12 overflow-hidden premium-glow-bg select-text" id="intro">
        {/* Background Italic Text "Hey, there" */}
        <div className="absolute inset-x-0 top-[18%] sm:top-[16%] lg:top-[12%] text-center z-0 pointer-events-none select-none flex flex-row justify-center items-center gap-[22vw] sm:gap-[26vw] md:gap-[30vw] lg:gap-[34vw] xl:gap-[38vw]">
          <h2 className="hero-bg-text font-serif-italic text-[16vw] sm:text-[14vw] lg:text-[15vw] xl:text-[16vw] font-light text-charcoal leading-none tracking-tight">Hey,</h2>
          <h2 className="hero-bg-text font-serif-italic text-[16vw] sm:text-[14vw] lg:text-[15vw] xl:text-[16vw] font-light text-charcoal leading-none tracking-tight">there</h2>
        </div>

        {/* Centered Image - Positioned at Bottom Center */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[220px] sm:max-w-[280px] md:max-w-[360px] lg:max-w-[420px] xl:max-w-[520px] 2xl:max-w-[600px] z-10 pointer-events-none flex items-end mb-[12.5rem] sm:mb-[13.5rem] md:mb-[14.5rem] lg:mb-0" id="portrait-wrapper">
          <img
            alt="Profile"
            className="w-full h-auto object-contain object-bottom pointer-events-auto transition-transform duration-700 hover:scale-[1.02]"
            id="hero-image"
            src="/avatar.png"
            style={{ filter: "drop-shadow(0 10px 25px rgba(0,0,0,0.15))" }}
          />
        </div>

        {/* Spacer to push typography to the bottom on all screen heights */}
        <div className="flex-grow pointer-events-none"></div>

        {/* Bottom stylized typography */}
        <div className="w-full max-w-[95rem] mx-auto px-6 md:px-8 xl:px-12 flex flex-col lg:flex-row justify-between items-center lg:items-end gap-4 lg:gap-4 z-50 select-none pb-4 md:pb-6 relative pointer-events-none mt-auto">
          <h1 className="hero-bottom-title font-sans-ultra-bold text-3xl sm:text-4xl md:text-5xl lg:text-[5.5rem] xl:text-[6.5rem] 2xl:text-[7.5rem] uppercase leading-[0.85] text-charcoal text-center lg:text-left tracking-tighter whitespace-normal lg:whitespace-nowrap relative pointer-events-auto w-full lg:w-auto">
            I AM <span className="block">{profile?.name || "JAHNVI"}</span>
          </h1>
          <h2 className="hero-bottom-title font-sans-ultra-bold text-xl sm:text-2xl md:text-3xl lg:text-[3.2rem] xl:text-[4.2rem] 2xl:text-[5rem] uppercase leading-[0.85] text-charcoal text-center lg:text-right tracking-tighter whitespace-normal lg:whitespace-nowrap relative pointer-events-auto w-full lg:w-auto mt-2 lg:mt-0">
            RESEARCHER <span className="block">AND WRITER</span>
          </h2>
        </div>
      </section>

      {/* Research Statement */}
      <section className="section-padding bg-cream-lightest relative overflow-hidden" id="research">
        {/* Subtle decorative background circles */}
        <div className="absolute -right-32 top-10 w-96 h-96 bg-cream-medium/35 rounded-full blur-3xl z-0 pointer-events-none"></div>
        <div className="absolute -left-32 bottom-10 w-96 h-96 bg-cream-medium/25 rounded-full blur-3xl z-0 pointer-events-none"></div>

        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop relative z-10">
          {/* Centered Header */}
          <div className="max-w-3xl mx-auto text-center mb-16" id="statement-heading">
            <span className="font-label-md text-gold-accent uppercase tracking-widest text-xs font-bold block mb-3">Core Philosophy</span>
            <h2 className="font-headline-lg text-4xl md:text-5xl text-charcoal font-extrabold leading-tight uppercase tracking-wider">My Research Statement</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-olive/20 via-olive to-olive/20 mx-auto mt-6 rounded-full"></div>
          </div>

          {/* Two-column layout: Image on Left, Details on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center mb-20">
            {/* Left Column: Image */}
            <div className="lg:col-span-5 relative group w-full max-w-md mx-auto lg:max-w-none">
              <div className="relative rounded-[2.5rem] overflow-hidden aspect-[4/5] border border-charcoal/10 shadow-lg bg-white/50">
                <img
                  alt="Sarva Saha Philosophy"
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-103"
                  src="/philosophy_image.png"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/30 via-transparent to-transparent pointer-events-none"></div>
              </div>
            </div>

            {/* Right Column: Content */}
            <div className="lg:col-span-7 space-y-8 text-left w-full">
              {/* Highlighted Quote centerpiece */}
              <div id="statement-quote" className="w-full">
                <div className="glassmorphism-premium bg-gradient-to-br from-pastel-purple/25 via-white/70 to-pastel-blue/20 border border-olive/15 rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden shadow-md group hover:shadow-xl transition-all duration-500 text-center md:text-left">
                  {/* Ambient glowing circles */}
                  <div className="absolute -left-16 -top-16 w-52 h-52 bg-pastel-pink/20 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
                  <div className="absolute -right-16 -bottom-16 w-52 h-52 bg-pastel-mint/20 rounded-full blur-3xl opacity-60 pointer-events-none"></div>

                  <span className="absolute left-6 top-4 text-6xl md:text-7xl text-olive/10 font-serif-italic select-none pointer-events-none">“</span>

                  <p className="font-serif-italic text-xl md:text-2xl text-olive leading-relaxed relative z-10">
                    'Sarva Saha' — <span className="text-gold-accent font-sans-ultra-bold font-normal not-italic tracking-wider px-2 py-0.5 bg-gold-accent/5 rounded-lg border border-gold-accent/10">संस्कृत:</span> A harmonious, organic equilibrium and co-existence between humanity, green policies, and our biospheric boundaries.
                  </p>
                </div>
              </div>

              {/* Editorial-style Bio Grid */}
              <div id="statement-bio" className="space-y-6 font-sans text-base md:text-lg text-charcoal-light leading-relaxed text-justify">
                <div className="relative pl-6">
                  <div className="absolute left-0 top-0 w-1 h-full bg-olive/20 rounded-full"></div>
                  <p className="first-letter:text-4xl first-letter:font-serif-italic first-letter:font-bold first-letter:float-left first-letter:mr-2 first-letter:text-olive">
                    {profile?.bioIntro || "I read in a book two years back that there are two worlds: one is a world shaped by mind-set of the masses symbolic of the ordinary lives of more than 80% of the population and the other world shaped by thinkers, leaving a legacy of intellectual heritage. I decided to be in the latter. With that approach, I started my research journey—where ideas and reflecting on problems were the fuel for igniting changes. It began with my first year of pursuing Masters in Political Science and I found my interests growing in contributing to the formulation of policy solutions for climate crisis."}
                  </p>
                </div>
                <div className="relative pl-6">
                  <div className="absolute left-0 top-0 w-1 h-full bg-gold-accent/20 rounded-full"></div>
                  <p className="pt-1">
                    {profile?.bioSecondary || "My roots lie in a family of Business minds and Entrepreneurs; I am the first generation Post-graduate, first in my family to earn a Master's degree. It felt like a call to stewardship, heavy yet honourable. My journey into the world of visionaries ignited my intellectual energy and the inherent sustainability of India shaped my horizons. So far, I am playing my part to construct a change academically that could trigger transformations if aligned with our policies on sustainability or “Sarva Saha” in Sanskrit which means a harmonious coexistence between man and its nature."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Domain Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6">
            {researchInterests.map((interest, idx) => {
              const pastelBgColors = [
                "bg-gradient-to-br from-pastel-pink/20 via-white/50 to-pastel-pink/10 hover:from-pastel-pink/25 hover:to-pastel-pink/15 hover:border-pastel-pink/30",
                "bg-gradient-to-br from-pastel-blue/20 via-white/50 to-pastel-blue/10 hover:from-pastel-blue/25 hover:to-pastel-blue/15 hover:border-pastel-blue/30",
                "bg-gradient-to-br from-pastel-mint/20 via-white/50 to-pastel-mint/10 hover:from-pastel-mint/25 hover:to-pastel-mint/15 hover:border-pastel-mint/30"
              ];
              const bgs = pastelBgColors[idx % pastelBgColors.length];
              return (
                <div
                  key={interest._id || idx}
                  className={`glassmorphism-premium p-10 rounded-[2.5rem] border border-charcoal/10 hover:-translate-y-2 hover:shadow-xl transition-all duration-500 group flex flex-col justify-between relative overflow-hidden ${bgs}`}
                >
                  {/* Decorative floating card number */}
                  <span className="absolute right-8 top-8 font-serif-italic text-5xl text-charcoal/5 font-extrabold select-none pointer-events-none group-hover:scale-110 group-hover:text-charcoal/8 transition-all duration-300">
                    {String(idx + 1).padStart(2, '0')}
                  </span>

                  <div>
                    <div className="w-16 h-16 rounded-2xl bg-white/70 border border-charcoal/5 shadow-xs flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                      <span className="material-symbols-outlined text-olive text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {getInterestIcon(interest.iconName)}
                      </span>
                    </div>
                    <h3 className="font-sans-ultra-bold text-xl uppercase tracking-tight text-charcoal mb-4">{interest.title}</h3>
                    <p className="font-sans text-sm text-charcoal-light leading-relaxed">{interest.description}</p>
                  </div>
                  <div className="w-12 h-1 bg-gold-accent/20 mt-8 rounded-full group-hover:w-20 group-hover:bg-gold-accent/40 transition-all duration-300"></div>
                </div>
              );
            })}
          </div>
        </div>
      </section>


      {/* Academic Background (Timeline) */}
      <section className="section-padding premium-glow-alt-1 relative overflow-hidden" id="background">


        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop text-center mb-20 relative z-10">
          <span className="font-label-md text-gold-accent uppercase tracking-widest text-xs font-bold block mb-3">Scholastic Journey</span>
          <h2 className="font-headline-lg text-4xl md:text-5xl text-charcoal font-extrabold uppercase tracking-wider leading-tight">Academic Background</h2>
          <p className="font-serif-italic text-lg text-charcoal-light mt-4">A journey of scholarship and continuous evolution</p>
          <div className="w-16 h-1 bg-olive/45 mx-auto mt-6 rounded-full"></div>
        </div>

        <div className="max-w-4xl mx-auto px-margin-mobile relative z-10">
          {/* Center Line (Desktop) */}
          <div className="absolute left-1/2 -translate-x-1/2 w-px h-full bg-charcoal/10 hidden md:block"></div>
          {/* Mobile Vertical Line */}
          <div className="absolute left-5 top-4 bottom-4 w-px bg-charcoal/10 md:hidden"></div>

          <div className="space-y-20">
            {timelineEvents.map((event, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <div key={event._id || idx} className="relative flex flex-col md:grid md:grid-cols-2 gap-4 md:gap-16 pl-8 md:pl-0 timeline-item">
                  {/* Mobile timeline dot */}
                  <div className="absolute left-[-4px] -translate-x-1/2 w-3 h-3 rounded-full border-2 border-cream-lightest bg-gold-accent z-20 shadow-md md:hidden top-3.5"></div>

                  {/* Left/Alternating Column */}
                  <div className={`${isEven ? "md:text-right md:pr-4" : "md:text-left md:order-2 md:pl-4"} flex flex-col justify-center`}>
                    <div className="mb-2">
                      <span className="inline-block px-4 py-1.5 bg-olive text-cream-lightest rounded-full font-sans font-bold text-xs uppercase tracking-wider shadow-xs">
                        {event.period}
                      </span>
                    </div>
                    <h4 className="font-sans-ultra-bold text-xl md:text-2xl text-charcoal leading-tight uppercase">{event.title}</h4>
                    <p className="font-serif-italic text-base text-gold-accent mt-1">{event.institution}</p>
                    {event.grade && (
                      <div className={`mt-3 justify-start ${isEven ? "md:justify-end" : "md:justify-start"} flex`}>
                        <span className="inline-block text-[10px] font-sans font-bold uppercase tracking-widest text-olive px-3 py-1 bg-olive/5 rounded-full border border-olive/10">
                          {event.grade}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Timeline dot (Desktop) */}
                  <div className="hidden md:block absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-4 border-cream-light bg-gold-accent z-20 shadow-md top-[calc(50%-8px)]"></div>

                  {/* Right/Alternating Column (details card) */}
                  <div className={`${!isEven ? "md:text-right md:order-1 md:pr-4" : "md:pl-4"} flex items-center`}>
                    <div
                      className={`w-full p-8 glassmorphism-premium rounded-3xl border transition-all duration-300 hover:shadow-lg ${event.isHighlight
                        ? 'border-gold-accent/30 bg-pastel-yellow/30 shadow-xs'
                        : isEven
                          ? 'border-l-4 border-l-gold-accent bg-pastel-purple/20 border-r-charcoal/10 border-t-charcoal/10 border-b-charcoal/10'
                          : 'border-l-4 md:border-l-0 md:border-r-4 border-l-olive md:border-r-olive bg-pastel-blue/20 border-r-charcoal/10 md:border-l-charcoal/10 border-t-charcoal/10 border-b-charcoal/10'
                        }`}
                    >
                      {event.isHighlight && (
                        <span className="flex items-center gap-1.5 text-[10px] font-sans font-bold uppercase tracking-widest text-gold-accent mb-3 justify-start">
                          <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                          Highlighted Milestone
                        </span>
                      )}
                      <p className="font-sans text-sm text-charcoal-light leading-relaxed">{event.details}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>


      {/* Research Papers */}
      <section className="section-padding premium-glow-alt-2 relative overflow-hidden" id="research-papers">


        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6 border-b border-charcoal/5 pb-8">
            <div className="space-y-2">
              <span className="font-label-md text-gold-accent uppercase tracking-widest text-xs font-bold block">Scholarly Publications</span>
              <h2 className="font-headline-lg text-4xl md:text-5xl text-charcoal font-extrabold uppercase tracking-wider leading-tight">Selected Research Papers</h2>
              <p className="font-serif-italic text-lg text-charcoal-light">Academic investigations addressing critical ecological, digital, and statecraft challenges</p>
            </div>
            <a
              className="font-sans text-sm font-bold text-olive flex items-center gap-2 group pb-1 transition-all border-b border-olive/30 hover:border-olive hover:text-gold-accent shrink-0"
              href={profile.contact?.googleScholar || "https://scholar.google.com"}
              target="_blank"
              rel="noopener noreferrer"
            >
              Google Scholar Profile
              <span className="material-symbols-outlined text-sm transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">
                north_east
              </span>
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {researchPapers
              .filter((paper) => paper.showOnHome !== false)
              .slice(0, 6)
              .map((paper, idx) => {
                const pastelBgColors = [
                  "bg-pastel-blue/15 hover:bg-pastel-blue/25",
                  "bg-pastel-pink/15 hover:bg-pastel-pink/25",
                  "bg-pastel-mint/15 hover:bg-pastel-mint/25"
                ];
                const bgs = pastelBgColors[idx % pastelBgColors.length];
                return (
                  <div
                    key={paper._id || idx}
                    className={`glassmorphism-premium p-10 rounded-[2.5rem] hover:-translate-y-2 hover:border-olive/20 hover:shadow-xl transition-all duration-500 paper-card-item flex flex-col justify-between group border border-charcoal/10 h-full ${bgs}`}
                  >
                    <div>
                      {paper.images && paper.images.length > 0 && (
                        <div
                          onClick={() => {
                            if (paper.type === 'published') {
                              const url = paper.paperUrl || paper.pdfUrl;
                              if (url) window.open(url, '_blank', 'noopener,noreferrer');
                            } else {
                              setActivePaperSlides(paper);
                              setSlideIndex(0);
                            }
                          }}
                          className="w-full h-48 rounded-2xl overflow-hidden mb-6 relative group/img cursor-pointer border border-charcoal/5 shadow-xs bg-white/50"
                        >
                          <img
                            alt={paper.title}
                            src={`/api/images/${paper.images[0]}`}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-105"
                          />
                          <div className="absolute inset-0 bg-charcoal/20 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <span className="bg-[#FFFDF9]/95 text-charcoal font-sans font-bold text-[10px] uppercase tracking-widest px-3.5 py-2 rounded-full shadow-md flex items-center gap-1.5 backdrop-blur-xs transform translate-y-2 group-hover/img:translate-y-0 transition-all duration-300">
                              <span className="material-symbols-outlined text-xs">
                                {paper.type === 'published' ? 'open_in_new' : 'zoom_in'}
                              </span>
                              {paper.type === 'published' ? 'Read Publication' : 'Expand Slides'}
                            </span>
                          </div>
                          {paper.images.length > 1 && (
                            <div className="absolute bottom-3 right-3 bg-charcoal/75 backdrop-blur-xs text-white text-[9px] font-sans font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-white/10 flex items-center gap-1 shadow-sm">
                              <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>filter</span>
                              {paper.images.length} Slides
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex justify-between items-start mb-6">
                        <span className={`px-4 py-1.5 text-[10px] font-sans font-bold uppercase rounded-full tracking-wider ${paper.type === 'published'
                          ? 'bg-olive/10 text-olive border border-olive/10'
                          : 'bg-gold-accent/10 text-gold-accent border border-gold-accent/10'
                          }`}>
                          {paper.type} • {paper.date}
                        </span>
                        <span className={`material-symbols-outlined text-warm-gray-light transition-colors text-2xl ${paper.type === 'published' ? 'group-hover:text-olive' : 'group-hover:text-gold-accent'
                          }`}>
                          {paper.type === 'published' ? 'article' : 'present_to_all'}
                        </span>
                      </div>

                      <div className="min-h-[5.5rem] lg:min-h-[5rem] flex flex-col justify-center mb-4">
                        <h3 className="font-sans-ultra-bold text-lg md:text-xl leading-snug text-charcoal uppercase group-hover:text-olive transition-colors duration-300 line-clamp-3">
                          {paper.title}
                        </h3>
                      </div>

                      <div className="h-6 flex items-center mb-4">
                        {paper.award ? (
                          <div className="flex items-center gap-1.5 text-[10px] font-sans font-bold text-gold-accent uppercase tracking-widest">
                            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
                            {paper.award}
                          </div>
                        ) : (
                          <span className="block h-6" />
                        )}
                      </div>

                      <div className="h-20 mb-2 overflow-hidden">
                        <p className="font-sans text-sm text-charcoal-light leading-relaxed line-clamp-3">
                          {paper.abstract || paper.description}
                        </p>
                      </div>

                      <div className="h-6 mb-6 flex items-center">
                        {(paper.abstract || paper.description || '').length > 120 ? (
                          <button
                            onClick={() => setActivePaper(paper)}
                            className="text-xs font-semibold text-olive hover:text-gold-accent transition-colors duration-300 flex items-center gap-1 cursor-pointer"
                          >
                            Read More
                            <span className="material-symbols-outlined text-xs">arrow_right</span>
                          </button>
                        ) : (
                          <span className="block h-6" />
                        )}
                      </div>
                    </div>

                    <div className="space-y-3 pt-6 border-t border-charcoal/5">
                      {(paper.paperUrl || paper.pdfUrl) && (
                        <a
                          href={paper.paperUrl || paper.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center gap-2 text-xs font-sans font-bold uppercase tracking-wider transition-all cursor-pointer ${paper.type === 'published' ? 'text-olive hover:text-gold-accent' : 'text-gold-accent hover:text-olive'
                            }`}
                        >
                          Read Publication
                          <span className="material-symbols-outlined text-[16px] transition-transform group-hover:translate-x-1">arrow_forward</span>
                        </a>
                      )}
                      {paper.type === 'presented' && paper.images && paper.images.length > 0 && (
                        <button
                          onClick={() => { setActivePaperSlides(paper); setSlideIndex(0); }}
                          className="flex items-center gap-2 text-xs font-sans font-bold uppercase tracking-wider text-gold-accent hover:text-olive transition-colors cursor-pointer w-full text-left"
                        >
                          <span className="material-symbols-outlined text-[18px]">slideshow</span>
                          View Slides &amp; Media ({paper.images.length})
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>

          {/* View All Publications Button */}
          {researchPapers.length > 6 && (
            <div className="flex justify-center mt-16" id="view-all-papers-btn">
              <a
                href="/papers"
                className="inline-flex items-center gap-2 px-8 py-4 bg-olive hover:bg-olive/90 text-cream-lightest font-sans font-bold text-sm uppercase tracking-widest rounded-full shadow-sm hover:shadow-md transition-all duration-300 group"
              >
                View All Publications
                <span className="material-symbols-outlined transition-transform duration-300 group-hover:translate-x-1">
                  arrow_forward
                </span>
              </a>
            </div>
          )}
        </div>
      </section>


      {/* Intellectual Vistas (Summits) */}
      <section className="section-padding premium-glow-alt-1 relative overflow-hidden" id="vistas">


        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop relative z-10">
          <div className="text-center mb-20">
            <span className="font-label-md text-gold-accent uppercase tracking-widest text-xs font-bold block mb-3">Exploring the Summits</span>
            <h2 className="font-headline-lg text-4xl md:text-5xl text-charcoal font-extrabold uppercase tracking-wider leading-tight">Intellectual Vistas</h2>
            <p className="font-serif-italic text-lg text-charcoal-light mt-4">Keynotes, discussions, and leadership in ecological discourses</p>
            <div className="w-16 h-1 bg-olive/45 mx-auto mt-6 rounded-full"></div>
          </div>
          <div className="space-y-24">
            {featuredVistas.map((vista, idx) => (
              <VistaItem key={vista._id || idx} vista={vista} idx={idx} />
            ))}
          </div>

          {/* Show All Vistas / Summits Redirect Button */}
          {intellectualVistas.length > 3 && (
            <div className="flex justify-center mt-16" id="view-all-vistas-btn">
              <a
                href="/vistas"
                className="inline-flex items-center gap-2 px-8 py-4 bg-olive hover:bg-olive/90 text-cream-lightest font-sans font-bold text-sm uppercase tracking-widest rounded-full shadow-sm hover:shadow-md transition-all duration-300 group"
              >
                Show All Visits
                <span className="material-symbols-outlined transition-transform duration-300 group-hover:translate-x-1">
                  arrow_forward
                </span>
              </a>
            </div>
          )}
        </div>
      </section>


      {/* Blogs */}
      <section className="section-padding bg-cream-lightest relative overflow-hidden" id="blogs">

        {/* Centered Header Container */}
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop relative z-10 mb-16">
          <div className="border-b border-charcoal/5 pb-8">
            <span className="font-label-md text-gold-accent uppercase tracking-widest text-xs font-bold block mb-3">Wending Writer</span>
            <h2 className="font-headline-lg text-4xl md:text-5xl text-charcoal font-extrabold uppercase tracking-wider leading-tight">Latest Blogs</h2>
            <p className="font-serif-italic text-lg text-charcoal-light mt-4">Thoughts, essays, and critiques on green governance</p>
          </div>
        </div>

        {/* Edge-to-Edge Marquee Container */}
        <div className="w-full relative z-10">
          {blogs.length > 0 ? (
            <div className="marquee-container">
              <div className="marquee-wrapper">
                {[...blogs, ...blogs, ...blogs, ...blogs].map((blog, idx) => {
                  const uniqueKey = `${blog._id || idx}-marquee-${idx}`;
                  const cleanContent = blog.content
                    ? blog.content.replace(/<[^>]*>/g, "").replace(/[#*`>]/g, "").trim().slice(0, 120) + "..."
                    : "";
                  return (
                    <article
                      key={uniqueKey}
                      onClick={() => setActiveBlog(blog)}
                      className="group relative overflow-hidden rounded-[2.5rem] glassmorphism-premium border border-charcoal/10 hover:border-olive/20 hover:shadow-xl transition-all duration-500 marquee-card-landscape"
                    >
                      {/* Left: Cover Image */}
                      <div className="w-[40%] sm:w-[45%] h-full relative overflow-hidden shrink-0">
                        <img
                          alt={blog.title}
                          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-1000"
                          src={`/api/images/${blog.coverImage}`}
                        />
                        <div className="absolute inset-0 bg-charcoal/10 group-hover:bg-charcoal/0 transition-colors duration-500"></div>
                      </div>

                      {/* Right: Text Details */}
                      <div className="w-[60%] sm:w-[55%] p-6 md:p-8 flex flex-col justify-between h-full">
                        <div className="space-y-3">
                          <div className="flex gap-2 flex-wrap items-center">
                            {blog.tags?.slice(0, 2).map((tag, tagIdx) => (
                              <span
                                key={tagIdx}
                                className={`text-[8px] uppercase font-sans font-bold tracking-widest px-2.5 py-0.5 rounded-full ${tagIdx % 2 === 0
                                  ? 'bg-olive/10 text-olive border border-olive/5'
                                  : 'bg-gold-accent/10 text-gold-accent border border-gold-accent/5'
                                  }`}
                              >
                                {tag}
                              </span>
                            ))}
                            <span className="text-[8px] uppercase font-sans font-bold tracking-widest text-charcoal-light px-2.5 py-0.5 bg-cream-medium/20 rounded-full">
                              {blog.date}
                            </span>
                          </div>

                          <h3 className="font-sans-ultra-bold text-sm md:text-base text-charcoal uppercase leading-tight group-hover:text-olive transition-colors duration-300 line-clamp-2">
                            {blog.title}
                          </h3>

                          <p className="font-sans text-[10px] md:text-xs text-charcoal-light leading-relaxed line-clamp-3">
                            {cleanContent}
                          </p>
                        </div>

                        <div>
                          <button
                            onClick={(e) => { e.stopPropagation(); setActiveBlog(blog); }}
                            className="inline-flex items-center gap-1.5 text-2xs font-sans font-bold uppercase tracking-widest text-olive hover:text-gold-accent transition-all cursor-pointer"
                          >
                            Read Narrative
                            <span className="material-symbols-outlined text-xs transition-transform group-hover:translate-x-1">arrow_forward</span>
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
              <p className="text-center text-charcoal-light py-8">No blogs published yet.</p>
            </div>
          )}
        </div>
      </section>


      {/* Excellence Badges */}
      <section className="section-padding bg-gradient-to-b from-cream-lightest to-cream-medium relative overflow-hidden" id="accolades">

        <div className="absolute left-0 bottom-0 w-80 h-80 bg-olive/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">

            {/* Left Column: Interactive Luxury Credentials Cards */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-8 lg:order-1 order-2">
              {certificates.map((cert, idx) => {
                const bgs = idx % 2 === 0 ? "bg-pastel-purple/15 hover:bg-pastel-purple/25" : "bg-pastel-peach/15 hover:bg-pastel-peach/25";
                return (
                  <div
                    key={cert._id || idx}
                    onClick={() => setActiveCertificate(cert)}
                    className={`glassmorphism-premium border border-charcoal/10 rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden flex flex-col justify-between group cursor-pointer hover:shadow-xl hover:-translate-y-2 transition-all duration-500 ${bgs}`}
                  >
                    {/* Subtle Security Radial Gradient Background */}
                    <div className="absolute -right-20 -top-20 w-48 h-48 rounded-full bg-gold-accent/5 group-hover:bg-gold-accent/10 transition-colors duration-500 blur-2xl pointer-events-none"></div>

                    <div>
                      {/* Certificate Image Preview */}
                      {cert.image && (
                        <div className="w-full h-44 rounded-2xl overflow-hidden mb-6 relative group/img border border-charcoal/5 shadow-inner bg-white/95 p-1.5 flex items-center justify-center">
                          <img
                            alt={cert.title}
                            src={`/api/images/${cert.image}`}
                            className="max-w-full max-h-full object-contain rounded-lg transition-transform duration-700 group-hover/img:scale-103"
                          />
                          <div className="absolute inset-0 bg-charcoal/10 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-lg">
                            <span className="bg-[#FFFDF9]/95 text-charcoal font-sans font-bold text-[10px] uppercase tracking-widest px-3.5 py-2 rounded-full shadow-md flex items-center gap-1.5 backdrop-blur-xs transform translate-y-2 group-hover/img:translate-y-0 transition-all duration-300">
                              <span className="material-symbols-outlined text-xs">zoom_in</span>
                              Expand Certificate
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Golden Emblem badge and Issuer Info */}
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 shrink-0 rounded-xl bg-gold-accent/10 border border-gold-accent/20 flex items-center justify-center shadow-xs group-hover:scale-105 group-hover:rotate-6 transition-all duration-500">
                          <span className="material-symbols-outlined text-gold-accent text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                            {idx === 0 ? 'verified' : 'verified_user'}
                          </span>
                        </div>
                        <div>
                          {/* Official Subtitle */}
                          <span className="text-[9px] text-gold-accent font-sans font-bold uppercase tracking-widest block">{cert.issuer || "UGC / NTA"}</span>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="font-sans-ultra-bold text-lg text-charcoal uppercase leading-tight mb-4 min-h-[3.5rem] group-hover:text-olive transition-colors duration-300">
                        {cert.title}
                      </h3>
                    </div>

                    {/* Verification Capsules and Actions */}
                    <div className="pt-6 border-t border-charcoal/5 space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="bg-emerald-900/5 text-emerald-800 border border-emerald-600/10 text-[9px] uppercase font-sans font-bold tracking-widest px-3 py-1 rounded-full inline-flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">check_circle</span> VERIFIED
                        </span>
                        <span className="text-[10px] text-charcoal-light font-bold uppercase tracking-wider">{cert.date || "2026"}</span>
                      </div>

                      <button className="flex items-center gap-2 text-xs font-sans font-bold uppercase tracking-widest text-olive group-hover:text-gold-accent transition-colors duration-300 w-full text-left">
                        View Certificate
                        <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Column: Heading and description */}
            <div className="lg:col-span-5 space-y-6 text-center lg:order-2 order-1">
              <span className="font-label-md text-gold-accent uppercase tracking-widest text-xs font-bold block mb-3">National Accolades</span>
              <h2 className="font-headline-lg text-4xl md:text-5xl text-charcoal font-extrabold uppercase tracking-wider leading-tight">Academic Excellence</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-gold-accent/20 via-gold-accent to-gold-accent/20 mx-auto rounded-full"></div>
              <p className="font-sans text-charcoal-light text-base md:text-lg leading-relaxed max-w-xl mx-auto">
                Validated by national standards of research and teaching excellence in Political Science, ensuring a rigorous approach to ecological studies and green policy analysis.
              </p>
              <div className="pt-4 flex justify-center items-center gap-2 text-[10px] text-charcoal-light uppercase font-bold tracking-widest">
                <span className="material-symbols-outlined text-emerald-700 text-lg">verified</span> Government of India Accredited
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-charcoal text-cream-lightest w-full relative z-10 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold-accent/50 to-transparent"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-olive/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-gold-accent/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-24 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 items-center border-b border-cream-lightest/10 pb-16 mb-12">

            <div className="md:col-span-5 space-y-6 text-center md:text-left">
              <span className="font-serif-italic text-5xl text-cream-lightest font-bold block drop-shadow-sm">Jahnvi.</span>
              <p className="font-sans text-base text-cream-lightest/70 max-w-sm leading-relaxed mx-auto md:mx-0">
                Intellectualism in harmony with nature. Exploring the depths of political ecology and sustainable governance.
              </p>
            </div>

            <div className="md:col-span-7 flex flex-wrap justify-center md:justify-end gap-x-8 gap-y-6">
              {profile.contact?.linkedin && (
                <a className="group relative text-cream-lightest/80 hover:text-gold-accent transition-colors duration-300 font-sans font-bold text-sm uppercase tracking-wider" href={profile.contact.linkedin} target="_blank" rel="noopener noreferrer">
                  LinkedIn
                  <span className="block w-0 group-hover:w-full transition-all duration-300 h-0.5 bg-gold-accent absolute -bottom-1 left-0"></span>
                </a>
              )}
              {profile.contact?.googleScholar && (
                <a className="group relative text-cream-lightest/80 hover:text-gold-accent transition-colors duration-300 font-sans font-bold text-sm uppercase tracking-wider" href={profile.contact.googleScholar} target="_blank" rel="noopener noreferrer">
                  Scholar
                  <span className="block w-0 group-hover:w-full transition-all duration-300 h-0.5 bg-gold-accent absolute -bottom-1 left-0"></span>
                </a>
              )}
              {profile.contact?.researchGate && (
                <a className="group relative text-cream-lightest/80 hover:text-gold-accent transition-colors duration-300 font-sans font-bold text-sm uppercase tracking-wider" href={profile.contact.researchGate} target="_blank" rel="noopener noreferrer">
                  ResearchGate
                  <span className="block w-0 group-hover:w-full transition-all duration-300 h-0.5 bg-gold-accent absolute -bottom-1 left-0"></span>
                </a>
              )}
              {profile.contact?.github && (
                <a className="group relative text-cream-lightest/80 hover:text-gold-accent transition-colors duration-300 font-sans font-bold text-sm uppercase tracking-wider" href={profile.contact.github} target="_blank" rel="noopener noreferrer">
                  GitHub
                  <span className="block w-0 group-hover:w-full transition-all duration-300 h-0.5 bg-gold-accent absolute -bottom-1 left-0"></span>
                </a>
              )}
              {profile.contact?.orcid && (
                <a className="group relative text-cream-lightest/80 hover:text-gold-accent transition-colors duration-300 font-sans font-bold text-sm uppercase tracking-wider" href={profile.contact.orcid} target="_blank" rel="noopener noreferrer">
                  ORCID
                  <span className="block w-0 group-hover:w-full transition-all duration-300 h-0.5 bg-gold-accent absolute -bottom-1 left-0"></span>
                </a>
              )}
              {profile.contact?.email && (
                <a className="group relative text-cream-lightest/80 hover:text-gold-accent transition-colors duration-300 font-sans font-bold text-sm uppercase tracking-wider" href={`mailto:${profile.contact.email}`}>
                  Email
                  <span className="block w-0 group-hover:w-full transition-all duration-300 h-0.5 bg-gold-accent absolute -bottom-1 left-0"></span>
                </a>
              )}
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-cream-lightest/50 font-sans text-sm">
            <p className="order-2 md:order-1">© 2026 Jahnvi. All rights reserved.</p>
            <div className="order-1 md:order-2 flex items-center gap-3">
              <span className="w-8 h-px bg-gold-accent/30 hidden md:block"></span>
              <span className="text-xs text-gold-accent font-sans font-bold uppercase tracking-[0.2em]">Sarva Saha • Equilibrium</span>
              <span className="w-8 h-px bg-gold-accent/30 hidden md:block"></span>
            </div>
          </div>
        </div>
      </footer>

      {/* ================================================================ */}
      {/* ======================= MODAL SYSTEM =========================== */}
      {/* ================================================================ */}

      {/* 1. Blog Reader Drawer / Slide-Over Modal */}
      {activeBlog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-end bg-black/60 backdrop-blur-md transition-all animate-fade-in" onClick={() => setActiveBlog(null)}>
          <div className="relative w-full max-w-4xl h-full bg-[#FFFDF9] overflow-y-auto p-8 md:p-16 shadow-2xl flex flex-col border-l border-charcoal/5 animate-slide-in" onClick={(e) => e.stopPropagation()}>
            {/* Sticky Close Header */}
            <div className="flex justify-between items-center mb-8 border-b pb-4 border-charcoal/10">
              <div className="flex gap-2">
                {activeBlog.tags?.map((tag, i) => (
                  <span key={i} className="text-xs uppercase font-sans font-bold tracking-widest px-3 py-1 bg-olive/10 text-olive rounded-full">{tag}</span>
                ))}
              </div>
              <button
                onClick={() => setActiveBlog(null)}
                className="flex items-center gap-2 px-4 py-2 bg-charcoal/5 hover:bg-charcoal/10 text-charcoal rounded-full font-sans text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border border-charcoal/10"
              >
                <span className="material-symbols-outlined text-lg">close</span>
                Close
              </button>
            </div>

            {/* Content Container */}
            <div className="space-y-8 animate-fade-in">
              <h1 className="font-sans-ultra-bold text-3xl md:text-5xl text-charcoal uppercase leading-tight">{activeBlog.title}</h1>
              <p className="font-serif-italic text-base text-gold-accent">{activeBlog.date} • {activeBlog.readTime || "5 min read"}</p>

              <div className="w-full h-[380px] rounded-[2rem] overflow-hidden shadow-lg border border-charcoal/5">
                <img alt={activeBlog.title} className="w-full h-full object-cover animate-scale-up" src={`/api/images/${activeBlog.coverImage}`} />
              </div>

              {/* Render parsed markdown text or rich HTML */}
              <div className="mt-12 max-w-3xl mx-auto pb-24 prose prose-emerald prose-lg text-charcoal-light leading-relaxed">
                {activeBlog.content && (activeBlog.content.trim().startsWith("<") || activeBlog.content.includes("</") || activeBlog.content.includes("<p>")) ? (
                  <div dangerouslySetInnerHTML={{ __html: activeBlog.content }} className="space-y-6 rich-text-content" />
                ) : (
                  renderMarkdown(activeBlog.content)
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Paper Presentation Slides Modal */}
      {activePaperSlides && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-lg transition-all" onClick={() => setActivePaperSlides(null)}>
          <div className="relative w-full max-w-5xl h-full md:h-auto max-h-[95vh] p-6 flex flex-col justify-between text-white bg-charcoal/40 rounded-3xl backdrop-blur-xl border border-white/10 m-4 animate-scale-up" onClick={(e) => e.stopPropagation()}>

            {/* Header */}
            <div className="w-full flex justify-between items-center border-b border-white/10 pb-4 mb-4">
              <div className="space-y-1 pr-6">
                <h2 className="font-sans-ultra-bold text-xl md:text-2xl text-gold-accent leading-tight uppercase">{activePaperSlides.title}</h2>
                <p className="text-xs md:text-sm opacity-60 leading-relaxed font-sans">Venue: {activePaperSlides.venue}</p>
              </div>
              <button
                onClick={() => { setActivePaperSlides(null); setSlideIndex(0); }}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full font-sans text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border border-white/10 shrink-0"
              >
                <span className="material-symbols-outlined text-lg">close</span>
                Close
              </button>
            </div>

            {/* Slide Visual Container */}
            <div className="relative flex items-center justify-center w-full aspect-[16/10] bg-black/40 rounded-2xl overflow-hidden border border-white/10 group">
              <img
                alt={`Presentation slide ${slideIndex + 1}`}
                className="max-w-full max-h-full object-contain transition-all duration-300 animate-fade-in"
                src={`/api/images/${activePaperSlides.images[slideIndex]}`}
              />

              {activePaperSlides.images.length > 1 && (
                <>
                  <button
                    onClick={() => setSlideIndex((prev) => (prev - 1 + activePaperSlides.images.length) % activePaperSlides.images.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/40 hover:bg-black/75 flex items-center justify-center transition-all backdrop-blur-sm z-20 text-white cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-3xl">chevron_left</span>
                  </button>
                  <button
                    onClick={() => setSlideIndex((prev) => (prev + 1) % activePaperSlides.images.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/40 hover:bg-black/75 flex items-center justify-center transition-all backdrop-blur-sm z-20 text-white cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-3xl">chevron_right</span>
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Strip */}
            <div className="w-full mt-6 shrink-0">
              <div className="flex justify-between items-center text-xs opacity-60 mb-2 font-sans font-bold uppercase tracking-wider">
                <span>Slide {slideIndex + 1} of {activePaperSlides.images.length}</span>
                <span>Select a thumbnail to jump</span>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 justify-start md:justify-center">
                {activePaperSlides.images.map((img, i) => (
                  <div
                    key={i}
                    onClick={() => setSlideIndex(i)}
                    className={`w-20 md:w-24 aspect-[16/10] rounded-xl overflow-hidden cursor-pointer transition-all border-2 ${i === slideIndex ? 'border-gold-accent scale-105 shadow-lg opacity-100' : 'border-transparent opacity-40 hover:opacity-100'}`}
                  >
                    <img alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" src={`/api/images/${img}`} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Certificate Lightbox Modal */}
      {activeCertificate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md transition-all" onClick={() => setActiveCertificate(null)}>
          <div className="relative w-full max-w-3xl p-6 flex flex-col items-center bg-[#FFFDF9] rounded-[2.5rem] border border-charcoal/10 text-charcoal shadow-2xl animate-scale-up m-4" onClick={(e) => e.stopPropagation()}>
            <div className="w-full flex justify-between items-center border-b pb-4 mb-4 border-charcoal/10">
              <div className="space-y-1 pr-6 text-left">
                <h2 className="font-sans-ultra-bold text-xl md:text-2xl text-olive uppercase leading-tight">{activeCertificate.title}</h2>
                <p className="text-xs md:text-sm text-charcoal-light font-sans font-semibold leading-relaxed">Issued by: {activeCertificate.issuer} ({activeCertificate.date})</p>
              </div>
              <button
                onClick={() => setActiveCertificate(null)}
                className="flex items-center justify-center w-10 h-10 bg-charcoal/5 hover:bg-charcoal/10 text-charcoal rounded-full transition-all cursor-pointer shrink-0 border border-charcoal/10"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Image display */}
            <div className="w-full max-h-[55vh] overflow-hidden rounded-2xl border bg-white flex items-center justify-center p-2 shadow-inner">
              <img
                alt={activeCertificate.title}
                className="max-h-[50vh] object-contain rounded-lg shadow-sm"
                src={`/api/images/${activeCertificate.image}`}
              />
            </div>

            {activeCertificate.verificationUrl && (
              <a
                href={activeCertificate.verificationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 px-6 py-2.5 bg-olive text-cream-lightest rounded-full font-sans text-xs font-bold uppercase tracking-widest hover:bg-olive-dark hover:scale-102 transition-all flex items-center gap-2 cursor-pointer shadow-md"
              >
                Verify Official Link <span className="material-symbols-outlined text-lg">north_east</span>
              </a>
            )}
          </div>
        </div>
      )}

      {/* 4. Research Paper Details Modal */}
      {activePaper && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-md transition-all animate-fade-in" onClick={() => setActivePaper(null)}>
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#FFFDF9] rounded-[2.5rem] border border-charcoal/10 text-charcoal shadow-2xl animate-scale-up p-8 md:p-12 m-4" onClick={(e) => e.stopPropagation()}>

            {/* Header / Title */}
            <div className="w-full flex justify-between items-start border-b pb-6 mb-6 border-charcoal/10">
              <div className="space-y-2 pr-6">
                <span className={`inline-block px-3 py-1 text-[10px] font-sans font-bold uppercase rounded-full tracking-wider ${activePaper.type === 'published'
                  ? 'bg-olive/10 text-olive border border-olive/10'
                  : 'bg-gold-accent/10 text-gold-accent border border-gold-accent/10'
                  }`}>
                  {activePaper.type} • {activePaper.date}
                </span>
                <h2 className="font-sans-ultra-bold text-2xl md:text-3xl text-charcoal uppercase leading-tight">{activePaper.title}</h2>
                <div className="text-xs font-semibold text-warm-gray">
                  Venue: <span className="text-charcoal-light italic">{activePaper.venue}</span>
                </div>
                {activePaper.award && (
                  <div className="inline-flex items-center gap-1.5 text-xs font-sans font-bold text-gold-accent uppercase tracking-widest mt-1">
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
                    {activePaper.award}
                  </div>
                )}
              </div>
              <button
                onClick={() => setActivePaper(null)}
                className="flex items-center justify-center w-10 h-10 bg-charcoal/5 hover:bg-charcoal/10 text-charcoal rounded-full transition-all cursor-pointer shrink-0 border border-charcoal/10"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Slides / Media Carousel inside modal if slides are present! */}
            {activePaper.images && activePaper.images.length > 0 && (
              <div className="mb-8 space-y-3">
                <h4 className="text-xs font-sans-ultra-bold text-charcoal uppercase tracking-widest">
                  {activePaper.type === 'published' ? 'Document & Associated Figures' : 'Presentation Slides & Media'}
                </h4>
                <div className="relative w-full min-h-[250px] max-h-[50vh] bg-black/5 rounded-2xl overflow-hidden border border-charcoal/10 flex items-center justify-center p-2">
                  <img
                    alt={`Slide preview`}
                    className="max-w-full max-h-[48vh] object-contain rounded-lg shadow-sm transition-transform duration-300 hover:scale-[1.01]"
                    src={`/api/images/${activePaper.images[slideIndex < activePaper.images.length ? slideIndex : 0]}`}
                  />
                  {activePaper.images.length > 1 && (
                    <>
                      <button
                        onClick={() => setSlideIndex((prev) => (prev - 1 + activePaper.images.length) % activePaper.images.length)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#FFFDF9]/80 hover:bg-[#FFFDF9] text-charcoal flex items-center justify-center transition-all shadow-md z-20 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">chevron_left</span>
                      </button>
                      <button
                        onClick={() => setSlideIndex((prev) => (prev + 1) % activePaper.images.length)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#FFFDF9]/80 hover:bg-[#FFFDF9] text-charcoal flex items-center justify-center transition-all shadow-md z-20 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">chevron_right</span>
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
                        className={`w-16 aspect-[16/10] rounded-lg overflow-hidden cursor-pointer transition-all border-2 shrink-0 ${(slideIndex < activePaper.images.length ? slideIndex : 0) === i
                          ? 'border-gold-accent scale-102 opacity-100 shadow-sm'
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
            <div className="space-y-6">
              {activePaper.abstract && (
                <div className="space-y-3">
                  <h4 className="text-xs font-sans-ultra-bold text-charcoal uppercase tracking-widest">Research Abstract</h4>
                  <p className="font-sans text-base text-charcoal-light leading-relaxed whitespace-pre-line select-text">
                    {activePaper.abstract}
                  </p>
                </div>
              )}
              {activePaper.description && activePaper.description !== activePaper.abstract && (
                <div className="space-y-3">
                  <h4 className="text-xs font-sans-ultra-bold text-charcoal uppercase tracking-widest">Overview & Key Insights</h4>
                  <p className="font-sans text-base text-charcoal-light leading-relaxed whitespace-pre-line select-text">
                    {activePaper.description}
                  </p>
                </div>
              )}
            </div>

            {/* Footer / Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mt-8 pt-6 border-t border-charcoal/10">
              <div className="flex flex-wrap gap-4">
                {(activePaper.paperUrl || activePaper.pdfUrl) && (
                  <a
                    href={activePaper.paperUrl || activePaper.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-sans text-xs font-bold uppercase tracking-widest transition-all cursor-pointer text-white ${activePaper.type === 'published'
                      ? 'bg-olive hover:bg-olive-dark shadow-md'
                      : 'bg-gold-accent hover:bg-amber-800 shadow-md'
                      }`}
                  >
                    Read Publication
                    <span className="material-symbols-outlined text-sm">north_east</span>
                  </a>
                )}
              </div>
              <button
                onClick={() => setActivePaper(null)}
                className="w-full sm:w-auto px-6 py-2.5 bg-charcoal/5 hover:bg-charcoal/10 text-charcoal border border-charcoal/10 rounded-full font-sans text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer"
              >
                Close Window
              </button>
            </div>

          </div>
        </div>
      )}

    </main>
  );
}
