import { useEffect, useRef, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import $ from 'jquery';
import { useConfig } from '@/config';
import { useAuth } from '@/contexts/AuthContext';
import * as api from '@/lib/api';

/* ─── Types ─── */
interface TeamData {
  team: api.Team;
  members: api.TeamMember[];
  role: string;
}

interface SubmissionDraft {
  title: string;
  description: string;
  repo_url: string;
  demo_url: string;
  video_url: string;
  slide_url: string;
}

/* ─── Sidebar Sections ─── */
type Section = 'overview' | 'team' | 'project' | 'schedule' | 'submissions' | 'leaderboard' | 'resources' | 'announcements' | 'support';

const SIDEBAR_ITEMS: { id: Section; label: string; icon: string }[] = [
  { id: 'overview', label: 'Overview', icon: '◆' },
  { id: 'team', label: 'My Team', icon: '◇' },
  { id: 'project', label: 'Project', icon: '❖' },
  { id: 'schedule', label: 'Schedule', icon: '◈' },
  { id: 'submissions', label: 'Submissions', icon: '▣' },
  { id: 'leaderboard', label: 'Leaderboard', icon: '🏆' },
  { id: 'resources', label: 'Resources', icon: '◉' },
  { id: 'announcements', label: 'Announcements', icon: '◎' },
  { id: 'support', label: 'Support', icon: '◐' },
];

const MOCK_RESOURCES = [
  { title: 'Hackathon Rules & Guidelines', icon: '📋', description: 'Read the official rules, judging criteria, and code of conduct.' },
  { title: 'Starter Templates', icon: '🚀', description: 'Quick-start boilerplates for web, mobile, and ML projects.' },
  { title: 'API Documentation', icon: '🔗', description: 'Access sponsor APIs with free credits and documentation.' },
  { title: 'Design Assets', icon: '🎨', description: 'Free icons, illustrations, and UI kits for your project.' },
  { title: 'Deployment Guide', icon: '☁️', description: 'Step-by-step guide to deploy on Vercel, AWS, or Cloudflare.' },
  { title: 'Judging Criteria', icon: '⚖️', description: 'Innovation (25%), Technical (25%), Design (25%), Impact (25%).' },
];

/* ─── Helpers ─── */
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function timeUntil(iso: string) {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return 'Passed';
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  if (days > 0) return `${days}d ${hours}h`;
  const mins = Math.floor((diff % 3600000) / 60000);
  return `${hours}h ${mins}m`;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

/* ─── Component ─── */
export default function DashboardPage() {
  const config = useConfig();
  const { user, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<Section>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // ─── Live data state ───
  const [teamData, setTeamData] = useState<TeamData | null>(null);
  const [teamLoading, setTeamLoading] = useState(true);
  const [announcements, setAnnouncements] = useState<api.Announcement[]>([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(true);
  const [submission, setSubmission] = useState<api.Submission | null>(null);
  const [, setAllTeams] = useState<api.Team[]>([]);
  const [allTeamsTotal, setAllTeamsTotal] = useState(0);
  const [rounds, setRounds] = useState<api.Round[]>([]);
  const [selectedRoundId, setSelectedRoundId] = useState<string | null>(null);

  // Team creation / join
  const [newTeamName, setNewTeamName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [teamActionLoading, setTeamActionLoading] = useState(false);
  const [teamActionError, setTeamActionError] = useState('');

  // Submission form
  const [submissionDraft, setSubmissionDraft] = useState<SubmissionDraft>({
    title: '', description: '', repo_url: '', demo_url: '', video_url: '', slide_url: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Bot state
  const [botActivated, setBotActivated] = useState(false);
  const [githubRepos, setGithubRepos] = useState<api.GitHubRepo[]>([]);
  const [reposLoading, setReposLoading] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState<api.GitHubRepo | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<api.RepoAnalysis | null>(null);
  const [aiReview, setAiReview] = useState<api.AiReview | null>(null);
  const [aiReviewLoading, setAiReviewLoading] = useState(false);
  const [botError, setBotError] = useState('');

  // Leaderboard state
  const [leaderboard, setLeaderboard] = useState<api.AiLeaderboardEntry[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

  // ─── Redirect if not authenticated ───
  useEffect(() => {
    if (!authLoading && !user) navigate('/login');
  }, [authLoading, user, navigate]);

  // ─── Fetch all data from API ───
  const refreshData = useCallback(async () => {
    const slug = config.slug;

    // My team
    setTeamLoading(true);
    try {
      const teamRes = await api.getMyTeam(slug);
      if (teamRes.ok && teamRes.data) {
        setTeamData(teamRes.data);
        try {
          const subRes = await api.getTeamCurrentSubmission(teamRes.data.team.id, slug);
          if (subRes.ok && subRes.data) {
            setSubmission(subRes.data);
            setSubmissionDraft({
              title: subRes.data.title || '',
              description: subRes.data.description || '',
              repo_url: subRes.data.repo_url || '',
              demo_url: subRes.data.demo_url || '',
              video_url: subRes.data.video_url || '',
              slide_url: subRes.data.slide_url || '',
            });
          }
        } catch { /* no submission yet */ }
      } else {
        setTeamData(null);
      }
    } catch {
      setTeamData(null);
    } finally {
      setTeamLoading(false);
    }

    // Announcements
    setAnnouncementsLoading(true);
    try {
      const annRes = await api.listAnnouncements(slug);
      if (annRes.ok && annRes.data) setAnnouncements(annRes.data);
    } catch { /* ignore */ }
    setAnnouncementsLoading(false);

    // All teams
    try {
      const teamsRes = await api.listTeams(slug, 50);
      if (teamsRes.ok && teamsRes.data) {
        setAllTeams(teamsRes.data);
        setAllTeamsTotal((teamsRes.meta as Record<string, unknown>)?.total as number ?? teamsRes.data.length);
      }
    } catch { /* ignore */ }

    // Rounds
    try {
      const roundsRes = await api.listRounds(slug);
      if (roundsRes.ok && roundsRes.data) {
        setRounds(roundsRes.data);
        // Auto-select the first initialized round
        const initializedRound = roundsRes.data.find((r: api.Round) => r.is_initialized);
        if (initializedRound) {
          setSelectedRoundId(initializedRound.id);
        }
      }
    } catch { /* ignore */ }
  }, [config.slug]);

  useEffect(() => {
    if (!authLoading && user) refreshData();
  }, [authLoading, user, refreshData]);

  useEffect(() => {
    if (authLoading || !user) return;
    if (!pageRef.current) return;
    gsap.fromTo(pageRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power2.out' });
  }, [authLoading, user]);

  useEffect(() => {
    if (!contentRef.current) return;
    gsap.fromTo(
      $(contentRef.current).children().toArray(),
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.4, stagger: 0.06, ease: 'power2.out' }
    );
  }, [activeSection]);

  const accent = config.accentColor;

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) return;
    setTeamActionLoading(true);
    setTeamActionError('');
    const res = await api.createTeam(newTeamName.trim(), undefined, config.slug);
    if (res.ok) { setNewTeamName(''); await refreshData(); }
    else setTeamActionError(res.error?.message || 'Failed to create team');
    setTeamActionLoading(false);
  };

  const handleJoinTeam = async () => {
    if (!joinCode.trim()) return;
    setTeamActionLoading(true);
    setTeamActionError('');
    const res = await api.joinTeam(joinCode.trim(), config.slug);
    if (res.ok) { setJoinCode(''); await refreshData(); }
    else setTeamActionError(res.error?.message || 'Invalid invite code');
    setTeamActionLoading(false);
  };

  const handleLeaveTeam = async () => {
    if (!teamData || !user) return;
    setTeamActionLoading(true);
    setTeamActionError('');
    try {
      const res = await api.leaveTeam(teamData.team.id, user.id, config.slug);
      if (res.ok) await refreshData();
      else setTeamActionError(res.error?.message || 'Failed to leave team');
    } catch { setTeamActionError('Network error'); }
    setTeamActionLoading(false);
  };

  const handleSubmit = async () => {
    if (!submissionDraft.title || !submissionDraft.repo_url) {
      setSubmitError('Title and Repository URL are required'); return;
    }
    setSubmitting(true); setSubmitError('');
    const payload: Record<string, unknown> = { ...submissionDraft };
    // Include analysis & AI review data if available
    if (analysisResult) payload.analysis_json = JSON.stringify(analysisResult);
    if (aiReview) {
      payload.ai_review_json = JSON.stringify(aiReview);
      payload.ai_score = aiReview.score;
    }
    const res = await api.createSubmission(payload as Parameters<typeof api.createSubmission>[0], config.slug);
    if (res.ok && res.data) setSubmission(res.data);
    else setSubmitError(res.error?.message || 'Failed to submit');
    setSubmitting(false);
  };

  // ─── Bot handlers ───
  const handleActivateBot = async () => {
    setReposLoading(true); setBotError('');
    try {
      const res = await api.fetchGitHubRepos(config.slug);
      if (res.ok && res.data) {
        setGithubRepos(res.data.repos);
        setBotActivated(true);
      } else {
        setBotError(res.error?.message || 'Failed to fetch repos. Make sure your GitHub username is linked.');
      }
    } catch { setBotError('Network error'); }
    setReposLoading(false);
  };

  const handleSelectRepo = (repo: api.GitHubRepo) => {
    setSelectedRepo(repo);
    setSubmissionDraft(d => ({ ...d, repo_url: repo.url }));
    setAnalysisResult(null);
    setAiReview(null);
  };

  const handleAnalyzeRepo = async () => {
    if (!selectedRepo) return;
    setAnalyzing(true); setBotError('');
    try {
      const [owner] = selectedRepo.full_name.split('/');
      const res = await api.analyzeRepo(owner, selectedRepo.name, config.slug);
      if (res.ok && res.data) {
        setAnalysisResult(res.data);
      } else {
        setBotError(res.error?.message || 'Failed to analyze repository');
      }
    } catch { setBotError('Network error during analysis'); }
    setAnalyzing(false);
  };

  const handleAiReview = async () => {
    if (!analysisResult) return;
    setAiReviewLoading(true); setBotError('');
    try {
      const res = await api.getAiReview(analysisResult, config.slug);
      if (res.ok && res.data) {
        setAiReview(res.data.review);
      } else {
        setBotError(res.error?.message || 'AI review unavailable');
      }
    } catch { setBotError('Network error during AI review'); }
    setAiReviewLoading(false);
  };

  const handleLogout = async () => { await logout(); navigate('/'); };

  if (authLoading || !user) {
    return (<div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center"><div className="w-5 h-5 border border-white/20 border-t-white/60 rounded-full animate-spin" /></div>);
  }

  /* ─── Section Renderers ─── */
  const renderOverview = () => (
    <div ref={contentRef} className="space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight">Welcome back, {user.name}<span style={{ color: accent }}>.</span></h1>
        {teamData && <p className="text-white/40 mt-1 text-sm uppercase tracking-wider">Team {teamData.team.name}</p>}
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Teams', value: `${allTeamsTotal}`, sub: 'in this hackathon' },
          { label: 'Team Members', value: teamData ? `${teamData.members.length}` : '—', sub: `/ ${config.maxTeamSize} max` },
          { label: 'Announcements', value: `${announcements.length}`, sub: 'posted' },
          { label: 'Submission', value: submission ? 'Submitted' : 'Pending', sub: submission ? 'Final' : 'Not yet' },
        ].map((s, i) => (
          <div key={i} className="p-4 bg-white/2 border border-white/6 hover:border-white/10 transition-all">
            <p className="text-[10px] text-white/30 uppercase tracking-[3px] mb-1">{s.label}</p>
            <p className="text-2xl font-black" style={{ color: i === 0 ? accent : 'white' }}>{s.value}</p>
            <p className="text-xs text-white/20 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>
      <div>
        <h3 className="text-xs text-white/30 uppercase tracking-[3px] mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { label: 'Submit Project', icon: '📤', section: 'submissions' as Section },
            { label: 'View Schedule', icon: '📅', section: 'schedule' as Section },
            { label: 'Team Settings', icon: '⚙️', section: 'team' as Section },
            { label: 'Get Help', icon: '💬', section: 'support' as Section },
          ].map((a, i) => (
            <button key={i} onClick={() => { setActiveSection(a.section); setSidebarOpen(false); }} className="p-3 bg-white/2 border border-white/6 hover:bg-white/4 hover:border-white/10 transition-all text-left group">
              <span className="text-lg block mb-1">{a.icon}</span>
              <span className="text-xs text-white/50 group-hover:text-white transition-colors uppercase tracking-wider">{a.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs text-white/30 uppercase tracking-[3px]">Latest Updates</h3>
          <button onClick={() => setActiveSection('announcements')} className="text-xs uppercase tracking-wider hover:text-white transition-colors" style={{ color: accent }}>View All</button>
        </div>
        {announcementsLoading ? <p className="text-xs text-white/20">Loading...</p> : announcements.length === 0 ? <p className="text-xs text-white/20">No announcements yet.</p> : (
          <div className="space-y-2">
            {announcements.slice(0, 3).map(a => (
              <div key={a.id} className="p-3 bg-white/2 border border-white/6 flex items-start gap-3">
                <span className="text-sm mt-0.5">{a.pinned ? '📌' : 'ℹ️'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white/80 truncate">{a.title}</p>
                  <p className="text-xs text-white/30 mt-0.5">{timeAgo(a.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {!teamLoading && !teamData && (
        <div className="p-5 border border-dashed border-yellow-500/30 bg-yellow-500/3">
          <h3 className="text-sm font-bold text-yellow-400 mb-1">No Team Yet</h3>
          <p className="text-xs text-white/40 mb-3">Create or join a team to start hacking!</p>
          <button onClick={() => setActiveSection('team')} className="px-4 py-2 text-xs font-bold uppercase tracking-wider" style={{ background: accent, color: '#000' }}>Go to Teams</button>
        </div>
      )}
    </div>
  );

  const renderTeam = () => (
    <div ref={contentRef} className="space-y-6">
      <div>
        <h2 className="text-3xl font-black uppercase tracking-tight">My Team<span style={{ color: accent }}>.</span></h2>
        {teamData && <p className="text-white/40 text-sm mt-1">{teamData.members.length} of {config.maxTeamSize} members</p>}
      </div>
      {teamLoading ? (
        <div className="p-8 text-center"><div className="w-5 h-5 border border-white/20 border-t-white/60 rounded-full animate-spin mx-auto" /></div>
      ) : teamData ? (
        <>
          <div className="p-5 bg-white/2 border border-white/6">
            <div className="flex items-center justify-between mb-4">
              <div><h3 className="text-lg font-black uppercase">{teamData.team.name}</h3><p className="text-xs text-white/30 uppercase tracking-wider">Role: {teamData.role}</p></div>
              <div className="text-right"><p className="text-[10px] text-white/30 uppercase tracking-wider">Invite Code</p><p className="text-sm font-mono font-bold" style={{ color: accent }}>{teamData.team.invite_code}</p></div>
            </div>
            <p className="text-xs text-white/30">Created: {formatDate(teamData.team.created_at)}</p>
          </div>
          <div>
            <h3 className="text-xs text-white/30 uppercase tracking-[3px] mb-3">Members</h3>
            <div className="space-y-2">
              {teamData.members.map((m) => (
                <div key={m.id} className="flex items-center gap-4 p-4 bg-white/2 border border-white/6 hover:border-white/10 transition-all">
                  <div className="w-9 h-9 rounded-full bg-white/6 flex items-center justify-center text-sm font-bold uppercase" style={m.user_id === user.id ? { background: `${accent}20`, color: accent } : {}}>{m.name.charAt(0)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white/90">{m.name}{m.user_id === user.id && <span className="text-[10px] font-normal px-1.5 py-0.5 ml-1 uppercase tracking-wider" style={{ background: `${accent}20`, color: accent }}>You</span>}</p>
                    <p className="text-xs text-white/30">{m.email}</p>
                  </div>
                  <span className="text-[10px] text-white/40 uppercase tracking-wider px-2 py-1 bg-white/4 border border-white/6">{m.role}</span>
                </div>
              ))}
            </div>
          </div>
          {teamData.members.length < config.maxTeamSize && (
            <div className="p-4 border border-dashed border-white/10 text-center">
              <p className="text-sm text-white/40 mb-2">Share your invite code:</p>
              <p className="text-lg font-mono font-bold mb-3" style={{ color: accent }}>{teamData.team.invite_code}</p>
              <p className="text-xs text-white/20">You can add {config.maxTeamSize - teamData.members.length} more member(s)</p>
            </div>
          )}
          <div>
            <h3 className="text-xs text-white/30 uppercase tracking-[3px] mb-3">Team Settings</h3>
            {teamData.role !== 'leader' && (
              <div className="flex items-center justify-between p-3 bg-white/2 border border-white/6">
                <div><p className="text-sm text-white/70">Leave Team</p><p className="text-xs text-white/30">Leave this team and join another</p></div>
                <button onClick={handleLeaveTeam} disabled={teamActionLoading} className="text-xs uppercase tracking-wider px-3 py-1.5 border border-red-500/30 text-red-400/70 hover:text-red-400 hover:border-red-500/50 transition-all disabled:opacity-40">{teamActionLoading ? 'Leaving...' : 'Leave'}</button>
              </div>
            )}
            {teamActionError && <p className="text-xs text-red-400 mt-2">{teamActionError}</p>}
          </div>
        </>
      ) : (
        <div className="space-y-6">
          <div className="p-6 border border-dashed border-white/10 text-center"><p className="text-sm text-white/50">You're not on a team yet. Create one or join with an invite code.</p></div>
          <div className="p-5 bg-white/2 border border-white/6">
            <h3 className="text-sm font-bold text-white/80 mb-3">Create a Team</h3>
            <div className="flex gap-3">
              <input value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} placeholder="Team name" className="flex-1 px-4 py-2.5 bg-white/3 border border-white/10 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/20" />
              <button onClick={handleCreateTeam} disabled={teamActionLoading || !newTeamName.trim()} className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider disabled:opacity-40" style={{ background: accent, color: '#000' }}>{teamActionLoading ? '...' : 'Create'}</button>
            </div>
          </div>
          <div className="p-5 bg-white/2 border border-white/6">
            <h3 className="text-sm font-bold text-white/80 mb-3">Join with Invite Code</h3>
            <div className="flex gap-3">
              <input value={joinCode} onChange={(e) => setJoinCode(e.target.value)} placeholder="Invite code" className="flex-1 px-4 py-2.5 bg-white/3 border border-white/10 text-sm text-white placeholder-white/20 font-mono focus:outline-none focus:border-white/20" />
              <button onClick={handleJoinTeam} disabled={teamActionLoading || !joinCode.trim()} className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider border border-white/20 text-white/70 hover:text-white disabled:opacity-40">{teamActionLoading ? '...' : 'Join'}</button>
            </div>
          </div>
          {teamActionError && <p className="text-xs text-red-400">{teamActionError}</p>}
        </div>
      )}
    </div>
  );

  const renderProject = () => (
    <div ref={contentRef} className="space-y-6">
      <div><h2 className="text-3xl font-black uppercase tracking-tight">Project<span style={{ color: accent }}>.</span></h2><p className="text-white/40 text-sm mt-1">Manage your hackathon project details</p></div>
      {!teamData ? (
        <div className="p-6 border border-dashed border-white/10 text-center"><p className="text-sm text-white/40">Join a team first to manage your project.</p></div>
      ) : (
        <>
          <div className={`p-5 border ${submission ? 'bg-green-500/3 border-green-500/20' : 'bg-yellow-500/3 border-yellow-500/20'}`}>
            <div className="flex items-center gap-3">
              <span className="text-xl">{submission ? '✅' : '⏳'}</span>
              <div><h3 className="text-lg font-bold">{submission ? submission.title : 'No Submission Yet'}</h3><p className="text-xs text-white/30">{submission ? `Submitted ${formatDate(submission.submitted_at)}` : `Deadline: ${formatDate(config.submissionDeadline)}`}</p></div>
            </div>
          </div>
          {submission && (
            <div className="space-y-3">
              {submission.ai_score != null && (
                <div className="flex items-center gap-3 p-4 bg-purple-500/3 border border-purple-500/20">
                  <span className="text-xl">✨</span>
                  <div className="flex-1">
                    <p className="text-xs text-purple-300/50 uppercase tracking-wider">AI Code Review Score</p>
                    <p className="text-2xl font-black" style={{ color: submission.ai_score >= 70 ? '#4ade80' : submission.ai_score >= 40 ? '#fbbf24' : '#f87171' }}>{submission.ai_score}<span className="text-sm text-white/20">/100</span></p>
                  </div>
                  <button onClick={() => setActiveSection('leaderboard')} className="text-xs font-bold uppercase tracking-wider hover:tracking-[3px] transition-all" style={{ color: accent }}>View Rankings →</button>
                </div>
              )}
              {submission.repo_url && <div className="flex items-center gap-3 p-3 bg-white/2 border border-white/6"><span className="text-sm">📦</span><div className="flex-1"><p className="text-xs text-white/30 uppercase tracking-wider">Repository</p><a href={submission.repo_url} target="_blank" rel="noopener" className="text-sm hover:underline" style={{ color: accent }}>{submission.repo_url}</a></div></div>}
              {submission.demo_url && <div className="flex items-center gap-3 p-3 bg-white/2 border border-white/6"><span className="text-sm">🌐</span><div className="flex-1"><p className="text-xs text-white/30 uppercase tracking-wider">Demo</p><a href={submission.demo_url} target="_blank" rel="noopener" className="text-sm hover:underline" style={{ color: accent }}>{submission.demo_url}</a></div></div>}
              {submission.description && <div className="p-4 bg-white/2 border border-white/6"><p className="text-xs text-white/30 uppercase tracking-wider mb-2">Description</p><p className="text-sm text-white/60 leading-relaxed">{submission.description}</p></div>}
            </div>
          )}
        </>
      )}
    </div>
  );

  const renderSchedule = () => {
    const milestones = [
      { label: 'Registration Opens', date: config.registrationStart },
      { label: 'Hacking Starts', date: config.hackingStart },
      { label: 'Submission Deadline', date: config.submissionDeadline },
    ];
    return (
      <div ref={contentRef} className="space-y-6">
        <div><h2 className="text-3xl font-black uppercase tracking-tight">Schedule<span style={{ color: accent }}>.</span></h2><p className="text-white/40 text-sm mt-1">Key dates and deadlines</p></div>
        <div className="p-5 bg-white/2 border border-white/6 text-center">
          <p className="text-[10px] text-white/30 uppercase tracking-[3px] mb-2">Next Milestone</p>
          <p className="text-sm text-white/50 mb-1">Submission Deadline</p>
          <p className="text-4xl font-black" style={{ color: accent }}>{timeUntil(config.submissionDeadline)}</p>
          <p className="text-xs text-white/20 mt-2">{formatDate(config.submissionDeadline)}</p>
        </div>
        <div>
          <h3 className="text-xs text-white/30 uppercase tracking-[3px] mb-4">Timeline</h3>
          <div className="relative pl-6">
            <div className="absolute left-1.75 top-2 bottom-2 w-px bg-white/6" />
            {milestones.map((ev, i) => {
              const passed = new Date(ev.date).getTime() < Date.now();
              return (
                <div key={i} className="relative pb-6 last:pb-0">
                  <div className="absolute -left-4.75 top-1.5 w-3.5 h-3.5 border-2 border-[#0a0a0a]" style={{ background: passed ? accent : 'rgba(255,255,255,0.1)', borderColor: passed ? accent : 'rgba(255,255,255,0.1)' }} />
                  <div className={`p-4 bg-white/2 border border-white/6 transition-all ${passed ? 'opacity-60' : 'hover:border-white/10'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-bold text-white/80">{ev.label}</h4>
                      <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 ${passed ? 'text-green-400 bg-green-500/10' : 'text-white/30 bg-white/4'}`}>{passed ? 'Done' : timeUntil(ev.date)}</span>
                    </div>
                    <p className="text-xs text-white/30">{formatDate(ev.date)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderSubmissions = () => {
    const initializedRounds = rounds.filter(r => r.is_initialized);
    const hasRounds = rounds.length > 0;
    const submissionsOpen = !hasRounds || initializedRounds.length > 0;
    const activeRound = initializedRounds.find(r => r.id === selectedRoundId) || initializedRounds[0] || null;

    return (
    <div ref={contentRef} className="space-y-6">
      <div><h2 className="text-3xl font-black uppercase tracking-tight">Submissions<span style={{ color: accent }}>.</span></h2><p className="text-white/40 text-sm mt-1">Submit and manage your project</p></div>

      {/* Round selector (if rounds exist) */}
      {hasRounds && (
        <div>
          <h3 className="text-xs text-white/30 uppercase tracking-[3px] mb-3">Rounds</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {rounds.map(r => {
              const isInit = !!r.is_initialized;
              const isSelected = r.id === (activeRound?.id ?? null);
              return (
                <button
                  key={r.id}
                  onClick={() => isInit && setSelectedRoundId(r.id)}
                  disabled={!isInit}
                  className={`p-4 text-left border transition-all ${
                    isSelected
                      ? 'border-2'
                      : isInit
                        ? 'border-white/10 hover:border-white/20 bg-white/2'
                        : 'border-white/6 bg-white/1 opacity-50 cursor-not-allowed'
                  }`}
                  style={isSelected ? { borderColor: accent, background: `${accent}08` } : {}}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-white/80">Round {r.round_number}</span>
                    {isInit ? (
                      <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 font-bold" style={{ background: `${accent}20`, color: accent }}>Open</span>
                    ) : (
                      <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 bg-white/5 text-white/25">Locked</span>
                    )}
                  </div>
                  <p className="text-xs text-white/40 truncate">{r.name}</p>
                  {r.submission_deadline && (
                    <p className="text-[10px] text-white/20 mt-1">Deadline: {formatDate(r.submission_deadline)}</p>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {!teamData ? (
        <div className="p-6 border border-dashed border-white/10 text-center"><p className="text-sm text-white/40">Join a team first to submit a project.</p></div>
      ) : !submissionsOpen ? (
        <div className="p-6 border border-dashed border-yellow-500/20 bg-yellow-500/3 text-center">
          <span className="text-2xl block mb-2">🔒</span>
          <h3 className="text-sm font-bold text-yellow-400 mb-1">Submissions Not Open Yet</h3>
          <p className="text-xs text-white/40">No rounds have been initialized by the admin. Submissions will open once a round is activated.</p>
        </div>
      ) : (
        <>
          {activeRound && (
            <div className="p-4 border bg-white/2 border-white/10">
              <p className="text-[10px] text-white/30 uppercase tracking-[3px] mb-1">Submitting for</p>
              <p className="text-sm font-bold text-white/80">Round {activeRound.round_number}: {activeRound.name}</p>
              {activeRound.submission_deadline && (
                <p className="text-xs text-white/30 mt-1">Deadline: {formatDate(activeRound.submission_deadline)} ({timeUntil(activeRound.submission_deadline)} remaining)</p>
              )}
            </div>
          )}
          <div className={`p-5 border ${submission ? 'bg-green-500/3 border-green-500/20' : 'bg-yellow-500/3 border-yellow-500/20'}`}>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xl">{submission ? '✅' : '⏳'}</span>
              <div><h3 className="text-lg font-bold">{submission ? 'Project Submitted' : 'Not Yet Submitted'}</h3><p className="text-xs text-white/30">Deadline: {formatDate(config.submissionDeadline)} ({timeUntil(config.submissionDeadline)} remaining)</p></div>
            </div>
          </div>

          {/* ─── DevSage Bot Section ─── */}
          <div className="border border-white/8 bg-white/[0.02]">
            <div className="p-4 border-b border-white/6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl">🤖</span>
                <div>
                  <h3 className="text-sm font-bold text-white/80 uppercase tracking-wider">DevSage Bot</h3>
                  <p className="text-[10px] text-white/30">AI-powered repo analysis &amp; review</p>
                </div>
              </div>
              {user.github_username && (
                <span className="text-[10px] text-white/30 bg-white/5 px-2 py-1 font-mono">@{user.github_username}</span>
              )}
            </div>
            <div className="p-4 space-y-4">
              {botError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center gap-2">
                  <span>⚠️</span>{botError}
                  <button onClick={() => setBotError('')} className="ml-auto text-red-400/60 hover:text-red-400">✕</button>
                </div>
              )}

              {!botActivated ? (
                <div className="text-center py-6">
                  <span className="text-4xl block mb-3">🔌</span>
                  <h4 className="text-sm font-bold text-white/70 mb-1">Activate Bot to Scan Repos</h4>
                  <p className="text-xs text-white/30 mb-4 max-w-xs mx-auto">Connect to your GitHub and let the bot find your repositories automatically.</p>
                  <button
                    onClick={handleActivateBot}
                    disabled={reposLoading}
                    className="px-5 py-2.5 text-xs font-black uppercase tracking-[3px] transition-all hover:tracking-[5px] disabled:opacity-40"
                    style={{ background: accent, color: '#000' }}
                  >
                    {reposLoading ? (
                      <span className="flex items-center gap-2"><span className="w-3 h-3 border border-black/30 border-t-black/80 rounded-full animate-spin" />Scanning...</span>
                    ) : 'Activate Bot'}
                  </button>
                </div>
              ) : (
                <>
                  {/* Repo List */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-[10px] text-white/30 uppercase tracking-[3px]">Your Repositories ({githubRepos.length})</h4>
                      <button onClick={handleActivateBot} disabled={reposLoading} className="text-[10px] uppercase tracking-wider hover:text-white/60 transition-colors" style={{ color: accent }}>
                        {reposLoading ? 'Refreshing...' : 'Refresh'}
                      </button>
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
                      {githubRepos.map(r => (
                        <button
                          key={r.id}
                          onClick={() => handleSelectRepo(r)}
                          className={`w-full text-left p-3 border transition-all ${
                            selectedRepo?.id === r.id
                              ? 'border-2 bg-white/[0.04]'
                              : 'border-white/6 bg-white/[0.02] hover:border-white/12 hover:bg-white/[0.03]'
                          }`}
                          style={selectedRepo?.id === r.id ? { borderColor: accent, background: `${accent}08` } : {}}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-xs">📦</span>
                              <span className="text-sm font-bold text-white/80 truncate">{r.name}</span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {r.language && (
                                <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 bg-white/5 text-white/40">{r.language}</span>
                              )}
                              {r.stars > 0 && (
                                <span className="text-[10px] text-white/30">⭐{r.stars}</span>
                              )}
                            </div>
                          </div>
                          {r.description && (
                            <p className="text-[11px] text-white/30 mt-1 truncate pl-5">{r.description}</p>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Selected Repo Actions */}
                  {selectedRepo && (
                    <div className="p-3 bg-white/[0.03] border border-white/8">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-[10px] text-white/30 uppercase tracking-[3px]">Selected</p>
                          <p className="text-sm font-bold text-white/80">{selectedRepo.full_name}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={handleAnalyzeRepo}
                            disabled={analyzing}
                            className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-[2px] border border-white/10 hover:border-white/20 text-white/70 hover:text-white transition-all disabled:opacity-40"
                          >
                            {analyzing ? (
                              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 border border-white/30 border-t-white/70 rounded-full animate-spin" />Analyzing...</span>
                            ) : '🔍 Analyze'}
                          </button>
                        </div>
                      </div>
                      <p className="text-[10px] text-green-400/60">✓ Repository URL auto-filled in submission form</p>
                    </div>
                  )}

                  {/* Analysis Results */}
                  {analysisResult && (
                    <div className="border border-white/8 bg-white/[0.02]">
                      <div className="p-3 border-b border-white/6 flex items-center justify-between">
                        <h4 className="text-[10px] text-white/30 uppercase tracking-[3px]">Analysis Results</h4>
                        <button
                          onClick={handleAiReview}
                          disabled={aiReviewLoading}
                          className="px-3 py-1 text-[10px] font-bold uppercase tracking-[2px] transition-all disabled:opacity-40"
                          style={{ background: `${accent}20`, color: accent }}
                        >
                          {aiReviewLoading ? (
                            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 border border-current/30 border-t-current rounded-full animate-spin" />Reviewing...</span>
                          ) : '✨ AI Review'}
                        </button>
                      </div>
                      <div className="p-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                        <div className="p-2 bg-white/[0.03] border border-white/6">
                          <p className="text-[9px] text-white/25 uppercase tracking-wider">Type</p>
                          <p className="text-sm font-bold text-white/70">{analysisResult.project_type}</p>
                        </div>
                        <div className="p-2 bg-white/[0.03] border border-white/6">
                          <p className="text-[9px] text-white/25 uppercase tracking-wider">Language</p>
                          <p className="text-sm font-bold text-white/70">{analysisResult.primary_language || '—'}</p>
                        </div>
                        <div className="p-2 bg-white/[0.03] border border-white/6">
                          <p className="text-[9px] text-white/25 uppercase tracking-wider">Files</p>
                          <p className="text-sm font-bold text-white/70">{analysisResult.total_files}</p>
                        </div>
                        <div className="p-2 bg-white/[0.03] border border-white/6">
                          <p className="text-[9px] text-white/25 uppercase tracking-wider">Tests</p>
                          <p className="text-sm font-bold" style={{ color: analysisResult.has_tests ? '#4ade80' : '#f87171' }}>{analysisResult.has_tests ? '✓ Yes' : '✗ No'}</p>
                        </div>
                        <div className="p-2 bg-white/[0.03] border border-white/6">
                          <p className="text-[9px] text-white/25 uppercase tracking-wider">CI/CD</p>
                          <p className="text-sm font-bold" style={{ color: analysisResult.has_ci ? '#4ade80' : '#f87171' }}>{analysisResult.has_ci ? '✓ Yes' : '✗ No'}</p>
                        </div>
                        <div className="p-2 bg-white/[0.03] border border-white/6">
                          <p className="text-[9px] text-white/25 uppercase tracking-wider">Docker</p>
                          <p className="text-sm font-bold" style={{ color: analysisResult.has_dockerfile ? '#4ade80' : '#f87171' }}>{analysisResult.has_dockerfile ? '✓ Yes' : '✗ No'}</p>
                        </div>
                      </div>
                      {analysisResult.detected_frameworks.length > 0 && (
                        <div className="px-3 pb-2">
                          <p className="text-[9px] text-white/25 uppercase tracking-wider mb-1">Frameworks</p>
                          <div className="flex flex-wrap gap-1">
                            {analysisResult.detected_frameworks.map(f => (
                              <span key={f} className="text-[10px] px-2 py-0.5 font-bold" style={{ background: `${accent}15`, color: accent }}>{f}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {analysisResult.dependencies.length > 0 && (
                        <div className="px-3 pb-3">
                          <p className="text-[9px] text-white/25 uppercase tracking-wider mb-1">Dependencies ({analysisResult.dependencies.length})</p>
                          <div className="flex flex-wrap gap-1">
                            {analysisResult.dependencies.slice(0, 15).map(d => (
                              <span key={d} className="text-[10px] px-1.5 py-0.5 bg-white/5 text-white/40 font-mono">{d}</span>
                            ))}
                            {analysisResult.dependencies.length > 15 && (
                              <span className="text-[10px] text-white/20">+{analysisResult.dependencies.length - 15} more</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* AI Review Results */}
                  {aiReview && (
                    <div className="border border-purple-500/20 bg-purple-500/[0.03]">
                      <div className="p-3 border-b border-purple-500/15 flex items-center gap-2">
                        <span className="text-sm">✨</span>
                        <h4 className="text-[10px] uppercase tracking-[3px] text-purple-300/70 font-bold">Gemini AI Review</h4>
                        <span className="ml-auto text-lg font-black" style={{ color: aiReview.score >= 70 ? '#4ade80' : aiReview.score >= 40 ? '#fbbf24' : '#f87171' }}>{aiReview.score}<span className="text-xs text-white/20">/100</span></span>
                      </div>
                      <div className="p-3 space-y-3">
                        <p className="text-sm text-white/60 leading-relaxed">{aiReview.summary}</p>
                        <div className="grid gap-2 sm:grid-cols-2">
                          <div>
                            <p className="text-[9px] text-green-400/60 uppercase tracking-wider mb-1">💪 Strengths</p>
                            <ul className="space-y-1">
                              {aiReview.strengths.map((s, i) => (
                                <li key={i} className="text-[11px] text-white/50 flex gap-1.5"><span className="text-green-400/40 shrink-0">▸</span>{s}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="text-[9px] text-yellow-400/60 uppercase tracking-wider mb-1">🔧 Improvements</p>
                            <ul className="space-y-1">
                              {aiReview.improvements.map((s, i) => (
                                <li key={i} className="text-[11px] text-white/50 flex gap-1.5"><span className="text-yellow-400/40 shrink-0">▸</span>{s}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        {aiReview.tech_stack_assessment && (
                          <div className="p-2 bg-white/[0.03] border border-white/6">
                            <p className="text-[9px] text-white/25 uppercase tracking-wider mb-0.5">Tech Stack</p>
                            <p className="text-[11px] text-white/50">{aiReview.tech_stack_assessment}</p>
                          </div>
                        )}
                        {aiReview.hackathon_readiness && (
                          <div className="p-2 bg-white/[0.03] border border-white/6">
                            <p className="text-[9px] text-white/25 uppercase tracking-wider mb-0.5">Hackathon Readiness</p>
                            <p className="text-[11px] text-white/50">{aiReview.hackathon_readiness}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          <div>
            <h3 className="text-xs text-white/30 uppercase tracking-[3px] mb-3">Submission Details</h3>
            <div className="space-y-4">
              <div><label className="block text-xs text-white/30 mb-2 uppercase tracking-[3px]">Project Name *</label><input type="text" value={submissionDraft.title} onChange={(e) => setSubmissionDraft(d => ({ ...d, title: e.target.value }))} className="w-full px-0 py-3 bg-transparent border-0 border-b border-white/10 text-white text-base placeholder-white/15 focus:outline-none focus:border-b-2 transition-all" style={{ borderBottomColor: submissionDraft.title ? accent : undefined }} placeholder="My Awesome Project" /></div>
              <div><label className="block text-xs text-white/30 mb-2 uppercase tracking-[3px]">Repository URL *</label><input type="url" value={submissionDraft.repo_url} onChange={(e) => setSubmissionDraft(d => ({ ...d, repo_url: e.target.value }))} className="w-full px-0 py-3 bg-transparent border-0 border-b border-white/10 text-white text-base placeholder-white/15 focus:outline-none focus:border-b-2 transition-all" placeholder="https://github.com/..." /></div>
              <div><label className="block text-xs text-white/30 mb-2 uppercase tracking-[3px]">Demo URL</label><input type="url" value={submissionDraft.demo_url} onChange={(e) => setSubmissionDraft(d => ({ ...d, demo_url: e.target.value }))} className="w-full px-0 py-3 bg-transparent border-0 border-b border-white/10 text-white text-base placeholder-white/15 focus:outline-none focus:border-b-2 transition-all" placeholder="https://your-demo.vercel.app" /></div>
              <div><label className="block text-xs text-white/30 mb-2 uppercase tracking-[3px]">Demo Video URL</label><input type="url" value={submissionDraft.video_url} onChange={(e) => setSubmissionDraft(d => ({ ...d, video_url: e.target.value }))} className="w-full px-0 py-3 bg-transparent border-0 border-b border-white/10 text-white text-base placeholder-white/15 focus:outline-none focus:border-b-2 transition-all" placeholder="https://youtube.com/watch?v=..." /></div>
              <div><label className="block text-xs text-white/30 mb-2 uppercase tracking-[3px]">Project Description</label><textarea value={submissionDraft.description} onChange={(e) => setSubmissionDraft(d => ({ ...d, description: e.target.value }))} className="w-full h-28 px-0 py-3 bg-transparent border-0 border-b border-white/10 text-white text-base placeholder-white/15 focus:outline-none focus:border-b-2 transition-all resize-none" placeholder="What does your project do?" /></div>
            </div>
            {submitError && <p className="text-xs text-red-400 mt-3">{submitError}</p>}
            <div className="flex items-center gap-3 mt-6">
              <button onClick={handleSubmit} disabled={submitting} className="px-6 py-3 text-sm font-black uppercase tracking-[3px] transition-all hover:tracking-[5px] disabled:opacity-40" style={{ background: accent, color: '#000' }}>{submitting ? 'Submitting...' : submission ? 'Update Submission' : 'Submit Project'}</button>
            </div>
          </div>
        </>
      )}
    </div>
    );
  };

  const renderResources = () => (
    <div ref={contentRef} className="space-y-6">
      <div><h2 className="text-3xl font-black uppercase tracking-tight">Resources<span style={{ color: accent }}>.</span></h2><p className="text-white/40 text-sm mt-1">Tools, guides, and assets</p></div>
      <div className="grid gap-3 md:grid-cols-2">
        {MOCK_RESOURCES.map((r, i) => (
          <div key={i} className="group p-5 bg-white/2 border border-white/6 hover:border-white/10 transition-all cursor-pointer">
            <div className="flex items-start gap-3"><span className="text-2xl">{r.icon}</span><div><h4 className="text-sm font-bold text-white/80 group-hover:text-white transition-colors">{r.title}</h4><p className="text-xs text-white/30 mt-1 leading-relaxed">{r.description}</p></div></div>
          </div>
        ))}
      </div>
      <div>
        <h3 className="text-xs text-white/30 uppercase tracking-[3px] mb-3">FAQ</h3>
        <div className="space-y-2">
          {[
            { q: 'Can I change my team after registration?', a: 'Yes, you can leave and join another team before hacking starts.' },
            { q: 'What are the judging criteria?', a: 'Innovation, Technical Complexity, Design/UX, Impact — each 25%.' },
            { q: 'Can I use pre-existing code?', a: 'Open-source libs OK, but core project must be built during the hackathon.' },
            { q: 'Is there a minimum team size?', a: `Solo or up to ${config.maxTeamSize} members.` },
          ].map((faq, i) => (
            <details key={i} className="group p-3 bg-white/2 border border-white/6">
              <summary className="text-sm font-medium text-white/70 cursor-pointer list-none flex items-center justify-between">{faq.q}<span className="text-white/20 group-open:rotate-45 transition-transform text-lg">+</span></summary>
              <p className="text-sm text-white/40 mt-2 leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAnnouncements = () => (
    <div ref={contentRef} className="space-y-6">
      <div><h2 className="text-3xl font-black uppercase tracking-tight">Announcements<span style={{ color: accent }}>.</span></h2><p className="text-white/40 text-sm mt-1">Stay updated with the latest news</p></div>
      {announcementsLoading ? (
        <div className="p-8 text-center"><div className="w-5 h-5 border border-white/20 border-t-white/60 rounded-full animate-spin mx-auto" /></div>
      ) : announcements.length === 0 ? (
        <div className="p-6 border border-dashed border-white/10 text-center"><p className="text-sm text-white/40">No announcements yet.</p></div>
      ) : (
        <div className="space-y-3">
          {announcements.map(a => (
            <div key={a.id} className="p-5 bg-white/2 border border-white/6 hover:border-white/10 transition-all">
              <div className="flex items-start gap-3">
                <span className="text-xl mt-0.5">{a.pinned ? '📌' : 'ℹ️'}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1"><h4 className="text-base font-bold text-white/90">{a.title}</h4><span className="text-xs text-white/20">{timeAgo(a.created_at)}</span></div>
                  <p className="text-sm text-white/40 leading-relaxed">{a.content}</p>
                  {a.author_name && <p className="text-xs text-white/20 mt-2">— {a.author_name}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderLeaderboard = () => {
    // Fetch leaderboard on first render of this section
    if (!leaderboardLoading && leaderboard.length === 0) {
      setLeaderboardLoading(true);
      api.getAiLeaderboard(config.slug).then(res => {
        if (res.ok && res.data) setLeaderboard(res.data as api.AiLeaderboardEntry[]);
        setLeaderboardLoading(false);
      }).catch(() => setLeaderboardLoading(false));
    }

    const rankBadge = (rank: number) => {
      if (rank === 1) return <span className="text-lg">🥇</span>;
      if (rank === 2) return <span className="text-lg">🥈</span>;
      if (rank === 3) return <span className="text-lg">🥉</span>;
      return <span className="text-sm font-black text-white/30">#{rank}</span>;
    };

    const scoreColor = (score: number) => score >= 70 ? '#4ade80' : score >= 40 ? '#fbbf24' : '#f87171';

    return (
      <div ref={contentRef} className="space-y-6">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tight">Leaderboard<span style={{ color: accent }}>.</span></h2>
          <p className="text-white/40 text-sm mt-1">AI code review rankings — powered by Gemini</p>
        </div>

        {/* My team's position */}
        {submission?.ai_score != null && (
          <div className="p-5 border border-white/10 bg-white/3" style={{ borderColor: `${accent}30` }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-white/25 uppercase tracking-[3px] mb-1">Your Team Score</p>
                <p className="text-sm text-white/60">{teamData?.team.name || 'Your Team'}</p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-black" style={{ color: scoreColor(submission.ai_score) }}>{submission.ai_score}<span className="text-sm text-white/20">/100</span></p>
                <p className="text-[10px] text-white/25 uppercase tracking-wider mt-1">
                  Rank #{leaderboard.findIndex(e => e.team_id === teamData?.team.id) + 1 || '—'}
                </p>
              </div>
            </div>
          </div>
        )}

        {leaderboardLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-white/3 animate-pulse" />
            ))}
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-white/10">
            <p className="text-3xl mb-3">🏆</p>
            <p className="text-sm text-white/40">No scores yet</p>
            <p className="text-xs text-white/20 mt-1">Submit a project with AI review to appear on the leaderboard</p>
          </div>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((entry) => (
              <div
                key={entry.team_id}
                className={`flex items-center gap-4 p-4 border transition-all hover:border-white/15 ${
                  entry.team_id === teamData?.team.id ? 'bg-white/5 border-white/15' : 'bg-white/2 border-white/6'
                } ${entry.rank <= 3 ? 'border-l-2' : ''}`}
                style={entry.rank <= 3 ? { borderLeftColor: accent } : {}}
              >
                <div className="w-10 text-center">{rankBadge(entry.rank)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white/80 truncate">
                    {entry.team_name}
                    {entry.team_id === teamData?.team.id && (
                      <span className="ml-2 text-[9px] px-1.5 py-0.5 uppercase tracking-wider font-bold" style={{ background: `${accent}20`, color: accent }}>You</span>
                    )}
                  </p>
                  <p className="text-xs text-white/25 truncate">{entry.title}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xl font-black" style={{ color: scoreColor(entry.ai_score) }}>{entry.ai_score}</p>
                  <p className="text-[9px] text-white/20 uppercase tracking-wider">score</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderSupport = () => (
    <div ref={contentRef} className="space-y-6">
      <div><h2 className="text-3xl font-black uppercase tracking-tight">Support<span style={{ color: accent }}>.</span></h2><p className="text-white/40 text-sm mt-1">Get help when you need it</p></div>
      <div className="grid gap-3 md:grid-cols-2">
        {[
          { icon: '💬', title: 'Discord Community', desc: 'Real-time help and networking.', cta: 'Open Discord' },
          { icon: '🧑‍🏫', title: 'Request Mentor', desc: '1-on-1 with an industry expert.', cta: 'Find Mentor' },
          { icon: '🐛', title: 'Report a Bug', desc: 'Found a platform issue? Let us know.', cta: 'Report' },
          { icon: '📧', title: 'Email Support', desc: 'Reach the organizing team directly.', cta: 'Send Email' },
        ].map((s, i) => (
          <div key={i} className="p-5 bg-white/2 border border-white/6 hover:border-white/10 transition-all">
            <span className="text-2xl block mb-3">{s.icon}</span>
            <h4 className="text-sm font-bold text-white/80 mb-1">{s.title}</h4>
            <p className="text-xs text-white/30 mb-4 leading-relaxed">{s.desc}</p>
            <button className="text-xs font-bold uppercase tracking-wider transition-all hover:tracking-[3px]" style={{ color: accent }}>{s.cta} →</button>
          </div>
        ))}
      </div>
    </div>
  );

  const sectionRenderers: Record<Section, () => JSX.Element> = {
    overview: renderOverview, team: renderTeam, project: renderProject, schedule: renderSchedule,
    submissions: renderSubmissions, leaderboard: renderLeaderboard, resources: renderResources, announcements: renderAnnouncements, support: renderSupport,
  };

  return (
    <div ref={pageRef} className="min-h-screen bg-[#0a0a0a] text-white flex">
      {/* Sidebar (desktop) */}
      <aside className="hidden lg:flex flex-col w-65 min-h-screen border-r border-white/6 bg-[#0a0a0a] fixed left-0 top-0 bottom-0 z-50">
        <div className="p-5 border-b border-white/6">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 flex items-center justify-center text-base font-black" style={{ background: accent, color: '#000' }}>{config.title.charAt(0)}</div>
            <div><p className="text-sm font-bold uppercase tracking-wider text-white/80 group-hover:text-white transition-colors">{config.title}</p><p className="text-[10px] text-white/20 uppercase tracking-wider">Dashboard</p></div>
          </Link>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
          {SIDEBAR_ITEMS.map(item => (
            <button key={item.id} onClick={() => setActiveSection(item.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm transition-all ${activeSection === item.id ? 'text-white font-bold' : 'text-white/40 hover:text-white/70 hover:bg-white/2'}`} style={activeSection === item.id ? { background: `${accent}10`, borderLeft: `2px solid ${accent}` } : { borderLeft: '2px solid transparent' }}>
              <span className="text-xs w-5 text-center" style={activeSection === item.id ? { color: accent } : {}}>{item.icon}</span>
              <span className="uppercase tracking-wider text-xs">{item.label}</span>
              {item.id === 'announcements' && announcements.length > 0 && <span className="ml-auto text-[10px] px-1.5 py-0.5 font-bold" style={{ background: accent, color: '#000' }}>{announcements.length}</span>}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-white/6 flex items-center justify-center text-sm font-bold" style={{ color: accent }}>{user.name.charAt(0).toUpperCase()}</div>
            <div className="flex-1 min-w-0"><p className="text-xs font-bold text-white/70 truncate">{user.name}</p><p className="text-[10px] text-white/30 truncate">{user.email}</p></div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-xs text-white/30 hover:text-white/60 transition-colors uppercase tracking-wider">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-lg border-b border-white/6">
        <div className="flex items-center justify-between px-4 h-14">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 flex items-center justify-center text-xs font-black" style={{ background: accent, color: '#000' }}>{config.title.charAt(0)}</div>
            <span className="text-sm font-bold uppercase tracking-wider">{config.title}</span>
          </Link>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2">
            <div className="space-y-1.5">
              <span className={`block w-5 h-0.5 bg-white transition-all ${sidebarOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block w-5 h-0.5 bg-white transition-all ${sidebarOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-5 h-0.5 bg-white transition-all ${sidebarOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </div>
          </button>
        </div>
        <div className={`overflow-hidden transition-all duration-300 ${sidebarOpen ? 'max-h-125 border-b border-white/6' : 'max-h-0'}`}>
          <nav className="p-3 space-y-0.5">
            {SIDEBAR_ITEMS.map(item => (
              <button key={item.id} onClick={() => { setActiveSection(item.id); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm transition-all ${activeSection === item.id ? 'text-white font-bold' : 'text-white/40'}`} style={activeSection === item.id ? { background: `${accent}10` } : {}}>
                <span className="text-xs w-5 text-center">{item.icon}</span>
                <span className="uppercase tracking-wider text-xs">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 lg:ml-65 pt-14 lg:pt-0">
        <div className="sticky top-0 z-40 bg-[#0a0a0a]/90 backdrop-blur-lg border-b border-white/6 hidden lg:block">
          <div className="flex items-center justify-between px-8 h-14">
            <div className="flex items-center gap-2 text-xs text-white/30 uppercase tracking-wider">
              <Link to="/" className="hover:text-white/60 transition-colors">Home</Link><span>/</span>
              <span className="text-white/60">{SIDEBAR_ITEMS.find(s => s.id === activeSection)?.label}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-white/20 uppercase tracking-wider">{timeUntil(config.submissionDeadline)} until deadline</span>
              <div className="w-px h-4 bg-white/10" />
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-white/6 flex items-center justify-center text-xs font-bold" style={{ color: accent }}>{user.name.charAt(0).toUpperCase()}</div>
                <span className="text-xs text-white/50">{user.name}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="p-6 lg:p-8 max-w-4xl">
          {sectionRenderers[activeSection]()}
        </div>
      </main>
    </div>
  );
}
