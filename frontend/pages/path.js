import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import TopicDetail from '../components/TopicDetail';
import { useAuth } from '../context/AuthContext';
import { usePath } from '../context/PathContext';
import { userAPI } from '../utils/api';

export default function Path() {
  return <ProtectedRoute><PathInner /></ProtectedRoute>;
}

function PathInner() {
  const { user, updateUser }   = useAuth();
  const { pathData, fetchPath, loadingPath, selectedTopic, setSelectedTopic, showToast } = usePath();
  const [mode, setMode]        = useState(user?.mode || 'balanced');

  useEffect(() => { fetchPath(); }, []);

  const switchMode = async (m) => {
    setMode(m);
    try {
      await userAPI.updateProfile({ mode: m });
      updateUser({ mode: m });
      await fetchPath();
      showToast(`Switched to ${m} mode. Path recalculated!`);
    } catch {}
  };

  const allTopics     = pathData?.allTopics     || [];
  const completedSet  = new Set(pathData?.completedTopics || user?.completedTopics || []);
  const currentId     = pathData?.nextTopic?.id;
  const upcomingIds   = new Set((pathData?.path || []).slice(0, 8).map(n => n.id));

  const pct = allTopics.length ? Math.round(completedSet.size / allTopics.length * 100) : 0;

  // Build ordered list: completed → current → upcoming → locked
  const grouped = [
    ...allTopics.filter(n => completedSet.has(n.id)).map(n => ({ ...n, status: 'done' })),
    ...(currentId && !completedSet.has(currentId) ? [{ ...allTopics.find(n => n.id === currentId), status: 'active' }] : []),
    ...(pathData?.path || []).slice(0, 8).map(n => ({ ...n, status: 'upcoming' })),
    ...allTopics.filter(n => !completedSet.has(n.id) && n.id !== currentId && !upcomingIds.has(n.id)).slice(0, 3).map(n => ({ ...n, status: 'locked' })),
  ].filter(Boolean);

  return (
    <Layout>
      <div style={{ padding: '30px 28px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 4 }}>
              {user?.goal || 'AI/ML Engineer'} Track
            </div>
            <h2 style={{ fontFamily: 'Syne', fontSize: 24, fontWeight: 800 }}>Your Roadmap</h2>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[['fast','Fast Track'],['balanced','Balanced'],['deep','Deep Learning']].map(([key, label]) => (
              <button key={key} className={`btn btn-sm ${mode === key ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => switchMode(key)}>{label}</button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 22 }}>
          {/* Left: node list */}
          <div>
            {/* Progress bar card */}
            <div className="card" style={{ marginBottom: 14, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 6 }}>Overall Progress</div>
                  <div className="progress-track">
                    <div className="progress-fill animate-glow" style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <div style={{ fontFamily: 'Syne', fontSize: 22, fontWeight: 800, color: 'var(--green)' }}>{pct}%</div>
              </div>
            </div>

            {/* Node list */}
            <div style={{ maxHeight: 520, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 0 }}>
              {loadingPath ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
              ) : grouped.map((n, i) => {
                const dotColor = n.status === 'done' ? 'var(--green)' : n.status === 'active' ? 'var(--green)' : n.status === 'locked' ? 'var(--text3)' : 'var(--border2)';
                const score    = user?.scores?.[n.id];
                return (
                  <div key={n.id}>
                    <div
                      className={`topic-node ${n.status}`}
                      onClick={() => n.status !== 'locked' && setSelectedTopic(n)}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        <div style={{ width: 9, height: 9, borderRadius: '50%', flexShrink: 0, marginTop: 3, background: dotColor, boxShadow: n.status === 'active' ? '0 0 8px var(--green)' : 'none', animation: n.status === 'active' ? 'pulseDot 1.5s ease infinite' : 'none' }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                            {n.name}
                            {n.status === 'done'   && <span style={{ color: 'var(--green)', fontSize: 12 }}>✓</span>}
                            {n.status === 'active' && <span className="tag tag-green" style={{ fontSize: 10, padding: '2px 8px' }}>Current</span>}
                            {n.status === 'locked' && <span className="tag" style={{ fontSize: 10, padding: '2px 8px', background: 'rgba(255,255,255,.05)', color: 'var(--text3)', border: '1px solid var(--border)' }}>Locked</span>}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>{n.time}h · Diff {n.diff}/5 · {n.tags?.slice(0, 2).join(', ')}</div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontSize: 10, color: 'var(--text3)' }}>imp</div>
                          <div style={{ fontFamily: 'Syne', fontSize: 15, fontWeight: 700, color: n.imp >= 8 ? 'var(--green)' : n.imp >= 6 ? '#ffb400' : 'var(--text2)' }}>{n.imp}/10</div>
                        </div>
                      </div>
                      {score !== undefined && (
                        <div style={{ marginTop: 8 }}>
                          <div className="progress-track">
                            <div className="progress-fill" style={{ width: `${score}%`, background: score >= 80 ? 'linear-gradient(90deg,var(--green2),var(--green))' : 'linear-gradient(90deg,#ffb400,#ff8800)' }} />
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 3 }}>Quiz: {score}%</div>
                        </div>
                      )}
                    </div>
                    {i < grouped.length - 1 && n.status !== 'locked' && (
                      <div style={{ width: 2, height: 18, background: 'linear-gradient(180deg,rgba(0,255,136,.3),transparent)', margin: '0 auto' }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: topic detail */}
          <div>
            <TopicDetail topic={selectedTopic} />
          </div>
        </div>
      </div>
    </Layout>
  );
}
