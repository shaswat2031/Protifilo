import React, { useState, useRef, useEffect } from "react";
import { motion, useAnimation, useInView } from "framer-motion";
import { useLocation } from "react-router-dom";

const Projects = () => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const ref = useRef(null);
  // Increase threshold for better detection
  const isInView = useInView(ref, { once: false, amount: 0.1 });
  const controls = useAnimation();
  const [filter, setFilter] = useState("all");
  const [animationFailed, setAnimationFailed] = useState(false);

  useEffect(() => {
    // Force visibility after a timeout to ensure content is shown
    const timeout = setTimeout(() => {
      controls.start("visible").catch(() => {
        setAnimationFailed(true);
      });
    }, 300);

    if (isInView) {
      controls.start("visible").catch(() => {
        setAnimationFailed(true);
      });
    }

    return () => clearTimeout(timeout);
  }, [isInView, controls]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1, // Faster staggering
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.4 }, // Shorter duration for faster appearance
    },
  };

  const projects = [
    {
      id: 1,
      title: "E-commerce Website",
      description:
        "A fully responsive e-commerce platform with product filtering, cart functionality, and payment integration.",
      technologies: ["React", "Node.js", "MongoDB", "Express"],
      image: "/project1.jpg",
      link: "#",
      category: "fullstack",
    },
    {
      id: 2,
      title: "Task Management App",
      description:
        "A productivity application for managing tasks, setting deadlines, and tracking progress.",
      technologies: ["React", "Firebase", "Material UI"],
      image: "/project2.jpg",
      link: "#",
      category: "frontend",
    },
    {
      id: 3,
      title: "Portfolio Template",
      description:
        "A customizable portfolio template for creative professionals and developers.",
      technologies: ["HTML5", "CSS3", "JavaScript"],
      image: "/project3.jpg",
      link: "#",
      category: "frontend",
    },
    {
      id: 4,
      title: "Social Media Dashboard",
      description:
        "An analytics dashboard for social media managers to track engagement and growth metrics.",
      technologies: ["React", "Chart.js", "Tailwind CSS"],
      image: "/project4.jpg",
      link: "#",
      category: "frontend",
    },
    {
      id: 5,
      title: "Recipe Finder App",
      description:
        "A web application that helps users discover recipes based on ingredients they have at home.",
      technologies: ["JavaScript", "API Integration", "CSS3"],
      image: "/project5.jpg",
      link: "#",
      category: "frontend",
    },
    {
      id: 6,
      title: "Weather Forecast App",
      description:
        "A real-time weather application with location services and 7-day forecast.",
      technologies: ["React", "Weather API", "Geolocation"],
      image: "/project6.jpg",
      link: "#",
      category: "frontend",
    },
  ];

  // Filter projects based on selected category
  const filteredProjects =
    filter === "all"
      ? projects
      : projects.filter((project) => project.category === filter);

  // Limit projects in home page
  const displayProjects = isHomePage
    ? filteredProjects.slice(0, 3)
    : filteredProjects;

  return (
    <motion.div
      id="projects"
      ref={ref}
      className="projects-page px-6 sm:px-10 py-12 w-full"
      initial={animationFailed ? "visible" : "hidden"}
      animate={controls}
      variants={containerVariants}
      // Ensure content is visible even if animation fails
      style={{ opacity: animationFailed ? 1 : undefined }}
    >
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl font-bold text-gray-800 mb-3">My Projects</h1>
        <div className="underline w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto"></div>
        <p className="text-gray-600 mt-6 max-w-2xl mx-auto">
          Here's a selection of some of my recent work. I've included a variety
          of projects that showcase my skills in different technologies and
          design styles.
        </p>

        {/* Show filter buttons only on the projects page, not on the home page */}
        {!isHomePage && (
          <div className="flex justify-center mt-8 flex-wrap gap-3">
            {["all", "frontend", "fullstack", "design"].map((category) => (
              <motion.button
                key={category}
                onClick={() => setFilter(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  filter === category
                    ? "bg-gradient-to-r from-purple-600 to-blue-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </motion.button>
            ))}
          </div>
        )}
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
        variants={containerVariants}
        // Add a fallback to ensure visibility
        initial={animationFailed ? "visible" : "hidden"}
        animate={animationFailed ? "visible" : controls}
      >
        {displayProjects.map((project) => (
          <motion.div
            key={project.id}
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
            variants={itemVariants}
            whileHover={{ y: -8, transition: { duration: 0.3 } }}
          >
            <div className="h-48 bg-gradient-to-r from-purple-500 to-blue-500 overflow-hidden relative">
              {/* Project image or gradient placeholder */}
              <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg bg-opacity-90 backdrop-blur-sm">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-white bg-opacity-20 flex items-center justify-center backdrop-blur-sm border border-white border-opacity-30">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  </div>
                </div>
                <span className="relative z-10 px-3 py-1 bg-black bg-opacity-50 rounded-lg backdrop-blur-sm">
                  {project.title}
                </span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="font-bold text-xl mb-2 text-gray-800">
                {project.title}
              </h3>
              <p className="text-gray-600 mb-4 h-24">{project.description}</p>
              <div className="mb-6">
                <h4 className="text-sm font-semibold mb-2 text-gray-700">
                  Technologies:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech, index) => (
                    <span
                      key={index}
                      className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
              <motion.a
                href={project.link}
                className="inline-block w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white text-center px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-all"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                View Project
              </motion.a>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Show "View All Projects" button only on home page */}
      {isHomePage && displayProjects.length > 0 && (
        <div className="text-center mt-12">
          <motion.a
            href="/projects"
            className="inline-block px-8 py-3 bg-white border border-purple-500 text-purple-600 rounded-full hover:bg-purple-50 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            View All Projects
          </motion.a>
        </div>
      )}
    </motion.div>
  );
};

export default Projects;
