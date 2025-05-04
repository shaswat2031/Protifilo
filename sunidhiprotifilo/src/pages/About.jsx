import React from "react";
import { motion } from "framer-motion";

const About = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="about-page max-w-4xl mx-auto px-4 py-8"
    >
      <motion.div
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
          About Me
        </h1>
      </motion.div>

      <div className="flex flex-col md:flex-row gap-6 mb-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="md:w-1/3"
        >
          <div className="relative overflow-hidden rounded-full w-48 h-48 mx-auto shadow-xl border-4 border-white">
            <img
              src="https://via.placeholder.com/300"
              alt="Sunidhi Chaudhary"
              className="object-cover w-full h-full"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="md:w-2/3 bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
        >
          <h2 className="text-2xl font-semibold mb-4 text-purple-700">
            My Background
          </h2>
          <p className="mb-4 text-gray-700 leading-relaxed">
            I am Sunidhi Chaudhary, a passionate web developer with expertise in
            creating modern, responsive websites. With a strong background in
            both frontend and backend technologies, I bring creative designs to
            life with clean, efficient code.
          </p>
          <p className="text-gray-700 leading-relaxed">
            My journey in web development started with a curiosity for design
            and problem-solving. Today, I enjoy tackling challenging projects
            and continuously expanding my skill set to stay current with the
            latest technologies and trends.
          </p>
        </motion.div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Education</h2>
        <div className="mb-4">
          <h3 className="font-medium">
            Bachelor of Technology in Computer Science
          </h3>
          <p className="text-gray-600">University Name, 2018-2022</p>
          <p>
            Graduated with honors, specializing in web technologies and software
            development.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Work Experience</h2>
        <div className="mb-4">
          <h3 className="font-medium">Web Developer</h3>
          <p className="text-gray-600">Company Name, 2022-Present</p>
          <ul className="list-disc pl-5 mt-2">
            <li>
              Developed and maintained responsive websites for various clients
            </li>
            <li>
              Collaborated with design teams to implement user-friendly
              interfaces
            </li>
            <li>Optimized website performance and accessibility</li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
};

export default About;
