import '../styles/globals.css';
import { AuthProvider } from '../context/AuthContext';
import { PathProvider } from '../context/PathContext';

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <PathProvider>
        <Component {...pageProps} />
      </PathProvider>
    </AuthProvider>
  );
}
