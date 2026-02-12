import React, { useEffect, useRef, useState } from 'react';
import { adminApi } from '../../lib/adminApi';

export default function AdminLoginForm() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const googleButtonRef = useRef(null);

  useEffect(() => {
    const clientId = import.meta.env.PUBLIC_GOOGLE_CLIENT_ID;

    if (!clientId || !googleButtonRef.current || !window.google?.accounts?.id) {
      return;
    }

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response) => {
        if (!response.credential) {
          setError('No se recibió credencial de Google.');
          return;
        }

        setError('');
        setLoading(true);

        try {
          await adminApi.googleLogin(response.credential);
          window.location.href = '/admin';
        } catch (apiError) {
          setError(apiError.message);
          setLoading(false);
        }
      }
    });

    googleButtonRef.current.innerHTML = '';
    window.google.accounts.id.renderButton(googleButtonRef.current, {
      theme: 'filled_black',
      size: 'large',
      text: 'signin_with',
      shape: 'pill',
      width: 320
    });
  }, []);

  return (
    <section className="max-w-lg mx-auto bg-surface border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl">
      <script src="https://accounts.google.com/gsi/client" async defer></script>

      <h1 className="text-3xl font-black text-text-main">Login administrador</h1>
      <p className="text-text-muted mt-2">Acceso exclusivo con cuenta de Google autorizada.</p>

      <div className="mt-8 space-y-4">
        {import.meta.env.PUBLIC_GOOGLE_CLIENT_ID ? (
          <div ref={googleButtonRef}></div>
        ) : (
          <p className="text-amber-300 text-sm">
            Configura <code>PUBLIC_GOOGLE_CLIENT_ID</code> para habilitar autenticación con Google.
          </p>
        )}

        <p className="text-xs text-text-muted">Solo administradores permitidos podrán iniciar sesión.</p>

        {loading && <p className="text-sm text-secondary">Validando cuenta de Google...</p>}
        {error && <p className="text-red-300 text-sm">{error}</p>}
      </div>
    </section>
  );
}
