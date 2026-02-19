/**
 * Centralized API client for hackathon template ↔ DevSage backend.
 *
 * Every function mirrors a real backend route so the template
 * renders live data from the D1 database instead of mock data.
 */

// ─── Generic helpers ────────────────────────────────────────

function apiOrigin(): string {
  return (
    (import.meta.env.VITE_API_ORIGIN as string) ||
    'https://api.devsage.org'
  );
}

function hackathonSlug(): string {
  return (import.meta.env.VITE_HACKATHON_SLUG as string) || 'my-hackathon';
}

function getStoredToken(): string | null {
  try { return localStorage.getItem('devsage_access_token'); } catch { return null; }
}

async function apiFetch<T = unknown>(
  path: string,
  init?: RequestInit
): Promise<{ ok: boolean; data?: T; error?: { code: string; message: string }; meta?: Record<string, unknown> }> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(init?.headers as Record<string, string> || {}),
  };
  const res = await fetch(`${apiOrigin()}${path}`, {
    ...init,
    headers,
  });
  return res.json();
}

// ─── Auth ───────────────────────────────────────────────────

export async function authMe() {
  return apiFetch<{ user: User }>('/auth/me');
}

export async function authLogin(email: string, password: string) {
  return apiFetch<{ id: string; email: string; name: string; avatar_url?: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function authRegister(email: string, name: string, password: string) {
  return apiFetch<{ id: string; email: string; name: string; avatar_url?: string }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, name, password }),
  });
}

export async function authLogout() {
  return apiFetch('/auth/logout', { method: 'POST' });
}

// ─── Hackathon ──────────────────────────────────────────────

export async function getHackathon(slug?: string) {
  return apiFetch(`/api/v1/hackathons/${slug || hackathonSlug()}`);
}

// ─── Teams ──────────────────────────────────────────────────

export interface Team {
  id: string;
  hackathon_id: string;
  name: string;
  description: string;
  invite_code: string;
  track_id: string | null;
  created_at: string;
  updated_at: string;
  member_count?: number;
}

export interface TeamMember {
  id: string;
  user_id: string;
  role: string;
  joined_at: string;
  name: string;
  email: string;
  avatar_url: string | null;
}

export async function listTeams(slug?: string, limit = 50, offset = 0) {
  const s = slug || hackathonSlug();
  return apiFetch<Team[]>(`/api/v1/hackathons/${s}/teams?limit=${limit}&offset=${offset}`);
}

export async function getTeam(teamId: string, slug?: string) {
  const s = slug || hackathonSlug();
  return apiFetch<Team>(`/api/v1/hackathons/${s}/teams/${teamId}`);
}

export async function getTeamMembers(teamId: string, slug?: string) {
  const s = slug || hackathonSlug();
  return apiFetch<TeamMember[]>(`/api/v1/hackathons/${s}/teams/${teamId}/members`);
}

export async function createTeam(name: string, trackId?: string, slug?: string) {
  const s = slug || hackathonSlug();
  return apiFetch<Team>(`/api/v1/hackathons/${s}/teams`, {
    method: 'POST',
    body: JSON.stringify({ name, track_id: trackId }),
  });
}

export async function joinTeam(inviteCode: string, slug?: string) {
  const s = slug || hackathonSlug();
  return apiFetch<{ joined: boolean; team_id: string }>(`/api/v1/hackathons/${s}/teams/join`, {
    method: 'POST',
    body: JSON.stringify({ invite_code: inviteCode }),
  });
}

