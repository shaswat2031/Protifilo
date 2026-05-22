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
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-12 items-center vista-overlap-item ${isEven ? "" : "md:flex-row-reverse"}`}>
      {/* Vista Image / Carousel */}
      <div className={`relative rounded-[3rem] overflow-hidden h-[450px] shadow-2xl group ${!isEven ? "md:order-2" : ""}`}>
        {images.length > 0 ? (
          <>
            <img 
              alt={vista.title} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
              src={`/api/images/${images[currentImgIdx]}`} 
            />
            {images.length > 1 && (
              <>
                <button 
                  onClick={prevImg}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/35 hover:bg-black/60 text-white flex items-center justify-center transition-all backdrop-blur-sm z-20 cursor-pointer"
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button 
                  onClick={nextImg}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/35 hover:bg-black/60 text-white flex items-center justify-center transition-all backdrop-blur-sm z-20 cursor-pointer"
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
                {/* Dots */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20 bg-black/20 px-3 py-1 rounded-full backdrop-blur-xs">
                  {images.map((_, i) => (
                    <span 
                      key={i} 
                      onClick={(e) => { e.stopPropagation(); setCurrentImgIdx(i); }}
                      className={`w-2 h-2 rounded-full cursor-pointer transition-all ${i === currentImgIdx ? "bg-white scale-125" : "bg-white/40"}`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full bg-surface-container-high flex items-center justify-center">
            <span className="material-symbols-outlined text-outline-variant text-5xl">image</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent"></div>
        <div className="absolute bottom-10 left-10 text-white pr-10">
          <p className="font-label-md uppercase tracking-widest mb-2">{vista.date}</p>
          <h4 className="font-headline-md text-2xl md:text-3xl leading-tight font-bold">{vista.organization}</h4>
        </div>
      </div>

      {/* Vista Text Description */}
      <div className={`space-y-6 ${!isEven ? "md:order-1 md:pr-8 md:text-right" : "md:pl-8"}`}>
        <span className="text-secondary font-bold text-5xl opacity-20 block">{String(idx + 1).padStart(2, '0')}</span>
        <h3 className="font-headline-md text-3xl md:text-4xl text-on-surface leading-tight font-bold">{vista.title}</h3>
        <p className="font-body-lg text-on-surface-variant leading-relaxed">{vista.description}</p>
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
    // Hero Text Reveal
    const heroTitle = document.getElementById('hero-headline');
    if (heroTitle && !heroTitle.classList.contains('split')) {
      const text = heroTitle.innerText;
      heroTitle.innerHTML = text.split('').map(char => `<span class="char">${char === ' ' ? '&nbsp;' : char}</span>`).join('');
      heroTitle.classList.add('split');
    }

    gsap.to('.char', {
        opacity: 1,
        y: 0,
        stagger: 0.05,
        duration: 1,
        ease: "back.out(1.7)",
        startAt: { y: 20, opacity: 0 }
    });

    gsap.fromTo("#hero-content .reveal-type", 
        { x: -30, opacity: 0 },
        {
            x: 0,
            opacity: 1,
            duration: 1.2,
            stagger: 0.3,
            ease: "power3.out",
            delay: 0.5
        }
    );

    // Portrait Parallax
    gsap.to("#hero-image", {
        yPercent: 15,
        ease: "none",
        scrollTrigger: {
            trigger: "#hero-visual",
            start: "top top",
            end: "bottom top",
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
                  nav.classList.add('py-2', 'shadow-md');
                  nav.classList.remove('py-4', 'shadow-sm');
              } else if (self.scroll() < 50) {
                  nav.classList.add('py-4', 'shadow-sm');
                  nav.classList.remove('py-2', 'shadow-md');
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
      <nav className="fixed top-0 w-full z-[60] bg-surface/80 backdrop-blur-xl border-b border-outline-variant/10 shadow-sm transition-all duration-300">
        <div className="flex justify-between items-center px-margin-desktop py-4 max-w-container-max mx-auto">
          <span className="font-display-lg text-headline-md tracking-tighter text-primary font-bold">Jahnvi</span>
          <div className="hidden md:flex gap-gutter items-center">
            <a className="font-label-md text-label-md text-primary font-bold border-b-2 border-secondary transition-colors duration-300" href="#intro">Intro</a>
            <a className="font-label-md text-label-md text-on-surface-variant hover:text-secondary transition-colors duration-300" href="#research">Research</a>
            <a className="font-label-md text-label-md text-on-surface-variant hover:text-secondary transition-colors duration-300" href="#background">Background</a>
            <a className="font-label-md text-label-md text-on-surface-variant hover:text-secondary transition-colors duration-300" href="#vistas">Vistas</a>
            <a className="font-label-md text-label-md text-on-surface-variant hover:text-secondary transition-colors duration-300" href="#blogs">Blogs</a>
            <button className="ml-4 px-6 py-2 bg-primary text-white rounded-full font-label-md btn-hover-effect">Contact Me</button>
          </div>
          <div className="md:hidden">
            <span className="material-symbols-outlined text-primary cursor-pointer">menu</span>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-24 px-margin-mobile md:px-margin-desktop overflow-hidden" id="intro">
        <div className="max-w-container-max mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-gutter items-center relative z-10">
          <div className="md:col-span-7 space-y-stack-sm" id="hero-content">
            <p className="font-label-md text-secondary tracking-widest uppercase font-bold reveal-type">SARVA SAHA • RArefied</p>
            <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface leading-tight font-bold" id="hero-headline">
              {profile?.name ? `Hello, I am ${profile.name}` : "Hello..."}
            </h1>
            <div className="space-y-4">
              <p className="font-headline-md text-2xl md:text-3xl font-bold italic text-primary reveal-type">{profile?.title || "Researcher & Writer"}</p>
              <p className="font-body-lg text-body-lg max-w-xl text-on-surface-variant">{profile?.tagline || "Exploring..."}</p>
            </div>
            <div className="pt-8 flex gap-4">
              <a href="#research" className="px-8 py-3 bg-primary text-white rounded-full font-label-md btn-hover-effect text-center">View Research</a>
              <a href="#blogs" className="px-8 py-3 border border-secondary text-secondary rounded-full font-label-md hover:bg-secondary/5 transition-all text-center">Latest Blog</a>
            </div>
          </div>
          <div className="md:col-span-5 relative flex justify-center items-center" id="hero-visual">
            {/* Circular Badge */}
            <div className="absolute -top-16 -right-12 w-48 h-48 z-20 hidden md:block">
              <svg className="rotate-slow w-full h-full fill-secondary/80" viewBox="0 0 100 100">
                <path d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" fill="transparent" id="circlePath"></path>
                <text className="text-[7.5px] font-label-md tracking-widest uppercase font-bold">
                  <textPath href="#circlePath">SARVA SAHA • RESEARCHER • WRITER • ECOLOGY •</textPath>
                </text>
              </svg>
            </div>
            <div className="relative w-full aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white/50" id="portrait-wrapper">
              <img 
                alt="Profile" 
                className="w-full h-full object-cover scale-110" 
                id="hero-image" 
                src={profile?.avatarUrl || "/api/images/17.jpeg"} 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
          </div>
        </div>
        {/* Background Elements */}
        <div className="absolute top-1/4 right-0 w-1/3 h-2/3 bg-primary/5 -skew-x-12 translate-x-24 z-0 rounded-l-[10rem] parallax-bg" data-speed="0.05"></div>
        <div className="absolute bottom-10 left-10 w-48 h-48 bg-secondary/5 rounded-full blur-3xl parallax-bg" data-speed="0.1"></div>
      </section>

      {/* Research Statement */}
      <section className="section-padding bg-surface-container-low/20 relative" id="research">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter mb-16">
            <div className="lg:col-span-4" id="statement-heading">
              <h2 className="font-headline-lg text-headline-lg text-on-surface mb-8 font-bold">My Research Statement</h2>
              <div className="w-24 h-1.5 bg-primary rounded-full"></div>
            </div>
            <div className="lg:col-span-8 space-y-stack-md" id="statement-content">
              <blockquote className="relative pl-12 border-l-4 border-secondary py-6">
                <span className="absolute -left-6 -top-12 text-9xl text-secondary/10 font-display-lg italic">“</span>
                <p className="font-headline-md text-headline-md italic text-on-surface-variant leading-relaxed">
                  'Sarva Saha' — <span className="text-primary font-bold">संस्कृत:</span> A harmonious, organic equilibrium and co-existence between humanity, green policies, and our biospheric boundaries.
                </p>
              </blockquote>
              <div className="font-body-lg text-body-lg text-on-surface-variant space-y-6 max-w-3xl">
                <p>{profile?.bioIntro || "My intellectual journey is rooted in the critical intersections of Political Science and Environmental Governance..."}</p>
                <p>{profile?.bioSecondary || "My roots lie in a family of Business minds and Entrepreneurs..."}</p>
              </div>
            </div>
          </div>

          {/* Domain Cards - Expanded to full container width */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12">
            {researchInterests.map((interest, idx) => (
              <div key={interest._id || idx} className={`paper-card p-10 rounded-[2.5rem] hover:-translate-y-2 transition-all duration-300 group ${idx === 1 ? 'border-primary/20' : ''}`}>
                <span className="material-symbols-outlined text-primary text-5xl mb-6 block group-hover:scale-110 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {getInterestIcon(interest.iconName)}
                </span>
                <h3 className="font-headline-md text-[22px] text-on-surface mb-4 font-bold">{interest.title}</h3>
                <p className="font-body-md text-on-surface-variant">{interest.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Academic Background (Timeline) */}
      <section className="section-padding bg-background" id="background">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop text-center mb-stack-lg">
          <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg font-bold">Academic Background</h2>
          <p className="font-body-lg text-on-surface-variant mt-4">A journey of scholarship and continuous evolution</p>
        </div>
        <div className="max-w-4xl mx-auto px-margin-mobile relative">
          {/* Center Line */}
          <div className="absolute left-1/2 -translate-x-1/2 w-0.5 h-full bg-outline-variant/30 hidden md:block"></div>
          <div className="space-y-24">
            {timelineEvents.map((event, idx) => (
              <div key={event._id || idx} className="relative grid grid-cols-1 md:grid-cols-2 gap-12 timeline-item">
                <div className={idx % 2 === 0 ? "md:text-right" : "md:order-2"}>
                  <span className={`inline-block px-4 py-1 text-white rounded-full font-label-md mb-2 ${idx % 2 === 0 ? 'bg-secondary' : 'bg-primary'}`}>{event.period}</span>
                  <h4 className="font-headline-md text-[26px] font-bold">{event.title}</h4>
                  <p className="font-body-md text-on-surface-variant italic">{event.institution}</p>
                  {event.grade && (
                    <span className="inline-block mt-2 text-xs font-bold uppercase tracking-wider text-secondary px-3 py-1 bg-secondary/10 rounded-full">
                      {event.grade}
                    </span>
                  )}
                </div>
                <div className={`hidden md:block absolute left-1/2 -translate-x-1/2 w-5 h-5 rounded-full border-4 border-background z-10 shadow-lg mt-2 ${idx % 2 === 0 ? 'bg-secondary' : 'bg-primary'}`}></div>
                <div className={idx % 2 !== 0 ? "md:text-right" : ""}>
                  <div className={`p-8 paper-card rounded-3xl shadow-sm transition-all duration-300 hover:shadow-md ${event.isHighlight ? 'border-2 border-secondary bg-secondary/5' : idx % 2 === 0 ? 'border-l-4 border-secondary' : 'border-r-4 border-primary'}`}>
                    {event.isHighlight && (
                      <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-secondary mb-2 justify-start">
                        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span> Highlighted Milestone
                      </span>
                    )}
                    <p className="font-body-md text-on-surface">{event.details}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Research Papers */}
      <section className="section-padding bg-surface-container-lowest/40">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <p className="font-label-md text-primary mb-2 tracking-widest uppercase">SCHOLARLY PUBLICATIONS</p>
              <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg font-bold">Selected Research Papers</h2>
            </div>
            <a 
              className="font-label-md text-secondary flex items-center gap-2 hover:gap-4 transition-all pb-2 border-b border-secondary/30 font-bold" 
              href={profile.contact?.googleScholar || "https://scholar.google.com"} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              Google Scholar <span className="material-symbols-outlined">north_east</span>
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {researchPapers.map((paper, idx) => (
              <div key={paper._id || idx} className={`paper-card p-10 rounded-[3rem] hover:bg-white hover:shadow-2xl transition-all duration-500 paper-card-item flex flex-col justify-between group ${paper.type === 'published' ? 'border-primary/10' : 'border-secondary/10'}`}>
                <div>
                  <div className="flex justify-between items-start mb-8">
                    <span className={`px-4 py-1.5 text-[11px] font-bold uppercase rounded-full ${paper.type === 'published' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'}`}>
                      {paper.type} • {paper.date}
                    </span>
                    <span className={`material-symbols-outlined text-outline-variant transition-colors text-3xl ${paper.type === 'published' ? 'group-hover:text-primary' : 'group-hover:text-secondary'}`}>
                      {paper.type === 'published' ? 'article' : 'present_to_all'}
                    </span>
                  </div>
                  <h3 className={`font-headline-md text-[22px] leading-snug mb-6 text-on-surface font-bold transition-colors ${paper.type === 'published' ? 'group-hover:text-primary' : 'group-hover:text-secondary'}`}>{paper.title}</h3>
                  {paper.award && (
                    <div className="flex items-center gap-2 text-xs font-bold text-secondary uppercase tracking-wider mb-4">
                      <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
                      {paper.award}
                    </div>
                  )}
                  <p className="font-body-md text-on-surface-variant mb-8 line-clamp-4">{paper.abstract || paper.description}</p>
                </div>
                <div className="space-y-3 pt-4 border-t border-outline-variant/10">
                  {(paper.paperUrl || paper.pdfUrl) && (
                    <a href={paper.paperUrl || paper.pdfUrl} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 text-label-md font-bold group-hover:gap-3 transition-all cursor-pointer ${paper.type === 'published' ? 'text-primary' : 'text-secondary'}`}>
                      Read Publication <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </a>
                  )}
                  {paper.type === 'presented' && paper.images && paper.images.length > 0 && (
                    <button 
                      onClick={() => { setActivePaperSlides(paper); setSlideIndex(0); }} 
                      className="flex items-center gap-2 text-label-md font-bold text-secondary hover:text-primary transition-colors cursor-pointer w-full text-left"
                    >
                      <span className="material-symbols-outlined text-[18px]">slideshow</span>
                      View Slides & Media ({paper.images.length})
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Intellectual Vistas (Summits) */}
      <section className="section-padding bg-surface overflow-hidden" id="vistas">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg mb-20 text-center font-bold">Intellectual Vistas</h2>
          <div className="space-y-24">
            {intellectualVistas.map((vista, idx) => (
              <VistaItem key={vista._id || idx} vista={vista} idx={idx} />
            ))}
          </div>
        </div>
      </section>

      {/* Blogs */}
      <section className="section-padding bg-background relative overflow-hidden" id="blogs">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-20 font-bold">Wending Writer: Latest Blogs</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {blogs.map((blog, idx) => (
              <article key={blog._id || idx} className="group relative overflow-hidden rounded-[3rem] bg-white shadow-xl hover:shadow-2xl transition-all duration-500 blog-card flex flex-col justify-between">
                <div>
                  <div className="h-80 overflow-hidden relative">
                    <img 
                      alt={blog.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" 
                      src={`/api/images/${blog.coverImage}`} 
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
                  </div>
                  <div className="p-12 space-y-6">
                    <div className="flex gap-3 flex-wrap">
                      {blog.tags?.map((tag, tagIdx) => (
                        <span key={tagIdx} className={`text-[11px] uppercase font-bold tracking-widest px-4 py-1.5 rounded-full ${tagIdx % 2 === 0 ? 'bg-secondary/5 text-secondary' : 'bg-primary/5 text-primary'}`}>
                          {tag}
                        </span>
                      ))}
                      <span className="text-[11px] uppercase font-bold tracking-widest text-on-surface-variant px-4 py-1.5 bg-surface-container rounded-full">
                        {blog.date}
                      </span>
                    </div>
                    <h3 className="font-headline-md text-2xl md:text-3xl group-hover:text-primary transition-colors leading-tight font-bold">{blog.title}</h3>
                    <p className="font-body-md text-on-surface-variant text-lg line-clamp-3">
                      {blog.content?.replace(/[#*`>]/g, "").slice(0, 160)}...
                    </p>
                  </div>
                </div>
                <div className="px-12 pb-12">
                  <button 
                    onClick={() => setActiveBlog(blog)}
                    className="inline-flex items-center gap-2 font-label-md text-primary group-hover:gap-4 transition-all text-lg font-bold cursor-pointer hover:text-secondary font-bold"
                  >
                    Read Narrative <span className="material-symbols-outlined">arrow_right_alt</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Excellence Badges */}
      <section className="section-padding bg-gradient-to-b from-surface to-[#F3ECD8] relative overflow-hidden" id="accolades">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            {/* Left Column: Heading and description */}
            <div className="lg:col-span-5 space-y-6 text-center lg:text-left">
              <span className="font-label-md text-secondary uppercase tracking-widest font-bold">National Accolades</span>
              <h2 className="font-headline-lg text-4xl md:text-5xl text-primary font-bold leading-tight">Academic Excellence</h2>
              <div className="w-20 h-1 bg-secondary mx-auto lg:mx-0 rounded-full"></div>
              <p className="font-body-lg text-on-surface-variant text-lg leading-relaxed max-w-xl">
                Validated by national standards of research and teaching excellence in Political Science, ensuring a rigorous approach to ecological studies and green policy analysis.
              </p>
              <div className="pt-4 flex justify-center lg:justify-start items-center gap-2 text-xs text-outline-variant uppercase font-bold tracking-widest">
                <span className="material-symbols-outlined text-emerald-600 text-lg">shield</span> Government of India Accredited
              </div>
            </div>

            {/* Right Column: Interactive Luxury Credentials Cards */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-8">
              {certificates.map((cert, idx) => (
                <div 
                  key={cert._id || idx} 
                  onClick={() => setActiveCertificate(cert)}
                  className="bg-white/80 backdrop-blur-xl border border-white/90 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.04)] rounded-[3rem] p-10 relative overflow-hidden flex flex-col justify-between group cursor-pointer hover:shadow-[0_30px_60px_-10px_rgba(137,80,46,0.1)] hover:-translate-y-2.5 transition-all duration-500"
                >
                  {/* Subtle Security Radial Gradient Background */}
                  <div className="absolute -right-20 -top-20 w-48 h-48 rounded-full bg-secondary/5 group-hover:bg-secondary/10 transition-colors duration-500 blur-2xl"></div>

                  <div>
                    {/* Golden Emblem badge */}
                    <div className="w-16 h-16 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-center shadow-md mb-8 group-hover:scale-105 group-hover:rotate-6 transition-all duration-500">
                      <span className="material-symbols-outlined text-secondary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {idx === 0 ? 'verified' : 'verified_user'}
                      </span>
                    </div>

                    {/* Official Subtitle */}
                    <span className="text-[10px] text-secondary font-bold uppercase tracking-widest block mb-2">{cert.issuer || "UGC / NTA"}</span>

                    {/* Title */}
                    <h3 className="font-headline-md text-2xl text-on-surface font-bold leading-snug mb-4 group-hover:text-primary transition-colors min-h-[3.5rem] flex items-start">
                      {cert.title}
                    </h3>
                  </div>

                  {/* Verification Capsules and Actions */}
                  <div className="pt-6 border-t border-outline-variant/10 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="bg-emerald-950/5 text-emerald-800 border border-emerald-600/10 text-[9px] uppercase font-bold tracking-widest px-3 py-1 rounded-full inline-flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">check_circle</span> VERIFIED
                      </span>
                      <span className="text-[10px] opacity-60 font-bold uppercase tracking-wider">{cert.date || "2026"}</span>
                    </div>

                    <button className="flex items-center gap-2 text-xs font-bold text-primary group-hover:text-secondary group-hover:gap-3 transition-all mt-2 w-full text-left">
                      View Certificate <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
          </div>
        </div>
        {/* Background Accents */}
        <div className="absolute left-0 bottom-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl z-0"></div>
      </section>

      {/* Footer */}
      <footer className="bg-surface-container-low w-full py-24 border-t border-outline-variant/20 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center px-margin-desktop gap-gutter max-w-container-max mx-auto">
          <div className="space-y-4 text-center md:text-left">
            <span className="font-display-lg text-4xl text-primary font-bold">Jahnvi</span>
            <p className="font-body-md text-on-surface-variant max-w-xs leading-relaxed">
              Intellectualism in harmony with nature. Exploring the depths of political ecology and sustainable governance.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-gutter items-center my-8 md:my-0 gap-x-6 gap-y-2">
            {profile.contact?.linkedin && (
              <a className="text-on-surface-variant hover:text-secondary transition-colors duration-200 font-body-md font-bold" href={profile.contact.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
            )}
            {profile.contact?.googleScholar && (
              <a className="text-on-surface-variant hover:text-secondary transition-colors duration-200 font-body-md font-bold" href={profile.contact.googleScholar} target="_blank" rel="noopener noreferrer">Google Scholar</a>
            )}
            {profile.contact?.researchGate && (
              <a className="text-on-surface-variant hover:text-secondary transition-colors duration-200 font-body-md font-bold" href={profile.contact.researchGate} target="_blank" rel="noopener noreferrer">ResearchGate</a>
            )}
            {profile.contact?.github && (
              <a className="text-on-surface-variant hover:text-secondary transition-colors duration-200 font-body-md font-bold" href={profile.contact.github} target="_blank" rel="noopener noreferrer">GitHub</a>
            )}
            {profile.contact?.orcid && (
              <a className="text-on-surface-variant hover:text-secondary transition-colors duration-200 font-body-md font-bold" href={profile.contact.orcid} target="_blank" rel="noopener noreferrer">ORCID</a>
            )}
            {profile.contact?.email && (
              <a className="text-on-surface-variant hover:text-secondary transition-colors duration-200 font-body-md font-bold" href={`mailto:${profile.contact.email}`}>Email</a>
            )}
          </div>
          <div className="text-on-surface-variant font-body-md text-center md:text-right">
            <p>© 2026 Jahnvi. All rights reserved.</p>
            <span className="text-[12px] opacity-60 font-bold uppercase tracking-widest block mt-1">Sarva Saha • Equilibrium</span>
          </div>
        </div>
      </footer>

      {/* ================================================================ */}
      {/* ======================= MODAL SYSTEM =========================== */}
      {/* ================================================================ */}

      {/* 1. Blog Reader Drawer / Slide-Over Modal */}
      {activeBlog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-end bg-black/60 backdrop-blur-md transition-all animate-fade-in" onClick={() => setActiveBlog(null)}>
          <div className="relative w-full max-w-4xl h-full bg-[#FBF5E8] overflow-y-auto p-8 md:p-16 shadow-2xl flex flex-col border-l border-outline-variant/20 animate-slide-in" onClick={(e) => e.stopPropagation()}>
            {/* Sticky Close Header */}
            <div className="flex justify-between items-center mb-8 border-b pb-4 border-outline-variant/30">
              <div className="flex gap-2">
                {activeBlog.tags?.map((tag, i) => (
                  <span key={i} className="text-xs uppercase font-bold tracking-widest px-3 py-1 bg-primary/10 text-primary rounded-full">{tag}</span>
                ))}
              </div>
              <button 
                onClick={() => setActiveBlog(null)}
                className="flex items-center gap-2 px-4 py-2 bg-charcoal/10 hover:bg-charcoal/20 text-charcoal rounded-full font-label-md transition-all cursor-pointer font-bold border border-outline-variant/30"
              >
                <span className="material-symbols-outlined text-lg">close</span>
                Close
              </button>
            </div>

            {/* Content Container */}
            <div className="space-y-8 animate-fade-in">
              <h1 className="font-display-lg text-3xl md:text-5xl text-on-surface leading-tight font-bold">{activeBlog.title}</h1>
              <p className="font-body-md text-on-surface-variant italic text-lg">{activeBlog.date} • {activeBlog.readTime || "5 min read"}</p>
              
              <div className="w-full h-[380px] rounded-[2rem] overflow-hidden shadow-lg border border-white">
                <img alt={activeBlog.title} className="w-full h-full object-cover animate-scale-up" src={`/api/images/${activeBlog.coverImage}`} />
              </div>

              {/* Render parsed markdown text or rich HTML */}
              <div className="mt-12 max-w-3xl mx-auto pb-24 prose prose-emerald prose-lg text-charcoal leading-relaxed">
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
                <h2 className="font-headline-md text-xl md:text-2xl text-secondary font-bold leading-tight">{activePaperSlides.title}</h2>
                <p className="text-xs md:text-sm opacity-60 leading-relaxed">Venue: {activePaperSlides.venue}</p>
              </div>
              <button 
                onClick={() => { setActivePaperSlides(null); setSlideIndex(0); }}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full font-label-md transition-all cursor-pointer border border-white/10 font-bold shrink-0"
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
              <div className="flex justify-between items-center text-xs opacity-60 mb-2 font-label-md">
                <span>Slide {slideIndex + 1} of {activePaperSlides.images.length}</span>
                <span>Select a thumbnail to jump</span>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 justify-start md:justify-center">
                {activePaperSlides.images.map((img, i) => (
                  <div 
                    key={i} 
                    onClick={() => setSlideIndex(i)}
                    className={`w-20 md:w-24 aspect-[16/10] rounded-xl overflow-hidden cursor-pointer transition-all border-2 ${i === slideIndex ? 'border-secondary scale-105 shadow-lg opacity-100' : 'border-transparent opacity-40 hover:opacity-100'}`}
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
          <div className="relative w-full max-w-3xl p-6 flex flex-col items-center bg-[#FBF5E8] rounded-[2.5rem] border border-outline-variant/30 text-charcoal shadow-2xl animate-scale-up m-4" onClick={(e) => e.stopPropagation()}>
            <div className="w-full flex justify-between items-center border-b pb-4 mb-4 border-outline-variant/20">
              <div className="space-y-1 pr-6">
                <h2 className="font-headline-md text-xl md:text-2xl text-primary font-bold leading-tight">{activeCertificate.title}</h2>
                <p className="text-xs md:text-sm text-on-surface-variant italic leading-relaxed">Issued by: {activeCertificate.issuer} ({activeCertificate.date})</p>
              </div>
              <button 
                onClick={() => setActiveCertificate(null)}
                className="flex items-center justify-center w-10 h-10 bg-charcoal/10 hover:bg-charcoal/20 text-charcoal rounded-full transition-all cursor-pointer shrink-0"
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
                className="mt-6 px-6 py-2.5 bg-primary text-white rounded-full font-label-md hover:bg-primary/90 hover:scale-102 transition-all flex items-center gap-2 cursor-pointer font-bold shadow-md"
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
