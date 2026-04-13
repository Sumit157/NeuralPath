import { useRouter } from 'next/router';
export default function NotFound() {
  const router = useRouter();
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, textAlign: 'center', padding: 24 }}>
      <div style={{ fontFamily: 'Syne', fontSize: 80, fontWeight: 800, color: 'var(--green)', lineHeight: 1 }}>404</div>
      <div style={{ fontSize: 18, color: 'var(--text2)' }}>This path doesn't exist in the knowledge graph.</div>
      <button className="btn btn-primary" style={{ marginTop: 8 }} onClick={() => router.push('/')}>← Go Home</button>
    </div>
  );
}
