import os

with open('stitch_layout.jsx', 'r', encoding='utf-8') as f:
    jsx_content = f.read()

# We need to construct the page.js content.
# We will import the necessary hooks and libraries, fetch the data,
# and return the jsx_content.

page_content = f""""use client";

import {{ useState, useEffect, useRef }} from "react";
import gsap from "gsap";
import {{ useGSAP }} from "@gsap/react";
import {{ ScrollTrigger }} from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {{
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}}

export default function Home() {{
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // References for light effect
  const containerRef = useRef();
  const lightEffectRef = useRef();

  // Fetch portfolio data from MongoDB API
  useEffect(() => {{
    async function fetchData() {{
      try {{
        const res = await fetch("/api/content");
        const json = await res.json();
        if (json.success) {{
          setData(json.data);
        }}
      }} catch (err) {{
        console.error("Failed to fetch content:", err);
      }} finally {{
        setLoading(false);
      }}
    }}
    fetchData();
  }}, []);

  // Mouse follower effect
  useEffect(() => {{
    const handleMouseMove = (e) => {{
      if (lightEffectRef.current) {{
        lightEffectRef.current.style.setProperty('--x', e.clientX + 'px');
        lightEffectRef.current.style.setProperty('--y', e.clientY + 'px');
      }}
    }};
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }}, []);

  useGSAP(() => {{
    // Hero Text Reveal
    const heroTitle = document.getElementById('hero-headline');
    if (heroTitle && !heroTitle.classList.contains('split')) {{
      const text = heroTitle.innerText;
      heroTitle.innerHTML = text.split('').map(char => `<span class="char">${{char === ' ' ? '&nbsp;' : char}}</span>`).join('');
      heroTitle.classList.add('split');
    }}

    gsap.to('.char', {{
        opacity: 1,
        y: 0,
        stagger: 0.05,
        duration: 1,
        ease: "back.out(1.7)",
        startAt: {{ y: 20, opacity: 0 }}
    }});

    gsap.from("#hero-content .reveal-type", {{
        x: -30,
        opacity: 0,
        duration: 1.2,
        stagger: 0.3,
        ease: "power3.out",
        delay: 0.5
    }});

    // Portrait Parallax
    gsap.to("#hero-image", {{
        yPercent: 15,
        ease: "none",
        scrollTrigger: {{
            trigger: "#hero-visual",
            start: "top top",
            end: "bottom top",
            scrub: true
        }}
    }});

    // Generic Parallax for BG elements
    document.querySelectorAll('.parallax-bg').forEach(el => {{
        const speed = el.getAttribute('data-speed');
        gsap.to(el, {{
            y: -100 * speed,
            scrollTrigger: {{
                trigger: el,
                scrub: 1
            }}
        }});
    }});

    // Timeline Items Animation
    gsap.utils.toArray('.timeline-item').forEach((item, i) => {{
        gsap.from(item, {{
            x: i % 2 === 0 ? -60 : 60,
            opacity: 0,
            duration: 1.2,
            ease: "power4.out",
            scrollTrigger: {{
                trigger: item,
                start: "top 85%",
                toggleActions: "play none none none"
            }}
        }});
    }});

    // Section Headers
    gsap.utils.toArray('h2').forEach(heading => {{
        gsap.from(heading, {{
            y: 30,
            opacity: 0,
            duration: 1,
            scrollTrigger: {{
                trigger: heading,
                start: "top 90%"
            }}
        }});
    }});

    // Research Paper Cards Fade In
    gsap.from(".paper-card-item", {{
        y: 50,
        opacity: 0,
        stagger: 0.2,
        duration: 1,
        scrollTrigger: {{
            trigger: ".paper-card-item",
            start: "top 85%"
        }}
    }});

    // Vistas Journey Masonry Feel Reveal
    gsap.utils.toArray('.vista-overlap-item').forEach((item, i) => {{
        gsap.from(item, {{
            y: 100,
            opacity: 0,
            duration: 1.5,
            ease: "expo.out",
            scrollTrigger: {{
                trigger: item,
                start: "top 80%"
            }}
        }});
    }});

    // Blog Cards
    gsap.from(".blog-card", {{
        scale: 0.95,
        opacity: 0,
        stagger: 0.3,
        duration: 1.2,
        scrollTrigger: {{
            trigger: ".blog-card",
            start: "top 85%"
        }}
    }});

    // Navbar Scroll Effect
    const nav = document.querySelector('nav');
    if (nav) {{
      ScrollTrigger.create({{
          start: "top -50",
          onUpdate: (self) => {{
              if (self.direction === 1) {{
                  nav.classList.add('py-2', 'shadow-md');
                  nav.classList.remove('py-4', 'shadow-sm');
              }} else if (self.scroll() < 50) {{
                  nav.classList.add('py-4', 'shadow-sm');
                  nav.classList.remove('py-2', 'shadow-md');
              }}
          }}
      }});
    }}
  }}, {{ scope: containerRef, dependencies: [loading] }});

  // Dynamic mapping logic here...
  const profile = data?.profile || {{}};
  const researchInterests = data?.researchInterests || [];
  const timelineEvents = data?.timelineEvents || [];
  const researchPapers = data?.researchPapers || [];
  const intellectualVistas = data?.intellectualVistas || [];
  const blogs = data?.blogs || [];
  const certificates = data?.certificates || [];

  return (
    <main ref={{containerRef}} className="relative">
      <div id="light-effect" ref={{lightEffectRef}}></div>
      {jsx_content.replace('<div id="light-effect"></div>', '')}
    </main>
  );
}}
"""

with open('src/app/page.js', 'w', encoding='utf-8') as f:
    f.write(page_content)

print("Generated page.js")
