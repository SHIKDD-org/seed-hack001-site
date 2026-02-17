import { useEffect, useRef, useState } from 'react';
import $ from 'jquery';
import gsap from 'gsap';
import { config } from '@/config';

export default function Dates() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(-1);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const dates = [
    {
      label: 'Registration Opens',
      value: config.registrationStart,
      icon: '📝',
      desc: 'Sign up and form your team',
    },
    {
      label: 'Hacking Begins',
      value: config.hackingStart,
      icon: '🚀',
      desc: 'Start building your project',
    },
    {
      label: 'Submission Deadline',
      value: config.submissionDeadline,
      icon: '🏁',
      desc: 'Submit your final project',
    },
  ];

  // Countdown timer
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    const target = new Date(config.hackingStart).getTime();
    const interval = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, target - now);
      setCountdown({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        mins: Math.floor((diff / (1000 * 60)) % 60),
        secs: Math.floor((diff / 1000) % 60),
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const $section = $(section);

            gsap.fromTo(
              $section.find('.dates-heading')[0],
              { opacity: 0, y: 50 },
              { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
            );

            gsap.fromTo(
              $section.find('.dates-line')[0],
              { scaleX: 0 },
              { scaleX: 1, duration: 0.8, ease: 'power2.out', delay: 0.2 }
            );

            // Animate countdown
            gsap.fromTo(
              $section.find('.countdown-item').toArray(),
              { opacity: 0, y: 30, scale: 0.8 },
              { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.1, ease: 'back.out(1.7)', delay: 0.3 }
            );

            // Animate timeline items
            gsap.fromTo(
              $section.find('.timeline-item').toArray(),
              { opacity: 0, x: -50 },
              { opacity: 1, x: 0, duration: 0.8, stagger: 0.2, ease: 'power3.out', delay: 0.6 }
            );

            // Animate timeline line
            gsap.fromTo(
              $section.find('.timeline-line')[0],
              { scaleY: 0 },
              { scaleY: 1, duration: 1.5, ease: 'power2.out', delay: 0.5 }
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

  return (
    <section id="dates" ref={sectionRef} className="relative py-32 px-4 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent, ${config.accentColor}33, transparent)`,
          }}
        />
        <div
          className="absolute -left-40 top-1/3 w-80 h-80 rounded-full blur-[120px] opacity-5"
          style={{ background: config.accentColor }}
        />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div
            className="dates-line h-[2px] w-16 mx-auto mb-6 origin-center"
            style={{ background: config.accentColor }}
          />
          <h2 className="dates-heading text-5xl md:text-6xl font-black text-white mb-4">
            Event <span style={{ color: config.accentColor }}>Timeline</span>
          </h2>
        </div>

        {/* Countdown */}
        <div className="flex justify-center gap-4 md:gap-8 mb-20">
          {[
            { label: 'Days', value: countdown.days },
            { label: 'Hours', value: countdown.hours },
            { label: 'Minutes', value: countdown.mins },
            { label: 'Seconds', value: countdown.secs },
          ].map((item, i) => (
            <div
              key={i}
              className="countdown-item text-center group"
            >
              <div
                className="w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center text-3xl md:text-4xl font-black mb-2 border backdrop-blur-sm transition-all duration-300 group-hover:scale-110"
                style={{
                  background: `${config.accentColor}08`,
                  borderColor: `${config.accentColor}20`,
                  color: config.accentColor,
                  textShadow: `0 0 20px ${config.accentColor}44`,
                }}
              >
                {String(item.value).padStart(2, '0')}
              </div>
              <span className="text-xs text-white/40 uppercase tracking-wider">
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* Timeline */}
        <div className="relative max-w-3xl mx-auto">
          {/* Vertical line */}
          <div
            className="timeline-line absolute left-8 md:left-1/2 top-0 bottom-0 w-[2px] origin-top -translate-x-1/2"
            style={{ background: `linear-gradient(to bottom, ${config.accentColor}44, transparent)` }}
          />

          {dates.map((item, index) => (
            <div
              key={index}
              className={`timeline-item relative flex items-start gap-6 mb-12 md:mb-16 ${
                index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
              }`}
              onMouseEnter={() => {
                setActiveIndex(index);
                gsap.to(`.timeline-dot-${index}`, {
                  scale: 1.5,
                  boxShadow: `0 0 30px ${config.accentColor}66`,
                  duration: 0.3,
                });
              }}
              onMouseLeave={() => {
                setActiveIndex(-1);
                gsap.to(`.timeline-dot-${index}`, {
                  scale: 1,
                  boxShadow: `0 0 0px transparent`,
                  duration: 0.3,
                });
              }}
            >
              {/* Dot */}
              <div className="relative z-10 flex-shrink-0 md:absolute md:left-1/2 md:-translate-x-1/2">
                <div
                  className={`timeline-dot-${index} w-4 h-4 rounded-full mt-2 transition-all duration-300`}
                  style={{
                    background: config.accentColor,
                    boxShadow: activeIndex === index ? `0 0 30px ${config.accentColor}66` : 'none',
                  }}
                />
              </div>

              {/* Content card */}
              <div
                className={`flex-1 p-6 rounded-2xl border backdrop-blur-sm transition-all duration-300 ml-4 md:ml-0 ${
                  index % 2 === 0 ? 'md:mr-[calc(50%+2rem)]' : 'md:ml-[calc(50%+2rem)]'
                }`}
                style={{
                  background: activeIndex === index ? `${config.accentColor}08` : 'rgba(255,255,255,0.02)',
                  borderColor: activeIndex === index ? `${config.accentColor}30` : 'rgba(255,255,255,0.06)',
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{item.icon}</span>
                  <h3
                    className="text-lg font-bold transition-colors"
                    style={{ color: activeIndex === index ? config.accentColor : '#fff' }}
                  >
                    {item.label}
                  </h3>
                </div>
                <div className="text-white/70 font-medium mb-1">{formatDate(item.value)}</div>
                <div className="text-sm text-white/40 mb-2">{formatTime(item.value)}</div>
                <p className="text-sm text-white/30">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
