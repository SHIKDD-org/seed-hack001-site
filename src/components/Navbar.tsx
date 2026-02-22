import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import $ from 'jquery';
import gsap from 'gsap';
import { useConfig } from '@/config';

export default function Navbar() {
  const config = useConfig();
  const navRef = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    // Animate navbar in
    gsap.fromTo(nav,
      { y: -100, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: 'power3.out', delay: 0.5 }
    );

    // Animate nav links
    gsap.fromTo('.nav-link',
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out', delay: 0.8 }
    );

    // Scroll handler with jQuery
    const $window = $(window);
    const handleScroll = () => {
      const scrollTop = $window.scrollTop() || 0;
      setScrolled(scrollTop > 50);
    };
    $window.on('scroll', handleScroll);
    return () => { $window.off('scroll', handleScroll); };
  }, []);

  const navLinks = [
    { label: 'Home', href: '#home' },
    { label: 'About', href: '#about' },
    { label: 'Timeline', href: '#dates' },
    { label: 'Prizes', href: '#prizes' },
    { label: 'Teams', href: '#teams' },
  ];

  const scrollToSection = (href: string) => {
    const target = document.querySelector(href);
    if (target) {
      gsap.to(window, {
        scrollTo: { y: target, offsetY: 80 },
        duration: 1,
        ease: 'power3.inOut',
      });
    }
    setMenuOpen(false);
  };

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
        scrolled
          ? 'py-3 backdrop-blur-xl bg-black/60 border-b border-white/5 shadow-2xl'
          : 'py-6 bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <a
          href="#home"
          onClick={(e) => { e.preventDefault(); scrollToSection('#home'); }}
          className="flex items-center gap-3 group"
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold transition-all duration-300 group-hover:scale-110 group-hover:rotate-6"
            style={{
              background: `linear-gradient(135deg, ${config.accentColor}, ${config.accentColor}88)`,
              color: '#000',
              boxShadow: `0 0 20px ${config.accentColor}33`,
            }}
          >
            {config.title.charAt(0)}
          </div>
          <span className="text-lg font-bold text-white hidden sm:block">
            {config.title}
          </span>
        </a>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => { e.preventDefault(); scrollToSection(link.href); }}
              className="nav-link relative px-4 py-2 text-sm font-medium text-white/60 hover:text-white transition-all duration-300 rounded-lg hover:bg-white/5 group"
            >
              {link.label}
              <span
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] group-hover:w-6 transition-all duration-300 rounded-full"
                style={{ background: config.accentColor }}
              />
            </a>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/dashboard"
            className="nav-link px-5 py-2 text-sm font-medium text-white/70 hover:text-white transition-all border border-white/10 rounded-xl hover:border-white/20 hover:bg-white/5"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="nav-link px-5 py-2 text-sm font-bold rounded-xl transition-all hover:scale-105 hover:shadow-lg"
            style={{
              background: config.accentColor,
              color: '#000',
              boxShadow: `0 0 20px ${config.accentColor}33`,
            }}
          >
            Register
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex flex-col gap-1.5 p-2"
        >
          <span className={`w-6 h-0.5 bg-white transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`w-6 h-0.5 bg-white transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`w-6 h-0.5 bg-white transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden absolute top-full left-0 right-0 backdrop-blur-xl bg-black/90 border-b border-white/5 transition-all duration-500 overflow-hidden ${
          menuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="p-6 space-y-2">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => { e.preventDefault(); scrollToSection(link.href); }}
              className="block px-4 py-3 text-white/70 hover:text-white rounded-xl hover:bg-white/5 transition-all"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-4 border-t border-white/10 flex flex-col gap-2">
            <Link
              to="/dashboard"
              onClick={() => setMenuOpen(false)}
              className="w-full px-4 py-3 text-white/70 text-left rounded-xl hover:bg-white/5 transition-all"
            >
              Login
            </Link>
            <Link
              to="/register"
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-3 font-bold rounded-xl text-center"
              style={{ background: config.accentColor, color: '#000' }}
            >
              Register Now
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
