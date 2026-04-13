import { useState } from 'react';
import QuizModal from './QuizModal';
import { usePath } from '../context/PathContext';
import { useAuth } from '../context/AuthContext';

export default function TopicDetail({ topic }) {
  const { completeTopic, showToast } = usePath();
  const { user } = useAuth();
  const [quizOpen, setQuizOpen] = useState(false);

  if (!topic) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 220, color: 'var(--text2)', fontSize: 14, flexDirection: 'column', gap: 12 }}>
        <div style={{ fontSize: 40, opacity: .2 }}>◈</div>
        <span>Click a topic to view details</span>
      </div>
    );
  }

  const completed  = user?.completedTopics?.includes(topic.id);
  const score      = user?.scores?.[topic.id];
  const prereqsMet = topic.prereqs?.every(p => user?.completedTopics?.includes(p));

  const typeColors = { video: 'rgba(255,80,80,.1)', article: 'rgba(80,160,255,.1)', quiz: 'rgba(255,180,0,.1)' };
  const typeIcons  = { video: '▶', article: '📖', quiz: '❓' };
  const typeTags   = { video: 'tag-red', article: 'tag-blue', quiz: 'tag-amber' };

  return (
    <div className="card card-hover animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16, gap: 10 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
            {topic.tags?.map(t => <span key={t} className="tag tag-blue">{t}</span>)}
            {completed && <span className="tag tag-green">Completed ✓</span>}
          </div>
          <h3 style={{ fontFamily: 'Syne', fontSize: 19, fontWeight: 800 }}>{topic.name}</h3>
          <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 6, lineHeight: 1.65 }}>{topic.desc}</p>
        </div>
        <div style={{
          textAlign: 'center', padding: '12px 16px', flexShrink: 0,
          background: 'rgba(0,255,136,.07)', border: '1px solid rgba(0,255,136,.15)',
          borderRadius: 'var(--radius2)',
        }}>
          <div style={{ fontFamily: 'Syne', fontSize: 24, fontWeight: 800, color: 'var(--green)' }}>{topic.imp}</div>
          <div style={{ fontSize: 10, color: 'var(--text2)' }}>Importance</div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 16 }}>
        {[
          { v: `${topic.time}h`, l: 'Study Time' },
          { v: `${topic.diff}/5`, l: 'Difficulty' },
          { v: topic.prereqs?.length || 0, l: 'Prereqs' },
        ].map(s => (
          <div key={s.l} style={{ padding: 10, background: 'var(--bg2)', borderRadius: 8, textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{s.v}</div>
            <div style={{ fontSize: 11, color: 'var(--text2)' }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Quiz score bar */}
      {score !== undefined && (
        <div style={{ marginBottom: 16, padding: 12, background: 'rgba(0,255,136,.04)', border: '1px solid rgba(0,255,136,.1)', borderRadius: 'var(--radius2)' }}>
          <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.5px' }}>Quiz Performance</div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${score}%`, background: score >= 80 ? 'linear-gradient(90deg,var(--green2),var(--green))' : 'linear-gradient(90deg,#ffb400,#ff8800)' }} />
          </div>
          <div style={{ fontSize: 12, color: score >= 80 ? 'var(--green)' : '#ffb400', marginTop: 4 }}>
            {score}% · {score >= 80 ? 'Mastered ✓' : 'Needs revision'}
          </div>
        </div>
      )}

      {/* Resources */}
      {topic.resources?.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 10 }}>
            Top Resources (Greedy Ranked)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {topic.resources.map((r, i) => (
              <div key={i} className="resource-card" onClick={() => showToast(`Opening: ${r.title}`)}>
                <div style={{ width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0, background: typeColors[r.type] }}>
                  {typeIcons[r.type]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>{r.dur} · ⭐ {r.rating}</div>
                </div>
                <span className={`tag ${typeTags[r.type]}`}>{r.type}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      {!prereqsMet ? (
        <div style={{ padding: 12, background: 'rgba(255,180,0,.06)', border: '1px solid rgba(255,180,0,.15)', borderRadius: 'var(--radius2)', fontSize: 12, color: '#ffb400' }}>
          ⚠ Complete prerequisites first: {topic.prereqs?.join(', ')}
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setQuizOpen(true)}>
            {completed ? 'Retake Quiz' : 'Take Quiz →'}
          </button>
          {!completed && (
            <button className="btn btn-secondary" onClick={() => completeTopic(topic.id)}>
              Mark Done
            </button>
          )}
        </div>
      )}

      {quizOpen && (
        <QuizModal
          topicId={topic.id}
          topicName={topic.name}
          onClose={() => setQuizOpen(false)}
        />
      )}
    </div>
  );
}
