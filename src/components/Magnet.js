'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';

const Magnet = ({ children, padding = 100, disabled = false, magnetStrength = 2 }) => {
  const [isActive, setIsActive] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const magnetRef = useRef(null);
  const controls = useAnimation();

  useEffect(() => {
    if (isActive && !disabled) {
      controls.start({
        x: position.x,
        y: position.y,
        scale: 1.05,
        transition: { type: 'spring', stiffness: 150, damping: 15, mass: 0.1 }
      });
    } else {
      controls.start({
        x: 0,
        y: 0,
        scale: 1,
        transition: { type: 'spring', stiffness: 200, damping: 20, mass: 0.1 }
      });
    }
  }, [isActive, position, disabled, controls]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!magnetRef.current || disabled) return;

      const { left, top, width, height } = magnetRef.current.getBoundingClientRect();
      const centerX = left + width / 2;
      const centerY = top + height / 2;
      const distX = Math.abs(centerX - e.clientX);
      const distY = Math.abs(centerY - e.clientY);

      if (distX < width / 2 + padding && distY < height / 2 + padding) {
        setIsActive(true);
        const offsetX = (e.clientX - centerX) / magnetStrength;
        const offsetY = (e.clientY - centerY) / magnetStrength;
        setPosition({ x: offsetX, y: offsetY });
      } else {
        setIsActive(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [padding, disabled, magnetStrength]);

  return (
    <motion.div ref={magnetRef} animate={controls} style={{ display: 'inline-block' }}>
      {children}
    </motion.div>
  );
};

export default Magnet;
