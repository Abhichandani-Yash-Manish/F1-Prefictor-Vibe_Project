"use client";
import { useEffect, useRef } from "react";

interface RacingParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: 'red' | 'cyan' | 'gold';
  trail: { x: number; y: number }[];
}

interface SpeedLine {
  x: number;
  y: number;
  length: number;
  speed: number;
  opacity: number;
}

interface GridLine {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  opacity: number;
  pulseOffset: number;
}

export default function TelemetryBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<RacingParticle[]>([]);
  const speedLinesRef = useRef<SpeedLine[]>([]);
  const gridLinesRef = useRef<GridLine[]>([]);
  const animationRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    
    const resize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
      initElements();
    };

    const initElements = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      // Racing particles
      particlesRef.current = [];
      const particleCount = Math.floor((width * height) / 25000);
      const colors: RacingParticle['color'][] = ['red', 'cyan', 'gold'];
      
      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: Math.random() * 2 - 1,
          vy: -Math.random() * 3 - 1, // Upward motion (racing feeling)
          size: Math.random() * 3 + 1,
          opacity: Math.random() * 0.4 + 0.1,
          color: colors[Math.floor(Math.random() * colors.length)],
          trail: [],
        });
      }

      // Speed lines (horizontal racing streaks)
      speedLinesRef.current = [];
      for (let i = 0; i < 15; i++) {
        speedLinesRef.current.push({
          x: Math.random() * width,
          y: Math.random() * height,
          length: Math.random() * 150 + 50,
          speed: Math.random() * 20 + 10,
          opacity: Math.random() * 0.15 + 0.05,
        });
      }

      // Racing grid lines
      gridLinesRef.current = [];
      const gridSpacing = 100;
      
      // Horizontal grid
      for (let y = 0; y < height; y += gridSpacing) {
        gridLinesRef.current.push({
          startX: 0,
          startY: y,
          endX: width,
          endY: y,
          opacity: 0.03,
          pulseOffset: Math.random() * Math.PI * 2,
        });
      }
      
      // Vertical grid
      for (let x = 0; x < width; x += gridSpacing) {
        gridLinesRef.current.push({
          startX: x,
          startY: 0,
          endX: x,
          endY: height,
          opacity: 0.03,
          pulseOffset: Math.random() * Math.PI * 2,
        });
      }
    };

    const getColor = (color: RacingParticle['color'], opacity: number) => {
      switch (color) {
        case 'red': return `rgba(225, 6, 0, ${opacity})`;
        case 'cyan': return `rgba(0, 212, 255, ${opacity})`;
        case 'gold': return `rgba(201, 169, 98, ${opacity})`;
      }
    };

    const animate = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      ctx.clearRect(0, 0, width, height);
      
      timeRef.current += 0.016;
      const time = timeRef.current;

      // Draw subtle grid with pulse
      gridLinesRef.current.forEach(line => {
        const pulseOpacity = line.opacity * (0.5 + 0.5 * Math.sin(time * 0.5 + line.pulseOffset));
        
        ctx.beginPath();
        ctx.moveTo(line.startX, line.startY);
        ctx.lineTo(line.endX, line.endY);
        ctx.strokeStyle = `rgba(255, 255, 255, ${pulseOpacity})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      });

      // Draw speed lines (racing streaks flying left)
      speedLinesRef.current.forEach(line => {
        line.x -= line.speed;
        
        if (line.x + line.length < 0) {
          line.x = width + line.length;
          line.y = Math.random() * height;
          line.speed = Math.random() * 20 + 10;
        }

        const gradient = ctx.createLinearGradient(
          line.x + line.length, line.y,
          line.x, line.y
        );
        gradient.addColorStop(0, `rgba(0, 212, 255, 0)`);
        gradient.addColorStop(0.3, `rgba(0, 212, 255, ${line.opacity * 0.3})`);
        gradient.addColorStop(1, `rgba(0, 212, 255, ${line.opacity})`);
        
        ctx.beginPath();
        ctx.moveTo(line.x + line.length, line.y);
        ctx.lineTo(line.x, line.y);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      // Draw and update particles
      particlesRef.current.forEach(particle => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Add to trail
        particle.trail.push({ x: particle.x, y: particle.y });
        if (particle.trail.length > 8) particle.trail.shift();

        // Wrap around
        if (particle.y < -50) {
          particle.y = height + 50;
          particle.x = Math.random() * width;
          particle.trail = [];
        }
        if (particle.x < -50) particle.x = width + 50;
        if (particle.x > width + 50) particle.x = -50;

        // Mouse interaction - particles accelerate towards cursor
        const mouse = mouseRef.current;
        if (mouse.active) {
          const dx = mouse.x - particle.x;
          const dy = mouse.y - particle.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 200 && dist > 0) {
            const force = (200 - dist) / 200 * 0.1;
            particle.vx += (dx / dist) * force;
            particle.vy += (dy / dist) * force;
          }
        }

        // Damping
        particle.vx *= 0.99;
        particle.vy *= 0.99;

        // Draw trail
        if (particle.trail.length > 1) {
          ctx.beginPath();
          ctx.moveTo(particle.trail[0].x, particle.trail[0].y);
          
          for (let i = 1; i < particle.trail.length; i++) {
            ctx.lineTo(particle.trail[i].x, particle.trail[i].y);
          }
          
          const trailGradient = ctx.createLinearGradient(
            particle.trail[0].x, particle.trail[0].y,
            particle.x, particle.y
          );
          trailGradient.addColorStop(0, getColor(particle.color, 0));
          trailGradient.addColorStop(1, getColor(particle.color, particle.opacity * 0.5));
          
          ctx.strokeStyle = trailGradient;
          ctx.lineWidth = particle.size * 0.5;
          ctx.lineCap = 'round';
          ctx.stroke();
        }

        // Draw particle glow
        const glowGradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size * 4
        );
        glowGradient.addColorStop(0, getColor(particle.color, particle.opacity));
        glowGradient.addColorStop(0.5, getColor(particle.color, particle.opacity * 0.3));
        glowGradient.addColorStop(1, getColor(particle.color, 0));
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 4, 0, Math.PI * 2);
        ctx.fillStyle = glowGradient;
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = getColor(particle.color, particle.opacity * 1.5);
        ctx.fill();
      });

      // Draw racing start lights animation (top of screen)
      const lightCount = 5;
      const lightSpacing = 60;
      const lightsWidth = lightCount * lightSpacing;
      const lightsStartX = (width - lightsWidth) / 2;
      const lightsY = 30;
      const lightPhase = (Math.sin(time * 0.5) + 1) / 2; // 0 to 1
      
      for (let i = 0; i < lightCount; i++) {
        const lightX = lightsStartX + i * lightSpacing + lightSpacing / 2;
        const isLit = i <= Math.floor(lightPhase * lightCount);
        
        // Light housing
        ctx.beginPath();
        ctx.arc(lightX, lightsY, 12, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(20, 20, 25, 0.6)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Light glow
        if (isLit) {
          const glowGradient = ctx.createRadialGradient(lightX, lightsY, 0, lightX, lightsY, 25);
          glowGradient.addColorStop(0, 'rgba(225, 6, 0, 0.8)');
          glowGradient.addColorStop(0.5, 'rgba(225, 6, 0, 0.3)');
          glowGradient.addColorStop(1, 'rgba(225, 6, 0, 0)');
          
          ctx.beginPath();
          ctx.arc(lightX, lightsY, 25, 0, Math.PI * 2);
          ctx.fillStyle = glowGradient;
          ctx.fill();
          
          ctx.beginPath();
          ctx.arc(lightX, lightsY, 8, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 50, 50, 1)';
          ctx.fill();
        }
      }

      // Mouse cursor glow
      if (mouseRef.current.active) {
        const mx = mouseRef.current.x;
        const my = mouseRef.current.y;
        
        const cursorGlow = ctx.createRadialGradient(mx, my, 0, mx, my, 100);
        cursorGlow.addColorStop(0, 'rgba(201, 169, 98, 0.15)');
        cursorGlow.addColorStop(0.5, 'rgba(201, 169, 98, 0.05)');
        cursorGlow.addColorStop(1, 'rgba(201, 169, 98, 0)');
        
        ctx.beginPath();
        ctx.arc(mx, my, 100, 0, Math.PI * 2);
        ctx.fillStyle = cursorGlow;
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ background: "transparent" }}
    />
  );
}
