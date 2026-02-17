import { useEffect, useRef, useState } from 'react';
import $ from 'jquery';
import gsap from 'gsap';
import { config } from '@/config';

export default function Prizes() {
  const sectionRef = useRef<HTMLElement>(null);
  const [hoveredPrize, setHoveredPrize] = useState(-1);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const $section = $(section);

            gsap.fromTo(
              $section.find('.prizes-heading')[0],
              { opacity: 0, y: 50 },
              { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
            );

            gsap.fromTo(
              $section.find('.prizes-line')[0],
              { scaleX: 0 },
              { scaleX: 1, duration: 0.8, ease: 'power2.out', delay: 0.2 }
            );

            // Animate prize pool number with counter
            const prizeEl = $section.find('.prize-amount')[0];
            if (prizeEl) {
              const prizeNum = parseInt(config.prizePool.replace(/[^0-9]/g, ''));
              gsap.fromTo(prizeEl,
                { opacity: 0, scale: 0.5 },
                { opacity: 1, scale: 1, duration: 1, ease: 'elastic.out(1, 0.5)', delay: 0.4,
                  onStart: () => {
                    // Counter animation
                    const obj = { val: 0 };
                    gsap.to(obj, {
                      val: prizeNum,
                      duration: 2,
                      ease: 'power2.out',
                      onUpdate: () => {
                        prizeEl.textContent = '$' + Math.round(obj.val).toLocaleString();
                      },
                    });
                  },
                }
              );
            }

            // Animate prize cards
            gsap.fromTo(
              $section.find('.prize-card').toArray(),
              { opacity: 0, y: 50, rotateY: -10 },
              { opacity: 1, y: 0, rotateY: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out', delay: 0.6 }
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

  const prizes = [
    {
      place: '1st',
      title: 'Grand Prize',
      emoji: '🥇',
      gradient: `linear-gradient(135deg, ${config.accentColor}, ${config.accentColor}88)`,
      features: ['Cash Prize', 'Exclusive Swag', 'Mentorship', 'Featured Project'],
    },
    {
      place: '2nd',
      title: 'Runner Up',
      emoji: '🥈',
      gradient: 'linear-gradient(135deg, #C0C0C0, #808080)',
      features: ['Cash Prize', 'Swag Pack', 'Recognition'],
    },
    {
      place: '3rd',
      title: 'Second Runner Up',
      emoji: '🥉',
      gradient: 'linear-gradient(135deg, #CD7F32, #8B4513)',
      features: ['Cash Prize', 'Swag Pack'],
    },
  ];

  return (
    <section id="prizes" ref={sectionRef} className="relative py-32 px-4 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent, ${config.accentColor}33, transparent)`,
          }}
        />
        <div
          className="absolute left-1/2 -translate-x-1/2 top-1/4 w-[600px] h-[600px] rounded-full blur-[200px] opacity-5"
          style={{ background: config.accentColor }}
        />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-20">
          <div
            className="prizes-line h-[2px] w-16 mx-auto mb-6 origin-center"
            style={{ background: config.accentColor }}
          />
          <h2 className="prizes-heading text-5xl md:text-6xl font-black text-white mb-6">
            Win <span style={{ color: config.accentColor }}>Big</span>
          </h2>

          {/* Prize pool counter */}
          <div className="mt-8">
            <div className="text-sm text-white/40 uppercase tracking-widest mb-3">Total Prize Pool</div>
            <div
              className="prize-amount text-7xl md:text-9xl font-black"
              style={{
                color: config.accentColor,
                textShadow: `0 0 60px ${config.accentColor}33`,
              }}
            >
              {config.prizePool}
            </div>
          </div>
        </div>

        {/* Prize cards */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {prizes.map((prize, index) => (
            <div
              key={index}
              className={`prize-card group relative rounded-3xl border backdrop-blur-sm transition-all duration-500 overflow-hidden ${
                index === 0 ? 'md:-mt-4 md:mb-4' : ''
              }`}
              style={{
                background: hoveredPrize === index ? `${config.accentColor}08` : 'rgba(255,255,255,0.02)',
                borderColor: hoveredPrize === index ? `${config.accentColor}30` : 'rgba(255,255,255,0.06)',
                perspective: '1000px',
              }}
              onMouseEnter={() => {
                setHoveredPrize(index);
                gsap.to(`.prize-card-${index}`, {
                  y: -10,
                  duration: 0.4,
                  ease: 'power2.out',
                });
                gsap.to(`.prize-glow-${index}`, {
                  opacity: 0.15,
                  duration: 0.4,
                });
              }}
              onMouseLeave={() => {
                setHoveredPrize(-1);
                gsap.to(`.prize-card-${index}`, {
                  y: 0,
                  duration: 0.4,
                  ease: 'power2.out',
                });
                gsap.to(`.prize-glow-${index}`, {
                  opacity: 0,
                  duration: 0.4,
                });
              }}
            >
              {/* Glow */}
              <div
                className={`prize-glow-${index} absolute inset-0 opacity-0`}
                style={{
                  background: `radial-gradient(circle at center top, ${config.accentColor}30, transparent 60%)`,
                }}
              />

              <div className={`prize-card-${index} relative z-10 p-8`}>
                {/* Badge */}
                <div className="flex items-center justify-between mb-6">
                  <span className="text-5xl">{prize.emoji}</span>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                    style={{
                      background: `${config.accentColor}15`,
                      color: config.accentColor,
                    }}
                  >
                    {prize.place} Place
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-white mb-6">{prize.title}</h3>

                {/* Features */}
                <ul className="space-y-3">
                  {prize.features.map((feature, fi) => (
                    <li key={fi} className="flex items-center gap-3 text-white/50 text-sm">
                      <span
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: config.accentColor }}
                      />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Bottom decoration */}
                <div
                  className="mt-8 h-[2px] rounded-full opacity-30"
                  style={{ background: prize.gradient }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Sponsor note */}
        <p className="text-center text-white/30 text-sm mt-12">
          + Special category prizes & sponsor rewards
        </p>
      </div>
    </section>
  );
}
