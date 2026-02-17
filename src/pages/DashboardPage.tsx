import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import $ from 'jquery';
import { config } from '@/config';

/* ─── Mock Data (replace with API later) ─── */
const MOCK_TEAM = {
  name: 'Team Quantum',
  id: 'TQ-2026-0042',
  rank: 12,
  totalTeams: 87,
  score: 842,
  maxScore: 1000,
  formed: '2026-02-10T10:30:00Z',
  members: [
    { name: 'You', email: 'you@example.com', role: 'Team Lead', avatar: '🧑‍💻', online: true },
    { name: 'Alice Chen', email: 'alice@example.com', role: 'Frontend Dev', avatar: '👩‍💻', online: true },
    { name: 'Bob Martinez', email: 'bob@example.com', role: 'Backend Dev', avatar: '👨‍💻', online: false },
    { name: 'Diana Park', email: 'diana@example.com', role: 'Designer', avatar: '🎨', online: false },
  ],
  project: {
    name: 'QuantumSync',
    description: 'Real-time collaborative quantum computing simulator for education.',
    repoUrl: 'https://github.com/team-quantum/quantumsync',
    demoUrl: '',
    techStack: ['React', 'TypeScript', 'Python', 'WebSocket'],
    track: 'Education & Innovation',
    submitted: false,
  },
};

const MOCK_ANNOUNCEMENTS = [
  { id: 1, title: 'Mentoring sessions open!', body: 'Sign up for 1-on-1 mentoring with industry experts.', time: '2 hours ago', type: 'info' as const },
  { id: 2, title: 'API workshop today at 3PM', body: 'Learn how to integrate sponsor APIs into your project.', time: '5 hours ago', type: 'event' as const },
  { id: 3, title: 'Submission deadline reminder', body: 'Submissions close on March 17th at midnight UTC.', time: '1 day ago', type: 'warning' as const },
];

const MOCK_CHECKLIST = [
  { id: 1, label: 'Form your team', done: true },
  { id: 2, label: 'Join the Discord server', done: true },
  { id: 3, label: 'Choose your track', done: true },
  { id: 4, label: 'Set up project repository', done: true },
  { id: 5, label: 'Submit project description', done: false },
  { id: 6, label: 'Attend opening ceremony', done: false },
  { id: 7, label: 'Build your MVP', done: false },
  { id: 8, label: 'Record demo video', done: false },
  { id: 9, label: 'Submit final project', done: false },
];

const MOCK_SCHEDULE = [
  { label: 'Registration Opens', date: config.registrationStart, status: 'completed' as const },
  { label: 'Hacking Starts', date: config.hackingStart, status: 'upcoming' as const },
  { label: 'Mid-Hackathon Check-in', date: '2026-03-16T12:00:00Z', status: 'upcoming' as const },
  { label: 'Submission Deadline', date: config.submissionDeadline, status: 'upcoming' as const },
  { label: 'Judging & Results', date: '2026-03-18T18:00:00Z', status: 'upcoming' as const },
];

const MOCK_RESOURCES = [
  { title: 'Hackathon Rules & Guidelines', icon: '📋', description: 'Read the official rules, judging criteria, and code of conduct.' },
  { title: 'Starter Templates', icon: '🚀', description: 'Quick-start boilerplates for web, mobile, and ML projects.' },
  { title: 'API Documentation', icon: '🔗', description: 'Access sponsor APIs with free credits and documentation.' },
  { title: 'Design Assets', icon: '🎨', description: 'Free icons, illustrations, and UI kits for your project.' },
  { title: 'Deployment Guide', icon: '☁️', description: 'Step-by-step guide to deploy on Vercel, AWS, or Cloudflare.' },
  { title: 'Judging Criteria', icon: '⚖️', description: 'Innovation (25%), Technical (25%), Design (25%), Impact (25%).' },
];

/* ─── Sidebar Sections ─── */
type Section = 'overview' | 'team' | 'project' | 'schedule' | 'submissions' | 'resources' | 'announcements' | 'support';

