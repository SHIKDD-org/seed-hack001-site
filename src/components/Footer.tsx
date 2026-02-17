import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import $ from 'jquery';
import gsap from 'gsap';
import { config } from '@/config';

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const footer = footerRef.current;
    if (!footer) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const $footer = $(footer);

            gsap.fromTo(
              $footer.find('.footer-content').toArray(),
              { opacity: 0, y: 30 },
              { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out' }
            );

            gsap.fromTo(
              $footer.find('.footer-link').toArray(),
              { opacity: 0, x: -10 },
              { opacity: 1, x: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out', delay: 0.3 }
            );

            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  const quickLinks = [
    { label: 'Home', href: '#home' },
    { label: 'About', href: '#about' },
    { label: 'Timeline', href: '#dates' },
    { label: 'Prizes', href: '#prizes' },
    { label: 'Teams', href: '#teams' },
  ];

  return (
    <footer ref={footerRef} className="relative pt-20 pb-8 px-4 overflow-hidden">
      {/* Top border */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${config.accentColor}33, transparent)`,
        }}
      />

      {/* Background glow */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-[150px] opacity-5"
        style={{ background: config.accentColor }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Main footer content */}
        <div className="grid md:grid-cols-3 gap-12 mb-16">
          {/* Brand */}
          <div className="footer-content">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold"
                style={{
                  background: `linear-gradient(135deg, ${config.accentColor}, ${config.accentColor}88)`,
                  color: '#000',
                }}
              >
                {config.title.charAt(0)}
              </div>
              <span className="text-lg font-bold text-white">{config.title}</span>
            </div>
            <p className="text-sm text-white/40 leading-relaxed max-w-xs">
              {config.description}
            </p>
          </div>

          {/* Quick Links */}
          <div className="footer-content">
            <h4 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="footer-link text-sm text-white/40 hover:text-white transition-all flex items-center gap-2 group"
                  >
                    <span
                      className="w-1 h-1 rounded-full transition-all group-hover:w-2"
                      style={{ background: config.accentColor }}
                    />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <div className="footer-content">
            <h4 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-4">
              Join Us
            </h4>
            <p className="text-sm text-white/40 mb-4">
              Ready to build something amazing?
            </p>
            <Link
              to="/register"
              className="footer-link inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105"
              style={{
                background: config.accentColor,
                color: '#000',
                boxShadow: `0 0 20px ${config.accentColor}22`,
              }}
              onMouseEnter={(e) => {
                gsap.to(e.currentTarget, { boxShadow: `0 0 40px ${config.accentColor}44`, duration: 0.3 });
              }}
              onMouseLeave={(e) => {
                gsap.to(e.currentTarget, { boxShadow: `0 0 20px ${config.accentColor}22`, duration: 0.3 });
              }}
            >
              Register Now
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="footer-content pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-white/30">
            © {new Date().getFullYear()} {config.title}. Powered by{' '}
            <a
              href="https://devsage.org"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
              style={{ color: config.accentColor }}
            >
              DevSage
            </a>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/register"
              className="text-sm font-medium transition-all hover:text-white flex items-center gap-1"
              style={{ color: `${config.accentColor}99` }}
            >
              Register Now
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Made with love */}
        <div className="text-center mt-8">
          <p className="text-xs text-white/20">
            Made with ❤️ for hackers, by hackers
          </p>
        </div>
      </div>
    </footer>
  );
}