export async function updateTeam(teamId: string, data: { name?: string; track_id?: string | null }, slug?: string) {
  const s = slug || hackathonSlug();
  return apiFetch<Team>(`/api/v1/hackathons/${s}/teams/${teamId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function leaveTeam(teamId: string, userId: string, slug?: string) {
  const s = slug || hackathonSlug();
  return apiFetch(`/api/v1/hackathons/${s}/teams/${teamId}/members/${userId}`, {
    method: 'DELETE',
  });
}

// ─── My Team (convenience) ──────────────────────────────────

export async function getMyTeam(slug?: string) {
  const s = slug || hackathonSlug();
  return apiFetch<{ team: Team; members: TeamMember[]; role: string }>(`/api/v1/hackathons/${s}/teams/me`);
}

// ─── Announcements ──────────────────────────────────────────

export interface Announcement {
  id: string;
  hackathon_id: string;
  author_id: string;
  title: string;
  content: string;
  pinned: number;
  created_at: string;
  updated_at: string;
  author_name?: string;
  author_avatar?: string | null;
}

export async function listAnnouncements(slug?: string) {
  const s = slug || hackathonSlug();
  return apiFetch<Announcement[]>(`/api/v1/hackathons/${s}/announcements`);
}

// ─── Submissions ────────────────────────────────────────────

export interface Submission {
  id: string;
  hackathon_id: string;
  team_id: string;
  round_id: string | null;
  title: string;
  description: string;
  repo_url: string;
  demo_url: string;
  video_url: string;
  slide_url: string;
  is_final: number;
  submitted_at: string;
  team_name?: string;
  ai_score?: number | null;
  analysis_json?: string | null;
  ai_review_json?: string | null;
  analysis?: RepoAnalysis;
  ai_review?: AiReview;
}

export async function listSubmissions(slug?: string, teamId?: string) {
  const s = slug || hackathonSlug();
  let path = `/api/v1/hackathons/${s}/submissions`;
  if (teamId) path += `?team_id=${teamId}`;
  return apiFetch<Submission[]>(path);
}

export async function getTeamCurrentSubmission(teamId: string, slug?: string) {
  const s = slug || hackathonSlug();
  return apiFetch<Submission>(`/api/v1/hackathons/${s}/submissions/team/${teamId}/current`);
}

export async function createSubmission(
  data: {
    title: string;
    description: string;
    repo_url: string;
    demo_url?: string;
    video_url?: string;
    slide_url?: string;
    analysis_json?: string;
    ai_review_json?: string;
    ai_score?: number;
  },
  slug?: string
) {
  const s = slug || hackathonSlug();
  return apiFetch<Submission>(`/api/v1/hackathons/${s}/submissions`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export interface AiLeaderboardEntry {
  rank: number;
  team_id: string;
  team_name: string;
  title: string;
  repo_url: string;
  ai_score: number;
  submitted_at: string;
}

export async function getAiLeaderboard(slug?: string) {
  const s = slug || hackathonSlug();
  return apiFetch<AiLeaderboardEntry[]>(`/api/v1/hackathons/${s}/submissions/ai-leaderboard`);
}

export async function getSubmissionDetail(submissionId: string, slug?: string) {
  const s = slug || hackathonSlug();
  return apiFetch<Submission>(`/api/v1/hackathons/${s}/submissions/${submissionId}`);
}

// ─── Rounds ─────────────────────────────────────────────────

export interface Round {
  id: string;
  hackathon_id: string;
  round_number: number;
  name: string;
  type: string;
  status: string;
  is_initialized: number;
  submission_deadline: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export async function listRounds(slug?: string) {
  const s = slug || hackathonSlug();
  return apiFetch<Round[]>(`/api/v1/hackathons/${s}/rounds`);
}

// ─── GitHub Bot ─────────────────────────────────────────────

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  url: string;
  description: string | null;
  language: string | null;
  private: boolean;
  updated_at: string;
  stars: number;
  default_branch: string;
}

export async function fetchGitHubRepos(slug?: string) {
  const s = slug || hackathonSlug();
  return apiFetch<{ github_username: string; repos: GitHubRepo[] }>(`/api/v1/hackathons/${s}/submissions/github/repos`);
}

export interface RepoAnalysis {
  repository: string;
  owner: string;
  description: string | null;
  primary_language: string | null;
  project_type: string;
  detected_frameworks: string[];
  total_files: number;
  entry_files: string[];
  top_extensions: [string, number][];
  dependencies: string[];
  environment_files: string[];
  has_dockerfile: boolean;
  has_ci: boolean;
  has_tests: boolean;
  has_readme: boolean;
  stars: number;
  forks: number;
  open_issues: number;
  created_at: string;
  updated_at: string;
}

export interface AiReview {
  summary: string;
  score: number;
  strengths: string[];
  improvements: string[];
  tech_stack_assessment: string;
  hackathon_readiness: string;
}

export async function analyzeRepo(owner: string, repo: string, slug?: string) {
  const s = slug || hackathonSlug();
  return apiFetch<RepoAnalysis>(`/api/v1/hackathons/${s}/submissions/github/analyze`, {
    method: 'POST',
    body: JSON.stringify({ owner, repo }),
  });
}

export async function getAiReview(analysis: RepoAnalysis, slug?: string) {
  const s = slug || hackathonSlug();
  return apiFetch<{ review: AiReview }>(`/api/v1/hackathons/${s}/submissions/github/ai-review`, {
    method: 'POST',
    body: JSON.stringify({ analysis }),
  });
}

// ─── Types re-export ────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  github_username?: string;
  created_at?: string;
}
