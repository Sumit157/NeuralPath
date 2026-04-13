import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../utils/api';
import ProtectedRoute from '../components/ProtectedRoute';

const STEPS = [
  {
    title: "What's your goal?",
    sub: 'Choose your target career. The knowledge graph will be tuned for it.',
    field: 'goal',
    choices: [
      { id: 'AI/ML Engineer',     desc: 'Machine learning, deep learning, NLP, computer vision' },
      { id: 'Data Analyst',       desc: 'SQL, statistics, BI tools, visualisation' },
      { id: 'Software Developer', desc: 'Backend, frontend, system design, DevOps' },
      { id: 'Data Scientist',     desc: 'Statistics, ML, experimentation, storytelling' },
    ],
    cols: 1,
  },
  {
    title: 'Current skill level?',
    sub: 'Honest calibration helps the algorithm skip or reinforce topics.',
    field: 'level',
    choices: [
      { id: 'beginner',     label: 'Beginner',     desc: 'Just starting out' },
      { id: 'intermediate', label: 'Intermediate', desc: 'Some experience'   },
      { id: 'advanced',     label: 'Advanced',     desc: 'Deep expertise'    },
    ],
    cols: 3,
  },
  {
    title: 'Daily study time?',
    sub: 'The scheduler fits your roadmap into realistic daily sessions.',
    field: 'dailyHours',
    slider: true,
    choices: [
      { id: 'fast',     label: 'Fast Track',    desc: 'Speed over depth'  },
      { id: 'balanced', label: 'Balanced',      desc: 'Best of both'      },
      { id: 'deep',     label: 'Deep Learning', desc: 'Master everything' },
    ],
    cols: 3,
    modeField: 'mode',
  },
];

export default function Onboard() {
  return (
    <ProtectedRoute>
      <OnboardInner />
    </ProtectedRoute>
  );
}

function OnboardInner() {
  const router        = useRouter();
  const { user, updateUser } = useAuth();
  const [step,   setStep]   = useState(0);
  const [data,   setData]   = useState({ goal: '', level: 'beginner', dailyHours: 2, mode: 'balanced' });
  const [saving, setSaving] = useState(false);

  const s = STEPS[step];

  const select = (field, val) => setData(d => ({ ...d, [field]: val }));

  const finish = async () => {
    setSaving(true);
    try {
      await userAPI.updateProfile({ ...data, onboarded: true });
      updateUser({ ...data, onboarded: true });
      router.push('/dashboard');
    } catch {
      setSaving(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 600, width: '100%', textAlign: 'center' }}>

        {/* Logo */}
        <div style={{ fontFamily: 'Syne', fontSize: 20, fontWeight: 800, color: 'var(--green)', marginBottom: 32, letterSpacing: '-0.5px' }}>
          Neural<span style={{ color: 'var(--text2)' }}>Path</span>
        </div>

        {/* Step dots */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 36 }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{
              height: 8, borderRadius: 4,
              width: i < step ? 22 : 8,
              background: i < step ? 'var(--green2)' : i === step ? 'var(--green)' : 'var(--bg3)',
              transition: 'all .3s',
            }} />
          ))}
        </div>

        <div className="animate-fade-in" key={step}>
          <h2 style={{ fontFamily: 'Syne', fontSize: 28, fontWeight: 800, marginBottom: 10, lineHeight: 1.2 }}>{s.title}</h2>
          <p style={{ color: 'var(--text2)', fontSize: 15, marginBottom: 28, lineHeight: 1.7 }}>{s.sub}</p>

          {/* Slider step */}
          {s.slider && (
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 20 }}>
                <input type="range" min="0.5" max="8" step="0.5" value={data.dailyHours} style={{ flex: 1 }}
                  onChange={e => select('dailyHours', parseFloat(e.target.value))} />
                <div style={{ fontFamily: 'Syne', fontSize: 40, fontWeight: 800, color: 'var(--green)', minWidth: 70 }}>
                  {data.dailyHours}h
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text2)', marginBottom: 20 }}>
                <span>30 min</span><span>8 hours</span>
              </div>
            </div>
          )}

          {/* Choices */}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${s.cols}, 1fr)`, gap: 12, textAlign: 'left', marginBottom: 28 }}>
            {s.choices.map(c => {
              const field   = s.modeField || s.field;
              const val     = s.modeField ? data.mode : data[s.field];
              const isSelected = val === c.id;
              return (
                <button key={c.id}
                  onClick={() => select(field, c.id)}
                  style={{
                    padding: '16px 20px', borderRadius: 'var(--radius)',
                    border: `1px solid ${isSelected ? 'var(--green)' : 'var(--border)'}`,
                    background: isSelected ? 'rgba(0,255,136,.07)' : 'var(--bg1)',
                    cursor: 'pointer', textAlign: 'left', fontFamily: 'DM Sans', transition: 'all .2s',
                  }}>
                  <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 3, color: 'var(--text)' }}>{c.label || c.id}</div>
                  <div style={{ fontSize: 13, color: 'var(--text2)' }}>{c.desc}</div>
                </button>
              );
            })}
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            {step > 0 && (
              <button className="btn btn-ghost" onClick={() => setStep(s => s - 1)}>← Back</button>
            )}
            {step < STEPS.length - 1 ? (
              <button className="btn btn-secondary" style={{ minWidth: 130 }} onClick={() => setStep(s => s + 1)}>
                Next →
              </button>
            ) : (
              <button className="btn btn-primary" style={{ minWidth: 200 }} onClick={finish} disabled={saving}>
                {saving ? 'Saving…' : 'Launch My Path →'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
