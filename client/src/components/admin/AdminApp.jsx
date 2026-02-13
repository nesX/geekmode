import { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { authUser, isAuthLoading } from '../../lib/authStore';
import GoogleLoginButton from './GoogleLoginButton.jsx';
import AdminDashboard from './AdminDashboard.jsx';

export default function AdminApp() {
  const user = useStore(authUser);
  const loading = useStore(isAuthLoading);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show nothing until client-side hydration is complete
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If authenticated, show dashboard
  if (user) {
    return <AdminDashboard />;
  }

  // Show login screen
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <div className="bg-surface rounded-2xl border border-white/10 p-8 shadow-[0_0_40px_rgba(139,92,246,0.15)]">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-2">
              <span className="bg-primary text-white p-2 rounded-lg shadow-[0_0_15px_rgba(139,92,246,0.5)] text-xl font-bold">
                GS
              </span>
              <span className="text-2xl font-bold text-text-main">
                Admin<span className="text-primary">Panel</span>
              </span>
            </div>
          </div>

          {/* Login Form */}
          <GoogleLoginButton />

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-xs text-text-muted/50">
              GeekShop Admin v1.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
