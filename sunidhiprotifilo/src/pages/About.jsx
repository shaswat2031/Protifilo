import React from "react";

const About = () => {
  return (
    <div className="about-page">
      <h1 className="text-3xl font-bold mb-6">About Me</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">My Background</h2>
        <p className="mb-4">
          I am Sunidhi Chaudhary, a passionate web developer with expertise in
          creating modern, responsive websites. With a strong background in both
          frontend and backend technologies, I bring creative designs to life
          with clean, efficient code.
        </p>
        <p>
          My journey in web development started with a curiosity for design and
          problem-solving. Today, I enjoy tackling challenging projects and
          continuously expanding my skill set to stay current with the latest
          technologies and trends.
        </p>
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
    </div>
  );
};

export default About;
