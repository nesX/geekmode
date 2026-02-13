import { useEffect, useRef, useState } from 'react';
import { useStore } from '@nanostores/react';
import {
  authUser,
  isAuthLoading,
  authError,
  authenticateWithGoogle,
} from '../../lib/authStore';

const GOOGLE_CLIENT_ID = import.meta.env.PUBLIC_GOOGLE_CLIENT_ID;

export default function GoogleLoginButton() {
  const user = useStore(authUser);
  const loading = useStore(isAuthLoading);
  const error = useStore(authError);
  const buttonRef = useRef(null);
  const initialized = useRef(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleCredentialResponse = async (response) => {
    setIsAuthenticating(true);
    try {
      // Send credential to server for validation
      const success = await authenticateWithGoogle(response.credential);
      if (!success) {
        // Re-initialize the button if auth failed
        initialized.current = false;
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  useEffect(() => {
    if (user || initialized.current) return;

    const initializeGoogleSignIn = () => {
      if (!window.google || initialized.current) return;
      initialized.current = true;

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      if (buttonRef.current) {
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: 'filled_white',
          size: 'large',
          type: 'standard',
          shape: 'rectangular',
          text: 'signin_with',
          logo_alignment: 'left',
          width: 280,
        });
      }
    };

    const scriptExists = document.querySelector('script[src*="accounts.google.com/gsi/client"]');

    if (!scriptExists) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => initializeGoogleSignIn();
      script.onerror = () => console.error('Failed to load Google Identity Services');
      document.head.appendChild(script);
    } else if (window.google) {
      initializeGoogleSignIn();
    } else {
      const interval = setInterval(() => {
        if (window.google) {
          clearInterval(interval);
          initializeGoogleSignIn();
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Re-initialize button after error is cleared
  useEffect(() => {
    if (!error && !user && !initialized.current && window.google) {
      initialized.current = true;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      if (buttonRef.current) {
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: 'filled_white',
          size: 'large',
          type: 'standard',
          shape: 'rectangular',
          text: 'signin_with',
          logo_alignment: 'left',
          width: 280,
        });
      }
    }
  }, [error, user]);

  if (user) return null;

  const showLoading = loading || isAuthenticating;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-text-main mb-2">Acceso Administrador</h2>
        <p className="text-text-muted">Inicia sesion con tu cuenta de Google</p>
      </div>

      {error && (
        <div className="w-full max-w-xs p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-center">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <div className="relative min-h-[44px] flex items-center justify-center">
        {showLoading && (
          <div className="flex items-center gap-3 text-text-muted">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span>{isAuthenticating ? 'Verificando...' : 'Cargando...'}</span>
          </div>
        )}
        <div
          ref={buttonRef}
          className={showLoading ? 'invisible absolute' : ''}
        />
      </div>

      <p className="text-xs text-text-muted/60 max-w-xs text-center">
        Solo usuarios autorizados pueden acceder al panel de administracion
      </p>
    </div>
  );
}
