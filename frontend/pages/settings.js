import { useState } from 'react';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../context/AuthContext';
import { usePath } from '../context/PathContext';
import { userAPI } from '../utils/api';

export default function Settings() {
  return <ProtectedRoute><SettingsInner /></ProtectedRoute>;
}

const BADGE_META = {
  first_step:    { icon: '🚀', name: 'First Step',    desc: 'Completed first topic'    },
  streak_master: { icon: '🔥', name: 'Streak Master', desc: '7-day streak'             },
  quiz_ace:      { icon: '⚡', name: 'Quiz Ace',      desc: 'Scored 90%+ on a quiz'    },
  deep_diver:    { icon: '🔬', name: 'Deep Diver',    desc: 'Studied 3h in one day'    },
};
const ALL_BADGES = Object.keys(BADGE_META);
const DAYS_OF_WEEK = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

function SettingsInner() {
  const { user, updateUser }      = useAuth();
  const { showToast, fetchPath }  = usePath();

  const [form, setForm]           = useState({
    name:       user?.name       || '',
    dailyHours: user?.dailyHours || 2,
    mode:       user?.mode       || 'balanced',
  });
  const [activeDays, setActiveDays] = useState(new Set(['Mon','Tue','Wed','Thu','Fri']));
  const [saving,     setSaving]     = useState(false);

  const initials = (user?.name || 'NP').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const saveProfile = async () => {
    setSaving(true);
    try {
      const { data } = await userAPI.updateProfile(form);
      updateUser(data);
      await fetchPath();
      showToast('Profile saved! ✓');
    } catch (err) {
      showToast(err.response?.data?.message || 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (d) => {
    setActiveDays(prev => {
      const next = new Set(prev);
      next.has(d) ? next.delete(d) : next.add(d);
      return next;
    });
  };

  const exportPDF = () => {
    showToast('PDF export — install jspdf then call window.print() or use jsPDF library');
  };

  const earnedBadges = user?.badges || [];

  return (
    <Layout>
      <div style={{ padding: '30px 28px' }}>
        <div style={{ marginBottom: 26 }}>
          <h2 style={{ fontFamily: 'Syne', fontSize: 24, fontWeight: 800 }}>Profile & Settings</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 18 }}>
          {/* Left column */}
          <div>
            {/* Profile card */}
            <div className="card" style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 22 }}>
                <div style={{
                  width: 60, height: 60, borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg,var(--green),var(--green2))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Syne', fontWeight: 800, fontSize: 22, color: '#000',
                }}>{initials}</div>
                <div>
                  <div style={{ fontFamily: 'Syne', fontSize: 19, fontWeight: 700 }}>{user?.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 3 }}>
                    {user?.goal || 'AI/ML Engineer'} · {user?.level || 'Beginner'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: 'var(--text2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.6px' }}>Full Name</label>
                  <input className="inp" type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: 'var(--text2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.6px' }}>Daily Goal (hours)</label>
                  <input className="inp" type="number" min="0.5" max="12" step="0.5" value={form.dailyHours} onChange={e => setForm({ ...form, dailyHours: parseFloat(e.target.value) })} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: 'var(--text2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.6px' }}>Learning Mode</label>
                  <select className="inp" value={form.mode} onChange={e => setForm({ ...form, mode: e.target.value })}>
                    <option value="balanced">Balanced</option>
                    <option value="fast">Fast Track</option>
                    <option value="deep">Deep Learning</option>
                  </select>
                </div>
                <button className="btn btn-primary" style={{ width: '100%' }} onClick={saveProfile} disabled={saving}>
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </div>

            {/* Badges */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 18 }}>
                <span style={{ fontFamily: 'Syne', fontSize: 15, fontWeight: 700 }}>Badges Earned</span>
                <span className="tag tag-green">{earnedBadges.length} / {ALL_BADGES.length}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
                {ALL_BADGES.map(key => {
                  const b       = BADGE_META[key];
                  const earned  = earnedBadges.includes(key);
                  return (
                    <div key={key} style={{
                      padding: '12px 8px', background: 'var(--bg2)', borderRadius: 'var(--radius2)',
                      textAlign: 'center', border: `1px solid ${earned ? 'rgba(0,255,136,.2)' : 'var(--border)'}`,
                      opacity: earned ? 1 : .4,
                    }}>
                      <div style={{ fontSize: 24, marginBottom: 6 }}>{b.icon}</div>
                      <div style={{ fontSize: 11, fontWeight: 600 }}>{b.name}</div>
                      <div style={{ fontSize: 10, color: 'var(--text2)', marginTop: 2 }}>{b.desc}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div>
            {/* Constraint scheduler */}
            <div className="card" style={{ marginBottom: 16 }}>
              <div style={{ fontFamily: 'Syne', fontSize: 15, fontWeight: 700, marginBottom: 18 }}>Constraint Scheduler</div>
              <div style={{ display: 'grid', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: 'var(--text2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.6px' }}>Deadline</label>
                  <input className="inp" type="date" defaultValue={(() => { const d = new Date(); d.setMonth(d.getMonth() + 2); return d.toISOString().split('T')[0]; })()} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: 'var(--text2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.6px' }}>Available Days</label>
                  <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 4 }}>
                    {DAYS_OF_WEEK.map(d => {
                      const on = activeDays.has(d);
                      return (
                        <button key={d} onClick={() => toggleDay(d)} style={{
                          width: 38, height: 38, borderRadius: '50%',
                          border: `1px solid ${on ? 'var(--green)' : 'var(--border2)'}`,
                          background: on ? 'rgba(0,255,136,.1)' : 'var(--bg2)',
                          color: on ? 'var(--green)' : 'var(--text2)',
                          fontSize: 11, cursor: 'pointer', fontFamily: 'DM Sans', transition: 'all .2s',
                        }}>{d[0]}</button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: 'var(--text2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.6px' }}>Hours Per Session</label>
                  <input className="inp" type="range" min="0.5" max="8" step="0.5" value={form.dailyHours}
                    onChange={e => setForm({ ...form, dailyHours: parseFloat(e.target.value) })} />
                  <div style={{ fontSize: 14, color: 'var(--green)', marginTop: 5, fontWeight: 600 }}>{form.dailyHours}h</div>
                </div>
                <button className="btn btn-secondary" onClick={() => { saveProfile(); showToast('Path recalculated!'); }}>
                  Recalculate Path ↗
                </button>
              </div>
            </div>

            {/* Resume upload */}
            <div className="card" style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 18 }}>
                <span style={{ fontFamily: 'Syne', fontSize: 15, fontWeight: 700 }}>Resume Upload</span>
                <span className="tag tag-amber">Skill Gap AI</span>
              </div>
              <div
                style={{ border: '2px dashed var(--border2)', borderRadius: 'var(--radius2)', padding: 36, textAlign: 'center', cursor: 'pointer', transition: 'border-color .2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,255,136,.35)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border2)'}
                onClick={() => showToast('Resume parsing — connect backend /api/resume endpoint with multer + pdf-parse')}
              >
                <div style={{ fontSize: 36, marginBottom: 10, opacity: .35 }}>📄</div>
                <div style={{ fontSize: 14, color: 'var(--text2)' }}>Drop your PDF resume here</div>
                <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 5 }}>Auto-extracts skills · Finds gaps · Updates path</div>
              </div>
            </div>

            {/* Export */}
            <div className="card">
              <div style={{ fontFamily: 'Syne', fontSize: 15, fontWeight: 700, marginBottom: 18 }}>Export & Extras</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button className="btn btn-secondary" style={{ justifyContent: 'flex-start', gap: 10 }} onClick={exportPDF}>
                  <span>📄</span> Export Roadmap as PDF
                </button>
                <button className="btn btn-secondary" style={{ justifyContent: 'flex-start', gap: 10 }} onClick={() => showToast('Notifications enabled!')}>
                  <span>🔔</span> Enable Daily Reminders
                </button>
                <div style={{ padding: '12px 14px', background: 'var(--bg2)', borderRadius: 'var(--radius2)', fontSize: 13, color: 'var(--text2)' }}>
                  <div style={{ color: 'var(--text)', fontWeight: 500, marginBottom: 4 }}>Account Stats</div>
                  <div>Member since: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'Recently'}</div>
                  <div style={{ marginTop: 3 }}>Email: {user?.email}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
