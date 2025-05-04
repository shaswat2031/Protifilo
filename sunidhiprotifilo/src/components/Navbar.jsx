import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Link as ScrollLink } from "react-scroll";
import sunidhi from "../assets/sunidhi.jpg";

const Navbar = () => {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const activeStyle =
    "bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-500 text-white shadow-md";

  useEffect(() => {
    if (location.pathname === "/") {
      const handleScroll = () => {
        const totalHeight =
          document.documentElement.scrollHeight - window.innerHeight;
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(progress);

        const sections = ["hero", "about", "skills", "projects", "contact"];
        const currentSection = sections.find((section) => {
          const element = document.getElementById(section);
          if (element) {
            const rect = element.getBoundingClientRect();
            return rect.top <= 150 && rect.bottom >= 150;
          }
          return false;
        });

        if (currentSection) {
          setActiveSection(currentSection);
        }
      };

      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    } else {
      setActiveSection("");
      setScrollProgress(0);
    }
  }, [location.pathname]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const homeLinkItems = [
    { to: "hero", label: "Home", icon: "🏠" },
    { to: "about", label: "About", icon: "👤" },
    { to: "skills", label: "Skills", icon: "🔧" },
    { to: "projects", label: "Projects", icon: "📂" },
    { to: "contact", label: "Contact", icon: "✉️" },
  ];

  const renderHomeLinks = () =>
    homeLinkItems.map((link, index) => (
      <motion.li
        key={link.to}
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{
          delay: 0.2 + index * 0.1,
          duration: 0.5,
          ease: "easeOut",
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
      >
        <ScrollLink
          to={link.to}
          smooth={true}
          duration={800}
          offset={-50}
          spy={true}
          className={`flex items-center px-6 py-3 transition-all duration-300 ${
            activeSection === link.to
              ? activeStyle
              : "hover:bg-gray-700/60 hover:text-purple-300 hover:translate-x-1"
          } rounded-lg mx-3 font-medium cursor-pointer backdrop-blur-sm`}
          activeClass="active"
        >
          <span className="mr-2 text-lg">{link.icon}</span>
          {link.label}
        </ScrollLink>
      </motion.li>
    ));

  const renderRouteLinks = () =>
    [
      { path: "/", label: "Home", exact: true, icon: "🏠" },
      { path: "/about", label: "About", exact: false, icon: "👤" },
      { path: "/projects", label: "Projects", exact: false, icon: "📂" },
      {
        path: "/certificates",
        label: "Certificates",
        exact: false,
        icon: "🏆",
      },
      { path: "/contact", label: "Contact", exact: false, icon: "✉️" },
    ].map((link, index) => (
      <motion.li
        key={link.path}
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{
          delay: 0.2 + index * 0.1,
          duration: 0.5,
          ease: "easeOut",
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
      >
        <NavLink
          to={link.path}
          className={({ isActive }) =>
            `flex items-center px-6 py-3 transition-all duration-300 ${
              isActive
                ? activeStyle
                : "hover:bg-gray-700/60 hover:text-purple-300 hover:translate-x-1"
            } rounded-lg mx-3 font-medium backdrop-blur-sm`
          }
          end={link.exact}
        >
          <span className="mr-2 text-lg">{link.icon}</span>
          {link.label}
        </NavLink>
      </motion.li>
    ));

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <motion.button
        onClick={toggleMobileMenu}
        className="fixed top-4 left-4 z-50 p-2 bg-gray-900 rounded-full shadow-lg md:hidden flex items-center justify-center"
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {isMobileMenuOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </motion.button>

      {location.pathname === "/" && (
        <motion.div
          className="fixed top-0 left-0 h-1 bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-500 z-50"
          style={{ width: `${scrollProgress}%` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        />
      )}

      <AnimatePresence>
        <motion.nav
          className={`fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-[0_0_20px_rgba(124,58,237,0.2)] z-40 backdrop-blur-sm md:translate-x-0 ${
            isMobileMenuOpen
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0"
          } transition-transform duration-300`}
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="py-8 px-6 text-center">
            <div className="mb-4 relative mx-auto w-28 h-28 rounded-full overflow-hidden border-4 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:shadow-[0_0_25px_rgba(168,85,247,0.6)] transition-shadow duration-300 group">
              <motion.img
                src={sunidhi}
                alt="Sunidhi Chaudhary"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              />
              <motion.div
                className="absolute inset-0 bg-gradient-to-t from-purple-900/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                whileHover={{ opacity: 0.5 }}
              />
            </div>
            <motion.h3
              className="text-xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Sunidhi Chaudhary
            </motion.h3>
            <motion.div
              className="flex justify-center items-center mt-1"
              initial={{ y: -5, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <p className="text-gray-300 text-sm border-b border-purple-500/30 pb-1 inline-block">
                Web Developer & Designer
              </p>
            </motion.div>
          </div>

          <div className="px-4 mb-4">
            <div className="h-0.5 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
          </div>

          <ul className="mt-3 space-y-1 px-3 overflow-y-auto max-h-[calc(100vh-380px)] scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-gray-800">
            {location.pathname === "/" ? renderHomeLinks() : renderRouteLinks()}
          </ul>

          <motion.div
            className="mt-12 px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <h4 className="text-sm font-semibold text-purple-300 mb-3 uppercase tracking-wider flex items-center">
              <span className="w-12 h-px bg-gradient-to-r from-purple-500/50 to-transparent mr-2"></span>
              Connect
              <span className="w-12 h-px bg-gradient-to-l from-purple-500/50 to-transparent ml-2"></span>
            </h4>
            <div className="flex space-x-5 justify-center">
              <motion.a
                href="https://github.com/sunidhichaudhary"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-purple-400 transition-colors duration-300"
                aria-label="GitHub"
                whileHover={{ scale: 1.2, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </motion.a>
              <motion.a
                href="https://linkedin.com/in/sunidhichaudhary"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-400 transition-colors duration-300"
                aria-label="LinkedIn"
                whileHover={{ scale: 1.2, rotate: -5 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </motion.a>
              <motion.a
                href="mailto:sunidhi.chaudhary@example.com"
                className="text-gray-400 hover:text-red-400 transition-colors duration-300"
                aria-label="Email"
                whileHover={{ scale: 1.2, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                </svg>
              </motion.a>
            </div>
          </motion.div>

          <motion.div
            className="absolute bottom-0 left-0 w-full p-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <div className="h-0.5 bg-gradient-to-r from-transparent via-gray-700 to-transparent mb-4" />
            <p className="text-xs text-gray-400 font-light">
              © {new Date().getFullYear()} Sunidhi Chaudhary
              <br />
              <span className="text-gray-500 text-xs">All rights reserved</span>
            </p>
          </motion.div>
        </motion.nav>
      </AnimatePresence>

      {isMobileMenuOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Navbar;
