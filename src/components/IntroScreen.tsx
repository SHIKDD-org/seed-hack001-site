import { useEffect, useRef } from 'react';
import $ from 'jquery';
import gsap from 'gsap';
import { useConfig } from '@/config';

interface IntroScreenProps {
  onComplete: () => void;
}

export default function IntroScreen({ onComplete }: IntroScreenProps) {
  const config = useConfig();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // Particle system on canvas
    const ctx = canvas.getContext('2d')!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number; y: number; vx: number; vy: number;
      size: number; alpha: number; color: string;
    }> = [];

    for (let i = 0; i < 150; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: Math.random() * 3 + 1,
        alpha: Math.random() * 0.5 + 0.1,
        color: Math.random() > 0.5 ? config.accentColor : '#ffffff',
      });
    }

    let animFrame: number;
    const animateParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
      });

      // Draw connections
      ctx.globalAlpha = 0.05;
      ctx.strokeStyle = config.accentColor;
      ctx.lineWidth = 1;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
      animFrame = requestAnimationFrame(animateParticles);
    };
    animateParticles();

    // jQuery + GSAP intro animation sequence — NO auto-exit; user clicks to enter
    const $container = $(container);
    const tl = gsap.timeline();

    // Animate the intro sequence
    tl.fromTo('.intro-line', 
      { width: 0 },
      { width: '120px', duration: 0.8, ease: 'power2.out', delay: 0.3 }
    )
    .fromTo('.intro-subtitle',
      { opacity: 0, y: 20, letterSpacing: '0px' },
      { opacity: 1, y: 0, letterSpacing: '8px', duration: 0.8, ease: 'power2.out' },
      '-=0.3'
    )
    .fromTo('.intro-title .char',
      { opacity: 0, y: 80, rotateX: -90 },
      { opacity: 1, y: 0, rotateX: 0, duration: 0.8, stagger: 0.05, ease: 'back.out(1.7)' },
      '-=0.4'
    )
    .fromTo('.intro-tagline',
      { opacity: 0, y: 30 },
      { opacity: 0.7, y: 0, duration: 0.6, ease: 'power2.out' },
      '-=0.2'
    )
    .fromTo('.intro-loader',
      { scaleX: 0 },
      { scaleX: 1, duration: 1.5, ease: 'power1.inOut' },
      '+=0.3'
    )
    .fromTo('.intro-enter',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
      '-=0.3'
    );

    // Pulsing glow effect via jQuery
    $container.find('.intro-glow').each(function() {
      gsap.to(this, {
        scale: 1.2,
        opacity: 0.3,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    });

    return () => {
      cancelAnimationFrame(animFrame);
    };
  }, [onComplete]);

  // Split title into characters for animation
  const titleChars = config.title.split('').map((char, i) => (
    <span key={i} className="char inline-block" style={{ perspective: '500px' }}>
      {char === ' ' ? '\u00A0' : char}
    </span>
  ));

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
      style={{ background: '#000' }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />
      
      {/* Radial glow */}
      <div
        className="intro-glow absolute w-[600px] h-[600px] rounded-full opacity-20 blur-[100px] z-0"
        style={{ background: config.accentColor }}
      />

      <div className="intro-content relative z-10 flex flex-col items-center text-center px-4">
        {/* Top line */}
        <div
          className="intro-line h-[2px] mb-8 overflow-hidden"
          style={{ background: `linear-gradient(90deg, transparent, ${config.accentColor}, transparent)`, width: 0 }}
        />

        {/* Subtitle */}
        <div
          className="intro-subtitle text-xs uppercase tracking-[8px] mb-6 font-medium opacity-0"
          style={{ color: config.accentColor }}
        >
          Welcome to
        </div>

        {/* Main Title */}
        <h1
          className="intro-title text-6xl md:text-9xl font-black mb-6"
          style={{
            background: `linear-gradient(135deg, #fff 0%, ${config.accentColor} 50%, #fff 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundSize: '200% 200%',
          }}
        >
          {titleChars}
        </h1>

        {/* Tagline */}
        <p className="intro-tagline text-lg md:text-xl text-white/50 max-w-lg mb-10 opacity-0">
          {config.description}
        </p>

        {/* Loading bar */}
        <div className="w-48 h-[2px] bg-white/10 rounded-full overflow-hidden mb-6">
          <div
            className="intro-loader h-full origin-left"
            style={{ background: config.accentColor, transform: 'scaleX(0)' }}
          />
        </div>

        {/* Enter text */}
        <button
          className="intro-enter text-sm uppercase tracking-[4px] font-medium opacity-0 cursor-pointer border-none bg-transparent transition-all hover:tracking-[8px]"
          style={{ color: config.accentColor }}
          onClick={() => {
            const container = containerRef.current;
            if (!container) return;

            // Kill any running GSAP tweens on the container
            gsap.killTweensOf('.intro-content');
            gsap.killTweensOf(container);

            // Exit animation: fade content, slide container up, then tell React we're done
            gsap.to('.intro-content', {
              scale: 0.8, opacity: 0, duration: 0.6, ease: 'power3.in',
            });
            gsap.to(container, {
              yPercent: -100, duration: 1, ease: 'power4.inOut', delay: 0.3,
              onComplete: () => {
                onComplete();   // React unmounts us — no manual DOM removal
              },
            });
          }}
        >
          Click to Enter
        </button>
      </div>

      {/* Corner decorations */}
      <div className="absolute top-8 left-8 w-12 h-12 border-l-2 border-t-2 opacity-30" style={{ borderColor: config.accentColor }} />
      <div className="absolute top-8 right-8 w-12 h-12 border-r-2 border-t-2 opacity-30" style={{ borderColor: config.accentColor }} />
      <div className="absolute bottom-8 left-8 w-12 h-12 border-l-2 border-b-2 opacity-30" style={{ borderColor: config.accentColor }} />
      <div className="absolute bottom-8 right-8 w-12 h-12 border-r-2 border-b-2 opacity-30" style={{ borderColor: config.accentColor }} />
    </div>
  );
}
