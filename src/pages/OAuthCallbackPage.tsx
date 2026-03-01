import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function OAuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const { handleOAuthToken } = useAuth();
  const navigate = useNavigate();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const token = searchParams.get('token');
    const oauthError = searchParams.get('oauth_error');

    if (oauthError) {
      navigate(`/login?error=${encodeURIComponent(oauthError)}`, { replace: true });
      return;
    }

    if (!token) {
      navigate('/login?error=missing_token', { replace: true });
      return;
    }

    handleOAuthToken(token).then(() => {
      navigate('/dashboard', { replace: true });
    }).catch(() => {
      navigate('/login?error=auth_failed', { replace: true });
    });
  }, []);

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: '#0a0a0a' }}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-white/10 border-t-white/60 rounded-full animate-spin" />
        <p className="text-white/30 text-xs uppercase tracking-[4px]">Authenticating...</p>
      </div>
    </div>
  );
}
