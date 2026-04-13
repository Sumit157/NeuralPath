import Navbar from './Navbar';
import Toast from './Toast';
import { usePath } from '../context/PathContext';

export default function Layout({ children }) {
  const { toast } = usePath();
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Navbar />
      <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {children}
      </main>
      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  );
}
