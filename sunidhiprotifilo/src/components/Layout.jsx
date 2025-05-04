import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import { motion, AnimatePresence } from "framer-motion";
import ScrollToTop from "./ScrollToTop";

const Layout = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="flex flex-col md:flex-row bg-gray-50 min-h-screen w-full">
      {/* Mobile menu button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={toggleMobileMenu}
          className="p-3 rounded-lg bg-purple-600 text-white shadow-lg"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="w-6 h-6"
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
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`md:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${
          isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Sidebar Navigation - Fixed position */}
      <div
        className={`fixed left-0 top-0 h-full md:block z-40 ${
          isMobileMenuOpen ? "block" : "hidden"
        } shadow-2xl bg-gradient-to-b from-gray-900 to-purple-900`}
      >
        <Navbar />
      </div>

      {/* Main content with proper padding for sidebar */}
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          className="flex-grow w-full md:pl-64 transition-all duration-300 bg-gray-50 bg-opacity-90 backdrop-blur-sm bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          <ScrollToTop />
          <div className="w-full max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </motion.main>
      </AnimatePresence>
    </div>
  );
};

export default Layout;
