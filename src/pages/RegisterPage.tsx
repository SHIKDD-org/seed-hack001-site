import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import $ from 'jquery';
import gsap from 'gsap';
import { useConfig } from '@/config';
import { useAuth } from '@/contexts/AuthContext';

export default function RegisterPage() {
  const config = useConfig();
  const { register, loginWithGitHub, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const pageRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const page = pageRef.current;
    if (!page) return;

    const $page = $(page);

    gsap.fromTo(page, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: 'power2.out' });

    gsap.fromTo(
      $page.find('.reg-hero-text').toArray(),
      { opacity: 0, x: -40 },
      { opacity: 1, x: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out', delay: 0.2 }
    );

    gsap.fromTo(
      $page.find('.reg-form-el').toArray(),
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.06, ease: 'power2.out', delay: 0.4 }
    );

    gsap.to($page.find('.reg-deco-line')[0], {
      scaleY: 1,
      duration: 1.2,
      ease: 'power2.out',
      delay: 0.3,
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    const result = await register(formData.email, formData.name, formData.password);
    
    if (result.ok) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Registration failed');
      setLoading(false);
    }
  };

  return (
    <div ref={pageRef} className="min-h-screen bg-[#0a0a0a] text-white flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-[#0a0a0a]" />
        <div
          className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[250px] opacity-8"
          style={{ background: config.accentColor }}
        />

        <div
          className="reg-deco-line absolute right-12 top-0 w-[1px] h-full origin-top"
          style={{ background: config.accentColor, transform: 'scaleY(0)' }}
        />

        <div className="relative z-10 px-16 max-w-lg">
          <div className="reg-hero-text mb-8">
            <Link to="/" className="inline-block mb-12 group">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 flex items-center justify-center text-xl font-black"
                  style={{ background: config.accentColor, color: '#000' }}
                >
                  {config.title.charAt(0)}
                </div>
                <span className="text-xl font-bold uppercase tracking-wider text-white/80 group-hover:text-white transition-colors">
                  {config.title}
                </span>
              </div>
            </Link>
          </div>

          <h1 className="reg-hero-text text-5xl md:text-6xl font-black uppercase leading-[0.95] mb-6">
            Join<br />
            <span style={{ color: config.accentColor }}>The Race.</span>
          </h1>

          <p className="reg-hero-text text-white/40 text-lg leading-relaxed mb-8">
            Create your account and assemble your team. Build something incredible and compete for{' '}
            <span className="font-bold text-white/60">{config.prizePool}</span> in prizes.
          </p>

          <div className="reg-hero-text space-y-3 text-sm text-white/30 uppercase tracking-wider">
            <div className="flex items-center gap-3">
              <span className="w-6 h-[1px]" style={{ background: config.accentColor }} />
              Teams of up to {config.maxTeamSize} members
            </div>
            <div className="flex items-center gap-3">
              <span className="w-6 h-[1px]" style={{ background: config.accentColor }} />
              {config.prizePool} Prize Pool
            </div>
            <div className="flex items-center gap-3">
              <span className="w-6 h-[1px]" style={{ background: config.accentColor }} />
              Mentorship & Workshops
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 relative">
        <Link
          to="/"
          className="absolute top-6 left-6 lg:top-8 lg:right-8 lg:left-auto flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors uppercase tracking-wider"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </Link>

        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-10 reg-form-el">
            <Link to="/" className="flex items-center gap-3">
              <div
                className="w-10 h-10 flex items-center justify-center text-lg font-black"
                style={{ background: config.accentColor, color: '#000' }}
              >
                {config.title.charAt(0)}
              </div>
              <span className="text-lg font-bold uppercase tracking-wider">{config.title}</span>
            </Link>
          </div>

          <h2 className="reg-form-el text-3xl font-black uppercase mb-2">Create Account</h2>
          <p className="reg-form-el text-white/30 text-sm mb-8 uppercase tracking-wider">
            Start your journey
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="reg-form-el">
              <label className="block text-xs text-white/30 mb-2 uppercase tracking-[3px] font-medium">
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-0 py-3 bg-transparent border-0 border-b border-white/10 text-white text-lg placeholder-white/15 focus:outline-none focus:border-b-2 transition-all"
                style={{ borderBottomColor: formData.name ? config.accentColor : undefined }}
                placeholder="John Doe"
              />
            </div>

            <div className="reg-form-el">
              <label className="block text-xs text-white/30 mb-2 uppercase tracking-[3px] font-medium">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-0 py-3 bg-transparent border-0 border-b border-white/10 text-white text-lg placeholder-white/15 focus:outline-none focus:border-b-2 transition-all"
                style={{ borderBottomColor: formData.email ? config.accentColor : undefined }}
                placeholder="you@example.com"
              />
            </div>

            <div className="reg-form-el">
              <label className="block text-xs text-white/30 mb-2 uppercase tracking-[3px] font-medium">
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-0 py-3 bg-transparent border-0 border-b border-white/10 text-white text-lg placeholder-white/15 focus:outline-none focus:border-b-2 transition-all"
                style={{ borderBottomColor: formData.password ? config.accentColor : undefined }}
                placeholder="••••••••"
              />
            </div>

            <div className="reg-form-el">
              <label className="block text-xs text-white/30 mb-2 uppercase tracking-[3px] font-medium">
                Confirm Password
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="w-full px-0 py-3 bg-transparent border-0 border-b border-white/10 text-white text-lg placeholder-white/15 focus:outline-none focus:border-b-2 transition-all"
                style={{ borderBottomColor: formData.confirmPassword ? config.accentColor : undefined }}
                placeholder="••••••••"
              />
            </div>

            <div className="reg-form-el flex items-start gap-2 text-sm pt-1">
              <input type="checkbox" className="accent-[#FF6B00] w-4 h-4 mt-0.5" />
              <span className="text-white/30">
                I agree to the{' '}
                <button type="button" className="underline hover:text-white/60 transition-colors">
                  Terms of Service
                </button>{' '}
                and{' '}
                <button type="button" className="underline hover:text-white/60 transition-colors">
                  Privacy Policy
                </button>
              </span>
            </div>

            {error && (
              <div className="reg-form-el text-red-400 text-sm text-center py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="reg-form-el reg-submit-btn w-full py-4 text-base font-black uppercase tracking-[3px] transition-all hover:tracking-[5px] active:scale-[0.98] disabled:opacity-50"
              style={{
                background: config.accentColor,
                color: '#000',
              }}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="reg-form-el flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-xs text-white/20 uppercase tracking-widest">Or continue with</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          {/* Social */}
          <div className="reg-form-el grid grid-cols-2 gap-3">
            <button onClick={loginWithGitHub} className="flex items-center justify-center gap-2 px-4 py-3.5 bg-white/[0.03] border border-white/ text-white/50 hover:text-white hover:bg-white/6 transition-all text-sm uppercase tracking-wider font-medium">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </button>
            <button onClick={loginWithGoogle} className="flex items-center justify-center gap-2 px-4 py-3.5 bg-white/[0.03] border border-white/ text-white/50 hover:text-white hover:bg-white/6 transition-all text-sm uppercase tracking-wider font-medium">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
          </div>

          {/* Switch to login */}
          <div className="reg-form-el text-center mt-8">
            <span className="text-white/20 text-sm">Already have an account? </span>
            <Link
              to="/login"
              className="text-sm font-bold uppercase tracking-wider hover:tracking-[3px] transition-all"
              style={{ color: config.accentColor }}
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
