import { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import $ from 'jquery';
import gsap from 'gsap';
import { HackathonProvider } from './contexts/HackathonContext';
import { AuthProvider } from './contexts/AuthContext';
import IntroScreen from './components/IntroScreen';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Dates from './components/Dates';
import Prizes from './components/Prizes';
import Teams from './components/Teams';
import About from './components/About';
import Footer from './components/Footer';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';

function HomePage() {
  const [introComplete, setIntroComplete] = useState(false);

  useEffect(() => {
    if (!introComplete) return;

    // Restore scrolling after intro
    document.body.style.overflow = '';

    // After intro completes, animate main content in
    gsap.fromTo(
      '.main-content',
      { opacity: 0 },
      { opacity: 1, duration: 0.8, ease: 'power2.out' }
    );

    // jQuery smooth scroll for anchor links
    $('a[href^="#"]').on('click', function (e) {
      e.preventDefault();
      const target = $($(this).attr('href') || '');
      if (target.length) {
        $('html, body').animate(
          { scrollTop: target.offset()!.top - 80 },
          800,
          'swing'
        );
      }
    });

    // Cursor trail effect
    const $trail = $('<div class="cursor-trail"></div>').appendTo('body');
    $(document).on('mousemove.trail', (e) => {
      gsap.to($trail[0], {
        x: e.clientX,
        y: e.clientY,
        duration: 0.5,
        ease: 'power2.out',
      });
    });

    return () => {
      $(document).off('mousemove.trail');
      $trail.remove();
    };
  }, [introComplete]);

  return (
    <>
      {/* Intro screen */}
      {!introComplete && (
        <IntroScreen onComplete={() => setIntroComplete(true)} />
      )}

      {/* Main content */}
      <div
        className={`main-content min-h-screen bg-[#0a0a0a] text-white ${
          introComplete ? '' : 'opacity-0 pointer-events-none'
        }`}
      >
        <Navbar />
        <Hero />
        <About />
        <Dates />
        <Prizes />
        <Teams />
        <Footer />
      </div>
    </>
  );
}

export default function App() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <HackathonProvider>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </AuthProvider>
    </HackathonProvider>
  );
}
