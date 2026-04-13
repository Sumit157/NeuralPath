import { useState, useEffect } from 'react';
import { quizAPI } from '../utils/api';
import { usePath } from '../context/PathContext';

export default function QuizModal({ topicId, topicName, onClose }) {
  const { submitQuiz, showToast } = usePath();
  const [questions, setQuestions] = useState([]);
  const [idx,       setIdx]       = useState(0);
  const [answers,   setAnswers]   = useState([]);
  const [selected,  setSelected]  = useState(null);
  const [result,    setResult]    = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [submitting,setSubmitting]= useState(false);

  useEffect(() => {
    quizAPI.getQuestions(topicId)
      .then(({ data }) => setQuestions(data.questions || []))
      .catch(() => showToast('Failed to load quiz', 'error'))
      .finally(() => setLoading(false));
  }, [topicId]);

  const pickAnswer = async (optIdx) => {
    if (selected !== null) return;
    setSelected(optIdx);
    const newAnswers = [...answers, optIdx];

    setTimeout(async () => {
      if (newAnswers.length >= questions.length) {
        setSubmitting(true);
        try {
          const data = await submitQuiz(topicId, newAnswers);
          setResult(data);
        } catch (err) {
          showToast(err.response?.data?.message || 'Submission failed', 'error');
        } finally {
          setSubmitting(false);
        }
      } else {
        setAnswers(newAnswers);
        setIdx(idx + 1);
        setSelected(null);
      }
    }, 900);
  };

  const q = questions[idx];

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div className="spinner" style={{ margin: '0 auto 16px' }} />
            <div style={{ color: 'var(--text2)', fontSize: 14 }}>Loading questions…</div>
          </div>
        )}

        {/* Result Screen */}
        {result && (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ fontSize: 60, marginBottom: 16 }}>
              {result.score >= 80 ? '🏆' : result.score >= 60 ? '📈' : '📚'}
            </div>
            <h3 style={{ fontFamily: 'Syne', fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Quiz Complete!</h3>
            <div style={{
              fontFamily: 'Syne', fontSize: 52, fontWeight: 800, margin: '16px 0',
              color: result.score >= 80 ? 'var(--green)' : result.score >= 60 ? '#ffb400' : '#ff6b6b',
            }}>{result.score}%</div>
            <div style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 24, lineHeight: 1.7 }}>
              {result.score >= 80 ? 'Excellent! Topic mastered. Next topic unlocked.' :
               result.score >= 60 ? 'Good progress. Revision scheduled in 7 days.' :
               'Needs more practice. Topic reinserted with extra resources.'}
            </div>
            <div style={{
              padding: 16, background: 'rgba(0,255,136,.04)', border: '1px solid rgba(0,255,136,.1)',
              borderRadius: 'var(--radius2)', marginBottom: 20, textAlign: 'left', fontSize: 13, lineHeight: 1.9,
            }}>
              <div style={{ color: 'var(--green)', marginBottom: 8, fontSize: 11, textTransform: 'uppercase', letterSpacing: '.5px' }}>
                Adaptive Decision
              </div>
              {result.adaptive?.message}
            </div>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={onClose}>
              Continue Learning →
            </button>
          </div>
        )}

        {/* Submitting */}
        {submitting && !result && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div className="spinner" style={{ margin: '0 auto 16px' }} />
            <div style={{ color: 'var(--text2)', fontSize: 14 }}>Analysing results…</div>
          </div>
        )}

        {/* Question */}
        {!loading && !result && !submitting && q && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: 'var(--text2)' }}>Q{idx + 1} / {questions.length}</div>
              <div style={{ display: 'flex', gap: 5 }}>
                {questions.map((_, i) => (
                  <div key={i} style={{
                    width: 22, height: 4, borderRadius: 2,
                    background: i < idx ? 'var(--green)' : i === idx ? 'rgba(0,255,136,.6)' : 'var(--bg3)',
                  }} />
                ))}
              </div>
              <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
            </div>

            <div style={{ fontSize: 11, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 6 }}>
              {topicName}
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20, lineHeight: 1.55 }}>{q.q}</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {q.opts.map((opt, i) => {
                let cls = 'quiz-opt';
                if (selected !== null) {
                  // We don't know correct answer client-side (security) — just show selected
                  if (i === selected) cls += ' correct';
                }
                return (
                  <button key={i} className={cls} onClick={() => pickAnswer(i)}>
                    {String.fromCharCode(65 + i)}. {opt}
                  </button>
                );
              })}
            </div>
          </>
        )}

      </div>
    </div>
  );
}
