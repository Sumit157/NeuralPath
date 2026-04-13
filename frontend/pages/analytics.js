import { useEffect } from 'react';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../context/AuthContext';
import { usePath } from '../context/PathContext';

export default function Analytics() {
  return <ProtectedRoute><AnalyticsInner /></ProtectedRoute>;
}

const KNOWLEDGE_GRAPH = [
  { id:'py', name:'Python Basics' }, { id:'py2', name:'Python Advanced' },
  { id:'git', name:'Git & Version Control' }, { id:'math', name:'Linear Algebra' },
  { id:'stats', name:'Statistics & Prob.' }, { id:'pandas', name:'Pandas & NumPy' },
  { id:'viz', name:'Data Visualisation' }, { id:'sql', name:'SQL & Databases' },
  { id:'ml', name:'Machine Learning Core' }, { id:'fe', name:'Feature Engineering' },
  { id:'dl', name:'Deep Learning' }, { id:'nlp', name:'NLP & Transformers' },
  { id:'cv', name:'Computer Vision' }, { id:'mlops', name:'MLOps & Deployment' },
];

function AnalyticsInner() {
  const { user }                  = useAuth();
  const { fetchPath, fetchRevisions, pathData } = usePath();

  useEffect(() => { fetchPath(); fetchRevisions(); }, []);

  const scores    = user?.scores || {};
  const scoreEntries = Object.entries(scores);
  const scoreVals = Object.values(scores);
  const avg       = scoreVals.length ? Math.round(scoreVals.reduce((a, b) => a + b, 0) / scoreVals.length) : 0;
  const totalH    = (user?.weeklyHours || []).reduce((a, b) => a + b, 0).toFixed(1);
  const completed = user?.completedTopics?.length || 0;
  const total     = pathData?.totalTopics || 14;

  const mastery = [
    { l: 'Python',            p: scores['py']     || scores['py2']    || 0 },
    { l: 'Statistics',        p: scores['stats']  || 0 },
    { l: 'Data Manipulation', p: scores['pandas'] || 0 },
    { l: 'ML Concepts',       p: scores['ml']     || 0 },
    { l: 'Git / Version Ctrl',p: scores['git']    || 0 },
  ];

  const maxScore = 100;
  const TARGET_SKILLS = ['Python','Linear Algebra','Statistics','Machine Learning','Deep Learning','NLP & Transformers','MLOps & Deployment','Computer Vision'];

  return (
    <Layout>
      <div style={{ padding: '30px 28px' }}>
        <div style={{ marginBottom: 26 }}>
          <h2 style={{ fontFamily: 'Syne', fontSize: 24, fontWeight: 800 }}>Progress Analytics</h2>
          <div style={{ fontSize: 14, color: 'var(--text2)', marginTop: 4 }}>Deep insights into your learning journey</div>
        </div>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 14, marginBottom: 22 }}>
          {[
            { v: `${avg}%`,      l: 'Avg Quiz Score',  d: 'Quiz average'       },
            { v: `${totalH}h`,   l: 'Study Time',      d: 'This week'          },
            { v: 'Top 15%',      l: 'Peer Rank',       d: 'vs 1,200 learners'  },
            { v: `${completed}/${total}`, l: 'Topics Done', d: `${Math.round(completed/total*100)}% complete` },
          ].map(s => (
            <div key={s.l} className="stat-card animate-fade-in">
              <div style={{ fontFamily: 'Syne', fontSize: 28, fontWeight: 800, lineHeight: 1, marginBottom: 5 }}>{s.v}</div>
              <div style={{ fontSize: 11, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '.6px' }}>{s.l}</div>
              <div style={{ fontSize: 12, marginTop: 6, color: 'var(--green)' }}>{s.d}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 18, marginBottom: 22 }}>
          {/* Quiz performance chart */}
          <div className="card">
            <div style={{ fontFamily: 'Syne', fontSize: 15, fontWeight: 700, marginBottom: 18 }}>Quiz Performance</div>
            {scoreEntries.length === 0 ? (
              <div style={{ color: 'var(--text2)', fontSize: 13 }}>No quiz data yet. Take your first quiz!</div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 140, padding: '0 2px' }}>
                {scoreEntries.map(([id, s]) => {
                  const node = KNOWLEDGE_GRAPH.find(n => n.id === id);
                  return (
                    <div key={id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                      <div style={{ fontSize: 10, color: 'var(--text2)' }}>{s}%</div>
                      <div style={{
                        width: '100%', borderRadius: '4px 4px 0 0', minHeight: 4,
                        height: Math.round(s / maxScore * 120),
                        background: `linear-gradient(180deg,${s >= 80 ? 'var(--green)' : '#ffb400'},${s >= 80 ? 'var(--green2)' : '#ff8800'})`,
                      }} />
                      <div style={{ fontSize: 9, color: 'var(--text2)', textAlign: 'center', maxWidth: 34, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                        {node?.name?.split(' ')[0] || id}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text2)' }}>Topics below 80% are auto-scheduled for revision</div>
          </div>

          {/* Topic mastery */}
          <div className="card">
            <div style={{ fontFamily: 'Syne', fontSize: 15, fontWeight: 700, marginBottom: 18 }}>Topic Mastery</div>
            {mastery.map(m => (
              <div key={m.l} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                  <span style={{ fontSize: 13 }}>{m.l}</span>
                  <span className={`tag ${m.p >= 80 ? 'tag-green' : m.p >= 60 ? 'tag-amber' : m.p > 0 ? 'tag-red' : ''}`} style={{ background: m.p === 0 ? 'rgba(255,255,255,.04)' : undefined, color: m.p === 0 ? 'var(--text3)' : undefined, border: m.p === 0 ? '1px solid var(--border)' : undefined }}>
                    {m.p > 0 ? `${m.p}%` : 'Not started'}
                  </span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{
                    width: `${m.p}%`,
                    background: m.p >= 80 ? 'linear-gradient(90deg,var(--green2),var(--green))' : m.p >= 60 ? 'linear-gradient(90deg,#ffb400,#ff8800)' : 'linear-gradient(90deg,#ff6b6b,#ff3030)',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 18 }}>
          {/* Peer benchmarking */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 18 }}>
              <span style={{ fontFamily: 'Syne', fontSize: 15, fontWeight: 700 }}>Peer Benchmarking</span>
              <span className="tag tag-purple">Top 15%</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 18 }}>
              <div style={{ textAlign: 'center', flexShrink: 0 }}>
                <div style={{ fontFamily: 'Syne', fontSize: 36, fontWeight: 800, color: 'var(--green)' }}>85th</div>
                <div style={{ fontSize: 11, color: 'var(--text2)' }}>Percentile</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 8 }}>Ahead of 85% of learners on this path</div>
                <div className="progress-track"><div className="progress-fill animate-glow" style={{ width: '85%' }} /></div>
              </div>
            </div>
            {[
              { l: 'Topics / Week', you: `${(completed / Math.max((user?.streak || 1) / 7, 1)).toFixed(1)}`, avg: '3.1' },
              { l: 'Quiz Average',  you: `${avg}%`, avg: '67%' },
              { l: 'Streak',        you: `${user?.streak || 0}d`, avg: '3d' },
            ].map(r => (
              <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                <span style={{ color: 'var(--text2)' }}>{r.l}</span>
                <div style={{ display: 'flex', gap: 18 }}>
                  <span style={{ color: 'var(--green)' }}>You: {r.you}</span>
                  <span style={{ color: 'var(--text2)' }}>Avg: {r.avg}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Skill gap */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 18 }}>
              <span style={{ fontFamily: 'Syne', fontSize: 15, fontWeight: 700 }}>Skill Gap Analysis</span>
              <span className="tag tag-red">{user?.goal || 'AI/ML'} Role</span>
            </div>
            {TARGET_SKILLS.map(skill => {
              const node  = KNOWLEDGE_GRAPH.find(n => n.name === skill);
              const owned = node ? (user?.completedTopics || []).includes(node.id) : false;
              return (
                <div key={skill} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                  <span>{skill}</span>
                  <span className={`tag ${owned ? 'tag-green' : 'tag-red'}`}>{owned ? 'Learned ✓' : 'Gap'}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
}
