import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../context/AuthContext';
import { usePath } from '../context/PathContext';

export default function Dashboard() {
  return <ProtectedRoute><DashboardInner /></ProtectedRoute>;
}

function DashboardInner() {
  const router              = useRouter();
  const { user }            = useAuth();
  const { fetchPath, fetchRevisions, pathData, revisions, loadingPath } = usePath();

  useEffect(() => {
    fetchPath();
    fetchRevisions();
  }, []);

  const scores    = user?.scores || {};
  const scoreVals = Object.values(scores);
  const avg       = scoreVals.length ? Math.round(scoreVals.reduce((a, b) => a + b, 0) / scoreVals.length) : 0;
  const completed = user?.completedTopics?.length || 0;
  const total     = pathData?.totalTopics || 14;
  const estimate  = pathData?.estimate;
  const weeklyH   = user?.weeklyHours || [0,0,0,0,0,0,0];
  const maxH      = Math.max(...weeklyH, 1);
  const dayLabels = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

  // Retention helper
  const retention = (daysLeft, score) =>
    Math.round(Math.exp(-0.1 * daysLeft) * (score / 100) * 100);

  // Burnout
  const burnout = user?.burnoutLevel || 0;
  const burnoutColor = burnout > 70 ? 'linear-gradient(90deg,#ff6b6b,#ff3030)' : burnout > 40 ? 'linear-gradient(90deg,#ffb400,#ff8800)' : 'linear-gradient(90deg,var(--green2),var(--green))';
  const burnoutTag   = burnout > 70 ? 'tag-red' : burnout > 40 ? 'tag-amber' : 'tag-green';
  const burnoutLabel = burnout > 70 ? 'High — Rest recommended' : burnout > 40 ? 'Moderate — Watch your pace' : 'Low — You\'re thriving!';

  return (
    <Layout>
      <div style={{ padding: '30px 28px' }}>
        {/* Header */}
        <div style={{ marginBottom: 26 }}>
          <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 4 }}>
            Good morning, {user?.name?.split(' ')[0]} 👋
          </div>
          <h2 style={{ fontFamily: 'Syne', fontSize: 24, fontWeight: 800 }}>Learning Dashboard</h2>
        </div>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 14, marginBottom: 22 }}>
          {[
            { v: `${completed}/${total}`, l: 'Topics Done',     d: `${Math.round(completed/total*100)}% complete` },
            { v: estimate ? `${estimate.days}d` : '…',          l: 'Est. Completion', d: estimate?.label || '' },
            { v: `${user?.streak || 0}d`,                        l: 'Streak',          d: 'Keep going!' },
            { v: `${avg}%`,                                      l: 'Avg Quiz Score',  d: 'Quiz average' },
          ].map(s => (
            <div key={s.l} className="stat-card animate-fade-in">
              <div style={{ fontFamily: 'Syne', fontSize: 28, fontWeight: 800, lineHeight: 1, marginBottom: 5 }}>{s.v}</div>
              <div style={{ fontSize: 11, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '.6px' }}>{s.l}</div>
              <div style={{ fontSize: 12, marginTop: 6, color: 'var(--green)' }}>{s.d}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 18, marginBottom: 22 }}>
          {/* Today's plan */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 18 }}>
              <span style={{ fontFamily: 'Syne', fontSize: 15, fontWeight: 700 }}>Today's Schedule</span>
              <span className="tag tag-green">On Track</span>
            </div>
            {loadingPath ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
            ) : pathData?.path?.slice(0, 2).map((t, i) => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: 11, color: 'var(--text2)', background: 'var(--bg2)', padding: '3px 9px', borderRadius: 4, whiteSpace: 'nowrap', minWidth: 68, textAlign: 'center' }}>
                  {i === 0 ? '09:00 AM' : '11:30 AM'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>{t.time}h · {t.tags?.join(', ')}</div>
                </div>
                <button className="btn btn-sm btn-primary" onClick={() => router.push('/path')}>Start</button>
              </div>
            ))}
          </div>

          {/* Algorithm explanation */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 18 }}>
              <span style={{ fontFamily: 'Syne', fontSize: 15, fontWeight: 700 }}>Why This Path?</span>
              <span className="tag tag-blue">Explainable AI</span>
            </div>
            {pathData?.explanation ? (
              <div>
                <div style={{ padding: 14, background: 'rgba(0,255,136,.04)', border: '1px solid rgba(0,255,136,.1)', borderRadius: 'var(--radius2)', marginBottom: 14 }}>
                  <div style={{ fontSize: 11, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 7 }}>DP + Greedy Decision</div>
                  <div style={{ fontSize: 13, lineHeight: 1.75, color: 'var(--text)' }}>{pathData.explanation}</div>
                </div>
              </div>
            ) : (
              <div style={{ color: 'var(--text2)', fontSize: 13 }}>Generate your path to see the explanation.</div>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 18, marginBottom: 22 }}>
          {/* Weekly chart */}
          <div className="card">
            <div style={{ fontFamily: 'Syne', fontSize: 15, fontWeight: 700, marginBottom: 18 }}>Weekly Study Hours</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 130, padding: '0 2px' }}>
              {weeklyH.map((h, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                  <div style={{ fontSize: 10, color: 'var(--text2)' }}>{h}h</div>
                  <div style={{ width: '100%', background: 'linear-gradient(180deg,var(--green),var(--green2))', borderRadius: '4px 4px 0 0', height: Math.round(h / maxH * 110), minHeight: 4, opacity: i === 6 ? 1 : .65 }} />
                  <div style={{ fontSize: 10, color: 'var(--text2)' }}>{dayLabels[i]}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Spaced revisions */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 18 }}>
              <span style={{ fontFamily: 'Syne', fontSize: 15, fontWeight: 700 }}>Spaced Revisions</span>
              <span className="tag tag-amber">Forgetting Curve</span>
            </div>
            {revisions.slice(0, 3).map(r => (
              <div key={r.topicId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{r.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>
                    Retention: ~{retention(r.daysLeft, r.score)}%
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className={`tag ${r.daysLeft <= 3 ? 'tag-red' : r.daysLeft <= 7 ? 'tag-amber' : 'tag-green'}`}>{r.daysLeft}d</span>
                  <button className="btn btn-ghost btn-sm">↺</button>
                </div>
              </div>
            ))}
            {revisions.length === 0 && <div style={{ color: 'var(--text2)', fontSize: 13 }}>Complete topics to see revision schedule.</div>}
          </div>
        </div>

        {/* Burnout */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontFamily: 'Syne', fontSize: 15, fontWeight: 700 }}>Burnout Detector</div>
            <span className={`tag ${burnoutTag}`}>{burnoutLabel}</span>
          </div>
          <div className="burnout-track">
            <div className="burnout-fill" style={{ width: `${burnout}%`, background: burnoutColor }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>
            <span>Healthy</span><span>Risk</span>
          </div>
          <div style={{ marginTop: 10, fontSize: 13, color: 'var(--text2)' }}>
            {burnout < 40 ? '✓ Study patterns are consistent. Keep the momentum!' : '⚠ Consider a lighter topic or a short break to sustain performance.'}
          </div>
        </div>
      </div>
    </Layout>
  );
}
