import React from "react";
import { motion } from "framer-motion";

const Projects = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6 },
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
    },
    {
      id: 2,
      title: "Task Management App",
      description:
        "A productivity application for managing tasks, setting deadlines, and tracking progress.",
      technologies: ["React", "Firebase", "Material UI"],
      image: "/project2.jpg",
      link: "#",
    },
    {
      id: 3,
      title: "Portfolio Template",
      description:
        "A customizable portfolio template for creative professionals and developers.",
      technologies: ["HTML5", "CSS3", "JavaScript"],
      image: "/project3.jpg",
      link: "#",
    },
    {
      id: 4,
      title: "Social Media Dashboard",
      description:
        "An analytics dashboard for social media managers to track engagement and growth metrics.",
      technologies: ["React", "Chart.js", "Tailwind CSS"],
      image: "/project4.jpg",
      link: "#",
    },
    {
      id: 5,
      title: "Recipe Finder App",
      description:
        "A web application that helps users discover recipes based on ingredients they have at home.",
      technologies: ["JavaScript", "API Integration", "CSS3"],
      image: "/project5.jpg",
      link: "#",
    },
    {
      id: 6,
      title: "Weather Forecast App",
      description:
        "A real-time weather application with location services and 7-day forecast.",
      technologies: ["React", "Weather API", "Geolocation"],
      image: "/project6.jpg",
      link: "#",
    },
  ];

  return (
    <motion.div
      className="projects-page px-6 sm:px-10 py-12 w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
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
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {projects.map((project) => (
          <motion.div
            key={project.id}
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
            variants={itemVariants}
            whileHover={{ y: -8, transition: { duration: 0.3 } }}
          >
            <div className="h-48 bg-gradient-to-r from-purple-500 to-blue-500 overflow-hidden">
              {/* Replace with actual image */}
              <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                {project.title}
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
    </motion.div>
  );
};

export default Projects;
