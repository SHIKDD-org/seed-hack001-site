import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import $ from 'jquery';
import gsap from 'gsap';
import { useConfig } from '@/config';

interface Team {
  id: string;
  name: string;
  member_count?: number;
  created_at: string;
}

interface TeamsResponse {
  ok: boolean;
  data: Team[];
  meta?: { total: number };
}

export default function Teams() {
  const config = useConfig();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch(`${config.apiOrigin}/api/v1/hackathons/${config.slug}/teams`, {
      signal: controller.signal,
      credentials: 'include',
    })
      .then((res) => {
        if (!res.ok) throw new Error(`API returned ${res.status}`);
        return res.json() as Promise<TeamsResponse>;
      })
      .then((json) => {
        setTeams(json.data || []);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        console.error('Failed to fetch teams:', err);
        setError('Could not load teams');
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const $section = $(section);

            gsap.fromTo(
              $section.find('.teams-heading')[0],
              { opacity: 0, y: 50 },
              { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
            );

            gsap.fromTo(
              $section.find('.teams-line')[0],
              { scaleX: 0 },
              { scaleX: 1, duration: 0.8, ease: 'power2.out', delay: 0.2 }
            );

            gsap.fromTo(
              $section.find('.team-card').toArray(),
              { opacity: 0, y: 40, scale: 0.9, rotateY: -5 },
              { opacity: 1, y: 0, scale: 1, rotateY: 0, duration: 0.6, stagger: 0.08, ease: 'power3.out', delay: 0.4 }
            );

            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [loading]);

  const accent = config.accentColor;

  // Generate avatar color from team name
  const getTeamColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 60%, 50%)`;
  };

  return (
    <section id="teams" ref={sectionRef} className="relative py-32 px-4 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent, ${accent}33, transparent)`,
          }}
        />
        <div
          className="absolute right-0 bottom-1/4 w-80 h-80 rounded-full blur-[120px] opacity-5"
          style={{ background: accent }}
        />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div
            className="teams-line h-[2px] w-16 mx-auto mb-6 origin-center"
            style={{ background: accent }}
          />
          <h2 className="teams-heading text-5xl md:text-6xl font-black text-white mb-4">
            Registered <span style={{ color: accent }}>Teams</span>
          </h2>
          <p className="text-white/40 text-lg">
            {teams.length > 0
              ? `${teams.length} team${teams.length !== 1 ? 's' : ''} registered so far`
              : 'Be the first to register your team!'}
          </p>
        </div>

        {/* Loading skeletons */}
        {loading && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-28 rounded-2xl bg-white/5 animate-pulse border border-white/5"
              />
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">😔</div>
            <p className="text-white/40">{error}</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && teams.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-6">🚀</div>
            <h3 className="text-xl font-bold text-white mb-2">No teams yet</h3>
            <p className="text-white/40 mb-6">Be the first to register and form your dream team!</p>
            <Link
              to="/register"
              className="inline-block px-6 py-3 rounded-xl font-bold transition-all hover:scale-105"
              style={{ background: accent, color: '#000' }}
            >
              Register Now
            </Link>
          </div>
        )}

        {/* Team cards */}
        {!loading && !error && teams.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {teams.map((team) => (
              <div
                key={team.id}
                className="team-card group relative rounded-2xl p-5 border transition-all duration-300 cursor-default overflow-hidden"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  borderColor: 'rgba(255,255,255,0.06)',
                }}
                onMouseEnter={(e) => {
                  gsap.to(e.currentTarget, {
                    y: -5,
                    borderColor: `${accent}30`,
                    background: `${accent}05`,
                    duration: 0.3,
                  });
                  gsap.to($(e.currentTarget).find('.team-avatar')[0], {
                    scale: 1.1,
                    rotation: 5,
                    duration: 0.3,
                  });
                }}
                onMouseLeave={(e) => {
                  gsap.to(e.currentTarget, {
                    y: 0,
                    borderColor: 'rgba(255,255,255,0.06)',
                    background: 'rgba(255,255,255,0.02)',
                    duration: 0.3,
                  });
                  gsap.to($(e.currentTarget).find('.team-avatar')[0], {
                    scale: 1,
                    rotation: 0,
                    duration: 0.3,
                  });
                }}
              >
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div
                    className="team-avatar w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold flex-shrink-0 transition-all"
                    style={{
                      background: `${getTeamColor(team.name)}22`,
                      color: getTeamColor(team.name),
                      border: `1px solid ${getTeamColor(team.name)}33`,
                    }}
                  >
                    {team.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white truncate">{team.name}</h3>
                    <p className="text-sm text-white/40 flex items-center gap-1">
                      <span>👥</span>
                      {team.member_count != null
                        ? `${team.member_count} member${team.member_count !== 1 ? 's' : ''}`
                        : 'Team'}
                    </p>
                  </div>

                  {/* Arrow */}
                  <svg
                    className="w-4 h-4 text-white/20 group-hover:text-white/40 transition-all group-hover:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
