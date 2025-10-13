"use client";

import { useEffect, useState } from "react";

export default function Particles() {
  const [particles, setParticles] = useState<
    Array<{
      id: number;
      left: number;
      size: number;
      delay: number;
      duration: number;
    }>
  >([]);

  useEffect(() => {
    const particleCount = 15;
    const newParticles = [];

    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: i,
        left: Math.random() * 100,
        size: Math.floor(Math.random() * 3) + 3,
        delay: Math.random() * 15,
        duration: Math.random() * 15 + 20,
      });
    }

    setParticles(newParticles);
  }, []);

  return (
    <>
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="particle"
          style={{
            left: `${particle.left}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
          }}
        />
      ))}
    </>
  );
}
