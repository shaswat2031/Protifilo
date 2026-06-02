"use client";

import { useState, useEffect, useRef } from "react";
import { 
  ArrowLeft, 
  Send, 
  CheckCircle, 
  Mail, 
  MapPin, 
  Building,
  AlertCircle,
  Linkedin,
  BookOpen,
  Compass,
  FileText
} from "lucide-react";
import confetti from "canvas-confetti";

export default function ContactPage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    organization: "",
    inquiryType: "Academic Collaboration",
    subject: "",
    message: ""
  });

  // Validation States
  const [errors, setErrors] = useState({});

  const containerRef = useRef(null);

  // Inquiry Types Config
  const inquiryTypes = [
    { 
      id: "Academic Collaboration", 
      label: "Collaboration", 
      icon: "school", 
      selectedClass: "bg-olive text-cream-lightest border-olive shadow-sm scale-[1.02] font-bold",
      unselectedClass: "bg-white/50 border-charcoal/10 text-charcoal/85 hover:bg-olive/5 hover:text-olive hover:border-olive/20 hover:scale-[1.01]"
    },
    { 
      id: "Speaking Engagement", 
      label: "Speaking", 
      icon: "record_voice_over", 
      selectedClass: "bg-gold-accent text-cream-lightest border-gold-accent shadow-sm scale-[1.02] font-bold",
      unselectedClass: "bg-white/50 border-charcoal/10 text-charcoal/85 hover:bg-gold-accent/5 hover:text-gold-accent hover:border-gold-accent/20 hover:scale-[1.01]"
    },
    { 
      id: "Writing Opportunity", 
      label: "Writing", 
      icon: "edit_note", 
      selectedClass: "bg-olive text-cream-lightest border-olive shadow-sm scale-[1.02] font-bold",
      unselectedClass: "bg-white/50 border-charcoal/10 text-charcoal/85 hover:bg-olive/5 hover:text-olive hover:border-olive/20 hover:scale-[1.01]"
    },
    { 
      id: "General Connect", 
      label: "General", 
      icon: "chat", 
      selectedClass: "bg-charcoal text-cream-lightest border-charcoal shadow-sm scale-[1.02] font-bold",
      unselectedClass: "bg-white/50 border-charcoal/10 text-charcoal/85 hover:bg-charcoal/5 hover:text-charcoal hover:border-charcoal/20 hover:scale-[1.01]"
    }
  ];

  // Fetch Jahnvi's Profile Links
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/content");
        const json = await res.json();
        if (json.success && json.data?.profile) {
          setProfile(json.data.profile);
        }
      } catch (err) {
        console.error("Failed to fetch profile details:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  // Form Field Validation
  const validateField = (name, value) => {
    let error = "";
    if (name === "name" && !value.trim()) {
      error = "Your name is required.";
    } else if (name === "email") {
      if (!value.trim()) {
        error = "Your email address is required.";
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          error = "Please enter a valid email address.";
        }
      }
    } else if (name === "subject" && !value.trim()) {
      error = "A subject is required.";
    } else if (name === "message" && !value.trim()) {
      error = "Please include a brief message.";
    }
    return error;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const selectInquiryType = (typeId) => {
    setFormData((prev) => ({ ...prev, inquiryType: typeId }));
  };

  // Form Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Focus first error field
      const firstErrorKey = Object.keys(newErrors)[0];
      const errorEl = document.getElementsByName(firstErrorKey)[0];
      if (errorEl) errorEl.focus();
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        setIsSubmitted(true);
        // Playful premium congratulations effect
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#435c3c", "#89502e", "#F5ECD8", "#EAE0C8"]
        });
      } else {
        setErrors({ submit: result.error || "Something went wrong. Please try again." });
      }
    } catch (err) {
      console.error("Submission error:", err);
      setErrors({ submit: "A network issue occurred. Please check your connection and retry." });
    } finally {
      setSubmitting(false);
    }
  };

  // Default Fallbacks
  const defaultContact = {
    email: "jahnvi.ecology@gmail.com",
    location: "Jaipur, Rajasthan, India",
    linkedin: "https://linkedin.com",
    googleScholar: "https://scholar.google.com",
    researchGate: "https://researchgate.net",
    orcid: "https://orcid.org",
    preTitle: "Deliberation & Discourse",
    title: "Get In Touch",
    description: "Have questions regarding political ecology, academic collaborations, or green governance? Let us start a dialogue (*Manthan*) to explore sustainable solutions.",
    focusLabel: "Affiliated Focus",
    focusValue: "Political Ecology & Sustainable Development",
    quote: `"Sarva Saha" — An organic, harmonious coexistence between humanity, climate policy, and biospheric boundaries. Let us formulate actions for a resilient green future.`
  };

  const contactInfo = {
    ...defaultContact,
    ...(profile?.contact || {})
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center" style={{ backgroundColor: '#FBF5E8' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-16 w-16 animate-spin rounded-full border-4 border-olive/20 border-t-olive">
            <div className="absolute inset-2 rounded-full border-4 border-gold-accent/20 border-t-gold-accent animate-pulse"></div>
          </div>
          <p className="font-serif-italic text-lg tracking-wider text-olive animate-pulse">
            Establishing secure connection...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative min-h-screen font-sans text-charcoal select-text bg-[#FBF5E8] overflow-x-hidden">
      {/* Premium Ambient Radial Gradients */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-pastel-purple/20 via-pastel-blue/10 to-transparent pointer-events-none z-0"></div>
      <div className="absolute -left-40 top-1/4 w-[500px] h-[500px] bg-pastel-pink/15 rounded-full blur-3xl pointer-events-none z-0"></div>
      <div className="absolute -right-40 bottom-1/4 w-[500px] h-[500px] bg-pastel-mint/15 rounded-full blur-3xl pointer-events-none z-0"></div>

      {/* Sticky Back Header Navigation */}
      <header className="sticky top-0 z-[60] bg-[#FBF5E8]/85 backdrop-blur-md border-b border-olive/10">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-4 md:px-12">
          <a
            href="/"
            className="flex items-center gap-2 text-sm font-semibold text-olive hover:text-olive-dark transition-all duration-300 group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Portfolio
          </a>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-olive">eco</span>
            <span className="font-serif-italic text-lg font-bold text-charcoal">Jahnvi.</span>
          </div>
        </div>
      </header>

      {/* Main Form Container */}
      <main className="relative z-10 mx-auto max-w-7xl px-6 py-12 md:py-20 lg:px-8">
        
        {/* Page Headings */}
        <div className="text-center space-y-4 mb-16 max-w-3xl mx-auto">
          <span className="font-label-md text-gold-accent uppercase tracking-widest text-xs font-bold block mb-1">{contactInfo.preTitle}</span>
          <h1 className="font-serif-italic text-4xl font-extrabold tracking-tight text-charcoal md:text-5xl uppercase leading-tight">
            {contactInfo.title}
          </h1>
          <div className="w-20 h-1 bg-gradient-to-r from-olive/20 via-olive to-olive/20 mx-auto rounded-full my-4"></div>
          <p className="text-charcoal-light text-base md:text-lg leading-relaxed max-w-xl mx-auto">
            {contactInfo.description}
          </p>
        </div>

        {/* Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch mt-12">
          
          {/* Column 1: Connection Details */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-8 h-full">
            
            {/* Upper Glassmorphism Box */}
            <div className="glassmorphism-premium rounded-[2.5rem] p-6 md:p-8 border border-charcoal/10 shadow-xs relative overflow-hidden flex flex-col justify-between flex-grow min-h-fit">
              <div className="absolute -right-16 -top-16 w-36 h-36 bg-gold-accent/5 rounded-full blur-2xl pointer-events-none"></div>
              
              <div>
                <h3 className="font-sans-ultra-bold text-xl uppercase tracking-wider text-charcoal mb-6">
                  Direct Coordinates
                </h3>

                <div className="space-y-4">
                  {/* Email */}
                  {contactInfo.email && (
                    <a 
                      href={`mailto:${contactInfo.email}`}
                      className="flex items-start gap-3.5 p-3 rounded-2xl bg-white/40 hover:bg-white/70 border border-charcoal/5 hover:border-olive/15 hover:shadow-xs transition-all duration-300 group"
                    >
                      <div className="w-10 h-10 shrink-0 rounded-xl bg-olive/10 border border-olive/20 flex items-center justify-center text-olive group-hover:scale-105 transition-all">
                        <Mail className="h-4.5 w-4.5" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[9px] uppercase font-sans font-bold tracking-widest text-charcoal/40 block">Research Email</span>
                        <span className="font-sans text-xs md:text-sm font-semibold text-charcoal break-all">{contactInfo.email}</span>
                      </div>
                    </a>
                  )}

                  {/* Location */}
                  {contactInfo.location && (
                    <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-white/40 border border-charcoal/5">
                      <div className="w-10 h-10 shrink-0 rounded-xl bg-gold-accent/10 border border-gold-accent/20 flex items-center justify-center text-gold-accent">
                        <MapPin className="h-4.5 w-4.5" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[9px] uppercase font-sans font-bold tracking-widest text-charcoal/40 block">Primary Base</span>
                        <span className="font-sans text-xs md:text-sm font-semibold text-charcoal">{contactInfo.location}</span>
                      </div>
                    </div>
                  )}

                  {/* Institution */}
                  <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-white/40 border border-charcoal/5">
                    <div className="w-10 h-10 shrink-0 rounded-xl bg-olive/10 border border-olive/20 flex items-center justify-center text-olive">
                      <Building className="h-4.5 w-4.5" />
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[9px] uppercase font-sans font-bold tracking-widest text-charcoal/40 block">{contactInfo.focusLabel}</span>
                      <span className="font-sans text-xs md:text-sm font-semibold text-charcoal">{contactInfo.focusValue}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sanskrit Ecological Quote Callout */}
              <div className="mt-8 p-4 rounded-[1.5rem] border border-olive/10 bg-olive/5 relative overflow-hidden flex-shrink-0">
                <span className="absolute -left-4 -top-8 text-8xl text-olive/5 font-serif-italic select-none pointer-events-none font-bold">“</span>
                <p className="font-serif-italic text-xs md:text-sm text-olive leading-relaxed relative z-10 pl-2">
                  {contactInfo.quote}
                </p>
              </div>
            </div>

            {/* Lower Networks Panel */}
            <div className="glassmorphism-premium rounded-[2.5rem] p-8 border border-charcoal/10 shadow-xs">
              <h4 className="font-sans-ultra-bold text-xs uppercase tracking-widest text-charcoal mb-6">
                Academic & Social Networks
              </h4>
              <div className="grid grid-cols-2 gap-4">
                {/* LinkedIn */}
                {contactInfo.linkedin && (
                  <a 
                    href={contactInfo.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/30 hover:bg-[#0a66c2]/10 border border-charcoal/5 hover:border-[#0a66c2]/20 hover:text-[#0a66c2] hover:shadow-2xs transition-all duration-300 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white shadow-3xs flex items-center justify-center group-hover:scale-105 transition-transform text-[#0a66c2]">
                      <Linkedin className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-bold tracking-wider uppercase">LinkedIn</span>
                  </a>
                )}

                {/* Google Scholar */}
                {contactInfo.googleScholar && (
                  <a 
                    href={contactInfo.googleScholar}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/30 hover:bg-gold-accent/10 border border-charcoal/5 hover:border-gold-accent/20 hover:text-gold-accent hover:shadow-2xs transition-all duration-300 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white shadow-3xs flex items-center justify-center group-hover:scale-105 transition-transform text-gold-accent">
                      <BookOpen className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-bold tracking-wider uppercase">Scholar</span>
                  </a>
                )}

                {/* ResearchGate */}
                {contactInfo.researchGate && (
                  <a 
                    href={contactInfo.researchGate}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/30 hover:bg-olive/10 border border-charcoal/5 hover:border-olive/20 hover:text-olive hover:shadow-2xs transition-all duration-300 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white shadow-3xs flex items-center justify-center group-hover:scale-105 transition-transform text-olive">
                      <Compass className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-bold tracking-wider uppercase">ResearchGate</span>
                  </a>
                )}

                {/* ORCID */}
                {contactInfo.orcid && (
                  <a 
                    href={contactInfo.orcid}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/30 hover:bg-[#a62626]/10 border border-charcoal/5 hover:border-[#a62626]/20 hover:text-[#a62626] hover:shadow-2xs transition-all duration-300 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white shadow-3xs flex items-center justify-center group-hover:scale-105 transition-transform text-[#a62626]">
                      <FileText className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-bold tracking-wider uppercase">ORCID</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Column 2: Contact Form Card */}
          <div className="lg:col-span-7">
            <div className="glassmorphism-premium rounded-[3rem] p-8 md:p-12 border border-charcoal/10 shadow-lg relative min-h-[580px] flex flex-col justify-center">
              
              {!isSubmitted ? (
                // Form Fields
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* Inquiry Type Toggles */}
                  <div className="space-y-3">
                    <label className="text-xs uppercase font-sans font-bold tracking-widest text-charcoal-light flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-base">forum</span>
                      Select Inquiry Type *
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {inquiryTypes.map((type) => {
                        const isSelected = formData.inquiryType === type.id;
                        return (
                          <button
                            key={type.id}
                            type="button"
                            onClick={() => selectInquiryType(type.id)}
                            className={`rounded-2xl py-4 px-2.5 text-center border transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-2 shadow-3xs ${
                              isSelected ? type.selectedClass : type.unselectedClass
                            }`}
                          >
                            <span className="material-symbols-outlined text-xl md:text-2xl" style={{ fontVariationSettings: isSelected ? "'FILL' 1" : "'FILL' 0" }}>
                              {type.icon}
                            </span>
                            <span className="text-[10px] md:text-[11px] uppercase tracking-widest font-sans font-extrabold">{type.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Two columns: Name & Email */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name */}
                    <div className="space-y-2">
                      <label className="text-xs uppercase font-sans font-bold tracking-widest text-charcoal-light flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-base">person</span>
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="e.g. Dr. Anirudh Sen"
                        className={`w-full rounded-xl border bg-white/50 px-4 py-3 text-sm text-charcoal placeholder:text-charcoal-light/45 focus:bg-white focus:outline-none focus:ring-2 focus:ring-olive/10 transition-all ${
                          errors.name ? "border-red-500 focus:border-red-500" : "border-charcoal/10 focus:border-olive"
                        }`}
                      />
                      {errors.name && (
                        <p className="text-red-600 text-2xs font-semibold flex items-center gap-1 mt-1 font-sans">
                          <AlertCircle className="h-3 w-3 shrink-0" />
                          {errors.name}
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <label className="text-xs uppercase font-sans font-bold tracking-widest text-charcoal-light flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-base">mail</span>
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="e.g. anirudh@un.org"
                        className={`w-full rounded-xl border bg-white/50 px-4 py-3 text-sm text-charcoal placeholder:text-charcoal-light/45 focus:bg-white focus:outline-none focus:ring-2 focus:ring-olive/10 transition-all ${
                          errors.email ? "border-red-500 focus:border-red-500" : "border-charcoal/10 focus:border-olive"
                        }`}
                      />
                      {errors.email && (
                        <p className="text-red-600 text-2xs font-semibold flex items-center gap-1 mt-1 font-sans">
                          <AlertCircle className="h-3 w-3 shrink-0" />
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Organization (Optional) */}
                  <div className="space-y-2">
                    <label className="text-xs uppercase font-sans font-bold tracking-widest text-charcoal-light flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-base">corporate_fare</span>
                      Organization / Affiliation
                    </label>
                    <input
                      type="text"
                      name="organization"
                      value={formData.organization}
                      onChange={handleInputChange}
                      placeholder="e.g. Delhi University / UNEP / Brookings"
                      className="w-full rounded-xl border border-charcoal/10 bg-white/50 px-4 py-3 text-sm text-charcoal placeholder:text-charcoal-light/45 focus:border-olive focus:bg-white focus:outline-none focus:ring-2 focus:ring-olive/10 transition-all"
                    />
                  </div>

                  {/* Subject */}
                  <div className="space-y-2">
                    <label className="text-xs uppercase font-sans font-bold tracking-widest text-charcoal-light flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-base">subject</span>
                      Subject *
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="e.g. Proposal for Green Governance Roundtable"
                      className={`w-full rounded-xl border bg-white/50 px-4 py-3 text-sm text-charcoal placeholder:text-charcoal-light/45 focus:bg-white focus:outline-none focus:ring-2 focus:ring-olive/10 transition-all ${
                        errors.subject ? "border-red-500 focus:border-red-500" : "border-charcoal/10 focus:border-olive"
                      }`}
                    />
                    {errors.subject && (
                      <p className="text-red-600 text-2xs font-semibold flex items-center gap-1 mt-1 font-sans">
                        <AlertCircle className="h-3 w-3 shrink-0" />
                        {errors.subject}
                      </p>
                    )}
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <label className="text-xs uppercase font-sans font-bold tracking-widest text-charcoal-light flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-base">notes</span>
                      Message Detail *
                    </label>
                    <textarea
                      name="message"
                      rows="5"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Share your detailed proposal, inquiries or notes..."
                      className={`w-full rounded-xl border bg-white/50 px-4 py-3 text-sm text-charcoal placeholder:text-charcoal-light/45 focus:bg-white focus:outline-none focus:ring-2 focus:ring-olive/10 transition-all ${
                        errors.message ? "border-red-500 focus:border-red-500" : "border-charcoal/10 focus:border-olive"
                      }`}
                    ></textarea>
                    {errors.message && (
                      <p className="text-red-600 text-2xs font-semibold flex items-center gap-1 mt-1 font-sans">
                        <AlertCircle className="h-3 w-3 shrink-0" />
                        {errors.message}
                      </p>
                    )}
                  </div>

                  {/* API Submission Error */}
                  {errors.submit && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-700 text-xs font-semibold flex items-center gap-2 font-sans">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      {errors.submit}
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-4 bg-gradient-to-r from-charcoal to-charcoal-light text-cream-lightest rounded-2xl font-sans font-bold text-sm tracking-wider uppercase hover:shadow-[0_8px_30px_rgba(27,28,28,0.2)] hover:scale-101 disabled:opacity-50 disabled:pointer-events-none transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer border border-charcoal/20"
                    >
                      {submitting ? (
                        <>
                          <span className="material-symbols-outlined animate-spin text-lg">sync</span>
                          Processing Inquiry...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Transmit Inquiry
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-center text-[10px] text-charcoal-light/60 font-sans tracking-wide">
                    Fields marked with (*) are mandatory coordinates.
                  </p>
                </form>
              ) : (
                // Success View State
                <div className="text-center space-y-6 py-12 animate-scale-up">
                  <div className="mx-auto w-20 h-20 rounded-full bg-emerald-100 border-2 border-emerald-400/30 flex items-center justify-center text-emerald-600 shadow-md">
                    <CheckCircle className="h-10 w-10 animate-pulse" />
                  </div>

                  <div className="space-y-3">
                    <span className="font-label-md text-emerald-800 bg-emerald-500/10 border border-emerald-500/15 rounded-full px-4 py-1.5 text-2xs uppercase tracking-widest font-extrabold inline-flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-xs">verified</span> Message Successfully Transmitted
                    </span>
                    <h2 className="font-sans-ultra-bold text-2xl md:text-3xl text-charcoal uppercase leading-tight">
                      Thank You, {formData.name}!
                    </h2>
                    <p className="font-serif-italic text-base md:text-lg text-olive max-w-md mx-auto">
                      Your proposal for **{formData.inquiryType}** has been securely recorded.
                    </p>
                  </div>

                  <div className="p-6 rounded-2xl border border-olive/10 bg-white/40 max-w-md mx-auto space-y-3 text-left">
                    <p className="font-sans text-xs text-charcoal-light leading-relaxed">
                      "Deliberation (*Manthan*) takes time. Ideas submitted are treated with intellectual stewardship."
                    </p>
                    <div className="pt-2 border-t border-charcoal/5 flex justify-between items-center text-[10px] text-charcoal-light/60 uppercase font-bold tracking-wider">
                      <span>Coordinates logged:</span>
                      <span>{formData.email}</span>
                    </div>
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
                    <button
                      onClick={() => {
                        setFormData({
                          name: "",
                          email: "",
                          organization: "",
                          inquiryType: "Academic Collaboration",
                          subject: "",
                          message: ""
                        });
                        setErrors({});
                        setIsSubmitted(false);
                      }}
                      className="px-6 py-3 border border-olive/20 text-olive hover:bg-olive/5 rounded-xl font-sans font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                    >
                      Send Another Message
                    </button>
                    <a
                      href="/"
                      className="px-6 py-3 bg-olive text-cream-lightest hover:bg-olive-dark rounded-xl font-sans font-bold text-xs uppercase tracking-wider hover:shadow-md transition-all flex items-center justify-center gap-1.5"
                    >
                      <ArrowLeft className="h-3 w-3" />
                      Back to Home
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

      </main>

      {/* Styled Footer */}
      <footer className="border-t border-olive/10 py-10 mt-24" style={{ backgroundColor: 'rgba(243, 234, 219, 0.4)' }}>
        <div className="mx-auto max-w-[1600px] px-6 md:px-12 flex flex-col sm:flex-row items-center justify-between gap-4">
          <a href="/" className="flex items-center gap-2 text-sm font-semibold text-olive hover:text-olive-dark transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Portfolio
          </a>
          <div className="flex items-center gap-2 text-charcoal-light/75">
            <span className="material-symbols-outlined text-olive text-sm">eco</span>
            <span className="font-sans text-xs font-bold text-charcoal tracking-wide">Jahnvi &copy; 2026 • Equilibrium & Harmony</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
