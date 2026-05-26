"use client";

import { useState, useEffect, useRef } from "react";
import {
  Lock,
  Plus,
  Trash2,
  Edit2,
  Save,
  LogOut,
  User,
  GraduationCap,
  BookOpen,
  Globe,
  FileText,
  Award,
  Upload,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Eye,
  Settings,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link2,
  Table as TableIcon,
  Undo,
  Redo
} from "lucide-react";

// Client-side MS Word paste converter to dynamic Markdown structure
function convertHtmlToMarkdown(html) {
  if (!html) return "";
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  
  // A helper function to walk the DOM tree recursively
  function walk(node) {
    let text = "";
    if (node.nodeType === Node.TEXT_NODE) {
      return node.nodeValue;
    }
    
    if (node.nodeType !== Node.ELEMENT_NODE) {
      return "";
    }

    const tagName = node.tagName.toLowerCase();
    
    // Process children first for inline tags
    let childrenText = "";
    for (const child of node.childNodes) {
      childrenText += walk(child);
    }

    // Process tag types
    switch (tagName) {
      case "h1":
        return `\n# ${childrenText.trim()}\n`;
      case "h2":
        return `\n## ${childrenText.trim()}\n`;
      case "h3":
        return `\n### ${childrenText.trim()}\n`;
      case "h4":
      case "h5":
      case "h6":
        return `\n#### ${childrenText.trim()}\n`;
      case "p": {
        // Check if this is an MS Word list paragraph
        const isWordList = node.className && node.className.includes("MsoListParagraph");
        const style = node.getAttribute("style") || "";
        const hasMsoList = style.includes("mso-list");
        
        if (isWordList || hasMsoList) {
          let listPrefix = "- ";
          let cleanText = childrenText.trim();
          
          const bulletMatch = cleanText.match(/^([·•o§\-*]|\d+\.)\s*(.*)/);
          if (bulletMatch) {
            const prefix = bulletMatch[1];
            if (prefix.endsWith(".")) {
              listPrefix = prefix + " ";
            }
            cleanText = bulletMatch[2];
          }
          return `\n${listPrefix}${cleanText}\n`;
        }
        
        return `\n${childrenText.trim()}\n`;
      }
      case "br":
        return "\n";
        
      case "li": {
        const parentTagName = node.parentNode ? node.parentNode.tagName.toLowerCase() : "";
        if (parentTagName === "ol") {
          let index = 1;
          let prev = node.previousSibling;
          while (prev) {
            if (prev.nodeType === Node.ELEMENT_NODE && prev.tagName.toLowerCase() === "li") {
              index++;
            }
            prev = prev.previousSibling;
          }
          return `\n${index}. ${childrenText.trim()}\n`;
        }
        return `\n- ${childrenText.trim()}\n`;
      }
      case "ul":
      case "ol":
        return `\n${childrenText}\n`;
        
      case "strong":
      case "b": {
        const trimmedStrong = childrenText.trim();
        return trimmedStrong ? ` **${trimmedStrong}** ` : "";
      }
      case "em":
      case "i": {
        const trimmedEm = childrenText.trim();
        return trimmedEm ? ` *${trimmedEm}* ` : "";
      }
      case "a": {
        const href = node.getAttribute("href") || "";
        const anchorText = childrenText.trim();
        return href && anchorText ? `[${anchorText}](${href})` : anchorText;
      }
      case "table": {
        const trs = Array.from(node.querySelectorAll("tr"));
        if (trs.length === 0) return "";
        
        let markdownTable = "\n";
        trs.forEach((tr, rowIdx) => {
          const cells = Array.from(tr.querySelectorAll("th, td"));
          const cellTexts = cells.map(cell => {
            let txt = cell.textContent || "";
            return txt.replace(/\s+/g, " ").trim().replace(/\|/g, "\\|");
          });
          
          markdownTable += "| " + cellTexts.join(" | ") + " |\n";
          
          if (rowIdx === 0) {
            const separators = cellTexts.map(() => "---");
            markdownTable += "| " + separators.join(" | ") + " |\n";
          }
        });
        return markdownTable + "\n";
      }
      case "tr":
      case "td":
      case "th":
      case "thead":
      case "tbody":
        return "";
        
      default: {
        const styleAttr = node.getAttribute("style") || "";
        let wrapped = childrenText;
        if (styleAttr.includes("font-weight:bold") || styleAttr.includes("font-weight: 700")) {
          wrapped = ` **${wrapped.trim()}** `;
        }
        if (styleAttr.includes("font-style:italic")) {
          wrapped = ` *${wrapped.trim()}* `;
        }
        return wrapped;
      }
    }
  }

  let markdown = walk(doc.body);
  
  markdown = markdown
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\*\*\s*\*\*/g, "")
    .trim();
    
  return markdown;
}

// Simple admin markdown parser helper for markdown drafts preview
function parseAdminInlineFormatting(text) {
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
          <a key={idx} href={linkUrl} target="_blank" rel="noopener noreferrer" className="text-olive hover:text-olive-dark underline font-semibold transition-colors duration-300">
            {linkText}
          </a>
        );
      }
    }
    
    // Bold token
    if (token.startsWith("**") && token.endsWith("**")) {
      return <strong key={idx} className="font-bold text-charcoal">{token.slice(2, -2)}</strong>;
    }
    
    // Italic token sub-parsing
    const subParts = token.split(/(\*.*?\*)/g);
    return subParts.map((subPart, j) => {
      if (subPart.startsWith("*") && subPart.endsWith("*")) {
        return <em key={j} className="italic text-warm-gray">{subPart.slice(1, -1)}</em>;
      }
      return subPart;
    });
  });
}

function renderAdminMarkdown(content) {
  if (!content) return null;
  const lines = content.split("\n");
  const elements = [];
  
  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx];
    const trimmed = line.trim();
    
    if (trimmed.startsWith("# ")) {
      elements.push(<h1 key={idx} className="font-serif text-3xl md:text-4xl text-charcoal font-bold mt-8 mb-4 border-b pb-2">{trimmed.slice(2)}</h1>);
    } else if (trimmed.startsWith("## ")) {
      elements.push(<h2 key={idx} className="font-serif text-2xl md:text-3xl text-olive font-semibold mt-8 mb-4">{trimmed.slice(3)}</h2>);
    } else if (trimmed.startsWith("### ")) {
      elements.push(<h3 key={idx} className="font-serif text-xl md:text-2xl text-charcoal font-medium mt-6 mb-3">{trimmed.slice(4)}</h3>);
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      elements.push(
        <li key={idx} className="text-base text-charcoal-light list-disc ml-8 my-2">
          {parseAdminInlineFormatting(trimmed.slice(2))}
        </li>
      );
    } else if (trimmed.startsWith("1. ") || trimmed.startsWith("2. ") || trimmed.startsWith("3. ")) {
      elements.push(
        <li key={idx} className="text-base text-charcoal-light list-decimal ml-8 my-2">
          {parseAdminInlineFormatting(trimmed.slice(3))}
        </li>
      );
    } else if (trimmed === "") {
      elements.push(<div key={idx} className="h-4" />);
    } else {
      elements.push(
        <p key={idx} className="text-base text-charcoal-light leading-relaxed my-4">
          {parseAdminInlineFormatting(trimmed)}
        </p>
      );
    }
  }
  return elements;
}

