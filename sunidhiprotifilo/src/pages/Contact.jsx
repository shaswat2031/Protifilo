import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FaGithub,
  FaLinkedin,
  FaEnvelope,
  FaTwitter,
  FaMapMarkerAlt,
  FaPhone,
  FaPaperPlane,
} from "react-icons/fa";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulating form submission with a timeout
    setTimeout(() => {
      console.log(formData);
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setFormData({ name: "", email: "", subject: "", message: "" });

      // Reset success message after 3 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 3000);
    }, 1500);
  };

  return (
    <motion.div
      className="contact-page px-6 sm:px-10 py-12 w-full"
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
        <h1 className="text-4xl font-bold text-gray-800 mb-3">Get In Touch</h1>
        <div className="underline w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto"></div>
        <p className="text-gray-600 mt-6 max-w-2xl mx-auto">
          Have a project in mind or want to collaborate? I'd love to hear from
          you. Fill out the form below or reach out to me directly through any
          of my contact channels.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-6xl mx-auto">
        <motion.div
          className="bg-white rounded-2xl shadow-lg p-8"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">
            Send Me a Message
          </h2>

          {submitSuccess && (
            <motion.div
              className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Thank you! Your message has been sent. I'll get back to you
                soon.
              </p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label
                htmlFor="name"
                className="block mb-2 font-medium text-gray-700"
              >
                Your Name
              </label>
              <motion.input
                whileFocus={{ scale: 1.01 }}
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                required
              />
            </div>
            <div className="mb-5">
              <label
                htmlFor="email"
                className="block mb-2 font-medium text-gray-700"
              >
                Email Address
              </label>
              <motion.input
                whileFocus={{ scale: 1.01 }}
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                required
              />
            </div>
            <div className="mb-5">
              <label
                htmlFor="subject"
                className="block mb-2 font-medium text-gray-700"
              >
                Subject
              </label>
              <motion.input
                whileFocus={{ scale: 1.01 }}
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                required
              />
            </div>
            <div className="mb-5">
              <label
                htmlFor="message"
                className="block mb-2 font-medium text-gray-700"
              >
                Your Message
              </label>
              <motion.textarea
                whileFocus={{ scale: 1.01 }}
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="6"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all"
                required
              ></motion.textarea>
            </div>
            <motion.button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg flex items-center justify-center space-x-2"
              disabled={isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <FaPaperPlane className="mr-2" />
                  <span>Send Message</span>
                </>
              )}
            </motion.button>
          </form>
        </motion.div>

        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-lg p-8 mb-8"
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">
              Contact Information
            </h2>
            <div className="space-y-6">
              <motion.div
                className="flex items-center"
                whileHover={{ x: 5, transition: { duration: 0.2 } }}
              >
                <div className="bg-purple-100 p-4 rounded-full mr-5">
                  <FaEnvelope className="text-purple-600 text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Email</p>
                  <a
                    href="mailto:sunidhi.chaudhary@example.com"
                    className="text-gray-800 hover:text-purple-600 transition-colors"
                  >
                    sunidhi.chaudhary@example.com
                  </a>
                </div>
              </motion.div>

              <motion.div
                className="flex items-center"
                whileHover={{ x: 5, transition: { duration: 0.2 } }}
              >
                <div className="bg-purple-100 p-4 rounded-full mr-5">
                  <FaPhone className="text-purple-600 text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Phone</p>
                  <a
                    href="tel:+919876543210"
                    className="text-gray-800 hover:text-purple-600 transition-colors"
                  >
                    +91 98765 43210
                  </a>
                </div>
              </motion.div>

              <motion.div
                className="flex items-center"
                whileHover={{ x: 5, transition: { duration: 0.2 } }}
              >
                <div className="bg-purple-100 p-4 rounded-full mr-5">
                  <FaMapMarkerAlt className="text-purple-600 text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Location</p>
                  <p className="text-gray-800">Mumbai, India</p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-2xl shadow-lg p-8"
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">
              Connect With Me
            </h2>
            <div className="flex space-x-5">
              {[
                {
                  icon: <FaGithub size={24} />,
                  href: "https://github.com/",
                  color: "hover:bg-gray-800",
                },
                {
                  icon: <FaLinkedin size={24} />,
                  href: "https://linkedin.com/",
                  color: "hover:bg-blue-600",
                },
                {
                  icon: <FaEnvelope size={24} />,
                  href: "mailto:sunidhi.chaudhary@example.com",
                  color: "hover:bg-red-500",
                },
                {
                  icon: <FaTwitter size={24} />,
                  href: "https://twitter.com/",
                  color: "hover:bg-blue-400",
                },
              ].map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-14 h-14 rounded-full flex items-center justify-center bg-gray-100 text-gray-700 ${social.color} hover:text-white transition-all duration-300`}
                  whileHover={{ y: -8, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600 text-sm">
                Available for freelance work and full-time positions. Feel free
                to reach out for collaborations or just a friendly chat!
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Contact;
