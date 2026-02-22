import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import $ from 'jquery';
import gsap from 'gsap';
import { useConfig } from '@/config';

export default function Hero() {
  const config = useConfig();
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;

    const ctx = canvas.getContext('2d')!;
    const resize = () => {
      canvas.width = section.offsetWidth;
      canvas.height = section.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles: Array<{
      x: number; y: number; baseX: number; baseY: number;
      vx: number; vy: number; size: number; alpha: number;
    }> = [];

    for (let i = 0; i < 80; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      particles.push({
        x, y, baseX: x, baseY: y,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.4 + 0.1,
      });
    }

    let animFrame: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      particles.forEach(p => {
        const dx = mx - p.x;
        const dy = my - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          p.x -= dx * 0.02;
          p.y -= dy * 0.02;
        } else {
          p.x += p.vx;
          p.y += p.vy;
          p.x += (p.baseX - p.x) * 0.001;
          p.y += (p.baseY - p.y) * 0.001;
        }

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = config.accentColor;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
      });

      ctx.strokeStyle = config.accentColor;
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.globalAlpha = (1 - dist / 100) * 0.15;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
      animFrame = requestAnimationFrame(animate);
    };
    animate();

    $(section).on('mousemove', (e) => {
      const rect = section.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    });

    const handleScroll = () => {
      const scrollY = window.scrollY;
      gsap.set('.hero-title', { y: scrollY * 0.3 });
      gsap.set('.hero-subtitle', { y: scrollY * 0.2 });
      gsap.set('.hero-particles', { y: scrollY * 0.1 });
    };
    window.addEventListener('scroll', handleScroll);

    const tl = gsap.timeline({ delay: 0.2 });
    
    tl.fromTo('.hero-badge',
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.7)' }
    )
    .fromTo('.hero-title .word',
      { opacity: 0, y: 60, rotateX: -40 },
      { opacity: 1, y: 0, rotateX: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out' },
      '-=0.2'
    )
    .fromTo('.hero-desc',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
      '-=0.3'
    )
    .fromTo('.hero-stats .stat',
      { opacity: 0, y: 30, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.1, ease: 'power2.out' },
      '-=0.3'
    )
    .fromTo('.hero-cta',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
      '-=0.2'
    )
    .fromTo('.hero-scroll-indicator',
      { opacity: 0 },
      { opacity: 1, duration: 0.5 },
      '-=0.1'
    );

    gsap.to('.hero-float-1', { y: -20, duration: 3, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    gsap.to('.hero-float-2', { y: 20, duration: 4, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 1 });
    gsap.to('.hero-float-3', { y: -15, x: 10, duration: 3.5, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 0.5 });

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', handleScroll);
      $(section).off('mousemove');
    };
  }, []);

  const titleWords = config.title.split(' ').map((word, i) => (
    <span key={i} className="word inline-block mr-4" style={{ perspective: '500px' }}>
      {word}
    </span>
  ));

  return (
    <section
      id="home"
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden px-4"
    >
      <canvas ref={canvasRef} className="hero-particles absolute inset-0 z-0" />

      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div
          className="hero-float-1 absolute top-[10%] right-[10%] w-[400px] h-[400px] rounded-full blur-[150px] opacity-15"
          style={{ background: config.accentColor }}
        />
        <div
          className="hero-float-2 absolute bottom-[10%] left-[10%] w-[500px] h-[500px] rounded-full blur-[150px] opacity-10"
          style={{ background: config.accentColor }}
        />
        <div
          className="hero-float-3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full blur-[120px] opacity-5"
          style={{ background: '#fff' }}
        />
      </div>

      <div
        className="absolute inset-0 opacity-[0.03] z-0"
        style={{
          backgroundImage: `linear-gradient(${config.accentColor}20 1px, transparent 1px), linear-gradient(90deg, ${config.accentColor}20 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto text-center pt-20">
        <div className="hero-badge inline-flex items-center gap-2 px-5 py-2 rounded-full mb-8 border backdrop-blur-sm"
          style={{
            background: `${config.accentColor}08`,
            borderColor: `${config.accentColor}30`,
          }}
        >
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: config.accentColor }} />
          <span className="text-sm font-medium" style={{ color: config.accentColor }}>
            Registration Open — Limited Spots
          </span>
        </div>

        <h1
          className="hero-title text-6xl md:text-8xl lg:text-9xl font-black tracking-tight mb-6 leading-[0.9]"
          style={{
            background: `linear-gradient(135deg, #ffffff 0%, ${config.accentColor} 50%, #ffffff 100%)`,
            backgroundSize: '200% 200%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {titleWords}
        </h1>

        <p className="hero-desc text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-12 leading-relaxed">
          {config.description}
        </p>

        <div className="hero-stats flex flex-wrap justify-center gap-4 md:gap-8 mb-12">
          {[
            { icon: '🏆', label: 'Prize Pool', value: config.prizePool },
            { icon: '👥', label: 'Team Size', value: `Up to ${config.maxTeamSize}` },
            { icon: '⏰', label: 'Duration', value: '48 Hours' },
            { icon: '🚀', label: 'Tracks', value: 'Multiple' },
          ].map((stat, i) => (
            <div
              key={i}
              className="stat group px-6 py-4 rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:scale-105 cursor-default"
              style={{
                background: 'rgba(255,255,255,0.02)',
                borderColor: 'rgba(255,255,255,0.06)',
              }}
              onMouseEnter={(e) => {
                gsap.to(e.currentTarget, {
                  borderColor: `${config.accentColor}40`,
                  background: `${config.accentColor}08`,
                  duration: 0.3,
                });
              }}
              onMouseLeave={(e) => {
                gsap.to(e.currentTarget, {
                  borderColor: 'rgba(255,255,255,0.06)',
                  background: 'rgba(255,255,255,0.02)',
                  duration: 0.3,
                });
              }}
            >
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-xs text-white/40 uppercase tracking-wider">{stat.label}</div>
              <div className="text-lg font-bold text-white">{stat.value}</div>
            </div>
          ))}
        </div>

        <div className="hero-cta flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/register"
            className="group relative px-8 py-4 rounded-2xl font-bold text-lg transition-all hover:scale-105 active:scale-95 overflow-hidden"
            style={{
              background: config.accentColor,
              color: '#000',
              boxShadow: `0 0 40px ${config.accentColor}33`,
            }}
            onMouseEnter={(e) => {
              gsap.to(e.currentTarget, { boxShadow: `0 0 60px ${config.accentColor}55`, duration: 0.3 });
            }}
            onMouseLeave={(e) => {
              gsap.to(e.currentTarget, { boxShadow: `0 0 40px ${config.accentColor}33`, duration: 0.3 });
            }}
          >
            <span className="relative z-10 flex items-center gap-2">
              Register Now
              <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </Link>
          
          <a
            href="#about"
            className="px-8 py-4 rounded-2xl font-bold text-lg text-white/70 border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all hover:scale-105 active:scale-95"
          >
            Learn More
          </a>
        </div>

        <div className="hero-scroll-indicator absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-xs text-white/30 uppercase tracking-widest">Scroll</span>
          <div className="w-[1px] h-8 overflow-hidden">
            <div
              className="w-full h-full"
              style={{
                background: `linear-gradient(to bottom, ${config.accentColor}, transparent)`,
                animation: 'scrollLine 2s ease-in-out infinite',
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
