import { config } from '@/config';

export default function Footer() {
  return (
    <footer>
      {/* CTA Section */}
      <div className="section split-border text-center">
        <div className="max-w-3xl mx-auto">
          <h2
            className="text-5xl md:text-7xl font-bold mb-8 reveal"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              color: 'white',
            }}
          >
            Ready to
            <br />
            <span style={{ color: config.accentColor }}>build</span>?
          </h2>
          <p
            className="text-base md:text-lg text-white/30 mb-12 reveal leading-relaxed"
            style={{ transitionDelay: '0.15s' }}
          >
            Join developers, designers, and creators for an unforgettable
            weekend of innovation and collaboration.
          </p>
          <a
            href="https://devsage.org/login"
            className="reveal magnetic-btn inline-flex items-center gap-3 px-12 py-5 rounded-full font-bold text-sm tracking-[0.1em] uppercase transition-all duration-500 hover:scale-105 group"
            style={{
              background: config.accentColor,
              color: '#000',
              boxShadow: `0 0 60px -15px ${config.accentColor}`,
              transitionDelay: '0.3s',
            }}
          >
            Register Now
            <span className="inline-block transition-transform duration-300 group-hover:translate-x-1.5">
              &rarr;
            </span>
          </a>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="px-6 md:px-12 py-10 border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div
              className="text-xs text-white/15"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              &copy; {new Date().getFullYear()} {config.title}
            </div>
            <div className="w-px h-3 bg-white/8 hidden md:block" />
            <div className="text-xs text-white/15">
              Powered by{' '}
              <a
                href="https://devsage.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/30 hover:text-white/60 transition-colors duration-300"
              >
                DevSage
              </a>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <a
              href="#hero"
              className="nav-link text-[10px] tracking-[0.2em] uppercase text-white/20 hover:text-white/50 transition-colors duration-300"
            >
              Back to top
            </a>
            <a
              href="https://devsage.org/login"
              className="text-[10px] font-semibold tracking-[0.2em] uppercase transition-colors duration-300"
              style={{ color: `${config.accentColor}60` }}
            >
              Register &rarr;
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
