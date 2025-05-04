import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaGithub,
  FaLinkedin,
  FaEnvelope,
  FaTwitter,
  FaMapMarkerAlt,
  FaPhone,
  FaPaperPlane,
  FaExclamationTriangle,
  FaCheckCircle,
} from "react-icons/fa";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [toast, setToast] = useState({ show: false, type: "", message: "" });

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ ...toast, show: false });
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (type, message) => {
    setToast({ show: true, type, message });
  };

  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.name.trim()) {
      errors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.subject.trim()) {
      errors.subject = "Subject is required";
    }

    if (!formData.message.trim()) {
      errors.message = "Message is required";
    } else if (formData.message.trim().length < 20) {
      errors.message = "Message should be at least 20 characters";
    }

    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      });
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    const validationErrors = validateForm();

    if (validationErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: validationErrors[name],
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      showToast("error", "Please fix the errors in the form");
      return;
    }

    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      console.log(formData);
      setSubmitSuccess(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
      showToast("success", "Your message has been sent successfully!");

      setTimeout(() => {
        setSubmitSuccess(false);
      }, 4000);
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitError(true);
      showToast("error", "Failed to send message. Please try again later.");

      setTimeout(() => {
        setSubmitError(false);
      }, 4000);
    } finally {
      setIsSubmitting(false);
    }
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

          <AnimatePresence>
            {toast.show && (
              <motion.div
                className={`p-4 mb-6 rounded ${
                  toast.type === "success"
                    ? "bg-green-100 border-l-4 border-green-500 text-green-700"
                    : "bg-red-100 border-l-4 border-red-500 text-red-700"
                }`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <p className="flex items-center">
                  {toast.type === "success" ? (
                    <FaCheckCircle className="mr-2" />
                  ) : (
                    <FaExclamationTriangle className="mr-2" />
                  )}
                  {toast.message}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

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
                onBlur={handleBlur}
                className={`w-full px-4 py-3 border ${
                  formErrors.name
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-purple-500"
                } rounded-lg focus:outline-none transition-all`}
                required
              />
              {formErrors.name && (
                <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
              )}
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
                onBlur={handleBlur}
                className={`w-full px-4 py-3 border ${
                  formErrors.email
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-purple-500"
                } rounded-lg focus:outline-none transition-all`}
                required
              />
              {formErrors.email && (
                <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
              )}
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
                onBlur={handleBlur}
                className={`w-full px-4 py-3 border ${
                  formErrors.subject
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-purple-500"
                } rounded-lg focus:outline-none transition-all`}
                required
              />
              {formErrors.subject && (
                <p className="text-red-500 text-sm mt-1">
                  {formErrors.subject}
                </p>
              )}
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
                onBlur={handleBlur}
                rows="6"
                className={`w-full px-4 py-3 border ${
                  formErrors.message
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-purple-500"
                } rounded-lg focus:outline-none resize-none transition-all`}
                required
              ></motion.textarea>
              {formErrors.message && (
                <p className="text-red-500 text-sm mt-1">
                  {formErrors.message}
                </p>
              )}
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
