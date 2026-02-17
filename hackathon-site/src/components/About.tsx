import { config } from '@/config';

export default function About() {
  return (
    <section className="section split-border" id="about">
      <div className="max-w-6xl mx-auto">
        <div className="section-label reveal">About</div>

        <div className="grid md:grid-cols-2 gap-16 md:gap-24 items-start">
          {/* Left: Large heading */}
          <div className="reveal-left">
            <h2
              className="text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Build the
              <br />
              <span style={{ color: config.accentColor }}>future</span>,
              <br />
              together.
            </h2>
          </div>

          {/* Right: Description */}
          <div className="space-y-10 reveal-right">
            <p className="text-lg text-white/45 leading-[1.8]">
              {config.description}
            </p>

            {config.rules && (
              <div className="space-y-5 pt-10 border-t border-white/5">
                <h3
                  className="text-[11px] font-semibold tracking-[0.25em] uppercase text-white/25"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Rules & Guidelines
                </h3>
                <p className="text-white/35 leading-[1.8] whitespace-pre-wrap text-sm">
                  {config.rules}
                </p>
              </div>
            )}

            <a
              href="https://devsage.org/login"
              className="magnetic-btn inline-flex items-center gap-3 text-sm font-semibold tracking-[0.15em] uppercase transition-all duration-300 group hover:gap-5"
              style={{ color: config.accentColor }}
            >
              Join the hackathon
              <span className="inline-block transition-transform duration-300 group-hover:translate-x-2">
                &rarr;
              </span>
            </a>
          </div>
        </div>

        {/* Bottom stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-24 pt-16 border-t border-white/5">
          {[
            { value: config.prizePool, label: 'Prize Pool' },
            { value: `${config.maxTeamSize} People`, label: 'Max Team Size' },
            { value: '48 Hours', label: 'Duration' },
            { value: 'Open', label: 'Registration' },
          ].map((stat, i) => (
            <div
              key={i}
              className="reveal text-center md:text-left"
              style={{ transitionDelay: `${i * 0.12}s` }}
            >
              <div
                className="text-2xl md:text-3xl font-bold mb-2"
                style={{ fontFamily: "'Space Grotesk', sans-serif", color: i === 0 ? config.accentColor : 'white' }}
              >
                {stat.value}
              </div>
              <div className="text-[10px] tracking-[0.3em] uppercase text-white/20">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
