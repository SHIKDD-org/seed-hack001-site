import { useEffect, useRef } from 'react';
import $ from 'jquery';
import gsap from 'gsap';
import { config } from '@/config';

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // Intersection Observer for scroll-triggered animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const $section = $(section);

            gsap.fromTo(
              $section.find('.about-heading')[0],
              { opacity: 0, y: 50, skewY: 3 },
              { opacity: 1, y: 0, skewY: 0, duration: 1, ease: 'power3.out' }
            );

            gsap.fromTo(
              $section.find('.about-line')[0],
              { scaleX: 0 },
              { scaleX: 1, duration: 0.8, ease: 'power2.out', delay: 0.2 }
            );

            gsap.fromTo(
              $section.find('.about-text').toArray(),
              { opacity: 0, y: 30 },
              { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'power2.out', delay: 0.3 }
            );

            gsap.fromTo(
              $section.find('.about-feature').toArray(),
              { opacity: 0, y: 40, scale: 0.95 },
              { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out', delay: 0.5 }
            );

            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: '💡',
      title: 'Innovate',
      desc: 'Build groundbreaking solutions to real-world problems',
    },
    {
      icon: '🤝',
      title: 'Collaborate',
      desc: 'Work with talented developers, designers, and creators',
    },
    {
      icon: '📚',
      title: 'Learn',
      desc: 'Workshops, mentors, and resources to level up your skills',
    },
    {
      icon: '🎯',
      title: 'Compete',
      desc: 'Showcase your project and win amazing prizes',
    },
  ];

  return (
    <section id="about" ref={sectionRef} className="relative py-32 px-4 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent, ${config.accentColor}33, transparent)`,
          }}
        />
        <div
          className="absolute -right-40 top-1/2 -translate-y-1/2 w-80 h-80 rounded-full blur-[120px] opacity-5"
          style={{ background: config.accentColor }}
        />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section header */}
        <div className="mb-16">
          <div
            className="about-line h-[2px] w-16 mb-6 origin-left"
            style={{ background: config.accentColor }}
          />
          <h2 className="about-heading text-5xl md:text-6xl font-black text-white mb-6">
            About <span style={{ color: config.accentColor }}>The Event</span>
          </h2>
          <p className="about-text text-lg text-white/50 max-w-2xl leading-relaxed">
            {config.description}
          </p>
        </div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <div
              key={i}
              className="about-feature group relative p-6 rounded-2xl border backdrop-blur-sm transition-all duration-500 cursor-default overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.02)',
                borderColor: 'rgba(255,255,255,0.06)',
              }}
              onMouseEnter={(e) => {
                gsap.to(e.currentTarget, {
                  y: -8,
                  borderColor: `${config.accentColor}40`,
                  duration: 0.4,
                  ease: 'power2.out',
                });
                gsap.to($(e.currentTarget).find('.feature-icon')[0], {
                  scale: 1.2,
                  rotation: 10,
                  duration: 0.4,
                });
                gsap.to($(e.currentTarget).find('.feature-glow')[0], {
                  opacity: 0.1,
                  duration: 0.4,
                });
              }}
              onMouseLeave={(e) => {
                gsap.to(e.currentTarget, {
                  y: 0,
                  borderColor: 'rgba(255,255,255,0.06)',
                  duration: 0.4,
                  ease: 'power2.out',
                });
                gsap.to($(e.currentTarget).find('.feature-icon')[0], {
                  scale: 1,
                  rotation: 0,
                  duration: 0.4,
                });
                gsap.to($(e.currentTarget).find('.feature-glow')[0], {
                  opacity: 0,
                  duration: 0.4,
                });
              }}
            >
              {/* Hover glow */}
              <div
                className="feature-glow absolute inset-0 opacity-0 rounded-2xl"
                style={{
                  background: `radial-gradient(circle at center, ${config.accentColor}20, transparent 70%)`,
                }}
              />

              <div className="relative z-10">
                <div className="feature-icon text-4xl mb-4 inline-block">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Rules section */}
        {config.rules && (
          <div className="mt-16 p-8 rounded-3xl border backdrop-blur-sm about-text"
            style={{
              background: 'rgba(255,255,255,0.02)',
              borderColor: 'rgba(255,255,255,0.06)',
            }}
          >
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <span
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                style={{ background: `${config.accentColor}22`, color: config.accentColor }}
              >
                📋
              </span>
              Rules & Guidelines
            </h3>
            <p className="text-white/50 whitespace-pre-wrap leading-relaxed">
              {config.rules}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
