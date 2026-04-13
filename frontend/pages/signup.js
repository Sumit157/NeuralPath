import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const router       = useRouter();
  const { signup }   = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      await signup(form.name, form.email, form.password);
      router.push('/onboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'var(--bg)' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div onClick={() => router.push('/')} style={{ fontFamily: 'Syne', fontSize: 24, fontWeight: 800, color: 'var(--green)', cursor: 'pointer', textAlign: 'center', marginBottom: 8 }}>
          Neural<span style={{ color: 'var(--text2)' }}>Path</span>
        </div>
        <div style={{ textAlign: 'center', color: 'var(--text2)', fontSize: 14, marginBottom: 36 }}>Create your personalised learning engine.</div>

        <div className="card">
          <h2 style={{ fontFamily: 'Syne', fontSize: 22, fontWeight: 800, marginBottom: 24 }}>Create Account</h2>

          {error && (
            <div style={{ padding: '10px 14px', background: 'rgba(255,107,107,.08)', border: '1px solid rgba(255,107,107,.2)', borderRadius: 8, color: '#ff7070', fontSize: 13, marginBottom: 16 }}>
              {error}
            </div>
          )}

          <form onSubmit={handle} style={{ display: 'grid', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, color: 'var(--text2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.6px' }}>Full Name</label>
              <input className="inp" type="text" placeholder="Aarav Sharma" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, color: 'var(--text2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.6px' }}>Email</label>
              <input className="inp" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, color: 'var(--text2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.6px' }}>Password</label>
              <input className="inp" type="password" placeholder="Min. 6 characters" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', padding: '13px', fontSize: 15, marginTop: 4, opacity: loading ? .7 : 1 }}>
              {loading ? 'Creating account…' : 'Get Started →'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text2)' }}>
            Already have an account?{' '}
            <span style={{ color: 'var(--green)', cursor: 'pointer' }} onClick={() => router.push('/login')}>Sign in</span>
          </div>
        </div>
      </div>
    </div>
  );
}
