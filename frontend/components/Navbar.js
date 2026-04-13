import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

const TABS = [
  { label: 'Home',      href: '/'          },
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'My Path',   href: '/path'      },
  { label: 'Analytics', href: '/analytics' },
  { label: 'Profile',   href: '/settings'  },
];

export default function Navbar() {
  const router       = useRouter();
  const { user, logout } = useAuth();

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'NP';

  const handleLogout = () => { logout(); router.push('/login'); };

  return (
    <nav style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 28px', height: '62px',
      borderBottom: '1px solid var(--border)',
      background: 'rgba(0,0,0,0.97)',
      backdropFilter: 'blur(24px)',
      position: 'sticky', top: 0, zIndex: 100, flexShrink: 0,
    }}>
      {/* Logo */}
      <div
        onClick={() => router.push('/')}
        style={{ fontFamily: 'Syne', fontSize: 21, fontWeight: 800, color: 'var(--green)', cursor: 'pointer', letterSpacing: '-0.5px' }}
      >
        Neural<span style={{ color: 'var(--text2)' }}>Path</span>
      </div>

      {/* Nav tabs */}
      <div style={{ display: 'flex', gap: 2, overflowX: 'auto' }}>
        {TABS.map(tab => {
          const active = router.pathname === tab.href;
          return (
            <button
              key={tab.href}
              onClick={() => router.push(tab.href)}
              style={{
                background: active ? 'rgba(0,255,136,.08)' : 'none',
                border: 'none',
                color: active ? 'var(--green)' : 'var(--text2)',
                padding: '7px 15px', borderRadius: 8,
                cursor: 'pointer', fontSize: 13,
                fontFamily: 'DM Sans', fontWeight: active ? 500 : 400,
                transition: 'all .2s', whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => { if (!active) { e.target.style.color = 'var(--text)'; e.target.style.background = 'rgba(255,255,255,.05)'; }}}
              onMouseLeave={e => { if (!active) { e.target.style.color = 'var(--text2)'; e.target.style.background = 'none'; }}}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {user && (
          <div style={{
            background: 'rgba(255,160,0,.08)', border: '1px solid rgba(255,160,0,.18)',
            color: '#ffb400', fontSize: 12, padding: '5px 12px', borderRadius: 20,
            display: 'flex', alignItems: 'center', gap: 5,
          }}>
            🔥 {user.streak || 0}d streak
          </div>
        )}
        {user ? (
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              onClick={() => router.push('/settings')}
              style={{
                width: 34, height: 34, borderRadius: '50%',
                background: 'linear-gradient(135deg,#00ff88,#00cc6a)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 12, color: '#000', cursor: 'pointer',
              }}
            >{initials}</div>
            <button
              onClick={handleLogout}
              style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', fontSize: 12, padding: '4px 8px', borderRadius: 6 }}
              onMouseEnter={e => e.target.style.color = '#ff7070'}
              onMouseLeave={e => e.target.style.color = 'var(--text2)'}
            >Logout</button>
          </div>
        ) : (
          <button className="btn btn-primary btn-sm" onClick={() => router.push('/login')}>Sign In</button>
        )}
      </div>
    </nav>
  );
}
