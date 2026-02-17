import { useEffect, useState } from 'react';
import { config } from '@/config';

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
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch(`${config.apiOrigin}/api/v1/hackathons/${config.slug}/teams`, {
      signal: controller.signal,
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

  return (
    <section
      className="section split-border"
      id="teams"
      style={{ background: 'rgba(255,255,255,0.008)' }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="section-label reveal">Community</div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
          <h2
            className="text-4xl md:text-6xl font-bold reveal gradient-text"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Registered Teams
          </h2>
          <a
            href="https://devsage.org/login"
            className="reveal magnetic-btn text-[11px] font-bold tracking-[0.2em] uppercase transition-all duration-300 group inline-flex items-center gap-2 hover:gap-4"
            style={{ color: config.accentColor, transitionDelay: '0.15s' }}
          >
            Create a team
            <span className="transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
          </a>
        </div>

        {/* Loading skeletons */}
        {loading && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-24 rounded-2xl shimmer"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  animationDelay: `${i * 0.15}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="reveal text-center py-24">
            <p className="text-white/25 text-sm">{error}</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && teams.length === 0 && (
          <div
            className="reveal text-center py-24 border border-white/[0.04] rounded-3xl"
            style={{ background: 'rgba(255,255,255,0.01)' }}
          >
            <div
              className="text-6xl mb-6 opacity-20"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              0
            </div>
            <p className="text-white/35 text-lg mb-3">No teams registered yet</p>
            <p className="text-white/15 text-sm">
              Be the first to create a team and start building!
            </p>
          </div>
        )}

        {/* Teams grid */}
        {!loading && !error && teams.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 stagger-children">
            {teams.map((team) => (
              <div
                key={team.id}
                className="card-hover rounded-2xl p-7 border border-white/[0.04] group"
                style={{ background: 'rgba(255,255,255,0.015)' }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 transition-all duration-300 group-hover:scale-110"
                    style={{
                      background: `${config.accentColor}10`,
                      color: config.accentColor,
                      border: `1px solid ${config.accentColor}15`,
                    }}
                  >
                    {team.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-white/90 truncate group-hover:text-white transition-colors duration-300">
                      {team.name}
                    </h3>
                    <p className="text-[11px] text-white/25 mt-1 tracking-wider">
                      {team.member_count != null
                        ? `${team.member_count} member${team.member_count !== 1 ? 's' : ''}`
                        : 'Team'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