export default function AdminDashboard() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [submittingLogin, setSubmittingLogin] = useState(false);

  // Content state loaded from database
  const [data, setData] = useState(null);
  const [loadingData, setLoadingData] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  
  // Modals / Editors state
  const [editItem, setEditItem] = useState(null);
  const [showModal, setShowModal] = useState(null); // 'milestone' | 'paper' | 'vista' | 'blog' | 'certificate'
  const [uploadingImage, setUploadingImage] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null); // { type: 'success' | 'error', text: '' }
  const [showBlogPreview, setShowBlogPreview] = useState(false); // Toggle live preview in blog editor

  const editorRef = useRef(null);

  // Ref callback: fires every time the editor div mounts (initial open AND when returning from preview).
  // This avoids any useEffect dependency-array size issues entirely.
  const setEditorRef = (el) => {
    editorRef.current = el;
    if (el && el.innerHTML !== (editItem?.content || "")) {
      el.innerHTML = editItem?.content || "";
    }
  };

  // Auto-calculate reading time from plain text word count (200 wpm average)
  const calcReadTime = (html) => {
    const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    const words = text ? text.split(" ").length : 0;
    const mins = Math.max(1, Math.ceil(words / 200));
    return `${mins} min read`;
  };

  const handleEditorInput = (e) => {
    const htmlValue = e.target.innerHTML;
    const autoReadTime = calcReadTime(htmlValue);
    setEditItem(prev => prev ? { ...prev, content: htmlValue, readTime: autoReadTime } : null);
  };

  const applyStyle = (command, value = null) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
      setEditItem(prev => prev ? { ...prev, content: editorRef.current.innerHTML } : null);
    }
  };

  const handleAddLink = () => {
    const url = prompt("Enter the URL link:", "https://");
    if (url) {
      document.execCommand("createLink", false, url);
      if (editorRef.current) {
        setEditItem(prev => prev ? { ...prev, content: editorRef.current.innerHTML } : null);
      }
    }
  };

  const handleInsertTable = () => {
    const rows = parseInt(prompt("Enter number of rows:", "3") || "0");
    const cols = parseInt(prompt("Enter number of columns:", "3") || "0");
    
    if (rows > 0 && cols > 0) {
      let tableHtml = "<table><thead><tr>";
      for (let c = 0; c < cols; c++) {
        tableHtml += `<th>Header ${c + 1}</th>`;
      }
      tableHtml += "</tr></thead><tbody>";
      for (let r = 0; r < rows; r++) {
        tableHtml += "<tr>";
        for (let c = 0; c < cols; c++) {
          tableHtml += `<td>Data Cell</td>`;
        }
        tableHtml += "</tr>";
      }
      tableHtml += "</tbody></table><p><br></p>";
      
      document.execCommand("insertHTML", false, tableHtml);
      if (editorRef.current) {
        setEditItem(prev => prev ? { ...prev, content: editorRef.current.innerHTML } : null);
      }
    }
  };

  // Check auth on boot
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth");
        const json = await res.json();
        if (json.authenticated) {
          setAuthenticated(true);
          fetchContent();
        }
      } catch (err) {
        console.error("Auth check failed:", err);
      } finally {
        setCheckingAuth(false);
      }
    }
    checkAuth();
  }, []);

  // Fetch complete portfolio data
  async function fetchContent() {
    setLoadingData(true);
    try {
      const res = await fetch("/api/content");
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (err) {
      console.error("Failed to load content:", err);
      showStatus("error", "Failed to load database content");
    } finally {
      setLoadingData(false);
    }
  }

  // Display toast feedback status
  const showStatus = (type, text) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // Perform login
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!password) return;
    
    setSubmittingLogin(true);
    setLoginError("");
    
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      
      const json = await res.json();
      if (res.ok && json.success) {
        setAuthenticated(true);
        fetchContent();
      } else {
        setLoginError(json.message || "Login failed");
      }
    } catch (err) {
      setLoginError("Failed to connect to authentication API");
    } finally {
      setSubmittingLogin(false);
    }
  };

  // Perform logout
  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth", { method: "DELETE" });
      if (res.ok) {
        setAuthenticated(false);
        setPassword("");
        setData(null);
      }
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // Unified CRUD save handler submitting to POST content API
  const handleSave = async (action, payload) => {
    try {
      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, payload }),
      });
      
      const json = await res.json();
      if (res.ok && json.success) {
        showStatus("success", "Changes saved successfully!");
        setShowModal(null);
        setEditItem(null);
        fetchContent();
      } else {
        showStatus("error", json.error || "Failed to save changes");
      }
    } catch (err) {
      showStatus("error", "Network connection error");
    }
  };

  // Unified CRUD delete handler
  const handleDelete = async (action, id) => {
    if (!window.confirm("Are you absolutely sure you want to delete this entry? This action is irreversible.")) {
      return;
    }
    
    try {
      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, payload: { id } }),
      });
      
      const json = await res.json();
      if (res.ok && json.success) {
        showStatus("success", "Entry deleted successfully!");
        fetchContent();
      } else {
        showStatus("error", json.error || "Failed to delete entry");
      }
    } catch (err) {
      showStatus("error", "Network connection error");
    }
  };

  // Direct dynamic image file uploader
  const handleImageUpload = async (e, callback) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setUploadingImage(true);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (res.ok && json.success) {
        showStatus("success", "Image uploaded successfully!");
        // The API returns both 'key' (e.g. upload_123.jpg) and 'url' (e.g. /api/images/upload_123.jpg)
        // We will pass the 'key' or 'url' to the callback based on preferences.
        // Let's pass the 'key' (or full URL) so Mongoose maps it seamlessly.
        callback(json.key);
      } else {
        showStatus("error", json.error || "Failed to upload image");
      }
    } catch (err) {
      showStatus("error", "Upload connection error");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleBlogPaste = (e) => {
    const html = e.clipboardData.getData("text/html");
    if (html && (html.includes("Mso") || html.includes("office:word") || html.includes("<table") || html.includes("class=\"Mso"))) {
      setTimeout(() => {
        showStatus("success", "Premium MS Word layout successfully pasted and preserved!");
        if (editorRef.current) {
          setEditItem(prev => prev ? { ...prev, content: editorRef.current.innerHTML } : null);
        }
      }, 100);
    }
  };

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-cream text-charcoal">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-olive/20 border-t-olive"></div>
        <p className="mt-4 font-serif text-olive animate-pulse tracking-wide">Securing connection gate...</p>
      </div>
    );
  }

  // --- LOGIN PANEL GRAPHIC ---
  if (!authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream p-4 text-charcoal relative select-text">
        <div className="pointer-events-none absolute -top-1/4 -left-1/4 z-0 h-1/2 w-1/2 radial-glow opacity-50"></div>
        <div className="pointer-events-none absolute -bottom-1/4 -right-1/4 z-0 h-1/2 w-1/2 radial-glow opacity-50"></div>

        <div className="relative z-10 w-full max-w-md glassmorphism shadow-sm p-8 rounded-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-olive/30 bg-cream-dark text-olive">
              <Lock className="h-5 w-5" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-charcoal tracking-wide">Dashboard Authentication</h1>
            <p className="text-xs text-warm-gray">Jahnvi's Premium Portfolio Administrative Panel</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-charcoal-light uppercase tracking-widest block">Admin Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full rounded-lg border border-olive/25 bg-cream px-4 py-3 text-sm text-charcoal placeholder-slate-500 focus:border-olive focus:outline-none"
              />
            </div>

            {loginError && (
              <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/25 p-3 text-xs text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={submittingLogin}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-olive px-4 py-3 text-sm font-semibold tracking-wider text-cream-lightest transition-all hover:bg-olive/90 disabled:opacity-50"
            >
              {submittingLogin ? "Validating..." : "Enter Ecosystem"}
            </button>
          </form>

          <div className="text-center">
            <a
              href="/"
              className="inline-flex items-center gap-1 text-xs text-warm-gray hover:text-charcoal transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Public Portfolio
            </a>
          </div>
        </div>
      </div>
    );
  }

  // --- DASHBOARD ACTIVE PANEL ---
  return (
    <div className="min-h-screen bg-cream text-charcoal font-sans pb-24 relative select-text">
      
      {/* Toast Feedback Status Banner */}
      {statusMessage && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border p-4 shadow-2xl ${
          statusMessage.type === "success"
            ? "bg-olive/15 border-olive text-olive"
            : "bg-red-500/15 border-red-500 text-red-500"
        }`}>
          {statusMessage.type === "success" ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          <span className="text-xs font-semibold">{statusMessage.text}</span>
        </div>
      )}

      {/* ADMIN NAVIGATION BAR */}
      <header className="glassmorphism shadow-sm sticky top-0 z-40 w-full border-b border-olive/10 px-6 py-4 md:px-12">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-olive animate-spin-slow" />
            <h1 className="font-serif text-lg font-bold text-charcoal tracking-wide">Ecosystem Dashboard</h1>
            <span className="hidden sm:inline-block rounded bg-olive/10 border border-olive/20 px-2 py-0.5 text-3xs font-extrabold uppercase tracking-widest text-olive">
              Live MongoDB
            </span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="/"
              target="_blank"
              className="flex items-center gap-1.5 rounded-lg border border-olive/10 bg-olive/5 px-4 py-2 text-xs font-semibold tracking-wider text-charcoal-light hover:bg-olive/10 hover:text-charcoal"
            >
              <Eye className="h-3.5 w-3.5" />
              View Site
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-semibold tracking-wider text-red-400 hover:bg-red-500 hover:text-charcoal transition-all cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              Exit
            </button>
          </div>
        </div>
      </header>

      {/* DASHBOARD CONTAINER */}
      <main className="mx-auto max-w-7xl px-6 pt-8 md:px-12 grid gap-8 lg:grid-cols-12">
        
        {/* Left Side Tab Controls */}
        <nav className="lg:col-span-3 flex flex-row overflow-x-auto lg:flex-col lg:space-y-2 gap-2 bg-cream-medium/50 p-4 border border-olive/5 rounded-xl h-fit w-full scrollbar-none">
          {[
            { id: "profile", label: "Profile Information", icon: User },
            { id: "milestone", label: "Academic timeline", icon: GraduationCap },
            { id: "paper", label: "Research Papers", icon: BookOpen },
            { id: "vista", label: "Global Vistas", icon: Globe },
            { id: "blog", label: "Philosophy Blogs", icon: FileText },
            { id: "certificate", label: "Certificates", icon: Award }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setShowModal(null);
                  setEditItem(null);
                }}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold tracking-wide transition-all shrink-0 whitespace-nowrap lg:w-full ${
                  activeTab === tab.id
                    ? "bg-olive text-cream-lightest shadow-lg shadow-olive/15"
                    : "text-charcoal-light hover:bg-olive/10 hover:text-charcoal"
                }`}
              >
                <Icon className="h-4.5 w-4.5 shrink-0" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Right Side Content Management Body */}
        <section className="lg:col-span-9 space-y-6">
          {loadingData ? (
            <div className="flex h-64 items-center justify-center rounded-xl bg-cream-dark/10 border border-olive/5">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-olive/20 border-t-olive"></div>
            </div>
          ) : (
            <>
              {/* --- TAB CONTENT: PROFILE --- */}
              {activeTab === "profile" && data?.profile && (
                <div className="glassmorphism shadow-sm p-6 rounded-xl space-y-6">
                  <div className="flex items-center justify-between border-b border-olive/10 pb-4">
                    <h2 className="font-serif text-xl font-bold text-charcoal">Profile Details</h2>
                    <button
                      onClick={() => handleSave("update_profile", data.profile)}
                      className="flex items-center gap-1.5 rounded-lg bg-olive px-4 py-2 text-xs font-bold text-cream-lightest hover:bg-olive/90"
                    >
                      <Save className="h-4 w-4" />
                      Save Details
                    </button>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-2xs font-extrabold uppercase tracking-widest text-warm-gray">Full Name</label>
                      <input
                        type="text"
                        value={data.profile.name}
                        onChange={(e) => setData({ ...data, profile: { ...data.profile, name: e.target.value } })}
                        className="w-full rounded-lg border border-olive/20 bg-cream px-4 py-2.5 text-sm text-charcoal focus:border-olive focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-2xs font-extrabold uppercase tracking-widest text-warm-gray">Professional Title</label>
                      <input
                        type="text"
                        value={data.profile.title}
                        onChange={(e) => setData({ ...data, profile: { ...data.profile, title: e.target.value } })}
                        className="w-full rounded-lg border border-olive/20 bg-cream px-4 py-2.5 text-sm text-charcoal focus:border-olive focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-2xs font-extrabold uppercase tracking-widest text-warm-gray">Hero Tagline</label>
                      <input
                        type="text"
                        value={data.profile.tagline}
                        onChange={(e) => setData({ ...data, profile: { ...data.profile, tagline: e.target.value } })}
                        className="w-full rounded-lg border border-olive/20 bg-cream px-4 py-2.5 text-sm text-charcoal focus:border-olive focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-2xs font-extrabold uppercase tracking-widest text-warm-gray">Bio Statement (Introduction)</label>
                      <textarea
                        rows={4}
                        value={data.profile.bioIntro}
                        onChange={(e) => setData({ ...data, profile: { ...data.profile, bioIntro: e.target.value } })}
                        className="w-full rounded-lg border border-olive/20 bg-cream px-4 py-2.5 text-sm text-charcoal focus:border-olive focus:outline-none leading-relaxed"
                      />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-2xs font-extrabold uppercase tracking-widest text-warm-gray">Bio Statement (Secondary)</label>
                      <textarea
                        rows={4}
                        value={data.profile.bioSecondary}
                        onChange={(e) => setData({ ...data, profile: { ...data.profile, bioSecondary: e.target.value } })}
                        className="w-full rounded-lg border border-olive/20 bg-cream px-4 py-2.5 text-sm text-charcoal focus:border-olive focus:outline-none leading-relaxed"
                      />
                    </div>

                    {/* Avatar Upload */}
                    <div className="space-y-1 md:col-span-2 border-t border-olive/10 pt-6">
                      <label className="text-2xs font-extrabold uppercase tracking-widest text-warm-gray block mb-2">Profile Avatar image</label>
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 overflow-hidden rounded-xl border border-olive/30 bg-cream">
                          {data.profile.avatarUrl ? (
                            <img src={data.profile.avatarUrl} alt="Avatar Preview" className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-warm-gray-light"><User className="h-6 w-6" /></div>
                          )}
                        </div>
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            id="avatar-upload"
                            className="hidden"
                            onChange={(e) => handleImageUpload(e, (urlPath) => {
                              // We set avatarUrl equal to served API image route
                              setData({ ...data, profile: { ...data.profile, avatarUrl: `/api/images/${urlPath}` } });
                            })}
                          />
                          <label
                            htmlFor="avatar-upload"
                            className="flex items-center gap-1.5 rounded-lg border border-olive/30 bg-olive/10 px-4 py-2 text-xs font-semibold text-olive cursor-pointer hover:bg-olive/20"
                          >
                            <Upload className="h-3.5 w-3.5" />
                            {uploadingImage ? "Uploading..." : "Upload New Photo"}
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Contact links */}
                    <div className="space-y-4 md:col-span-2 border-t border-olive/10 pt-6">
                      <h3 className="font-serif text-sm font-bold text-charcoal uppercase tracking-wider">Contact & Social Anchors</h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-1">
                          <label className="text-2xs font-semibold text-warm-gray">Primary Email</label>
                          <input
                            type="text"
                            value={data.profile.contact?.email || ""}
                            onChange={(e) => setData({
                              ...data,
                              profile: {
                                ...data.profile,
                                contact: { ...data.profile.contact, email: e.target.value }
                              }
                            })}
                            className="w-full rounded-lg border border-olive/20 bg-cream px-4 py-2.5 text-sm text-charcoal focus:border-olive focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-2xs font-semibold text-warm-gray">Office Location</label>
                          <input
                            type="text"
                            value={data.profile.contact?.location || ""}
                            onChange={(e) => setData({
                              ...data,
                              profile: {
                                ...data.profile,
                                contact: { ...data.profile.contact, location: e.target.value }
                              }
                            })}
                            className="w-full rounded-lg border border-olive/20 bg-cream px-4 py-2.5 text-sm text-charcoal focus:border-olive focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-2xs font-semibold text-warm-gray">LinkedIn Link</label>
                          <input
                            type="text"
                            value={data.profile.contact?.linkedin || ""}
                            onChange={(e) => setData({
                              ...data,
                              profile: {
                                ...data.profile,
                                contact: { ...data.profile.contact, linkedin: e.target.value }
                              }
                            })}
                            className="w-full rounded-lg border border-olive/20 bg-cream px-4 py-2.5 text-sm text-charcoal focus:border-olive focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-2xs font-semibold text-warm-gray">Google Scholar Profile</label>
                          <input
                            type="text"
                            value={data.profile.contact?.googleScholar || ""}
                            onChange={(e) => setData({
                              ...data,
                              profile: {
                                ...data.profile,
                                contact: { ...data.profile.contact, googleScholar: e.target.value }
                              }
                            })}
                            className="w-full rounded-lg border border-olive/20 bg-cream px-4 py-2.5 text-sm text-charcoal focus:border-olive focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-2xs font-semibold text-warm-gray">ResearchGate Profile Link</label>
                          <input
                            type="text"
                            value={data.profile.contact?.researchGate || ""}
                            onChange={(e) => setData({
                              ...data,
                              profile: {
                                ...data.profile,
                                contact: { ...data.profile.contact, researchGate: e.target.value }
                              }
                            })}
                            className="w-full rounded-lg border border-olive/20 bg-cream px-4 py-2.5 text-sm text-charcoal focus:border-olive focus:outline-none"
                            placeholder="e.g. https://www.researchgate.net/profile/Jahnvi-Name"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-2xs font-semibold text-warm-gray">GitHub Link</label>
                          <input
                            type="text"
                            value={data.profile.contact?.github || ""}
                            onChange={(e) => setData({
                              ...data,
                              profile: {
                                ...data.profile,
                                contact: { ...data.profile.contact, github: e.target.value }
                              }
                            })}
                            className="w-full rounded-lg border border-olive/20 bg-cream px-4 py-2.5 text-sm text-charcoal focus:border-olive focus:outline-none"
                            placeholder="e.g. https://github.com/username"
                          />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-2xs font-semibold text-warm-gray">ORCID Identifier</label>
                          <input
                            type="text"
                            value={data.profile.contact?.orcid || ""}
                            onChange={(e) => setData({
                              ...data,
                              profile: {
                                ...data.profile,
                                contact: { ...data.profile.contact, orcid: e.target.value }
                              }
                            })}
                            className="w-full rounded-lg border border-olive/20 bg-cream px-4 py-2.5 text-sm text-charcoal focus:border-olive focus:outline-none"
                            placeholder="e.g. https://orcid.org/0000-0002-1825-0097"
                          />
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* --- TAB CONTENT: ACADEMIC TIMELINE --- */}
              {activeTab === "milestone" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between bg-cream-medium/50 p-4 border border-olive/5 rounded-xl">
                    <div>
                      <h2 className="font-serif text-lg font-bold text-charcoal">Timeline Milestones</h2>
                      <p className="text-xs text-warm-gray">Modify schools, fellowships, and academic degrees</p>
                    </div>
                    <button
                      onClick={() => {
                        setEditItem({ title: "", institution: "", period: "", grade: "", details: "", isHighlight: false, order: data?.academicBackground?.length || 0 });
                        setShowModal("milestone");
                      }}
                      className="flex items-center gap-1.5 rounded-lg bg-olive px-4 py-2 text-xs font-bold text-cream-lightest hover:bg-olive/90"
                    >
                      <Plus className="h-4 w-4" />
                      Add Milestone
                    </button>
                  </div>

                  <div className="space-y-4">
                    {data?.academicBackground?.map((item) => (
                      <div key={item._id} className="glassmorphism shadow-sm p-5 rounded-xl flex items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-serif text-base font-bold text-charcoal">{item.title}</h3>
                            {item.isHighlight && (
                              <span className="rounded bg-gold-accent/10 border border-gold-accent/25 px-1.5 py-0.5 text-3xs font-extrabold uppercase tracking-widest text-gold-accent">JRF</span>
                            )}
                          </div>
                          <p className="text-xs text-olive font-semibold">{item.institution} ({item.period})</p>
                          <p className="text-xs text-warm-gray font-light line-clamp-1">{item.details}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditItem({ ...item });
                              setShowModal("milestone");
                            }}
                            className="p-2 rounded-lg bg-cream-dark text-charcoal-light hover:text-charcoal border border-olive/5"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete("delete_milestone", item._id)}
                            className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-charcoal border border-red-500/20 transition-all"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* --- TAB CONTENT: RESEARCH PAPERS --- */}
              {activeTab === "paper" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between bg-cream-medium/50 p-4 border border-olive/5 rounded-xl">
                    <div>
                      <h2 className="font-serif text-lg font-bold text-charcoal">Research Papers</h2>
                      <p className="text-xs text-warm-gray">Manage published and presented conference work</p>
                    </div>
                    <button
                      onClick={() => {
                        setEditItem({ title: "", venue: "", date: "", type: "published", award: "", paperUrl: "", pdfUrl: "", abstract: "", description: "", images: [], order: data?.papers?.length || 0, showOnHome: true });
                        setShowModal("paper");
                      }}
                      className="flex items-center gap-1.5 rounded-lg bg-olive px-4 py-2 text-xs font-bold text-cream-lightest hover:bg-olive/90"
                    >
                      <Plus className="h-4 w-4" />
                      Add Paper
                    </button>
                  </div>

                  <div className="space-y-4">
                    {data?.papers?.map((item) => (
                      <div key={item._id} className="glassmorphism shadow-sm p-5 rounded-xl flex items-center justify-between gap-4">
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`rounded px-1.5 py-0.5 text-3xs font-extrabold uppercase tracking-widest ${
                              item.type === "published" ? "bg-olive/10 text-olive border border-olive/20" : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                            }`}>
                              {item.type}
                            </span>
                            <h3 className="font-serif text-base font-bold text-charcoal line-clamp-1">{item.title}</h3>
                          </div>
                          <p className="text-xs text-warm-gray italic">Venue: {item.venue} ({item.date})</p>
                          {item.award && (
                            <span className="inline-block text-3xs font-extrabold uppercase tracking-wider text-amber-500">
                              🏆 Award: {item.award}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditItem({ ...item });
                              setShowModal("paper");
                            }}
                            className="p-2 rounded-lg bg-cream-dark text-charcoal-light hover:text-charcoal border border-olive/5"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete("delete_paper", item._id)}
                            className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-charcoal border border-red-500/20 transition-all"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* --- TAB CONTENT: GLOBAL VISTAS --- */}
              {activeTab === "vista" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between bg-cream-medium/50 p-4 border border-olive/5 rounded-xl">
                    <div>
                      <h2 className="font-serif text-lg font-bold text-charcoal">Intellectual Vistas (Events)</h2>
                      <p className="text-xs text-warm-gray">Summits, forums and conferences attended globally</p>
                    </div>
                    <button
                      onClick={() => {
                        setEditItem({ title: "", organization: "", date: "", description: "", images: [], order: data?.vistas?.length || 0, showOnHome: true });
                        setShowModal("vista");
                      }}
                      className="flex items-center gap-1.5 rounded-lg bg-olive px-4 py-2 text-xs font-bold text-cream-lightest hover:bg-olive/90"
                    >
                      <Plus className="h-4 w-4" />
                      Add Event
                    </button>
                  </div>

                  <div className="space-y-4">
                    {data?.vistas?.map((item) => (
                      <div key={item._id} className="glassmorphism shadow-sm p-5 rounded-xl flex items-center justify-between gap-4">
                        <div className="space-y-1">
                          <h3 className="font-serif text-base font-bold text-charcoal">{item.title}</h3>
                          <p className="text-xs text-warm-gray font-semibold">{item.organization} ({item.date})</p>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            {item.showOnHome !== false ? (
                              <span className="rounded bg-gold-accent/10 border border-gold-accent/25 px-1.5 py-0.5 text-3xs font-extrabold uppercase tracking-widest text-gold-accent">Top 3 / Home</span>
                            ) : (
                              <span className="rounded bg-warm-gray/10 border border-warm-gray/20 px-1.5 py-0.5 text-3xs font-extrabold uppercase tracking-widest text-warm-gray">Subpage Only</span>
                            )}
                            {item.images && item.images.length > 0 && (
                              <span className="rounded bg-olive/10 border border-olive/20 px-1.5 py-0.5 text-3xs font-extrabold uppercase tracking-widest text-olive">
                                Images: {item.images.length}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditItem({ ...item });
                              setShowModal("vista");
                            }}
                            className="p-2 rounded-lg bg-cream-dark text-charcoal-light hover:text-charcoal border border-olive/5"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete("delete_vista", item._id)}
                            className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-charcoal border border-red-500/20 transition-all"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* --- TAB CONTENT: BLOGS --- */}
              {activeTab === "blog" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between bg-cream-medium/50 p-4 border border-olive/5 rounded-xl">
                    <div>
                      <h2 className="font-serif text-lg font-bold text-charcoal">Philosophy Blogs</h2>
                      <p className="text-xs text-warm-gray">Write articles on sustainability, climate, and writing</p>
                    </div>
                    <button
                      onClick={() => {
                        setEditItem({ title: "", content: "", coverImage: "", tags: [], date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }), readTime: "5 min read", slug: "" });
                        setShowModal("blog");
                      }}
                      className="flex items-center gap-1.5 rounded-lg bg-olive px-4 py-2 text-xs font-bold text-cream-lightest hover:bg-olive/90"
                    >
                      <Plus className="h-4 w-4" />
                      New Article
                    </button>
                  </div>

                  <div className="space-y-4">
                    {data?.blogs?.map((item) => (
                      <div key={item._id} className="glassmorphism shadow-sm p-5 rounded-xl flex items-center justify-between gap-4">
                        <div className="space-y-1">
                          <h3 className="font-serif text-base font-bold text-charcoal">{item.title}</h3>
                          <p className="text-xs text-warm-gray">Slug: {item.slug} | Date: {item.date}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditItem({ ...item });
                              setShowModal("blog");
                            }}
                            className="p-2 rounded-lg bg-cream-dark text-charcoal-light hover:text-charcoal border border-olive/5"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete("delete_blog", item._id)}
                            className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-charcoal border border-red-500/20 transition-all"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* --- TAB CONTENT: CERTIFICATES --- */}
              {activeTab === "certificate" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between bg-cream-medium/50 p-4 border border-olive/5 rounded-xl">
                    <div>
                      <h2 className="font-serif text-lg font-bold text-charcoal">Certificates</h2>
                      <p className="text-xs text-warm-gray">Validate JRF, academic achievements and courses</p>
                    </div>
                    <button
                      onClick={() => {
                        setEditItem({ title: "", issuer: "", date: "", verificationUrl: "", image: "", order: data?.certificates?.length || 0 });
                        setShowModal("certificate");
                      }}
                      className="flex items-center gap-1.5 rounded-lg bg-olive px-4 py-2 text-xs font-bold text-cream-lightest hover:bg-olive/90"
                    >
                      <Plus className="h-4 w-4" />
                      Add Certificate
                    </button>
                  </div>

                  <div className="space-y-4">
                    {data?.certificates?.map((item) => (
                      <div key={item._id} className="glassmorphism shadow-sm p-5 rounded-xl flex items-center justify-between gap-4">
                        <div className="space-y-1">
                          <h3 className="font-serif text-base font-bold text-charcoal">{item.title}</h3>
                          <p className="text-xs text-warm-gray font-semibold">{item.issuer} ({item.date})</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditItem({ ...item });
                              setShowModal("certificate");
                            }}
                            className="p-2 rounded-lg bg-cream-dark text-charcoal-light hover:text-charcoal border border-olive/5"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete("delete_certificate", item._id)}
                            className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-charcoal border border-red-500/20 transition-all"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </section>

      </main>

      {/* --- CRUD DIALOG MODALS MAP --- */}
      {showModal && editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cream/80 backdrop-blur-md select-text">
          <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-olive/20 bg-cream-lightest p-6 shadow-2xl focus:outline-none animate-scale-up">
            
            <div className="flex items-center justify-between border-b border-olive/10 pb-4 mb-6">
              <h3 className="font-serif text-lg font-bold text-charcoal">
                {editItem._id ? "Edit Entry" : "Create New Entry"} ({showModal})
              </h3>
              <button
                onClick={() => {
                  setShowModal(null);
                  setEditItem(null);
                }}
                className="text-warm-gray hover:text-charcoal"
              >
                Close
              </button>
            </div>

            {/* --- MODAL FORM: MILESTONE --- */}
            {showModal === "milestone" && (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-2xs font-semibold text-warm-gray">Milestone Title</label>
                    <input
                      type="text"
                      value={editItem.title}
                      onChange={(e) => setEditItem({ ...editItem, title: e.target.value })}
                      placeholder="e.g. Master's in Political Science"
                      className="w-full rounded-lg border border-olive/20 bg-cream px-4 py-2.5 text-sm focus:border-olive focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-2xs font-semibold text-warm-gray">Institution</label>
                    <input
                      type="text"
                      value={editItem.institution}
                      onChange={(e) => setEditItem({ ...editItem, institution: e.target.value })}
                      placeholder="e.g. IIS University"
                      className="w-full rounded-lg border border-olive/20 bg-cream px-4 py-2.5 text-sm focus:border-olive focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-2xs font-semibold text-warm-gray">Period Date</label>
                    <input
                      type="text"
                      value={editItem.period}
                      onChange={(e) => setEditItem({ ...editItem, period: e.target.value })}
                      placeholder="e.g. 2024 - 2026"
                      className="w-full rounded-lg border border-olive/20 bg-cream px-4 py-2.5 text-sm focus:border-olive focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-2xs font-semibold text-warm-gray">Grade / Rank (Optional)</label>
                    <input
                      type="text"
                      value={editItem.grade || ""}
                      onChange={(e) => setEditItem({ ...editItem, grade: e.target.value })}
                      placeholder="e.g. First Division"
                      className="w-full rounded-lg border border-olive/20 bg-cream px-4 py-2.5 text-sm focus:border-olive focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-2xs font-semibold text-warm-gray">Display Order</label>
                    <input
                      type="number"
                      value={editItem.order}
                      onChange={(e) => setEditItem({ ...editItem, order: parseInt(e.target.value) || 0 })}
                      className="w-full rounded-lg border border-olive/20 bg-cream px-4 py-2.5 text-sm focus:border-olive focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="highlight-checkbox"
                      checked={editItem.isHighlight || false}
                      onChange={(e) => setEditItem({ ...editItem, isHighlight: e.target.checked })}
                      className="h-4 w-4 rounded bg-cream border-olive/25 focus:ring-olive text-olive"
                    />
                    <label htmlFor="highlight-checkbox" className="text-xs font-semibold text-charcoal-light cursor-pointer">
                      Highlight with Confetti Celebration
                    </label>
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-2xs font-semibold text-warm-gray">Detailed Description</label>
                    <textarea
                      rows={3}
                      value={editItem.details || ""}
                      onChange={(e) => setEditItem({ ...editItem, details: e.target.value })}
                      className="w-full rounded-lg border border-olive/20 bg-cream px-4 py-2.5 text-sm focus:border-olive focus:outline-none leading-relaxed"
                    />
                  </div>
                </div>

                <button
                  onClick={() => handleSave("save_milestone", editItem)}
                  className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-olive px-4 py-2.5 text-sm font-semibold text-cream-lightest hover:bg-olive/90 mt-4"
                >
                  <Save className="h-4 w-4" />
                  Save Milestone
                </button>
              </div>
            )}

            {/* --- MODAL FORM: RESEARCH PAPER --- */}
            {showModal === "paper" && (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-2xs font-semibold text-warm-gray">Paper Title</label>
                    <input
                      type="text"
                      value={editItem.title}
                      onChange={(e) => setEditItem({ ...editItem, title: e.target.value })}
                      className="w-full rounded-lg border border-olive/20 bg-cream px-4 py-2.5 text-sm focus:border-olive focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-2xs font-semibold text-warm-gray">Publication Venue / Seminar</label>
                    <input
                      type="text"
                      value={editItem.venue}
                      onChange={(e) => setEditItem({ ...editItem, venue: e.target.value })}
                      className="w-full rounded-lg border border-olive/20 bg-cream px-4 py-2.5 text-sm focus:border-olive focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-2xs font-semibold text-warm-gray">Date</label>
                    <input
                      type="text"
                      value={editItem.date}
                      onChange={(e) => setEditItem({ ...editItem, date: e.target.value })}
                      className="w-full rounded-lg border border-olive/20 bg-cream px-4 py-2.5 text-sm focus:border-olive focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-2xs font-semibold text-warm-gray">Classification Type</label>
                    <select
                      value={editItem.type}
                      onChange={(e) => setEditItem({ ...editItem, type: e.target.value })}
                      className="w-full rounded-lg border border-olive/20 bg-cream px-4 py-2.5 text-sm focus:border-olive focus:outline-none"
                    >
                      <option value="published">Published</option>
                      <option value="presented">Presented</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-2xs font-semibold text-warm-gray">Award Details (Optional)</label>
                    <input
                      type="text"
                      value={editItem.award || ""}
                      onChange={(e) => setEditItem({ ...editItem, award: e.target.value })}
                      placeholder="e.g. Best Paper Presenter Award"
                      className="w-full rounded-lg border border-olive/20 bg-cream px-4 py-2.5 text-sm focus:border-olive focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-2xs font-semibold text-warm-gray">Source Link URL</label>
                    <input
                      type="text"
                      value={editItem.paperUrl || ""}
                      onChange={(e) => setEditItem({ ...editItem, paperUrl: e.target.value })}
                      className="w-full rounded-lg border border-olive/20 bg-cream px-4 py-2.5 text-sm focus:border-olive focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-2xs font-semibold text-warm-gray">PDF Document Google Drive URL</label>
                    <input
                      type="text"
                      value={editItem.pdfUrl || ""}
                      onChange={(e) => setEditItem({ ...editItem, pdfUrl: e.target.value })}
                      className="w-full rounded-lg border border-olive/20 bg-cream px-4 py-2.5 text-sm focus:border-olive focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-2xs font-semibold text-warm-gray">Display Order</label>
                    <input
                      type="number"
                      value={editItem.order || 0}
                      onChange={(e) => setEditItem({ ...editItem, order: parseInt(e.target.value) || 0 })}
                      className="w-full rounded-lg border border-olive/20 bg-cream px-4 py-2.5 text-sm focus:border-olive focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="showonhome-checkbox"
                      checked={editItem.showOnHome !== false}
                      onChange={(e) => setEditItem({ ...editItem, showOnHome: e.target.checked })}
                      className="h-4 w-4 rounded bg-cream border-olive/25 focus:ring-olive text-olive"
                    />
                    <label htmlFor="showonhome-checkbox" className="text-xs font-semibold text-charcoal-light cursor-pointer">
                      Show on Homepage (Featured Top 6)
                    </label>
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-2xs font-semibold text-warm-gray">Research Abstract</label>
                    <textarea
                      rows={4}
                      value={editItem.abstract || ""}
                      onChange={(e) => setEditItem({ ...editItem, abstract: e.target.value })}
                      className="w-full rounded-lg border border-olive/20 bg-cream px-4 py-2.5 text-xs leading-relaxed focus:border-olive focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-2xs font-semibold text-warm-gray">Short Summary Description</label>
                    <textarea
                      rows={2}
                      value={editItem.description || ""}
                      onChange={(e) => setEditItem({ ...editItem, description: e.target.value })}
                      className="w-full rounded-lg border border-olive/20 bg-cream px-4 py-2.5 text-sm focus:border-olive focus:outline-none"
                    />
                  </div>

                  {/* Conference Slides uploads mapping */}
                  <div className="space-y-1 md:col-span-2 border-t border-olive/10 pt-4">
                    <label className="text-2xs font-extrabold uppercase tracking-widest text-warm-gray block mb-2">Conference Photos / Slides</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {editItem.images?.map((img, idx) => (
                        <div key={idx} className="relative h-16 w-24 overflow-hidden rounded border border-olive/20 bg-cream flex items-center justify-center">
                          <img src={`/api/images/${img}`} className="max-h-full max-w-full object-contain" />
                          <button
                            onClick={() => {
                              const newImgs = [...editItem.images];
                              newImgs.splice(idx, 1);
                              setEditItem({ ...editItem, images: newImgs });
                            }}
                            className="absolute top-1 right-1 rounded bg-red-500/80 p-0.5 text-charcoal hover:bg-red-500"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        id="paper-slide-upload"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, (key) => {
                          const existingImgs = editItem.images || [];
                          setEditItem({ ...editItem, images: [...existingImgs, key] });
                        })}
                      />
                      <label
                        htmlFor="paper-slide-upload"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-olive/30 bg-olive/10 px-4 py-2 text-xs font-semibold text-olive cursor-pointer hover:bg-olive/20"
                      >
                        <Upload className="h-3.5 w-3.5" />
                        {uploadingImage ? "Uploading..." : "Link New Conference Photo"}
                      </label>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleSave("save_paper", editItem)}
                  className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-olive px-4 py-2.5 text-sm font-semibold text-cream-lightest hover:bg-olive/90 mt-4"
                >
                  <Save className="h-4 w-4" />
                  Save Research Paper
                </button>
              </div>
            )}

            {/* --- MODAL FORM: VISTA --- */}
            {showModal === "vista" && (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-2xs font-semibold text-warm-gray">Event Title</label>
                    <input
                      type="text"
                      value={editItem.title}
                      onChange={(e) => setEditItem({ ...editItem, title: e.target.value })}
                      className="w-full rounded-lg border border-olive/20 bg-cream px-4 py-2.5 text-sm focus:border-olive focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-2xs font-semibold text-warm-gray">Organizing Body</label>
                    <input
                      type="text"
                      value={editItem.organization}
                      onChange={(e) => setEditItem({ ...editItem, organization: e.target.value })}
                      className="w-full rounded-lg border border-olive/20 bg-cream px-4 py-2.5 text-sm focus:border-olive focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-2xs font-semibold text-warm-gray">Date & Location</label>
                    <input
                      type="text"
                      value={editItem.date}
                      onChange={(e) => setEditItem({ ...editItem, date: e.target.value })}
                      className="w-full rounded-lg border border-olive/20 bg-cream px-4 py-2.5 text-sm focus:border-olive focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-2xs font-semibold text-warm-gray">Detailed Narrative Description</label>
                    <textarea
                      rows={5}
                      value={editItem.description}
                      onChange={(e) => setEditItem({ ...editItem, description: e.target.value })}
                      className="w-full rounded-lg border border-olive/20 bg-cream px-4 py-2.5 text-sm focus:border-olive focus:outline-none leading-relaxed"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="showonhome-checkbox"
                      checked={editItem.showOnHome !== false}
                      onChange={(e) => setEditItem({ ...editItem, showOnHome: e.target.checked })}
                      className="h-4 w-4 rounded bg-cream border-olive/25 focus:ring-olive text-olive"
                    />
                    <label htmlFor="showonhome-checkbox" className="text-xs font-semibold text-charcoal-light cursor-pointer">
                      Show in Top 3 on Homepage
                    </label>
                  </div>

                  <div className="space-y-1">
                    <label className="text-2xs font-semibold text-warm-gray">Display Order</label>
                    <input
                      type="number"
                      value={editItem.order || 0}
                      onChange={(e) => setEditItem({ ...editItem, order: parseInt(e.target.value) || 0 })}
                      className="w-full rounded-lg border border-olive/20 bg-cream px-4 py-2.5 text-sm focus:border-olive focus:outline-none"
                    />
                  </div>

                  {/* Vista images uploads */}
                  <div className="space-y-1 md:col-span-2 border-t border-olive/10 pt-4">
                    <label className="text-2xs font-extrabold uppercase tracking-widest text-warm-gray block mb-2">Event Photos</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {editItem.images?.map((img, idx) => (
                        <div key={idx} className="relative h-16 w-24 overflow-hidden rounded border border-olive/20 bg-cream flex items-center justify-center">
                          <img src={`/api/images/${img}`} className="max-h-full max-w-full object-contain" />
                          <button
                            onClick={() => {
                              const newImgs = [...editItem.images];
                              newImgs.splice(idx, 1);
                              setEditItem({ ...editItem, images: newImgs });
                            }}
                            className="absolute top-1 right-1 rounded bg-red-500/80 p-0.5 text-charcoal hover:bg-red-500"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        id="vista-photo-upload"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, (key) => {
                          const existingImgs = editItem.images || [];
                          setEditItem({ ...editItem, images: [...existingImgs, key] });
                        })}
                      />
                      <label
                        htmlFor="vista-photo-upload"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-olive/30 bg-olive/10 px-4 py-2 text-xs font-semibold text-olive cursor-pointer hover:bg-olive/20"
                      >
                        <Upload className="h-3.5 w-3.5" />
                        {uploadingImage ? "Uploading..." : "Link Event Capture"}
                      </label>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleSave("save_vista", editItem)}
                  className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-olive px-4 py-2.5 text-sm font-semibold text-cream-lightest hover:bg-olive/90 mt-4"
                >
                  <Save className="h-4 w-4" />
                  Save Event Details
                </button>
              </div>
            )}

            {/* --- MODAL FORM: BLOG --- */}
            {showModal === "blog" && (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">

                  {/* Title */}
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-2xs font-semibold text-warm-gray">Article Title</label>
                    <input
                      type="text"
                      value={editItem.title}
                      onChange={(e) => setEditItem({ ...editItem, title: e.target.value })}
                      className="w-full rounded-lg border border-olive/20 bg-cream px-4 py-2.5 text-sm focus:border-olive focus:outline-none"
                    />
                  </div>

                  {/* Date */}
                  <div className="space-y-1">
                    <label className="text-2xs font-semibold text-warm-gray">Date</label>
                    <input
                      type="text"
                      value={editItem.date}
                      onChange={(e) => setEditItem({ ...editItem, date: e.target.value })}
                      className="w-full rounded-lg border border-olive/20 bg-cream px-4 py-2.5 text-sm focus:border-olive focus:outline-none"
                    />
                  </div>

                  {/* Read Time */}
                  <div className="space-y-1">
                    <label className="text-2xs font-semibold text-warm-gray">Reading Time</label>
                    <input
                      type="text"
                      value={editItem.readTime}
                      onChange={(e) => setEditItem({ ...editItem, readTime: e.target.value })}
                      className="w-full rounded-lg border border-olive/20 bg-cream px-4 py-2.5 text-sm focus:border-olive focus:outline-none"
                    />
                  </div>

                  {/* Tags */}
                  <div className="space-y-1">
                    <label className="text-2xs font-semibold text-warm-gray">Category Tags (comma-separated)</label>
                    <input
                      type="text"
                      value={editItem.tags?.join(", ") || ""}
                      onChange={(e) => setEditItem({ ...editItem, tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean) })}
                      placeholder="e.g. Sustainability, Policy, Ecology"
                      className="w-full rounded-lg border border-olive/20 bg-cream px-4 py-2.5 text-sm focus:border-olive focus:outline-none"
                    />
                  </div>

                  {/* Slug */}
                  <div className="space-y-1">
                    <label className="text-2xs font-semibold text-warm-gray">Custom URL Slug (Optional)</label>
                    <input
                      type="text"
                      value={editItem.slug || ""}
                      onChange={(e) => setEditItem({ ...editItem, slug: e.target.value })}
                      placeholder="Leave blank for auto-generation"
                      className="w-full rounded-lg border border-olive/20 bg-cream px-4 py-2.5 text-sm focus:border-olive focus:outline-none"
                    />
                  </div>

                  {/* Cover image upload */}
                  <div className="space-y-1 md:col-span-2 border-t border-olive/10 pt-4">
                    <label className="text-2xs font-extrabold uppercase tracking-widest text-warm-gray block mb-2">Cover Image</label>
                    <div className="flex items-center gap-4">
                      {editItem.coverImage && (
                        <div className="h-16 w-24 overflow-hidden rounded border border-olive/20 bg-cream flex items-center justify-center">
                          <img src={`/api/images/${editItem.coverImage}`} className="max-h-full max-w-full object-contain" />
                        </div>
                      )}
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          id="blog-cover-upload"
                          className="hidden"
                          onChange={(e) => handleImageUpload(e, (key) => {
                            setEditItem({ ...editItem, coverImage: key });
                          })}
                        />
                        <label
                          htmlFor="blog-cover-upload"
                          className="flex items-center gap-1.5 rounded-lg border border-olive/30 bg-olive/10 px-4 py-2 text-xs font-semibold text-olive cursor-pointer hover:bg-olive/20"
                        >
                          <Upload className="h-3.5 w-3.5" />
                          {uploadingImage ? "Uploading..." : "Upload Cover"}
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* ── EDITOR SECTION ── */}
                  <div className="space-y-1 md:col-span-2 border-t border-olive/10 pt-4">

                    {/* Editor Header Row */}
                    <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                      <label className="text-2xs font-semibold text-warm-gray uppercase tracking-wider block">Philosophy Article Canvas (MS Word Visual Mode)</label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setShowBlogPreview(prev => !prev)}
                          className={`inline-flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                            showBlogPreview
                              ? "bg-olive text-cream-lightest border-olive shadow-md"
                              : "bg-cream-medium/60 text-charcoal-light border-olive/20 hover:bg-olive/10 hover:text-olive"
                          }`}
                        >
                          <Eye className="h-3 w-3" />
                          {showBlogPreview ? "← Back to Edit" : "Preview"}
                        </button>
                        <span className="inline-flex items-center gap-1 bg-olive/10 text-olive text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full border border-olive/25">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                          Visual Editor Active
                        </span>
                      </div>
                    </div>

                    {/* ── PREVIEW PANE ── */}
                    {showBlogPreview ? (
                      <div className="w-full rounded-xl border border-olive/20 bg-cream-lightest overflow-hidden">
                        <div className="bg-olive/5 border-b border-olive/15 px-5 py-3 flex items-center gap-2">
                          <Eye className="h-3.5 w-3.5 text-olive" />
                          <span className="text-[10px] font-extrabold uppercase tracking-widest text-olive">Live Preview — exactly as readers will see it</span>
                        </div>
                        <div className="px-6 pt-6 pb-2 border-b border-olive/10">
                          <h2 className="font-serif text-2xl font-bold text-charcoal leading-tight">{editItem.title || "Untitled Article"}</h2>
                          <p className="text-xs text-warm-gray mt-2 font-semibold">{editItem.date} • {editItem.readTime || "5 min read"}</p>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {editItem.tags?.map((tag, ti) => (
                              <span key={ti} className="text-[10px] uppercase font-bold tracking-widest px-3 py-1 bg-olive/10 text-olive rounded-full border border-olive/20">{tag}</span>
                            ))}
                          </div>
                        </div>
                        <div className="px-6 py-6 max-h-[500px] overflow-y-auto">
                          {editItem.content && (editItem.content.trim().startsWith("<") || editItem.content.includes("</") || editItem.content.includes("<p>")) ? (
                            <div dangerouslySetInnerHTML={{ __html: editItem.content }} className="rich-text-content space-y-4 select-text" />
                          ) : (
                            <div className="space-y-2 select-text">{renderAdminMarkdown(editItem.content)}</div>
                          )}
                          {!editItem.content && (
                            <p className="text-warm-gray italic text-sm">Nothing to preview yet. Start writing in the editor.</p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* ── TOOLBAR ── */}
                        <div className="flex flex-wrap items-center gap-1 bg-cream-medium/40 border border-olive/15 p-2 rounded-t-xl select-none">

                          {/* Bold / Italic / Underline */}
                          <div className="flex items-center border-r border-olive/10 pr-1.5 mr-1.5 gap-1">
                            <button type="button" onClick={() => applyStyle("bold")} className="p-1.5 rounded hover:bg-olive/10 text-charcoal hover:text-olive transition-colors cursor-pointer" title="Bold (Ctrl+B)"><Bold className="h-4 w-4" /></button>
                            <button type="button" onClick={() => applyStyle("italic")} className="p-1.5 rounded hover:bg-olive/10 text-charcoal hover:text-olive transition-colors cursor-pointer" title="Italic (Ctrl+I)"><Italic className="h-4 w-4" /></button>
                            <button type="button" onClick={() => applyStyle("underline")} className="p-1.5 rounded hover:bg-olive/10 text-charcoal hover:text-olive transition-colors cursor-pointer" title="Underline (Ctrl+U)"><Underline className="h-4 w-4" /></button>
                          </div>

                          {/* Headings */}
                          <div className="flex items-center border-r border-olive/10 pr-1.5 mr-1.5 gap-1">
                            <button type="button" onClick={() => applyStyle("formatBlock", "<h1>")} className="px-2 py-1 rounded hover:bg-olive/10 text-charcoal hover:text-olive font-serif font-bold text-xs transition-colors cursor-pointer" title="Heading 1">H1</button>
                            <button type="button" onClick={() => applyStyle("formatBlock", "<h2>")} className="px-2 py-1 rounded hover:bg-olive/10 text-charcoal hover:text-olive font-serif font-bold text-xs transition-colors cursor-pointer" title="Heading 2">H2</button>
                            <button type="button" onClick={() => applyStyle("formatBlock", "<h3>")} className="px-2 py-1 rounded hover:bg-olive/10 text-charcoal hover:text-olive font-serif font-bold text-xs transition-colors cursor-pointer" title="Heading 3">H3</button>
                            <button type="button" onClick={() => applyStyle("formatBlock", "<p>")} className="px-2 py-1 rounded hover:bg-olive/10 text-charcoal hover:text-olive font-sans font-semibold text-xs transition-colors cursor-pointer" title="Normal Paragraph">¶</button>
                          </div>

                          {/* Lists */}
                          <div className="flex items-center border-r border-olive/10 pr-1.5 mr-1.5 gap-1">
                            <button type="button" onClick={() => applyStyle("insertUnorderedList")} className="p-1.5 rounded hover:bg-olive/10 text-charcoal hover:text-olive transition-colors cursor-pointer" title="Bulleted List"><List className="h-4 w-4" /></button>
                            <button type="button" onClick={() => applyStyle("insertOrderedList")} className="p-1.5 rounded hover:bg-olive/10 text-charcoal hover:text-olive transition-colors cursor-pointer" title="Numbered List"><ListOrdered className="h-4 w-4" /></button>
                          </div>

                          {/* ── TEXT COLOR PALETTE ── */}
                          <div className="flex items-center border-r border-olive/10 pr-1.5 mr-1.5 gap-1.5 flex-wrap">
                            <span className="text-[9px] font-extrabold uppercase tracking-widest text-warm-gray leading-none" title="Text Color">A</span>
                            {[
                              { color: "#1b1c1c", label: "Charcoal (Default)" },
                              { color: "#435c3c", label: "Olive Green" },
                              { color: "#89502e", label: "Warm Amber" },
                              { color: "#2563eb", label: "Academic Blue" },
                              { color: "#dc2626", label: "Critical Red" },
                              { color: "#7c3aed", label: "Insight Purple" },
                              { color: "#0f766e", label: "Ecology Teal" },
                            ].map(({ color, label }) => (
                              <button
                                key={color}
                                type="button"
                                onClick={() => applyStyle("foreColor", color)}
                                title={`Text: ${label}`}
                                className="w-4.5 h-4.5 rounded-full border-2 border-white shadow-sm hover:scale-125 transition-transform cursor-pointer ring-1 ring-black/10"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                            {/* Custom color */}
                            <label title="Custom text color" className="relative cursor-pointer">
                              <div className="w-4.5 h-4.5 rounded-full border-2 border-dashed border-olive/40 hover:border-olive flex items-center justify-center hover:scale-125 transition-transform bg-gradient-to-br from-red-400 via-yellow-300 to-blue-500">
                                <span className="text-[6px] font-black text-white drop-shadow">+</span>
                              </div>
                              <input type="color" defaultValue="#1b1c1c" className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" onChange={(e) => applyStyle("foreColor", e.target.value)} />
                            </label>
                          </div>

                          {/* ── HIGHLIGHT PALETTE ── */}
                          <div className="flex items-center border-r border-olive/10 pr-1.5 mr-1.5 gap-1.5 flex-wrap">
                            <span className="text-[9px] font-extrabold uppercase tracking-widest text-warm-gray leading-none" title="Highlight">▓</span>
                            {[
                              { color: "#fef08a", label: "Yellow" },
                              { color: "#bbf7d0", label: "Green" },
                              { color: "#bfdbfe", label: "Blue" },
                              { color: "#fecaca", label: "Red" },
                              { color: "#e9d5ff", label: "Purple" },
                              { color: "#fed7aa", label: "Amber" },
                            ].map(({ color, label }) => (
                              <button
                                key={color}
                                type="button"
                                onClick={() => applyStyle("hiliteColor", color)}
                                title={`Highlight: ${label}`}
                                className="w-4.5 h-4.5 rounded border border-black/10 shadow-sm hover:scale-125 transition-transform cursor-pointer hover:ring-2 hover:ring-olive/40"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                            <button type="button" onClick={() => applyStyle("hiliteColor", "transparent")} title="Remove highlight" className="w-4.5 h-4.5 rounded border border-dashed border-warm-gray/40 hover:border-red-400 flex items-center justify-center text-warm-gray hover:text-red-400 hover:scale-125 transition-all cursor-pointer text-[8px] font-black">✕</button>
                          </div>

                          {/* Inserts */}
                          <div className="flex items-center border-r border-olive/10 pr-1.5 mr-1.5 gap-1">
                            <button type="button" onClick={handleAddLink} className="p-1.5 rounded hover:bg-olive/10 text-charcoal hover:text-olive transition-colors cursor-pointer" title="Insert Hyperlink"><Link2 className="h-4 w-4" /></button>
                            <button type="button" onClick={handleInsertTable} className="p-1.5 rounded hover:bg-olive/10 text-charcoal hover:text-olive transition-colors cursor-pointer" title="Insert Table"><TableIcon className="h-4 w-4" /></button>
                          </div>

                          {/* Undo / Redo / Clear */}
                          <div className="flex items-center gap-1">
                            <button type="button" onClick={() => applyStyle("undo")} className="p-1.5 rounded hover:bg-olive/10 text-charcoal hover:text-olive transition-colors cursor-pointer" title="Undo"><Undo className="h-4 w-4" /></button>
                            <button type="button" onClick={() => applyStyle("redo")} className="p-1.5 rounded hover:bg-olive/10 text-charcoal hover:text-olive transition-colors cursor-pointer" title="Redo"><Redo className="h-4 w-4" /></button>
                            <button type="button" onClick={() => applyStyle("removeFormat")} className="px-2 py-1 rounded hover:bg-red-50 text-warm-gray hover:text-red-500 text-3xs font-extrabold uppercase tracking-widest transition-colors cursor-pointer" title="Clear Formatting">Tx</button>
                          </div>
                        </div>

                        {/* ── EDITOR CANVAS ── */}
                        <div
                          ref={setEditorRef}
                          contentEditable
                          onInput={handleEditorInput}
                          onPaste={handleBlogPaste}
                          placeholder="Type your MS Word post here, format it visually using the toolbar, or paste directly from MS Word..."
                          className="editor-canvas w-full rounded-b-xl border-x border-b border-olive/20 bg-cream-lightest px-5 py-4 text-sm text-charcoal leading-relaxed focus:border-olive focus:outline-none select-text"
                        />
                      </>
                    )}
                  </div>
                </div>

                {/* ── SAVE / PREVIEW BUTTONS ── */}
                <div className="flex gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowBlogPreview(prev => !prev)}
                    className={`flex items-center justify-center gap-1.5 rounded-lg border px-5 py-2.5 text-sm font-semibold transition-all ${
                      showBlogPreview
                        ? "bg-cream-dark border-olive/30 text-charcoal-light hover:bg-cream-medium"
                        : "bg-olive/10 border-olive/30 text-olive hover:bg-olive/20"
                    }`}
                  >
                    <Eye className="h-4 w-4" />
                    {showBlogPreview ? "Back to Editor" : "Preview Article"}
                  </button>
                  <button
                    onClick={() => handleSave("save_blog", editItem)}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-olive px-4 py-2.5 text-sm font-semibold text-cream-lightest hover:bg-olive/90 shadow-md hover:shadow-lg transition-all"
                  >
                    <Save className="h-4 w-4" />
                    Publish Blog Post
                  </button>
                </div>
              </div>
            )}




            {/* --- MODAL FORM: CERTIFICATE --- */}
            {showModal === "certificate" && (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-2xs font-semibold text-warm-gray">Certificate / Fellowship Title</label>
                    <input
                      type="text"
                      value={editItem.title}
                      onChange={(e) => setEditItem({ ...editItem, title: e.target.value })}
                      className="w-full rounded-lg border border-olive/20 bg-cream px-4 py-2.5 text-sm focus:border-olive focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-2xs font-semibold text-warm-gray">Issuer Agency</label>
                    <input
                      type="text"
                      value={editItem.issuer}
                      onChange={(e) => setEditItem({ ...editItem, issuer: e.target.value })}
                      className="w-full rounded-lg border border-olive/20 bg-cream px-4 py-2.5 text-sm focus:border-olive focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-2xs font-semibold text-warm-gray">Date Issued</label>
                    <input
                      type="text"
                      value={editItem.date}
                      onChange={(e) => setEditItem({ ...editItem, date: e.target.value })}
                      className="w-full rounded-lg border border-olive/20 bg-cream px-4 py-2.5 text-sm focus:border-olive focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-2xs font-semibold text-warm-gray">Verification URL</label>
                    <input
                      type="text"
                      value={editItem.verificationUrl || ""}
                      onChange={(e) => setEditItem({ ...editItem, verificationUrl: e.target.value })}
                      className="w-full rounded-lg border border-olive/20 bg-cream px-4 py-2.5 text-sm focus:border-olive focus:outline-none"
                    />
                  </div>

                  {/* Certificate preview image upload */}
                  <div className="space-y-1 md:col-span-2 border-t border-olive/10 pt-4">
                    <label className="text-2xs font-extrabold uppercase tracking-widest text-warm-gray block mb-2">Certificate preview</label>
                    <div className="flex items-center gap-4">
                      {editItem.image && (
                        <div className="h-16 w-24 overflow-hidden rounded border border-olive/20 bg-cream flex items-center justify-center">
                          <img src={`/api/images/${editItem.image}`} className="max-h-full max-w-full object-contain" />
                        </div>
                      )}
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          id="certificate-image-upload"
                          className="hidden"
                          onChange={(e) => handleImageUpload(e, (key) => {
                            setEditItem({ ...editItem, image: key });
                          })}
                        />
                        <label
                          htmlFor="certificate-image-upload"
                          className="flex items-center gap-1.5 rounded-lg border border-olive/30 bg-olive/10 px-4 py-2 text-xs font-semibold text-olive cursor-pointer hover:bg-olive/20"
                        >
                          <Upload className="h-3.5 w-3.5" />
                          {uploadingImage ? "Uploading..." : "Upload Preview"}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleSave("save_certificate", editItem)}
                  className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-olive px-4 py-2.5 text-sm font-semibold text-cream-lightest hover:bg-olive/90 mt-4"
                >
                  <Save className="h-4 w-4" />
                  Save Certificate
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
