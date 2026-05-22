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

export default function Home() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // New premium interactive states
  const [activeBlog, setActiveBlog] = useState(null);
  const [activePaperSlides, setActivePaperSlides] = useState(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const [activeCertificate, setActiveCertificate] = useState(null);

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

  // Mouse follower effect
  useEffect(() => {
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

    // Timeline Items Animation
    gsap.utils.toArray('.timeline-item').forEach((item, i) => {
      gsap.fromTo(item, 
        { x: i % 2 === 0 ? -60 : 60, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 1.2,
          ease: "power4.out",
          scrollTrigger: {
            trigger: item,
            start: "top 85%",
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
          if (self.direction === 1) {
            nav.classList.add('py-2.5', 'bg-white/90', 'shadow-xs');
            nav.classList.remove('py-4.5', 'bg-white/40');
          } else if (self.scroll() < 50) {
            nav.classList.add('py-4.5', 'bg-white/40');
            nav.classList.remove('py-2.5', 'bg-white/90', 'shadow-xs');
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
  const blogs = data?.blogs || [];
  const certificates = data?.certificates || [];

  return (
    <main ref={containerRef} className="relative">
      <div id="light-effect" ref={lightEffectRef}></div>
      
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-[60] bg-white/40 backdrop-blur-xl border-b border-charcoal/5 px-6 py-4.5 md:px-12 transition-all duration-300">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <a href="#intro" className="font-serif-italic text-2xl font-bold tracking-tight text-charcoal">Jahnvi.</a>
          
          <div className="hidden md:flex gap-8 items-center">
            <a className="font-sans font-medium text-sm tracking-wide text-charcoal hover:text-secondary transition-colors duration-300" href="#intro">Home</a>
            <a className="font-sans font-medium text-sm tracking-wide text-charcoal-light hover:text-secondary transition-colors duration-300" href="#research">Works</a>
            <a className="font-sans font-medium text-sm tracking-wide text-charcoal-light hover:text-secondary transition-colors duration-300" href="#background">About</a>
            <a className="font-sans font-medium text-sm tracking-wide text-charcoal-light hover:text-secondary transition-colors duration-300" href="#vistas">Services</a>
            <a className="font-sans font-medium text-sm tracking-wide text-charcoal-light hover:text-secondary transition-colors duration-300" href="#blogs">Testimonial</a>
          </div>

          <a href="#accolades" className="hidden md:inline-block px-7 py-2.5 bg-charcoal text-white rounded-full font-sans font-semibold text-xs tracking-wider uppercase hover:bg-charcoal/90 transition-all duration-300">
            Contact
          </a>

          <div className="md:hidden">
            <span className="material-symbols-outlined text-charcoal cursor-pointer">menu</span>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col justify-between pt-28 pb-12 overflow-hidden premium-glow-bg select-text" id="intro">
        {/* Background Italic Text "Hey, there" */}
        <div className="absolute inset-x-0 top-[28%] md:top-[12%] text-center z-0 pointer-events-none select-none flex justify-center items-center gap-[10rem] md:gap-[26rem] xl:gap-[36rem]">
          <h2 className="hero-bg-text font-serif-italic text-[26vw] md:text-[16vw] font-light text-charcoal leading-none tracking-tight">Hey,</h2>
          <h2 className="hero-bg-text font-serif-italic text-[26vw] md:text-[16vw] font-light text-charcoal leading-none tracking-tight">there</h2>
        </div>

        {/* Central visual items */}
        <div className="relative w-full max-w-5xl mx-auto flex flex-col items-center justify-center flex-grow z-10 px-6 py-4">
          
          {/* Left badge */}
          <div className="hero-badge-left absolute left-4 md:left-12 top-[60%] md:top-[65%] -translate-y-1/2 z-20">
            <div className="glassmorphism-premium border border-charcoal/10 rounded-full px-5 py-2.5 flex items-center gap-2.5 text-xs font-semibold shadow-xs transition-all duration-500 hover:scale-105">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500 glow-dot-amber"></span>
              </span>
              <span className="text-charcoal-light font-medium tracking-wide">Available for collaborations</span>
            </div>
          </div>

          {/* Right small desc */}
          <div className="hero-desc-right absolute right-4 md:right-12 top-[60%] md:top-[65%] -translate-y-1/2 z-20 max-w-[160px] md:max-w-[200px] text-right md:text-left">
            <p className="text-xs md:text-sm font-semibold leading-relaxed text-charcoal-light tracking-wide">
              Specialized in Political Ecology, Green Governance, and Sustainable Development.
            </p>
          </div>
        </div>

        {/* Centered Image - Positioned at Bottom Center */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[350px] md:max-w-[500px] xl:max-w-[650px] z-10 pointer-events-none flex items-end" id="portrait-wrapper">
          <img 
            alt="Profile" 
            className="w-full h-auto object-contain object-bottom pointer-events-auto transition-transform duration-700 hover:scale-[1.02]" 
            id="hero-image" 
            src="/avatar.png"
            style={{ filter: "drop-shadow(0 10px 25px rgba(0,0,0,0.15))" }}
          />
        </div>

        {/* Bottom stylized typography */}
        <div className="w-full max-w-[95rem] mx-auto px-4 md:px-8 xl:px-12 flex flex-col md:flex-row justify-between items-end gap-4 z-50 select-none pb-6 relative pointer-events-none">
          <h1 className="hero-bottom-title font-sans-ultra-bold text-[4.2rem] md:text-[6.5rem] xl:text-[7.5rem] uppercase leading-[0.85] text-charcoal tracking-tighter whitespace-nowrap relative pointer-events-auto md:-translate-x-12 xl:-translate-x-24">
            I AM <span className="block">{profile?.name || "JAHNVI"}</span>
          </h1>
          <h2 className="hero-bottom-title font-sans-ultra-bold text-4xl md:text-[4rem] xl:text-[5.5rem] uppercase leading-[0.85] text-charcoal text-left md:text-right tracking-tighter whitespace-nowrap relative pointer-events-auto md:translate-x-16 xl:translate-x-32">
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20 items-start">
            <div className="lg:col-span-4" id="statement-heading">
              <span className="font-label-md text-gold-accent uppercase tracking-widest text-xs font-bold block mb-3">Core Philosophy</span>
              <h2 className="font-headline-lg text-4xl md:text-5xl text-charcoal font-bold leading-tight">My Research Statement</h2>
              <div className="w-16 h-1 bg-olive mt-6 rounded-full"></div>
            </div>
            <div className="lg:col-span-8 space-y-8" id="statement-content">
              {/* Quote layout - glassmorphism wrapper */}
              <div className="glassmorphism-premium border border-olive/10 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden">
                <span className="absolute -left-2 -top-12 text-[10rem] text-olive/5 font-serif-italic select-none pointer-events-none">“</span>
                <p className="font-serif-italic text-2xl md:text-3xl text-olive leading-relaxed relative z-10">
                  'Sarva Saha' — <span className="text-gold-accent font-sans-ultra-bold font-normal not-italic">संस्कृत:</span> A harmonious, organic equilibrium and co-existence between humanity, green policies, and our biospheric boundaries.
                </p>
              </div>
              <div className="font-sans text-lg text-charcoal-light leading-relaxed space-y-6 max-w-3xl">
                <p>{profile?.bioIntro || "My intellectual journey is rooted in the critical intersections of Political Science and Environmental Governance..."}</p>
                <p>{profile?.bioSecondary || "My roots lie in a family of Business minds and Entrepreneurs..."}</p>
              </div>
            </div>
          </div>

          {/* Domain Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6">
            {researchInterests.map((interest, idx) => (
              <div 
                key={interest._id || idx} 
                className="glassmorphism-premium p-10 rounded-[2.5rem] border border-charcoal/10 hover:border-olive/30 hover:-translate-y-2 transition-all duration-300 group flex flex-col justify-between"
              >
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-olive/5 flex items-center justify-center mb-8 group-hover:scale-105 transition-transform duration-300">
                    <span className="material-symbols-outlined text-olive text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {getInterestIcon(interest.iconName)}
                    </span>
                  </div>
                  <h3 className="font-sans-ultra-bold text-xl uppercase tracking-tight text-charcoal mb-4">{interest.title}</h3>
                  <p className="font-sans text-sm text-charcoal-light leading-relaxed">{interest.description}</p>
                </div>
                <div className="w-12 h-1 bg-gold-accent/20 mt-8 rounded-full group-hover:w-20 group-hover:bg-gold-accent/40 transition-all duration-300"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Academic Background (Timeline) */}
      <section className="section-padding bg-cream-light relative overflow-hidden" id="background">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(253,230,138,0.2),transparent_40%)] pointer-events-none"></div>
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop text-center mb-20 relative z-10">
          <span className="font-label-md text-gold-accent uppercase tracking-widest text-xs font-bold block mb-3">Scholastic Journey</span>
          <h2 className="font-headline-lg text-4xl md:text-5xl text-charcoal font-bold">Academic Background</h2>
          <p className="font-serif-italic text-lg text-charcoal-light mt-4">A journey of scholarship and continuous evolution</p>
          <div className="w-20 h-1 bg-gold-accent mx-auto mt-6 rounded-full"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-margin-mobile relative z-10">
          {/* Center Line */}
          <div className="absolute left-1/2 -translate-x-1/2 w-px h-full bg-charcoal/10 hidden md:block"></div>
          
          <div className="space-y-20">
            {timelineEvents.map((event, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <div key={event._id || idx} className="relative grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 timeline-item">
                  {/* Left/Alternating Column */}
                  <div className={`${isEven ? "md:text-right md:pr-4" : "md:order-2 md:pl-4"} flex flex-col justify-center`}>
                    <div className="mb-2">
                      <span className="inline-block px-4 py-1.5 bg-olive text-cream-lightest rounded-full font-sans font-bold text-xs uppercase tracking-wider shadow-xs">
                        {event.period}
                      </span>
                    </div>
                    <h4 className="font-sans-ultra-bold text-xl md:text-2xl text-charcoal leading-tight uppercase">{event.title}</h4>
                    <p className="font-serif-italic text-base text-gold-accent mt-1">{event.institution}</p>
                    {event.grade && (
                      <div className={`mt-3 ${isEven ? "md:justify-end" : "md:justify-start"} flex`}>
                        <span className="inline-block text-[10px] font-sans font-bold uppercase tracking-widest text-olive px-3 py-1 bg-olive/5 rounded-full border border-olive/10">
                          {event.grade}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Timeline dot */}
                  <div className="hidden md:block absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-4 border-cream-light bg-gold-accent z-20 shadow-md top-[calc(50%-8px)]"></div>

                  {/* Right/Alternating Column (details card) */}
                  <div className={`${!isEven ? "md:text-right md:order-1 md:pr-4" : "md:pl-4"} flex items-center`}>
                    <div 
                      className={`w-full p-8 glassmorphism-premium rounded-3xl border transition-all duration-300 hover:shadow-lg ${
                        event.isHighlight 
                          ? 'border-gold-accent/30 bg-gold-accent/5 shadow-xs' 
                          : isEven 
                            ? 'border-l-4 border-l-gold-accent border-r-charcoal/10 border-t-charcoal/10 border-b-charcoal/10' 
                            : 'border-r-4 border-r-olive border-l-charcoal/10 border-t-charcoal/10 border-b-charcoal/10'
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
      <section className="section-padding bg-cream-lightest relative overflow-hidden" id="research-papers">
        <div className="absolute right-0 top-1/4 w-80 h-80 bg-cream-medium/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6 border-b border-charcoal/5 pb-8">
            <div>
              <span className="font-label-md text-gold-accent uppercase tracking-widest text-xs font-bold block mb-3">Scholarly Publications</span>
              <h2 className="font-headline-lg text-4xl md:text-5xl text-charcoal font-bold">Selected Research Papers</h2>
            </div>
            <a 
              className="font-sans text-sm font-bold text-olive flex items-center gap-2 group pb-1 transition-all border-b border-olive/30 hover:border-olive hover:text-gold-accent" 
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
            {researchPapers.map((paper, idx) => (
              <div 
                key={paper._id || idx} 
                className={`glassmorphism-premium p-10 rounded-[2.5rem] hover:-translate-y-2 hover:border-olive/20 hover:shadow-xl transition-all duration-500 paper-card-item flex flex-col justify-between group border border-charcoal/10`}
              >
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <span className={`px-4 py-1.5 text-[10px] font-sans font-bold uppercase rounded-full tracking-wider ${
                      paper.type === 'published' 
                        ? 'bg-olive/10 text-olive border border-olive/10' 
                        : 'bg-gold-accent/10 text-gold-accent border border-gold-accent/10'
                    }`}>
                      {paper.type} • {paper.date}
                    </span>
                    <span className={`material-symbols-outlined text-warm-gray-light transition-colors text-2xl ${
                      paper.type === 'published' ? 'group-hover:text-olive' : 'group-hover:text-gold-accent'
                    }`}>
                      {paper.type === 'published' ? 'article' : 'present_to_all'}
                    </span>
                  </div>

                  <h3 className="font-sans-ultra-bold text-lg md:text-xl leading-snug mb-4 text-charcoal uppercase group-hover:text-olive transition-colors duration-300">
                    {paper.title}
                  </h3>

                  {paper.award && (
                    <div className="flex items-center gap-1.5 text-[10px] font-sans font-bold text-gold-accent uppercase tracking-widest mb-4">
                      <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
                      {paper.award}
                    </div>
                  )}

                  <p className="font-sans text-sm text-charcoal-light mb-8 line-clamp-4 leading-relaxed">
                    {paper.abstract || paper.description}
                  </p>
                </div>

                <div className="space-y-3 pt-6 border-t border-charcoal/5">
                  {(paper.paperUrl || paper.pdfUrl) && (
                    <a 
                      href={paper.paperUrl || paper.pdfUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className={`inline-flex items-center gap-2 text-xs font-sans font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        paper.type === 'published' ? 'text-olive hover:text-gold-accent' : 'text-gold-accent hover:text-olive'
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
            ))}
          </div>
        </div>
      </section>

      {/* Intellectual Vistas (Summits) */}
      <section className="section-padding bg-cream-light relative overflow-hidden" id="vistas">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(254,243,199,0.3),transparent_50%)] pointer-events-none"></div>
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop relative z-10">
          <div className="text-center mb-20">
            <span className="font-label-md text-gold-accent uppercase tracking-widest text-xs font-bold block mb-3">Exploring the Summits</span>
            <h2 className="font-headline-lg text-4xl md:text-5xl text-charcoal font-bold">Intellectual Vistas</h2>
            <p className="font-serif-italic text-lg text-charcoal-light mt-4">Keynotes, discussions, and leadership in ecological discourses</p>
            <div className="w-20 h-1 bg-gold-accent mx-auto mt-6 rounded-full"></div>
          </div>
          <div className="space-y-24">
            {intellectualVistas.map((vista, idx) => (
              <VistaItem key={vista._id || idx} vista={vista} idx={idx} />
            ))}
          </div>
        </div>
      </section>

      {/* Blogs */}
      <section className="section-padding bg-cream-lightest relative overflow-hidden" id="blogs">
        <div className="absolute left-0 bottom-1/4 w-96 h-96 bg-cream-medium/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop relative z-10">
          <div className="mb-16 border-b border-charcoal/5 pb-8">
            <span className="font-label-md text-gold-accent uppercase tracking-widest text-xs font-bold block mb-3">Wending Writer</span>
            <h2 className="font-headline-lg text-4xl md:text-5xl text-charcoal font-bold">Latest Blogs</h2>
            <p className="font-serif-italic text-lg text-charcoal-light mt-4">Thoughts, essays, and critiques on green governance</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {blogs.map((blog, idx) => (
              <article 
                key={blog._id || idx} 
                className="group relative overflow-hidden rounded-[2.5rem] glassmorphism-premium border border-charcoal/10 hover:border-olive/20 hover:shadow-xl transition-all duration-500 blog-card flex flex-col justify-between"
              >
                <div>
                  <div className="h-64 md:h-80 overflow-hidden relative">
                    <img 
                      alt={blog.title} 
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-1000" 
                      src={`/api/images/${blog.coverImage}`} 
                    />
                    <div className="absolute inset-0 bg-charcoal/10 group-hover:bg-charcoal/0 transition-colors duration-500"></div>
                  </div>
                  <div className="p-8 md:p-12 space-y-6">
                    <div className="flex gap-2.5 flex-wrap">
                      {blog.tags?.map((tag, tagIdx) => (
                        <span 
                          key={tagIdx} 
                          className={`text-[9px] uppercase font-sans font-bold tracking-widest px-3 py-1 rounded-full ${
                            tagIdx % 2 === 0 
                              ? 'bg-olive/10 text-olive border border-olive/5' 
                              : 'bg-gold-accent/10 text-gold-accent border border-gold-accent/5'
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                      <span className="text-[9px] uppercase font-sans font-bold tracking-widest text-charcoal-light px-3 py-1 bg-cream-medium/20 rounded-full">
                        {blog.date}
                      </span>
                    </div>
                    
                    <h3 className="font-sans-ultra-bold text-xl md:text-2xl text-charcoal uppercase leading-tight group-hover:text-olive transition-colors duration-300">
                      {blog.title}
                    </h3>
                    
                    <p className="font-sans text-sm text-charcoal-light leading-relaxed line-clamp-3">
                      {blog.content?.replace(/[#*`>]/g, "").slice(0, 160)}...
                    </p>
                  </div>
                </div>
                
                <div className="px-8 md:px-12 pb-8 md:pb-12">
                  <button 
                    onClick={() => setActiveBlog(blog)}
                    className="inline-flex items-center gap-2 text-xs font-sans font-bold uppercase tracking-widest text-olive hover:text-gold-accent transition-all cursor-pointer"
                  >
                    Read Narrative 
                    <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">arrow_forward</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Excellence Badges */}
      <section className="section-padding bg-gradient-to-b from-cream-lightest to-cream-medium relative overflow-hidden" id="accolades">
        <div className="absolute left-0 bottom-0 w-80 h-80 bg-olive/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            {/* Left Column: Heading and description */}
            <div className="lg:col-span-5 space-y-6 text-center lg:text-left">
              <span className="font-label-md text-gold-accent uppercase tracking-widest text-xs font-bold block">National Accolades</span>
              <h2 className="font-headline-lg text-4xl md:text-5xl text-charcoal font-bold leading-tight">Academic Excellence</h2>
              <div className="w-20 h-1 bg-gold-accent mx-auto lg:mx-0 rounded-full"></div>
              <p className="font-sans text-charcoal-light text-base md:text-lg leading-relaxed max-w-xl">
                Validated by national standards of research and teaching excellence in Political Science, ensuring a rigorous approach to ecological studies and green policy analysis.
              </p>
              <div className="pt-4 flex justify-center lg:justify-start items-center gap-2 text-[10px] text-charcoal-light uppercase font-bold tracking-widest">
                <span className="material-symbols-outlined text-emerald-700 text-lg">verified</span> Government of India Accredited
              </div>
            </div>

            {/* Right Column: Interactive Luxury Credentials Cards */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-8">
              {certificates.map((cert, idx) => (
                <div 
                  key={cert._id || idx} 
                  onClick={() => setActiveCertificate(cert)}
                  className="glassmorphism-premium border border-charcoal/10 rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden flex flex-col justify-between group cursor-pointer hover:shadow-xl hover:border-gold-accent/20 hover:-translate-y-2 transition-all duration-500"
                >
                  {/* Subtle Security Radial Gradient Background */}
                  <div className="absolute -right-20 -top-20 w-48 h-48 rounded-full bg-gold-accent/5 group-hover:bg-gold-accent/10 transition-colors duration-500 blur-2xl pointer-events-none"></div>

                  <div>
                    {/* Golden Emblem badge */}
                    <div className="w-14 h-14 rounded-2xl bg-gold-accent/10 border border-gold-accent/20 flex items-center justify-center shadow-xs mb-8 group-hover:scale-105 group-hover:rotate-6 transition-all duration-500">
                      <span className="material-symbols-outlined text-gold-accent text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {idx === 0 ? 'verified' : 'verified_user'}
                      </span>
                    </div>

                    {/* Official Subtitle */}
                    <span className="text-[9px] text-gold-accent font-sans font-bold uppercase tracking-widest block mb-2">{cert.issuer || "UGC / NTA"}</span>

                    {/* Title */}
                    <h3 className="font-sans-ultra-bold text-lg text-charcoal uppercase leading-tight mb-4 min-h-[3rem] group-hover:text-olive transition-colors duration-300">
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
              ))}
            </div>
            
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-cream-medium/40 w-full py-20 border-t border-charcoal/5 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center px-margin-desktop gap-gutter max-w-container-max mx-auto">
          <div className="space-y-4 text-center md:text-left">
            <span className="font-serif-italic text-3xl text-charcoal font-bold block">Jahnvi.</span>
            <p className="font-sans text-sm text-charcoal-light max-w-xs leading-relaxed">
              Intellectualism in harmony with nature. Exploring the depths of political ecology and sustainable governance.
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 items-center my-8 md:my-0">
            {profile.contact?.linkedin && (
              <a className="text-charcoal hover:text-gold-accent transition-colors duration-300 font-sans font-bold text-xs uppercase tracking-wider" href={profile.contact.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
            )}
            {profile.contact?.googleScholar && (
              <a className="text-charcoal hover:text-gold-accent transition-colors duration-300 font-sans font-bold text-xs uppercase tracking-wider" href={profile.contact.googleScholar} target="_blank" rel="noopener noreferrer">Scholar</a>
            )}
            {profile.contact?.researchGate && (
              <a className="text-charcoal hover:text-gold-accent transition-colors duration-300 font-sans font-bold text-xs uppercase tracking-wider" href={profile.contact.researchGate} target="_blank" rel="noopener noreferrer">ResearchGate</a>
            )}
            {profile.contact?.github && (
              <a className="text-charcoal hover:text-gold-accent transition-colors duration-300 font-sans font-bold text-xs uppercase tracking-wider" href={profile.contact.github} target="_blank" rel="noopener noreferrer">GitHub</a>
            )}
            {profile.contact?.orcid && (
              <a className="text-charcoal hover:text-gold-accent transition-colors duration-300 font-sans font-bold text-xs uppercase tracking-wider" href={profile.contact.orcid} target="_blank" rel="noopener noreferrer">ORCID</a>
            )}
            {profile.contact?.email && (
              <a className="text-charcoal hover:text-gold-accent transition-colors duration-300 font-sans font-bold text-xs uppercase tracking-wider" href={`mailto:${profile.contact.email}`}>Email</a>
            )}
          </div>
          
          <div className="text-charcoal-light font-sans text-xs text-center md:text-right space-y-1">
            <p>© 2026 Jahnvi. All rights reserved.</p>
            <span className="text-[10px] opacity-60 font-sans font-bold uppercase tracking-widest block">Sarva Saha • Equilibrium</span>
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

    </main>
  );
}
