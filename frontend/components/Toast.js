export default function Toast({ msg, type = 'success' }) {
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24,
      background: 'var(--bg1)',
      border: `1px solid ${type === 'success' ? 'rgba(0,255,136,.3)' : 'rgba(255,107,107,.3)'}`,
      borderRadius: 'var(--radius2)', padding: '13px 18px', zIndex: 600,
      fontSize: 14, boxShadow: '0 4px 24px rgba(0,255,136,.1)',
      maxWidth: 300, animation: 'fadeIn .3s ease',
    }}>
      <span style={{ color: type === 'success' ? 'var(--green)' : '#ff7070', marginRight: 8 }}>●</span>
      {msg}
    </div>
  );
}
