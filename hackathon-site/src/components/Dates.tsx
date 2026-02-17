import { config } from '@/config';

export default function Dates() {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const dates = [
    { label: 'Registration Opens', value: config.registrationStart, num: '01' },
    { label: 'Hacking Begins', value: config.hackingStart, num: '02' },
    { label: 'Submissions Due', value: config.submissionDeadline, num: '03' },
  ];

  return (
    <section
      className="section split-border"
      id="dates"
      style={{ background: 'rgba(255,255,255,0.008)' }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="section-label reveal">Schedule</div>

        <h2
          className="text-4xl md:text-6xl font-bold mb-20 reveal gradient-text"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Important Dates
        </h2>

        <div className="space-y-0">
          {dates.map((item, index) => (
            <div
              key={index}
              className="reveal timeline-item py-12 group hover:bg-white/[0.015] transition-all duration-500 rounded-r-2xl"
              style={{ transitionDelay: `${index * 0.15}s` }}
            >
              <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-14">
                {/* Number */}
                <div
                  className="text-5xl md:text-6xl font-bold opacity-15 transition-opacity duration-500 group-hover:opacity-30"
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    color: config.accentColor,
                  }}
                >
                  {item.num}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="text-[10px] font-semibold tracking-[0.3em] uppercase text-white/25 mb-3">
                    {item.label}
                  </div>
                  <div
                    className="text-xl md:text-2xl font-semibold text-white/85"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {formatDate(item.value)}
                  </div>
                  <div className="text-sm text-white/25 mt-2">
                    {formatTime(item.value)}
                  </div>
                </div>

                {/* Hover indicator */}
                <div
                  className="hidden md:flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-[-10px] group-hover:translate-x-0"
                  style={{ color: config.accentColor }}
                >
                  Mark your calendar
                  <span>&rarr;</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
