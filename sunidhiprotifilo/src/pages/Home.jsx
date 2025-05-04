import React, { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { FaGithub, FaLinkedin, FaEnvelope, FaTwitter } from "react-icons/fa";
import { Link as ScrollLink } from "react-scroll";
import { useInView } from "react-intersection-observer";

const Home = () => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
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

  // Setup animations for each section
  const aboutControls = useAnimation();
  const skillsControls = useAnimation();
  const contactControls = useAnimation();

  const [aboutRef, aboutInView] = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });
  const [skillsRef, skillsInView] = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });
  const [contactRef, contactInView] = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });

  useEffect(() => {
    if (aboutInView) aboutControls.start("visible");
    if (skillsInView) skillsControls.start("visible");
    if (contactInView) contactControls.start("visible");
  }, [
    aboutControls,
    aboutInView,
    skillsControls,
    skillsInView,
    contactControls,
    contactInView,
  ]);

  return (
    <div className="home-container bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen w-full">
      {/* Hero Section */}
      <motion.section
        className="hero-section h-screen flex items-center justify-center px-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        id="hero"
      >
        <motion.div
          className="hero-content max-w-3xl mx-auto text-center"
          variants={itemVariants}
        >
          <motion.h1
            className="text-5xl font-bold mb-4 text-gray-800"
            variants={itemVariants}
          >
            Hello, I'm{" "}
            <span className="bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
              Sunidhi Chaudhary
            </span>
          </motion.h1>
          <motion.h2
            className="text-2xl font-medium mb-6 text-gray-600"
            variants={itemVariants}
          >
            Web Developer & Designer
          </motion.h2>
          <motion.p
            className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
            variants={itemVariants}
          >
            I create beautiful, responsive, and user-friendly websites that help
            businesses grow and succeed online.
          </motion.p>
          <motion.div
            className="flex gap-4 justify-center"
            variants={itemVariants}
          >
            <ScrollLink to="contact" smooth={true} duration={800} offset={-100}>
              <motion.button
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium rounded-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get In Touch
              </motion.button>
            </ScrollLink>
            <ScrollLink to="skills" smooth={true} duration={800} offset={-100}>
              <motion.button
                className="px-8 py-3 border-2 border-purple-500 text-purple-600 font-medium rounded-full hover:bg-purple-50 transition-all duration-300 hover:-translate-y-1"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                View My Skills
              </motion.button>
            </ScrollLink>
          </motion.div>

          {/* Scroll down indicator */}
          <motion.div
            className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              delay: 1,
              duration: 1,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          >
            <ScrollLink
              to="about"
              smooth={true}
              duration={800}
              className="cursor-pointer"
            >
              <div className="flex flex-col items-center">
                <span className="text-gray-500 mb-2">Scroll Down</span>
                <svg
                  className="w-6 h-6 text-purple-500"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                </svg>
              </div>
            </ScrollLink>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* About Section */}
      <motion.section
        className="about-section py-24 px-10"
        id="about"
        ref={aboutRef}
        variants={containerVariants}
        initial="hidden"
        animate={aboutControls}
      >
        <div className="section-header text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-3">About Me</h2>
          <div className="underline w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto"></div>
        </div>
        <div className="about-content max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
          <motion.div className="about-text" variants={itemVariants}>
            <p className="text-gray-700 mb-6 leading-relaxed text-lg">
              I'm a passionate web developer with expertise in creating modern,
              responsive websites. With a strong background in both frontend and
              backend technologies, I bring creative designs to life with clean,
              efficient code.
            </p>
            <p className="text-gray-700 mb-6 leading-relaxed text-lg">
              My journey in web development started with a curiosity for design
              and problem-solving. Today, I enjoy tackling challenging projects
              and continuously expanding my skill set to stay current with the
              latest technologies and trends.
            </p>
            <div className="mt-8">
              <ScrollLink to="skills" smooth={true} duration={800} offset={-50}>
                <motion.button
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium rounded-lg hover:shadow-lg transition-all"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Check My Skills
                </motion.button>
              </ScrollLink>
            </div>
          </motion.div>
          <div className="about-stats grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { number: "2+", text: "Years Experience" },
              { number: "15+", text: "Projects Completed" },
              { number: "10+", text: "Happy Clients" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="stat-item text-center p-8 rounded-2xl bg-white shadow-md hover:shadow-lg transition-shadow"
                variants={itemVariants}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <h3 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </h3>
                <p className="text-gray-600">{stat.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Skills Section */}
      <motion.section
        className="skills-section py-24 bg-white px-10"
        id="skills"
        ref={skillsRef}
        variants={containerVariants}
        initial="hidden"
        animate={skillsControls}
      >
        <div className="section-header text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-3">My Skills</h2>
          <div className="underline w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto"></div>
        </div>
        <div className="skills-container max-w-6xl mx-auto space-y-16">
          {[
            {
              category: "Frontend",
              skills: [
                { name: "HTML5", level: "95%" },
                { name: "CSS3", level: "90%" },
                { name: "JavaScript", level: "85%" },
                { name: "React", level: "80%" },
              ],
            },
            {
              category: "Backend",
              skills: [
                { name: "Node.js", level: "75%" },
                { name: "Express", level: "70%" },
                { name: "MongoDB", level: "65%" },
              ],
            },
            {
              category: "Design",
              skills: [
                { name: "Figma", level: "85%" },
                { name: "Adobe XD", level: "75%" },
              ],
            },
          ].map((category, idx) => (
            <motion.div
              className="skill-category"
              key={idx}
              variants={itemVariants}
            >
              <h3 className="text-2xl font-semibold text-gray-700 mb-8">
                {category.category}
              </h3>
              <div className="skills-grid grid md:grid-cols-2 gap-8">
                {category.skills.map((skill, skillIdx) => (
                  <motion.div
                    className="skill-item"
                    key={skillIdx}
                    initial={{ width: 0 }}
                    whileInView={{ width: "100%" }}
                    transition={{ duration: 1, delay: skillIdx * 0.2 }}
                    viewport={{ once: true }}
                  >
                    <div className="flex justify-between mb-2">
                      <span className="skill-name font-medium text-gray-700">
                        {skill.name}
                      </span>
                      <span className="text-purple-600">{skill.level}</span>
                    </div>
                    <div className="skill-bar h-3 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        className="skill-level h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                        style={{ width: "0%" }}
                        animate={{ width: skill.level }}
                        transition={{
                          duration: 1.5,
                          delay: 0.3 + skillIdx * 0.2,
                        }}
                      ></motion.div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Contact Section */}
      <motion.section
        className="contact-section py-24 px-10"
        id="contact"
        ref={contactRef}
        variants={containerVariants}
        initial="hidden"
        animate={contactControls}
      >
        <div className="section-header text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-3">
            Get In Touch
          </h2>
          <div className="underline w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto"></div>
        </div>
        <motion.div
          className="contact-content max-w-5xl mx-auto bg-white p-10 rounded-2xl shadow-lg"
          variants={itemVariants}
        >
          <div className="grid md:grid-cols-2 gap-12">
            <div className="contact-info">
              <p className="text-gray-700 mb-8 text-lg">
                I'm always open to discussing new projects, creative ideas or
                opportunities to be part of your vision. Feel free to reach out!
              </p>
              <div className="contact-details space-y-6">
                <motion.div
                  className="contact-item flex items-center"
                  whileHover={{ x: 5 }}
                >
                  <div className="icon-box bg-purple-100 p-4 rounded-full mr-4">
                    <FaEnvelope className="text-purple-600" size={20} />
                  </div>
                  <span className="text-gray-700">
                    sunidhi.chaudhary@example.com
                  </span>
                </motion.div>
                <motion.div
                  className="contact-item flex items-center"
                  whileHover={{ x: 5 }}
                >
                  <div className="icon-box bg-purple-100 p-4 rounded-full mr-4">
                    <svg
                      className="w-5 h-5 text-purple-600"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      width="20"
                      height="20"
                    >
                      <path d="M19.23 15.26l-2.54-.29c-.61-.07-1.21.14-1.64.57l-1.84 1.84c-2.83-1.44-5.15-3.75-6.59-6.59l1.85-1.85c.43-.43.64-1.03.57-1.64l-.29-2.52c-.12-1.01-.97-1.77-1.99-1.77H5.03c-1.13 0-2.07.94-2 2.07.53 8.54 7.36 15.36 15.89 15.89 1.13.07 2.07-.87 2.07-2v-1.73c.01-1.01-.75-1.86-1.76-1.98z" />
                    </svg>
                  </div>
                  <span className="text-gray-700">+91 98765 43210</span>
                </motion.div>
                <motion.div
                  className="contact-item flex items-center"
                  whileHover={{ x: 5 }}
                >
                  <div className="icon-box bg-purple-100 p-4 rounded-full mr-4">
                    <svg
                      className="w-5 h-5 text-purple-600"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      width="20"
                      height="20"
                    >
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                    </svg>
                  </div>
                  <span className="text-gray-700">Mumbai, India</span>
                </motion.div>
              </div>
            </div>
            <div className="social-connect">
              <h3 className="text-2xl font-semibold mb-8 text-gray-800">
                Connect With Me
              </h3>
              <div className="social-links flex space-x-6 mb-10">
                {[
                  {
                    icon: <FaGithub size={22} />,
                    href: "https://github.com/",
                    hoverColor: "hover:bg-gray-800",
                  },
                  {
                    icon: <FaLinkedin size={22} />,
                    href: "https://linkedin.com/",
                    hoverColor: "hover:bg-blue-600",
                  },
                  {
                    icon: <FaEnvelope size={22} />,
                    href: "mailto:sunidhi.chaudhary@example.com",
                    hoverColor: "hover:bg-red-500",
                  },
                  {
                    icon: <FaTwitter size={22} />,
                    href: "https://twitter.com/",
                    hoverColor: "hover:bg-blue-400",
                  },
                ].map((social, idx) => (
                  <motion.a
                    key={idx}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-14 h-14 rounded-full flex items-center justify-center bg-gray-100 text-gray-700 ${social.hoverColor} hover:text-white transition-all duration-300`}
                    whileHover={{ y: -8, scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {social.icon}
                  </motion.a>
                ))}
              </div>
              <motion.div
                className="contact-cta"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <a
                  href="mailto:sunidhi.chaudhary@example.com"
                  className="block w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium rounded-lg text-center hover:shadow-xl transition-all duration-300"
                >
                  Send Me a Message
                </a>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.section>

      {/* Footer */}
      <footer className="footer py-8 text-center text-gray-600">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} Sunidhi Chaudhary. All Rights
          Reserved.
        </p>
      </footer>
    </div>
  );
};

export default Home;
