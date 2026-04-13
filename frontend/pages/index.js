import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

const FLOATING_LABELS = ['Python','TensorFlow','Linear Algebra','PyTorch','SQL','NumPy','Statistics','Docker','Keras','Pandas','BERT','Scikit-learn'];

export default function Home() {
  const router       = useRouter();
  const { user }     = useAuth();
  const containerRef = useRef(null);

  useEffect(() => {
    const c = containerRef.current;
    if (!c) return;
    FLOATING_LABELS.forEach((label, i) => {
      const el = document.createElement('div');
      el.className = 'fn';
      el.textContent = label;
      el.style.left = (8 + Math.random() * 84) + '%';
      el.style.animationDuration  = (9 + Math.random() * 14) + 's';
      el.style.animationDelay     = (i * 1.8) + 's';
      c.appendChild(el);
    });
  }, []);

  return (
    <Layout>
      <div style={{ minHeight: 'calc(100vh - 62px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '60px 24px', position: 'relative', overflow: 'hidden' }}>

        {/* Glow bg */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 65% 45% at 50% 35%,rgba(0,255,136,.07) 0%,transparent 60%)', pointerEvents: 'none' }} />

        {/* Floating nodes */}
        <div ref={containerRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }} />

        {/* Badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 18px', borderRadius: 20, background: 'rgba(0,255,136,.07)', border: '1px solid rgba(0,255,136,.15)', fontSize: 12, color: 'var(--green)', marginBottom: 26, position: 'relative', zIndex: 1 }}>
          ✦ Powered by Dynamic Programming + Greedy Algorithms
        </div>

        {/* Headline */}
        <h1 style={{ fontFamily: 'Syne', fontSize: 'clamp(38px,6vw,68px)', fontWeight: 800, lineHeight: 1.08, marginBottom: 22, letterSpacing: '-1.5px', position: 'relative', zIndex: 1 }}>
          Your <span style={{ color: 'var(--green)' }}>Optimal</span><br />
          Learning Path,<br />
          Generated.
        </h1>

        <p style={{ fontSize: 'clamp(15px,2vw,18px)', color: 'var(--text2)', maxWidth: 500, lineHeight: 1.75, marginBottom: 40, position: 'relative', zIndex: 1 }}>
          An adaptive AI engine that builds your personalised roadmap using a live knowledge graph, quiz-driven adaptation, and spaced repetition — so you always learn the right thing next.
        </p>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
          {user ? (
            <button className="btn btn-primary" style={{ padding: '14px 36px', fontSize: 16 }} onClick={() => router.push('/dashboard')}>
              Go to Dashboard →
            </button>
          ) : (
            <>
              <button className="btn btn-primary" style={{ padding: '14px 36px', fontSize: 16 }} onClick={() => router.push('/signup')}>
                Start Learning →
              </button>
              <button className="btn btn-secondary" style={{ padding: '14px 26px', fontSize: 16 }} onClick={() => router.push('/login')}>
                Sign In
              </button>
            </>
          )}
        </div>

        {/* Stats row */}
        <div style={{ marginTop: 64, display: 'flex', gap: 48, flexWrap: 'wrap', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
          {[
            { v: 'DP+GA',  l: 'Algorithm Engine' },
            { v: '14+',   l: 'Topics Mapped'     },
            { v: '3',     l: 'Learning Modes'    },
            { v: '∞',     l: 'Adaptive'          },
          ].map(s => (
            <div key={s.l} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Syne', fontSize: 30, fontWeight: 800, color: s.v === 'DP+GA' ? 'var(--green)' : 'var(--text)' }}>{s.v}</div>
              <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
