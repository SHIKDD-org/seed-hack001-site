import { config } from '@/config';

export default function Prizes() {
  return (
    <section className="section relative overflow-hidden" id="prizes">
      {/* Background glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${config.accentColor}12 0%, transparent 70%)`,
          animation: 'glowPulse 4s ease-in-out infinite',
        }}
      />

      <div className="max-w-5xl mx-auto relative z-10 text-center">
        <div className="section-label reveal justify-center">
          <span>Rewards</span>
        </div>

        <div className="reveal-scale">
          <h2
            className="text-[11px] font-medium tracking-[0.4em] uppercase text-white/25 mb-8"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Total Prize Pool
          </h2>

          {/* Prize amount - dramatic display */}
          <div
            className="prize-number text-8xl md:text-[12rem] mb-10"
            style={{
              color: config.accentColor,
              textShadow: `0 0 120px ${config.accentColor}25, 0 0 60px ${config.accentColor}15`,
            }}
          >
            {config.prizePool}
          </div>

          <p className="text-base md:text-lg text-white/30 max-w-lg mx-auto leading-relaxed">
            Distributed across multiple categories, sponsor prizes,
            and special awards for outstanding innovation
          </p>
        </div>

        {/* Prize categories */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { place: '1st Place', detail: 'Grand Prize', icon: '◆' },
            { place: '2nd Place', detail: 'Runner Up', icon: '◇' },
            { place: '3rd Place', detail: 'Honorable Mention', icon: '○' },
          ].map((prize, i) => (
            <div
              key={i}
              className="reveal card-hover p-10 rounded-2xl border border-white/[0.04] group"
              style={{
                background: 'rgba(255,255,255,0.015)',
                transitionDelay: `${0.3 + i * 0.15}s`,
              }}
            >
              <div
                className="text-2xl mb-6 opacity-30 group-hover:opacity-60 transition-opacity duration-500"
                style={{ color: i === 0 ? config.accentColor : 'white' }}
              >
                {prize.icon}
              </div>
              <div
                className="text-2xl md:text-3xl font-bold mb-3"
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  color: i === 0 ? config.accentColor : 'rgba(255,255,255,0.7)',
                }}
              >
                {prize.place}
              </div>
              <div className="text-[10px] tracking-[0.25em] uppercase text-white/20">
                {prize.detail}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
