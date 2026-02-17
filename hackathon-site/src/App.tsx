import { useEffect } from 'react';
import { config } from '@/config';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Dates from './components/Dates';
import Prizes from './components/Prizes';
import Teams from './components/Teams';
import Footer from './components/Footer';

declare global {
  interface Window {
    $: any;
    jQuery: any;
  }
}

export default function App() {
  useEffect(() => {
    const $ = window.$;
    if (!$) return;

    // ====== LOADING SCREEN ======
    setTimeout(() => {
      $('#loader').addClass('loaded');
    }, 1000);

    // ====== CUSTOM CURSOR ======
    let mouseX = 0, mouseY = 0;
    let dotX = 0, dotY = 0;
    let ringX = 0, ringY = 0;
    const $dot = $('#cursor-dot');
    const $ring = $('#cursor-ring');

    $(document).on('mousemove.cursor', (e: any) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      // Show cursor elements on first mouse move
      $dot.addClass('visible');
      $ring.addClass('visible');
    });

    // Smooth cursor follow with RAF
    function animateCursor() {
      // Dot follows closely
      dotX += (mouseX - dotX) * 0.35;
      dotY += (mouseY - dotY) * 0.35;
      $dot.css({ left: dotX, top: dotY });

      // Ring follows with lag
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;
      $ring.css({ left: ringX, top: ringY });

      requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Cursor hover effect
    $(document).on('mouseenter.cursor', 'a, button, .magnetic-btn, .card-hover, [role="button"]', () => {
      $ring.addClass('hover');
      $dot.css('transform', 'translate(-50%, -50%) scale(0)');
    });
    $(document).on('mouseleave.cursor', 'a, button, .magnetic-btn, .card-hover, [role="button"]', () => {
      $ring.removeClass('hover');
      $dot.css('transform', 'translate(-50%, -50%) scale(1)');
    });

    // ====== SMOOTH SCROLL ======
    $(document).on('click.scroll', 'a[href^="#"]', function (this: HTMLAnchorElement, e: Event) {
      e.preventDefault();
      const target = $(this).attr('href');
      if (target && target !== '#') {
        $('html, body').animate(
          { scrollTop: $(target).offset().top - 80 },
          1200,
          'swing'
        );
      }
    });

    // ====== NAVBAR SCROLL ======
    $(window).on('scroll.nav', function () {
      const scrollTop = $(window).scrollTop();
      if (scrollTop > 80) {
        $('#navbar').addClass('scrolled');
      } else {
        $('#navbar').removeClass('scrolled');
      }
    });

    // ====== SCROLL REVEAL ======
    function revealElements() {
      const windowHeight = $(window).height();
      const scrollTop = $(window).scrollTop();
      const triggerBottom = scrollTop + windowHeight * 0.87;

      $('.reveal, .reveal-left, .reveal-right, .reveal-scale').each(function (this: HTMLElement) {
        const $el = $(this);
        const elTop = $el.offset().top;

        if (elTop < triggerBottom && !$el.hasClass('active')) {
          $el.addClass('active');
        }
      });

      // Stagger children
      $('.stagger-children').each(function (this: HTMLElement) {
        const $el = $(this);
        const elTop = $el.offset().top;

        if (elTop < triggerBottom && !$el.hasClass('active')) {
          $el.addClass('active');
        }
      });
    }

    $(window).on('scroll.reveal', revealElements);
    // Run once after render
    setTimeout(revealElements, 200);
    setTimeout(revealElements, 600);

    // ====== PARALLAX ======
    $(window).on('scroll.parallax', function () {
      const scrolled = $(window).scrollTop();
      $('.parallax').each(function (this: HTMLElement) {
        const speed = parseFloat($(this).data('speed')) || 0.3;
        $(this).css('transform', `translateY(${scrolled * speed}px)`);
      });
    });

    // ====== MAGNETIC BUTTONS ======
    $(document).on('mousemove.magnetic', '.magnetic-btn', function (this: HTMLElement, e: any) {
      const $btn = $(this);
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const intensity = 0.2;
      $btn.css({
        transform: `translate(${x * intensity}px, ${y * intensity}px) scale(1.03)`,
      });
    });

    $(document).on('mouseleave.magnetic', '.magnetic-btn', function (this: HTMLElement) {
      $(this).css({
        transform: 'translate(0, 0) scale(1)',
      });
    });

    // ====== TILT EFFECT ON CARDS ======
    $(document).on('mousemove.tilt', '.card-hover', function (this: HTMLElement, e: any) {
      const $card = $(this);
      const rect = this.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      $card.css({
        transform: `perspective(600px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-6px) scale(1.02)`,
      });
    });

    $(document).on('mouseleave.tilt', '.card-hover', function (this: HTMLElement) {
      $(this).css({
        transform: 'perspective(600px) rotateY(0) rotateX(0) translateY(0) scale(1)',
      });
    });

    // ====== FADE SCROLL INDICATOR ON SCROLL ======
    $(window).on('scroll.scrollindicator', function () {
      const scrollTop = $(window).scrollTop();
      const opacity = Math.max(0, 1 - scrollTop / 400);
      $('.scroll-indicator').css('opacity', opacity * 0.4);
    });

    // ====== SECTION VISIBILITY TRACKING ======
    $(window).on('scroll.sections', function () {
      const scrollTop = $(window).scrollTop() + 200;
      $('section[id]').each(function (this: HTMLElement) {
        const $section = $(this);
        const top = $section.offset().top;
        const bottom = top + $section.outerHeight();
        const id = $section.attr('id');

        if (scrollTop >= top && scrollTop < bottom) {
          $(`.nav-link[href="#${id}"]`).addClass('text-white/80').removeClass('text-white/35');
        } else {
          $(`.nav-link[href="#${id}"]`).removeClass('text-white/80').addClass('text-white/35');
        }
      });
    });

    // ====== CLEANUP ======
    return () => {
      $(window).off('.nav .reveal .parallax .scrollindicator .sections');
      $(document).off('.cursor .scroll .magnetic .tilt');
    };
  }, []);

  // Build marquee text
  const marqueeText = `${config.title} \u00B7 Build \u00B7 Create \u00B7 Innovate \u00B7 ${config.prizePool} Prize Pool \u00B7 `;
  const repeatedText = marqueeText.repeat(8);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Accent line at top */}
      <div
        className="accent-line"
        style={{
          background: `linear-gradient(90deg, transparent, ${config.accentColor}, transparent)`,
        }}
      />

      {/* Loader */}
      <div id="loader">
        <div className="loader-inner">
          <div className="loader-line" />
          <div className="loader-text">LOADING</div>
        </div>
      </div>

      {/* Cursor elements */}
      <div id="cursor-dot" />
      <div id="cursor-ring" />

      <Navbar />
      <Hero />

      {/* Marquee strip */}
      <div className="marquee-wrapper">
        <div className="marquee-track">
          <span
            className="text-[11px] tracking-[0.3em] uppercase text-white/[0.06] whitespace-nowrap pr-4"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {repeatedText}
          </span>
          <span
            className="text-[11px] tracking-[0.3em] uppercase text-white/[0.06] whitespace-nowrap pr-4"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {repeatedText}
          </span>
        </div>
      </div>

      <About />
      <Dates />
      <Prizes />
      <Teams />
      <Footer />
    </div>
  );
}
