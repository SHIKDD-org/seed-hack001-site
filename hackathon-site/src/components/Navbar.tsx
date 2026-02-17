import { config } from '@/config';

export default function Navbar() {
  const links = [
    { label: 'About', href: '#about' },
    { label: 'Schedule', href: '#dates' },
    { label: 'Prizes', href: '#prizes' },
    { label: 'Teams', href: '#teams' },
  ];

  return (
    <nav className="navbar" id="navbar">
      <a href="#hero" className="flex items-center gap-3 group">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold transition-transform duration-300 group-hover:scale-110"
          style={{
            background: `${config.accentColor}12`,
            border: `1px solid ${config.accentColor}25`,
            color: config.accentColor,
          }}
        >
          {config.logoUrl ? (
            <img src={config.logoUrl} alt="" className="w-full h-full object-cover rounded-lg" />
          ) : (
            config.title.charAt(0)
          )}
        </div>
        <span
          className="text-sm font-semibold tracking-wide text-white/70 group-hover:text-white transition-colors duration-300"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {config.title}
        </span>
      </a>

      <div className="hidden md:flex items-center gap-10">
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="nav-link text-[11px] font-medium tracking-[0.2em] uppercase text-white/35 hover:text-white transition-colors duration-300"
          >
            {link.label}
          </a>
        ))}
        <a
          href="https://devsage.org/login"
          className="magnetic-btn ml-4 px-6 py-2.5 text-[11px] font-bold tracking-[0.15em] uppercase rounded-full transition-all duration-300 hover:scale-105"
          style={{
            background: config.accentColor,
            color: '#000',
          }}
        >
          Register
        </a>
      </div>

      {/* Mobile menu button */}
      <a
        href="https://devsage.org/login"
        className="md:hidden magnetic-btn px-5 py-2 text-[10px] font-bold tracking-[0.15em] uppercase rounded-full"
        style={{
          background: config.accentColor,
          color: '#000',
        }}
      >
        Register
      </a>
    </nav>
  );
}