const SIDEBAR_ITEMS: { id: Section; label: string; icon: string }[] = [
  { id: 'overview', label: 'Overview', icon: '◆' },
  { id: 'team', label: 'My Team', icon: '◇' },
  { id: 'project', label: 'Project', icon: '❖' },
  { id: 'schedule', label: 'Schedule', icon: '◈' },
  { id: 'submissions', label: 'Submissions', icon: '▣' },
  { id: 'resources', label: 'Resources', icon: '◉' },
  { id: 'announcements', label: 'Announcements', icon: '◎' },
  { id: 'support', label: 'Support', icon: '◐' },
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

/* ─── Component ─── */
export default function DashboardPage() {
  const [activeSection, setActiveSection] = useState<Section>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [checklist, setChecklist] = useState(MOCK_CHECKLIST);
  const pageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const accent = config.accentColor;
  const team = MOCK_TEAM;
  const completedTasks = checklist.filter(c => c.done).length;
  const progressPct = Math.round((completedTasks / checklist.length) * 100);

  useEffect(() => {
    if (!pageRef.current) return;
    gsap.fromTo(pageRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power2.out' });
  }, []);

  // Animate content sections on change
  useEffect(() => {
    if (!contentRef.current) return;
    gsap.fromTo(
      $(contentRef.current).children().toArray(),
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.4, stagger: 0.06, ease: 'power2.out' }
    );
  }, [activeSection]);

  const toggleChecklist = (id: number) => {
    setChecklist(prev => prev.map(c => c.id === id ? { ...c, done: !c.done } : c));
  };

  /* ─── Section Renderers ─── */

  const renderOverview = () => (
    <div ref={contentRef} className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight">
          Welcome back<span style={{ color: accent }}>.</span>
        </h1>
        <p className="text-white/40 mt-1 text-sm uppercase tracking-wider">Team {team.name} — {team.id}</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Your Rank', value: `#${team.rank}`, sub: `of ${team.totalTeams} teams` },
          { label: 'Team Score', value: `${team.score}`, sub: `/ ${team.maxScore} pts` },
          { label: 'Members', value: `${team.members.length}`, sub: `/ ${config.maxTeamSize} max` },
          { label: 'Progress', value: `${progressPct}%`, sub: `${completedTasks}/${checklist.length} tasks` },
        ].map((s, i) => (
          <div key={i} className="p-4 bg-white/[0.02] border border-white/[0.06] hover:border-white/10 transition-all group">
            <p className="text-[10px] text-white/30 uppercase tracking-[3px] mb-1">{s.label}</p>
            <p className="text-2xl font-black" style={{ color: i === 0 ? accent : 'white' }}>{s.value}</p>
            <p className="text-xs text-white/20 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-white/30 uppercase tracking-[3px]">Hackathon Progress</span>
          <span className="text-xs font-bold" style={{ color: accent }}>{progressPct}%</span>
        </div>
        <div className="w-full h-1.5 bg-white/[0.04] overflow-hidden">
          <div className="h-full transition-all duration-700" style={{ width: `${progressPct}%`, background: accent }} />
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-xs text-white/30 uppercase tracking-[3px] mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { label: 'Submit Project', icon: '📤', section: 'submissions' as Section },
            { label: 'View Schedule', icon: '📅', section: 'schedule' as Section },
            { label: 'Team Settings', icon: '⚙️', section: 'team' as Section },
            { label: 'Get Help', icon: '💬', section: 'support' as Section },
          ].map((a, i) => (
            <button
              key={i}
              onClick={() => { setActiveSection(a.section); setSidebarOpen(false); }}
              className="p-3 bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/10 transition-all text-left group"
            >
              <span className="text-lg block mb-1">{a.icon}</span>
              <span className="text-xs text-white/50 group-hover:text-white transition-colors uppercase tracking-wider">{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Announcements preview */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs text-white/30 uppercase tracking-[3px]">Latest Updates</h3>
          <button onClick={() => setActiveSection('announcements')} className="text-xs uppercase tracking-wider hover:text-white transition-colors" style={{ color: accent }}>
            View All
          </button>
        </div>
        <div className="space-y-2">
          {MOCK_ANNOUNCEMENTS.slice(0, 2).map(a => (
            <div key={a.id} className="p-3 bg-white/[0.02] border border-white/[0.06] flex items-start gap-3">
              <span className="text-sm mt-0.5">{a.type === 'warning' ? '⚠️' : a.type === 'event' ? '📅' : 'ℹ️'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white/80 truncate">{a.title}</p>
                <p className="text-xs text-white/30 mt-0.5">{a.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Checklist */}
      <div>
        <h3 className="text-xs text-white/30 uppercase tracking-[3px] mb-3">Your Checklist</h3>
        <div className="space-y-1">
          {checklist.map(c => (
            <button
              key={c.id}
              onClick={() => toggleChecklist(c.id)}
              className={`w-full flex items-center gap-3 p-2.5 text-left transition-all hover:bg-white/[0.02] ${c.done ? 'opacity-50' : ''}`}
            >
              <span
                className="w-4 h-4 border flex items-center justify-center text-[10px] flex-shrink-0 transition-all"
                style={{
                  borderColor: c.done ? accent : 'rgba(255,255,255,0.15)',
                  background: c.done ? accent : 'transparent',
                  color: c.done ? '#000' : 'transparent',
                }}
              >
                ✓
              </span>
              <span className={`text-sm ${c.done ? 'line-through text-white/30' : 'text-white/70'}`}>{c.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTeam = () => (
    <div ref={contentRef} className="space-y-6">
      <div>
        <h2 className="text-3xl font-black uppercase tracking-tight">My Team<span style={{ color: accent }}>.</span></h2>
        <p className="text-white/40 text-sm mt-1">{team.members.length} of {config.maxTeamSize} members</p>
      </div>

      {/* Team info card */}
      <div className="p-5 bg-white/[0.02] border border-white/[0.06]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-black uppercase">{team.name}</h3>
            <p className="text-xs text-white/30 uppercase tracking-wider">ID: {team.id}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black" style={{ color: accent }}>#{team.rank}</p>
            <p className="text-[10px] text-white/30 uppercase tracking-wider">Current Rank</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs text-white/30">
          <span>Formed: {formatDate(team.formed)}</span>
          <span>•</span>
          <span>Track: {team.project.track}</span>
        </div>
      </div>

      {/* Members */}
      <div>
        <h3 className="text-xs text-white/30 uppercase tracking-[3px] mb-3">Members</h3>
        <div className="space-y-2">
          {team.members.map((m, i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/[0.06] hover:border-white/10 transition-all">
              <div className="text-2xl relative">
                {m.avatar}
                <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#0a0a0a] ${m.online ? 'bg-green-500' : 'bg-white/20'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white/90">{m.name} {i === 0 && <span className="text-[10px] font-normal px-1.5 py-0.5 ml-1 uppercase tracking-wider" style={{ background: `${accent}20`, color: accent }}>You</span>}</p>
                <p className="text-xs text-white/30">{m.email}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-white/40 uppercase tracking-wider px-2 py-1 bg-white/[0.04] border border-white/[0.06]">{m.role}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invite */}
      {team.members.length < config.maxTeamSize && (
        <div className="p-4 border border-dashed border-white/10 text-center">
          <p className="text-sm text-white/40 mb-3">You can add {config.maxTeamSize - team.members.length} more member(s)</p>
          <button className="px-5 py-2.5 text-sm font-bold uppercase tracking-wider transition-all hover:tracking-[3px]" style={{ background: accent, color: '#000' }}>
            Invite Member
          </button>
        </div>
      )}

      {/* Team settings */}
      <div>
        <h3 className="text-xs text-white/30 uppercase tracking-[3px] mb-3">Team Settings</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/[0.06]">
            <div>
              <p className="text-sm text-white/70">Team Name</p>
              <p className="text-xs text-white/30">Change your team's display name</p>
            </div>
            <button className="text-xs uppercase tracking-wider px-3 py-1.5 border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-all">Edit</button>
          </div>
          <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/[0.06]">
            <div>
              <p className="text-sm text-white/70">Leave Team</p>
              <p className="text-xs text-white/30">Leave this team and join another</p>
            </div>
            <button className="text-xs uppercase tracking-wider px-3 py-1.5 border border-red-500/30 text-red-400/70 hover:text-red-400 hover:border-red-500/50 transition-all">Leave</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProject = () => (
    <div ref={contentRef} className="space-y-6">
      <div>
        <h2 className="text-3xl font-black uppercase tracking-tight">Project<span style={{ color: accent }}>.</span></h2>
        <p className="text-white/40 text-sm mt-1">Manage your hackathon project details</p>
      </div>

      {/* Project overview */}
      <div className="p-5 bg-white/[0.02] border border-white/[0.06]">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-black uppercase">{team.project.name || 'Untitled Project'}</h3>
            <p className="text-xs text-white/30 uppercase tracking-wider mt-1">Track: {team.project.track}</p>
          </div>
          <span className={`text-[10px] uppercase tracking-wider px-2 py-1 ${team.project.submitted ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'}`}>
            {team.project.submitted ? 'Submitted' : 'Draft'}
          </span>
        </div>
        <p className="text-sm text-white/50 leading-relaxed">{team.project.description}</p>
      </div>

      {/* Tech Stack */}
      <div>
        <h3 className="text-xs text-white/30 uppercase tracking-[3px] mb-3">Tech Stack</h3>
        <div className="flex flex-wrap gap-2">
          {team.project.techStack.map((t, i) => (
            <span key={i} className="px-3 py-1.5 text-xs font-medium uppercase tracking-wider bg-white/[0.03] border border-white/[0.06] text-white/60">
              {t}
            </span>
          ))}
          <button className="px-3 py-1.5 text-xs uppercase tracking-wider border border-dashed border-white/10 text-white/30 hover:text-white/60 hover:border-white/20 transition-all">
            + Add
          </button>
        </div>
      </div>

      {/* Links */}
      <div>
        <h3 className="text-xs text-white/30 uppercase tracking-[3px] mb-3">Project Links</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/[0.06]">
            <span className="text-sm">📦</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white/30 uppercase tracking-wider mb-0.5">Repository</p>
              {team.project.repoUrl ? (
                <a href={team.project.repoUrl} target="_blank" rel="noopener" className="text-sm hover:underline transition-colors" style={{ color: accent }}>{team.project.repoUrl}</a>
              ) : (
                <p className="text-sm text-white/20 italic">Not set</p>
              )}
            </div>
            <button className="text-xs uppercase tracking-wider px-3 py-1.5 border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-all">Edit</button>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/[0.06]">
            <span className="text-sm">🌐</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white/30 uppercase tracking-wider mb-0.5">Demo URL</p>
              {team.project.demoUrl ? (
                <a href={team.project.demoUrl} target="_blank" rel="noopener" className="text-sm hover:underline transition-colors" style={{ color: accent }}>{team.project.demoUrl}</a>
              ) : (
                <p className="text-sm text-white/20 italic">Not set</p>
              )}
            </div>
            <button className="text-xs uppercase tracking-wider px-3 py-1.5 border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-all">Edit</button>
          </div>
        </div>
      </div>

      {/* Project description editor */}
      <div>
        <h3 className="text-xs text-white/30 uppercase tracking-[3px] mb-3">Project Description</h3>
        <textarea
          defaultValue={team.project.description}
          className="w-full h-32 p-4 bg-white/[0.02] border border-white/[0.06] text-sm text-white/70 placeholder-white/15 focus:outline-none focus:border-white/15 transition-all resize-none"
          placeholder="Describe your project, its purpose, and what problem it solves..."
        />
        <div className="flex justify-end mt-2">
          <button className="px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all hover:tracking-[3px]" style={{ background: accent, color: '#000' }}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );

  const renderSchedule = () => (
    <div ref={contentRef} className="space-y-6">
      <div>
        <h2 className="text-3xl font-black uppercase tracking-tight">Schedule<span style={{ color: accent }}>.</span></h2>
        <p className="text-white/40 text-sm mt-1">Key dates and deadlines</p>
      </div>

      {/* Countdown */}
      <div className="p-5 bg-white/[0.02] border border-white/[0.06] text-center">
        <p className="text-[10px] text-white/30 uppercase tracking-[3px] mb-2">Next Milestone</p>
        <p className="text-sm text-white/50 mb-1">Hacking Starts</p>
        <p className="text-4xl font-black" style={{ color: accent }}>{timeUntil(config.hackingStart)}</p>
        <p className="text-xs text-white/20 mt-2">{formatDate(config.hackingStart)}</p>
      </div>

      {/* Timeline */}
      <div>
        <h3 className="text-xs text-white/30 uppercase tracking-[3px] mb-4">Timeline</h3>
        <div className="relative pl-6">
          <div className="absolute left-[7px] top-2 bottom-2 w-px bg-white/[0.06]" />
          {MOCK_SCHEDULE.map((ev, i) => (
            <div key={i} className="relative pb-6 last:pb-0">
              <div
                className="absolute left-[-19px] top-1.5 w-3.5 h-3.5 border-2 border-[#0a0a0a]"
                style={{
                  background: ev.status === 'completed' ? accent : 'rgba(255,255,255,0.1)',
                  borderColor: ev.status === 'completed' ? accent : 'rgba(255,255,255,0.1)',
                }}
              />
              <div className={`p-4 bg-white/[0.02] border border-white/[0.06] transition-all ${ev.status === 'completed' ? 'opacity-60' : 'hover:border-white/10'}`}>
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-bold text-white/80">{ev.label}</h4>
                  <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 ${ev.status === 'completed' ? 'text-green-400 bg-green-500/10' : 'text-white/30 bg-white/[0.04]'}`}>
                    {ev.status === 'completed' ? 'Done' : timeUntil(ev.date)}
                  </span>
                </div>
                <p className="text-xs text-white/30">{formatDate(ev.date)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSubmissions = () => (
    <div ref={contentRef} className="space-y-6">
      <div>
        <h2 className="text-3xl font-black uppercase tracking-tight">Submissions<span style={{ color: accent }}>.</span></h2>
        <p className="text-white/40 text-sm mt-1">Submit and manage your project</p>
      </div>

      {/* Submission status */}
      <div className={`p-5 border ${team.project.submitted ? 'bg-green-500/[0.03] border-green-500/20' : 'bg-yellow-500/[0.03] border-yellow-500/20'}`}>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-xl">{team.project.submitted ? '✅' : '⏳'}</span>
          <div>
            <h3 className="text-lg font-bold">{team.project.submitted ? 'Project Submitted' : 'Not Yet Submitted'}</h3>
            <p className="text-xs text-white/30">Deadline: {formatDate(config.submissionDeadline)} ({timeUntil(config.submissionDeadline)} remaining)</p>
          </div>
        </div>
      </div>

      {/* Submission form */}
      <div>
        <h3 className="text-xs text-white/30 uppercase tracking-[3px] mb-3">Submission Details</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-white/30 mb-2 uppercase tracking-[3px]">Project Name</label>
            <input
              type="text"
              defaultValue={team.project.name}
              className="w-full px-0 py-3 bg-transparent border-0 border-b border-white/10 text-white text-base placeholder-white/15 focus:outline-none focus:border-b-2 transition-all"
              style={{ borderBottomColor: team.project.name ? accent : undefined }}
            />
          </div>
          <div>
            <label className="block text-xs text-white/30 mb-2 uppercase tracking-[3px]">Repository URL</label>
            <input
              type="url"
              defaultValue={team.project.repoUrl}
              className="w-full px-0 py-3 bg-transparent border-0 border-b border-white/10 text-white text-base placeholder-white/15 focus:outline-none focus:border-b-2 transition-all"
              placeholder="https://github.com/..."
            />
          </div>
          <div>
            <label className="block text-xs text-white/30 mb-2 uppercase tracking-[3px]">Demo URL</label>
            <input
              type="url"
              defaultValue={team.project.demoUrl}
              className="w-full px-0 py-3 bg-transparent border-0 border-b border-white/10 text-white text-base placeholder-white/15 focus:outline-none focus:border-b-2 transition-all"
              placeholder="https://your-demo.vercel.app"
            />
          </div>
          <div>
            <label className="block text-xs text-white/30 mb-2 uppercase tracking-[3px]">Demo Video URL</label>
            <input
              type="url"
              className="w-full px-0 py-3 bg-transparent border-0 border-b border-white/10 text-white text-base placeholder-white/15 focus:outline-none focus:border-b-2 transition-all"
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>
          <div>
            <label className="block text-xs text-white/30 mb-2 uppercase tracking-[3px]">Project Description</label>
            <textarea
              defaultValue={team.project.description}
              className="w-full h-28 px-0 py-3 bg-transparent border-0 border-b border-white/10 text-white text-base placeholder-white/15 focus:outline-none focus:border-b-2 transition-all resize-none"
              placeholder="What does your project do and why does it matter?"
            />
          </div>
          <div>
            <label className="block text-xs text-white/30 mb-2 uppercase tracking-[3px]">Presentation / Slide Deck</label>
            <div className="border border-dashed border-white/10 p-6 text-center hover:border-white/20 transition-all cursor-pointer">
              <span className="text-2xl block mb-2">📎</span>
              <p className="text-sm text-white/40">Click to upload or drag and drop</p>
              <p className="text-xs text-white/20 mt-1">PDF, PPTX up to 25MB</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-6">
          <button className="px-6 py-3 text-sm font-black uppercase tracking-[3px] transition-all hover:tracking-[5px]" style={{ background: accent, color: '#000' }}>
            Submit Project
          </button>
          <button className="px-6 py-3 text-sm font-medium uppercase tracking-wider text-white/40 border border-white/10 hover:text-white/60 hover:border-white/20 transition-all">
            Save Draft
          </button>
        </div>
      </div>
    </div>
  );

  const renderResources = () => (
    <div ref={contentRef} className="space-y-6">
      <div>
        <h2 className="text-3xl font-black uppercase tracking-tight">Resources<span style={{ color: accent }}>.</span></h2>
        <p className="text-white/40 text-sm mt-1">Tools, guides, and assets for your project</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {MOCK_RESOURCES.map((r, i) => (
          <div key={i} className="group p-5 bg-white/[0.02] border border-white/[0.06] hover:border-white/10 transition-all cursor-pointer">
            <div className="flex items-start gap-3">
              <span className="text-2xl">{r.icon}</span>
              <div>
                <h4 className="text-sm font-bold text-white/80 group-hover:text-white transition-colors">{r.title}</h4>
                <p className="text-xs text-white/30 mt-1 leading-relaxed">{r.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div>
        <h3 className="text-xs text-white/30 uppercase tracking-[3px] mb-3">Frequently Asked Questions</h3>
        <div className="space-y-2">
          {[
            { q: 'Can I change my team after registration?', a: 'Yes, you can leave and join another team before hacking starts.' },
            { q: 'What are the judging criteria?', a: 'Projects are judged on Innovation, Technical Complexity, Design/UX, and Impact — each weighted 25%.' },
            { q: 'Can I use pre-existing code?', a: 'You may use open-source libraries and frameworks, but the core project must be built during the hackathon.' },
            { q: 'Is there a minimum team size?', a: 'You can participate solo or in a team of up to ' + config.maxTeamSize + ' members.' },
          ].map((faq, i) => (
            <details key={i} className="group p-3 bg-white/[0.02] border border-white/[0.06]">
              <summary className="text-sm font-medium text-white/70 cursor-pointer list-none flex items-center justify-between">
                {faq.q}
                <span className="text-white/20 group-open:rotate-45 transition-transform text-lg">+</span>
              </summary>
              <p className="text-sm text-white/40 mt-2 leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAnnouncements = () => (
    <div ref={contentRef} className="space-y-6">
      <div>
        <h2 className="text-3xl font-black uppercase tracking-tight">Announcements<span style={{ color: accent }}>.</span></h2>
        <p className="text-white/40 text-sm mt-1">Stay updated with the latest news</p>
      </div>

      <div className="space-y-3">
        {MOCK_ANNOUNCEMENTS.map(a => (
          <div key={a.id} className="p-5 bg-white/[0.02] border border-white/[0.06] hover:border-white/10 transition-all">
            <div className="flex items-start gap-3">
              <span className="text-xl mt-0.5">
                {a.type === 'warning' ? '⚠️' : a.type === 'event' ? '📅' : 'ℹ️'}
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-base font-bold text-white/90">{a.title}</h4>
                  <span className="text-xs text-white/20">{a.time}</span>
                </div>
                <p className="text-sm text-white/40 leading-relaxed">{a.body}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Notification preferences */}
      <div>
        <h3 className="text-xs text-white/30 uppercase tracking-[3px] mb-3">Notification Preferences</h3>
        <div className="space-y-2">
          {['Email notifications', 'Browser push notifications', 'Discord DM notifications'].map((pref, i) => (
            <label key={i} className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/[0.06] cursor-pointer hover:bg-white/[0.03] transition-all">
              <span className="text-sm text-white/60">{pref}</span>
              <div className="relative">
                <input type="checkbox" defaultChecked={i === 0} className="sr-only peer" />
                <div className="w-9 h-5 bg-white/10 peer-checked:bg-[var(--accent)] rounded-full transition-all" style={{ '--accent': accent } as React.CSSProperties} />
                <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-4" />
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSupport = () => (
    <div ref={contentRef} className="space-y-6">
      <div>
        <h2 className="text-3xl font-black uppercase tracking-tight">Support<span style={{ color: accent }}>.</span></h2>
        <p className="text-white/40 text-sm mt-1">Get help when you need it</p>
      </div>

      {/* Support options */}
      <div className="grid gap-3 md:grid-cols-2">
        {[
          { icon: '💬', title: 'Discord Community', desc: 'Join our Discord server for real-time help and networking.', cta: 'Open Discord' },
          { icon: '🧑‍🏫', title: 'Request Mentor', desc: 'Book a 1-on-1 session with an industry expert.', cta: 'Find Mentor' },
          { icon: '🐛', title: 'Report a Bug', desc: 'Found an issue with the platform? Let us know.', cta: 'Report' },
          { icon: '📧', title: 'Email Support', desc: 'Reach out to the organizing team directly.', cta: 'Send Email' },
        ].map((s, i) => (
          <div key={i} className="p-5 bg-white/[0.02] border border-white/[0.06] hover:border-white/10 transition-all">
            <span className="text-2xl block mb-3">{s.icon}</span>
            <h4 className="text-sm font-bold text-white/80 mb-1">{s.title}</h4>
            <p className="text-xs text-white/30 mb-4 leading-relaxed">{s.desc}</p>
            <button className="text-xs font-bold uppercase tracking-wider transition-all hover:tracking-[3px]" style={{ color: accent }}>
              {s.cta} →
            </button>
          </div>
        ))}
      </div>

      {/* Contact form */}
      <div>
        <h3 className="text-xs text-white/30 uppercase tracking-[3px] mb-3">Send a Message</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-white/30 mb-2 uppercase tracking-[3px]">Subject</label>
            <input
              type="text"
              className="w-full px-0 py-3 bg-transparent border-0 border-b border-white/10 text-white text-base placeholder-white/15 focus:outline-none focus:border-b-2 transition-all"
              placeholder="What do you need help with?"
            />
          </div>
          <div>
            <label className="block text-xs text-white/30 mb-2 uppercase tracking-[3px]">Message</label>
            <textarea
              className="w-full h-28 px-0 py-3 bg-transparent border-0 border-b border-white/10 text-white text-base placeholder-white/15 focus:outline-none focus:border-b-2 transition-all resize-none"
              placeholder="Describe your issue or question..."
            />
          </div>
          <button className="px-6 py-3 text-sm font-black uppercase tracking-[3px] transition-all hover:tracking-[5px]" style={{ background: accent, color: '#000' }}>
            Send Message
          </button>
        </div>
      </div>
    </div>
  );

  const sectionRenderers: Record<Section, () => JSX.Element> = {
    overview: renderOverview,
    team: renderTeam,
    project: renderProject,
    schedule: renderSchedule,
    submissions: renderSubmissions,
    resources: renderResources,
    announcements: renderAnnouncements,
    support: renderSupport,
  };

  return (
    <div ref={pageRef} className="min-h-screen bg-[#0a0a0a] text-white flex">
      {/* ─── Sidebar (desktop) ─── */}
      <aside className="hidden lg:flex flex-col w-[260px] min-h-screen border-r border-white/[0.06] bg-[#0a0a0a] fixed left-0 top-0 bottom-0 z-50">
        {/* Logo */}
        <div className="p-5 border-b border-white/[0.06]">
          <Link to="/" className="flex items-center gap-3 group">
            <div
              className="w-9 h-9 flex items-center justify-center text-base font-black"
              style={{ background: accent, color: '#000' }}
            >
              {config.title.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-white/80 group-hover:text-white transition-colors">{config.title}</p>
              <p className="text-[10px] text-white/20 uppercase tracking-wider">Dashboard</p>
            </div>
          </Link>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
          {SIDEBAR_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm transition-all ${
                activeSection === item.id
                  ? 'text-white font-bold'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/[0.02]'
              }`}
              style={activeSection === item.id ? { background: `${accent}10`, borderLeft: `2px solid ${accent}` } : { borderLeft: '2px solid transparent' }}
            >
              <span className="text-xs w-5 text-center" style={activeSection === item.id ? { color: accent } : {}}>{item.icon}</span>
              <span className="uppercase tracking-wider text-xs">{item.label}</span>
              {item.id === 'announcements' && (
                <span className="ml-auto text-[10px] px-1.5 py-0.5 font-bold" style={{ background: accent, color: '#000' }}>
                  {MOCK_ANNOUNCEMENTS.length}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Sidebar footer */}
        <div className="p-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-white/[0.06] flex items-center justify-center text-sm">🧑‍💻</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white/70 truncate">{team.members[0].name}</p>
              <p className="text-[10px] text-white/30 truncate">{team.members[0].email}</p>
            </div>
          </div>
          <Link
            to="/"
            className="flex items-center gap-2 text-xs text-white/30 hover:text-white/60 transition-colors uppercase tracking-wider"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </Link>
        </div>
      </aside>

      {/* ─── Mobile header ─── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-lg border-b border-white/[0.06]">
        <div className="flex items-center justify-between px-4 h-14">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 flex items-center justify-center text-xs font-black" style={{ background: accent, color: '#000' }}>
              {config.title.charAt(0)}
            </div>
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

        {/* Mobile menu */}
        <div className={`overflow-hidden transition-all duration-300 ${sidebarOpen ? 'max-h-[500px] border-b border-white/[0.06]' : 'max-h-0'}`}>
          <nav className="p-3 space-y-0.5">
            {SIDEBAR_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => { setActiveSection(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm transition-all ${
                  activeSection === item.id ? 'text-white font-bold' : 'text-white/40'
                }`}
                style={activeSection === item.id ? { background: `${accent}10` } : {}}
              >
                <span className="text-xs w-5 text-center">{item.icon}</span>
                <span className="uppercase tracking-wider text-xs">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* ─── Main content ─── */}
      <main className="flex-1 lg:ml-[260px] pt-14 lg:pt-0">
        {/* Top bar */}
        <div className="sticky top-0 z-40 bg-[#0a0a0a]/90 backdrop-blur-lg border-b border-white/[0.06] hidden lg:block">
          <div className="flex items-center justify-between px-8 h-14">
            <div className="flex items-center gap-2 text-xs text-white/30 uppercase tracking-wider">
              <Link to="/" className="hover:text-white/60 transition-colors">Home</Link>
              <span>/</span>
              <span className="text-white/60">{SIDEBAR_ITEMS.find(s => s.id === activeSection)?.label}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-white/20 uppercase tracking-wider">
                {timeUntil(config.submissionDeadline)} until deadline
              </span>
              <div className="w-px h-4 bg-white/10" />
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-white/[0.06] flex items-center justify-center text-xs">🧑‍💻</div>
                <span className="text-xs text-white/50">{team.members[0].name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="p-6 lg:p-8 max-w-4xl">
          {sectionRenderers[activeSection]()}
        </div>
      </main>
    </div>
  );
}
