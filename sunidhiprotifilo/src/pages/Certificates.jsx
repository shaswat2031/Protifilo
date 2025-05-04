import React from "react";
import { motion } from "framer-motion";

const Certificates = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  const certificates = [
    {
      id: 1,
      title: "Full Stack Web Development",
      issuer: "Udemy",
      date: "June 2022",
      description:
        "Comprehensive course covering modern frontend and backend technologies for web development.",
      image: "/cert1.jpg",
      link: "#",
    },
    {
      id: 2,
      title: "React - The Complete Guide",
      issuer: "Coursera",
      date: "August 2022",
      description:
        "In-depth study of React, including hooks, context API, and Redux for state management.",
      image: "/cert2.jpg",
      link: "#",
    },
    {
      id: 3,
      title: "UI/UX Design Fundamentals",
      issuer: "LinkedIn Learning",
      date: "January 2023",
      description:
        "Principles of user interface and experience design with focus on usability and accessibility.",
      image: "/cert3.jpg",
      link: "#",
    },
    {
      id: 4,
      title: "JavaScript Advanced Concepts",
      issuer: "Udemy",
      date: "March 2023",
      description:
        "Deep dive into advanced JavaScript concepts including closures, prototypes, and async patterns.",
      image: "/cert4.jpg",
      link: "#",
    },
    {
      id: 5,
      title: "Responsive Web Design",
      issuer: "freeCodeCamp",
      date: "May 2022",
      description:
        "Creating responsive websites that adapt to different screen sizes and devices.",
      image: "/cert5.jpg",
      link: "#",
    },
    {
      id: 6,
      title: "MongoDB for Developers",
      issuer: "MongoDB University",
      date: "October 2022",
      description:
        "Database design, querying, optimization, and best practices for MongoDB applications.",
      image: "/cert6.jpg",
      link: "#",
    },
  ];

  return (
    <motion.div
      className="certificates-page px-6 sm:px-10 py-12 w-full"
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
        <h1 className="text-4xl font-bold text-gray-800 mb-3">
          My Certificates
        </h1>
        <div className="underline w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto"></div>
        <p className="text-gray-600 mt-6 max-w-2xl mx-auto">
          I'm committed to continuous learning and professional development.
          Here are some of the courses and certifications I've completed to stay
          up-to-date with the latest technologies and best practices.
        </p>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {certificates.map((certificate) => (
          <motion.div
            key={certificate.id}
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            variants={itemVariants}
            whileHover={{ y: -8, transition: { duration: 0.3 } }}
          >
            <div className="h-36 bg-gradient-to-r from-purple-400 to-blue-500 relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white bg-opacity-90 px-4 py-2 rounded-lg">
                  <span className="font-bold text-purple-600">
                    {certificate.issuer}
                  </span>
                </div>
              </div>
            </div>
            <div className="p-6">
              <h3 className="font-bold text-xl mb-2 text-gray-800">
                {certificate.title}
              </h3>
              <p className="text-gray-600 mb-4 text-sm h-20">
                {certificate.description}
              </p>
              <div className="flex justify-between text-sm text-gray-500 mb-6">
                <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                  {certificate.date}
                </span>
              </div>
              <motion.a
                href={certificate.link}
                className="inline-block bg-gradient-to-r from-purple-600 to-blue-500 text-white w-full text-center py-2 rounded-lg font-medium hover:opacity-90 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                View Certificate
              </motion.a>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default Certificates;
