import { config } from '@/config';

export default function Hero() {
  const title = config.title.toUpperCase();
  const chars = title.split('');

  return (
    <section className="hero" id="hero">
      {/* Background orbs */}
      <div
        className="hero-orb parallax"
        data-speed="0.12"
        style={{
          background: config.accentColor,
          width: '700px',
          height: '700px',
          top: '-20%',
          right: '-15%',
          animationDelay: '0s',
        }}
      />
      <div
        className="hero-orb parallax"
        data-speed="0.2"
        style={{
          background: config.accentColor,
          width: '500px',
          height: '500px',
          bottom: '-15%',
          left: '-10%',
          animationDelay: '4s',
        }}
      />
      <div
        className="hero-orb parallax"
        data-speed="0.08"
        style={{
          background: '#ffffff',
          width: '250px',
          height: '250px',
          top: '45%',
          left: '25%',
          opacity: 0.04,
          animationDelay: '7s',
        }}
      />

      {/* Noise texture */}
      <div className="noise-overlay" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full text-[11px] font-medium tracking-[0.25em] uppercase mb-12 reveal"
          style={{
            background: `${config.accentColor}08`,
            border: `1px solid ${config.accentColor}20`,
            color: config.accentColor,
          }}
        >
          <span
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: config.accentColor, boxShadow: `0 0 12px ${config.accentColor}` }}
          />
          Registration Open
        </div>

        {/* Title with character animation */}
        <h1 className="hero-title mb-10">
          {chars.map((char, i) =>
            char === ' ' ? (
              <span key={i}>&nbsp;</span>
            ) : (
              <span
                key={i}
                className="char"
                style={{ animationDelay: `${0.6 + i * 0.045}s` }}
              >
                {char}
              </span>
            )
          )}
        </h1>

        {/* Subtitle */}
        <p
          className="text-lg md:text-xl text-white/40 max-w-2xl mx-auto leading-relaxed mb-14 reveal"
          style={{ transitionDelay: '0.4s' }}
        >
          {config.description}
        </p>

        {/* Stats row */}
        <div
          className="flex flex-wrap justify-center gap-10 md:gap-16 mb-16 reveal"
          style={{ transitionDelay: '0.6s' }}
        >
          <div className="text-center">
            <div
              className="text-3xl md:text-4xl font-bold text-white"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {config.prizePool}
            </div>
            <div className="text-[10px] text-white/25 mt-2 uppercase tracking-[0.3em]">
              Prize Pool
            </div>
          </div>
          <div className="w-px h-14 bg-white/8 hidden md:block" />
          <div className="text-center">
            <div
              className="text-3xl md:text-4xl font-bold text-white"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {config.maxTeamSize}
            </div>
            <div className="text-[10px] text-white/25 mt-2 uppercase tracking-[0.3em]">
              Max Team Size
            </div>
          </div>
          <div className="w-px h-14 bg-white/8 hidden md:block" />
          <div className="text-center">
            <div
              className="text-3xl md:text-4xl font-bold text-white"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              48h
            </div>
            <div className="text-[10px] text-white/25 mt-2 uppercase tracking-[0.3em]">
              Duration
            </div>
          </div>
        </div>

        {/* CTA buttons */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-5 reveal"
          style={{ transitionDelay: '0.8s' }}
        >
          <a
            href="https://devsage.org/login"
            className="magnetic-btn group px-12 py-5 rounded-full font-bold text-sm tracking-[0.1em] uppercase transition-all duration-500 hover:scale-105"
            style={{
              background: config.accentColor,
              color: '#000',
              boxShadow: `0 0 60px -15px ${config.accentColor}`,
            }}
          >
            Register Now
            <span className="inline-block ml-3 transition-transform duration-300 group-hover:translate-x-1.5">
              &rarr;
            </span>
          </a>
          <a
            href="#about"
            className="magnetic-btn px-12 py-5 rounded-full font-bold text-sm tracking-[0.1em] uppercase text-white/50 border border-white/10 hover:border-white/25 hover:text-white/80 transition-all duration-500"
          >
            Learn More
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="scroll-indicator">
        <span className="text-[9px] tracking-[0.4em] uppercase text-white/20" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Scroll
        </span>
        <div className="scroll-line" />
      </div>
    </section>
  );
}
