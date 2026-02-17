import { useEffect, useRef, useState } from 'react';
import $ from 'jquery';
import gsap from 'gsap';
import { config } from '@/config';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });

  useEffect(() => {
    if (!isOpen || !modalRef.current || !overlayRef.current) return;

    // jQuery + GSAP entrance animation
    const $modal = $(modalRef.current);
    const $overlay = $(overlayRef.current);

    gsap.fromTo($overlay[0],
      { opacity: 0 },
      { opacity: 1, duration: 0.4, ease: 'power2.out' }
    );

    gsap.fromTo($modal[0],
      { scale: 0.8, opacity: 0, y: 50, rotateX: 10 },
      { scale: 1, opacity: 1, y: 0, rotateX: 0, duration: 0.6, ease: 'back.out(1.7)', delay: 0.1 }
    );

    // Animate form fields in
    gsap.fromTo('.login-field',
      { x: -30, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.4, stagger: 0.1, ease: 'power2.out', delay: 0.3 }
    );

    // Floating particles in modal
    gsap.to('.login-particle', {
      y: -20,
      opacity: 0.6,
      duration: 2,
      repeat: -1,
      yoyo: true,
      stagger: 0.3,
      ease: 'sine.inOut',
    });
  }, [isOpen]);

  const handleClose = () => {
    if (!modalRef.current || !overlayRef.current) return;
    gsap.to(modalRef.current, {
      scale: 0.8, opacity: 0, y: 50, duration: 0.4, ease: 'power3.in',
    });
    gsap.to(overlayRef.current, {
      opacity: 0, duration: 0.3, delay: 0.1, onComplete: onClose,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Animate the button
    gsap.to('.login-btn', {
      scale: 0.95, duration: 0.1, yoyo: true, repeat: 1,
    });
    // This will be connected to backend later
    console.log('Login data:', formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative w-full max-w-md rounded-3xl border border-white/10 overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, rgba(15,20,35,0.98) 0%, rgba(5,10,20,0.98) 100%)',
          boxShadow: `0 0 80px ${config.accentColor}15, 0 0 0 1px rgba(255,255,255,0.05)`,
        }}
      >
        {/* Decorative particles */}
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="login-particle absolute w-1 h-1 rounded-full opacity-0"
            style={{
              background: config.accentColor,
              left: `${20 + i * 15}%`,
              top: `${10 + i * 10}%`,
            }}
          />
        ))}

        {/* Glow effect */}
        <div
          className="absolute -top-20 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full blur-[80px] opacity-30"
          style={{ background: config.accentColor }}
        />

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all hover:rotate-90 duration-300 z-10"
        >
          ✕
        </button>

        <div className="relative z-10 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div
              className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-2xl font-bold"
              style={{
                background: `linear-gradient(135deg, ${config.accentColor}22, ${config.accentColor}44)`,
                border: `1px solid ${config.accentColor}33`,
                color: config.accentColor,
              }}
            >
              {config.title.charAt(0)}
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-sm text-white/40">
              {isSignUp
                ? 'Join the hackathon and start building!'
                : 'Sign in to your hackathon account'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="login-field">
                <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-transparent transition-all"
                  style={{ boxShadow: `0 0 0 0px ${config.accentColor}` }}
                  onFocus={(e) => {
                    gsap.to(e.target, { boxShadow: `0 0 0 2px ${config.accentColor}66`, duration: 0.3 });
                  }}
                  onBlur={(e) => {
                    gsap.to(e.target, { boxShadow: `0 0 0 0px ${config.accentColor}`, duration: 0.3 });
                  }}
                  placeholder="John Doe"
                />
              </div>
            )}

            <div className="login-field">
              <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none transition-all"
                style={{ boxShadow: `0 0 0 0px ${config.accentColor}` }}
                onFocus={(e) => {
                  gsap.to(e.target, { boxShadow: `0 0 0 2px ${config.accentColor}66`, duration: 0.3 });
                }}
                onBlur={(e) => {
                  gsap.to(e.target, { boxShadow: `0 0 0 0px ${config.accentColor}`, duration: 0.3 });
                }}
                placeholder="you@example.com"
              />
            </div>

            <div className="login-field">
              <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none transition-all"
                style={{ boxShadow: `0 0 0 0px ${config.accentColor}` }}
                onFocus={(e) => {
                  gsap.to(e.target, { boxShadow: `0 0 0 2px ${config.accentColor}66`, duration: 0.3 });
                }}
                onBlur={(e) => {
                  gsap.to(e.target, { boxShadow: `0 0 0 0px ${config.accentColor}`, duration: 0.3 });
                }}
                placeholder="••••••••"
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="login-btn w-full py-3.5 rounded-xl font-bold text-base transition-all hover:scale-[1.02] active:scale-[0.98] mt-6"
              style={{
                background: `linear-gradient(135deg, ${config.accentColor}, ${config.accentColor}cc)`,
                color: '#000',
                boxShadow: `0 0 30px ${config.accentColor}33`,
              }}
            >
              {isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          {/* Separator */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-white/30">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Social login buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-all text-sm">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-all text-sm">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </button>
          </div>

          {/* Toggle sign up / sign in */}
          <div className="text-center mt-6">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                // Animate transition
                gsap.fromTo('.login-field', { x: -20, opacity: 0 }, { x: 0, opacity: 1, duration: 0.3, stagger: 0.05 });
              }}
              className="text-sm hover:underline transition-colors"
              style={{ color: config.accentColor }}
            >
              {isSignUp
                ? 'Already have an account? Sign in'
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
