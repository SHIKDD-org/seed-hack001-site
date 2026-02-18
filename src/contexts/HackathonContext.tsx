import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import siteConfig from '../../site.config.json';

export interface Hackathon {
  slug: string;
  title: string;
  tagline: string | null;
  description: string | null;
  rules_md: string | null;
  status: string;
  starts_at: string | null;
  judging_starts: string | null;
  judging_ends: string | null;
  submission_deadline: string | null;
  min_team_size: number;
  max_team_size: number;
  max_teams: number | null;
  registration_mode: string;
  allowed_email_domains: string;
  timezone: string;
  tracks: string;
  prizes: string;
  settings: string;
  logo_url: string | null;
  banner_url: string | null;
}

export interface SiteConfig {
  slug: string;
  title: string;
  description: string;
  accentColor: string;
  registrationStart: string;
  hackingStart: string;
  submissionDeadline: string;
  maxTeamSize: number;
  prizePool: string;
  apiOrigin: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  rules: string | null;
}

interface HackathonContextType {
  hackathon: Hackathon | null;
  config: SiteConfig;
  loading: boolean;
  error: string | null;
}

const defaultConfig: SiteConfig = {
  slug: siteConfig.slug,
  title: siteConfig.title,
  description: siteConfig.description,
  accentColor: siteConfig.accentColor,
  registrationStart: siteConfig.registrationStart,
  hackingStart: siteConfig.hackingStart,
  submissionDeadline: siteConfig.submissionDeadline,
  maxTeamSize: siteConfig.maxTeamSize,
  prizePool: siteConfig.prizePool,
  apiOrigin: siteConfig.apiOrigin,
  logoUrl: siteConfig.logoUrl,
  bannerUrl: siteConfig.bannerUrl,
  rules: siteConfig.rules,
};

const HackathonContext = createContext<HackathonContextType>({
  hackathon: null,
  config: defaultConfig,
  loading: true,
  error: null,
});

export function useHackathon() {
  return useContext(HackathonContext);
}

interface HackathonProviderProps {
  children: ReactNode;
}

export function HackathonProvider({ children }: HackathonProviderProps) {
  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiOrigin = import.meta.env.VITE_API_ORIGIN || defaultConfig.apiOrigin;
  const hackathonSlug = import.meta.env.VITE_HACKATHON_SLUG || defaultConfig.slug;

  useEffect(() => {
    async function fetchHackathon() {
      try {
        const res = await fetch(`${apiOrigin}/api/v1/hackathons/${hackathonSlug}`);
        const data = await res.json();

        if (data.ok && data.data) {
          setHackathon(data.data);
        } else {
          console.warn('Failed to fetch hackathon, using static config:', data.error);
          setError(data.error?.message || 'Failed to fetch hackathon');
        }
      } catch (err) {
        console.warn('Error fetching hackathon, using static config:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchHackathon();
  }, [apiOrigin, hackathonSlug]);

  const config: SiteConfig = {
    slug: hackathon?.slug || defaultConfig.slug,
    title: hackathon?.title || defaultConfig.title,
    description: hackathon?.description || hackathon?.tagline || defaultConfig.description,
    accentColor: defaultConfig.accentColor,
    registrationStart: hackathon?.starts_at || defaultConfig.registrationStart,
    hackingStart: hackathon?.starts_at || defaultConfig.hackingStart,
    submissionDeadline: hackathon?.submission_deadline || defaultConfig.submissionDeadline,
    maxTeamSize: hackathon?.max_team_size || defaultConfig.maxTeamSize,
    prizePool: defaultConfig.prizePool,
    apiOrigin,
    logoUrl: hackathon?.logo_url || defaultConfig.logoUrl,
    bannerUrl: hackathon?.banner_url || defaultConfig.bannerUrl,
    rules: hackathon?.rules_md || defaultConfig.rules,
  };

  return (
    <HackathonContext.Provider value={{ hackathon, config, loading, error }}>
      {children}
    </HackathonContext.Provider>
  );
}
