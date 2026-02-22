import { useHackathon, type SiteConfig } from './contexts/HackathonContext';

export const useConfig = () => {
  const { config } = useHackathon();
  return config;
};

export type { SiteConfig };
